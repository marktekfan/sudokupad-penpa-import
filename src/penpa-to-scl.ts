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
import { ConverterFlags, FlagValues } from './converter-flags.js';
import { CellFeature, LineFeature, NumberFeature, PenpaPuzzle, Pu_qa } from './penpa-loader/penpa-puzzle.js';
import { SclPuzzle } from './sclpuzzle.js';
import type { SclCage, SclFeature } from './sclpuzzle.js';
import type { WayPointLine } from './penpa-tools.js';

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

function addGivens(puinfo: PuInfo, puzzle: SclPuzzle) {
	const { pu, penpaTools } = puinfo;
	const { number } = pu.pu_q;
	const { point2cell } = penpaTools;
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

function addCageMetadata(puinfo: PuInfo, puzzle: SclPuzzle) {
	const { pu, penpaTools } = puinfo;
	const { numberS, killercages } = pu.pu_q;
	Object.keys(numberS).forEach(pos => {
		let matches = String(numberS[pos][0]).trim().match(reMetaTagsStripCells);
		if (matches) {
			applyDefaultMeta(puzzle, matches[1], matches[2]);
			delete numberS[pos];
			// Remove meta killercage
			let killerCell = penpaTools.point2centerPoint(pos);
			for (let i = 0; i < killercages.length; i++) {
				if (killercages[i].length === 1 && killercages[i].includes(killerCell)) {
					killercages[i] = [];
				}
			}
		}
	});
}

function hideGridLines(puinfo: PuInfo, _puzzle: SclPuzzle) {
	const { pu, penpaTools } = puinfo;
	const { getBoundsRC, makePointPair } = PenpaTools;
	const { point2matrix, matrix2point } = penpaTools;
	const { centerlist } = pu;

	const { top, left, bottom, right, height, width } = getBoundsRC(centerlist, point2matrix);
	// Create 'outside cell mask' only when cells are removed
	if (centerlist.length === width * height) {
		return false;
	}

	// Mask off non-grid grid lines
	const { maskedCells } = puinfo;
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

function isMaskedCell(puinfo: PuInfo, p: number) {
	const { pu, penpaTools } = puinfo;
	const { point2RC, isBoardCell } = penpaTools;
	if (!puinfo.hasCellMask) return false;
	p = Number(p);
	if (puinfo.maskedCells.includes(p)) return true;
	if (pu.centerlist.includes(p)) return false;
	if (isBoardCell(point2RC(p))) return true;
	return false;
}

function isMaskedLine(puinfo: PuInfo, line: number[]) {
	const { penpaTools } = puinfo;
	const { point2matrix, matrix2point } = penpaTools;
	if (!puinfo.hasCellMask || line.length < 2) return false;
	let p = line[0];
	// Must be center line (cell or edge)
	if (![0, 2, 3].includes(puinfo.point[p].type)) return false;
	if (puinfo.maskedCells.includes(p)) return true;
	let prevMasked = isMaskedCell(puinfo, p);
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
			let masked = isMaskedCell(puinfo, pnext);
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

function removeFrameWhenEqualToRegions(puinfo: PuInfo, _puzzle: SclPuzzle, regions: Dictionary) {
	const { pu } = puinfo;
	if (!regions) return;
	if (puinfo.hasCellMask) return;

	// frame must exactly match all regions
	// Then frame can be removed
	let frame = Object.assign({}, pu.frame);
	(regions as RC[][]).forEach(reg => {
		let outline = PenpaRegions.createOutline(puinfo, reg) as string[];
		outline.forEach(line => delete frame[line]);
	});

	// Remove frame lines when fully overlapped by regions
	if (Object.keys(frame).length === 0) {
		pu.frame = {};
	}
}

function hasCommonEnd(pu: Pu_qa, idx: number, endpoint: number, feature: CellFeature) {
	const mapper: Record<string, Array<CellFeature>> = {
		thermo: ['thermo', 'nobulbthermo'],
		nobulbthermo: ['thermo', 'nobulbthermo'],
		arrows: ['arrows', 'direction'],
		direction: ['arrows', 'direction'],
	};
	const types = mapper[feature];
	if (!types) {
		return false;
	}
	for (let type of types) {
		const cellList = pu[type];
		if (!cellList) {
			continue;
		}
		for (var k = 0; k < cellList.length; k++) {
			if (k != idx || type !== feature) {
				if (cellList[k]) {
					for (var m = 1; m < cellList[k].length; m++) {
						if (cellList[k][m] === endpoint) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
}

export class PenpaToSclConverter {
	flags: FlagValues;

	constructor(flags?: FlagValues) {
		this.flags = flags ?? new ConverterFlags().getFlagValues();
	}

	private isDoubleLayer = (ctx: Ctx) => (this.flags.doubleLayer || 0) && PenpaTools.ColorIsVisible(ctx.fillStyle) && !PenpaTools.ColorIsOpaque(ctx.fillStyle);

	private puzzleAdd = (puzzle: SclPuzzle, feature: SclFeature, part: any, note?: string) => {
		if (this.flags.debug && note) {
			part.penpa = note;
		}

		// Remove redundant use of target property
		if (part.target === 'overlay' && feature === 'underlays') {
			feature = 'overlays';
			delete part.target;
		} else if (part.target === 'underlay' && feature === 'overlays') {
			feature = 'underlays';
			delete part.target;
		}

		puzzle.addFeature(feature, part);
	};

	private addSudokuRegions = (puinfo: PuInfo, puzzle: SclPuzzle, { squares, regions, uniqueRowsCols }: PuInfo) => {
		const { pu, penpaTools } = puinfo;
		const { matrix2point, point2cell } = penpaTools;
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
					this.puzzleAdd(puzzle, 'regions', region);
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
	};

	// Add puzzle solution
	private addSolution = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const { point2cell } = penpaTools;
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
			this.puzzleAdd(puzzle, 'cages', { value: `solution: ${solString}` }, 'solution');
		}
	};

	private drawBoardLattice = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const { point2RC } = penpaTools;

		switch (pu.mode.grid[0]) {
			// Dotted grid lines
			case '2':
				//  Implemented in the converter correctly as dashed lines
				//  No special treatment here
				break;

			// No grid lines
			case '3':
				puzzle.settings!['nogrid'] = 1; // not (yet) implemented in SudokuPad apps
				break;
		}

		// Grid points
		if (pu.mode.grid[1] === '1') {
			let ctx = new DrawingContext();
			ctx.target = puinfo.hasCellMask ? 'overlay' : 'cell-grids';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 4;
			ctx.lineCap = 'round';
			let verticelist = new Set<number>();
			// Always use original centerlist for grid points
			for (let p of puinfo.originalCenterlist) {
				for (let j = 0; j < pu.point[p].surround.length; j++) {
					verticelist.add(pu.point[p].surround[j]);
				}
			}
			verticelist.forEach(p => {
				let [y, x] = point2RC(p);
				ctx.moveTo(x, y);
				ctx.lineTo(x, y);
			});
			this.puzzleAdd(puzzle, 'lines', ctx.toOpts(), 'lattice');
		}
	};

	private positionBoard = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { penpaTools } = puinfo;
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
			center: penpaTools.point2RC(puinfo.center_n),
			width: puinfo.width_c - 1,
			height: puinfo.height_c - 1,
			class: 'board-position',
		});
		this.puzzleAdd(puzzle, 'underlays', opts, 'board position');
	};

	private render_surface = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const list = pu['pu_q'].surface || [];
		const listCol = pu['pu_q_col'].surface || [];
		const { point2RC, isBoardCell } = penpaTools;
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
			if (this.isDoubleLayer(ctx)) {
				this.puzzleAdd(puzzle, 'underlays', opts, 'surface');
			}
			this.puzzleAdd(puzzle, 'underlays', opts, 'surface');
		});
	};

	private render_number = (puinfo: PuInfo, puzzle: SclPuzzle, feature: NumberFeature = 'number') => {
		const { pu } = puinfo;
		const draw = new PenpaSymbol(puinfo, puzzle, 64, { puzzleAdd: this.puzzleAdd });
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
	};

	private render_numberS = (puinfo: PuInfo, puzzle: SclPuzzle, feature: NumberFeature = 'numberS') => {
		const { pu, penpaTools } = puinfo;
		const draw = new PenpaSymbol(puinfo, puzzle, 64, { puzzleAdd: this.puzzleAdd });
		const list = pu.pu_q[feature] || [];
		const { point2cell, point2centerPoint } = penpaTools;
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
	};

	private render_symbol = (puinfo: PuInfo, puzzle: SclPuzzle, layer = 1) => {
		const { pu, penpaTools } = puinfo;
		const feature = 'symbol';
		const draw = new PenpaSymbol(puinfo, puzzle, 64, { puzzleAdd: this.puzzleAdd });
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const { point2RC } = penpaTools;
		Object.keys(list).forEach(key => {
			const symbol = list[key];
			if (symbol[2] !== layer) return;
			const ctx = new DrawingContext();
			if (key.slice(-1) === 'E') {
				key = key.slice(0, -1);
			}
			let maskedCell = isMaskedCell(puinfo, Number(key));
			// In front of lines or on an outside/masked cell.
			if (symbol[2] === 2 || maskedCell) {
				ctx.target = 'overlay';
			}
			const [r, c] = point2RC(key);
			ctx.role = (symbol as any).role;
			draw.draw_symbol(ctx, c, r, symbol[0], symbol[1], listCol[key]);
		});
	};

	private render_freeline = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		this.draw_line(puinfo, puzzle, 'freeline');
	};

	private render_freelineE = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		this.draw_line(puinfo, puzzle, 'freelineE', 'overlay');
	};

	private render_thermo = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'thermo') => {
		const { pu, penpaTools } = puinfo;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const { point2RC } = penpaTools;
		this.render_nobulbthermo(puinfo, puzzle, feature);
		list.forEach((line, i) => {
			if (line.length === 0) return;
			let cells = line.map(point2RC);
			let color = listCol[i] || '#CFCFCF';
			this.puzzleAdd(
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
	};

	private render_arrows = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'arrows') => {
		const { pu, penpaTools } = puinfo;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const { point2RC } = penpaTools;
		list.forEach((line, i) => {
			if (line.length < 2) return;
			const target = isMaskedLine(puinfo, line) ? { target: 'overlay' } : {};
			let points = PenpaTools.reduceWayPoints(line.map(point2RC));
			let commonEnd = hasCommonEnd(pu.pu_q, i, line[line.length - 1], feature);
			points = PenpaTools.shortenLine(points, 0.4, commonEnd ? 0.1 : 0);
			let color = listCol[i] || '#a1a1a1';
			this.puzzleAdd(
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
			this.puzzleAdd(
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
	};

	private render_direction = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'direction') => {
		const { pu, penpaTools } = puinfo;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const { point2RC } = penpaTools;
		list.forEach((line, i) => {
			if (line.length < 2) return;
			const target = isMaskedLine(puinfo, line) ? { target: 'overlay' } : {};
			let points = line.map(point2RC);
			let commonEnd = hasCommonEnd(pu.pu_q, i, line[line.length - 1], feature);
			points = PenpaTools.shortenLine(points, 0, commonEnd ? 0.1 : 0);
			let color = listCol[i] || '#a1a1a1';
			this.puzzleAdd(
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
	};

	private render_squareframe = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'squareframe') => {
		const { pu, penpaTools } = puinfo;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const { point2RC } = penpaTools;
		list.forEach((line, i) => {
			if (line.length === 0) return;
			const target = isMaskedLine(puinfo, line) ? { target: 'overlay' } : {};
			let cells = line.map(point2RC);
			let color = listCol[i] || '#CFCFCF';
			this.puzzleAdd(
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
	};

	private render_polygon = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'polygon') => {
		const { pu, penpaTools } = puinfo;
		const { ColorIsVisible, getMinMaxRC, round1, round3 } = PenpaTools;
		const { point2RC } = penpaTools;
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
			if (puinfo.flags.useClipPath && wp && ColorIsVisible(ctx.fillStyle)) {
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
					'clip-path': `polygon(${wp
						.map(([yy, xx]) => `${round1(((xx - left) / scalex) * 100)}% ${round1(((yy - top) / scaley) * 100)}%`)
						.join(',')})`,
				});
				this.puzzleAdd(puzzle, 'underlays', opts, feature);
			} else {
				ctx.pop();
				this.puzzleAdd(
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
	};

	private render_frame = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const list = pu.frame || [];
		let wpList = penpaTools.reducePenpaLines2WaypointLines(list);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			//ctx.target = 'overlay';
			ctx.target = puinfo.foglight ? 'overlay' : 'cell-grids'; // note 'overlay' can cause visual outlining
			set_line_style(ctx, line.value);
			this.puzzleAdd(
				puzzle,
				'lines',
				Object.assign(ctx.toOpts('line'), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
				}),
				'frame'
			);
		});
	};

	private draw_line = (puinfo: PuInfo, puzzle: SclPuzzle, feature: LineFeature, target?: string) => {
		const { pu, penpaTools } = puinfo;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature] || [];
		const usesCustomColor = Object.keys(listCol).some(k => typeof listCol[k] === 'string');
		const excludedLines: Dictionary = feature === 'lineE' ? pu.pu_q.deletelineE || [] : [];
		let wpList = penpaTools.reducePenpaLines2WaypointLines(list, listCol, excludedLines);
		wpList.forEach(line => {
			if (line.wayPoints.length < 2) return;
			let ctx = new DrawingContext();
			if (target) {
				ctx.target = target;
			} else if (isMaskedLine(puinfo, line.keys)) {
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
				this.drawDoubleLine(ctx, line, puzzle);
			} else if (line.value === 40) {
				this.drawShortLine(ctx, line, puzzle);
			} else {
				const isCenter = [0, 2, 3].includes(pu.point[line.keys[0]].type);
				if (isCenter && [3, 3 * 0.85].includes(ctx.lineWidth) && ctx.lineDash.length === 0) {
					if (!usesCustomColor && puinfo.flags.fadeLines) {
						ctx.strokeStyle = PenpaTools.ColorApplyAlpha(ctx.strokeStyle, true);
					}
					if (puinfo.flags.thickLines) {
						ctx.lineWidth = (11 * ctx.penpaSize) / ctx.ctcSize;
					}
				}
				this.puzzleAdd(
					puzzle,
					'lines',
					Object.assign(ctx.toOpts('line'), {
						wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
					}),
					feature
				);
			}
		});
		this.drawXmarks(puinfo, puzzle, feature);
	};

	private render_line = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		this.draw_line(puinfo, puzzle, 'line');
	};

	private render_lineE = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		this.draw_line(puinfo, puzzle, 'lineE', 'overlay');
	};

	private render_wall = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		this.draw_line(puinfo, puzzle, 'wall');
	};

	private render_cage = (puinfo: PuInfo, puzzle: SclPuzzle, feature: LineFeature = 'cage') => {
		const { pu, penpaTools } = puinfo;
		const { objectEquals, round3, concatenateEndpoints } = PenpaTools;
		const { point2centerPoint, getOutlinePoints } = penpaTools;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature];
		let wpLines = penpaTools.penpaLines2WaypointLines(list, listCol);
		const killercages = pu.pu_q.killercages || [];
		let cageLines = concatenateEndpoints(wpLines);
		const killerOutlines = killercages.map(cells => getOutlinePoints(cells));
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
			this.puzzleAdd(
				puzzle,
				'lines',
				Object.assign(ctx.toOpts('line'), {
					wayPoints: PenpaTools.reduceWayPoints(line.wayPoints),
					target: 'cages',
				}),
				feature + ' line'
			);
		});
	};

	// Must be rendered before numberS
	private render_killercages = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const feature = 'killercages';
		const list = pu.pu_q.killercages || [];
		const listCol = pu.pu_q_col[feature];
		const { point2cell } = penpaTools;
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
			this.puzzleAdd(puzzle, 'cages', cagePart, feature);
		});
	};

	private render_deletelineE = (puinfo: PuInfo, puzzle: SclPuzzle) => {
		const { pu, penpaTools } = puinfo;
		const feature = 'deletelineE';
		const list: Dictionary<any> = pu.pu_q[feature] || [];
		const surface = pu.pu_q.surface;
		const surfaceCol = pu.pu_q_col.surface || [];
		const { point2RC, getAdjacentCellsOfEdgeLine, reducePenpaLines2WaypointLines } = penpaTools;
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
				const [p1, p2] = getAdjacentCellsOfEdgeLine(pu, k);
				const s1 = surface[p1];
				const s2 = surface[p2];
				if (s1 || s2) {
					const ctx = new DrawingContext();
					set_surface_style(ctx, s1 || s2);
					const fillStyle1 = s1 ? surfaceCol[p1] || ctx.fillStyle : surfaceCol[p2] || ctx.fillStyle;
					set_surface_style(ctx, s2 || s1);
					const fillStyle2 = s2 ? surfaceCol[p2] || ctx.fillStyle : surfaceCol[p1] || ctx.fillStyle;
					// Don't remove when not visible due to dark background
					//if (darkBackgrounds.includes(fillStyle1) || darkBackgrounds.includes(fillStyle2)) {
					const { doubleLayer } = puinfo.flags;
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
		const combined = reducePenpaLines2WaypointLines(list);
		const combinedPerimeter = reducePenpaLines2WaypointLines(perimeter);
		const combinedFogline = reducePenpaLines2WaypointLines(fogline);
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
			this.puzzleAdd(
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
	};

	private render_nobulbthermo = (puinfo: PuInfo, puzzle: SclPuzzle, feature: CellFeature = 'nobulbthermo') => {
		const { pu, penpaTools } = puinfo;
		function find_common(pu: Pu_qa, line: number[], endpoint: number) {
			if (pu.thermo && pu.thermo.find(l => l !== line && l.includes(endpoint))) return true;
			if (pu.nobulbthermo && pu.nobulbthermo.find(l => l !== line && l.includes(endpoint))) return true;
			return false;
		}
		const { point2RC } = penpaTools;
		const list = pu.pu_q[feature] || [];
		const listCol = pu.pu_q_col[feature];
		const reduce_straight = 0.32;
		const reduce_diagonal = 0.22;
		list.forEach((line, i) => {
			if (line.length < 2) return;
			const maskedLine = isMaskedLine(puinfo, line);
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
				this.puzzleAdd(
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
	};

	private drawXmarks = (puinfo: PuInfo, puzzle: SclPuzzle, feature: LineFeature) => {
		const { pu, penpaTools } = puinfo;
		const { point2RC } = penpaTools;
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
			this.puzzleAdd(
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
			this.puzzleAdd(
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
	};

	private drawShortLine = (ctx: DrawingContext, line: WayPointLine, puzzle: SclPuzzle) => {
		let shortLine = PenpaTools.shrinkLine(line.wayPoints, 0.2);
		this.puzzleAdd(
			puzzle,
			'lines',
			Object.assign(ctx.toOpts('line'), {
				wayPoints: shortLine,
			}),
			'short line'
		);
	};

	private drawDoubleLine = (ctx: DrawingContext, line: WayPointLine, puzzle: SclPuzzle) => {
		const r = 0.15;
		let p1 = line.wayPoints[0];
		let p2 = line.wayPoints[1];
		let dx = p1[1] - p2[1];
		let dy = p1[0] - p2[0];
		let d = Math.sqrt(dx * dx + dy * dy);
		let rx = (r / d) * dx;
		let ry = (r / d) * dy;
		this.puzzleAdd(
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
		this.puzzleAdd(
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
	};

	public convertPenpaToScl = (pu: PenpaPuzzle | string) => {
		if (typeof pu === 'string') {
			pu = PenpaLoader.loadPenpaPuzzle(pu)!;
		}
		if (!pu) return;

		const { puinfo } = PenpaAnalyzer.preparePenpaPuzzle(pu, this.flags);

		DrawingContext.ctcSize = 64;
		DrawingContext.penpaSize = puinfo.originalSize;

		let puzzle = new SclPuzzle(puinfo.height, puinfo.width);
		puzzle.id = `penpa${md5Digest(puinfo.originalPu)}`;
		puzzle.cellSize = 64;
		puzzle.settings = {};

		this.positionBoard(puinfo, puzzle);

		if (!hideGridLines(puinfo, puzzle)) {
			// must be after hideGridLines
			if (this.flags.removeFrame) {
				removeFrameWhenEqualToRegions(puinfo, puzzle, puinfo.regions);
			}
		}

		this.addSudokuRegions(puinfo, puzzle, puinfo);

		addCageMetadata(puinfo, puzzle);

		addGivens(puinfo, puzzle);

		//let qa = 'pu_q';
		this.render_surface(puinfo, puzzle);
		this.render_deletelineE(puinfo, puzzle);

		this.render_symbol(puinfo, puzzle, 1);
		this.render_squareframe(puinfo, puzzle);
		this.render_thermo(puinfo, puzzle);
		this.render_nobulbthermo(puinfo, puzzle);
		this.render_arrows(puinfo, puzzle);
		this.render_wall(puinfo, puzzle);
		this.render_polygon(puinfo, puzzle);
		this.render_freeline(puinfo, puzzle);
		this.render_freelineE(puinfo, puzzle);
		this.render_line(puinfo, puzzle);
		this.render_lineE(puinfo, puzzle);
		this.render_direction(puinfo, puzzle);
		this.render_symbol(puinfo, puzzle, 2);
		this.render_cage(puinfo, puzzle);
		this.render_killercages(puinfo, puzzle);
		this.render_number(puinfo, puzzle);
		this.render_numberS(puinfo, puzzle);

		this.drawBoardLattice(puinfo, puzzle);

		this.render_frame(puinfo, puzzle);

		// Create cage to define the board bounds when there are no regions
		if (!puzzle.regions || puzzle.regions.length === 0) {
			const { penpaTools } = puinfo;
			const { matrixRC2point, point2cell } = penpaTools;
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
			this.puzzleAdd(puzzle, 'cages', { cells: tlbr, unique: false, hidden: true }, 'bounds');
		}

		// Custom patch the puzzle
		// Sneeky text substute to supress anti-knight rule, which would otherwise apply to whole board
		if (puinfo.rules.indexOf('Box 4: Antiknight') !== -1) {
			puinfo.rules = puinfo.rules.replace('Box 4: Antiknight', 'Box 4: Antik\u0578ight');
		}

		this.addSolution(puinfo, puzzle);

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
