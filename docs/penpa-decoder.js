
const loadPenpaPuzzle = (() => {

	const DEBUG = 0;

	const doc = {};
	const UserSettings = {
		displaysize: 38
	};


	const getRegionShape = (size = 9) => {
		if (size > 10) return [3, 3];
		let height = Math.sqrt(size);
		if(Number.isInteger(height)) return [height, height];
		height = Math.floor(height);
		while(!Number.isInteger(size / height) && height > 1) height--;
		return height > 0 ? [height, size / height] : [1, 1];
	};

	// const highlightColours = '#a8a8a8a8,#000,#ffa0a0,#ffdf61,#feffaf,#b0ffb0,#61d060,#d0d0ff,#8180f0,#ff08ff,#ffd0d0'.split(',');
	// const layerOrder = 'number,symbol_S,author,ruleset,clone,grid,disjointgroups,thermometer,killercage,arrow,difference,ratio,betweenline,lockout,quadruple,rectangle,circle,text,palindrome,line,minimum,maximum'.split(',');
	const layerOrder = 'surface,number,numberS,symbol,freeline,freelineE,thermo,arrows,direction,squareframe,polygon,line,lineE,wall,cage,deletelineE,killercages,nobulbthermo'.split(',');

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

	const getCellOutline = function(cells, os = 0) {
		let edgePoints = [], grid = [], segs = [], shapes = [];
		const checkRC = (r, c) => ((grid[r] !== undefined) && (grid[r][c] !== undefined)) || false;
		const pointOS = {
			tl: [os, os], tr: [os, 1-os],
			bl: [1-os, os], br: [1-os, 1-os],
			tc: [os, 0.5], rc: [0.5, 1-os],
			bc: [1-os, 0.5], lc: [0.5, os],
		};
		const dirRC = {t: [-1, 0], r: [0, 1], b: [1, 0], l: [0, -1]};
		const flipDir = {t: 'b', r: 'l', b: 't', l: 'r'};
		const patterns = [
			{name: 'otl', bits: '_0_011_1_', enter: 'bl', exit: 'rt', points: 'tl'},
			{name: 'otr', bits: '_0_110_1_', enter: 'lt', exit: 'br', points: 'tr'},
			{name: 'obr', bits: '_1_110_0_', enter: 'tr', exit: 'lb', points: 'br'},
			{name: 'obl', bits: '_1_011_0_', enter: 'rb', exit: 'tl', points: 'bl'},
			{name: 'itl', bits: '01_11____', enter: 'lt', exit: 'tl', points: 'tl'},
			{name: 'itr', bits: '_10_11___', enter: 'tr', exit: 'rt', points: 'tr'},
			{name: 'ibr', bits: '____11_10', enter: 'rb', exit: 'br', points: 'br'},
			{name: 'ibl', bits: '___11_01_', enter: 'bl', exit: 'lb', points: 'bl'},
			{name: 'et', bits: '_0_111___', enter: 'lt', exit: 'rt', points: 'tc'},
			{name: 'er', bits: '_1__10_1_', enter: 'tr', exit: 'br', points: 'rc'},
			{name: 'eb', bits: '___111_0_', enter: 'rb', exit: 'lb', points: 'bc'},
			{name: 'el', bits: '_1_01__1_', enter: 'bl', exit: 'tl', points: 'lc'},
			{name: 'out', bits: '_0_010_1_', enter: 'bl', exit: 'br', points: 'tl,tr'},
			{name: 'our', bits: '_0_110_0_', enter: 'lt', exit: 'lb', points: 'tr,br'},
			{name: 'oub', bits: '_1_010_0_', enter: 'tr', exit: 'tl', points: 'br,bl'},
			{name: 'oul', bits: '_0_011_0_', enter: 'rb', exit: 'rt', points: 'bl,tl'},
			{name: 'solo', bits: '_0_010_0_', enter: '', exit: '', points: 'tl,tr,br,bl'},
		];
		const checkPatterns = (row, col) => patterns
			.filter(({name, bits}) => {
				let matches = true;
				bits.split('').forEach((b, i) => {
					let r = row + Math.floor(i / 3) - 1, c = col + i % 3 - 1, check = checkRC(r, c);
					matches = matches && ((b === '_') || (b === '1' && check) || (b === '0' && !check));
				});
				return matches;
			});
		const getSeg = (segs, rc, enter) => segs.find(([r, c, _, pat]) => r === rc[0] && c === rc[1] && pat.enter === enter);
		const followShape = segs => {
			let shape = [], seg = segs[0], nextSeg;
			const getNext = ([r, c, cell, pat]) => {
				if(pat.exit === '') return;
				let [exitDir, exitSide] = pat.exit.split('');
				let nextRC = [r + dirRC[exitDir][0], c + dirRC[exitDir][1]];
				let nextEnter = flipDir[exitDir] + exitSide;
				return getSeg(segs, nextRC, nextEnter);
			};
			do {
				shape.push(seg);
				segs.splice(segs.indexOf(seg), 1);
				seg = getNext(seg);
			} while (seg !== undefined && shape.indexOf(seg) === -1);
			return shape;
		};
		const shapeToPoints = shape => {
			let points = [];
			shape.forEach(([r, c, cell, pat]) => pat.points
				.split(',')
				.map(point => pointOS[point])
				.map(([ros, cos]) => [r + ros, c + cos])
				.forEach(rc => points.push(rc))
			);
			return points;
		};
		cells.forEach(cell => {
			let {row, col} = cell;
			grid[row] = grid[row] || [];
			grid[row][col] = {cell};
		});
		cells.forEach(cell => {
			let {row, col} = cell, matchedPatterns = checkPatterns(row, col);
			matchedPatterns.forEach(pat => segs.push([row, col, cell, pat]));
		});
		while(segs.length > 0) {
			let shape = followShape(segs);
			if(shape.length > 0) shapes.push(shape);
		}
		shapes.forEach(shape => {
			edgePoints = edgePoints.concat(shapeToPoints(shape).map(([r, c], idx) => [idx === 0 ? 'M' : 'L', r, c]));
			edgePoints.push(['Z']);
		});
		return edgePoints;
	};

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
		let [top, left, bottom, right] = parse.bb;
		let outsideCells = [];
		for (let r = top; r <= bottom; r++) {
			for (let c = left; c <= right; c++) {
				if(!centerlist.includes(RC2k(r, c))) {
					outsideCells.push({center: [r + 0.5, c + 0.5], value: 0});
				}
			}
		}
		let norm = PenpaTools.reduceSurfaces(outsideCells);
		let exp = PenpaTools.inflateSurface(norm, top, left, bottom, right, 0.3);
		exp.forEach(surface => {
			let ctx = new FakeContext();
			set_surface_style(ctx, surface.value);
			puzzleAdd(puzzle, 'overlays', Object.assign(ctx.toOpts(), {
				backgroundColor: '#FFFFFF',
				//backgroundColor: Color[Object.keys(Color)[Math.floor(this._rnd = ((this._rnd|0) + 1) % 24)]],
				center: surface.center,
				width: surface.width || 1,
				height: surface.height || 1,
				target: 'cell-grids'
			}), 'outside mask');
		});

		//let edgePoints = PenpaTools.normalizePath(outlinePoints);
		// let path = edgePoints.map(([t, r, c], idx) => t === 'Z' ? t : `${t}${c * SvgRenderer.CellSize} ${r * SvgRenderer.CellSize}`).join(' ');
		// let left = -SvgRenderer.CellSize * 0.2;
		// let top = -SvgRenderer.CellSize * 0.2;
		// let right = (doc.cols0 + 0.2) * SvgRenderer.CellSize
		// let bottom = (doc.rows0 + 0.2) * SvgRenderer.CellSize
		// let outline = `M${left} ${top} L${left} ${bottom} L${right} ${bottom} L${right} ${top} Z `;

		// // Outside mask
		// let opts = Object.assign(ctx.toOpts(), {
		// 		d: outline + path,
		// 		fill:  '#FFFFFF',
		// 		'fill-rule': 'evenodd',
		// 		target: 'overlay'
		// 	});
		//puzzleAdd(puzzle, 'lines', opts, 'outside mask');

		// Add frame outine

		let gridCells = centerlist.map(point2cell).map(c => ({row: c[0], col: c[1]}));
		let outlinePoints = getCellOutline(gridCells);

		let linewidth = 1;
		if (ot === 2) {
			let count = Object.keys(pu.pu_q.lineE).reduce((p, k) => pu.pu_q.lineE[k] == 2 ? p + 1 : p, 0);
			if(count < Math.max(doc.rows0, doc.cols0)) {
				linewidth = 0.9;
			}
		}

		let wayPoints = [];
		outlinePoints.forEach(([t, r, c]) => {
			if (t === 'Z') {
				wayPoints.push(wayPoints[0]);
				let ctx = new FakeContext();
				set_line_style(ctx, ot); // thick line
				opts = Object.assign(ctx.toOpts(), {
					//color: '#FF0000',
					// thickness: 10,//32,// * line.width,
					wayPoints: PenpaTools.reduceWayPoints(wayPoints),
					target: 'overlay'
				});
				opts.thickness *= linewidth;
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

	parse.number = (qa, pu, puzzle, feature) => {
		const draw = new PenpaNumber(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature];
		Object.keys(list).forEach(key => {
            if (key.slice(-1) === 'E') { // Overwriting in Edge Mode
                key = key.slice(0, -1);
            }
			const number = list[key];
			if (number.role) return;
			draw.draw_number(number, key);
		});
	}
	parse.numberS = (qa, pu, puzzle, feature) => {
		const draw = new PenpaNumber(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa][feature];
		Object.keys(list).forEach(key => {
			const number = list[key];
			if (number.role) return;
			draw.draw_numberS(number, key);
		});
	}
	parse.symbol = (qa, pu, puzzle, feature) => {
		const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
		const list = pu[qa].symbol;
		const {point2RC} = PenpaTools;
		Object.keys(list).forEach(key => {
			const symbol = list[key];
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
			draw.draw_symbol(ctx, c, r, symbol[0], symbol[1]);
		});
	}
	parse.thermo = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature];
		const {point2RC} = PenpaTools;
		parse.nobulbthermo(qa, pu, puzzle, feature);
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			let cc = pu[qa + '_col'][feature][i];
			let color = cc || '#CFCFCF'; 
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
	function find_common(pu, line, endpoint) {
		if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
		if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
		return false;
	}
	parse.nobulbthermo = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature];
		const {point2RC} = PenpaTools;
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
			}
			let cc = pu[qa + '_col'][feature][i];
			let color = cc || '#CFCFCF'; 
			puzzleAdd(puzzle, 'lines', {
				color: color,
				thickness: 21,
				wayPoints: PenpaTools.reduceWayPoints(cells)
			}, 'thermo line');
		});
	}
	parse.squareframe = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature];
		// FIXME: adjust start and end positions
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			let cc = pu[qa + '_col'][feature][i];
			let color = cc || '#CFCFCF'; 
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
	parse.killercages = (qa, pu, puzzle, feature) => {
		const list = pu[qa].killercages;
		const {point2cell} = PenpaTools;
		list.forEach(cage => {
			if (cage.length === 0) return;
			let pCage = {unique: true};
			const offset = offsetRC(-doc.row0, -doc.col0);
			pCage.cells = cage.map(point2cell).map(offset);
			// if(cage.value) pCage.value = cage.value;
			//if(isIntStrict(cage.value)) pCage.sum = parseInt(cage.value);
			puzzleAdd(puzzle, 'cages', pCage, 'killercages');
		});
	}
	parse.arrows = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature];
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			let points = PenpaTools.reduceWayPoints(line.map(point2RC));
			let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
			points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
			points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
			let cc = pu[qa + '_col'][feature][i];
			let color = cc || '#a1a1a1'; 
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
	parse.direction = (qa, pu, puzzle, feature) => {
		const list = pu[qa][feature];
		// FIXME: sudokupad renders start point too short
		const {point2RC} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			let points = line.map(point2RC);
			let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
			points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
			points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
			let cc = pu[qa + '_col'][feature][i];
			let color = cc || '#a1a1a1'; 
			puzzleAdd(puzzle, 'arrows', Object.assign({
				color: color,
				headLength: 0.3,
				thickness: 5,
				wayPoints: PenpaTools.reduceWayPoints(points)
			}), 'direction');
		});
	}

	function drawXmarks(list, puzzle) {
		const {point2RC} = PenpaTools;
		const keys = Object.keys(list);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		Object.keys(list).forEach(k => {
			if (list[k] !== 98) return;
			set_line_style(this.ctx, 98);
			const r = 0.1414;
			let [y, x] = point2RC(k);
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints([[y - r, x - r], [y + r, x + r]])
			}), 'x1');
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints([[y + r, x - r], [y - r, x + r]])
			}), 'x2');
		});
	}
	function drawShortLine(ctx, line, puzzle) {
		const r = 0.8;
		let p1 = line.wayPoints[0];
		let p2 = line.wayPoints[1];
		let x1 = r * p1[1] + (1 - r) * p2[1];
		let y1 = r * p1[0] + (1 - r) * p2[0];
		let x2 = (1 - r) * p1[1] + r * p2[1];
		let y2 = (1 - r) * p1[0] + r * p2[0];
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			wayPoints: [[y1, x1], [y2, x2]]
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
	parse.polygon = (qa, pu, puzzle) => {
		const list = pu[qa].polygon;
		const {point2RC} = PenpaTools;
		list.forEach(line => {
			let points = line.map(point2RC);
			let ctx = new FakeContext();
			set_line_style(ctx, 80);
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
		 		fill:   Color.BLACK,
		 		'fill-rule': 'evenodd',
				target: 'underlay',
				wayPoints: PenpaTools.reduceWayPoints(points),
			}), 'polygon');
		});
	}
	draw_freeline = (qa, pu, puzzle, feature) => {
		const color = pu[qa + '_col'][feature] || [];
		const list = pu[qa][feature];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new FakeContext();
			// TODO: Implement custom color
			set_line_style(ctx, line.value);
			if(color[line.key]) {
				ctx.strokeStyle = color[line.key];
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
		drawXmarks(list, puzzle);
	}
	parse.freeline = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freeline');
	}
	parse.freelineE = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freelineE');
	}
	draw_line = (qa, pu, puzzle, line) => {
		const list = pu[qa][line];
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
		drawXmarks(list, puzzle);
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

	parse.cage = (qa, pu, puzzle) => {
		const list = pu[qa].cage;
		const {RC2k} = PenpaTools;
		let wpLines = PenpaTools.penpaLines2WaypointLines(list);
		const cages = pu[qa].killercages || [];
		// Filter out cage lines which are on killer cages.
		wpLines = wpLines.filter(line => {
			//if (line.value === 7 || line.value === 16) return true;
			if (line.value === 16) return true; // always keep solid cage lines
			let k1 = RC2k(line.wayPoints[0]);
			let k2 = RC2k(line.wayPoints[1]);
			let ndx1 = cages.findIndex(c => c.includes(k1));
			let ndx2 = cages.findIndex(c => c.includes(k2));
			if (ndx1 !== -1 && ndx2 !== -1 && ndx1 === ndx2)
				return false;
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
			set_line_style(ctx, line.value);
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				target: 'cages'
			}), 'cage line');
		});
	}
	parse.deletelineE = (qa, pu, puzzle) => {
		const list = pu[qa].deletelineE;
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.value !== 1) return;
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts(), {
			 	wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				//d: 'M0 0',
				color: '#FFFFFF',
				thickness: 3.99,
				target: 'cell-grids'
			}), 'deletelineE');
		});
	}

	parse.surface = (qa, pu, puzzle) => {
		const color = pu[qa + '_col'].surface || [];
		const list = pu[qa].surface;
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
			if(color[surface.key]) {
				ctx.fillStyle = color[surface.key];
				ctx.strokeStyle = color[surface.key];
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

	class FakeDoc {
		constructor() {
			//this.ids = {}
		}
		getElementById(id) {
			let elem = this[id];
			if (!elem) {
				elem = {
					value: '',
					style: {
						display: 'none'
					},						
				}
				this[id] = elem;
			}
			return elem;
		}
		querySelector(selector) {
			return undefined;
		}
	}

	const parsePuzzLink = (urlstring) => {
		doc.nb_space1 = 0;
		doc.nb_space2 = 0;
		doc.nb_space3 = 0;
		doc.nb_space4 = 0;		

		let fakedoc = new FakeDoc();
		const general = new PenpaGeneral(fakedoc, UserSettings);
		general.decode_puzzlink(urlstring);

		let pu = general.get_pu();
		return pu;
	}
	
	const parsePuzzleUrl = urlstring => {
		doc.nb_space1 = 0;
		doc.nb_space2 = 0;
		doc.nb_space3 = 0;
		doc.nb_space4 = 0;

        if (urlstring.indexOf("/penpa-edit/") !== -1) {
			let param = urlstring.substring(urlstring.indexOf('&') + 1);

			// Inject fake document;
			PenpaPuzzle.document = new FakeDoc();			
			let pu =  parsePenpaPuzzle(param);
			
			return convertPuzzle(pu, doc);
		}
		else if (urlstring.match(/\/puzz.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p\.html\?/)) {

			let pu = parsePuzzLink(urlstring);

			doc.nb_size1 = pu.nx;
			doc.nb_size2 = pu.ny;
			doc.cols0 = doc.nb_size1;
			doc.rows0 = doc.nb_size2;
			doc.cols = doc.cols0 + 4;
			doc.rows = doc.rows0 + 4;	
	
			return convertPuzzle(pu);			
		}
	}

	const parsePenpaPuzzle = urlParam => {
		// let puzzle = {id: `penpa${md5Digest(fpuzzleRaw)}`};
		if (urlParam.indexOf('?') !== -1)
			[urlParam] = urlParam.split('?', 1);

		let param = urlParam.split('&');
        let paramArray = [];

        // Decompose address into elements
        for (var i = 0; i < param.length; i++) {
            let paramItem = param[i].split('=');
			if (paramItem[0].length > 10) paramItem.unshift('p');
            paramArray[paramItem[0]] = paramItem[1];
        }

		// Decrypt P
        var rtext = decrypt_data(paramArray.p);
        rtext = rtext.split("\n");
        rtext[0] = rtext[0].split("zO").join("null");
        rtext[1] = rtext[1].split("zO").join("null");
        if (!isNaN(rtext[0][0])) {
            loadver1(paramArray, rtext)
            return;
        }

        // load default settings
        var rtext_para = rtext[0].split(',');
        //changetype();
		UserSettings.gridtype = doc.gridtype;
		doc.nb_size1 = parseInt(rtext_para[1]);
		doc.nb_size2 = parseInt(rtext_para[2]);
        doc.cols0 = doc.nb_size1;
        doc.rows0 = doc.nb_size2;

		doc.cols = doc.cols0 + 4;
		doc.rows = doc.rows0 + 4;
        UserSettings.displaysize = parseInt(rtext_para[3]);

        var parsedSpaces = JSON.parse(rtext[1]);
		doc.nb_space1 = parsedSpaces[0];
		doc.nb_space2 = parsedSpaces[1];
		doc.nb_space3 = parsedSpaces[2];
		doc.nb_space4 = parsedSpaces[3];
        doc.nb_sudoku1 = (rtext_para[11] && rtext_para[11] == "1");
        doc.nb_sudoku2 = (rtext_para[12] && rtext_para[12] == "1");
        doc.nb_sudoku3 = (rtext_para[13] && rtext_para[13] == "1");
        doc.nb_sudoku4 = (rtext_para[14] && rtext_para[14] == "1");
        if (rtext_para[15]) {
            let ptitle = rtext_para[15].replace(/%2C/g, ',');
            ptitle = ptitle.replace(/^Title\:\s/, '');
            if (ptitle !== "Title: ") {
                doc.title = ptitle;
                // doc.saveinfotitle = ptitle;
            }
        }
        if (rtext_para[16]) {
            let pauthor = rtext_para[16].replace(/%2C/g, ',')
            pauthor = pauthor.replace(/^Author\:\s/, '');
            if (pauthor != "") {
                doc.author = pauthor;
                // doc.saveinfoauthor = pauthor;
            }
        }
        if (rtext_para[17] && rtext_para[17] !== "") {
            // doc.puzzlesourcelink = rtext_para[17];
            //doc.puzzlesource = "Source";
            doc.sourcelink = rtext_para[17];
        }

        let pu = make_class(rtext_para[0]);
		if (!pu) {
			throw {penpa: `Grid type '${rtext_para[0]}' is not supported. Only square cells are allowed.`}
		}

        if (rtext_para[18] && rtext_para[18] !== "") {
            // document.getElementById("puzzlerules").classList.add("rules-present");
            pu.rules = rtext_para[18].replace(/%2C/g, ',').replace(/%2D/g, '\n').replace(/%2E/g, '&').replace(/%2F/g, '=');
            doc.rules = pu.rules;
        }

        // Border button status
        if (rtext_para[19]) {
            // to address mixed versions where the stored value was ON and OFF/ "1" and "2"
            if (rtext_para[19] === "ON" || rtext_para[19] === "1") {
                UserSettings.draw_edges = true;
            }
        }

        // multisolution status
        if (rtext_para[20] && rtext_para[20] === "true") {
            pu.multisolution = true;
        }

        // version save
        if (rtext[10]) {
            pu.version = JSON.parse(rtext[10]);
        } else {
            pu.version = [0, 0, 0]; // To handle all the old links
        }

        // custom answer check message // Moving earlier to set the value before check_solution is called for first time
        if (rtext[18] && rtext[18] !== "") {
            let custom_message = rtext[18].replace(/%2C/g, ',').replace(/%2D/g, '/n').replace(/%2E/g, '&').replace(/%2F/g, '=');
            if (custom_message != "false") {
                doc.custom_message = custom_message;
            }
        }

        for (var i = 0; i < pu.replace.length; i++) {
            rtext[2] = rtext[2].split(pu.replace[i][1]).join(pu.replace[i][0]);
            rtext[3] = rtext[3].split(pu.replace[i][1]).join(pu.replace[i][0]);
            rtext[4] = rtext[4].split(pu.replace[i][1]).join(pu.replace[i][0]);

            // submode, style settings
            if (rtext[11]) {
                rtext[11] = rtext[11].split(pu.replace[i][1]).join(pu.replace[i][0]);
            }

            // custom colors, only checking for 14 as 14 and 15 will appear together or never
            if (rtext[14]) {
                rtext[14] = rtext[14].split(pu.replace[i][1]).join(pu.replace[i][0]);
                rtext[15] = rtext[15].split(pu.replace[i][1]).join(pu.replace[i][0]);
            }

            // genre tags
            if (rtext[17]) {
                rtext[17] = rtext[17].split(pu.replace[i][1]).join(pu.replace[i][0]);
            }
        }
        rtext[5] = JSON.parse(rtext[5]);
        for (var i = 1; i < rtext[5].length; i++) {
            rtext[5][i] = (rtext[5][i - 1] + rtext[5][i]);
        }

		// Populate and set genre tags
		if (rtext[17]) {
			pu.user_tags = JSON.parse(rtext[17]);
		}


		// mode initialization
		var rtext_mode = rtext[2].split('~');
		pu.mode.grid = JSON.parse(rtext_mode[0]);
		// // pu.mode_set("surface");

        pu.pu_q = JSON.parse(rtext[3]);
        // pu.pu_a = JSON.parse(rtext[4] || '{}');
        if (!pu.pu_q.polygon) {
            pu.pu_q.polygon = [];
        }


		// custom color
		if (rtext[13]) {
			let parsedValue = JSON.parse(rtext[13]);
			if (parsedValue === "true" || parsedValue === 1) {
				doc.custom_color_opt = 2;
			}
		}

		if (rtext[14]) {
            pu.pu_q_col = JSON.parse(rtext[14]);
            //pu.pu_a_col = JSON.parse(rtext[15]);
            if (!pu.pu_q_col.polygon) {
                pu.pu_q_col.polygon = [];
            }
            // if (!pu.pu_a_col.polygon) {
            //     pu.pu_a_col.polygon = [];
            // }
		}

		pu.centerlist = rtext[5];

		// Decrypt a
		if (paramArray.a) {
			var atext = decrypt_data(paramArray.a);
			if (pu.multisolution) {
				pu.solution = JSON.parse(atext);
			} else {
				pu.solution = atext;
			}
			// set_solvemodetitle();
		}
		// if (rtext[7]) {
			// set the answer check settings
			// var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
			// var answersetting = JSON.parse(rtext[7]);
			// for (var i = 0; i < settingstatus.length; i++) {
			//     settingstatus[i].checked = answersetting[settingstatus[i].id];
			// }
		// }
		// if (rtext[9] && rtext[9].indexOf("comp") !== -1) { // Competitive mode
		//     set_contestmode();
		// }

		pu.create_point();
		return pu;
	}

	function convertPuzzle(pu) {
		// FIXME
		doc.point = pu.point;
		PenpaTools.doc = doc;

		let puzzle = {id: `penpa_unknown`};

		let fpuzzle = {}

		fpuzzle.centerlist = pu.centerlist;

        fpuzzle.grid = [];
        // const rows = parseInt(doc.cols); //6
        // const cols = parseInt(doc.rows); //6
        // const sp_top = parseInt(doc.nb_space1); //1
        // const sp_bottom = parseInt(doc.nb_space2); //0
        // const sp_left = parseInt(doc.nb_space3); //2
        // const sp_right = parseInt(doc.nb_space4); //0

		getMinMaxRC = function(list = []) {
			const {point2cell} = PenpaTools;
			const rcs = [].concat(list.map(point2cell)),
						rows = rcs.map(([r, c]) => r),
						cols = rcs.map(([r, c]) => c);
			return [
				Math.min(...rows), Math.min(...cols),
				Math.max(...rows), Math.max(...cols),
			];
		};

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

		// parseMetaData(fpuzzle, puzzle);
		[...layerOrder, ...Object.keys(pu.pu_q).filter(feature => !layerOrder.includes(feature))]
			.filter(feature => pu.pu_q[feature] !== undefined)
			.forEach(feature => {
				if(typeof parse[feature] !== 'function') return loadPuzzle.logUnsupported ? console.error('Unsupported feature:', feature, pu.pu_q[feature]) : null;
				parse[feature]('pu_q', pu, puzzle, feature);
			});

		// [...layerOrder, ...Object.keys(pu.pu_a).filter(feature => !layerOrder.includes(feature))]
		// 	.filter(feature => pu.pu_a[feature] !== undefined)
		// 	.forEach(feature => {
		// 		if(typeof parse[feature] !== 'function') return loadPuzzle.logUnsupported ? console.error('Unsupported feature:', feature, pu.pu_q[feature]) : null;
		// 		parse[feature]('pu_a', pu, puzzle, feature);
		// 	});

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
			// Sneeky text substute to supress anti-knight rules, which would otherwise apply to whole board
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
						part.fontSize = round1(part.fontSize-4); // Fix to compensate for fontSize hack in App.convertPuzzle
					}
				});
			}
		});

		// Fix to compensate for fontSize hack in App.convertPuzzle
		[].concat(puzzle.underlays || [], puzzle.overlays || []).forEach(part => { if(part.fontSize !== undefined) part.fontSize += 4; });

		applyDefaultMeta(doc, puzzle, 'title', loadPuzzle.getDefaultTitle);
		applyDefaultMeta(doc, puzzle, 'author', loadPuzzle.getDefaultAuthor);
		applyDefaultMeta(doc, puzzle, 'rules', loadPuzzle.getDefaultRules);

		// Add solution
		if (pu.solution) {
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

		// console.log(puzzle);
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