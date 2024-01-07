import { PenpaTools } from './penpa-tools';
import { PenpaRegions } from './penpa-regions';
import { getPuSolution, getSolutionInfo, makeSolutionFromSolutionModeDigits } from './penpa-solution';
import { type FlagValues } from './converter-flags';
import { Color } from './penpa-style';
import tinycolor from 'tinycolor2';
import type { PenpaPuzzle, Point, LineFeature, NumberFeature, SymbolFeature, SurfaceFeature, ColFeature, Pu_qa_col } from './penpa-loader/penpa-puzzle';

export interface PuInfo {
	pu: PenpaPuzzle;
	flags: FlagValues;
	penpaTools: PenpaTools;

	// From PenpaPuzzle:
	point: Point[]; // point coordinate map
	nx: number; // width
	ny: number; // height
	nx0: number; // width + 4
	ny0: number; // height + 4
	originalSize: number; // Original cell size. Note: pu.size is always set to 1
	originalPu: string;
	originalCenterlist: number[];
	width_c: number; // canvas width, default = nx + 1
	height_c: number; // canvas height, default = ny + 1
	center_n: number; // center point of canvas

	// Calculated properties:
	col0: number; // offset of puzzle cell(0,0)
	row0: number; //  offset of puzzle cell(0,0)
	width: number; // number of columns in puzzle (=after translation)
	height: number; // number of rows in puzzle (=after translation)
	maskedCells: number[];
	squares: any[];
	regions: Dictionary;
	uniqueRowsCols: boolean;
	hasCellMask: boolean;
	foglight: boolean;

	title: string;
	author: string;
	rules: string;
	custom_message: string;
	sourcelink: string;
}

const dashLineStyle = [10, 11, 12, 13, 14, 15, 17, 110, 115];

// Move and convert lines into consistent format, to allow concatenation.
function convertFeature2Line(puinfo: PuInfo, fromFeature: LineFeature, lineFeature: LineFeature) {
	const { pu, penpaTools } = puinfo;
	const { point2matrix, makePointPair } = penpaTools;
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
				if (line[newkey] === undefined) {
					// freeline is always under line
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
				if (line[newkey] === undefined) {
					// freeline is always under line
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
				if (line[newkey] === undefined) {
					// freeline is always under line
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

// Add cell to centerlist and make its cell border invisible
const addToCenterlist = function (pu: PenpaPuzzle, p: number) {
	if (pu.centerlist.includes(p)) return;
	const { makePointPair } = PenpaTools;
	pu.centerlist.push(p);
	pu.centerlist.sort((a, b) => a - b);
	const { lineE } = pu.pu_q;
	const { frame } = pu;
	for (let i = 0; i < 4; i++) {
		let k = makePointPair(pu.point[p].surround[i], pu.point[p].surround[(i + 1) % 4]);
		// FIXME: lineE and frame probably are empty here, caused cleanupFrame() will remove thin lines.
		if (!lineE[k] && !frame[k]) {
			pu.pu_q.deletelineE[k] = 8;
		}
	}
};

// Expand grid to include all:
// - Thermos
// - Killercage cells
// - Lines + Freelines (non-edge)
// - Cage lines
function expandGridForFillableOutsideFeatures(puinfo: PuInfo) {
	const { pu, penpaTools } = puinfo;
	function getLineCenterPoints(pu: PenpaPuzzle, feature: LineFeature) {
		let points: number[] = [];
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
	function getCageLinePoints(pu: PenpaPuzzle, feature: LineFeature) {
		let points: number[] = [];
		let lines = pu.pu_q[feature];
		Object.keys(lines).forEach(key => {
			let [p1, p2] = key.split(',').map(Number);
			points.push(p1);
			points.push(p2);
		});
		return points;
	}

	let clBounds = PenpaTools.getMinMaxRC(pu.centerlist, penpaTools.point2matrix);
	let bounds = [];
	bounds.push(
		PenpaTools.getMinMaxRC(
			pu.pu_q.thermo.flatMap(p => p),
			penpaTools.point2matrix
		)
	);
	bounds.push(
		PenpaTools.getMinMaxRC(
			pu.pu_q.killercages.flatMap(p => p),
			penpaTools.point2matrix
		)
	);
	bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'line'), penpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC(getLineCenterPoints(pu, 'freeline'), penpaTools.point2matrix));
	bounds.push(PenpaTools.getMinMaxRC(getCageLinePoints(pu, 'cage'), penpaTools.point2matrix));

	// bounds for all fillable clues
	let top = Math.min(...bounds.map(b => b[0]));
	let left = Math.min(...bounds.map(b => b[1]));
	let bottom = Math.max(...bounds.map(b => b[2]));
	let right = Math.max(...bounds.map(b => b[3]));

	if (top < clBounds[0] || left < clBounds[1]) {
		const p = penpaTools.matrix2point(top, left);
		addToCenterlist(pu, p);
		puinfo.maskedCells.push(p);
	}
	if (bottom > clBounds[2] || right > clBounds[3]) {
		const p = penpaTools.matrix2point(bottom, right);
		addToCenterlist(pu, p);
		puinfo.maskedCells.push(p);
	}
}

// Expand grid to include all:
// - Numbers
// - Small numbers
// - Symbols
// - Colored surfaces
function expandGridForWideOutsideClues(puinfo: PuInfo, margin = 0) {
	const { pu, penpaTools } = puinfo;
	const { getMinMaxRC } = PenpaTools;
	const { point2matrix, matrix2point } = penpaTools;
	let clBounds = getMinMaxRC(pu.centerlist, point2matrix);
	let bounds = [];
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.number), point2matrix));
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.numberS), point2matrix));
	bounds.push(getMinMaxRC(Object.keys(pu.pu_q.symbol), point2matrix));
	bounds.push(
		getMinMaxRC(
			Object.keys(pu.pu_q.surface).filter(k => pu.pu_q.surface[k] > 0),
			point2matrix
		)
	);

	// bounds for all clues
	let top = Math.min(...bounds.map(b => b[0]));
	let left = Math.min(...bounds.map(b => b[1]));
	let bottom = Math.max(...bounds.map(b => b[2]));
	let right = Math.max(...bounds.map(b => b[3]));

	if (top < clBounds[0] - margin || left < clBounds[1] - margin) {
		const p = matrix2point(top, left);
		addToCenterlist(pu, p);
		puinfo.maskedCells.push(p);
	}
	if (bottom > clBounds[2] + margin || right > clBounds[3] + margin) {
		const p = matrix2point(bottom, right);
		addToCenterlist(pu, p);
		puinfo.maskedCells.push(p);
	}
}

// Ensure all features are available
// Make custom colors consistent
// Remove all trivially invalid features
function cleanupPu(pu: PenpaPuzzle) {
	// Ensure all fields exist
	pu.frame = pu.frame || {};
	[pu.pu_q, pu.pu_a].forEach(pu_qa => {
		pu_qa.surface = pu_qa.surface || {};
		pu_qa.number = pu_qa.number || {};
		pu_qa.numberS = pu_qa.numberS || {};
		pu_qa.symbol = pu_qa.symbol || {};
		pu_qa.freeline = pu_qa.freeline || {};
		pu_qa.freelineE = pu_qa.freelineE || {};
		pu_qa.thermo = pu_qa.thermo || [];
		pu_qa.arrows = pu_qa.arrows || [];
		pu_qa.direction = pu_qa.direction || [];
		pu_qa.squareframe = pu_qa.squareframe || [];
		pu_qa.polygon = pu_qa.polygon || [];
		pu_qa.line = pu_qa.line || {};
		pu_qa.lineE = pu_qa.lineE || {};
		pu_qa.wall = pu_qa.wall || {};
		pu_qa.cage = pu_qa.cage || {};
		pu_qa.deletelineE = pu_qa.deletelineE || {};
		pu_qa.killercages = pu_qa.killercages || [];
		pu_qa.nobulbthermo = pu_qa.nobulbthermo || [];
	});

	if (!pu.pu_q_col || pu._document['custom_color_opt'] !== '2') {
		pu.pu_q_col = {} as Pu_qa_col;
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
	for (let feature in pu.pu_q_col) {
		let list = pu.pu_q_col[feature as ColFeature] as any;
		for (let i in list) {
			if (typeof list[i] === 'string') {
				list[i] = PenpaTools.toHexColor(list[i]);
			} else {
				// remove invalid custom color
				if (Array.isArray(list)) {
					list[Number(i)] = undefined;
				} else {
					delete list[i];
				}
			}
		}
	}

	// Ensure lines with custom colors have consistent style.
	// This allows them to be concatenated.
	['line', 'lineE', 'freeline', 'freelineE', 'wall'].forEach(f => {
		const feature = f as LineFeature;
		let col = pu.pu_q_col[feature];
		let list = pu.pu_q[feature];
		for (let k in list) {
			if (col[k]) {
				if ([2, 3, 5, 8, 9].includes(list[k])) {
					list[k] = 5; // 5 is arbitrary but consistent style
				}
			}
		}
	});

	// Delete features with invalid points
	['number', 'numberS', 'symbol', 'surface'].forEach(f => {
		const feature = f as NumberFeature | SymbolFeature | SurfaceFeature;
		Object.keys(pu.pu_q[feature]).forEach(p => {
			if (!pu.point[Number(p)]) {
				delete pu.pu_q[feature][p];
				delete pu.pu_q_col[feature][p];
			}
		});
	});
	['lineE', 'freelineE', 'deletelineE'].forEach(f => {
		const feature = f as LineFeature;
		Object.keys(pu.pu_q[feature]).forEach(key => {
			const p = Number(key);
			if (pu.pu_q[feature][p] == 98) {
				// X-mark on edge
				if (!pu.point[p] || ![2, 3].includes(pu.point[p].type)) {
					delete pu.pu_q[feature][p];
					delete pu.pu_q_col[feature][p];
				}
			} else {
				let [p1, p2] = key.split(',').map(Number);
				if (!pu.point[p1] || pu.point[p1].type !== 1) {
					delete pu.pu_q[feature][p];
					delete pu.pu_q_col[feature][p];
				} else if (!pu.point[p2] || pu.point[p2].type !== 1) {
					delete pu.pu_q[feature][p];
					delete pu.pu_q_col[feature][p];
				}
			}
		});
	});
	['line', 'freeline'].forEach(f => {
		const feature = f as LineFeature;
		Object.keys(pu.pu_q[feature]).forEach(key => {
			if (pu.pu_q[feature][key] == 98) {
				// X-mark on edge
				const p = Number(key);
				if (pu.point[p] && [2, 3].includes(pu.point[p].type)) {
					// Move to lineE (because it's always on an edge) but don't overwrite
					if (!pu.pu_q['lineE'][p]) {
						pu.pu_q['lineE'][p] = pu.pu_q[feature][p];
						pu.pu_q_col['lineE'][p] = pu.pu_q_col[feature][p];
					}
				}
				delete pu.pu_q[feature][p];
				delete pu.pu_q_col[feature][p];
			} else {
				let [p1, p2] = key.split(',').map(Number);
				if (!pu.point[p1] || ![0, 2, 3].includes(pu.point[p1].type)) {
					delete pu.pu_q[feature][key];
					delete pu.pu_q_col[feature][key];
				} else if (!pu.point[p2] || ![0, 2, 3].includes(pu.point[p2].type)) {
					delete pu.pu_q[feature][key];
					delete pu.pu_q_col[feature][key];
				}
			}
		});
	});
	['freeline'].forEach(f => {
		const feature = f as LineFeature;
		Object.keys(pu.pu_q[feature]).forEach(key => {
			// Replace 'short line' (40) with normal gray line (5)
			if (pu.pu_q[feature][key] == 40) {
				pu.pu_q[feature][key] = 5;
			}
		});
	});
	['cage', 'wall'].forEach(f => {
		const feature = f as LineFeature;
		Object.keys(pu.pu_q[feature]).forEach(p => {
			let [p1, p2] = p.split(',').map(Number);
			if (!pu.point[p1] || !pu.point[p2]) {
				delete pu.pu_q[feature][p];
				delete pu.pu_q_col[feature][p];
			}
		});
	});
	// remove leading spaces in numberS
	['numberS'].forEach(f => {
		const feature = f as NumberFeature;
		let numberS = pu.pu_q[feature];
		Object.keys(numberS).forEach(key => {
			let p = Number(key);
			let [n] = numberS[p];
			if (typeof n === 'string') {
				numberS[p][0] = n.trim();
			}
		});
	});
}

// - All thick edgelines should be treated as frame lines
// - Allow dashed frame lines
function moveBlackEdgelinesToFrame(puinfo: PuInfo) {
	const { pu, penpaTools } = puinfo;
	const { point2matrix } = penpaTools;
	const lineE = pu.pu_q.lineE;
	const frame = pu.frame;
	const lineECol = pu.pu_q_col.lineE;
	const deletelineE = pu.pu_q.deletelineE;
	const styleMap: Record<number, number> = { 2: 2, 21: 21 };
	const styleMapCol: Record<number, number> = { 2: 2, 3: 2, 5: 2, 8: 2, 9: 2, 21: 21 };
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
		if (!lineECol[key]) {
			// Not custom color
			const frameStyle = styleMap[style];
			if (frameStyle) {
				delete lineE[key];
				frame[key] = frameStyle;
			} else {
				if (frame[key]) delete frame[key];
			}
		} else if (lineECol[key] === '#000000') {
			// Black custom color
			const frameStyle = styleMapCol[style];
			if (frameStyle) {
				delete lineE[key];
				frame[key] = frameStyle;
			} else {
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

// - Remove invisible killercages (with no cage lines)
// - Join disconnected cages
// - Determine cage values
// - Remove single-cell cages on board edge
//   Because they were only used to define the grid outline
// - Detect foglight cages
function prepareKillercages(puinfo: PuInfo, width: number, height: number) {
	const { pu, penpaTools } = puinfo;
	const { point2cell, point2centerPoint, penpaLines2WaypointLines } = penpaTools;

	// Remove killercages which have no visible lines
	const list = pu.pu_q.cage || [];
	const wpLines = penpaLines2WaypointLines(list);
	const cageSet = new Set();
	wpLines.forEach(line => {
		const p1 = line.keys[0];
		const p2 = line.keys[1];
		cageSet.add(point2centerPoint(p1));
		cageSet.add(point2centerPoint(p2));
	});
	const killercages = pu.pu_q.killercages || [];
	killercages.forEach(cage => {
		if (cage && !cage.some(p => cageSet.has(p))) {
			cage.length = 0;
		}
	});

	joinDisconnectedKillercages(puinfo);

	// Collect killercage values
	// Value is stored in killercage array at index 'value'.
	// Should find another way as this violates typechecking.
	const { numberS, number } = pu.pu_q;
	const { point2matrix, matrix2point } = penpaTools;
	const sortTopLeftRC = ([r1, c1]: RC, [r2, c2]: RC) => (r1 === r2 ? c2 - c1 : r2 - r1);
	killercages.forEach(killer => {
		if (!killer) return;
		const topleft = [...killer.map(point2matrix)].sort(sortTopLeftRC).pop() as RC;
		const labelCell = matrix2point(topleft);
		for (let key in numberS) {
			const k = Number(key);
			if (labelCell === point2centerPoint(k)) {
				const num = numberS[k];
				if (pu.point[k].type === 4 && k % 4 === 0) {
					// Top-left corner in cell
					(killer as any)['value'] = num[0].trim();
					(num as any).role = 'killer'; // Exclude from rendering
					break;
				}
				// Special case for foglight
				else if (num[0].includes('FOGLIGHT') || /^foglight/i.test(num[0])) {
					(killer as any)['value'] = 'FOGLIGHT';
					(num as any).role = 'killer'; // Exclude from rendering
					break;
				}
			}
		}
		for (let k in number) {
			if (labelCell === point2centerPoint(k)) {
				const num = number[k];
				// Special case for foglight
				if (num[0].includes('FOGLIGHT') || /^foglight/i.test(num[0])) {
					(killer as any)['value'] = 'FOGLIGHT';
					(num as any).role = 'killer'; // Exclude from rendering
					break;
				}
			}
		}
	});

	// Remove any single cell cages on grid corners
	// Because they were only used to define the grid outline
	killercages.forEach(killer => {
		if (!killer) return;
		if (killer.length !== 1 || (killer as any)['value'] !== undefined) return;
		const cageOutsideRegions = killer
			.map(point2cell)
			.some(([r, c]) => (r === 0 && (c === 0 || c === width - 1)) || (r === height - 1 && (c === 0 || c === width - 1)));
		if (cageOutsideRegions) {
			//Remove cage lines
			const { cage } = pu.pu_q;
			const p = killer[0];
			for (let k in cage) {
				let [p1, p2] = k.split(',');
				if (point2centerPoint(p1) === p || point2centerPoint(p2) === p) {
					delete cage[k];
				}
			}
			killer.length = 0;
		}
	});

	puinfo.foglight = killercages.some(killer => /^foglight/i.test((killer as any)['value'] || ''));
}

// Get the two cells which are connected by the cell-connection symbol
function getCageConnectionCells(puinfo: PuInfo, key: number | string, symbol: [number, string, number]) {
	const { pu, penpaTools } = puinfo;
	key = Number(key);
	const { point2centerPoint } = penpaTools;
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

// Connect killercages wich are joined by a cell-connection symbol
function joinDisconnectedKillercages(puinfo: PuInfo) {
	const { pu } = puinfo;
	const killercages = (pu.pu_q.killercages || []) as number[][];
	const symbols = pu.pu_q['symbol'] || [];
	Object.keys(symbols).forEach(key => {
		const symbol = symbols[key];
		const [p1, p2] = getCageConnectionCells(puinfo, key, symbol) || [];
		if (p1 == null || p2 == null) return;
		const kc1 = killercages.findIndex(cage => cage?.some(p => p === p1));
		const kc2 = killercages.findIndex(cage => cage?.some(p => p === p2));
		if (kc1 === -1 || kc2 === -1 || kc1 === kc2) return;

		killercages[kc1]?.push(...killercages[kc2]!);
		killercages[kc1]?.sort((a, b) => a - b);
		killercages[kc2] = [];
		(symbol as any).role = 'cagelink';
	});
}

// - Apply deletelineE to framelines
// - Remove lines which are identical to frame line
// - Keep only thick framelines
function cleanupFrame(pu: PenpaPuzzle) {
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
			if (pu.frame[k] === (style === 12 ? 11 : style)) {
				// Line style 12 is frame style 11
				if (pu.pu_q_col.lineE[k] && tinycolor.equals(pu.pu_q_col.lineE[k], Color.BLACK)) {
					delete pu.pu_q.lineE[k];
				}
			}
		}
	});
	// Keep only thick frame lines
	const noGridLines = pu.mode.grid[0] === '3';
	const frameLinesToKeep = noGridLines ? [2, 21, 11, 1] : [2, 21, 11];
	Object.keys(pu.frame)
		.filter(k => !frameLinesToKeep.includes(pu.frame[k]))
		.forEach(k => delete pu.frame[k]);
}

// All solution cells should be in the centerlist
function addSolutionCellsToCenterlist(pu: PenpaPuzzle) {
	['number', 'surface'].forEach(constraint => {
		const solution = getPuSolution(pu, constraint) || [];
		solution.forEach(s => {
			let [point, _val] = s.split(',');
			addToCenterlist(pu, Number(point));
		});
	});
	['loopline'].forEach(constraint => {
		const solution = getPuSolution(pu, constraint) || [];
		solution.forEach(s => {
			let [p1, p2, _val] = s.split(',');
			[p1, p2].forEach(point => {
				addToCenterlist(pu, Number(point));
			});
		});
	});
}

export class PenpaPostProcess {
	static postProcessPenpaPuzzle(pu: PenpaPuzzle, flags: FlagValues) {
		const puinfo: PuInfo = {
			pu: pu,
			flags: flags,
			penpaTools: undefined!,

			// Copied from pu:
			point: pu.point, // point coordinate map
			nx: pu.nx, // width
			ny: pu.ny, // height
			nx0: pu.nx0, // width + 4
			ny0: pu.ny0, // height + 4
			originalSize: pu._size, // Original cell size. Note: pu.size is always set to 1
			originalPu: JSON.stringify(pu),
			originalCenterlist: [...pu.centerlist],
			//theta: pu.theta, // rotation angle
			//reflect: pu.reflect, // [0] = -1: reft LR; [1] = -1: reflect UD
			//centerlist: pu.centerlist, // board cells list
			width_c: pu.width_c, // canvas width, default = nx + 1
			height_c: pu.height_c, // canvas height, default = ny + 1
			center_n: pu.center_n, // center point of canvas

			// Calculated parameters:
			col0: 0, // offset of puzzle cell(0,0)
			row0: 0, //  offset of puzzle cell(0,0)
			width: 0, // number of columns in puzzle (=after translation)
			height: 0, // number of rows in puzzle (=after translation)
			maskedCells: [],
			squares: undefined!,
			regions: undefined!,
			uniqueRowsCols: false,
			hasCellMask: false,
			foglight: false,

			title: '',
			author: '',
			rules: '',
			custom_message: '',
			sourcelink: '',
		};

		// Inject puzzle/puinfo metrics into helper classes
		const penpaTools = new PenpaTools(puinfo);
		puinfo.penpaTools = penpaTools;

		if (!pu.solution) {
			if (puinfo.flags.answerGen) {
				makeSolutionFromSolutionModeDigits(pu);
			}
		}

		cleanupPu(pu);

		convertFeature2Line(puinfo, 'freeline', 'line');
		convertFeature2Line(puinfo, 'freelineE', 'lineE');
		convertFeature2Line(puinfo, 'wall', 'line');

		// Add solution cells to centerlist
		addSolutionCellsToCenterlist(pu);

		moveBlackEdgelinesToFrame(puinfo);
		cleanupFrame(pu);

		const { solutionPoints, uniqueRowsCols } = getSolutionInfo(puinfo);
		PenpaRegions.cleanupCenterlist(puinfo, solutionPoints);

		let { squares, regions } = PenpaRegions.findSudokuSquares(puinfo);
		if (!regions) {
			PenpaRegions.findSudokuRegions(puinfo, squares);
		}

		//TODO: Can/should this be done before region detection?
		expandGridForFillableOutsideFeatures(puinfo);

		if (puinfo.flags.expandGrid) {
			expandGridForWideOutsideClues(puinfo);
		}

		// Determine visual cell grid bounding box
		let { top, left, height, width } = PenpaTools.getBoundsRC(pu.centerlist, puinfo.penpaTools.point2cell);

		// Update with calculated dimensions
		puinfo.col0 = left;
		puinfo.row0 = top;
		puinfo.width = width;
		puinfo.height = height;

		puinfo.squares = squares;
		puinfo.regions = regions;
		puinfo.uniqueRowsCols = uniqueRowsCols;

		puinfo.title = pu._document.saveinfotitle || '';
		puinfo.author = pu._document.saveinfoauthor || '';
		puinfo.rules = pu._document.saveinforules || '';
		puinfo.custom_message = pu._document.custom_message || '';
		puinfo.sourcelink = pu._document.sourcelink || '';

		prepareKillercages(puinfo, width, height);

		return { puinfo };
	}
}
