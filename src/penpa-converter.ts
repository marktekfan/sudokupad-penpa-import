import { PenpaTools, ReduceSurfacesPredicate } from './penpa-tools.js';
import { PenpaSymbol } from './penpa-symbol.js';
import { Color, set_surface_style, set_line_style } from './penpa-style.js';
import { md5Digest } from './sudokupad/utilities.js';
import { Ctx, DrawingContext } from './penpa-drawingcontext.js';
import { PenpaRegions } from './penpa-regions.js';
import { PenpaLoader } from './penpa-loader/penpa-loader.js';
import tinycolor from 'tinycolor2';
import { getPuSolution } from './penpa-solution.js';
import { PenpaAnalyzer, PuInfo } from './penpa-analyzer.js';
import { ConverterSettings } from './converter-settings.js';
import { CellFeature, LineFeature, NumberFeature, PenpaPuzzle, Pu_qa } from './penpa-loader/penpa-puzzle.js';
import { SclPuzzle } from './sclpuzzle';
import type { SclCage, SclFeature } from './sclpuzzle';
import type { WayPointLine } from './penpa-tools';

//let _rnd = 0; // static random seed

function getGiven(pu: PenpaPuzzle, pos: string) {
	let given = null;
	if (pu.centerlist.includes(Number(pos))) {
		const { number } = pu.pu_q;
		const num = number[pos];
		if (num && num[1] == 1) {
			//Black
			if (['1', '2', '4', '10'].includes(num[2]) && num[0].toString().length === 1) {
				//Normal, Arrow, Tapa or Big single digit
				given = num[0];
			} else if (num[2] === '7') {
				//Sudoku number
				let count = (num[0] as number[]).reduce((n, acc) => n + acc, 0);
				if (count === 1) {
					let idx = (num[0] as number[]).findIndex(n => n === 1);
					given = (idx + 1).toString();
				}
			}
		}
	}
	return given;
}

function addGivens(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	const { number } = pu.pu_q;
	const { point2cell } = PenpaTools;
	for (let pos in number) {
		let given = getGiven(pu, pos);
		if (given !== null) {
			let [r, c] = point2cell(pos);
			let cell = puzzle.cells[r][c];
			cell.value = given;
			cell.given = true;
			(number[pos] as any).role = 'given'; // Exclude from rendering
		}
	}
}

function puzzleAdd(puzzle: SclPuzzle, feature: SclFeature, part: any, note?: string) {
	if (ConverterSettings.flags.debug && note) {
		part.penpa = note;
	}
	puzzle.addFeature(feature, part);
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

function addCageMetadata(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	const { numberS, killercages } = pu.pu_q;
	Object.keys(numberS).forEach(pos => {
		let matches = String(numberS[pos][0]).trim().match(reMetaTagsStripCells);
		if (matches) {
			applyDefaultMeta(puzzle, matches[1], matches[2]);
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

function addSudokuRegions(pu: PenpaPuzzle, puzzle: SclPuzzle, { squares, regions, uniqueRowsCols }: PuInfo) {
	const { matrix2point, point2cell } = PenpaTools;
	let enableConflictChecker = false;

	if (['square', 'sudoku'].includes(pu.gridtype)) {
		let complete =
			regions ||
			squares.every(sq => Object.keys(sq.regions).length === sq.size && Object.keys(sq.regions).every(reg => sq.regions[reg].length === sq.size));
		if (complete && squares.length === 1) {
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
		puzzle.settings!['conflictchecker'] = 0;
	}
}

// Add puzzle solution
function addSolution(pu: PenpaPuzzle, puzzle: SclPuzzle, puinfo: PuInfo) {
	const { point2cell } = PenpaTools;
	const { width, height } = puinfo;
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
			let [p1, p2, _val] = s.split(',');
			[p1, p2].forEach(point => {
				let [r, c] = point2cell(point);
				let pos = r * width + c;
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = '.';
				}
			});
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
		const { number } = pu.pu_q;
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

		let solString = sol.map(n => (n.length !== 1 ? '?' : n.toLowerCase())).join('');
		puzzleAdd(puzzle, 'cages', { value: `solution: ${solString}` }, 'solution');
	}
}

function hideGridLines(pu: PenpaPuzzle, _puzzle: SclPuzzle, puinfo: PuInfo) {
	const { point2matrix, matrix2point, getBoundsRC, makePointPair } = PenpaTools;
	const { centerlist } = pu;

	const { top, left, bottom, right, height, width } = getBoundsRC(centerlist, point2matrix);
	// Create 'outside cell mask' only when cells are removed
	if (centerlist.length === width * height) {
		return false;
	}

	// Mask off non-grid grid lines
	let maskedCells = [];
	for (let r = top; r <= bottom; r++) {
		for (let c = left; c <= right; c++) {
			let p = matrix2point(r, c);
			if (!centerlist.includes(p)) {
				maskedCells.push(p);
			}
		}
	}

	let { deletelineE } = pu.pu_q;

	for (let c of maskedCells) {
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

	puinfo.hasCellMask = true;
	return true;
}

function drawBoardLattice(pu: PenpaPuzzle, puzzle: SclPuzzle, puinfo: PuInfo) {
	const { point2RC } = PenpaTools;
	// Dotted grid lines
	// if (pu.mode.grid[0] === '2') {
	// 	puzzle.settings['dashedgrid'] = 1;
	// }
	// No grid lines
	if (pu.mode.grid[0] === '3') {
		puzzle.settings!['nogrid'] = 1; // not (yet) implemented
	}
	// // Grid points
	if (pu.mode.grid[1] === '1') {
		let ctx = new DrawingContext();
		ctx.target = puinfo.hasCellMask ? 'overlay' : 'cell-grids';
		ctx.strokeStyle = Color.BLACK;
		ctx.lineWidth = 4;
		ctx.lineCap = 'round';
		let verticelist = [];
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

function positionBoard(_pu: PenpaPuzzle, puzzle: SclPuzzle, puinfo: PuInfo) {
	// Add transparant rectangle to position the puzzle
	const ctx = new DrawingContext();
	// const opts = Object.assign(ctx.toOpts(), {
	// 	backgroundColor: Color.TRANSPARENTWHITE,
	// 	//   backgroundColor: '#cc4440',
	// 	center: [puinfo.ny / 2 - puinfo.row0, puinfo.nx / 2 - puinfo.col0],
	// 	width: puinfo.nx,
	// 	height: puinfo.ny,
	// });
	const opts = Object.assign(ctx.toOpts(), {
		backgroundColor: Color.TRANSPARENTWHITE,
		//  backgroundColor: '#cc4440',
		center: PenpaTools.point2RC(puinfo.center_n),
		width: puinfo.width_c - 1,
		height: puinfo.height_c - 1,
		class: 'board-position',
	});
	puzzleAdd(puzzle, 'underlays', opts, 'board position');
}

const applyDefaultMeta = (puzzle: SclPuzzle, metaName: string, value?: string, defaultValue?: string) => {
	let metaValue = value || defaultValue;
	if (metaValue !== undefined) {
		puzzle.cages = puzzle.cages || [];
		let metaPrefix = `${metaName}: `;
		if (puzzle.cages.find(cage => (cage.value || '').indexOf(metaPrefix) === 0) === undefined) {
			puzzle.cages.push({ value: `${metaPrefix}${metaValue}` });
		}
	}
};

function render_surface(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	const list = pu['pu_q'].surface || [];
	const listCol = pu['pu_q_col'].surface || [];
	const { point2RC, isBoardCell } = PenpaTools;
	const keys = Object.keys(list); //keys.sort();
	let centers = keys.map(k => ({ center: point2RC(k), value: list[k], key: Number(k), height: 1, width: 1 }));
	const predicate: ReduceSurfacesPredicate = (s1, s2) => {
		return (
			true &&
			((listCol[s1.key] && listCol[s1.key] === listCol[s2.key]) || (!listCol[s1.key] && s1.value === s2.value)) &&
			pu.centerlist.includes(s1.key) === pu.centerlist.includes(s2.key) &&
			isBoardCell(s1.center) === isBoardCell(s2.center)
		);
	};
	PenpaTools.reduceSurfaces(centers, predicate).forEach(surface => {
		let ctx = new DrawingContext();
		set_surface_style(ctx, surface.value);
		if (listCol[surface.key]) {
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

function render_number(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: NumberFeature = 'number') {
	const draw = new PenpaSymbol(pu, puzzle, 64, { puzzleAdd });
	const list = pu.pu_q[feature] || [];
	Object.keys(list).forEach(key => {
		if (key.slice(-1) === 'E') {
			key = key.slice(0, -1);
		}
		const number = list[key];
		if ((number as any).role !== undefined) return;
		let ctx = new DrawingContext();
		draw.draw_number(ctx, number, key);
	});
}

function render_numberS(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: NumberFeature = 'numberS') {
	const draw = new PenpaSymbol(pu, puzzle, 64, { puzzleAdd });
	const list = pu.pu_q[feature] || [];
	const { point2cell, point2centerPoint } = PenpaTools;
	Object.keys(list).forEach(key => {
		const number = list[key];
		let ctx = new DrawingContext();
		if ((number as any).role) {
			return;
		}
		draw.draw_numberS(ctx, number, key);
		const p = Number(key);
		if (pu.point[p].type === 4 && p % 4 === 0) {
			// top-left cell corner
			if (pu.centerlist.includes(point2centerPoint(key))) {
				let rc = point2cell(key);
				let cell = puzzle.cells[rc[0]][rc[1]];
				cell.pencilMarks = [' '];
			}
		}
	});
}

function render_symbol(pu: PenpaPuzzle, puzzle: SclPuzzle, layer = 1) {
	const feature = 'symbol';
	const draw = new PenpaSymbol(pu, puzzle, 64, { puzzleAdd });
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const { point2RC } = PenpaTools;
	Object.keys(list).forEach(key => {
		const symbol = list[key];
		if (symbol[2] !== layer) return;
		const ctx = new DrawingContext();
		if (key.slice(-1) === 'E') {
			key = key.slice(0, -1);
		}
		let maskedCell = isMaskedCell(pu, Number(key));
		// In front of lines or on an outside/masked cell.
		if (symbol[2] === 2 || maskedCell) {
			ctx.target = 'overlay';
		}
		const [r, c] = point2RC(key);
		ctx.role = (symbol as any).role;
		draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
	});
}

function render_freeline(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	draw_line(pu, puzzle, 'freeline');
}

function render_freelineE(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	draw_line(pu, puzzle, 'freelineE', 'overlay');
}

function render_thermo(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'thermo') {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const { point2RC } = PenpaTools;
	render_nobulbthermo(pu, puzzle, feature);
	list.forEach((line, i) => {
		if (line.length === 0) return;
		let cells = line.map(point2RC);
		let color = listCol[i] || '#CFCFCF';
		puzzleAdd(
			puzzle,
			'underlays',
			{
				borderColor: color,
				backgroundColor: color,
				center: cells[0],
				rounded: true,
				width: 0.85,
				height: 0.85,
				role: 'thermobulb',
			},
			feature + ' bulb'
		);
	});
}

function render_arrows(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'arrows') {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const { point2RC } = PenpaTools;
	list.forEach((line, i) => {
		if (line.length < 2) return;
		const target = isMaskedLine(pu, line) ? { target: 'overlay' } : {};
		let points = PenpaTools.reduceWayPoints(line.map(point2RC));
		let commonend = pu.find_common(pu.pu_q, i, line[line.length - 1], feature);
		points = PenpaTools.shortenLine(points, 0.4, commonend ? 0.1 : 0);
		let color = listCol[i] || '#a1a1a1';
		puzzleAdd(
			puzzle,
			'arrows',
			Object.assign(
				{
					color: color,
					headLength: 0.3,
					thickness: 5,
					wayPoints: PenpaTools.reduceWayPoints(points),
				},
				target
			),
			feature
		);

		const bulbStrokeThickness = 5;
		puzzleAdd(
			puzzle,
			'overlays',
			Object.assign(
				{
					borderColor: color,
					backgroundColor: '#FFFFFF',
					center: point2RC(line[0]),
					borderSize: bulbStrokeThickness,
					rounded: true,
					width: 0.83, // round3(0.75 + bulbStrokeThickness / 64),
					height: 0.83, // round3(0.75 + bulbStrokeThickness / 64),
					role: 'arrowbulb',
				},
				target
			),
			feature + ' circle'
		);
	});
}

function render_direction(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'direction') {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const { point2RC } = PenpaTools;
	list.forEach((line, i) => {
		if (line.length < 2) return;
		const target = isMaskedLine(pu, line) ? { target: 'overlay' } : {};
		let points = line.map(point2RC);
		let commonend = pu.find_common(pu.pu_q, i, line[line.length - 1], feature);
		points = PenpaTools.shortenLine(points, 0, commonend ? 0.1 : 0);
		let color = listCol[i] || '#a1a1a1';
		puzzleAdd(
			puzzle,
			'arrows',
			Object.assign(
				{
					color: color,
					headLength: 0.3,
					thickness: 5,
					wayPoints: PenpaTools.reduceWayPoints(points),
				},
				target
			),
			feature
		);
	});
}

function render_squareframe(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'squareframe') {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const { point2RC } = PenpaTools;
	list.forEach((line, i) => {
		if (line.length === 0) return;
		const target = isMaskedLine(pu, line) ? { target: 'overlay' } : {};
		let cells = line.map(point2RC);
		let color = listCol[i] || '#CFCFCF';
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(
				{
					color: color,
					thickness: 64 * 0.8,
					'stroke-linecap': 'square',
					'stroke-linejoin': 'square',
					wayPoints: PenpaTools.reduceWayPoints(cells),
				},
				target
			),
			feature
		);
	});
}

function render_polygon(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'polygon') {
	const { point2RC, ColorIsVisible, getMinMaxRC, round1, round3 } = PenpaTools;
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	for (let key in list) {
		const target = { target: 'underlay' };
		let points = list[key].filter(p => pu.point[p]).map(point2RC);
		if (points.length < 2) continue;
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
		if (ConverterSettings.flags.useClipPath && wp && ColorIsVisible(ctx.fillStyle)) {
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
				'clip-path': `polygon(${wp.map(([yy, xx]) => `${round1(((xx - left) / scalex) * 100)}% ${round1(((yy - top) / scaley) * 100)}%`).join(',')})`,
			});
			puzzleAdd(puzzle, 'underlays', opts, feature);
		} else {
			ctx.pop();
			puzzleAdd(
				puzzle,
				'lines',
				Object.assign(
					ctx.toOpts('line'),
					{
						'fill-rule': 'nonzero',
						fill: ctx.fillStyle,
						wayPoints: PenpaTools.reduceWayPoints(points),
					},
					target
				),
				feature
			);
		}
	}
}

function render_frame(pu: PenpaPuzzle, puzzle: SclPuzzle, puinfo: PuInfo) {
	const list = pu.frame || [];
	let wpList = PenpaTools.reducePenpaLines2WaypointLines(list);
	wpList.forEach(line => {
		if (line.wayPoints.length < 2) return;
		let ctx = new DrawingContext();
		//ctx.target = 'overlay';
		ctx.target = puinfo.foglight ? 'overlay' : 'cell-grids'; // note 'overlay' can cause visual outlining
		set_line_style(ctx, line.value);
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
			}),
			'frame'
		);
	});
}

function draw_line(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: LineFeature, target?: string) {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
	const excludedLines: Dictionary = feature === 'lineE' ? pu.pu_q.deletelineE || [] : [];
	let wpList = PenpaTools.reducePenpaLines2WaypointLines(list, listCol, excludedLines);
	wpList.forEach(line => {
		if (line.wayPoints.length < 2) return;
		let ctx = new DrawingContext();
		if (target) {
			ctx.target = target;
		} else if (isMaskedLine(pu, line.keys)) {
			ctx.target = 'overlay';
		}
		// This is a line over a deleted grid line -> Move to cell-grids to prevent visual outlines.
		if (excludedLines.length != 0 && excludedLines[PenpaTools.makePointPair(line.keys[0], line.keys[line.keys.length - 1])]) {
			ctx.target = 'cell-grids';
		}
		set_line_style(ctx, line.value);
		if (line.cc) {
			ctx.strokeStyle = line.cc;
		}
		if (line.value === 30) {
			drawDoubleLine(ctx, line, puzzle);
		} else if (line.value === 40) {
			drawShortLine(ctx, line, puzzle);
		} else {
			const isCenter = [0, 2, 3].includes(pu.point[line.keys[0]].type);
			if (isCenter && [3, 3 * 0.85].includes(ctx.lineWidth) && ctx.lineDash.length === 0) {
				if (ConverterSettings.flags.fadeLines) {
					ctx.strokeStyle = PenpaTools.ColorApplyAlpha(ctx.strokeStyle, ConverterSettings.flags.doubleLayer as boolean);
				}
				if (ConverterSettings.flags.thickLines) {
					ctx.lineWidth = (11 * ctx.penpaSize) / ctx.ctcSize;
				}
			}
			puzzleAdd(
				puzzle,
				'lines',
				Object.assign(ctx.toOpts('line'), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				}),
				feature
			);
		}
	});
	drawXmarks(pu, puzzle, feature);
}

function render_line(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	draw_line(pu, puzzle, 'line');
}

function render_lineE(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	draw_line(pu, puzzle, 'lineE', 'overlay');
}

function render_wall(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	draw_line(pu, puzzle, 'wall');
}

function render_cage(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: LineFeature = 'cage') {
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature];
	let wpLines = PenpaTools.penpaLines2WaypointLines(list, listCol);
	const killercages = pu.pu_q.killercages || [];
	const { point2centerPoint, objectEquals, round3 } = PenpaTools;
	let cageLines = PenpaTools.concatenateEndpoints(wpLines);
	const killerOutlines = killercages.map(cells => PenpaTools.getOutlinePoints(cells));
	const cageOutlines = cageLines.map(line => [...new Set<number>(line.keys.map((p: number) => point2centerPoint(p)))].sort((a, b) => a - b));

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
						pu.pu_q_col['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
					} else {
						// Custom color or not black dash
						if (line.cc || line.value !== 10) {
							// Copy color to killercage and filter out individual cage line
							let ctx = new DrawingContext();
							set_line_style(ctx, line.value, line.cc);
							pu.pu_q_col['killercages'][killer_idx] = line.cc || ctx.strokeStyle;
						}
						// Cage is implicitly drawn by killercage
						line.killercage = killer_idx;
					}
				} else {
					// Not a closed loop, but fully covering a killercage
					// Then make cage invisible (cage is drawn by cage line)
					pu.pu_q_col['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
				}
				return true;
			}
		});
		if (!fullmatch) {
			// No full match
			// cage lines should be drawn by lines, and make cage invisible
			pu.pu_q_col['killercages'][killer_idx] = Color.TRANSPARENTBLACK;
		}
	});

	const r = 0.17;
	cageLines.forEach(line => {
		// Skip when cage is drawn by killercage
		if (line.killercage !== undefined) return;

		// Align cage lines with SudokuPad cages lines
		(line.wayPoints as RC[]).forEach(wp => {
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
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				target: 'cages',
			}),
			feature + ' line'
		);
	});
}

// Must be rendered before numberS
function render_killercages(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	const feature = 'killercages';
	const list = pu.pu_q.killercages || [];
	const listCol = pu.pu_q_col[feature];
	const { point2cell } = PenpaTools;
	list.forEach((cageArray, i) => {
		if (cageArray.length === 0) return;
		let cagePart: SclCage = {
			unique: true,
			cells: cageArray.map(point2cell),
		};
		if (listCol[i]) {
			cagePart.borderColor = listCol[i];
		}
		if ((cageArray as any)['value'] !== undefined) {
			cagePart.value = (cageArray as any)['value'];
		}
		puzzleAdd(puzzle, 'cages', cagePart, feature);
	});
}

function render_deletelineE(pu: PenpaPuzzle, puzzle: SclPuzzle) {
	const feature = 'deletelineE';
	const list: Dictionary<any> = pu.pu_q[feature] || [];
	const surface = pu.pu_q.surface;
	const surfaceCol = pu.pu_q_col.surface || [];
	const { point2RC, puinfo } = PenpaTools;
	const { width, height } = puinfo;
	const isOnPerimeter = function (k: string) {
		const [p1, p2] = k.split(',');
		const [r1, c1] = point2RC(p1);
		const [r2, c2] = point2RC(p2);
		return (r1 === 0 && r2 === 0) || (c1 === 0 && c2 === 0) || (r1 === height && r2 === height) || (c1 === width && c2 === width);
	};
	const perimeter: Dictionary = {};
	const fogline: Dictionary = {};
	if (puinfo.foglight) {
		Object.keys(list).forEach(k => {
			// Move line to perimeter list, which is rendered last
			if (isOnPerimeter(k)) {
				perimeter[k] = 'perimeter';
				list[k] = 0;
			} else {
				// duplicate to fogline list
				fogline[k] = 'fog';
			}
		});
	} else {
		//const darkBackgrounds = [Color.BLACK, Color.BLACK_LIGHT, Color.GREY_DARK_VERY];
		Object.keys(list).forEach(k => {
			const [p1, p2] = PenpaTools.getAdjacentCellsOfEdgeLine(pu, k);
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
				const { doubleLayer } = ConverterSettings.flags;
				if (fillStyle1 !== fillStyle2) {
					const color1 = tinycolor(fillStyle1);
					const color2 = tinycolor(fillStyle2);
					const newcolor = tinycolor.mix(color1, color2);
					list[k] = PenpaTools.ColorApplyAlpha(PenpaTools.toHexColor(newcolor), doubleLayer);
					//list[l] = -1; // =>line.value = -1
				} else {
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
	([] as WayPointLine[]).concat(combined, combinedFogline, combinedPerimeter).forEach(line => {
		if (line.value <= 0) return; // Skip not visible line
		let { wayPoints } = line;
		let width = 4;
		let color = '#FFFFFF';
		let target = puinfo.foglight ? 'overlay' : 'cell-grids';
		wayPoints = PenpaTools.shortenLine(wayPoints, 1.2 / 64, 1.2 / 64);
		if ((line.value as any) === 'fog') {
			width = 1;
			color = '#afafaf';
			target = 'cell-grids';
		} else if ((line.value as any) === 'perimeter') {
			target = 'cell-grids'; // Should never be hidden by fog
		} else if (typeof line.value === 'string') {
			width = 1;
			color = line.value;
		}
		const ctx = new DrawingContext();
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints(wayPoints),
				color: color,
				// color: '#FF40A0'
				thickness: width,
				target: target,
			}),
			feature
		);
	});
}

function render_nobulbthermo(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: CellFeature = 'nobulbthermo') {
	function find_common(pu: Pu_qa, line: number[], endpoint: number) {
		if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
		if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
		return false;
	}
	const { point2RC, puinfo } = PenpaTools;
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature];
	const reduce_straight = 0.32;
	const reduce_diagonal = 0.22;
	list.forEach((line, i) => {
		if (line.length < 2) return;
		const maskedLine = isMaskedLine(pu, line);
		const target = maskedLine ? { target: 'overlay' } : {};
		if (maskedLine) {
			line.forEach(p => puinfo.maskedCells.push(p));
		}
		let cells = line.map(point2RC);
		if (cells.length >= 2) {
			let end = line[line.length - 1];
			if (find_common(pu.pu_q, line, end)) {
				let rcEnd = cells[cells.length - 1];
				let rc2 = cells[cells.length - 2];
				let dy = Math.sign(rcEnd[0] - rc2[0]);
				let dx = Math.sign(rcEnd[1] - rc2[1]);
				if (dx === 0 || dy === 0) {
					rcEnd[0] -= dy * reduce_straight;
					rcEnd[1] -= dx * reduce_straight;
				} else {
					rcEnd[0] -= dy * reduce_diagonal;
					rcEnd[1] -= dx * reduce_diagonal;
				}
			}
			let color = listCol[i] || '#CFCFCF';
			puzzleAdd(
				puzzle,
				'lines',
				Object.assign(
					{
						color: color,
						thickness: 21,
						wayPoints: PenpaTools.reduceWayPoints(cells),
					},
					target
				),
				'thermo line'
			);
		}
	});
}

function isMaskedCell(pu: PenpaPuzzle, p: number) {
	const { puinfo, point2RC, isBoardCell } = PenpaTools;
	if (!puinfo.hasCellMask) return false;
	p = Number(p);
	if (puinfo.maskedCells.includes(p)) return true;
	if (pu.centerlist.includes(p)) return false;
	if (isBoardCell(point2RC(p))) return true;
	return false;
}

function isMaskedLine(pu: PenpaPuzzle, line: number[]) {
	const { puinfo, point2matrix, matrix2point } = PenpaTools;
	if (!puinfo.hasCellMask || line.length < 2) return false;
	let p = line[0];
	// Must be center line (cell or edge)
	if (![0, 2, 3].includes(puinfo.point[p].type)) return false;
	if (puinfo.maskedCells.includes(p)) return true;
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
			if (puinfo.maskedCells.includes(pnext)) return true;
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

function drawXmarks(pu: PenpaPuzzle, puzzle: SclPuzzle, feature: LineFeature) {
	const { point2RC } = PenpaTools;
	const list = pu.pu_q[feature] || [];
	const listCol = pu.pu_q_col[feature] || [];
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
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints([
					[y - r, x - r],
					[y + r, x + r],
				]),
			}),
			'x'
		);
		puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: PenpaTools.reduceWayPoints([
					[y + r, x - r],
					[y - r, x + r],
				]),
			}),
			'x'
		);
	});
}

function drawShortLine(ctx: DrawingContext, line: WayPointLine, puzzle: SclPuzzle) {
	let shortLine = PenpaTools.shrinkLine(line.wayPoints, 0.2);
	puzzleAdd(
		puzzle,
		'lines',
		Object.assign(ctx.toOpts('line'), {
			wayPoints: shortLine,
		}),
		'short line'
	);
}

function drawDoubleLine(ctx: DrawingContext, line: WayPointLine, puzzle: SclPuzzle) {
	const r = 0.15;
	let p1 = line.wayPoints[0];
	let p2 = line.wayPoints[1];
	let dx = p1[1] - p2[1];
	let dy = p1[0] - p2[0];
	let d = Math.sqrt(dx * dx + dy * dy);
	let rx = (r / d) * dx;
	let ry = (r / d) * dy;
	puzzleAdd(
		puzzle,
		'lines',
		Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints([
				[p1[0] + rx, p1[1] - ry],
				[p2[0] + rx, p2[1] - ry],
			]),
		}),
		'double line 1'
	);
	puzzleAdd(
		puzzle,
		'lines',
		Object.assign(ctx.toOpts('line'), {
			wayPoints: PenpaTools.reduceWayPoints([
				[p1[0] - rx, p1[1] + ry],
				[p2[0] - rx, p2[1] + ry],
			]),
		}),
		'double line 2'
	);
}

function removeFrameWhenEqualToRegions(pu: PenpaPuzzle, _puzzle: SclPuzzle, puinfo: PuInfo, regions: Dictionary) {
	if (!regions) return;
	if (puinfo.hasCellMask) return;

	// frame must exactly match all regions
	// Then frame can be removed
	let frame = Object.assign({}, pu.frame);
	(regions as RC[][]).forEach(reg => {
		let outline = PenpaRegions.createOutline(pu, reg) as string[];
		outline.forEach(line => delete frame[line]);
	});

	// Remove frame lines when fully overlapped by regions
	if (Object.keys(frame).length === 0) {
		pu.frame = {};
	}
}

export class PenpaConverter {
	static isDoubleLayer = (ctx: Ctx) =>
		(ConverterSettings.flags.doubleLayer || 0) && PenpaTools.ColorIsVisible(ctx.fillStyle) && !PenpaTools.ColorIsOpaque(ctx.fillStyle);

	static convertPenpaPuzzle = function (pu: PenpaPuzzle | string) {
		if (typeof pu === 'string') {
			pu = PenpaLoader.loadPenpaPuzzle(pu)!;
		}
		if (!pu) return;

		const { puinfo } = PenpaAnalyzer.preparePenpaPuzzle(pu);

		DrawingContext.ctcSize = 64;
		DrawingContext.penpaSize = puinfo.originalSize;

		let puzzle = new SclPuzzle(puinfo.height, puinfo.width);
		puzzle.id = `penpa${md5Digest(puinfo.originalPu)}`;
		puzzle.cellSize = 64;
		puzzle.settings = {};

		positionBoard(pu, puzzle, puinfo);

		if (!hideGridLines(pu, puzzle, puinfo)) {
			// must be after hideGridLines
			if (ConverterSettings.flags.removeFrame) {
				removeFrameWhenEqualToRegions(pu, puzzle, puinfo, puinfo.regions);
			}
		}

		addSudokuRegions(pu, puzzle, puinfo);

		addCageMetadata(pu, puzzle);

		addGivens(pu, puzzle);

		//let qa = 'pu_q';
		render_surface(pu, puzzle);
		render_deletelineE(pu, puzzle);

		render_symbol(pu, puzzle, 1);
		render_squareframe(pu, puzzle);
		render_thermo(pu, puzzle);
		render_nobulbthermo(pu, puzzle);
		render_arrows(pu, puzzle);
		render_wall(pu, puzzle);
		// draw_frame()
		render_polygon(pu, puzzle);
		render_freeline(pu, puzzle);
		render_freelineE(pu, puzzle);
		render_line(pu, puzzle);
		render_lineE(pu, puzzle);
		render_direction(pu, puzzle);
		// draw_lattice();
		render_symbol(pu, puzzle, 2);
		render_cage(pu, puzzle);
		render_killercages(pu, puzzle);
		render_number(pu, puzzle);
		render_numberS(pu, puzzle);

		drawBoardLattice(pu, puzzle, puinfo);

		render_frame(pu, puzzle, puinfo);

		// Create cage to define the board bounds when there are no regions
		if (!puzzle.regions || puzzle.regions.length === 0) {
			const { matrixRC2point, point2cell } = PenpaTools;
			const { squares } = puinfo;
			let tlbr = (
				(squares.length !== 1
					? [
							[0, 0],
							[puinfo.height - 1, puinfo.width - 1],
					  ]
					: [
							[squares[0].r, squares[0].c],
							[squares[0].r + squares[0].size - 1, squares[0].c + squares[0].size - 1],
					  ]) as RC[]
			)
				.map(matrixRC2point)
				.map(point2cell);
			puzzleAdd(puzzle, 'cages', { cells: tlbr, unique: false, hidden: true }, 'bounds');
		}

		// Custom patch the puzzle
		// Sneeky text substute to supress anti-knight rule, which would otherwise apply to whole board
		if (puinfo.rules.indexOf('Box 4: Antiknight') !== -1) {
			puinfo.rules = puinfo.rules.replace('Box 4: Antiknight', 'Box 4: Antik\u0578ight');
		}

		addSolution(pu, puzzle, puinfo);

		const defaultTitle = 'Untitled';
		const defaultAuthor = 'Unknown';
		const defaultRules = 'No rules provided';

		// Add puzzle meta data
		applyDefaultMeta(puzzle, 'title', puinfo.title, defaultTitle);
		applyDefaultMeta(puzzle, 'author', puinfo.author, defaultAuthor);
		applyDefaultMeta(puzzle, 'rules', puinfo.rules, defaultRules);
		if (puinfo.custom_message) {
			applyDefaultMeta(puzzle, 'msgcorrect', puinfo.custom_message);
		}

		// console.log(pu, puzzle);
		return puzzle;
	};
}
