const puzzleLinkConverter = (() => {
	"use strict";	
	let _rnd = 0;

	const DEBUG = 0 || document.location.host.startsWith('127.0.0.1');

	const rePenpaUrl = /\/penpa-edit\//;
	const rePuzzlinkUrl = /\/puzz\.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/;
	const reFpuzzlesUrl = /[\.\/]+f-puzzles.com\//;
	

	class UserSettings {
		loadFromCookies() {}
	};

	class FakeDoc {
		constructor() { }
		getElementById(id) {
			let elem = this[id];
			if (!elem) {
				elem = {
					id: id,
					value: '',
					style: {},
					classList: {
						classes: {},
						add: c => { elem.classList.classes[c] = 1; },
						remove: c => { delete elem.classList.classes[c]; },
						contains: c => elem.classList.classes[c],
					},
					getElementsByClassName: c => [],
					addEventListener: e => {},
				}
				this[id] = elem;
			}
			return elem;
		}
		querySelectorAll(selector) {
			return [];
		}
		querySelector(selector) {
			return undefined;
		}
	}

	const getRegionShape = (size = 9) => {
		if (size > 10) return [3, 3];
		let height = Math.sqrt(size);
		if(Number.isInteger(height)) return [height, height];
		height = Math.floor(height);
		while(!Number.isInteger(size / height) && height > 1) height--;
		return height > 0 ? [height, size / height] : [1, 1];
	};

	const puzzleHas = (puzzle, feature, part) => {
		const partStr = JSON.stringify(part);
		return (puzzle[feature] || []).map(item => JSON.stringify(item)).includes(partStr);
	};
	const puzzleAdd = (puzzle, feature, part, type = undefined, unique = false) => {
		if(puzzle[feature] === undefined) puzzle[feature] = [];
		if(unique === true && puzzleHas(puzzle, feature, part)) return;
		if(typeof part === 'object' && !Array.isArray(part)) {
			part = Object.keys(part).reduce((acc, cur) => Object.assign(acc, part[cur] === undefined ? {} : {[cur]: part[cur]}), {});
		}
		if (DEBUG && type) part.penpa = type;
		puzzle[feature].push(part);
	};

	function createBlankPuzzle(pu, puzzle, width, height) {
		puzzle = Object.assign(puzzle, {cellSize: 64, cells: [], regions: []});
		for (let r = 0; r < height; r++) {
			let row = [];
			puzzle.cells.push(row);
			for (let c = 0; c < width; c++) {
				let cell = {};
				row.push(cell);
			}
		}
	}

	function addGivens(pu, puzzle) {
		// Place 'Givens'
		if(!pu.pu_q) debugger
		const {number} = pu.pu_q;
		const {point2cell} = PenpaTools;
		for (let pos in number) {
			if (pu.centerlist.includes(Number(pos))) {
				const num = number[pos];
				if (num && !isNaN(num[0]) && num[1] == 1 && (num[2] === '1')) { //Black Normal or Big number
					let [r, c] = point2cell(pos);
					let cell = puzzle.cells[r][c];
					cell.given = true;
					cell.value = num[0];
					num.role = 'given';
				}
			}
		}
	}

	function createSudokuRegions(pu, puzzle) {
		const {point2cell} = PenpaTools;
		let rows = puzzle.cells.length;
		let cols = puzzle.cells[0].length;
		let regRC = getRegionShape(Math.min(rows, cols));
		const rowRegions = Math.ceil(cols / regRC[1]);
		let regions = {};
		const convRegion = (r, c, region) => {
			if(region === undefined) return Math.floor(r / regRC[0]) * rowRegions + Math.floor(c / regRC[1]);
			return Number(region);
		};
		pu.centerlist.forEach(pos => {
			let [r, c] = point2cell(pos);
			let cell = puzzle.cells[r][c];
			let region = convRegion(r, c, cell.region);
			if(regions[region] === undefined) regions[region] = [];
			regions[region].push([r, c]);
		});
		if(regions['null'] !== undefined) { // Handle "null" region
			puzzleAdd(puzzle, 'cages', {cells: regions['null'], unique: false, hidden: true}, 'region');
			delete regions['null'];
		}
		let regionKeys = Object.keys(regions);
		if (regionKeys.length > 0) {
			// Check all regions have same size, otherwise delete all
			let length = regions[regionKeys[0]].length;
			if(regionKeys.every(key => regions[key].length === length)) {
				Object.keys(regions)
				.forEach(region => puzzleAdd(puzzle, 'regions', regions[region], 'region'));
			}
		}
	}

	function addSolution(pu, puzzle, doc) {
		// Add puzzle solution
		if (pu.solution && !pu.multisolution) {
			const {point2cell} = PenpaTools;
			let stext = JSON.parse(pu.solution);
			const {width, height} = doc;
			let sol = Array(height * width).fill('?');
			stext[4].forEach(s => {
				let [point, val] = s.split(',');
				let [r, c] = point2cell(point);
				let pos = r * width + c;
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = val;
				}
				else
					val=val;
			});
			let solString = sol.join('');
			puzzleAdd(puzzle, 'cages', {value: `solution: ${solString}`}, 'solution');
		}
	}

	function createCellMask(pu, puzzle, doc) {
		const {point2cell} = PenpaTools;
		const {centerlist} = pu;

		// Create 'outside cell mask' only when cells are removed
		if (centerlist.length !== doc.width * doc.height) {
			let gridCells = centerlist.map(point2cell).map(c => ({row: c[0], col: c[1]}));
			let outlinePoints = PenpaTools.getCellOutline(gridCells);	
			let edgePoints = PenpaTools.normalizePath(outlinePoints).map(l => (l.length === 3) ? [l[0], l[2], l[1]] : l);

			const margin = 0.06;
			let left = 0 - margin;
			let top = 0 - margin;
			let right = doc.width + margin;
			let bottom = doc.height + margin;
			let ctx = new DrawingContext();
			ctx.path = edgePoints;
			ctx.moveTo(left, top);
			ctx.lineTo(left, bottom);
			ctx.lineTo(right, bottom);
			ctx.lineTo(right, top);
			ctx.closePath();
			let opts = Object.assign(ctx.toOpts(), {
				fill:  '#FFFFFF',
				// fill: Color[Object.keys(Color)[Math.floor(_rnd = ((_rnd|0) + 1) % 24)]],
				'fill-rule': 'evenodd',
				target: 'overlay'
			});
			puzzleAdd(puzzle, 'lines', opts, 'outside mask');
		}
	}
	function drawBoardOutline(pu, puzzle, doc) {
		const {point2cell} = PenpaTools;
		const {centerlist} = pu;

		// gr = grid line style
		// ot = outline style
		let gridStyle = 1; // Solid line
        let outlineStyle = 2; // Thick line
        if (pu.mode.grid[0] === "2") {
            gridStyle = 11; // Dotted line
        } else if (pu.mode.grid[0] === "3") {
            gridStyle = 0; // No line
        }
        if (pu.mode.grid[2] === "2") { // No Frame
            outlineStyle = gridStyle; // The line frame is the same line as the inside
        }
		
		// Add frame outine
		let gridCells = centerlist.map(point2cell).map(c => ({row: c[0], col: c[1]}));
		let outlinePoints = PenpaTools.getCellOutline(gridCells);

		let lineScaleFactor = 1;
		if (outlineStyle === 2) { // Thick line
			let count = Object.keys(pu.pu_q.lineE).reduce((p, k) => pu.pu_q.lineE[k] == 2 ? p + 1 : p, 0);
			if(count < Math.max(doc.ny, doc.nx)) {
				lineScaleFactor = 0.9;
			}
		}

		let wayPoints = [];
		outlinePoints.forEach(([t, r, c]) => {
			if (t === 'Z') {
				wayPoints.push(wayPoints[0]);
				let ctx = new DrawingContext();
				set_line_style(ctx, outlineStyle); // thick line
				let opts = Object.assign(ctx.toOpts('line'), {
					// color: '#FF0000',
					wayPoints: PenpaTools.reduceWayPoints(wayPoints),
					target: 'overlay'
				});
				opts.thickness *= lineScaleFactor;
				puzzleAdd(puzzle, 'lines', opts, 'outside frame');
				wayPoints.length = 0;
			}
			else {
				wayPoints.push([r, c]);
			}
		});
	}

	function positionBoard(pu, puzzle, doc) {
		// Add transparant rectangle to position the puzzle
		const ctx = new DrawingContext();
		// const opts = Object.assign(ctx.toOpts(), {
		// 	backgroundColor: Color.TRANSPARENTWHITE,
		// 	//   backgroundColor: '#cc4440',
		// 	center: [doc.ny / 2 - doc.row0, doc.nx / 2 - doc.col0],
		// 	width: doc.nx,
		// 	height: doc.ny,
		// });
		const opts = Object.assign(ctx.toOpts(), {
			backgroundColor: Color.TRANSPARENTWHITE,
			// backgroundColor: '#cc4440',
			center: PenpaTools.point2RC(doc.center_n),
			width: doc.width_c - 1,
			height: doc.height_c - 1,
		});
		puzzleAdd(puzzle, 'underlays', opts, 'board position');
	}

	const applyDefaultMeta = (pu, puzzle, metaName, value, defaultValFunc) => {
		let metaValue = value || defaultValFunc(pu, puzzle);
		if(metaValue !== undefined) {
			puzzle.cages = puzzle.cages || [];
			if(puzzle.cages.find(cage => (cage.value || '').indexOf(`${metaName}: `) === 0) === undefined) {
				puzzle.cages.push({value: `${metaName}: ${metaValue}`});
			}
		}
	};
	const getDefaultTitle = (pu, puzzle) => 'Untitled';
	const getDefaultAuthor = (pu, puzzle) => 'Unknown';
	const getDefaultRules = (pu, puzzle) => 'No rules provided for this puzzle. Please check the related video or website for rules.';

	const parse = {};

	parse.surface = (qa, pu, puzzle) => {
		const list = pu[qa].surface || [];
		const listCol = pu[qa + '_col'].surface || [];
		const {point2RC, isBoardCell} = PenpaTools;
		const keys = Object.keys(list); //keys.sort();
		let centers = keys.map(k => ({center: point2RC(k), value: list[k], key: Number(k)}));
		const predicate = (s1, s2) => { return true 
			&& s1.value === s2.value
			&& pu.centerlist.includes(s1.key) === pu.centerlist.includes(s2.key)
			&& isBoardCell(s1.center) === isBoardCell(s2.center)
		}
		PenpaTools.reduceSurfaces(centers, predicate).forEach(surface => {
			let ctx = new DrawingContext();
			set_surface_style(ctx, surface.value);
			if(listCol[surface.key]) {
				ctx.fillStyle = listCol[surface.key];
				ctx.strokeStyle = listCol[surface.key];
			}
			if (!pu.centerlist.includes(surface.key)) {
				ctx.target = 'overlay';
			}
			if (ctx.fillStyle === Color.GREY_DARK_VERY) {
			 	ctx.fillStyle = '#010101'; // Make darker, which will be lightened by SP with alpha 0.5
			 	ctx.target = 'overlay';
			}
			puzzleAdd(puzzle, 'underlays', Object.assign(ctx.toOpts(), {
				center: surface.center,
				width: surface.width || 1,
				height: surface.height || 1,
				//backgroundColor: Color[Object.keys(Color)[Math.floor(_rnd = ((_rnd|0) + 1) % 24)]],
			}), 'surface');
		});
	}
	parse.number = (qa, pu, puzzle, feature = 'number') => {
		const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		Object.keys(list).forEach(key => {
            if (key.slice(-1) === 'E') {
                key = key.slice(0, -1);
            }
			const number = list[key];
			if (number.role !== undefined) return;
			let ctx = new DrawingContext();
			draw.draw_number(ctx, number, key);
		});
	}
	parse.numberS = (qa, pu, puzzle, feature = 'numberS') => {
		const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		const {point2cell, point2cellPoint} = PenpaTools;
		Object.keys(list).forEach(key => {
			const number = list[key];
			if (number.role !== undefined) return;
			let ctx = new DrawingContext();
			draw.draw_numberS(ctx, number, key);

			if(pu.point[key].type === 4 && (key % 4) === 0) { // top-left cell corner
				if(pu.centerlist.includes(point2cellPoint(key))) { // top-left cell corner
					let rc = point2cell(key);
					let cell = puzzle.cells[rc[0]][rc[1]];
					cell.pencilMarks = [' '];
				}
			}
		});
	}
	parse.symbol = (qa, pu, puzzle, layer = 1) => {
		const feature = 'symbol'
		const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC, isBoardCell} = PenpaTools;
		Object.keys(list).forEach(key => {
			const symbol = list[key];
			if (symbol[2] !== layer) return;
			const ctx = new DrawingContext();
            if (key.slice(-1) === 'E') {
                key = key.slice(0, -1);
            }
			let isMaskedCell = !pu.centerlist.includes(key) && isBoardCell(point2RC(key));
			if (symbol[2] === 2 || isMaskedCell) {
				ctx.target = 'overlay';
			}
			const [r, c] = point2RC(key);
			draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
		});
	}
	const draw_freeline = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			set_line_style(ctx, line.value);
			if(line.cc) {
				ctx.strokeStyle = line.cc;
			}
			if (line.value === 30) {
				drawDoubleLine(ctx, line, puzzle);
			}
			else {
				puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				}), line);
			}
		});
		drawXmarks(qa, pu, puzzle, feature);
	}
	parse.freeline = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freeline');
	}
	parse.freelineE = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freelineE');
	}
	parse.thermo = (qa, pu, puzzle, feature = 'thermo') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		parse.nobulbthermo(qa, pu, puzzle, feature);
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			let color = listCol[i] || '#CFCFCF';
			puzzleAdd(puzzle, 'underlays', {
				borderColor: color,
				backgroundColor: color,
				center: cells[0],
				rounded: true,
				width: 0.85,
				height: 0.85,
			}, 'thermo bulb');
		});
	}
	parse.arrows = (qa, pu, puzzle, feature = 'arrows') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			let points = PenpaTools.reduceWayPoints(line.map(point2RC));
			points = PenpaTools.shortenLine(points, 0.3, 0);
			let color = listCol[i] || '#a1a1a1';
			puzzleAdd(puzzle, 'arrows', Object.assign({
				color: color,
				headLength: 0.3,
				thickness: 5,
				wayPoints: PenpaTools.reduceWayPoints(points)
			}), 'arrow line');

			const bulbStrokeThickness = 5;
			puzzleAdd(puzzle, 'overlays', Object.assign({
				borderColor: color,
				backgroundColor: '#ffffff',
				center: point2RC(line[0]),
				thickness: bulbStrokeThickness,
				rounded: true,
				width: 0.75,
				height: 0.75,
			}), 'arrow bulb');
		});
	}
	parse.direction = (qa, pu, puzzle, feature = 'direction') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			let points = line.map(point2RC);
			let color = listCol[i] || '#a1a1a1';
			puzzleAdd(puzzle, 'arrows', Object.assign({
				color: color,
				headLength: 0.3,
				thickness: 5,
				wayPoints: PenpaTools.reduceWayPoints(points)
			}), 'direction');
		});
	}
	parse.squareframe = (qa, pu, puzzle, feature = 'squareframe') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			let color = listCol[i] || '#CFCFCF';
			puzzleAdd(puzzle, 'lines', {
				color: color,
				thickness: 64 * 0.8,
				'stroke-linecap': 'square',
				'stroke-linejoin': 'square',
				wayPoints: PenpaTools.reduceWayPoints(cells),
				target: 'underlay'
			}, 'squareframe');
		});
	}
	parse.polygon = (qa, pu, puzzle, feature = 'polygon') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		Object.keys(list).forEach(key => {
			let points = list[key].map(point2RC);
			let ctx = new DrawingContext();
			ctx.strokeStyle = listCol[key] || Color.BLACK;
			ctx.fillStyle = listCol[key] || Color.BLACK;
			ctx.lineWidth = 1;
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
		 		'fill-rule': 'nonzero',
				fill: ctx.fillStyle,
				target: 'underlay',
				wayPoints: PenpaTools.reduceWayPoints(points),
			}), 'polygon');
		});
	}
	const draw_line = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			set_line_style(ctx, line.value);
			if(line.cc) {
				ctx.strokeStyle = line.cc;
			}
			if (line.value === 30) {
				drawDoubleLine(ctx, line, puzzle);
			}
			else if (line.value === 40) {
				drawShortLine(ctx, line, puzzle);
			}
			else {
				puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
					target: 'overlay',
					//target: 'underlay',
				}), line);
			}
		});
		drawXmarks(qa, pu, puzzle, feature);
	}
	parse.line = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'line');
	}
	parse.lineE = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'lineE');
	}
	parse.wall = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'wall');
	}
	parse.cage = (qa, pu, puzzle, feature = 'cage') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature];
		let wpLines = PenpaTools.penpaLines2WaypointLines(list, listCol);
		let wpLinesCol = PenpaTools.penpaLines2WaypointLines(listCol);
		const cages = pu[qa].killercages || [];
		const {point2cellPoint} = PenpaTools;
		// Filter out cage lines which are on killer cages.
		wpLines = wpLines.filter(line => {
			if (line.value === 16) return true; // always keep solid cage lines
			let ndx1 = cages.findIndex(c => c.includes(point2cellPoint(line.keys[0])));
			let ndx2 = cages.findIndex(c => c.includes(point2cellPoint(line.keys[1])));
			if (ndx1 === ndx2 && ndx1 !== -1) {
				// Copy custom color to killercage
				let cc = wpLinesCol.find(col => col.keys[0] === line.keys[0] && col.keys[1] === line.keys[1]);
				if (cc) {
					pu[qa + '_col']['killercages'][ndx1] = cc.value;
				}
				return false;
			}
			return true;
		});
		// Align cage lines with SudokuPad cages lines
		const r = 0.17;
		wpLines.forEach(list => {
			list.wayPoints.forEach(wp => {
				let dy = Math.sign(wp[0] - Math.floor(wp[0]) - 0.5);
				let dx = Math.sign(wp[1] - Math.floor(wp[1]) - 0.5);
				wp[0] += dy * r;
				wp[1] += dx * r;
			});
        });
		let cageLines = PenpaTools.concatenateEndpoints(wpLines);
		cageLines.forEach(line => {
			let ctx = new DrawingContext();
			// if (i1 % 4 === 3 || i2 % 4 === 0) ... + 100
			set_line_style(ctx, line.value, line.cc);
			if (line.cc) {
				ctx.strokeStyle = line.cc;
			}
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				target: 'cages'
			}), 'cage line');
		});
	}
	parse.killercages = (qa, pu, puzzle, feature = 'killercages') => {
		const list = pu[qa].killercages || [];
		const listCol = pu[qa + '_col'][feature];
		const {point2cell, point2cellPoint} = PenpaTools;
		const {numberS} = pu[qa];
		list.forEach((cage, i) => {
			if (cage.length === 0) return;
			let cagePart = {unique: true};
			cagePart.cells = cage.map(point2cell);
			if (listCol[i]) {
				cagePart.borderColor = listCol[i];
			}

			let valueKey = null;
			for(let k in numberS) {
				if (pu.point[k].type === 4 && (k % 4) === 0) { // Top-left cell corner
					if (cage.includes(point2cellPoint(k))) {
						let num = numberS[k];
						if (!isNaN(num[0])) {
							valueKey = k;
							break;
						}
					}
				}
			}
			if (valueKey) {
				let rc = point2cell(valueKey);
				cagePart.cageValue = `r${rc[0] + 1}c${rc[1] + 1}=${numberS[valueKey][0].trim()}`;
				numberS[valueKey].role = 'killer';
			}				
				
			puzzleAdd(puzzle, 'cages', cagePart, 'killercages');
		});
	}
	parse.deletelineE = (qa, pu, puzzle) => {
		const list = pu[qa].deletelineE || [];
		Object.keys(list).forEach(l => {
			let [p1, p2] = PenpaTools.getAdjacentCellsOfELine(pu, l);
			let s1 = pu[qa].surface[p1];
			let s2 = pu[qa].surface[p2];
			if (s1 && s1 === s2) {
				let ctx = new DrawingContext();
				set_surface_style(ctx, s1);
				if (ctx.fillStyle === Color.BLACK || ctx.fillStyle === Color.BLACK_LIGHT || ctx.fillStyle === Color.GREY_DARK_VERY) {
					list[l] = 0;
				}
				else {
					list[l] = ctx.fillStyle;
				}
			}
		});
		let comblist = PenpaTools.combineStraightPenpaLines(list);
		let wpList = PenpaTools.penpaLines2WaypointLines(comblist);
		wpList.forEach(line => {
			if (line.value === 0) return;
			let shortLine = PenpaTools.shortenLine(line.wayPoints, 2/64, 2/64);
			let ctx = new DrawingContext();
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			 	wayPoints: PenpaTools.reduceWayPoints(shortLine),
				//d: 'M0 0',
				color: '#FFFFFF',
				color: line.value === 1 ? '#FFFFFF' : line.value,
				thickness: 3.0,
				target: 'cell-grids'
			}), 'deletelineE');
		});
	}
	parse.nobulbthermo = (qa, pu, puzzle, feature = 'nobulbthermo') => {
		function find_common(pu, line, endpoint) {
			if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
			if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
			return false;
		}
		const {point2RC} = PenpaTools;
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature];
		const reduce_straight = 0.32;
		const reduce_diagonal = 0.22;
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			if (cells.length >= 2) {
				let end = line[line.length - 1];
				if (find_common(pu[qa], line, end)) {
					let rcEnd = cells[cells.length - 1];
					let rc2 = cells[cells.length - 2];
					let dy = Math.sign(rcEnd[0] - rc2[0]);
					let dx = Math.sign(rcEnd[1] - rc2[1]);
					if (dx === 0 || dy === 0) {
						rcEnd[0] -= dy * reduce_straight;
						rcEnd[1] -= dx * reduce_straight;
					}
					else {
						rcEnd[0] -= dy * reduce_diagonal;
						rcEnd[1] -= dx * reduce_diagonal;
					}
				}
				let color = listCol[i] || '#CFCFCF';
				let opts = {
					color: color,
					thickness: 21,
					wayPoints: PenpaTools.reduceWayPoints(cells)
				}
				// if (outside)
				//  	opts.target = 'overlay';
				puzzleAdd(puzzle, 'lines', opts, 'thermo line');
			}
		});
	}

	function drawXmarks(qa, pu, puzzle, feature) {
		const {point2RC} = PenpaTools;
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const keys = Object.keys(list);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		Object.keys(list).forEach(key => {
			if (list[key] !== 98) return;
			let ctx = new DrawingContext();
			set_line_style(ctx, 98);
			if (listCol[key]) {
				ctx.strokeStyle = listCol[key];
			}
			const r = 0.1414;
			let [y, x] = point2RC(key);
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints([[y - r, x - r], [y + r, x + r]])
			}), 'x');
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints([[y + r, x - r], [y - r, x + r]])
			}), 'x');
		});
	}
	function drawShortLine(ctx, line, puzzle) {
		let shortLine = PenpaTools.shrinkLine(line.wayPoints, 0.2);
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			wayPoints: shortLine
		}), 'short line');
	}
	function drawDoubleLine(ctx, line, puzzle) {
		const r = 0.15;
		let p1 = line.wayPoints[0];
		let p2 = line.wayPoints[1];
		let dx = p1[1] - p2[1];
		let dy = p1[0] - p2[0];
		let d = Math.sqrt(dx * dx + dy * dy);
		let rx = r / d * dx;
		let ry = r / d * dy;
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			wayPoints: PenpaTools.reduceWayPoints([[p1[0] + rx, p1[1] - ry], [p2[0] + rx, p2[1] - ry]])
		}), 'double line 1');
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			wayPoints: PenpaTools.reduceWayPoints([[p1[0] - rx, p1[1] + ry], [p2[0] - rx, p2[1] + ry]])
		}), 'double line 2');
	}

	const puzzlinkNames = {
		"aho": "Aho-ni-Narikire", "amibo": "Amibo", "angleloop": "Angle Loop", "anglers": "Anglers", "antmill": "Ant Mill", "aqre": "Aqre", "aquarium": "Aquarium", "araf": "Araf",
		"armyants": "Army Ants", "arukone": "Arukone", "ayeheya": "ekawayeh", "balance": "Balance Loop", "cave": "Cave", "cbanana": "Choco Banana", "context": "Context",
		"crossstitch": "Crossstitch", "cts": "Cross the Streams", "barns": "Barns", "bdblock": "Border Block", "bdwalk": "Building Walk", "bonsan": "Bonsan", "bosanowa": "Bosanowa",
		"box": "Box", "skyscrapers": "Skyscrapers", "canal": "Canal View", "castle": "Castle Wall", "cbblock": "Combi Block", "chainedb": "Chained Block", "chocona": "Chocona",
		"coffeemilk":"Coffee Milk", "cojun": "Cojun", "compass": "Compass", "coral": "Coral", "country": "Country Road", "creek": "Creek", "curvedata": "Curve Data", 
		"curvedata-aux": "Edit shape", "dbchoco": "Double Choco", "detour": "Detour", "disloop": "Disorderly Loop", "dominion": "Dominion", "doppelblock": "Doppelblock", 
		"dosufuwa": "Dosun-Fuwari", "dotchi": "Dotchi-Loop", "doubleback": "Double Back", "easyasabc": "Easy as ABC", "factors": "Rooms of Factors", "familyphoto": "Family Photo", 
		"fillmat": "Fillmat", "fillomino": "Fillomino", "firefly": "Hotaru Beam", "fivecells": "FiveCells", "fourcells": "FourCells", "geradeweg": "Geradeweg", "goishi": "Goishi", 
		"gokigen": "Slant", "haisu": "Haisu", "hakoiri": "Hakoiri-masashi", "hanare": "Hanare-gumi", "hashikake": "Hashiwokakero", "hebi": "Hebi-Ichigo", "herugolf": "Herugolf", 
		"heteromino": "Heteromino", "heyablock": "Heyablock", "heyabon": "Heya-Bon", "heyawake": "Heyawake", "hinge": "Hinge", "hitori": "Hitori", "icebarn": "Icebarn", "icelom": "Icelom", 
		"icelom2": "Icelom 2", "icewalk": "Ice Walk", "ichimaga": "Ichimaga", "ichimagam": "Magnetic Ichimaga", "ichimagax": "Crossing Ichimaga", "interbd": "International Borders", 
		"juosan": "Juosan", "kaero": "Return Home", "kaidan": "Stairwell", "kakuro": "Kakuro", "kakuru": "Kakuru", "kazunori": "Kazunori Room", "kinkonkan": "Kin-Kon-Kan", 
		"koburin": "Koburin", "kouchoku": "Kouchoku", "kramma": "KaitoRamma", "kramman": "New KaitoRamma", "kropki": "Kropki", "kurochute": "Kurochute", "kurodoko": "Kurodoko", 
		"kurotto": "Kurotto", "kusabi": "Kusabi", "ladders": "Ladders", "lapaz": "La Paz", "lightshadow": "Light and Shadow", "lightup": "Akari", "lither": "Litherslink", "lits": "LITS", 
		"lohkous": "Lohkous", "lollipops": "Lollipops", "lookair": "Look-Air", "loopsp": "Loop Special", "loute": "L-route", "makaro": "Makaro", "mashu": "Masyu", "maxi": "Maxi Loop", 
		"meander": "Meandering Numbers", "mejilink": "Mejilink", "minarism": "Minarism", "mines": "Minesweeper", "midloop": "Mid-loop", "mirrorbk": "Mirror Block", "mochikoro": "Mochikoro", 
		"mochinyoro": "Mochinyoro", "moonsun": "Moon or Sun", "nagare": "Nagareru-Loop", "nagenawa": "Nagenawa", "nanro": "Nanro", "nawabari": "Territory", "nikoji": "NIKOJI", 
		"nondango": "Nondango", "nonogram": "Nonogram", "norinori": "Norinori", "nothree": "No Three", "numlin": "Numberlink", "numrope": "Number Rope", "nuribou": "Nuribou", 
		"nurikabe": "Nurikabe", "nurimaze": "Nuri-Maze", "nurimisaki": "Nurimisaki", "nuriuzu": "Nuri-uzu", "ovotovata": "Ovotovata", "oneroom": "One Room One Door", "onsen": "Onsen-meguri", 
		"paintarea": "Paintarea", "parquet": "Parquet", "pencils": "Pencils", "pentominous": "Pentominous", "pentopia": "Pentopia", "pipelink": "Pipelink", "pipelinkr": "Pipelink Returns", 
		"putteria": "Putteria", "ququ": "Ququ", "railpool": "Rail Pool", "rassi": "Rassi Silai", "rectslider": "Rectangle-Slider", "reflect": "Reflect Link", "renban": "Renban-Madoguchi", 
		"ringring": "Ring-ring", "ripple": "Ripple Effect", "roma": "Roma", "roundtrip": "Round Trip", "sashigane": "Sashigane", "satogaeri": "Satogaeri", "scrin": "Scrin", 
		"shakashaka": "Shakashaka", "shikaku": "Shikaku", "shimaguni": "Islands", "shugaku": "School Trip", "shwolf": "Goats and Wolves", "simpleloop": "Simple Loop", "slalom": "Slalom", 
		"slither": "Slitherlink", "snake": "Snake", "snakepit": "Snake Pit", "starbattle": "Star Battle", "squarejam": "Square Jam", "statuepark": "Statue Park", "statuepark-aux": "Edit shape", 
		"stostone": "Stostone", "sudoku": "Sudoku", "sukoro": "Sukoro", "sukororoom": "Sukoro-room", "symmarea": "Symmetry Area", "tajmahal": "Taj Mahal", "takoyaki": "Takoyaki", 
		"tapa": "Tapa", "tapaloop": "Tapa-Like Loop", "tasquare": "Tasquare", "tatamibari": "Tatamibari", "tateyoko": "Tatebo-Yokobo", "tawa": "Tawamurenga", "tentaisho": "Tentaisho", 
		"tents": "Tents", "tilepaint": "Tilepaint", "toichika": "Toichika", "toichika2": "Toichika 2", "tontti": "Tonttiraja", "tren": "Tren", "triplace": "Tri-place", 
		"tslither": "Touch Slitherlink", "usotatami": "Uso-tatami", "usoone": "Uso-one", "view": "View", "voxas": "Voxas", "vslither": "Vertex Slitherlink", "wagiri": "Wagiri", 
		"walllogic": "Wall Logic", "wblink": "Shirokuro-link", "yajikazu": "Yajisan-Kazusan", "yajilin": "Yajilin", "yajilin-regions": "Regional Yajilin", "yajisoko": "Yajisan-Sokoban", 
		"yajitatami": "Yajitatami", "yinyang": "Yin-Yang", "yosenabe": "Yosenabe"
	}

	const parsePuzzLink = (url) => {
		let fakedoc = new FakeDoc();
		let usersettings = new UserSettings();
		let penpaGeneral = PenpaGeneral(fakedoc, usersettings);

		penpaGeneral.decode_puzzlink(url);

		let pu = penpaGeneral.get_pu();
		if (!pu || (pu.user_tags.length === 0 && pu.mode.qa !== 'pu_a'))
			return null;

		let variant = false
		let parts, urldata, type;
		parts = url.split("?");
		urldata = parts[1].split("/");
		if (urldata[1] === 'v:') {
			urldata.splice(1, 1); // Ignore variant rules
			variant = true;
		}	
		type = urldata[0];

		let title = puzzlinkNames[type] || type;		
		let rules = [`${title} rules apply.`] ;
		if (variant) rules.push("This puzzle uses variant rules.");

		let doc = {
			saveinfotitle: title,
			saveinforules: rules.join('\n'),
			saveinfoauthor: `puzz.link`
		}
		pu._document = doc;
		pu._UserSettings = usersettings;
		return pu;
	}

	const parsePenpaPuzzle = urlstring => {
		let paramMatch = urlstring.match(/[^\?#]+[\?#]([^#]+)/)
		if (!paramMatch)
			return null;
		
		let urlParam = paramMatch[1];

		let fakedoc = new FakeDoc();
		let usersettings = new UserSettings();
		let penpaGeneral = PenpaGeneral(fakedoc, usersettings);

		try {
			penpaGeneral.load(urlParam, 'local');
		}
		catch(err) {
			let gridtype = err.message.match(/Puzzle_(\w+) is not defined/);
			if (gridtype) {
				err = {
					penpa: `Penpa grid type '${gridtype[1]}' is not supported in SudokuPad`,
				}
			}
			throw err;
		}

		let pu = penpaGeneral.get_pu();
		let doc = {};
		// Flatten fakedoc into values
		Object.keys(fakedoc).forEach(k => { if(fakedoc[k].value !== undefined) doc[k] = fakedoc[k].value; })
		pu._document = doc;
		pu._UserSettings = usersettings;
		return pu;
	}

	const loadPenpaPuzzle = urlstring => {
		let pu;
        if (urlstring.match(rePenpaUrl)) {
			pu = parsePenpaPuzzle(urlstring);
		}
		else if (urlstring.match(rePuzzlinkUrl)) {
			pu = parsePuzzLink(urlstring);
		}
		return pu;
	}

	const getMinMaxRC = function(list = []) {
		const {point2cell} = PenpaTools;
		const rcs = [].concat(list.map(point2cell)),
					rows = rcs.map(([r, c]) => r),
					cols = rcs.map(([r, c]) => c);
		return [
			Math.min(...rows), Math.min(...cols),
			Math.max(...rows), Math.max(...cols),
		];
	};

	function rgba2hex(orig) {
		let rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
		let alpha = (rgb && rgb[4] || "").trim();
		let hex = rgb ? '#' +
		  (rgb[1] | 1 << 8).toString(16).slice(1).toUpperCase() +
		  (rgb[2] | 1 << 8).toString(16).slice(1).toUpperCase() +
		  (rgb[3] | 1 << 8).toString(16).slice(1).toUpperCase() : orig;

		if (alpha !== "" && alpha != 1) {
		  let a = ((alpha * 255) | 1 << 8).toString(16).slice(1).toUpperCase()
		  hex = hex + a;
		}

		return hex;
	}

	function convertCustomColors(list) {
		for(let i in list) {
			if (typeof list[i] === 'string') {
				list[i] = rgba2hex(list[i]);
			}
			else {
				if (list[i] === null || Array.isArray(list[i])) {
					delete list[i]; // remove invalid color
				}
			}
		}
	}

	function convertPenpaPuzzle(pu) {
		if (!pu) return;

		// Convert custom colors to hex
		if (pu.pu_q_col) for(let i in pu.pu_q_col) convertCustomColors(pu.pu_q_col[i]);
		if (pu.pu_a_col) for(let i in pu.pu_a_col) convertCustomColors(pu.pu_a_col[i]);

		const doc = {
			point: pu.point,
			nx: pu.nx,
			ny: pu.ny,
			nx0: pu.nx0,
			ny0: pu.ny0,
			theta: pu.theta,
			reflect: pu.reflect,
			width_c: pu.width_c,
			height_c: pu.height_c,
			center_n: pu.center_n,
			col0: 0,
			row0: 0,
			width: 0,
			height: 0,
		};

		// Inject puzzle/doc metrics into helper classes
		PenpaTools.doc = doc;
		DrawingContext.ctcSize = 64;
		DrawingContext.penpaSize = pu._size;

		// Determine cell grid bounding box
		const [top, left, bottom, right] = getMinMaxRC(pu.centerlist);

		// Update with calculated top-left position
		doc.col0 = left;
		doc.row0 = top;
		doc.width = right - left + 1;
		doc.height = bottom - top + 1;

		let puzzle = {id: `penpa${md5Digest(JSON.stringify(pu))}`};
		const {width, height} = doc;
		createBlankPuzzle(pu, puzzle, width, height);
		addGivens(pu, puzzle);
		
		if (pu.gridtype === "sudoku") {
			// When no frame then there are no sudoku regions
			//if (pu.mode.grid[2] !== '2') // No Frame
			createSudokuRegions(pu, puzzle);
		}

		positionBoard(pu, puzzle, doc);
		createCellMask(pu, puzzle, doc);

		let qa = 'pu_q'
		parse.surface(qa, pu, puzzle);
		parse.symbol(qa, pu, puzzle, 1);
		parse.squareframe(qa, pu, puzzle);
		parse.thermo(qa, pu, puzzle);
		parse.nobulbthermo(qa, pu, puzzle);
		parse.arrows(qa, pu, puzzle);
		parse.wall(qa, pu, puzzle);
		// draw_frame()
		parse.polygon(qa, pu, puzzle);
		parse.freeline(qa, pu, puzzle);
		parse.freelineE(qa, pu, puzzle);
		parse.line(qa, pu, puzzle);
		parse.lineE(qa, pu, puzzle);
		parse.direction(qa, pu, puzzle);
		// draw_lattice();
		parse.symbol(qa, pu, puzzle, 2);
		parse.cage(qa, pu, puzzle);
		parse.killercages(qa, pu, puzzle);
		parse.number(qa, pu, puzzle);
		parse.numberS(qa, pu, puzzle);

		drawBoardOutline(pu, puzzle, doc);

		parse.deletelineE(qa, pu, puzzle);

		if(puzzle.regions.length === 0) {
			// Create cage to defined the board bounds
			const {width, height} = doc;
			puzzleAdd(puzzle, 'cages', {cells: [[0, 0], [height - 1, width - 1]], unique: false, hidden: true});
		}
		
		// Custom patch the puzzle
		if ((pu._document.saveinforules || '').indexOf('Box 4: Antiknight') !== -1)
		{
			// Sneeky text substute to supress anti-knight rule, which would otherwise apply to whole board
			pu._document.saveinforules = pu._document.saveinforules.replace('Box 4: Antiknight', 'Box 4: Antik\u0578ight');
		}
		// 	// Change color and width of green whisper lines
		// 	(puzzle.lines || []).forEach(line => {
		// 		if (line.color === Color.GREEN) {
		// 			line.color = '#60C060'
		// 			line.thickness = 8
		// 		}
		// 	});
		// }

		addSolution(pu, puzzle, doc);
		
		// Add puzzle meta data
		applyDefaultMeta(pu, puzzle, 'title', pu._document.saveinfotitle, getDefaultTitle);
		applyDefaultMeta(pu, puzzle, 'author', pu._document.saveinfoauthor, getDefaultAuthor);
		applyDefaultMeta(pu, puzzle, 'rules', pu._document.saveinforules, getDefaultRules);
		if (pu._document.custom_message) {
			applyDefaultMeta(pu, puzzle, 'msgcorrect', pu._document.custom_message);
		}

		console.log(pu, puzzle);
		return puzzle;
	};

	// Make sure to use all uppercase colors, this is important for Sudokupad to create a solid white.
	Object.keys(Color).forEach(c => {
		Color[c] = Color[c].trim();
		if (Color[c][0] === '#') Color[c] = Color[c].toUpperCase();
	});

	const loadPuzzle = penpaRaw => Promise.resolve(penpaRaw)
		.then(penpaRaw => penpaRaw.replace(/^penpa/, ''))
		.then(loadPenpaPuzzle)
		.then(convertPenpaPuzzle)
		.then(puzzle => puzzle && PuzzleZipper.zip(JSON.stringify(puzzle)))
		.catch(err => (console.error('Error fetching penpa:', err), Promise.reject(err)));

	const convertPuzzleUrl = url => {
		if (url.match(rePenpaUrl)
		 || url.match(rePuzzlinkUrl)) {
			let pu = loadPenpaPuzzle(url);
			let puzzle = convertPenpaPuzzle(pu);
			if (!puzzle) return null;
			let puzzleId = 'ctc' + loadFPuzzle.compressPuzzle(PuzzleZipper.zip(JSON.stringify(puzzle)))
			return puzzleId;
		}

		if (url.match(reFpuzzlesUrl)) {
			let fpuzzle = url.match(/\?load=([^&]+)/);
			if (fpuzzle) {
				return 'fpuzzles' + fpuzzle[1];
			}
			return null;
		}		

		const reCtc = /(app.crackingthecryptic.com\/sudoku\/|sudokupad.app\/(sudoku\/)?)(.+)/
		let sudokupad = url.match(reCtc)
		if (sudokupad) {
			let puzzleid = sudokupad[3].replace(/^\?puzzleid=/, '');
			return puzzleid;
		}

		return null;
	}

	const tinyUrls = [
		/tinyurl.com\/(.+)/,
		/f-puzzles.com\/\?id=(.+)/,
	]
	const expandShortUrl = function(url) {
		let short = tinyUrls.map(re => url.match(re)).find(m => m);
		if(!short) {
			return url;
		}
		return new Promise((resolve, reject) => {
			//fetch('http://localhost:3000/tinyurl/' + short[1])
			fetch('https://marktekfan-api.azurewebsites.net/tinyurl/' + short[1])
			.then(res => res.text())
			.then(text => {
				console.log('json response:', text)
				let result = JSON.parse(text)
				if (result.success) {
					return resolve(result.longurl);
				}
				return resolve(url);
			})
			.catch(reject);
		});
	}

	loadPuzzle.expandShortUrl = expandShortUrl;
	loadPuzzle.convertPuzzleUrl = convertPuzzleUrl;
	loadPuzzle.loadPenpaPuzzle = loadPenpaPuzzle;
	loadPuzzle.convertPuzzle = convertPenpaPuzzle;

	return loadPuzzle;
})();
