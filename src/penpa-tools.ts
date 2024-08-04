import tinycolor from 'tinycolor2';
import { type PuInfo } from './penpa-postprocess';
import { type PenpaPuzzle } from './penpa-loader/penpa-puzzle';

export interface WayPointLine {
	wayPoints: RC[];
	keys: number[];
	value: number;
	cc?: string;
	killercage?: number;
}

interface CombinedSurface {
	center: RC;
	value: number;
	key: number;
	height: number;
	width: number;
	role?: string;
}

//interface ReduceSurfacesDelegate { (s1: Surface, s2: Surface): boolean }
export type ReduceSurfacesPredicate = (s1: CombinedSurface, s2: CombinedSurface) => boolean;

export class PenpaTools {
	puinfo: PuInfo;

	constructor(puinfo: PuInfo) {
		this.puinfo = puinfo;
	}

	static reduceSurfaces(centers: CombinedSurface[], predicate: ReduceSurfacesPredicate = () => true): CombinedSurface[] {
		//Sort centers, this will give best results.
		centers.sort((a, b) => PenpaTools.compareRC(a.center, b.center));
		const findNext = function (centers: CombinedSurface[], rc: RC, s1: CombinedSurface) {
			return centers.find(s2 => s2.center[0] === rc[0] && s2.center[1] === rc[1] && predicate(s1, s2));
		};
		// merge right
		centers.forEach(s1 => {
			if (s1.value === null) return; // 'removed'
			let [row, col] = s1.center;
			let height = s1.height || 1;
			let width = s1.width || 1;
			let newwidth = width;
			let nextCol = findNext(centers, [row, col + newwidth], s1);
			while (nextCol && nextCol.value !== null && (nextCol.width || 1) === width && (nextCol.height || 1) === height) {
				newwidth += width;
				nextCol.value = null!; // mark as 'removed'
				nextCol = findNext(centers, [row, col + newwidth], s1);
			}
			if (newwidth > width) {
				s1.center[1] += (newwidth - 1) / 2;
				s1.width = newwidth;
			}
		});
		// merge down
		centers.forEach(s1 => {
			if (s1.value === null) return; // 'removed'
			let [row, col] = s1.center;
			let height = s1.height || 1;
			let width = s1.width || 1;
			let newheight = height;
			let nextCol = findNext(centers, [row + newheight, col], s1);
			while (nextCol && nextCol.value !== null && (nextCol.width || 1) === width && (nextCol.height || 1) === height) {
				newheight += height;
				nextCol.value = null!; // mark as 'removed'
				nextCol = findNext(centers, [row + newheight, col], s1);
			}
			if (newheight > height) {
				s1.center[0] += (newheight - 1) / 2;
				s1.height = newheight;
			}
		});
		return centers.filter(l => l.value !== null);
	}

	// NOT USED
	// static inflateSurface(list: CombinedSurface[], top: number, left: number, bottom: number, right: number, v: number) {
	// 	const eps = 0.1;
	// 	list.forEach(s => {
	// 		let width = s.width || 1;
	// 		let height = s.height || 1;
	// 		if (s.center[0] - height / 2 - eps < top) {
	// 			s.center[0] -= v / 2;
	// 			s.height = height + v;
	// 		}
	// 		if (s.center[0] + height / 2 + eps > bottom + 1) {
	// 			s.center[0] += v / 2;
	// 			s.height = height + v;
	// 		}
	// 		if (s.center[1] - width / 2 - eps < left) {
	// 			s.center[1] -= v / 2;
	// 			s.width = width + v;
	// 		}
	// 		if (s.center[1] + width / 2 + eps > right + 1) {
	// 			s.center[1] += v / 2;
	// 			s.width = width + v;
	// 		}
	// 	});
	// 	return list;
	// }

	static compareRC(r: RC, c: RC) {
		let [r1, c1] = r;
		let [r2, c2] = c;
		if (r1 > r2) return 1;
		if (r1 < r2) return -1;
		if (c1 > c2) return 1;
		if (c1 < c2) return -1;
		return 0;
	}

	static comparePenpaLinePoints(a: string, b: string) {
		let [a1, a2] = a.split(',').map(n => parseInt(n));
		let [b1, b2] = b.split(',').map(n => parseInt(n));
		if (a1 > b1) return 1;
		if (a1 < b1) return -1;
		if (a2 > b2) return 1;
		if (a2 < b2) return -1;
		return 0;
	}

	combineStraightPenpaLines = (lines: Dictionary, linesCol?: Dictionary<string>, excludedLines: Dictionary = []): Dictionary => {
		const { makePointPair } = PenpaTools;
		lines = Object.assign({}, lines);
		const point = this.puinfo.point;
		const keys = Object.keys(lines);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		keys.forEach(k => {
			if (lines[k] === undefined) return;
			if (lines[k] === 98) return; // x-mark, has only a single point.
			if (lines[k] === 40) return; // don't combine short lines
			let [p1, p2] = k.split(',').map(n => parseInt(n));
			let dir = point[p1].adjacent.indexOf(p2);
			if (dir === -1) return; // Not an adjacent point
			do {
				let nextp = point[p2].adjacent[dir];
				let nextKey = makePointPair(p2, nextp);
				let nextVal = lines[nextKey];
				if (nextVal === undefined || lines[k] !== nextVal) break; // not found or different line style
				if (linesCol && linesCol[k] !== linesCol[nextKey]) break; // or not same custom color
				if (excludedLines.length != 0 && (excludedLines[k] || excludedLines[nextKey])) break; // explicitly don't combine (e.g. when dashed line over deletelineE)
				delete lines[nextKey];
				p2 = nextp;
			} while (true);
			let newKey = makePointPair(p1, p2);
			if (k != newKey) {
				lines[newKey] = lines[k];
				delete lines[k];
				if (linesCol && linesCol[k]) {
					linesCol[newKey] = linesCol[k];
					delete linesCol[k];
				}
			}
		});
		return lines;
	};

	reducePenpaLines2WaypointLines = (list: Dictionary<number>, listCol?: Dictionary<string>, excludedLines: Dictionary = []): WayPointLine[] => {
		let comblist = this.combineStraightPenpaLines(list, listCol, excludedLines);
		let wpLines = this.penpaLines2WaypointLines(comblist, listCol);
		let combined = PenpaTools.concatenateEndpoints(wpLines, excludedLines);
		return combined;
	};

	penpaLines2WaypointLines = (list: Dictionary<number>, listCol?: Dictionary<string>): WayPointLine[] => {
		const keys = Object.keys(list);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		let listwp = keys.map(k => {
			let rcs = k.split(',').map(this.point2RC);
			let line: WayPointLine = { wayPoints: [...rcs], value: list[k], keys: k.split(',').map(Number) };
			if (listCol && listCol[k]) line.cc = listCol[k];
			return line;
		});
		return listwp;
	};

	// Shorten line by a fixed amount
	static shortenLine(wayPoints: RC[], shortenStart: number, shortenEnd: number): RC[] {
		if (!Array.isArray(wayPoints) || wayPoints.length < 2) return wayPoints;
		const wp = wayPoints;
		let first = 0;
		let dx = wp[first + 1][0] - wp[first][0];
		let dy = wp[first + 1][1] - wp[first][1];
		let d = Math.sqrt(dx * dx + dy * dy);
		let x1 = wp[first][0] + dx * (shortenStart / d);
		let y1 = wp[first][1] + dy * (shortenStart / d);
		let last = wp.length - 1;
		dx = wp[last][0] - wp[last - 1][0];
		dy = wp[last][1] - wp[last - 1][1];
		d = Math.sqrt(dx * dx + dy * dy);
		let x2 = wp[last][0] - dx * (shortenEnd / d);
		let y2 = wp[last][1] - dy * (shortenEnd / d);
		return [[x1, y1], ...wp.slice(1, -1), [x2, y2]];
	}

	// Shrink line by a factor
	static shrinkLine(wayPoints: RC[], r: number): RC[] {
		if (!Array.isArray(wayPoints) || wayPoints.length < 2) return wayPoints;
		const wp = wayPoints;
		let first = 0;
		let last = wp.length - 1;
		let x1 = r * wp[first][0] + (1 - r) * wp[last][0];
		let y1 = r * wp[first][1] + (1 - r) * wp[last][1];
		let x2 = (1 - r) * wp[first][0] + r * wp[last][0];
		let y2 = (1 - r) * wp[first][1] + r * wp[last][1];
		return [[x1, y1], ...wp.slice(1, -1), [x2, y2]];
	}

	static concatenateEndpoints(listwp: WayPointLine[], excludedLines: Dictionary = []): WayPointLine[] {
		listwp = JSON.parse(JSON.stringify(listwp));
		let changes = 0;
		do {
			changes = 0;
			listwp.forEach(line1 => {
				if (line1.value === null || line1.wayPoints.length < 2) return;
				if ([30, 40, 98].includes(line1.value)) return; // don't combine short, double or X lines
				let startpoint1 = line1.wayPoints[0].toString();
				let endpoint1 = line1.wayPoints[line1.wayPoints.length - 1].toString();
				if (excludedLines.length != 0 && excludedLines[PenpaTools.makePointPair(line1.keys[0], line1.keys[1])]) return;
				listwp.forEach(line2 => {
					if (line1 === line2 || line1.value !== line2.value) return;
					if (line1.cc !== line2.cc) return;
					if (excludedLines.length != 0 && excludedLines[PenpaTools.makePointPair(line2.keys[0], line2.keys[1])]) return;
					let startpoint2 = line2.wayPoints[0].toString();
					let endpoint2 = line2.wayPoints[line2.wayPoints.length - 1].toString();
					if (endpoint2 === endpoint1) {
						line2.wayPoints.reverse();
						line2.keys.reverse();
						endpoint2 = startpoint2;
						startpoint2 = line2.wayPoints[0].toString();
					}
					if (startpoint1 === startpoint2) {
						line1.wayPoints.reverse();
						line1.keys.reverse();
						endpoint1 = startpoint1;
						startpoint1 = startpoint1 = line1.wayPoints[0].toString();
					}

					if (endpoint1 === startpoint2) {
						line1.wayPoints.push(...line2.wayPoints.slice(1));
						line1.keys.push(...line2.keys.slice(1));
						line2.value = null!;
						endpoint1 = endpoint2;
						changes++;
					} else if (startpoint1 === endpoint2) {
						line1.wayPoints.unshift(...line2.wayPoints.slice(0, -1));
						line1.keys.unshift(...line2.keys.slice(0, -1));
						line2.value = null!;
						startpoint1 = startpoint2;
						changes++;
					}
				});
			});
		} while (changes > 0);
		return listwp.filter(l => l.value !== null);
	}

	static reduceWayPoints(points: RC[]): RC[] {
		let prev = points[0];
		let line = [prev];
		if (points.length > 1) {
			for (let i = 1; i < points.length - 1; i++) {
				let curr = points[i + 0];
				let next = points[i + 1];
				let dyprev = curr[0] - prev[0];
				let dynext = next[0] - curr[0];
				let dxprev = curr[1] - prev[1];
				let dxnext = next[1] - curr[1];
				// Combine horizontal and vertical lines
				if ((dyprev === 0 && dynext === 0) || (dxprev === 0 && dxnext === 0)) {
					continue;
				}
				// Keep any change in direction
				if (dyprev !== dynext || dxprev !== dxnext) {
					line.push(curr);
				}
				prev = curr;
			}
			line.push(points[points.length - 1]);
		}
		return line.map(PenpaTools.roundRC);
	}

	// static normalizePath(points: RC[]): RC[] {
	// 	if(points.length <= 2) return points;
	// 	let prev = points[0];
	// 	let line = [prev];
	// 	for (let i = 1; i < points.length - 1; i++) {
	// 		let curr = points[i + 0];
	// 		let next = points[i + 1];
	// 		if(prev[0] !== curr[0] || curr[0] !== next[0])
	// 			line.push(curr);
	// 		else if ((prev[1] !== curr[1] || curr[1] !== next[1]) &&
	// 			     (prev[2] !== curr[2] || curr[2] !== next[2])) {
	// 			line.push(curr);
	// 		}
	// 		prev = curr;
	// 	}
	// 	line.push(points[points.length - 1]);
	// 	return line;
	// }

	getAdjacentCellsOfEdgeLine = (pu: PenpaPuzzle, lineKey: string): number[] => {
		const { point2centerPoint } = this;
		let [k1, k2] = lineKey.split(',').map(Number);
		let p1 = pu.point[k1];
		let p2 = pu.point[k2];
		// Find common surrounding cells
		let adjacent1 = [k1, p1.adjacent[2], p1.adjacent[3], p1.adjacent_dia[3]].map(point2centerPoint);
		let adjacent2 = [k2, p2.adjacent[2], p2.adjacent[3], p2.adjacent_dia[3]].map(point2centerPoint);
		let commonCells = adjacent1.filter(k => adjacent2.includes(k));
		return commonCells;
	};

	getOutlinePoints = (cells: number[], os = 0.25): number[] => {
		const { point2matrix, matrix2point } = this;

		let input = cells.map(point2matrix);
		let outlineSet = new Set<number>();
		let rcOutlines = PenpaTools.getRCOutline(input, os);
		for (let outline of rcOutlines) {
			for (let pt of outline) {
				const [r, c] = pt;
				const p = matrix2point(Math.floor(r), Math.floor(c));
				outlineSet.add(p);
			}
		}
		const outlinePoints = [...outlineSet];
		outlinePoints.sort((a, b) => a - b);
		return outlinePoints;
	};

	static getRCOutline(cells: RC[], os = 0): RC[][] {
		type Seg = [row: number, col: number, cell: RC, pattern: (typeof patterns)[0]];
		let edgePoints: RC[][] = [];
		let grid: { cell: RC }[][] = [];
		let segs: Seg[] = [];
		let shapes: Seg[][] = [];
		const checkRC = (r: number, c: number) => (grid[r] !== undefined && grid[r][c] !== undefined) || false;
		const pointOS: Dictionary<RC> = {
			tl: [os, os],
			tr: [os, 1 - os],
			bl: [1 - os, os],
			br: [1 - os, 1 - os],
			tc: [os, 0.5],
			rc: [0.5, 1 - os],
			bc: [1 - os, 0.5],
			lc: [0.5, os],
		};
		const dirRC: Dictionary<RC> = { t: [-1, 0], r: [0, 1], b: [1, 0], l: [0, -1] };
		const flipDir: Dictionary<string> = { t: 'b', r: 'l', b: 't', l: 'r' };
		const patterns = [
			{ name: 'otl', bits: '_0_011_1_', enter: 'bl', exit: 'rt', points: 'tl' },
			{ name: 'otr', bits: '_0_110_1_', enter: 'lt', exit: 'br', points: 'tr' },
			{ name: 'obr', bits: '_1_110_0_', enter: 'tr', exit: 'lb', points: 'br' },
			{ name: 'obl', bits: '_1_011_0_', enter: 'rb', exit: 'tl', points: 'bl' },
			{ name: 'itl', bits: '01_11____', enter: 'lt', exit: 'tl', points: 'tl' },
			{ name: 'itr', bits: '_10_11___', enter: 'tr', exit: 'rt', points: 'tr' },
			{ name: 'ibr', bits: '____11_10', enter: 'rb', exit: 'br', points: 'br' },
			{ name: 'ibl', bits: '___11_01_', enter: 'bl', exit: 'lb', points: 'bl' },
			{ name: 'et', bits: '_0_111___', enter: 'lt', exit: 'rt', points: 'tc' },
			{ name: 'er', bits: '_1__10_1_', enter: 'tr', exit: 'br', points: 'rc' },
			{ name: 'eb', bits: '___111_0_', enter: 'rb', exit: 'lb', points: 'bc' },
			{ name: 'el', bits: '_1_01__1_', enter: 'bl', exit: 'tl', points: 'lc' },
			{ name: 'out', bits: '_0_010_1_', enter: 'bl', exit: 'br', points: 'tl,tr' },
			{ name: 'our', bits: '_0_110_0_', enter: 'lt', exit: 'lb', points: 'tr,br' },
			{ name: 'oub', bits: '_1_010_0_', enter: 'tr', exit: 'tl', points: 'br,bl' },
			{ name: 'oul', bits: '_0_011_0_', enter: 'rb', exit: 'rt', points: 'bl,tl' },
			{ name: 'solo', bits: '_0_010_0_', enter: '', exit: '', points: 'tl,tr,br,bl' },
		];
		const checkPatterns = (row: number, col: number) =>
			patterns.filter(({ bits }) => {
				let matches = true;
				bits.split('').forEach((b, i) => {
					let r = row + Math.floor(i / 3) - 1,
						c = col + (i % 3) - 1,
						check = checkRC(r, c);
					matches = matches && (b === '_' || (b === '1' && check) || (b === '0' && !check));
				});
				return matches;
			});
		const getSeg = (segs: Seg[], rc: RC, enter: string) => segs.find(([r, c, _, pat]) => r === rc[0] && c === rc[1] && pat.enter === enter);
		const followShape = (segs: Seg[]) => {
			let shape = [],
				seg = segs[0],
				nextSeg;
			const getNext = ([r, c, _, pat]: Seg): Seg | undefined => {
				if (pat.exit === '') return;
				let [exitDir, exitSide] = pat.exit.split('');
				let nextRC = [r + dirRC[exitDir][0], c + dirRC[exitDir][1]] as RC;
				let nextEnter = flipDir[exitDir] + exitSide;
				return getSeg(segs, nextRC, nextEnter);
			};
			do {
				shape.push(seg);
				segs.splice(segs.indexOf(seg), 1);
				nextSeg = getNext(seg);
				seg = nextSeg!;
			} while (nextSeg !== undefined && shape.indexOf(nextSeg) === -1);
			return shape;
		};
		const shapeToPoints = (shape: Seg[]) => {
			let points: RC[] = [];
			shape.forEach(([r, c, _, pat]) =>
				pat.points
					.split(',')
					.map(point => pointOS[point])
					.map(([ros, cos]) => [r + ros, c + cos] as RC)
					.forEach(rc => points.push(rc))
			);
			return points;
		};
		cells.forEach(cell => {
			let [row, col] = cell;
			grid[row] = grid[row] || [];
			grid[row][col] = { cell };
		});
		cells.forEach(cell => {
			let [row, col] = cell,
				matchedPatterns = checkPatterns(row, col);
			matchedPatterns.forEach(pat => segs.push([row, col, cell, pat]));
		});
		while (segs.length > 0) {
			let shape = followShape(segs);
			if (shape.length > 0) shapes.push(shape);
		}
		shapes.forEach(shape => {
			edgePoints.push(shapeToPoints(shape));
		});
		return edgePoints;
	}

	static round0(num: number): number {
		//if (Array.isArray(num)) return num.map(PenpaTools.round0);
		return Math.round(num + Number.EPSILON);
	}
	static round1(num: number) {
		//if (Array.isArray(num)) return num.map(PenpaTools.round1);
		return Math.round((num + Number.EPSILON) * 10) / 10;
	}
	static round2(num: number) {
		//if (Array.isArray(num)) return num.map(PenpaTools.round2);
		return Math.round((num + Number.EPSILON) * 100) / 100;
	}
	static round3(num: number) {
		//if (Array.isArray(num)) return num.map(PenpaTools.round3);
		return Math.round((num + Number.EPSILON) * 1000) / 1000;
	}
	static round256(num: number) {
		//if (Array.isArray(num)) return num.map(PenpaTools.round256);
		return Math.round((num + Number.EPSILON) * 256) / 256;
	}
	static round(num: number) {
		return PenpaTools.round3(num);
	}
	static roundRC(rc: RC): RC {
		const [r, c] = rc;
		return [PenpaTools.round(r), PenpaTools.round(c)];
	}

	isBoardCell = (rc: RC) => {
		const [r, c] = rc;
		return r >= 0 && r < this.puinfo.height && c >= 0 && c < this.puinfo.width;
	};

	point2RC = (p: number | string): RC => {
		const point = this.puinfo.point[Number(p)];
		const r = point.y - 2 - this.puinfo.row0;
		const c = point.x - 2 - this.puinfo.col0;
		return [r, c];
	};
	point2cell = (p: number | string): RC => {
		let [r, c] = this.point2RC(p);
		return [Math.floor(r), Math.floor(c)];
	};

	// static point(p: number | string): Point {
	// 	return this.puinfo.point[Number(p)];
	// }

	point2matrix = (p: number | string): RC => {
		p = this.point2centerPoint(p);
		let x = p % this.puinfo.nx0; //column
		let y = Math.floor(p / this.puinfo.nx0); //row
		return [y - 2, x - 2];
	};
	matrix2point = (y: number | RC, x?: number, type = 0): number => {
		if (Array.isArray(y)) {
			[y, x] = y;
			type = 0;
		}
		let p = (y + 2) * this.puinfo.nx0 + (x! + 2) + type * (this.puinfo.nx0 * this.puinfo.ny0);
		return p;
	};
	matrixRC2point = ([y, x]: RC): number => {
		const type = 0;
		let p = (y + 2) * this.puinfo.nx0 + (x! + 2) + type * (this.puinfo.nx0 * this.puinfo.ny0);
		return p;
	};

	point2centerPoint = (p: number | string): number => {
		p = Number(p);
		const point = this.puinfo.point[p];
		switch (point.type) {
			case 0:
				return p;
			case 1:
			case 2:
			case 3:
				return p - point.type * this.puinfo.nx0 * this.puinfo.ny0;
			case 4:
			case 5:
				return Math.floor((p - 4 * this.puinfo.nx0 * this.puinfo.ny0) / 4) - (point.type - 4) * this.puinfo.nx0 * this.puinfo.ny0;
		}
		return 0;
	};

	makePointPair = (p1: number | string, p2: number | string): string => {
		return PenpaTools.makePointPair(p1, p2);
	};

	static makePointPair(p1: number | string, p2: number | string): string {
		return Math.min(Number(p1), Number(p2)).toString() + ',' + Math.max(Number(p1), Number(p2)).toString();
	}

	private static nullRCMapper = ([r, c]: RC) => [r, c] as RC;

	static getMinMaxRC<T>(list: T[] = [], mapper: (...any: any[]) => RC = PenpaTools.nullRCMapper) {
		const rcs = list.map(mapper);
		const rows = rcs.map(([r, _]) => r);
		const cols = rcs.map(([_, c]) => c);
		return [Math.min(...rows), Math.min(...cols), Math.max(...rows), Math.max(...cols)];
	}

	static getBoundsRC(list: any[] = [], mapper: (...any: any[]) => RC = PenpaTools.nullRCMapper) {
		const [top, left, bottom, right] = PenpaTools.getMinMaxRC(list, mapper);
		const width = right - left + 1;
		const height = bottom - top + 1;
		return { top, left, bottom, right, height, width };
	}

	static toHexColor(rgba: tinycolor.ColorInput, defaultAlpha: number = 0): string {
		if (!rgba) return rgba;
		let color = tinycolor(rgba);
		if ((color as any)._a < 1) {
			return color.toHex8String().toUpperCase();
		}

		if (defaultAlpha) {
			if (defaultAlpha === 1) {
				const opaqueColor = color.toHexString().toUpperCase();
				// Color is already opaque
				if (PenpaTools.ColorIsOpaque(opaqueColor)) {
					return opaqueColor;
				}
			}
			color.setAlpha(defaultAlpha);
			return color.toHex8String().toUpperCase();
		}
		return color.toHexString().toUpperCase();
	}

	static ColorIsOpaque(hex: string) {
		const opaqueColors = ['#000000', '#CFCFCF', '#FFFFFF'];
		return hex && opaqueColors.includes(hex);
	}
	static ColorApplyAlpha(hex: string, doubleLayer: boolean = false) {
		if (!hex || PenpaTools.ColorIsOpaque(hex) || !PenpaTools.ColorIsVisible(hex)) return hex;
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		const alpha = doubleLayer ? 0.75 : 0.5;
		const newR = alpha * r + (1 - alpha) * 255;
		const newG = alpha * g + (1 - alpha) * 255;
		const newB = alpha * b + (1 - alpha) * 255;

		const newHex =
			'#' +
			(newR | (1 << 8)).toString(16).slice(1).toUpperCase() +
			(newG | (1 << 8)).toString(16).slice(1).toUpperCase() +
			(newB | (1 << 8)).toString(16).slice(1).toUpperCase();
		return newHex;
	}

	static ColorIsTransparent(hex: string) {
		// if (typeof color !== 'string') debugger
		return !hex || hex.slice(7) === '00' || (hex.length === 5 && hex.slice(4) === '0');
	}

	static ColorIsVisible(hex: string) {
		// if (typeof color !== 'string') debugger
		return !hex ? false : hex.slice(7) !== '00' && (hex.length !== 5 || hex.slice(4) !== '0');
	}

	static objectEquals(a: any, b: any): boolean {
		if (a === null || a === undefined || b === null || b === undefined) {
			return a === b;
		}
		// after this just checking type of one would be enough
		if (a.constructor !== b.constructor) {
			return false;
		}
		// if they are functions, they should exactly refer to same one (because of closures)
		if (a instanceof Function) {
			return a === b;
		}
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (a instanceof RegExp) {
			return a === b;
		}
		if (a === b || a.valueOf() === b.valueOf()) {
			return true;
		}
		if (Array.isArray(a) && a.length !== b.length) {
			return false;
		}

		// if they are dates, they must had equal valueOf
		if (a instanceof Date) {
			return false;
		}

		// if they are strictly equal, they both need to be object at least
		if (!(a instanceof Object)) {
			return false;
		}
		if (!(b instanceof Object)) {
			return false;
		}

		// recursive object equality check
		const p = Object.keys(a);
		return Object.keys(b).every(i => p.indexOf(i) !== -1) && p.every(i => PenpaTools.objectEquals(a[i], b[i]));
	}
}
