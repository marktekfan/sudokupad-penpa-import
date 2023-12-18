import { PenpaTools } from "./penpa-tools";
import { PenpaSymbol } from "./penpa-symbol";
import { Color, set_surface_style, set_line_style } from './penpa-style'
import { md5Digest } from './sudokupad/utilities.js'
import { DrawingContext } from "./penpa-drawingcontext";
import { PenpaRegions } from "./penpa-regions";
import { PenpaLoader } from "./penpa-loader/penpa-loader";
import tinycolor from 'tinycolor2'

let _rnd = 0; // static random seed

const dashLineStyle = [10, 11, 12, 13, 14, 15, 17, 110, 115];

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
	if (PenpaConverter.flags.debug && type) part.penpa = type;
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
		let matches = String(numberS[pos][0]).trim().match(reMetaTagsStripCells);
		if (matches) {
			applyDefaultMeta(pu, puzzle, matches[1], matches[2]);
			delete numberS[pos];
			// Remove meta killercage
			let killerCell = PenpaTools.point2centerPoint(pos);
			for (let i = 0; i < killercages.length; i++) {
				if (killercages[i].length === 1 && killercages[i].includes(killerCell)) {
					killercages[i] = [];
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
		// else if(complete) {
		// 	enableConflictChecker = true;
			
		// 	puzzle.regions = [];
		// 	squares.forEach(square => {
		// 		const regions = square.regions;

		// 		Object.keys(regions).forEach(reg => {
		// 			let region = regions[reg].map(matrix2point).map(point2cell);
		// 			puzzleAdd(puzzle, 'regions', region);
		// 		});
		// 	});
		// }
	}
	if (!uniqueRowsCols && !enableConflictChecker) {
		puzzle.settings['conflictchecker'] = 0;
	}
}

function getSolutionInfo(pu) {
	const {point2matrix} = PenpaTools;
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
function addSolution(pu, puzzle, puzinfo) {
	const {point2cell} = PenpaTools;
	const {width, height} = puzinfo;
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

function hideGridLines(pu, puzzle, puzinfo) {
	const {point2matrix, matrix2point, getBoundsRC, makePointPair} = PenpaTools;
	const {centerlist} = pu;

	const {top, left, bottom, right, height, width} = getBoundsRC(centerlist, point2matrix);
	// Create 'outside cell mask' only when cells are removed
	if (centerlist.length === width * height) {
		return false;
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
			const key = makePointPair(matrix2point(y - 1, x - 1, 1), matrix2point(y - 1, x, 1));
			deletelineE[key] = 9;
		}
		if (hasleft) {
			const key = makePointPair(matrix2point(y - 1, x - 1, 1), matrix2point(y, x - 1, 1));
			deletelineE[key] = 9;
		}
		if (hasright) {
			const key = makePointPair(matrix2point(y - 1, x, 1), matrix2point(y, x, 1));
			deletelineE[key] = 9;
		}
		if (hasbottom) {
			const key = makePointPair(matrix2point(y, x - 1, 1), matrix2point(y, x, 1));
			deletelineE[key] = 9;
		}
	}

	puzinfo.hasCellMask = true;
	return true;
}

function drawBoardLattice(pu, puzzle, puzinfo) {
	const {point2RC} = PenpaTools;
	// Dotted grid lines
	// if (pu.mode.grid[0] === '2') {
	// 	puzzle.settings['dashedgrid'] = 1;
	// }
	// No grid lines
	if (pu.mode.grid[0] === '3') {
		puzzle.settings['nogrid'] = 1; // not (yet) implemented
	}
	// // Grid points
	if (pu.mode.grid[1] === '1') {
		let ctx = new DrawingContext();
		ctx.target = puzinfo.hasCellMask ? 'overlay' : 'cell-grids';
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

function positionBoard(pu, puzzle, puzinfo) {
	// Add transparant rectangle to position the puzzle
	const ctx = new DrawingContext();
	// const opts = Object.assign(ctx.toOpts(), {
	// 	backgroundColor: Color.TRANSPARENTWHITE,
	// 	//   backgroundColor: '#cc4440',
	// 	center: [puzinfo.ny / 2 - puzinfo.row0, puzinfo.nx / 2 - puzinfo.col0],
	// 	width: puzinfo.nx,
	// 	height: puzinfo.ny,
	// });
	const opts = Object.assign(ctx.toOpts(), {
		backgroundColor: Color.TRANSPARENTWHITE,
		//  backgroundColor: '#cc4440',
		center: PenpaTools.point2RC(puzinfo.center_n),
		width: puzinfo.width_c - 1,
		height: puzinfo.height_c - 1,
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

function render_surface(qa, pu, puzzle) {
	const list = pu[qa].surface || [];
	const listCol = pu[qa + '_col'].surface || [];
	const {point2RC, isBoardCell} = PenpaTools;
	const keys = Object.keys(list); //keys.sort();
	let centers = keys.map(k => ({center: point2RC(k), value: list[k], key: Number(k)}));
	const predicate = (s1, s2) => { return true 
		&& ((listCol[s1.key] && listCol[s1.key] === listCol[s2.key]) || (!listCol[s1.key] && s1.value === s2.value))
		&& pu.centerlist.includes(s1.key) === pu.centerlist.includes(s2.key)
		&& isBoardCell(s1.center) === isBoardCell(s2.center)
	}
	PenpaTools.reduceSurfaces(centers, predicate).forEach(surface => {
		let ctx = new DrawingContext();
		set_surface_style(ctx, surface.value);
		if(listCol[surface.key]) {
			ctx.fillStyle = listCol[surface.key];
		}
		ctx.lineWidth = 0; // surface should not have a border
		// ctx.fillStyle = '#ff000040'
		//if (!pu.centerlist.includes(surface.key)) {
		//	ctx.target = 'overlay';
		//}
		ctx.role = surface.role;
		const opts = Object.assign(ctx.toOpts(), {
			center: surface.center,
			width: surface.width || 1,
			height: surface.height || 1,
			//backgroundColor: Color[Object.keys(Color)[Math.floor(_rnd = ((_rnd|0) + 1) % 24)]],
		});
		if (PenpaConverter.isDoubleLayer(ctx)) {
			puzzleAdd(puzzle, 'underlays', opts, 'surface');
		}
		puzzleAdd(puzzle, 'underlays', opts, 'surface');
	});
}

function render_number(qa, pu, puzzle, feature = 'number') {
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

function render_numberS(qa, pu, puzzle, feature = 'numberS') {
	const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
	const list = pu[qa][feature] || [];
	const {point2cell, point2centerPoint} = PenpaTools;
	Object.keys(list).forEach(key => {
		const number = list[key];
		let ctx = new DrawingContext();
		if (number.role) {
			return;
		}
		draw.draw_numberS(ctx, number, key);
		if(pu.point[key].type === 4 && (key % 4) === 0) { // top-left cell corner
			if(pu.centerlist.includes(point2centerPoint(key))) {
				let rc = point2cell(key);
				let cell = puzzle.cells[rc[0]][rc[1]];
				cell.pencilMarks = [' '];
			}
		}
	});
}

function render_symbol(qa, pu, puzzle, layer = 1) {
	const feature = 'symbol'
	const draw = new PenpaSymbol(pu, puzzle, 64, {puzzleAdd});
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const {point2RC} = PenpaTools;
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
		ctx.role = symbol.role;
		draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
	});
}

function render_freeline(qa, pu, puzzle) {
	draw_line(qa, pu, puzzle, 'freeline');
}

function render_freelineE(qa, pu, puzzle) {
	draw_line(qa, pu, puzzle, 'freelineE', 'overlay');
}

function render_thermo(qa, pu, puzzle, feature = 'thermo') {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const {point2RC} = PenpaTools;
	render_nobulbthermo(qa, pu, puzzle, feature);
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
			role: 'thermobulb'
		}, feature + ' bulb');
	});
}

function render_arrows(qa, pu, puzzle, feature = 'arrows') {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const {point2RC} = PenpaTools;
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
			role: 'arrowbulb'
		}, target), feature + ' circle');
	});
}

function render_direction(qa, pu, puzzle, feature = 'direction') {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const {point2RC} = PenpaTools;
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

function render_squareframe(qa, pu, puzzle, feature = 'squareframe') {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const {point2RC} = PenpaTools;
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

function render_polygon(qa, pu, puzzle, feature = 'polygon') {
	const {point2RC, ColorIsVisible, getMinMaxRC, round1, round3} = PenpaTools;
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	Object.keys(list).forEach(key => {
		const target = {target: 'underlay'};
		let points = list[key].filter(p => pu.point[p]).map(point2RC);
		if (points.length < 2) return;
		let ctx = new DrawingContext();
		ctx.strokeStyle = listCol[key] || Color.BLACK;
		ctx.fillStyle = listCol[key] || Color.BLACK;
		ctx.lineWidth = 1;

		ctx.push();

		ctx.moveTo(points[0][1], points[0][0]);
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i][1], points[i][0]);
		}
		ctx.fill();

		let wp = ctx.convertPathToWaypoints();
		if (PenpaConverter.flags.useClipPath && wp && ColorIsVisible(ctx.fillStyle)) {
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

function render_frame(qa, pu, puzzle) {
	const list = pu.frame || [];
	let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
	wpList.forEach(line => {
		if (line.wayPoints.length < 2) return;
		let ctx = new DrawingContext();
		//ctx.target = 'overlay';
		ctx.target = pu.foglight ? 'overlay' : 'cell-grids'; // note 'overlay' can cause visual outlining 
		set_line_style(ctx, line.value);
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
		}), 'frame');
	});
}

function draw_line(qa, pu, puzzle, feature, target = undefined) {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature] || [];
	const excludedLines = (feature === 'lineE') ? (pu.pu_q.deletelineE || []) : [];
	let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol, excludedLines);
	wpList.forEach(line => {
		if (line.wayPoints.length < 2) return;
		let ctx = new DrawingContext();
		if (target) {
			ctx.target = target;
		}				
		else if (isMaskedLine(pu, line.keys)) {
			ctx.target = 'overlay';
		}
		// This is a line over a deleted grid line -> Move to cell-grids to prevent visual outlines.
		if (excludedLines.length != 0 && excludedLines[PenpaTools.makePointPair(line.keys[0], line.keys[line.keys.length - 1])]) {
			ctx.target = 'cell-grids';
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
				if (PenpaConverter.flags.fadeLines) {
					ctx.strokeStyle = PenpaTools.ColorApplyAlpha(ctx.strokeStyle, PenpaConverter.flags.doubleLayer);
				}
				if (PenpaConverter.flags.thickLines) {
					ctx.lineWidth = 11 * ctx.penpaSize / ctx.ctcSize;
				}
			}
			puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
			}), feature);
		}
	});
	drawXmarks(qa, pu, puzzle, feature);
}

function render_line(qa, pu, puzzle) {
	draw_line(qa, pu, puzzle, 'line');
}

function render_lineE(qa, pu, puzzle) {
	draw_line(qa, pu, puzzle, 'lineE', 'overlay');
}

function render_wall(qa, pu, puzzle) {
	draw_line(qa, pu, puzzle, 'wall');
}

function render_cage(qa, pu, puzzle, feature = 'cage') {
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature];
	let wpLines = PenpaTools.penpaLines2WaypointLines(list, listCol);
	const killercages = pu[qa].killercages || [];
	const {point2centerPoint, objectEquals, round3} = PenpaTools;
	let cageLines = PenpaTools.concatenateEndpoints(wpLines);
	const killerOutlines = killercages.map(cells => PenpaTools.getOutlinePoints(cells));
	const cageOutlines = cageLines.map(line => [...new Set(line.keys.map(p => point2centerPoint(p)))].sort((a, b) => a - b));

	// Find cage lines which 100% cover a killercage
	killerOutlines.forEach((killerOutline, killer_idx) => {			
		let fullmatch = cageOutlines.find((outlineCells, line_idx) => {
			const line = cageLines[line_idx];
			// Skip when already assigned
			if (line.killercage !== undefined) return;
			if (objectEquals(killerOutline, outlineCells)) {
				// Must be a closed loop
				if (line.keys[0] === line.keys[line.keys.length - 1]) {
					// Solid cage lines should be drawn by lines, and make cage invisible
					if ([7, 107, 16, 116].includes(line.value)) {
						pu[qa + '_col']['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
					}
					else {
						// Custom color or not black dash
						if (line.cc || line.value !== 10) {
							// Copy color to killercage and filter out individual cage line
							let ctx = new DrawingContext();
							set_line_style(ctx, line.value, line.cc);
							pu[qa + '_col']['killercages'][killer_idx] = line.cc || ctx.strokeStyle;
						}
						// Cage is implicitly drawn by killercage
						line.killercage = killer_idx;
					}
				}
				else {
					// Not a closed loop, but fully covering a killercage
					// Then make cage invisible (cage is drawn by cage line)
					pu[qa + '_col']['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
				}
				return true;
			}
		});
		if (!fullmatch) {
			// No full match
			// cage lines should be drawn by lines, and make cage invisible
			pu[qa + '_col']['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
		}
	});

	const r = 0.17;
	cageLines.forEach(line => {
		// Skip when cage is drawn by killercage
		if (line.killercage !== undefined) return;
		
		// Align cage lines with SudokuPad cages lines
		line.wayPoints.forEach(wp => {
			let dy = Math.sign(wp[0] - Math.floor(wp[0]) - 0.5);
			let dx = Math.sign(wp[1] - Math.floor(wp[1]) - 0.5);
			wp[0] = round3(wp[0] + dy * r);
			wp[1] = round3(wp[1] + dx * r);
		});

		let ctx = new DrawingContext();
		set_line_style(ctx, line.value, line.cc);
		if (line.cc) {
			ctx.strokeStyle = line.cc;
		}
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
			target: 'cages',
		}), feature + ' line');
	});
}

// Must be rendered before numberS
function render_killercages(qa, pu, puzzle, feature = 'killercages') {
	const list = pu[qa].killercages || [];
	const listCol = pu[qa + '_col'][feature];
	const {point2cell} = PenpaTools;
	list.forEach((cage, i) => {
		if (cage.length === 0) return;
		let cagePart = {unique: true};
		cagePart.cells = cage.map(point2cell);
		if (listCol[i]) {
			cagePart.borderColor = listCol[i];
		}
		if (cage['value'] !== undefined) {
			cagePart.value = cage['value'];
		}
		puzzleAdd(puzzle, 'cages', cagePart, feature);
	});
}

function render_deletelineE(qa, pu, puzzle, feature = 'deletelineE') {
	const list = pu.pu_q[feature] || [];
	const surface = pu[qa].surface;
	const surfaceCol = pu[qa + '_col'].surface || [];
	const {point2RC, puzinfo} = PenpaTools;
	const {width, height} = puzinfo;
	const isOnPerimeter = function(k) {
		const [p1, p2] = k.split(',');
		const [r1, c1] = point2RC(p1);
		const [r2, c2] = point2RC(p2);
		return (r1 === 0 && r2 === 0) 
			|| (c1 === 0 && c2 === 0)
			|| (r1 === height && r2 === height) 
			|| (c1 === width && c2 === width);
	}
	const perimeter = {};
	const fogline = {};
	if (pu.foglight) {
		Object.keys(list).forEach(k => {
			// Move line to perimeter list, which is rendered last
			if (isOnPerimeter(k)) {
				 perimeter[k] = 'perimeter';
				 list[k] = 0;
			}
			else {
				// duplicate to fogline list
				fogline[k] = 'fog';
			}
		});
	}
	else {
		//const darkBackgrounds = [Color.BLACK, Color.BLACK_LIGHT, Color.GREY_DARK_VERY];
		Object.keys(list).forEach(k => {
			const [p1, p2] = PenpaTools.getAdjacentCellsOfELine(pu, k);
			const s1 = surface[p1];
			const s2 = surface[p2];
			if (s1 || s2) {
				const ctx = new DrawingContext();
				set_surface_style(ctx, s1 || s2);
				const fillStyle1 = (s1 && surfaceCol[p1]) || ctx.fillStyle;
				set_surface_style(ctx, s2 || s1);
				const fillStyle2 = (s2 && surfaceCol[p2]) || ctx.fillStyle;
				// Don't remove when not visible due to dark background
				//if (darkBackgrounds.includes(fillStyle1) || darkBackgrounds.includes(fillStyle2)) {
				const {doubleLayer} = PenpaConverter.flags;
				if (fillStyle1 !== fillStyle2) {
					const color1 = tinycolor(fillStyle1);
					const color2 = tinycolor(fillStyle2);
					const newcolor = tinycolor.mix(color1, color2);
					list[k] = PenpaTools.ColorApplyAlpha(PenpaTools.toHexColor(newcolor), doubleLayer);
					//list[l] = -1; // =>line.value = -1
				}
				else {
					// Pre-calculate line color to make it visually identical to the surface color which has 0.5 alpha in SudokuPad.
					list[k] = PenpaTools.ColorApplyAlpha(fillStyle1, doubleLayer);
				}
			}
			// Move line to perimeter list, which is rendered last
			if (isOnPerimeter(k)) {
				perimeter[k] = list[k];
				list[k] = 0;
			}
		});
	}
	const combined = PenpaTools.reducePenpaLines2WaypointLines(list);
	const combinedPerimeter = PenpaTools.reducePenpaLines2WaypointLines(perimeter);
	const combinedFogline = PenpaTools.reducePenpaLines2WaypointLines(fogline);
	[].concat(combined, combinedFogline, combinedPerimeter).forEach(line => {
		if (line.value <= 0) return; // Skip not visible line
		let {wayPoints} = line;
		let width = 4;
		let color = '#FFFFFF';
		let target = pu.foglight ? 'overlay' : 'cell-grids';
		wayPoints = PenpaTools.shortenLine(wayPoints, 1.2/64, 1.2/64);
		if (line.value === 'fog') {
			width = 1;
			color = '#afafaf';
			target = 'cell-grids';
		}
		else if (line.value === 'perimeter') {
			target = 'cell-grids'; // Should never be hidden by fog
		}
		else if (typeof line.value === 'string') {
			width = 1;
			color = line.value;
		}
		const ctx = new DrawingContext();
		puzzleAdd(puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
			 wayPoints: PenpaTools.reduceWayPoints(wayPoints),
			color: color,
			 // color: '#FF40A0'
			thickness: width,
			target: target
		}), feature);
	});
}

function render_nobulbthermo(qa, pu, puzzle, feature = 'nobulbthermo') {
	function find_common(pu, line, endpoint) {
		if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
		if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
		return false;
	}
	const {point2RC, puzinfo} = PenpaTools;
	const list = pu[qa][feature] || [];
	const listCol = pu[qa + '_col'][feature];
	const reduce_straight = 0.32;
	const reduce_diagonal = 0.22;
	list.forEach((line, i) => {
		if (line.length < 2) return;
		const maskedLine = isMaskedLine(pu, line);
		const target = maskedLine ? {target: 'overlay'} : {};
		if (maskedLine) {
			line.forEach(p => puzinfo.maskedCells.push(p));
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
	const {puzinfo, point2RC, isBoardCell} = PenpaTools;
	if (!puzinfo.hasCellMask) return false;
	p = Number(p);
	if (puzinfo.maskedCells.includes(p)) return true;
	if (pu.centerlist.includes(p)) return false;
	if (isBoardCell(point2RC(p))) return true;
	return false;
}		

function isMaskedLine(pu, line) {
	const {puzinfo, point2matrix, matrix2point} = PenpaTools;
	if (!puzinfo.hasCellMask || line.length < 2) return false;
	let p = line[0];
	// Must be center line (cell or edge)
	if (![0, 2, 3].includes(puzinfo.point[p].type)) return false;
	if (puzinfo.maskedCells.includes(p)) return true;
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
			if (puzinfo.maskedCells.includes(pnext)) return true;
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

function convertFeature2Line(pu, fromFeature, lineFeature) {
	const {point2matrix, makePointPair} = PenpaTools;
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
				let newkey = makePointPair(p1, p2);
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
				let newkey = makePointPair(p1, p2);
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
				let newkey = makePointPair(p1, p2);
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
	const {makePointPair} = PenpaTools;
	pu.centerlist.push(p);
	pu.centerlist.sort();
	const {lineE} = pu.pu_q;
	const {frame} = pu;
	for (let i = 0; i < 4; i++) {
		let k = makePointPair(pu.point[p].surround[i], pu.point[p].surround[(i + 1) % 4]);
		if (!lineE[k] && !frame[k]) {
			pu.pu_q.deletelineE[k] = 8;
		}
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
	function getCageLinePoints(pu, feature) {
		let points = [];
		let lines = pu.pu_q[feature];
		Object.keys(lines).forEach(key => {
			let [p1, p2] = key.split(',').map(Number);
			points.push(p1);
			points.push(p2);
		});	
		return points;		
	}

	let clBounds = PenpaTools.getMinMaxRC(pu.centerlist, PenpaTools.point2matrix);
	let bounds = [];
	bounds.push(PenpaTools.getMinMaxRC((pu.pu_q.thermo || []).flatMap(p => p), PenpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC((pu.pu_q.killercages || []).flatMap(p => p), PenpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'line'), PenpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'freeline'), PenpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC(getCageLinePoints(pu, 'cage'), PenpaTools.point2matrix));

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

function expandGridForWideOutsideClues(pu, margin = 0) {
	const {getMinMaxRC, point2matrix, matrix2point} = PenpaTools;
	let clBounds = getMinMaxRC(pu.centerlist, point2matrix);
	let bounds = [];
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.number), point2matrix));
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.numberS), point2matrix));
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.symbol), point2matrix));
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.surface).filter(k => pu.pu_q.surface[k] > 0), point2matrix));
	
	// bounds for all clues
	let top = Math.min(...bounds.map(b => b[0]));
	let left = Math.min(...bounds.map(b => b[1]));
	let bottom = Math.max(...bounds.map(b => b[2]));
	let right = Math.max(...bounds.map(b => b[3]));
	
	if (top < clBounds[0] - margin || left < clBounds[1] - margin) {
		addToCenterlist(pu, matrix2point(top, left));
	}
	if (bottom > clBounds[2] + margin || right > clBounds[3] + margin) {
		addToCenterlist(pu, matrix2point(bottom, right));
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
				list[i] = PenpaTools.toHexColor(list[i]);
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
	// remove leading spaces in numberS
	['numberS'].forEach(f => {
		let feature = pu.pu_q[f] || {};
		Object.keys(feature).forEach(p => {
			let [n] = feature[p];
			if (typeof n === 'string') {
				feature[p][0] = feature[p][0].trim();				
			}
		});
	});
}

function moveBlackEdgelinesToFrame(pu) {
	const {point2matrix} = PenpaTools;
	const lineE = pu.pu_q.lineE;
	const frame = pu.frame;
	const lineECol = pu.pu_q_col.lineE;
	const deletelineE = pu.pu_q.deletelineE;
	const styleMap = {2: 2, 21: 21, 80: 1};
	const styleMapCol = {2: 2, 3: 2, 5: 2, 8: 2, 9: 2, 21: 21, 80: 1};
	Object.keys(lineE).forEach(key => {
		const p = key.split(',').map(Number);
		if (p.length < 2) return;
		const m1 = point2matrix(p[0]);
		const m2 = point2matrix(p[1]);
		// don't move diagonal lines
		if (m1[0] !== m2[0] && m1[1] !== m2[1]) return;
		const style = lineE[key];
		// don't move dash lines
		if (dashLineStyle.includes(style)) return;

		delete deletelineE[key];
		if (!lineECol[key]) { // Not custom color
			const frameStyle = styleMap[style];
			if (frameStyle) {
				delete lineE[key];
				frame[key] = frameStyle;
			}
			else {
				if (frame[key]) delete frame[key];
			}
		}
		else if(lineECol[key] === '#000000') { // Black custom color
			const frameStyle = styleMapCol[style];
			if (frameStyle) {
				delete lineE[key];
				frame[key] = frameStyle;
			}
			else {
				if (frame[key]) delete frame[key];
			}
		}
	});

	Object.keys(frame).forEach(key => {
		// dash frame lines must have deletelineE to hide gridline
		const style = frame[key];
		if (dashLineStyle.includes(style) && !deletelineE[key]) {
			deletelineE[key] = 3;
		}
	});
}

function prepareKillercages(pu) {
	const {point2cell, point2centerPoint, puzinfo} = PenpaTools;
	
	// Remove killercages which have no visible lines
	const list = pu.pu_q.cage || [];
	const wpLines = PenpaTools.penpaLines2WaypointLines(list);
	const cageSet = new Set();
	wpLines.forEach(line => {
		const p1 = line.keys[0];
		const p2 = line.keys[1];
		cageSet.add(point2centerPoint(p1));
		cageSet.add(point2centerPoint(p2));
	});
	const killercages = pu.pu_q.killercages || [];
	killercages.forEach(cage => {
		if (!cage.some(p => cageSet.has(p))) {
			cage.length = 0;
		}
	});

	joinDisconnectedKillercages(pu);

	// Collect killercage values
	const {numberS, number} = pu.pu_q;
	const {point2matrix, matrix2point} = PenpaTools;
	const sortTopLeftRC = ([r1, c1], [r2, c2]) => r1 === r2 ? c2 - c1 : r2 - r1;
	killercages.forEach(killer => {
		const labelCell = matrix2point([...killer.map(point2matrix)].sort(sortTopLeftRC).pop());
		for(let k in numberS) {
			if (labelCell === point2centerPoint(k)) {
				const num = numberS[k];
				if (pu.point[k].type === 4 && (k % 4) === 0) { // Top-left corner in cell
					killer['value'] = num[0].trim();
					num.role = 'killer'; // Exclude from rendering
					break;
				}
				// Special case for foglight
				else if (num[0].includes('FOGLIGHT') || /^foglight/i.test(num[0])) {
					killer['value'] = 'FOGLIGHT';
					num.role = 'killer'; // Exclude from rendering
					break;
				}
			}
		}
		for(let k in number) {
			if (labelCell === point2centerPoint(k)) {
				const num = number[k];
				// Special case for foglight
				if (num[0].includes('FOGLIGHT') || /^foglight/i.test(num[0])) {
					killer['value'] = 'FOGLIGHT';
					num.role = 'killer'; // Exclude from rendering
					break;
				}
			}
		}
	});

	// Remove any single cell cages on grid corners
	// Because they were only used to define the grid outline
	const {height, width} = puzinfo;
	killercages.forEach(killer => {
		if (killer.length !== 1 || killer['value'] !== undefined) return;
		const cageOutsideRegions = killer.map(point2cell).some(([r, c]) => 
			(r === 0 && (c === 0 || c === width - 1)) ||
			(r === height -1 && (c === 0 || c === width - 1))
		);
		if (cageOutsideRegions) {
			//Remove cage lines
			const {cage} = pu.pu_q;
			const p = killer[0];
			for(let k in cage) {
				let [p1, p2] = k.split(',');
				if (point2centerPoint(p1) === p || point2centerPoint(p2) === p) {
					delete cage[k];
				}
			}
			killer.length = 0;
		}
	});

	pu.foglight = killercages.some(killer => /^foglight/i.test(killer['value'] || ''));
}

function GetCageConnectionCells(pu, key, symbol) {
	const {point2centerPoint} = PenpaTools;
	if (pu.point[key].type !== 1) return; // must be a corner
	if (symbol[1] !== 'frameline') return;
	// symbol:  \
	if ([5, 6, 7, 8, 0].includes(symbol[0])) {
		const p1 = point2centerPoint(key);
		const c1 = p1; // top-left
		const c2 = pu.point[c1].adjacent_dia[3]; // bottom-right
		return [c1, c2];
	}
	// symbol:  /
	if ([1, 2, 3, 4, 9].includes(symbol[0])) {
		const p1 = point2centerPoint(key);
		const c1 = pu.point[p1].adjacent[2]; // top-right
		const c2 = pu.point[c1].adjacent_dia[2]; // bottom-left
		return [c1, c2];
	}
}

function joinDisconnectedKillercages(pu) {
	const killercages = pu.pu_q.killercages || [];
	const symbols = pu.pu_q['symbol'] || [];
	Object.keys(symbols).forEach(key => {
		const symbol = symbols[key];
		const [p1, p2] = GetCageConnectionCells(pu, key, symbol) || [];
		if (p1 == null || p2 == null) return;
		const kc1 = killercages.findIndex(cage => cage.some(p => p === p1));
		const kc2 = killercages.findIndex(cage => cage.some(p => p === p2));
		if (kc1 === -1 || kc2 === -1 || kc1 === kc2) return;

		killercages[kc1].push(...killercages[kc2]);
		killercages[kc1].sort((a, b) => a - b);
		killercages[kc2] = [];
		symbol.role = 'cagelink';
	});
}

function removeFrameWhenEqualToRegions(pu, puzzle, puzinfo, regions) {
	if (!regions) return;
	if (puzinfo.hasCellMask) return;

	// frame must exactly match all regions
	// Then frame can be removed
	let frame = Object.assign({}, pu.frame);
	regions.forEach(reg => {
		let outline = PenpaRegions.createOutline(pu, reg);
		outline.forEach(line => delete frame[line]);
	});

	// Remove frame lines when fully overlapped by regions
	if (Object.keys(frame).length === 0) {
		pu.frame = {};
	}
}

function cleanupFrame(pu) {
	// Cleanup frame
	for (let k in pu.pu_q.deletelineE) {
		// Don't delete when replaced with another line
		if (pu.pu_q.lineE[k] === undefined && pu.pu_q.freelineE[k] === undefined) {
			if (pu.frame[k] === 2) {
				pu.pu_q.deletelineE[k] = 2; // outer frame
			}
			if (pu.pu_q.deletelineE[k] <= 2) {
				delete pu.frame[k];
			}
		}
	}
	// Remove lines which are identical to the corresponding frame line.
	Object.keys(pu.pu_q.lineE).forEach(k => {
		if (pu.frame[k]) {
			let style = pu.pu_q.lineE[k];
			if (pu.frame[k] === (style === 12 ? 11 : style)) { // Line style 12 is frame style 11
				if (pu.pu_q_col.lineE[k] && tinycolor(pu.pu_q_col.lineE[k]).equals(tinycolor.BLACK)) {
					delete pu.pu_q.lineE[k];
				}
			}
		}
	});
	// Keep only thick frame lines
	const noGridLines = pu.mode.grid[0] === '3';
	const frameLinesToKeep = noGridLines ? [2, 21, 11, 1] : [2, 21, 11];
	Object.keys(pu.frame).filter(k => !frameLinesToKeep.includes(pu.frame[k])).forEach(k => delete pu.frame[k]);
}

function generateAnswerCheck(pu) {
	// Source: class_p.js function make_solution()
	var sol = [
		[], // 0 = shading
		[], // 1 = Line / FreeLine
		[], // 2 = Edge / FreeEdge
		[], // 3 = Wall
		[], // 4 = Number
		[]  // 5 = Symbol
	];
	for (var i in pu["pu_a"].number) {
		if (pu["pu_q"].number[i] && pu["pu_q"].number[i][1] === 1 && (pu["pu_q"].number[i][2] === "1" || pu["pu_q"].number[i][2] === "10")) {
			// (Black) and (Normal or L) in Problem mode then ignore
		} else {
			// Sudoku only one number and multiple digits in same cell should not be considered, this is for single digit obtained from candidate submode
			if (pu["pu_a"].number[i][2] === "7") {
				// (Green or light blue or dark blue or red)
				if (pu["pu_a"].number[i][1] === 2 || pu["pu_a"].number[i][1] === 8 || pu["pu_a"].number[i][1] === 9 || pu["pu_a"].number[i][1] === 10) {
					var sum = 0,
						a;
					for (var j = 0; j < 10; j++) {
						if (pu["pu_a"].number[i][0][j] === 1) {
							sum += 1;
							a = j + 1;
						}
					}
					if (sum === 1) {
						sol[4].push(i + "," + a);
					}
				}
			} else if (!isNaN(pu["pu_a"].number[i][0]) || !pu["pu_a"].number[i][0].match(/[^A-Za-z]+/)) {
				// ((Green or light blue or dark blue or red) and (Normal, M, S, L))
				if ((pu["pu_a"].number[i][1] === 2 || pu["pu_a"].number[i][1] === 8 || pu["pu_a"].number[i][1] === 9 || pu["pu_a"].number[i][1] === 10) &&
					(pu["pu_a"].number[i][2] === "1" || pu["pu_a"].number[i][2] === "5" || pu["pu_a"].number[i][2] === "6" || pu["pu_a"].number[i][2] === "10")) {
					sol[4].push(i + "," + pu["pu_a"].number[i][0]);
				}
			}
		}
	}
	for (var i = 0; i < 6; i++) {
		sol[i] = sol[i].sort();
	}

	// A significant number of solution digits should be present
	// Note: It is not possible to reliably detect a complete solution
	if (sol[4].length > pu.centerlist.length / 2) {
		pu.solution = JSON.stringify(sol);
	}
}



export class PenpaConverter {

	static settings = {
		thickLines:  {defaultValue: true,  title: 'Thicker lines to match SudokuPad feature lines'},
		fadeLines:   {defaultValue: true,  title: 'Fade colors on feature lines'},
		removeFrame: {defaultValue: true,  title: 'Remove extra Frame lines on regions'},
		doubleLayer: {defaultValue: true,  title: 'Doubling of transparant underlay colors to make them less transparent'},
		answerGen:   {defaultValue: true,  title: 'Generate answer check from Solution mode digits'},
		expandGrid:  {defaultValue: false, title: 'Always expand grid to force editable outside clues'},
		// useClipPath: {defaultValue: false, title: 'Use clip-path for shapes'},
		debug:       {defaultValue: 0 || document.location.host.startsWith('127.0.0.1'), title: 'Add penpa debug info to puzzle'}
	};
	static flags = {}; // Will be initalized with PenpaConverter.settings values

	static ParseUrlSettings() {
		[...new URLSearchParams(document.location.search)].forEach(([key, val]) => {
			let settingName = key.replace(/^setting-/, '');
			// Make case insentitive
			settingName = Object.keys(PenpaConverter.flags).reduce((prev, cur)=> prev.toLowerCase() === cur.toLowerCase() ? cur : prev, settingName);
			const settingValueTrue = ['true', 't', '1', ''].includes(val.toLowerCase());
			const settingValueFalse = ['false', 'f', '0'].includes(val.toLowerCase());
			const settingValue = settingValueTrue ? true : (settingValueFalse ? false : val);
			if (PenpaConverter.flags[settingName] === undefined) {
				console.info(`Extra URL option: ${settingName}=${settingValue}`);
			}
			else {
				console.info(`Extra URL setting: ${settingName}=${settingValue}`);
			}		
			PenpaConverter.flags[settingName] = settingValue;
		});
	}

	static isDoubleLayer = (ctx) => (PenpaConverter.flags.doubleLayer || 0) && PenpaTools.ColorIsVisible(ctx.fillStyle) && !PenpaTools.ColorIsOpaque(ctx.fillStyle);
	
	static convertPenpaPuzzle = function (pu) {
		if (typeof pu === 'string') {
			pu = PenpaLoader.loadPenpaPuzzle(pu);
		}
		if (!pu) return;

		if (!pu.solution) {
			if (PenpaConverter.flags.answerGen) {
				generateAnswerCheck(pu);
			}
		}

		//pu.pu_q.lineE = {};

		const puzinfo = {
			// Copied from pu:
			point: pu.point, // point coordinate map
			nx: pu.nx, // width
			ny: pu.ny, // height
			nx0: pu.nx0, // width + 4
			ny0: pu.ny0, // height + 4
			//theta: pu.theta, // rotation angle
			//reflect: pu.reflect, // [0] = -1: reft LR; [1] = -1: reflect UD
			width_c: pu.width_c, // canvas width, default = nx + 1
			height_c: pu.height_c, // canvas height, default = ny + 1
			center_n: pu.center_n, // center point of canvas
			//centerlist: pu.centerlist, // board cells list
			// Calculated parameters:
			col0: 0, // offset of puzzle cell(0,0)
			row0: 0, //  offset of puzzle cell(0,0)
			width: 0, // number of columns in puzzle (=after translation)
			height: 0, // number of rows in puzzle (=after translation)
			maskedCells: [],
			id: `penpa${md5Digest(JSON.stringify(pu))}`,
		};

		// Inject puzzle/puzinfo metrics into helper classes
		PenpaTools.puzinfo = puzinfo;
		DrawingContext.ctcSize = 64;
		DrawingContext.penpaSize = pu._size;

		cleanupPu(pu);

		convertFeature2Line(pu, 'freeline', 'line');
		convertFeature2Line(pu, 'freelineE', 'lineE');
		convertFeature2Line(pu, 'wall', 'line');

		// Add solution cells to centerlist
		['number', 'surface'].forEach(constraint => {
			const solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [point, val] = s.split(',');
				point = Number(point);
				addToCenterlist(pu, point);
			});
			pu.centerlist.sort();
		});
		['loopline'].forEach(constraint => {
			const solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [p1, p2, val] = s.split(',');
				[p1, p2].forEach(point => {
					point = Number(point);
					addToCenterlist(pu, point);
				})
			});
			pu.centerlist.sort();
		});

		moveBlackEdgelinesToFrame(pu);
		cleanupFrame(pu);

		const {solutionPoints, uniqueRowsCols} = getSolutionInfo(pu);
		PenpaRegions.cleanupCenterlist(pu, solutionPoints);

		let {squares, regions} = PenpaRegions.findSudokuSquares(pu);
		if (!regions) {
			PenpaRegions.findSudokuRegions(pu, squares);
		}

		//TODO: Can/should this be done before region detection?
		expandGridForFillableOutsideFeatures(pu);

		if (PenpaConverter.flags.expandGrid) {
			expandGridForWideOutsideClues(pu);
		}

		// Determine visual cell grid bounding box
		let {top, left, height, width} = PenpaTools.getBoundsRC(pu.centerlist, PenpaTools.point2cell);

		// Update with calculated top-left position
		puzinfo.col0 = left;
		puzinfo.row0 = top;
		puzinfo.width = width;
		puzinfo.height = height;

		let puzzle = {
			id: puzinfo.id,
			settings: {},
		};
		createBlankPuzzle(pu, puzzle, width, height);

		
		positionBoard(pu, puzzle, puzinfo);
		
		if (!hideGridLines(pu, puzzle, puzinfo)) {
			// must be after hideGridLines
			if (PenpaConverter.flags.removeFrame) {
				removeFrameWhenEqualToRegions(pu, puzzle, puzinfo, regions);
			}
		}
		
		addSudokuRegions(pu, puzzle, squares, regions, uniqueRowsCols);

		addCageMetadata(pu, puzzle);

		addGivens(pu, puzzle);

		prepareKillercages(pu);

		let qa = 'pu_q';
		render_surface(qa, pu, puzzle);
		render_deletelineE(qa, pu, puzzle);

		render_symbol(qa, pu, puzzle, 1);
		render_squareframe(qa, pu, puzzle);
		render_thermo(qa, pu, puzzle);
		render_nobulbthermo(qa, pu, puzzle);
		render_arrows(qa, pu, puzzle);
		render_wall(qa, pu, puzzle);
		// draw_frame()
		render_polygon(qa, pu, puzzle);
		render_freeline(qa, pu, puzzle);
		render_freelineE(qa, pu, puzzle);
		render_line(qa, pu, puzzle);
		render_lineE(qa, pu, puzzle);
		render_direction(qa, pu, puzzle);
		// draw_lattice();
		render_symbol(qa, pu, puzzle, 2);
		render_cage(qa, pu, puzzle);
		render_killercages(qa, pu, puzzle);
		render_number(qa, pu, puzzle);
		render_numberS(qa, pu, puzzle);
				
		drawBoardLattice(pu, puzzle, puzinfo);
		
		render_frame(qa, pu, puzzle);

		// Create cage to define the board bounds when there are no regions
		if(puzzle.regions.length === 0) {
			const {matrix2point, point2cell} = PenpaTools;
			let tlbr = (squares.length !== 1
						? [[0, 0], [puzinfo.height - 1, puzinfo.width - 1]] 
						: [[squares[0].r, squares[0].c], [squares[0].r + squares[0].size - 1, squares[0].c + squares[0].size - 1]])
					.map(matrix2point).map(point2cell);	
			puzzleAdd(puzzle, 'cages', {cells: tlbr, unique: false, hidden: true}, 'bounds');
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

		addSolution(pu, puzzle, puzinfo);
		
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
}
