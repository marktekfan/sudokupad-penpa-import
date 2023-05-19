const PenpaDecoder = (() => {
	'use strict';	
    function _constructor() {
    }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	C.flags = {
		thickLines: true,
		expandGrid: true,
		doubleLayer: true,
		useClipPath: false,
		debug: 0 || document.location.host.startsWith('127.0.0.1'),
	};
	C.isDoubleLayer = (ctx) => (C.flags.doubleLayer || 0) && !PenpaTools.ColorIsTransparent(ctx.fillStyle) && !PenpaTools.ColorIsOpaque(ctx.fillStyle);
	
	C.ParseUrlSettings = () => {
		[...new URLSearchParams(document.location.search)].forEach(([key, val]) => {
			//if(key.match(/^setting-/)) {
				let settingName = key.replace(/^setting-/, '');
				let settingValueTrue = ['true', 't', '1', ''].includes(val.toLowerCase());
				let settingValueFalse = ['false', 'f', '0'].includes(val.toLowerCase());
				C.flags[settingName] = settingValueTrue ? true : (settingValueFalse ? false : val);
			//}
		});
	}

	let _rnd = 0; // static random seed

	const rePenpaUrl = /\/penpa-edit\//i;
	const rePuzzlinkUrl = /\/puzz\.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/;

	class FakeDoc {
		constructor() { 
			this._elem = {};
		}
		getElementById(id) {
			let elem = this._elem[id];
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
					getElementsByClassName: c => Object.keys(this._elem).filter(id => Object.keys(this._elem[id].classList.classes).includes(c)).map(id => this._elem[id]),
					addEventListener: e => {},
				}
				this._elem[id] = elem;
			}
			if (typeof elem.value !== 'string') {
				elem.value = elem.value.toString();
			}
			return elem;
		}
		querySelectorAll(selector) {
			return [];
		}
		querySelector(selector) {
			return undefined;
		}
		getValues() {
			let doc = {};
			Object.entries(this._elem).forEach(([id, elem]) => {
				if(elem.checked !== undefined) {
					doc[id] = elem.checked;
				}
				else if(elem.value !== undefined) {
					doc[id] = elem.value.toString();
				}
			});
			return doc;
		}
	}

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
		if (PenpaDecoder.flags.debug && type) part.penpa = type;
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

	function getGiven(pu, pos) {
		let given = null;
		if (pu.centerlist.includes(Number(pos))) {
			const {number} = pu.pu_q;
			const num = number[pos];
			if (num && num[1] == 1) { //Black
				if (['1', '2', '4', '10'].includes(num[2]) && num[0].toString().length === 1) { //Normal, Arrow, Tapa or Big single digit
					given = num[0];
				}
				else if (num[2] === '7') { //Sudoku number
					let count = num[0].reduce((n, acc) => n + acc, 0);
					if (count === 1) {
						let idx = num[0].findIndex(n => n === 1);
						given = (idx + 1).toString();
					}
				}
			}
		}
		return given;
	}

	function addGivens(pu, puzzle) {
		const {number} = pu.pu_q;
		const {point2cell} = PenpaTools;
		for (let pos in number) {
			let given = getGiven(pu, pos);
			if (given !== null) {
				let [r, c] = point2cell(pos);
				let cell = puzzle.cells[r][c];
				cell.value = given;
				cell.given = true;
				number[pos].role = 'given'; // Exclude from rendering
			}
		}
	}

	const metaTagsWithoutCells = [
		// 'title',
		// 'author',
		// 'rules',
		// 'solution',
		'foglight',
		'msgcorrect',
		'msgincorrect',
		'msgvalid',
		'msginvalid',
		'msgunknown',
	];
	const reMetaTagsStripCells = new RegExp(`^(${metaTagsWithoutCells.join('|')}):\\s*([\\s\\S]+)`, 'im');

	function addCageMetadata(pu, puzzle) {
		const {numberS, killercages} = pu.pu_q;
		Object.keys(numberS).forEach(pos => {
			let matches = numberS[pos][0].trim().match(reMetaTagsStripCells);
			if (matches) {
				applyDefaultMeta(pu, puzzle, matches[1], matches[2]);
				delete numberS[pos];
				// check for obsolete killer cages
				let killerCell = PenpaTools.point2centerPoint(pos);
				for (let i = 0; i < killercages.length; i++) {
					if (killercages[i].length === 1 && killercages[i].includes(killerCell)) {
						killercages[i].length = 0;
					}					
				}

			}
		});
	}

	function addSudokuRegions(pu, puzzle, squares, regions, uniqueRowsCols) {
		const {matrix2point, point2cell} = PenpaTools;
		let enableConflictChecker = false;

		if (['square', 'sudoku'].includes(pu.gridtype)) {
			let complete = regions || squares.every(sq => Object.keys(sq.regions).length === sq.size && Object.keys(sq.regions).every(reg => sq.regions[reg].length === sq.size));
			if(complete && squares.length === 1) {
				enableConflictChecker = true;

				regions = regions || squares[0].regions;
				puzzle.regions = [];

				Object.keys(regions).forEach(reg => {
					let region = regions[reg].map(matrix2point).map(point2cell);
					puzzleAdd(puzzle, 'regions', region);
				});
			}
		}
		if (!uniqueRowsCols && !enableConflictChecker) {
			puzzle.settings['conflictchecker'] = 0;
		}
	}

	function getSolutionInfo(pu) {
		const {point2matrix} = PenpaTools;
		// const {width, height} = doc;
		let solutionPoints = [];
		['surface'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let point = s;
				solutionPoints.push(Number(point));
			});
		});
		['loopline'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [p1, p2, val] = s.split(',');
				[p1, p2].forEach(point => {
					solutionPoints.push(Number(point));
				})
			});
		});
		['number'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [point, val = '?'] = s.split(',');
				solutionPoints.push(Number(point));
			});
		});
		
		let uniqueRowsCols = false;
		if (solutionPoints.length !== 0) {
			const {top, left, bottom, right, height, width} = PenpaTools.getBoundsRC(solutionPoints, point2matrix);
				
			let sol = Array(height * width).fill('?');
			['number'].forEach(constraint => {
				let solution = getPuSolution(pu, constraint) || [];
				solution.forEach(s => {
					let [point, val = '?'] = s.split(',');
					let [r, c] = point2matrix(point);	
					let pos = (r - top) * width + (c - left);
					if (pos >= 0 && pos < sol.length) {
						sol[pos] = val;
					}
				});
			});

			let set = new Set();
			(() => {
				// Check rows
				for (let r = 0; r < height; r++) {
					set.clear();
					for (let c = 0; c < width; c++) {
						let n = sol[r * width + c];
						if (!['?', '.'].includes(n)) {
							if (set.has(n)) {
								uniqueRowsCols = false;
								return;
							}
							set.add(n);
							uniqueRowsCols = true;
						}
					}
				}
				// Check columns
				for (let c = 0; c < width; c++) {
					set.clear();
					for (let r = 0; r < height; r++) {
						let n = sol[r * width + c];
						if (!['?', '.'].includes(n)) {
							if (set.has(n)) {
								uniqueRowsCols = false;
								return;
							}
							set.add(n);
							uniqueRowsCols = true;
						}
					}
				}
			})();
		}
		return {solutionPoints, uniqueRowsCols};
	}

	function getPuSolution(pu, constraint = 'number') {
		if (!pu.solution) return null;

		let solution = null;
		if (!pu.multisolution) {
			// 0 = shading
            // 1 = Line / FreeLine
            // 2 = Edge / FreeEdge
            // 3 = Wall
            // 4 = Number
            // 5 = Symbol
			let constraintMap = {
				'surface': 0,
				'loopline': 1,
				'loopedge': 2,
				'wall': 3,
				'number': 4,
			};
			let stext = JSON.parse(pu.solution);
			solution = stext[constraintMap[constraint]];
		}
		else {
            var sol_count = -1; // as list indexing starts at 0
            // loop through and check which 'OR' settings are selected
    		['surface', 'number', 'loopline', 'loopedge', 'wall', 'square', 'circle', 'tri', 'arrow', 'math', 'battleship', 'tent', 'star', 'akari', 'mine']
			.forEach(sol_or => {
				// Get checkbox value
				if (pu._document['sol_or_' + sol_or] === true) {
					sol_count++;
                    if (sol_or === constraint) {
						solution = pu.solution[sol_count];
					}
				}
			});
		}
		return solution;
	}

	// Add puzzle solution
	function addSolution(pu, puzzle, doc) {
		const {point2cell} = PenpaTools;
		const {width, height} = doc;
		let sol = Array(height * width).fill('?');
		['surface'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let point = s;
				let [r, c] = point2cell(point);
				let pos = r * width + c;
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = '.';
				}
			});
		});
		['loopline'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [p1, p2, val] = s.split(',');
				[p1, p2].forEach(point => {
					let [r, c] = point2cell(point);
					let pos = r * width + c;
					if (pos >= 0 && pos < sol.length) {
						sol[pos] = '.';
					}
				})
			});
		});
		['number'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [point, val = '?'] = s.split(',');
				let [r, c] = point2cell(point);	
				let pos = r * width + c;
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = val;
				}
			});
		});

		// Any solution digits found?
		if (sol.some(n => !'?.'.includes(n))) {

			// Replace ? or . with givens
			const {number} = pu.pu_q;
			for (let pos in number) {
				let given = getGiven(pu, pos);
				if (given !== null) {
					let [r, c] = point2cell(pos);
					let solpos = r * width + c;
					if (solpos >= 0 && solpos < sol.length) {
						if ('?.'.includes(sol[solpos])) {
							sol[solpos] = given;
						}
					}
				}
			}

			let solString = sol.map(n => n.length !== 1 ? '?' : n.toLowerCase()).join('');
			puzzleAdd(puzzle, 'cages', {value: `solution: ${solString}`}, 'solution');
		}
	}

	function hideGridLines(pu, puzzle, doc) {
		const {point2matrix, matrix2point, getBoundsRC} = PenpaTools;
		const {centerlist} = pu;

		const {top, left, bottom, right, height, width} = getBoundsRC(centerlist, point2matrix);
		// Create 'outside cell mask' only when cells are removed
		if (centerlist.length === width * height) {
			return;
		}

		// Mask off non-grid grid lines
		let maskedCells = [];
		for (let r = top; r <= bottom; r++) {
			for (let c = left; c <= right; c++) {
				let p = matrix2point(r, c);
				if(!centerlist.includes(p)) {
					maskedCells.push(p);
				}
			}
		}

		let {deletelineE} = pu.pu_q;

		for(let c of maskedCells) {
			const [y, x] = point2matrix(c);
			let hasleft = maskedCells.includes(pu.point[c].adjacent[1]) || x === left;
			let hasright = maskedCells.includes(pu.point[c].adjacent[2]) || x === right;
			let hastop = maskedCells.includes(pu.point[c].adjacent[0]) || y === top;
			let hasbottom = maskedCells.includes(pu.point[c].adjacent[3]) || y === bottom;

			if (hastop) {
				const key = matrix2point(y - 1, x - 1, 1) + ',' + matrix2point(y - 1, x, 1);
				deletelineE[key] = 1;
			}
			if (hasleft) {
				const key = matrix2point(y - 1, x - 1, 1) + ',' + matrix2point(y, x - 1, 1);
				deletelineE[key] = 1;
			}
			if (hasright) {
				const key = matrix2point(y - 1, x, 1) + ',' + matrix2point(y, x, 1);
				deletelineE[key] = 1;
			}
			if (hasbottom) {
				const key = matrix2point(y, x - 1, 1) + ',' + matrix2point(y, x, 1);
				deletelineE[key] = 1;
			}
		}

		doc.hasCellMask = true;
	}

	function drawBoardLattice(pu, puzzle, doc) {
		const {point2RC} = PenpaTools;
		// Dotted grid lines
		if (pu.mode.grid[0] === '2') {
			puzzle.settings['dashedgrid'] = 1;
		}
		// No grid lines
		if (pu.mode.grid[0] === '3') {
			puzzle.settings['nogrid'] = 1; // not (yet) implemented
		}
		// // Grid points
		if (pu.mode.grid[1] === '1') {
			let ctx = new DrawingContext();
			ctx.target = doc.hasCellMask ? 'overlay' : 'cell-grids';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 4;
			ctx.lineCap = 'round';
			var verticelist = [];
			for (let i = 0; i < pu.centerlist.length; i++) {
				for (let j = 0; j < pu.point[pu.centerlist[i]].surround.length; j++) {
					verticelist.push(pu.point[pu.centerlist[i]].surround[j]);
				}
			}
			verticelist = Array.from(new Set(verticelist));
			if (verticelist.length > 0) {
				for (let i = 0; i < verticelist.length; i++) {
					let [y, x] = point2RC(verticelist[i]);
					ctx.moveTo(x, y);
					ctx.lineTo(x, y);
				}
				puzzleAdd(puzzle, 'lines', ctx.toOpts(), 'lattice');
			}
		}
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
			//  backgroundColor: '#cc4440',
			center: PenpaTools.point2RC(doc.center_n),
			width: doc.width_c - 1,
			height: doc.height_c - 1,
			class: 'board-position',
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
		const {point2RC, isBoardCell, ColorSaturate} = PenpaTools;
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
				//ctx.strokeStyle = listCol[surface.key];
			}
			// ctx.fillStyle = '#ff000040'
			if (!pu.centerlist.includes(surface.key)) {
				// ctx.target = 'overlay';
			}
			if (ctx.fillStyle === Color.GREY_DARK_VERY) {
			 	ctx.fillStyle = '#010101'; // Make darker, which will be lightened by SP with alpha 0.5
			 	//ctx.target = 'overlay';
			}
			else {
				ctx.fillStyle = ColorSaturate(ctx.fillStyle);
			}
			const opts = Object.assign(ctx.toOpts(), {
				center: surface.center,
				width: surface.width || 1,
				height: surface.height || 1,
				//backgroundColor: Color[Object.keys(Color)[Math.floor(_rnd = ((_rnd|0) + 1) % 24)]],
			});
            if (PenpaDecoder.isDoubleLayer(ctx)) {
				puzzleAdd(puzzle, 'underlays', opts, 'surface');
			}
			puzzleAdd(puzzle, 'underlays', opts, 'surface');
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
		const {point2cell, point2centerPoint} = PenpaTools;
		Object.keys(list).forEach(key => {
			const number = list[key];
			let ctx = new DrawingContext();
			if (number.role && number.role !== 'killer-sum') {
				return;
			}
			draw.draw_numberS(ctx, number, key);

			if(pu.point[key].type === 4 && (key % 4) === 0) { // top-left cell corner
				if(pu.centerlist.includes(point2centerPoint(key))) { // top-left cell corner
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
		const {point2RC, isBoardCell, doc} = PenpaTools;
		Object.keys(list).forEach(key => {
			const symbol = list[key];
			if (symbol[2] !== layer) return;
			const ctx = new DrawingContext();
            if (key.slice(-1) === 'E') {
                key = key.slice(0, -1);
            }
			let maskedCell = isMaskedCell(pu, key);
			// In front of lines or on an outside/masked cell.
			if (symbol[2] === 2 || maskedCell) {
				ctx.target = 'overlay';
			}
			const [r, c] = point2RC(key);
			draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
		});
	}
	const draw_freeline = (qa, pu, puzzle, feature, target = undefined) => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			if (target) {
				ctx.target = target;
			}
			else if (isMaskedLine(pu, line.keys)) {
				ctx.target = 'overlay';
			}
			set_line_style(ctx, line.value);
			if(line.cc) {
				ctx.strokeStyle = line.cc;
			}
			if (line.value === 30) {
				drawDoubleLine(ctx, line, puzzle);
			}
			else {
				const isCenter = [0, 2, 3].includes(pu.point[line.keys[0]].type);
				if (isCenter && [3, 3 * 0.85].includes(ctx.lineWidth) && ctx.lineDash.length === 0) {
					if (PenpaDecoder.flags.thickLines) {
						ctx.strokeStyle = PenpaTools.ColorApplyAlpha(ctx.strokeStyle);
						ctx.lineWidth = 6;
					}
				}
				puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				}), feature);
			}
		});
		drawXmarks(qa, pu, puzzle, feature);
	}
	parse.freeline = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freeline');
	}
	parse.freelineE = (qa, pu, puzzle) => {
		draw_freeline(qa, pu, puzzle, 'freelineE', 'overlay');
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
			}, feature + ' bulb');
		});
	}
	parse.arrows = (qa, pu, puzzle, feature = 'arrows') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC, doc, round3} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			const target = isMaskedLine(pu, line) ? {target: 'overlay'} : {};
			let points = PenpaTools.reduceWayPoints(line.map(point2RC));
			let commonend = pu.find_common(pu[qa], i, line[line.length - 1], feature);
			points = PenpaTools.shortenLine(points, 0.4, commonend ? 0.1 : 0);
			let color = listCol[i] || '#a1a1a1';
			puzzleAdd(puzzle, 'arrows', Object.assign({
				color: color,
				headLength: 0.3,
				thickness: 5,
				wayPoints: PenpaTools.reduceWayPoints(points)
			}, target), feature);

			const bulbStrokeThickness = 5;
			puzzleAdd(puzzle, 'overlays', Object.assign({
				borderColor: color,
				backgroundColor: '#FFFFFF',
				center: point2RC(line[0]),
				borderSize: bulbStrokeThickness,
				rounded: true,
				width: 0.83, // round3(0.75 + bulbStrokeThickness / 64),
				height: 0.83, // round3(0.75 + bulbStrokeThickness / 64),
			}, target), feature + ' bulb');
		});
	}
	parse.direction = (qa, pu, puzzle, feature = 'direction') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC, doc} = PenpaTools;
		list.forEach((line, i) => {
			if(line.length < 2) return;
			const target = isMaskedLine(pu, line) ? {target: 'overlay'} : {};
			let points = line.map(point2RC);
			let commonend = pu.find_common(pu[qa], i, line[line.length - 1], feature);
			points = PenpaTools.shortenLine(points, 0, commonend ? 0.1 : 0);
			let color = listCol[i] || '#a1a1a1';
			puzzleAdd(puzzle, 'arrows', Object.assign({
				color: color,
				headLength: 0.3,
				thickness: 5,
				wayPoints: PenpaTools.reduceWayPoints(points)
			}, target), feature);
		});
	}
	parse.squareframe = (qa, pu, puzzle, feature = 'squareframe') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		const {point2RC, doc} = PenpaTools;
		list.forEach((line, i) => {
			if (line.length === 0) return;
			const target = isMaskedLine(pu, line) ? {target: 'overlay'} : {};
			let cells = line.map(point2RC);
			let color = listCol[i] || '#CFCFCF';
			puzzleAdd(puzzle, 'lines', Object.assign({
				color: color,
				thickness: 64 * 0.8,
				'stroke-linecap': 'square',
				'stroke-linejoin': 'square',
				wayPoints: PenpaTools.reduceWayPoints(cells),
			}, target), feature);
		});
	}
	parse.polygon = (qa, pu, puzzle, feature = 'polygon') => {
		const {point2RC, ColorIsTransparent, ColorSaturate, getMinMaxRC, round1, round3} = PenpaTools;
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		Object.keys(list).forEach(key => {
			const target = {target: 'underlay'};
			let points = list[key].filter(p => pu.point[p]).map(point2RC);
			if (points.length < 2) return;
			let ctx = new DrawingContext();
			ctx.strokeStyle = listCol[key] || Color.BLACK;
			ctx.fillStyle = listCol[key] || Color.BLACK;
			ctx.fillStyle = ColorSaturate(ctx.fillStyle);
			ctx.lineWidth = 1;

			ctx.push();

			ctx.moveTo(points[0][1], points[0][0]);
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i][1], points[i][0]);
			}
			ctx.fill();

			let wp = ctx.convertPathToWaypoints();
			if (PenpaDecoder.flags.useClipPath && wp && ctx.fillStyle && !ColorIsTransparent(ctx.fillStyle)) {
				ctx.push();
				const [top, left, bottom, right] = getMinMaxRC(wp);
				let centerx = round3((right + left) / 2);
				let centery = round3((bottom + top) / 2);
				let scalex = round3(right - left);
				let scaley = round3(bottom - top);
	
				// Add rect with clippath
				ctx.lineWidth = 0;
				ctx.strokeStyle = Color.TRANSPARENTBLACK;
				let opts = Object.assign(ctx.toOpts('surface'), {
					center: [centery, centerx],
					width: scalex,
					height: scaley,
					// target: ctx.target || 'underlay',
					'clip-path': `polygon(${wp.map(([yy, xx]) => `${round1((xx - left) / scalex * 100)}% ${round1((yy - top) / scaley * 100)}%`).join(',')})`,
				});
				puzzleAdd(puzzle, 'underlays', opts, feature);
			}
			else {
				ctx.pop();
				puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
					'fill-rule': 'nonzero',
					fill: ctx.fillStyle,
					wayPoints: PenpaTools.reduceWayPoints(points),
				}, target), feature);
			}
		});
	}
	parse.frame = (qa, pu, puzzle) => {
		const list = pu.frame || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			ctx.target = 'overlay';
			set_line_style(ctx, line.value);
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
			}), 'frame');
		});
	}
	const draw_line = (qa, pu, puzzle, feature, target = undefined) => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature] || [];
		let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			if (target) {
				ctx.target = target;
			}				
			else if (isMaskedLine(pu, line.keys)) {
				ctx.target = 'overlay';
			}
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
				const isCenter = [0, 2, 3].includes(pu.point[line.keys[0]].type);
				if (isCenter && [3, 3 * 0.85].includes(ctx.lineWidth) && ctx.lineDash.length === 0) {
					if (PenpaDecoder.flags.thickLines) {
						ctx.strokeStyle = PenpaTools.ColorApplyAlpha(ctx.strokeStyle);
						ctx.lineWidth = 6;
					}
				}
				puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				}), feature);
			}
		});
		drawXmarks(qa, pu, puzzle, feature);
	}
	parse.line = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'line');
	}
	parse.lineE = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'lineE', 'overlay');
	}
	parse.wall = (qa, pu, puzzle) => {
		draw_line(qa, pu, puzzle, 'wall');
	}
	parse.cage = (qa, pu, puzzle, feature = 'cage') => {
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature];
		let wpLines = PenpaTools.penpaLines2WaypointLines(list, listCol);
		const cages = pu[qa].killercages || [];
		const {point2centerPoint} = PenpaTools;
		// Filter out cage lines which are on killer cages.
		wpLines = wpLines.filter(line => {
			let p1 = line.keys[0];
			let p2 = line.keys[1];
			let ndx1 = cages.findIndex(c => c.includes(point2centerPoint(p1)));
			let ndx2 = cages.findIndex(c => c.includes(point2centerPoint(p2)));
			if (ndx1 !== -1 && ndx1 === ndx2) {
				 // Solid cage lines should be drawn by lines, and make cage invisible
				if ([7, 107, 16, 116].includes(line.value)) {
					pu[qa + '_col']['killercages'][ndx1] = Color.TRANSPARENTBLACK;
					return true;
				}
				// Custom color or not black dash
				if (line.cc || line.value !== 10) {
					// Copy color to killercage and filter out individual cage line
					let ctx = new DrawingContext();
					set_line_style(ctx, line.value, line.cc);
					pu[qa + '_col']['killercages'][ndx1] = line.cc || ctx.strokeStyle;
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
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				target: 'cell-grids', // Above cages
			}), feature + ' line');
		});
	}
	parse.killercages = (qa, pu, puzzle, feature = 'killercages') => {
		const list = pu[qa].killercages || [];
		const listCol = pu[qa + '_col'][feature];
		const {point2cell, point2centerPoint, point2matrix, matrix2point} = PenpaTools;
		const {numberS} = pu[qa];
		const sortTopLeftRC = ([r1, c1], [r2, c2]) => r1 === r2 ? c2 - c1 : r2 - r1;
		list.forEach((cage, i) => {
			if (cage.length === 0) return;
			let cagePart = {unique: true};
			cagePart.cells = cage.map(point2cell);
			if (listCol[i]) {
				cagePart.borderColor = listCol[i];
			}

			const labelCell = matrix2point([...cage.map(point2matrix)].sort(sortTopLeftRC).pop());
			for(let k in numberS) {
				if (pu.point[k].type === 4 && (k % 4) === 0) { // Top-left cell corner
					if (labelCell === point2centerPoint(k)) {
						let value = numberS[k];
						if (!isNaN(value[0])) {
							cagePart.value = value[0].trim();
							value.role = 'killer'; // Exclude from rendering
							break;
						}
					}
				}
			}
			puzzleAdd(puzzle, 'cages', cagePart, feature);
		});
	}
	parse.deletelineE = (qa, pu, puzzle, feature = 'deletelineE') => {
		const list = pu[qa][feature] || [];
		const surface = pu[qa].surface;
		const surfaceCol = pu[qa + '_col'].surface || [];
		const darkBackgrounds = [Color.BLACK, Color.BLACK_LIGHT, Color.GREY_DARK_VERY];
		Object.keys(list).forEach(l => {
			let [p1, p2] = PenpaTools.getAdjacentCellsOfELine(pu, l);
			let s1 = surface[p1];
			let s2 = surface[p2];
			if (s1 || s2) {
				let ctx = new DrawingContext();
				set_surface_style(ctx, s1 || s2);
				let fillStyle1 = (s1 && surfaceCol[p1]) || ctx.fillStyle;
				set_surface_style(ctx, s2 || s1);
				let fillStyle2 = (s2 && surfaceCol[p2]) || ctx.fillStyle;
				// Don't remove when not visible due to dark background
				//if (darkBackgrounds.includes(fillStyle1) || darkBackgrounds.includes(fillStyle2)) {
				// if (fillStyle1 ||  fillStyle2) {
				if (s1 !== s2 || fillStyle1 !== fillStyle2) {
					list[l] = 0; // line.value = 0
				}
				else {
					// Pre-calculate line color to make it visually identical to the surface color which has 0.5 alpha in SudokuPad.
					list[l] = PenpaTools.ColorApplyAlpha(PenpaTools.ColorSaturate(fillStyle1));
				}
			}
		});
		let combined = PenpaTools.reducePenpaLines2WaypointLines(list);
		combined.forEach(line => {
			if (line.value === 0) return; // Skip not visible line
			let shortLine = PenpaTools.shortenLine(line.wayPoints, 2/64, 2/64);
			let ctx = new DrawingContext();
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			 	wayPoints: PenpaTools.reduceWayPoints(shortLine),
				color: typeof line.value === 'string' ? line.value : '#FFFFFF',
				 // color: '#FF40A0'
				thickness: 4,
				target: line.value === 2 ? 'overlay' : 'cell-grids',
			}), feature);
		});
	}
	parse.nobulbthermo = (qa, pu, puzzle, feature = 'nobulbthermo') => {
		function find_common(pu, line, endpoint) {
			if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
			if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
			return false;
		}
		const {point2RC, doc} = PenpaTools;
		const list = pu[qa][feature] || [];
		const listCol = pu[qa + '_col'][feature];
		const reduce_straight = 0.32;
		const reduce_diagonal = 0.22;
		list.forEach((line, i) => {
			if (line.length < 2) return;
			const maskedLine = isMaskedLine(pu, line);
			const target = maskedLine ? {target: 'overlay'} : {};
			if (maskedLine) {
				line.forEach(p => doc.maskedCells.push(p));
			}
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
				puzzleAdd(puzzle, 'lines', Object.assign({
					color: color,
					thickness: 21,
					wayPoints: PenpaTools.reduceWayPoints(cells)
				}, target), 'thermo line');
			}
		});
	}
	
	function isMaskedCell(pu, p) {
		const {doc, point2RC, isBoardCell} = PenpaTools;
		if (!doc.hasCellMask) return false;
		p = Number(p);
		if (doc.maskedCells.includes(p)) return true;
		if (pu.centerlist.includes(p)) return false;
		if (isBoardCell(point2RC(p))) return true;
		return false;
	}		
	
	function isMaskedLine(pu, line) {
		const {doc, point2matrix, matrix2point} = PenpaTools;
		if (!doc.hasCellMask || line.length < 2) return false;
		let p = line[0];
		// Must be center line
		if (doc.point[p].type !== 0) return false;
		if (doc.maskedCells.includes(p)) return true;
		let prevMasked = isMaskedCell(pu, p);
		let [y, x] = point2matrix(p);
		for (let i = 1; i < line.length; i++) {
			let pnext = line[i];
			let [y2, x2] = point2matrix(pnext);
			do {
				let dx = x2 - x;
				let dy = y2 - y;
				let stepx = Math.sign(dx);
				let stepy = Math.sign(dy);
				x += stepx;
				y += stepy;
				pnext = matrix2point(y, x);
				if (doc.maskedCells.includes(pnext)) return true;
				let masked = isMaskedCell(pu, pnext);
				if (masked && prevMasked) return true;
				if (masked !== prevMasked) {
					// Diagonal border crossing 
					if (stepx !== 0 && stepy !== 0) return true;
				}
				prevMasked = masked;
			} while (x != x2 || y != y2);
		}
		return false;
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
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints([[y - r, x - r], [y + r, x + r]])
			}), 'x');
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints([[y + r, x - r], [y - r, x + r]])
			}), 'x');
		});
	}
	function drawShortLine(ctx, line, puzzle) {
		let shortLine = PenpaTools.shrinkLine(line.wayPoints, 0.2);
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
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
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints([[p1[0] + rx, p1[1] - ry], [p2[0] + rx, p2[1] - ry]])
		}), 'double line 1');
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints([[p1[0] - rx, p1[1] + ry], [p2[0] - rx, p2[1] + ry]])
		}), 'double line 2');
	}

	const puzzlinkNames = {
		'aho': 'Aho-ni-Narikire', 'amibo': 'Amibo', 'angleloop': 'Angle Loop', 'anglers': 'Anglers', 'antmill': 'Ant Mill', 'aqre': 'Aqre', 'aquarium': 'Aquarium', 'araf': 'Araf',
		'armyants': 'Army Ants', 'arukone': 'Arukone', 'ayeheya': 'ekawayeh', 'balance': 'Balance Loop', 'cave': 'Cave', 'cbanana': 'Choco Banana', 'context': 'Context',
		'crossstitch': 'Crossstitch', 'cts': 'Cross the Streams', 'barns': 'Barns', 'bdblock': 'Border Block', 'bdwalk': 'Building Walk', 'bonsan': 'Bonsan', 'bosanowa': 'Bosanowa',
		'box': 'Box', 'skyscrapers': 'Skyscrapers', 'canal': 'Canal View', 'castle': 'Castle Wall', 'cbblock': 'Combi Block', 'chainedb': 'Chained Block', 'chocona': 'Chocona',
		'coffeemilk':'Coffee Milk', 'cojun': 'Cojun', 'compass': 'Compass', 'coral': 'Coral', 'country': 'Country Road', 'creek': 'Creek', 'curvedata': 'Curve Data', 
		'curvedata-aux': 'Edit shape', 'dbchoco': 'Double Choco', 'detour': 'Detour', 'disloop': 'Disorderly Loop', 'dominion': 'Dominion', 'doppelblock': 'Doppelblock', 
		'dosufuwa': 'Dosun-Fuwari', 'dotchi': 'Dotchi-Loop', 'doubleback': 'Double Back', 'easyasabc': 'Easy as ABC', 'factors': 'Rooms of Factors', 'familyphoto': 'Family Photo', 
		'fillmat': 'Fillmat', 'fillomino': 'Fillomino', 'firefly': 'Hotaru Beam', 'fivecells': 'FiveCells', 'fourcells': 'FourCells', 'geradeweg': 'Geradeweg', 'goishi': 'Goishi', 
		'gokigen': 'Slant', 'haisu': 'Haisu', 'hakoiri': 'Hakoiri-masashi', 'hanare': 'Hanare-gumi', 'hashikake': 'Hashiwokakero', 'hebi': 'Hebi-Ichigo', 'herugolf': 'Herugolf', 
		'heteromino': 'Heteromino', 'heyablock': 'Heyablock', 'heyabon': 'Heya-Bon', 'heyawake': 'Heyawake', 'hinge': 'Hinge', 'hitori': 'Hitori', 'icebarn': 'Icebarn', 'icelom': 'Icelom', 
		'icelom2': 'Icelom 2', 'icewalk': 'Ice Walk', 'ichimaga': 'Ichimaga', 'ichimagam': 'Magnetic Ichimaga', 'ichimagax': 'Crossing Ichimaga', 'interbd': 'International Borders', 
		'juosan': 'Juosan', 'kaero': 'Return Home', 'kaidan': 'Stairwell', 'kakuro': 'Kakuro', 'kakuru': 'Kakuru', 'kazunori': 'Kazunori Room', 'kinkonkan': 'Kin-Kon-Kan', 
		'koburin': 'Koburin', 'kouchoku': 'Kouchoku', 'kramma': 'KaitoRamma', 'kramman': 'New KaitoRamma', 'kropki': 'Kropki', 'kurochute': 'Kurochute', 'kurodoko': 'Kurodoko', 
		'kurotto': 'Kurotto', 'kusabi': 'Kusabi', 'ladders': 'Ladders', 'lapaz': 'La Paz', 'lightshadow': 'Light and Shadow', 'lightup': 'Akari', 'lither': 'Litherslink', 'lits': 'LITS', 
		'lohkous': 'Lohkous', 'lollipops': 'Lollipops', 'lookair': 'Look-Air', 'loopsp': 'Loop Special', 'loute': 'L-route', 'makaro': 'Makaro', 'mashu': 'Masyu', 'maxi': 'Maxi Loop', 
		'meander': 'Meandering Numbers', 'mejilink': 'Mejilink', 'minarism': 'Minarism', 'mines': 'Minesweeper', 'midloop': 'Mid-loop', 'mirrorbk': 'Mirror Block', 'mochikoro': 'Mochikoro', 
		'mochinyoro': 'Mochinyoro', 'moonsun': 'Moon or Sun', 'nagare': 'Nagareru-Loop', 'nagenawa': 'Nagenawa', 'nanro': 'Nanro', 'nawabari': 'Territory', 'nikoji': 'NIKOJI', 
		'nondango': 'Nondango', 'nonogram': 'Nonogram', 'norinori': 'Norinori', 'nothree': 'No Three', 'numlin': 'Numberlink', 'numrope': 'Number Rope', 'nuribou': 'Nuribou', 
		'nurikabe': 'Nurikabe', 'nurimaze': 'Nuri-Maze', 'nurimisaki': 'Nurimisaki', 'nuriuzu': 'Nuri-uzu', 'ovotovata': 'Ovotovata', 'oneroom': 'One Room One Door', 'onsen': 'Onsen-meguri', 
		'paintarea': 'Paintarea', 'parquet': 'Parquet', 'pencils': 'Pencils', 'pentominous': 'Pentominous', 'pentopia': 'Pentopia', 'pipelink': 'Pipelink', 'pipelinkr': 'Pipelink Returns', 
		'putteria': 'Putteria', 'ququ': 'Ququ', 'railpool': 'Rail Pool', 'rassi': 'Rassi Silai', 'rectslider': 'Rectangle-Slider', 'reflect': 'Reflect Link', 'renban': 'Renban-Madoguchi', 
		'ringring': 'Ring-ring', 'ripple': 'Ripple Effect', 'roma': 'Roma', 'roundtrip': 'Round Trip', 'sashigane': 'Sashigane', 'satogaeri': 'Satogaeri', 'scrin': 'Scrin', 
		'shakashaka': 'Shakashaka', 'shikaku': 'Shikaku', 'shimaguni': 'Islands', 'shugaku': 'School Trip', 'shwolf': 'Goats and Wolves', 'simpleloop': 'Simple Loop', 'slalom': 'Slalom', 
		'slither': 'Slitherlink', 'snake': 'Snake', 'snakepit': 'Snake Pit', 'starbattle': 'Star Battle', 'squarejam': 'Square Jam', 'statuepark': 'Statue Park', 'statuepark-aux': 'Edit shape', 
		'stostone': 'Stostone', 'sudoku': 'Sudoku', 'sukoro': 'Sukoro', 'sukororoom': 'Sukoro-room', 'symmarea': 'Symmetry Area', 'tajmahal': 'Taj Mahal', 'takoyaki': 'Takoyaki', 
		'tapa': 'Tapa', 'tapaloop': 'Tapa-Like Loop', 'tasquare': 'Tasquare', 'tatamibari': 'Tatamibari', 'tateyoko': 'Tatebo-Yokobo', 'tawa': 'Tawamurenga', 'tentaisho': 'Tentaisho', 
		'tents': 'Tents', 'tilepaint': 'Tilepaint', 'toichika': 'Toichika', 'toichika2': 'Toichika 2', 'tontti': 'Tonttiraja', 'tren': 'Tren', 'triplace': 'Tri-place', 
		'tslither': 'Touch Slitherlink', 'usotatami': 'Uso-tatami', 'usoone': 'Uso-one', 'view': 'View', 'voxas': 'Voxas', 'vslither': 'Vertex Slitherlink', 'wagiri': 'Wagiri', 
		'walllogic': 'Wall Logic', 'wblink': 'Shirokuro-link', 'yajikazu': 'Yajisan-Kazusan', 'yajilin': 'Yajilin', 'yajilin-regions': 'Regional Yajilin', 'yajisoko': 'Yajisan-Sokoban', 
		'yajitatami': 'Yajitatami', 'yinyang': 'Yin-Yang', 'yosenabe': 'Yosenabe'
	}

	const parsePuzzLink = (url) => {
		let fakedoc = new FakeDoc();
		let penpaGeneral = PenpaGeneral(fakedoc);

		penpaGeneral.decode_puzzlink(url);

		let pu = penpaGeneral.get_pu();
		if (!pu || (pu.user_tags.length === 0 && pu.mode.qa !== 'pu_a'))
			return null;

		let variant = false
		let parts, urldata, type;
		parts = url.split('?');
		urldata = parts[1].split('/');
		if (urldata[1] === 'v:') {
			urldata.splice(1, 1); // Ignore variant rules
			variant = true;
		}	
		type = urldata[0];

		let title = puzzlinkNames[type] || type;		
		let rules = [`${title} rules apply.`] ;
		if (variant) rules.push('This puzzle uses variant rules.');

		let doc = {
			saveinfotitle: title,
			saveinforules: rules.join('\n'),
			saveinfoauthor: `puzz.link`,
			sourcelink: url,
		}
		pu._document = doc;
		return pu;
	}

	const parsePenpaPuzzle = urlstring => {
		let paramMatch = urlstring.match(/[^\?#]+[\?#]([^#]+)/)
		if (!paramMatch)
			return null;
		
		let urlParam = paramMatch[1];

		// Capture global document state
		let doc = new FakeDoc();

		// Create elements to capture solution settings
		['sol_surface', 'sol_number', 'sol_loopline', 'sol_ignoreloopline', 'sol_loopedge', 'sol_ignoreborder', 'sol_wall', 'sol_square', 'sol_circle', 'sol_tri', 'sol_arrow', 'sol_math', 'sol_battleship', 'sol_tent', 'sol_star', 'sol_akari', 'sol_mine']
			.forEach(id => doc.getElementById(id).classList.add('solcheck'));
		['sol_or_surface', 'sol_or_number', 'sol_or_loopline', 'sol_or_loopedge', 'sol_or_wall', 'sol_or_square', 'sol_or_circle', 'sol_or_tri', 'sol_or_arrow', 'sol_or_math', 'sol_or_battleship', 'sol_or_tent', 'sol_or_star', 'sol_or_akari', 'sol_or_mine']
			.forEach(id => doc.getElementById(id).classList.add('solcheck_or'));

		let penpaGeneral = PenpaGeneral(doc);

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
		pu._document = doc.getValues();
		return pu;
	}

	C.isPenpaUrl = (url) => url.match(rePenpaUrl) || url.match(rePuzzlinkUrl);

	C.loadPenpaPuzzle = function (urlstring) {
		let pu;
        if (urlstring.match(rePenpaUrl)) {
			pu = parsePenpaPuzzle(urlstring);
		}
		else if (urlstring.match(rePuzzlinkUrl)) {
			pu = parsePuzzLink(urlstring);
		}
		return pu;
	}

	function convertFeature2Line(pu, fromFeature, lineFeature) {
		const {point2matrix} = PenpaTools;
		const fromline = pu.pu_q[fromFeature];
		const line = pu.pu_q[lineFeature];
		const fromlineCol = pu.pu_q_col[fromFeature] || {};
		const lineCol = pu.pu_q_col[lineFeature] || {};

		Object.keys(fromline).forEach(key => {
			const p = key.split(',').map(Number);
			const m1 = point2matrix(p[0]);
			const m2 = point2matrix(p[1]);
			const color = fromlineCol[key];
			// Replace horizontal freeline with lines
			if (m1[0] === m2[0]) {
				for (let p1 = p[0]; p1 < p[1]; p1 += 1) {
					let p2 = p1 + 1; // next column
					let newkey = p1 + ',' + p2;
					if (line[newkey] === undefined) { // freeline is always under line
						line[newkey] = fromline[key];
						if (color) lineCol[newkey] = color; // Copy custom color
					}
				}				
				delete fromline[key];
				delete fromlineCol[key];
			}
			// Replace vertical freeline with lines
			else if (m1[1] === m2[1]) {
				for (let p1 = p[0]; p1 < p[1]; p1 += pu.nx0) {
					let p2 = p1 + pu.nx0; // next row
					let newkey = p1 + ',' + p2;
					if (line[newkey] === undefined) { // freeline is always under line
						line[newkey] = fromline[key];
						if (color) lineCol[newkey] = color;
					}
				}				
				delete fromline[key];
				delete fromlineCol[key];
			}
			// Replace 45 degree freeline with lines
			else if (Math.abs(m1[0] - m2[0]) === Math.abs(m1[1] - m2[1])) {
				let dir = Math.sign(m2[1] - m1[1]);
				for (let p1 = p[0]; p1 < p[1]; p1 += pu.nx0 + dir) {
					let p2 = p1 + pu.nx0 + dir; // next row
					let newkey = p1 + ',' + p2;
					if (line[newkey] === undefined) { // freeline is always under line
						line[newkey] = fromline[key];
						if (color) lineCol[newkey] = color;
					}
				}				
				delete fromline[key];
				delete fromlineCol[key];
			}
			// All other angles can be copied directly
			// because they will never overlap with a line(E)
			else {
				line[key] = fromline[key];
				if (color) lineCol[key] = color; // Copy custom color
				delete fromline[key];
				delete fromlineCol[key];
			}
		});
	}

	const addToCenterlist = function(pu, p) {
		if (pu.centerlist.includes(p)) return;
		pu.centerlist.push(p);
		pu.centerlist.sort();
		for (let i = 0; i < 4; i++) {
			let k = Math.min(pu.point[p].surround[i], pu.point[p].surround[(i + 1) % 4]) + ',' + Math.max(pu.point[p].surround[i], pu.point[p].surround[(i + 1) % 4]);
			pu.pu_q.deletelineE[k] = 1;
		}
	}

	function expandGridForFillableOutsideFeatures(pu) {
		function getLineCenterPoints(pu, feature) {
			let points = [];
			let lines = pu.pu_q[feature];
			Object.keys(lines).forEach(key => {
				let value = lines[key];
				if ([2, 3, 5, 6, 8, 9].includes(value)) {
					let [p1, p2] = key.split(',').map(Number);
					if (pu.point[p1].type === 0 && pu.point[p2].type === 0) {
						points.push(p1);
						points.push(p2);
					}
				}
			});	
			return points;		
		}
		let clBounds = PenpaTools.getMinMaxRC(pu.centerlist, PenpaTools.point2matrix);
		let bounds = [];
		bounds.push(PenpaTools.getMinMaxRC((pu.pu_q.thermo || []).flatMap(p => p), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC((pu.pu_q.killercages || []).flatMap(p => p), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'line'), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'freeline'), PenpaTools.point2matrix));
		
		// bounds for all fillable clues
		let top = Math.min(...bounds.map(b => b[0]));
		let left = Math.min(...bounds.map(b => b[1]));
		let bottom = Math.max(...bounds.map(b => b[2]));
		let right = Math.max(...bounds.map(b => b[3]));

		if (top < clBounds[0] || left < clBounds[1]) {
			addToCenterlist(pu, PenpaTools.matrix2point(top, left));
		}
		if (bottom > clBounds[2] || right > clBounds[3]) {
			addToCenterlist(pu, PenpaTools.matrix2point(bottom, right));
		}
	}

	function expandGridForWideOutsideClues(pu) {
		let clBounds = PenpaTools.getMinMaxRC(pu.centerlist, PenpaTools.point2matrix);
		let bounds = [];
		bounds.push(PenpaTools.getMinMaxRC(Object.keys(pu.pu_q.number), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC(Object.keys(pu.pu_q.numberS), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC(Object.keys(pu.pu_q.symbol), PenpaTools.point2matrix));
		bounds.push(PenpaTools.getMinMaxRC(Object.keys(pu.pu_q.surface).filter(k => pu.pu_q.surface[k] > 0), PenpaTools.point2matrix));
		
		// bounds for all clues
		let top = Math.min(...bounds.map(b => b[0]));
		let left = Math.min(...bounds.map(b => b[1]));
		let bottom = Math.max(...bounds.map(b => b[2]));
		let right = Math.max(...bounds.map(b => b[3]));
		
		if (top < clBounds[0] - 1 || left < clBounds[1] - 1) {
			addToCenterlist(pu, PenpaTools.matrix2point(top, left));
		}
		if (bottom > clBounds[2] + 1 || right > clBounds[3] + 1) {
			addToCenterlist(pu, PenpaTools.matrix2point(bottom, right));
		}
	}

	function cleanupPu(pu) {
		pu.frame = pu.frame || {};
		if (!pu.pu_q_col || pu._document['custom_color_opt'] !== '2') {
			pu.pu_q_col = {};
			pu.pu_q_col.surface = {};
			pu.pu_q_col.number = {};
			pu.pu_q_col.numberS = {};
			pu.pu_q_col.symbol = {};
			pu.pu_q_col.freeline = {};
			pu.pu_q_col.freelineE = {};
			pu.pu_q_col.thermo = [];
			pu.pu_q_col.arrows = [];
			pu.pu_q_col.direction = [];
			pu.pu_q_col.squareframe = [];
			pu.pu_q_col.polygon = [];
			pu.pu_q_col.line = {};
			pu.pu_q_col.lineE = {};
			pu.pu_q_col.wall = {};
			pu.pu_q_col.cage = {};
			pu.pu_q_col.deletelineE = {};
			pu.pu_q_col.killercages = [];
			pu.pu_q_col.nobulbthermo = [];
		}

		// Convert custom colors to hex
		for(let i in pu.pu_q_col) {
			let list = pu.pu_q_col[i];
			for(let i in list) {
				if (typeof list[i] === 'string') {
					list[i] = PenpaTools.ColorRgba2Hex(list[i]);
				}
				else {
					if (list[i] === null || typeof list[i] === 'number' || Array.isArray(list[i])) {
						delete list[i]; // remove invalid custom color
					}
				}
			}
		}

		// Make lines with custom colors have consistent style.
		// This allows them to be concatenated.
		['line', 'lineE', 'freeline', 'freelineE', 'wall'].forEach(feature => {
			let col = pu.pu_q_col[feature];
			let list = pu.pu_q[feature];
			for(let k in list) {
				if (col[k]) {
					if ([2, 3, 5, 8, 9].includes(list[k])) {
						list[k] = 5; // 5 is arbitrary but consistent style
					}
				}
			}
		});

		// Make sure to use all uppercase colors, this is important for Sudokupad to create solid colors.
		Object.keys(Color).forEach(c => {
			Color[c] = Color[c].trim();
			if (Color[c][0] === '#') Color[c] = Color[c].toUpperCase();
		});

		// Delete features with invalid points
		['number', 'numberS', 'symbol', 'surface'].forEach(feature => {
			Object.keys(pu.pu_q[feature]).forEach(p => {
				if (!pu.point[p]) {
					delete pu.pu_q[feature][p];
				}
			});
		});
		['lineE', 'freelineE', 'deletelineE'].forEach(feature => {
			Object.keys(pu.pu_q[feature]).forEach(p => {
				if (pu.pu_q[feature][p] == 98) { // X-mark on edge
					if (!pu.point[p] || ![2, 3].includes(pu.point[p].type)) {
						delete pu.pu_q[feature][p];
					}
				}
				else {
					let [p1, p2] = p.split(',');
					if (!pu.point[p1] || pu.point[p1].type !== 1) {
						delete pu.pu_q[feature][p];
					}
					else if (!pu.point[p2] || pu.point[p2].type !== 1) {
						delete pu.pu_q[feature][p];
					}
				}
			});
		});
		['line', 'freeline'].forEach(feature => {
			Object.keys(pu.pu_q[feature]).forEach(p => {
				if (pu.pu_q[feature][p] == 98) { // X-mark on edge
					if (pu.point[p] && [2, 3].includes(pu.point[p].type)) {
						 // Move to lineE (because it's always on an edge) but don't overwrite
						if (!pu.pu_q['lineE'][p]) {
							pu.pu_q['lineE'][p] = pu.pu_q[feature][p];
						}
					}
					delete pu.pu_q[feature][p];
				}
				else {
					let [p1, p2] = p.split(',');
					if (!pu.point[p1] || ![0, 2, 3].includes(pu.point[p1].type)) {
						delete pu.pu_q[feature][p];
					}
					else if (!pu.point[p2] || ![0, 2, 3].includes(pu.point[p2].type)) {
						delete pu.pu_q[feature][p];
					}
				}
			});
		});
		['cage', 'wall'].forEach(feature => {
			Object.keys(pu.pu_q[feature]).forEach(p => {
				let [p1, p2] = p.split(',');
				if (!pu.point[p1] || !pu.point[p2]) {
					delete pu.pu_q[feature][p];
				}
			});
		});
	}

	C.convertPenpaPuzzle = function (pu) {
		if (typeof pu === 'string') {
			pu = C.loadPenpaPuzzle(pu);
		}
		if (!pu) return;

		const doc = {
			// Copied from pu:
			point: pu.point, // point coordinate map
			nx: pu.nx, // width
			ny: pu.ny, // height
			nx0: pu.nx0, // width + 4
			ny0: pu.ny0, // height + 4
			theta: pu.theta, // rotation angle
			reflect: pu.reflect, // [0] = -1: reft LR; [1] = -1: reflect UD
			width_c: pu.width_c, // canvas width, default = nx + 1
			height_c: pu.height_c, // canvas height, default = ny + 1
			center_n: pu.center_n, // center point of canvas
			centerlist: pu.centerlist, // board cells list
			// Calculated parameters:
			col0: 0, // offset of puzzle cell(0,0)
			row0: 0, //  offset of puzzle cell(0,0)
			width: 0, // number of columns in puzzle (=after translation)
			height: 0, // number of rows in puzzle (=after translation)
			maskedCells: []
		};

		// Inject puzzle/doc metrics into helper classes
		PenpaTools.doc = doc;
		DrawingContext.ctcSize = 64;
		DrawingContext.penpaSize = pu._size;

		cleanupPu(pu);

		convertFeature2Line(pu, 'freeline', 'line');
		convertFeature2Line(pu, 'freelineE', 'lineE');
		convertFeature2Line(pu, 'wall', 'line');

		// Cleanup frame
		for (let k in pu.pu_q.deletelineE) {
			// Don't delete when replaced with another line
			if (pu.pu_q.lineE[k] === undefined) {
				if (pu.frame[k] === 2) {
					pu.pu_q.deletelineE[k] = 2; // outer frame
				}
				delete pu.frame[k];
			}
		}
		// Remove lines which are identical to the corresponding frame line.
		Object.keys(pu.pu_q.lineE).forEach(k => {
			if (pu.frame[k]) {
				let style = pu.pu_q.lineE[k];
				if (pu.frame[k] === (style === 12 ? 11 : style)) { // Line style 12 is frame style 11
					delete pu.pu_q.lineE[k];
				}
			}
		});
		// Keep only thick frame lines
		Object.keys(pu.frame).filter(k => pu.frame[k] !== 2).forEach(k => delete pu.frame[k]);

		const {solutionPoints, uniqueRowsCols} = getSolutionInfo(pu);
		PenpaRegions.cleanupCenterlist(pu, solutionPoints);

		let {squares, regions} = PenpaRegions.findSudokuSquares(pu);
		if (!regions) {
			PenpaRegions.findSudokuRegions(pu, squares);
		}

		// Add solution cells to centerlist
		['number', 'surface'].forEach(constraint => {
			const solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [point, val] = s.split(',');
				point = Number(point);
				if (!pu.centerlist.includes(point)) {
					pu.centerlist.push(point);
				}
			});
			pu.centerlist.sort();
		});
		['loopline'].forEach(constraint => {
			const solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [p1, p2, val] = s.split(',');
				[p1, p2].forEach(point => {
					point = Number(point);
					if (!pu.centerlist.includes(point)) {
						pu.centerlist.push(point);
					}
				})
			});
			pu.centerlist.sort();
		});

		//TODO: Can/should this be done before region detection?
		expandGridForFillableOutsideFeatures(pu);

		if (PenpaDecoder.flags.expandGrid) {
			expandGridForWideOutsideClues(pu);
		}

		// Determine visual cell grid bounding box
		let {top, left, height, width} = PenpaTools.getBoundsRC(pu.centerlist, PenpaTools.point2cell);

		// Update with calculated top-left position
		doc.col0 = left;
		doc.row0 = top;
		doc.width = width;
		doc.height = height;

		let puzzle = {
			id: `penpa${md5Digest(JSON.stringify(pu))}`,
			settings: {},
		};
		createBlankPuzzle(pu, puzzle, width, height);

		addSudokuRegions(pu, puzzle, squares, regions, uniqueRowsCols);

		positionBoard(pu, puzzle, doc);
		hideGridLines(pu, puzzle, doc);

		addCageMetadata(pu, puzzle);

		addGivens(pu, puzzle);

		moveBlackEdgelinesToFrame(pu);
		function moveBlackEdgelinesToFrame(pu) {
			const lineE = pu.pu_q.lineE;
			const frame = pu.frame;
			const lineECol = pu.pu_q_col.lineE;
			const styleMap = {2: 2, 21: 21, 80: 1};
			const styleMapCol = {2: 2, 3: 2, 5: 2, 8: 2, 9: 2, 21: 21, 80: 1};
			for(let k in lineE) {
				let style = lineE[k];
				if (!lineECol[k]) { // Not custom color
					let frameStyle = styleMap[style];
					if (frameStyle) {
						delete lineE[k];
						frame[k] = frameStyle;
					}
					else {
						if (frame[k]) delete frame[k];
					}
				}
				else if(lineECol[k] === '#000000') { // Black custom color
					let frameStyle = styleMapCol[style];
					if (frameStyle) {
						delete lineE[k];
						frame[k] = frameStyle;
					}
					else {
						if (frame[k]) delete frame[k];
					}
				}
			}
		}
		
		let qa = 'pu_q';
		parse.surface(qa, pu, puzzle);
		parse.deletelineE(qa, pu, puzzle);

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
				
		drawBoardLattice(pu, puzzle, doc);
		
		parse.frame(qa, pu, puzzle);

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

		// console.log(pu, puzzle);
		return puzzle;
	};

	return C;
})();
