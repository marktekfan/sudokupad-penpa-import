
const loadPenpaPuzzle = (() => {

	const DEBUG = 0 || document.location.host.startsWith('127.0.0.1');

	const doc = {};
	class UserSettings {
		loadFromCookies() {}
	};

	class FakeDoc {
		constructor() {
			//this.ids = {}
		}
		getElementById(id) {
			let elem = this[id];
			if (!elem) {
				elem = {
					id: id,
					value: '',
					style: {
						display: 'none'
					},
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

	function createBlankPuzzle(pu, fpuzzle, puzzle) {
		puzzle = Object.assign(puzzle, {cellSize: 64, cells: [], regions: []});
		fpuzzle.grid.forEach((frow, r) => {
			let row = [];
			puzzle.cells.push(row);
			frow.forEach((fcell, c) => {
				let cell = {};
				row.push(cell);
				if(fcell.given) cell.value = fcell.value;
				if(fcell.centerPencilMarks) cell.centremarks = fcell.centerPencilMarks;
				if(fcell.cornerPencilMarks) cell.pencilMarks = fcell.cornerPencilMarks;
			});
		});
		if (pu.gridtype === "sudoku") {
			// When no frame then there are no sudoku regions
			//if (pu.mode.grid[2] !== '2') // No Frame
			createRegions(fpuzzle, puzzle);
		}
	}

	function createRegions(fpuzzle, puzzle) {
		const {ctcRC2k} = PenpaTools;
		let rows = fpuzzle.grid.length;
		let cols = fpuzzle.grid[0].length;
		let regRC = getRegionShape(Math.min(rows, cols));
		const rowRegions = Math.ceil(cols / regRC[1]);
		let regions = {};
		const convRegion = (r, c, region) => {
			if(region === null) return 'null';
			//if(region === undefined) return Math.floor(r / regRC[0]) * regRC[0] + Math.floor(c / regRC[1]);
			if(region === undefined) return Math.floor(r / regRC[0]) * rowRegions + Math.floor(c / regRC[1]);
			return Number(region);
		};
		fpuzzle.grid.forEach((frow, r) => {
			frow.forEach((fcell, c) => {
				let region = convRegion(r, c, fcell.region);
				if (fpuzzle.centerlist.includes(ctcRC2k([r, c]))) { //region = 'null';
					if(regions[region] === undefined) regions[region] = [];
					regions[region].push([r, c]);
				}
			});
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

	function drawOutsideFrame(pu, puzzle, doc) {
		const {point2cell, RC2k} = PenpaTools;
		const {centerlist} = pu;

		// gr = grid line style
		// ot = outline style
		var gr = 1; // Solid line
        var ot = 2; // Thick line
        if (pu.mode.grid[0] === "2") {
            gr = 11; // Dotted line
        } else if (pu.mode.grid[0] === "3") {
            gr = 0; // No line
        }
        if (pu.mode.grid[2] === "2") { // No Frame
            ot = gr; // The line frame is the same line as the inside
        }


		// Mask off non-grid grid lines
		let outsideCells = [];
		{
			let [top, left, bottom, right] = parse.bb;
			for (let r = top; r <= bottom; r++) {
				for (let c = left; c <= right; c++) {
					if(!centerlist.includes(RC2k(r, c))) {
						outsideCells.push({center: [r + 0.5, c + 0.5], value: 0});
					}
				}
			}
		}

		{
			let gridCells = centerlist.map(point2cell).map(c => ({row: c[0], col: c[1]}));
			let outlinePoints = PenpaTools.getCellOutline(gridCells);
			if (outlinePoints.length > 0) {
				// Outside mask
				let ctx = new FakeContext();
				let edgePoints = PenpaTools.normalizePath(outlinePoints).map(l => (l.length === 3) ? [l[0], l[2], l[1]] : l);

				const margin = 0.06;
				let [top, left, bottom, right] = parse.bb;
				left -= margin;
				top -= margin;
				right += 1 + margin;
				bottom += 1 + margin;
				ctx.path = edgePoints;
				ctx.moveTo(left, top);
				ctx.lineTo(left, bottom);
				ctx.lineTo(right, bottom);
				ctx.lineTo(right, top);
				ctx.closePath();
				let opts = Object.assign(ctx.pathToOpts(), {
					fill:  '#FFFFFF',
					// fill: '#ff0000',//Color[Object.keys(Color)[Math.floor(this._rnd = ((this._rnd|0) + 1) % 24)]],
					'fill-rule': 'evenodd',
					target: 'overlay'
				});
				puzzleAdd(puzzle, 'lines', opts, 'outside mask');
			}
		}

		// Add frame outine
		let gridCells = centerlist.map(point2cell).map(c => ({row: c[0], col: c[1]}));
		let outlinePoints = PenpaTools.getCellOutline(gridCells);

		let lineScaleFactor = 1;
		if (ot === 2) {
			let count = Object.keys(pu.pu_q.lineE).reduce((p, k) => pu.pu_q.lineE[k] == 2 ? p + 1 : p, 0);
			if(count < Math.max(doc.rows0, doc.cols0)) {
				lineScaleFactor = 0.9;
			}
		}

		let wayPoints = [];
		outlinePoints.forEach(([t, r, c]) => {
			if (t === 'Z') {
				wayPoints.push(wayPoints[0]);
				let ctx = new FakeContext();
				set_line_style(ctx, ot); // thick line
				opts = Object.assign(ctx.toOpts('line'), {
					//color: '#FF0000',
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
		ctx = new FakeContext();
		opts = Object.assign(ctx.toOpts(), {
			backgroundColor: Color.TRANSPARENTWHITE, //'#cc4440',
			// thickness: 10,//32,// * line.width,
			center: [doc.rows0 / 2, doc.cols0 / 2],
			width: doc.cols0,
			height: doc.rows0,
			//target: 'overlay'
		});
		puzzleAdd(puzzle, 'overlays', opts, 'board position');
	}

	const offsetRC = (or, oc) => ([r, c]) => [r + or, c + oc];

	const applyDefaultMeta = (doc, puzzle, metaName, defaultValFunc) => {
		let metaValue = doc[metaName] || defaultValFunc(doc, puzzle);
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
		const {point2RC, RC2k, isCtcCell} = PenpaTools;
		const keys = Object.keys(list); //keys.sort();
		let centers = keys.map(k => ({center: point2RC(k), value: list[k], key: k}));
		const predicate = (s1, s2) => {
			return s1.value === s2.value
			&& pu.centerlist.includes(RC2k(s1.center)) === pu.centerlist.includes(RC2k(s2.center))
			&& s1.layer === s2.layer
			// When there is an auto generated white outside mask
			// and a colored surface on the outside of the board and attached to the square board boundary
			// then this extra condition can create white patches on colored outside surfaces. Very rare.
			&& isCtcCell(s1.center, parse.bb) === isCtcCell(s2.center, parse.bb) // Note 1
		}
		PenpaTools.reduceSurfaces(centers, predicate).forEach(surface => {
			let ctx = new FakeContext();
			set_surface_style(ctx, surface.value);
			if(listCol[surface.key]) {
				ctx.fillStyle = listCol[surface.key];
				ctx.strokeStyle = listCol[surface.key];
			}
			if (isCtcCell(surface.center, parse.bb) && !pu.centerlist.includes(RC2k(surface.center))) {
				ctx.target = 'overlay';
			}
			if (ctx.fillStyle === Color.GREY_DARK_VERY) {
			 	ctx.fillStyle = '#010101'
			 	ctx.target = 'overlay';
			}
			puzzleAdd(puzzle, 'underlays', Object.assign(ctx.toOpts(), {
				center: surface.center,
				width: surface.width || 1,
				height: surface.height || 1,
				//backgroundColor: Color[Object.keys(Color)[Math.floor(this._rnd = ((this._rnd|0) + 1) % 24)]],
			}), 'surface');
		});
	}
	parse.number = (qa, pu, puzzle, feature = 'number') => {
		const draw = new PenpaNumber(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		Object.keys(list).forEach(key => {
            if (key.slice(-1) === 'E') { // Overwriting in Edge Mode
                key = key.slice(0, -1);
            }
			const number = list[key];
			if (number.role) return;
			draw.draw_number(number, key);
		});
	}
	parse.numberS = (qa, pu, puzzle, feature = 'numberS') => {
		const draw = new PenpaNumber(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		Object.keys(list).forEach(key => {
			const number = list[key];
			if (number.role) return;
			draw.draw_numberS(number, key);
		});
	}
	parse.symbol = (qa, pu, puzzle, layer = 1) => {
		const feature = 'symbol'
		const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC} = PenpaTools;
		Object.keys(list).forEach(key => {
			const symbol = list[key];
			if (symbol[2] !== layer) return;
			const ctx = new FakeContext();
            if (key.slice(-1) === 'E') { // Overwriting in Edge Mode
                key = key.slice(0, -1);
            }
			const [r, c] = point2RC(key);
			if (symbol[2] === 2) {
				ctx.target = 'overlay';
			}
			else {
				//ctx.target = 'cell-colors';
				//ctx.target = 'arrows';
				//ctx.target = 'underlay';
			}
			draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
		});
	}
	draw_freeline = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new FakeContext();
			// TODO: Implement custom color
			set_line_style(ctx, line.value);
			if(listCol[line.key]) {
				ctx.strokeStyle = listCol[line.key];
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
			let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
			points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
			points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
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
		// FIXME: sudokupad renders start point too short
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			let points = line.map(point2RC);
			let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
			points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
			points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
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
		// FIXME: adjust start and end positions
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
			let ctx = new FakeContext();
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
	draw_line = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new FakeContext();
			set_line_style(ctx, line.value);
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
		const {RC2k} = PenpaTools;
		let wpLines = PenpaTools.penpaLines2WaypointLines(list, listCol);
		let wpLinesCol = PenpaTools.penpaLines2WaypointLines(listCol);
		const cages = pu[qa].killercages || [];
		// Filter out cage lines which are on killer cages.
		wpLines = wpLines.filter(line => {
			if (line.value === 16) return true; // always keep solid cage lines
			let k1 = RC2k(line.wayPoints[0]);
			let k2 = RC2k(line.wayPoints[1]);
			let ndx1 = cages.findIndex(c => c.includes(k1));
			let ndx2 = cages.findIndex(c => c.includes(k2));
			if (ndx1 !== -1 && ndx2 !== -1 && ndx1 === ndx2) {
				// Copy custom color to killercage
				function equalWaypoints(wp1, wp2) {
					if (wp1.length !== wp2.length) return false;
					for (let i = 0; i < wp1.length; i++) {
						if (wp1[i][0] != wp2[i][0] || wp1[i][1] != wp2[i][1])
							return false;
					}
					return true;
				}
				let cc = wpLinesCol.find(col => equalWaypoints(col.wayPoints, line.wayPoints));
				if (cc) {
					pu[qa + '_col']['killercages'][ndx1] = cc.value;
				}
				return false;
			}
			return true;
		});
		// Align cage lines with SudokuPad cages lines
		const r = 0.17; //space between grid
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
			let ctx = new FakeContext();
			// if (i1 % 4 === 3 || i2 % 4 === 0) ... + 100
			set_line_style(ctx, line.value + 100, line.cc);
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
		const {point2cell} = PenpaTools;
		list.forEach((cage, i) => {
			if (cage.length === 0) return;
			let pCage = {unique: true};
			const offset = offsetRC(-doc.row0, -doc.col0);
			pCage.cells = cage.map(point2cell).map(offset);
			if (listCol[i]) {
				pCage.borderColor = listCol[i];
			}
			// if(cage.value) pCage.value = cage.value;
			//if(isIntStrict(cage.value)) pCage.sum = parseInt(cage.value);
			puzzleAdd(puzzle, 'cages', pCage, 'killercages');
		});
	}
	parse.deletelineE = (qa, pu, puzzle) => {
		const list = pu[qa].deletelineE || [];
		Object.keys(list).forEach(l => {
			let [p1, p2] = PenpaTools.getAdjacentCellsOfLine(pu, l);
			let s1 = pu[qa].surface[p1];
			let s2 = pu[qa].surface[p2];
			if (s1 && s1 === s2) {
				let ctx = new FakeContext();
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
			let shortLine = PenpaTools.shortenLine(line.wayPoints, 2/64);
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
				//let outside = cells.some(rc => !pu.centerlist[RC2k(rc)] && isCtcCell(rc, parse.bb));
				// let outside = cells.some(rc => {
				// 	let cl = pu.centerlist[RC2k(rc)];
				// 	let onboard = isCtcCell(rc, parse.bb);
				// 	console.log('onboard && !cl', onboard, !cl, onboard && !cl);
				// 	return onboard && !cl;
				// });
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
			let ctx = new FakeContext();
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
		let shortLine = PenpaTools.shortenLine(line.wayPoints, 0.2);
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			wayPoints: shortLine
		}), 'short line');
	}
	function drawDoubleLine(ctx, line, puzzle) {
		const r = 0.15;// * this.size;
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

	// const saveDecodeURIComponent = (str, dec) => (dec = decodeURIComponent(str), dec.length < str.length ? dec : str);

    function decrypt_data(puzdata) {
        var ab = atob(puzdata);
        ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
        var inflate = new Zlib.RawInflate(ab);
        var plain = inflate.decompress();
        let decrypted = new TextDecoder().decode(plain);
        return decrypted;
    }

    //function
    function loadver1(paramArray, rtext) {
        return;
    }

	function make_class(gridtype) {
		var size = 1; //UserSettings.displaysize;
		let pu = undefined;
		switch (gridtype) {
			case "square":
				var nx = parseInt(doc.nb_size1);
				var ny = parseInt(doc.nb_size2);
				pu = new PenpaPuzzle_Square(nx, ny, size);
				break;
			case "sudoku":
				var nx = parseInt(doc.nb_size1);
				var ny = parseInt(doc.nb_size2);
				pu = new PenpaPuzzle_Sudoku(nx, ny, size);
				break;
			case "kakuro":
				var nx = parseInt(doc.nb_size1);
				var ny = parseInt(doc.nb_size2);
				pu = new PenpaPuzzle_Square(nx, ny, size);
				break;
		}
		return pu;
	}

	const parsePuzzLink = (urlstring) => {
		let fakedoc = new FakeDoc();
		let usersettings = new UserSettings();
		let penpaGeneral = PenpaGeneral(fakedoc, usersettings);
		penpaGeneral.decode_puzzlink(urlstring);

		let pu = penpaGeneral.get_pu();
		pu.document = fakedoc;
		pu.UserSettings = usersettings;
		return pu;
	}

	const parsePenpaPuzzle = urlstring => {
		let param = urlstring.split('&');
		let paramArray = [];

		for (var i = 0; i < param.length; i++) {
			let paramItem = param[i].split('=');
			paramArray[paramItem[0]] = paramItem[1];
		}
		if (urlstring.includes("#")) {
			urlstring = urlstring.split("/penpa-edit/#")[1];
		} else {
			urlstring = urlstring.split("/penpa-edit/?")[1];
		}

		let fakedoc = new FakeDoc();
		let usersettings = new UserSettings();
		let penpaGeneral = PenpaGeneral(fakedoc, usersettings);

		try {
			penpaGeneral.load(urlstring, 'local');
		}
		catch(err) {
			let gridtype = err.message.match(/Puzzle_(\w+) is not defined/);
			if (gridtype) {
				let error = {
					penpa: `Penpa grid type '${gridtype[1]}' is not supported in SudokuPad`,
				}
				throw error;
			}

			throw err;
		}

		let pu = penpaGeneral.get_pu();
		pu.document = fakedoc;
		pu.UserSettings = usersettings;
		return pu;
	}

	const parsePuzzleUrl = urlstring => {
		let pu;
        if (urlstring.indexOf("/penpa-edit/") !== -1) {
			pu = parsePenpaPuzzle(urlstring);
		}
		else if (urlstring.match(/\/puzz.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p\.html\?/)) {
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

	function convertColorsToHex(list) {
		for(let i in list) {
			if (typeof list[i] === 'string') {
				list[i] = rgba2hex(list[i]);
			}
			else {
				if (Array.isArray(list[i])) 
					delete list[i];
			}
		}
	}

	function convertPuzzle(pu) {
		Object.keys(doc).forEach(k => delete doc[k]);
		Object.assign(doc, pu.document);
		const usersettings = pu.UserSettings;

		if (pu.pu_q_col) {
			for(let i in pu.pu_q_col) {
				convertColorsToHex(pu.pu_q_col[i]);
			}
		}
		if (pu.pu_a_col) {
			for(let i in pu.pu_a_col) {
				convertColorsToHex(pu.pu_a_col[i]);
			}
		}
		
		doc.nb_size1 = pu.nx;
		doc.nb_size2 = pu.ny;
		doc.cols0 = doc.nb_size1;
		doc.rows0 = doc.nb_size2;
		doc.cols = doc.cols0 + 4;
		doc.rows = doc.rows0 + 4;

		// FIXME
		doc.point = pu.point;
		PenpaTools.doc = doc;

		let puzzle = {id: `penpa${md5Digest(JSON.stringify(pu))}`};

		let fpuzzle = {}

		fpuzzle.centerlist = pu.centerlist;
        fpuzzle.grid = [];

		parse.bb = getMinMaxRC(pu.centerlist);
		let [top, left, bottom, right] = parse.bb;
		doc.col0 = left;
		doc.row0 = top;

		FakeContext.offset = [doc.row0, doc.col0]
		const width = right - left + 1;
		const height = bottom - top + 1;

		// number - Cell Givens
        const {number} = pu.pu_q;
		const {ctcRC2k} = PenpaTools;
        for (let r = 0; r < height; r++) {
            let row = [];
            fpuzzle.grid.push(row);

            for (let c = 0; c < width; c++) {
                let cell = {};
                row.push(cell);

                let pos = ctcRC2k([r, c]);
                const num = number[pos];
                if (num && num[1] == 1 && (num[2] === '1')) { //Black Normal or Big number
                    cell.given = true;
                    cell.value = num[0];
					num.role = 'given';
                }
            }
        }

		createBlankPuzzle(pu, fpuzzle, puzzle);

		drawOutsideFrame(pu, puzzle, doc);
		positionBoard(pu, puzzle, doc);

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
		parse.number(qa, pu, puzzle);
		parse.numberS(qa, pu, puzzle);

		parse.deletelineE(qa, pu, puzzle);
		parse.killercages(qa, pu, puzzle);

		if(puzzle.regions.length === 0) {
			let [top, left, bottom, right] = parse.bb;
			puzzleAdd(puzzle, 'cages', {cells: [[0, 0], [bottom - top, right - left]], unique: false, hidden: true});
		}
		// if(puzzle.regions.length === 0 && puzzle.cages.length > 0) {
		// 	let [top, left, bottom, right] = parse.bb;
		// 	const width = right - left + 1;
		// 	const height = bottom - top + 1;
		// 	let region = [];
		// 	const cages = puzzle.cages.map(cage => cage.cells).flat();
		// 	for (let r = 0; r < height; r++) {
		// 		for (let c = 0; c < width; c++) {
		// 			if(pu.centerlist.includes(ctcRC2k(r, c))) {
		// 				//if(cages.every(rc => r !== rc[0] || c !== rc[1]))
		// 					region.push([r,c]);
		// 			}
		// 		}
		// 	}
		// 	if(region.length > 0) puzzleAdd(puzzle, 'regions', region, 'board region');
		// }

		// Custom patch the puzzle
		if ((doc.rules || '').indexOf('Box 4: Antiknight') !== -1)
		{
			// Sneeky text substute to supress anti-knight rule, which would otherwise apply to whole board
			doc.rules = doc.rules.replace('Box 4: Antiknight', 'Box 4: Antik\u0578ight');
		}
		// 	// Change color and width of green whisper lines
		// 	(puzzle.lines || []).forEach(line => {
		// 		if (line.color === Color.GREEN) {
		// 			line.color = '#60C060'
		// 			line.thickness = 8
		// 		}
		// 	});
		// }

		const {round, round1} = PenpaTools;
		const offset = offsetRC(-doc.row0, -doc.col0);
		Object.keys(puzzle).forEach(key => {
			let prop = puzzle[key];
			if (Array.isArray(prop)) {
				prop.forEach(part => {
					if(Array.isArray(part.center)) {
						part.center = offset(part.center).map(round);
					}
					if(Array.isArray(part.wayPoints)) {
						part.wayPoints = part.wayPoints.map(offset).map(round);
					}
					if(part.fontSize) {
						part.fontSize = round1(part.fontSize - 4); // Fix to compensate for fontSize hack in App.convertPuzzle
					}
				});
			}
		});

		// A fix to compensate for fontSize hack in App.convertPuzzle
		[].concat(puzzle.underlays || [], puzzle.overlays || []).forEach(part => { if(part.fontSize !== undefined) part.fontSize += 4; });

		applyDefaultMeta(doc, puzzle, 'title', loadPuzzle.getDefaultTitle);
		applyDefaultMeta(doc, puzzle, 'author', loadPuzzle.getDefaultAuthor);
		applyDefaultMeta(doc, puzzle, 'rules', loadPuzzle.getDefaultRules);

		// Add solution
		if (pu.solution && !pu.multisolution) {
			const {point2cell} = PenpaTools;
			let stext = JSON.parse(pu.solution);
			let [top, left, bottom, right] = parse.bb;
			const cols = right - left + 1;
			const rows = bottom - top + 1;
			let sol = Array(rows * cols).fill('?');
			stext[4].forEach(s => {
				let [point, val] = s.split(',');
				let [r, c] = point2cell(point);
				r -= doc.row0;
				c -= doc.col0;
				let pos = r * cols + c;
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = val;
				}
				else
					val=val;
			});
			solString = sol.join('');
			puzzleAdd(puzzle, 'cages', {value: `solution: ${solString}`}, 'solution');
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
		.then(parsePuzzleUrl)
		.then(convertPuzzle)
		.then(puzzle => PuzzleZipper.zip(JSON.stringify(puzzle)))
		.catch(err => (console.error('Error fetching penpa:', err), Promise.reject(err)));


	loadPuzzle.logUnsupported = false;
	loadPuzzle.getDefaultTitle = getDefaultTitle;
	loadPuzzle.getDefaultAuthor = getDefaultAuthor;
	loadPuzzle.getDefaultRules = getDefaultRules;
	loadPuzzle.parsePuzzleUrl = parsePuzzleUrl;
	loadPuzzle.parsePenpaPuzzle = parsePenpaPuzzle;
	loadPuzzle.parsePuzzLink = parsePuzzLink;
	loadPuzzle.convertPuzzle = convertPuzzle;

	return loadPuzzle;
})();

if(typeof module != 'undefined') module.exports = loadPenpaPuzzle;