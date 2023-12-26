import { PuInfo } from './penpa-analyzer';
import { PenpaTools } from './penpa-tools';

type Regions = Record<string, RC[]>;
type Squares = Array<Square>;
type Square = {
	r: number;
	c: number;
	size: number;
	regions: Regions;
	region_outline?: Record<string, Array<string>>;
	outline?: Array<string>;
	dominantBorderStyle?: number;
	dominantBorderStyleCount?: number;
};

const defaultBorderStyle = [2, 8, 21];

function extractRegionData(
	puinfo: PuInfo,
	r: number,
	c: number,
	height: number,
	width: number,
	edge_elements: Record<string, number>,
	borderStyle: Array<number> = defaultBorderStyle,
	centerlist?: Array<number>
): Regions {
	const { penpaTools } = puinfo;
	// 2 = black line
	// 8 = red line
	// 21 = thick black line
	const { point2matrix, matrix2point } = penpaTools;

	// Regions
	var cell_matrix: Array<Array<number>> = [];
	var up_matrix: Array<Array<number>> = [];
	var right_matrix: Array<Array<number>> = [];

	function _fillMatrix() {
		cell_matrix.length = 0;
		up_matrix.length = 0;
		right_matrix.length = 0;
		for (var i = 0; i < height; i++) {
			cell_matrix[i] = new Array(width).fill(0);
		}
		for (var i = 0; i < height + 1; i++) {
			up_matrix[i] = new Array(width).fill(0);
		}
		for (var i = 0; i < height; i++) {
			right_matrix[i] = new Array(width + 1).fill(0);
		}

		// Setup Edge Matrices
		var edge, points;
		let count = 0;
		for (edge in edge_elements) {
			// If black edge or thicker edge
			if (borderStyle!.includes(edge_elements[edge])) {
				points = edge.split(',');
				let [y, x] = point2matrix(points[0]);
				x -= c - 1;
				y -= r - 1;
				// data for up matrix
				if (Number(points[1]) - Number(points[0]) === 1) {
					if (x < 0 || x >= width || y < 0 || y > height) continue;
					up_matrix[y][x] = 1;
				} else {
					if (x < 0 || x > width || y < 0 || y >= height) continue;
					right_matrix[y][x] = 1;
				}
				count++;
			}
		}
		return count;
	}

	const minimumLineCount: Record<number, number> = {
		1: 0,
		2: 0,
		3: 0,
		4: 8,
		5: 16,
		6: 18,
		7: 28,
		8: 32,
		9: 36,
		10: 50,
		11: 50, // not possible
		12: 60,
	};

	const linecountMinimum = minimumLineCount[Math.min(height, width)] || 0;
	let linecount = _fillMatrix();
	if (linecount < linecountMinimum) {
		if (borderStyle !== defaultBorderStyle) {
			// try again with default borderStyle;
			// FIXME: this has no effect. Probably need to set borderStyle !== defaultBorderStyle
			linecount = _fillMatrix();
		}
	}
	// Not enough edges found to determine a minimum 50% of the cages.
	if (linecount < linecountMinimum / 2) {
		return {};
	}

	var counter = 0;
	// Define regions using numbers
	// Loop through each cell
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			// first row doesnt have up
			if (i === 0) {
				// 0,0 is starting reference
				if (j > 0) {
					if (right_matrix[i][j] === 0) {
						cell_matrix[i][j] = cell_matrix[i][j - 1];
					} else {
						counter++;
						cell_matrix[i][j] = counter;
					}
				}
			} else {
				// UP
				if (up_matrix[i][j] === 0) {
					if (j > 0) {
						// Change all connected cells to this new value
						for (var region = 0; region <= i; region++) {
							for (var m = 0; m < width; m++) {
								if (cell_matrix[region][m] === cell_matrix[i][j]) {
									cell_matrix[region][m] = cell_matrix[i - 1][j];
								}
							}
						}
					}
					cell_matrix[i][j] = cell_matrix[i - 1][j];
				} else {
					counter++;
					if (j > 0) {
						// Change all connected cells to this new value
						for (var region = 0; region <= i; region++) {
							for (var m = 0; m < width; m++) {
								if (cell_matrix[region][m] === cell_matrix[i][j]) {
									cell_matrix[region][m] = counter;
								}
							}
						}
					}
					cell_matrix[i][j] = counter;
				}
				// RIGHT
				if (j < width - 1) {
					if (right_matrix[i][j + 1] === 0) {
						cell_matrix[i][j + 1] = cell_matrix[i][j];
					} else {
						counter++;
						cell_matrix[i][j + 1] = counter;
					}
				}
			}
		}
	}

	// Find unique numbers
	var unique_nums = [];
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			if (centerlist && !centerlist.includes(matrix2point(i + r, j + c))) {
				cell_matrix[i][j] = -1; // Not in center list: exclude
			} else if (unique_nums.indexOf(cell_matrix[i][j]) === -1) {
				unique_nums.push(cell_matrix[i][j]);
			}
		}
	}
	var size_unique_nums = unique_nums.length;

	let regions: Regions = {};
	for (var region = 0; region < size_unique_nums; region++) {
		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				if (cell_matrix[i][j] === unique_nums[region]) {
					if (regions[region] === undefined) {
						regions[region] = [];
					}
					regions[region].push([i + r, j + c]);
				}
			}
		}
	}

	if (width === height) {
		regions = finishIncompleteRegions(r, c, width, regions);
	}

	return regions;
}

// const getRegionSizes = function (regions) {
// 	let sizes = {};
// 	Object.keys(regions).forEach(reg => (sizes[regions[reg].length] = (sizes[regions[reg].length] | 0) + 1));
// 	return sizes;
// };

function finishIncompleteRegions(r0: number, c0: number, size: number, regions: Regions) {
	const regkeys = Object.keys(regions);
	let cellcount = regkeys.reduce((acc, reg) => acc + regions[reg].length, 0);
	let complete = regkeys.filter(reg => regions[reg].length === size).length;
	// All regions found
	if (complete === size) {
		return regions;
	}

	// Sanity check, should not occure
	if (cellcount !== size * size) {
		return regions;
	}
	// Not enough completed regions to continue
	if (complete <= size / 2) {
		return regions;
	}

	// Merge sparse cells into single region
	if (complete === size - 1 && regkeys.length === size + size - 1) {
		let newregion: RC[];
		regkeys.forEach(reg => {
			if (regions[reg].length !== size) {
				if (!newregion) {
					newregion = regions[reg];
				} else {
					newregion.push(...regions[reg]);
					delete regions[reg];
				}
			}
		});
		return regions;
	}

	// Check for equal region shape (rectangle) of completed regions
	let maxw = 0,
		maxh = 0;
	regkeys.forEach(reg => {
		if (regions[reg].length === size) {
			const { height, width } = PenpaTools.getBoundsRC(regions[reg]);
			maxw = Math.max(maxw, width);
			maxh = Math.max(maxh, height);
		}
	});

	// The completed regions are not all the same shape
	// Probably irregular or pentomino sudoku
	// Not possible to reliably determine missing regions
	if (maxw * maxh !== size) {
		return regions;
	}

	// Recreate all missing regions from the known shape
	regions = {};
	const cols = size / maxw;
	for (let reg = 0; reg < size; reg++) {
		let row = r0 + Math.floor(reg / cols) * maxh;
		let col = c0 + (reg % cols) * maxw;
		regions[reg] = [];
		for (let y = 0; y < maxh; y++) {
			for (let x = 0; x < maxw; x++) {
				regions[reg].push([row + y, col + x]);
			}
		}
	}
	return regions;
}

function findLargestFixedSquareAtRC(puinfo: PuInfo, squares: Squares, centerlist: Array<number>, r0: number, c0: number, maxSize: number) {
	const { matrix2point } = puinfo.penpaTools;
	let size = 2;
	let foundSquare = null;

	do {
		// Increase size until it no longer fits
		size += 1;
		// Completely inside another square?
		let inside = squares.some(sq => r0 >= sq.r && r0 + size <= sq.r + sq.size && c0 >= sq.c && c0 + size <= sq.c + sq.size);
		if (inside) continue;

		// Does it fit at (r0, c0)?
		let clash = false;
		for (let r = r0; r < r0 + size; r++) {
			for (let c = c0; c < c0 + size; c++) {
				if (!centerlist.includes(matrix2point(r, c))) {
					clash = true;
					break;
				}
			}
			if (clash) break;
		}

		if (clash) {
			// Try again one column to the left at (r0, c0 - 1)
			clash = false;
			c0 -= 1;
			size -= 1;
			let inside = squares.some(sq => r0 >= sq.r && r0 + size <= sq.r + sq.size && c0 >= sq.c && c0 + size <= sq.c + sq.size);
			if (inside) continue;

			for (let r = r0; r < r0 + size; r++) {
				for (let c = c0; c < c0 + size; c++) {
					if (!centerlist.includes(matrix2point(r, c))) {
						clash = true;
						break;
					}
				}
				if (clash) break;
			}
		}
		if (clash) break;

		// Record last found square
		foundSquare = { r: r0, c: c0, size: size } as Square;
	} while (size < maxSize);

	return foundSquare;
}

//Find unused centerList cell
function findNextSquare(puinfo: PuInfo, squares: Squares, centerlist: Array<number>, height: number, width: number) {
	const { matrix2point } = puinfo.penpaTools;
	const maxSize = Math.min(width, height);
	for (let r0 = 0; r0 < maxSize; r0++) {
		for (let c0 = 0; c0 < maxSize; c0++) {
			if (!centerlist.includes(matrix2point(r0, c0))) continue;

			let square = findLargestFixedSquareAtRC(puinfo, squares, centerlist, r0, c0, maxSize);
			if (square) {
				squares.push(square);
				return square;
			}
		}
	}
	return null;
}

export class PenpaRegions {
	static cleanupCenterlist(puinfo: PuInfo, solutionPoints: Array<number>) {
		const { pu, penpaTools } = puinfo;
		const { getAdjacentCellsOfEdgeLine, point2matrix } = penpaTools;
		const { height, width } = PenpaTools.getBoundsRC(pu.centerlist, point2matrix);

		// Remove obsolete deletelineE's
		Object.keys(pu.pu_q.deletelineE).forEach(k => {
			let adj = getAdjacentCellsOfEdgeLine(pu, k);
			if (!pu.centerlist.includes(adj[0]) && !pu.centerlist.includes(adj[1])) {
				delete pu.pu_q.deletelineE[k];
			}
		});

		const noGridLines = pu.mode.grid[0] === '3';
		const noGridPoints = pu.mode.grid[1] === '2';
		const noFrame = pu.mode.grid[2] === '2';
		// First determine if cells need to be removed:
		// remove cells when deletelineE is on the edge of centerlist cells, or on the outer ring when there is no frame.
		let removeCells = false;
		for (let k in pu.pu_q.deletelineE) {
			// Don't remove when replaced with another line
			if (k in pu.pu_q.lineE || k in pu.frame) {
				continue;
			}
			let adj = getAdjacentCellsOfEdgeLine(pu, k);
			// Is on border of centerlist (one side in centerlist, the other side not)
			let inside1 = pu.centerlist.includes(adj[0]);
			let inside2 = pu.centerlist.includes(adj[1]);
			// a deleted outer frame
			if (inside1 !== inside2) {
				removeCells = true;
				break;
			}

			if (noFrame) {
				let p1 = point2matrix(adj[0]);
				let p2 = point2matrix(adj[1]);
				let onedge1 = p1[0] === 0 || p1[0] === height - 1 || p1[1] === 0 || p1[1] === width - 1;
				let onedge2 = p2[0] === 0 || p2[0] === height - 1 || p2[1] === 0 || p2[1] === width - 1;
				// At least one side is on outer ring of centerlist
				if (onedge1 || onedge2) {
					removeCells = true;
					break;
				}
			}
		}

		if (removeCells) {
			let centerlist = [...pu.centerlist];
			// remove cells from centerlist based on deletelineE
			Object.keys(pu.pu_q.deletelineE).forEach(k => {
				// Don't remove when replaced with another line
				if (k in pu.pu_q.lineE || k in pu.frame) {
					return;
				}
				let adj = getAdjacentCellsOfEdgeLine(pu, k);
				// Don't remove when on a surface
				if (pu.pu_q.surface[adj[0]] || pu.pu_q.surface[adj[1]]) {
					return;
				}
				let index1 = pu.centerlist.indexOf(adj[0]);
				if (index1 !== -1 && !solutionPoints.includes(adj[0])) {
					pu.centerlist.splice(index1, 1);
				}
				let index2 = pu.centerlist.indexOf(adj[1]);
				if (index2 !== -1 && !solutionPoints.includes(adj[1])) {
					pu.centerlist.splice(index2, 1);
				}
			});
			// Restore centerlist if most of the cells were removed, which was probably not intended
			if (pu.centerlist.length < (pu.nx * pu.ny) / 6) {
				// Some arbitrary limit
				pu.centerlist.length = 0;
				pu.centerlist.push(...centerlist);
			}
		} else {
			// In case there is no frame and no grid lines and no grid points
			// then always recreate centerlist from lineE lines.
			// Should have no grid lines, no frame, and no grid points
			if (noFrame && noGridLines && noGridPoints) {
				// recreate centerlist based on lineE
				let cl: Record<string, number> = {};
				let lineE = pu.pu_q.lineE;
				const gridLineStyles = [1, 2, 21, 80];
				for (let k in pu.pu_q.lineE) {
					if (gridLineStyles.includes(lineE[k])) {
						let adj = getAdjacentCellsOfEdgeLine(pu, k);
						if (!cl[adj[0]]) {
							cl[adj[0]] = 1;
						} else {
							cl[adj[0]] += 1;
						}
						if (!cl[adj[1]]) {
							cl[adj[1]] = 1;
						} else {
							cl[adj[1]] += 1;
						}
					}
				}
				// Add to centerlist when surrounded by 4 lines.
				let centerlist = Object.keys(cl)
					.filter(p => cl[p] >= 4)
					.map(Number);
				if (centerlist.length > (pu.nx * pu.ny) / 6) {
					// Some arbitrary limit
					pu.centerlist.length = 0;
					pu.centerlist.push(...centerlist);
				}
			}
		}
	}

	static findSudokuSquares(puinfo: PuInfo) {
		const { pu, penpaTools } = puinfo;
		const { point2matrix, matrix2point, matrixRC2point } = penpaTools;
		const { getBoundsRC } = PenpaTools;

		// Get combined edge lines (LineE) plus the outside frame.
		// Exclude thin or dash grid lines (=1 or 11).
		let edge_elements = Object.assign({}, pu.frame, pu.pu_q.lineE);
		Object.keys(edge_elements)
			.filter(k => [1, 11].includes(edge_elements[k]))
			.forEach(k => delete edge_elements[k]);

		const { top, left, height, width } = getBoundsRC(pu.centerlist, point2matrix);

		let allEqualSize = true;
		let regions: Regions;

		const edgeStyles = [
			[2], // Black frame
			[8], // Thick black frame
			[21], // Red frame
			[2, 8, 21], // Combo
		];
		for (let edgeStyle of edgeStyles) {
			regions = extractRegionData(puinfo, top, left, height, width, edge_elements, edgeStyle, pu.centerlist);
			//console.log('regions', regions);

			let sizes: Record<number, number> = {};
			Object.keys(regions).forEach(reg => (sizes[regions[reg].length] = (sizes[regions[reg].length] | 0) + 1));
			let sortedSizes = Object.keys(sizes)
				.map(Number)
				.sort((a, b) => a - b)
				.reverse();
			for (let regionSize of sortedSizes) {
				if (regionSize >= 4 && regionSize <= 16 && sizes[regionSize] >= 4) {
					let selectedRegions = Object.keys(regions)
						.filter(reg => regions[reg].length === regionSize)
						.map(reg => regions[reg]);
					const { top, left, height, width } = getBoundsRC(selectedRegions.flat());
					// All found regions must tightly pack into a square
					if (height === width && regionSize * sizes[regionSize] === width * height) {
						let squares = [{ r: top, c: left, size: height, regions: selectedRegions as unknown as Regions }] as Squares;
						return { squares, regions: selectedRegions as unknown as Regions };
					}
				}
			}
			allEqualSize = false;

			// // All found regions should have equal size.
			// let size = -1;
			// var allEqualSize = Object.keys(regions).length > 2 && Object.keys(regions).every(reg => {
			// 	if (size === -1) size = regions[reg].length;
			// 	return regions[reg].length === size;
			// })
			// if (allEqualSize) break;
		}
		const squares: Squares = [];
		while (findNextSquare(puinfo, squares, pu.centerlist, height, width)) {}

		if (allEqualSize) {
			function eqSet<T extends Set<number>>(xs: T, ys: T) {
				return xs.size === ys.size && [...xs].every(x => ys.has(x));
			}

			let regionsSet = new Set(Object.keys(regions!).flatMap(reg => regions[reg].map(matrixRC2point)));
			let squaresSet = new Set<number>(
				squares.flatMap(sq => {
					let points = [];
					for (let r = 0; r < sq.size; r++) {
						for (let c = 0; c < sq.size; c++) {
							points.push(matrix2point(r + sq.r, c + sq.c));
						}
					}
					return points;
				})
			);

			let equal = eqSet(regionsSet, squaresSet);
			if (!equal) {
				regions = null!;
			}
		} else {
			regions = null!;
		}

		regions ??= null!;
		return { squares, regions };
	}

	static createOutline(puinfo: PuInfo, regionyx: Array<RC>): string[] {
		const { pu, penpaTools } = puinfo;
		const { matrix2point } = penpaTools;
		const { makePointPair } = PenpaTools;
		let frame: Record<string, number> = {};
		for (let yx of regionyx) {
			let [y, x] = yx;
			let point = pu.point[matrix2point(y, x)];
			let corner = point.surround.length;
			for (let i = 0; i < corner; i++) {
				let key = makePointPair(point.surround[i], point.surround[(i + 1) % corner]);
				if (frame[key]) {
					frame[key] = 1;
				} else {
					frame[key] = 2;
				}
			}
		}
		let outline = Object.keys(frame).filter(k => frame[k] === 2);
		return outline;
	}

	static createRegionOutlines(puinfo: PuInfo, sq: Square) {
		sq.region_outline = {} as typeof sq.region_outline;
		for (let reg in sq.regions) {
			let region = sq.regions[reg];
			if (region.length !== sq.size) {
				continue;
			}
			sq.region_outline![reg] = PenpaRegions.createOutline(puinfo, region);
		}
	}

	static findSudokuRegions(puinfo: PuInfo, squares: Squares) {
		const { pu, penpaTools } = puinfo;
		const { matrix2point } = penpaTools;
		const { makePointPair } = PenpaTools;
		const lineE = Object.assign({}, pu.pu_q.lineE, pu.frame);

		// Single square found.
		// For single squares all regions should be fully defined by fat edge lines.
		// If not all regions are resolved then don't look further, just return as-is.
		if (squares.length === 1) {
			let edge_elements = pu.pu_q.lineE;
			let { r, c, size } = squares[0];
			squares[0].regions = extractRegionData(puinfo, r, c, size, size, edge_elements);
		} else {
			// For overlapping squares try several strategies to resolve all regions.

			// Create square outlines
			for (let sq of squares) {
				sq.outline = [];
				for (let i = 0; i < sq.size; i++) {
					let p11 = matrix2point(sq.r + i - 1, sq.c - 1, 1);
					let p12 = matrix2point(sq.r + i, sq.c - 1, 1);
					sq.outline.push(makePointPair(p11, p12));
					let p21 = matrix2point(sq.r - 1, sq.c + i - 1, 1);
					let p22 = matrix2point(sq.r - 1, sq.c + i, 1);
					sq.outline.push(makePointPair(p21, p22));
					let p31 = matrix2point(sq.r + i - 1, sq.c + sq.size - 1, 1);
					let p32 = matrix2point(sq.r + i, sq.c + sq.size - 1, 1);
					sq.outline.push(makePointPair(p31, p32));
					let p41 = matrix2point(sq.r + sq.size - 1, sq.c + i - 1, 1);
					let p42 = matrix2point(sq.r + sq.size - 1, sq.c + i, 1);
					sq.outline.push(makePointPair(p41, p42));
				}
				// Get dominant linestyle of outline
				let lineStyleCount: Record<number, number> = {};
				sq.outline.forEach(k => {
					let linestyle = lineE[k];
					if (linestyle) {
						lineStyleCount[linestyle] = (lineStyleCount[linestyle] || 0) + 1;
					}
				});
				sq.dominantBorderStyle = undefined!;
				sq.dominantBorderStyleCount = 0;
				Object.keys(lineStyleCount).forEach(k => {
					if (lineStyleCount[Number(k)] > sq.dominantBorderStyleCount!) {
						sq.dominantBorderStyle = Number(k);
						sq.dominantBorderStyleCount = lineStyleCount[Number(k)];
					}
				});
			}

			// Try to find all regions
			for (let sq of squares) {
				//let edge_elements = pu.pu_q.lineE;
				let edge_elements = lineE;
				// First pass, try with dominant border linestyle
				sq.regions = extractRegionData(puinfo, sq.r, sq.c, sq.size, sq.size, edge_elements, [sq.dominantBorderStyle!]);
				// When failed then try again with default borderStyle
				if (Object.keys(sq.regions).length !== sq.size) {
					sq.regions = extractRegionData(puinfo, sq.r, sq.c, sq.size, sq.size, edge_elements);
				}
				PenpaRegions.createRegionOutlines(puinfo, sq);
				// console.log(sq);
			}

			// Use different tactic when not all squares are resolved
			if (squares.some(sq => Object.keys(sq.regions).length !== sq.size || Object.keys(sq.regions).some(reg => sq.regions[reg].length !== sq.size))) {
				// Remove all square and region outlines
				let failedSquares = [];
				let noFrameEdges = Object.assign({}, pu.pu_q.lineE, pu.frame);
				let noRegionEdges = Object.assign({}, pu.pu_q.lineE, pu.frame);
				for (let sq of squares) {
					// Remove square outlines
					sq.outline!.forEach(k => delete noFrameEdges[k]);
					sq.outline!.forEach(k => delete noRegionEdges[k]);
					// Remove region outlines
					Object.keys(sq.regions).forEach(reg => {
						if (sq.regions[reg].length === sq.size) {
							sq.region_outline![reg].forEach(k => delete noRegionEdges[k]);
						}
					});
					if (Object.keys(sq.regions).length !== sq.size) {
						failedSquares.push(sq);
					}
				}

				// Revisit failed squares, but now with selectively erased lines.
				for (let sq of failedSquares) {
					let validRegionOutlines: Array<string[]> = [];
					//let resolved = 
					[noFrameEdges, noRegionEdges].some(noEdges => {
						// try again with erased lines
						let edges = Object.assign({}, noEdges);
						Object.keys(sq.regions) // collect valid regions
							.filter(reg => sq.regions[reg].length === sq.size)
							.forEach(reg => validRegionOutlines.push(sq.region_outline![reg]));
						// Add all valid region outlines of current square
						validRegionOutlines.forEach(outline =>
							outline.forEach(k => {
								edges[k] = 21;
							})
						); // draw (thick) outline
						sq.regions = extractRegionData(puinfo, sq.r, sq.c, sq.size, sq.size, edges);
						PenpaRegions.createRegionOutlines(puinfo, sq);
						let resolved = Object.keys(sq.regions).length === sq.size;
						// if (!resolved) pu.pu_q.lineE = edges;
						return resolved;
					});
				}
				// pu.pu_q.lineE = noFrameEdges;
			}
		}

		let allSquaresResolved = squares.every(
			sq => Object.keys(sq.regions).length === sq.size && Object.keys(sq.regions).every(reg => sq.regions[reg].length === sq.size)
		);
		if (allSquaresResolved) {
			console.log('All cages are resolved!');
		} else {
			console.log(squares);
			console.warn('Not all cages resolved');
		}
	}
}
