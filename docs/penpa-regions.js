const PenpaRegions = (() => {
    function _constructor() { }
	const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	function getregiondata(r, c, size, edge_elements, borderStyle) {
		let regions = extractRegionData(r, c, size, size, edge_elements, borderStyle);
		return regions;
		// return finishIncompleteRegions(r, c, size, regions);
	}

	function extractRegionData(r, c, height, width, edge_elements, borderStyle = undefined, centerlist = undefined) {
		// 2 = black line
		// 8 = red line
		// 21 = thick black line
		const defaultBorderStyle = [2, 8, 21];
		const {point2matrix, matrix2point} = PenpaTools;
		if (borderStyle === undefined) borderStyle = defaultBorderStyle;
		if (!Array.isArray(borderStyle)) { borderStyle = [borderStyle]; }

        // Regions
        var cell_matrix = [];
        var up_matrix = [];
        var right_matrix = [];

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
				if (borderStyle.includes(edge_elements[edge])) {
					points = edge.split(',');
					let [y, x] = point2matrix(points[0]);
					x -= c - 1;
					y -= r - 1;
					// data for up matrix
					if ((Number(points[1]) - Number(points[0])) === 1) {
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

		const minimumLineCount = {
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

		const linecountMinimum = (minimumLineCount[Math.min(height, width)] || 0);
		let linecount = _fillMatrix(borderStyle);
		if (linecount < linecountMinimum) {
			if (borderStyle !== defaultBorderStyle) {
				// try again with default borderStyle;
				linecount = _fillMatrix(defaultBorderStyle);
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
									if (
										cell_matrix[region][m] === cell_matrix[i][j]
									) {
										cell_matrix[region][m] =
											cell_matrix[i - 1][j];
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
									if (
										cell_matrix[region][m] === cell_matrix[i][j]
									) {
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
				if(centerlist && !centerlist.includes(matrix2point(i + r, j + c))) {
					cell_matrix[i][j] = -1; // Not in center list: exclude
				}
				else if (unique_nums.indexOf(cell_matrix[i][j]) === -1) {
					unique_nums.push(cell_matrix[i][j]);
				}
			}
		}
		var size_unique_nums = unique_nums.length;

		let regions = {};
        for (var region = 0; region < size_unique_nums; region++) {
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (cell_matrix[i][j] === unique_nums[region]) {
						if(regions[region] === undefined) {
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

	function finishIncompleteRegions(r0, c0, size, regions) {
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
			let newregion;
			regkeys.forEach(reg => {
				if (regions[reg].length !== size) {
					if (!newregion) {
						newregion = regions[reg];
					}
					else {
						newregion.push(...regions[reg]);
						delete regions[reg];
					}
				}
			});
            return regions;
		}

		// Check for equal region shape (rectangle) of completed regions
		let maxw = 0, maxh = 0;
		regkeys.forEach(reg => {
			if (regions[reg].length === size) {
				const {height, width} = PenpaTools.getBoundsRC(regions[reg]);
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

	function findLargestFixedSquareAtRC(squares, centerlist, r0, c0, maxSize) {
		const {matrix2point} = PenpaTools;
		let size = 2;
		let foundSquare = null;

		do {
			// Increase size until it no longer fits
			size += 1;
			// Completely inside another square?
			let inside = squares.some(sq =>
				r0 >= sq.r && r0 + size <= sq.r + sq.size &&
				c0 >= sq.c && c0 + size <= sq.c + sq.size );
			if (inside) continue;

			// Does it fit at (r0, c0)?
			let clash = false;
			for(let r = r0; r < r0 + size; r++) {
				for(let c = c0; c < c0 + size; c++) {
					if(!centerlist.includes(matrix2point(r, c))) {
						clash = true;
						break;
					}
				}
				if(clash) break;
			}

			if (clash) {
				// Try again one column to the left at (r0, c0 - 1)
				clash = false;
				c0 -= 1;
				size -= 1;
				let inside = squares.some(sq =>
					r0 >= sq.r && r0 + size <= sq.r + sq.size &&
					c0 >= sq.c && c0 + size <= sq.c + sq.size );
				if (inside) continue;

				for(let r = r0; r < r0 + size; r++) {
					for(let c = c0; c < c0 + size; c++) {
						if(!centerlist.includes(matrix2point(r, c))) {
							clash = true;
							break;
						}
					}
					if(clash) break;
				}
			}
			if (clash) break;

			// Record last found square
			foundSquare = { r: r0, c: c0, size: size };

		} while(size < maxSize);

		return foundSquare;
	}

	//Find unused centerList cell
	function findNextSquare(squares, centerlist, height, width) {
		const {matrix2point} = PenpaTools;
		const maxSize = Math.min(width, height);
		for(let r0 = 0; r0 < maxSize; r0++) {
			for(let c0 = 0; c0 < maxSize; c0++) {
				if (!centerlist.includes(matrix2point(r0, c0))) continue;

				let square = findLargestFixedSquareAtRC(squares, centerlist, r0, c0, maxSize);
				if (square) {
					squares.push(square);
					return square;
				}
			}
		}
		return null;
	}

	C.cleanupCenterlist = function(pu) {
		const {getAdjacentCellsOfELine, point2matrix} = PenpaTools;
		const {height, width} = PenpaTools.getBoundsRC(pu.centerlist, point2matrix);

		// Cleanup frame
		for (let k in pu.pu_q.deletelineE) {
			// Don't delete when replaced with another line
			if (pu.pu_q.lineE[k] === undefined)
				delete pu.frame[k];
		}
		// Remove deleted/invisible framelines from frame.
		Object.keys(pu.frame).filter(k => pu.frame[k] === 0).forEach(k => delete pu.frame[k]);

		const noFrame = pu.mode.grid[0] === '3';
		const noGridLines = pu.mode.grid[2] === '2';
		const noGridPoints = pu.mode.grid[1] === '2';
		// First determine if cells need to be removed:
		// remove cells when deletelineE is on the edge of centerlist cells, or on the outer ring when there is no frame.
		let removeCells = false;
		for(let k in pu.pu_q.deletelineE) {
			// Don't remove when replaced with another line
			if (k in pu.pu_q.lineE) {
				continue;
			}
			let adj = getAdjacentCellsOfELine(pu, k);
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
				let onedge1 = (p1[0] === 0 || p1[0] === height - 1 || p1[1] === 0 || p1[1] === width - 1);
				let onedge2 = (p2[0] === 0 || p2[0] === height - 1 || p2[1] === 0 || p2[1] === width - 1);
				// At least one side is on outer ring of centerlist
				if(onedge1 || onedge2) {
					removeCells = true;
					break;
				}
			}
		}

		if (removeCells) {
			// remove cells from centerlist based on deletelineE
			Object.keys(pu.pu_q.deletelineE).forEach(k => {
				// Don't remove when replaced with another line
				if (k in pu.pu_q.lineE) {
					return;
				}
				let adj = getAdjacentCellsOfELine(pu, k);
				// Don't remove when on a surface
				if (pu.pu_q.surface[adj[0]] || pu.pu_q.surface[adj[1]]) {
					return;
				}
				let index1 = pu.centerlist.indexOf(adj[0]);
				if (index1 !== -1) {
					pu.centerlist.splice(index1, 1);
					delete pu.pu_q.deletelineE[k];
				}
				let index2 = pu.centerlist.indexOf(adj[1]);
				if (index2 !== -1) {
					pu.centerlist.splice(index2, 1);
					delete pu.pu_q.deletelineE[k];
				}
				// was already removed from centerlist
				if (index1 === -1 && index2 === -1) {
					delete pu.pu_q.deletelineE[k];
				}
			});
		}
		else {
			// In case there is no frame and no grid lines and no grid points
			// then always recreate centerlist from lineE lines.
			// Should have no grid lines, no frame, and no grid points
			if (noFrame && noGridLines && noGridPoints) {
				// recreate centerlist based on lineE
				let cl = {};
				let lineE = pu.pu_q.lineE;
                const gridLineStyles = [1, 2, 21, 80];
				for(let k in pu.pu_q.lineE) {
					if (gridLineStyles.includes(lineE[k])) {
						let adj = getAdjacentCellsOfELine(pu, k);
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
				let centerlist = Object.keys(cl).filter(p => cl[p] >= 4).map(Number);
				if (centerlist.length > 10) { // Some arbitrary limit
					pu.centerlist.length = 0;
					pu.centerlist.push(...centerlist);
				}
			}
		}

		// // Remove black(-ish) surfaces from centerlist
		// let surface = pu.pu_q.surface;
		// for(let k in surface) {
		// 	if([1, 4].includes(surface[k])) {
		// 		let index = pu.centerlist.indexOf(Number(k));
		// 		if (index !== -1) {
		// 			pu.centerlist.splice(index, 1);
		// 		}
		// 	}
		// }

	}

	C.findSudokuSquares = function(pu) {
		const {point2matrix, matrix2point, getBoundsRC} = PenpaTools;

		// Get combined edge lines (LineE) plus the outside frame.
		// Exclude thin or dash grid lines (=1 or 11).
		let edge_elements = Object.assign({}, pu.frame, pu.pu_q.lineE);
		Object.keys(edge_elements).filter(k => [1, 11].includes(edge_elements[k])).forEach(k => delete edge_elements[k]);

		const {top, left, height, width} = getBoundsRC(pu.centerlist, point2matrix);

		const edgeStyles = [
			[2], // Black frame
			[8], // Thick black frame
			[21], // Red frame
			[2, 8, 21], // Combo
		];
		for(let edgeStyle of edgeStyles) {			
			var regions = extractRegionData(top, left, height, width, edge_elements, edgeStyle, pu.centerlist);
			console.log('regions', regions);
			
			// All regions should have equal size.
			let size = -1;
			var allEqualSize = Object.keys(regions).length > 0 && Object.keys(regions).every(reg => {
				if (size === -1) size = regions[reg].length;
				return regions[reg].length === size;
			})
			if (allEqualSize) break;
		}		
		
		const squares = [];
		while(findNextSquare(squares, pu.centerlist, height, width)) { }

		if (allEqualSize) {
			const eqSet = (xs, ys) => xs.size === ys.size && [...xs].every((x) => ys.has(x));

			let regionsSet = new Set(Object.keys(regions).flatMap(reg => regions[reg].map(matrix2point)));
			let squaresSet = new Set(squares.flatMap(sq => {
				let points = [];
				for (let r = 0; r < sq.size; r++) {
					for (let c = 0; c < sq.size; c++) {
						points.push(matrix2point(r + sq.r, c + sq.c));
					}
				}
				return points;
			}));

			let equal = eqSet(regionsSet, squaresSet);
			if (!equal) {
				regions = null;
			}
		}
		else {
			regions = null;
		}

		return {squares, regions};
	}

	function createOutline(pu, regionyx) {
		const {matrix2point} = PenpaTools;
		let frame = {};
		for(let yx of regionyx) {
			let [y, x] = yx;
			let point = pu.point[matrix2point(y, x)];
			let corner = point.surround.length;
			for (let i = 0; i < corner; i++) {
				let max = Math.max(point.surround[i], point.surround[(i + 1) % corner]);
				let min = Math.min(point.surround[i], point.surround[(i + 1) % corner]);
				let key = min + "," + max;
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

	function createRegionOutlines(pu, sq) {
		sq.region_outline = {};
		for(let reg in sq.regions) {
			let region = sq.regions[reg];
			if (region.length !== sq.size) {
				continue;
			}
			sq.region_outline[reg] = createOutline(pu, region);
		}
	}


	C.findSudokuRegions = function(pu, squares) {
		const {matrix2point} = PenpaTools;
		const lineE = pu.pu_q.lineE;

		// Single square found.
		// For single squares all regions should be fully defined by fat edge lines.
		// If not all regions are resolved then don't look further, just return as-is.
		if (squares.length === 1) {
			let edge_elements = pu.pu_q.lineE;
			let {r, c, size} = squares[0];
			squares[0].regions = extractRegionData(r, c, size, size, edge_elements);
		}
		else {
			// For overlapping squares try several strategies to resolve all regions.

			// Create square outlines
			for(let sq of squares) {
				sq.outline = [];
				for (let i = 0; i < sq.size; i++) {
					let p11 = matrix2point(sq.r + i - 1, sq.c - 1, 1)
					let p12 = matrix2point(sq.r + i, sq.c - 1, 1)
					let l1 = p11 + ',' + p12;
					sq.outline.push(l1);
					let p21 = matrix2point(sq.r - 1, sq.c + i - 1, 1);
					let p22 = matrix2point(sq.r - 1, sq.c + i, 1);
					let l2 = p21 + ',' + p22;
					sq.outline.push(l2);
					let p31 = matrix2point(sq.r + i - 1, sq.c + sq.size - 1, 1);
					let p32 = matrix2point(sq.r + i, sq.c + sq.size - 1, 1);
					let l3 = p31 + ',' + p32;
					sq.outline.push(l3);
					let p41 = matrix2point(sq.r + sq.size - 1, sq.c + i - 1, 1);
					let p42 = matrix2point(sq.r + sq.size - 1, sq.c + i, 1);
					let l4 = p41 + ',' + p42;
					sq.outline.push(l4);
				}
				// Get dominant linestyle of outline
				let lineStyleCount = {};
				sq.outline.forEach(k => {
					let linestyle = lineE[k];
					if (linestyle) {
						lineStyleCount[linestyle] = (lineStyleCount[linestyle] || 0) + 1;
					}
				})
				sq.dominantBorderStyle = undefined;
				sq.dominantBorderStyleCount = 0;
				Object.keys(lineStyleCount).forEach(k => {
					if (lineStyleCount[k] > sq.dominantBorderStyleCount) {
						sq.dominantBorderStyle = Number(k);
						sq.dominantBorderStyleCount = lineStyleCount[k];
					}
				});
			}

			// Try to find all regions
			for(let sq of squares) {
				let edge_elements = pu.pu_q.lineE;
				// First pass, try with dominant border linestyle
				sq.regions = getregiondata(sq.r, sq.c, sq.size, edge_elements, sq.dominantBorderStyle);
				// When failed then try again with default borderStyle
				if (Object.keys(sq.regions).length !== sq.size) {
					sq.regions = getregiondata(sq.r, sq.c, sq.size, edge_elements);
				}
				createRegionOutlines(pu, sq);
				// console.log(sq);
			}

			// Use different tactic when not all squares are resolved
			if(squares.some(sq => Object.keys(sq.regions).length !== sq.size || Object.keys(sq.regions).some(reg => sq.regions[reg].length !== sq.size))) {
				// Remove all square and region outlines
				let failedSquares = [];
				let noFrameEdges = Object.assign({}, pu.pu_q.lineE);
				let noRegionEdges = Object.assign({}, pu.pu_q.lineE);
				for(let sq of squares) {
					// Remove square outlines
					sq.outline.forEach(k => delete noFrameEdges[k]);
					sq.outline.forEach(k => delete noRegionEdges[k]);
					// Remove region outlines
					Object.keys(sq.regions).forEach(reg => {
						if (sq.regions[reg].length === sq.size) {
							sq.region_outline[reg].forEach(k => delete noRegionEdges[k])
						}
					});
					if (Object.keys(sq.regions).length !== sq.size) {
						failedSquares.push(sq);
					}
				}

				// Revisit failed squares, but now with selectively erased lines.
				for(let sq of failedSquares) {
					let validRegionOutlines = [];
					let resolved = [noFrameEdges, noRegionEdges].some(noEdges => {
						// try again with erased lines
						let edges = Object.assign({}, noEdges);
						Object.keys(sq.regions) // collect valid regions
							.filter(reg => sq.regions[reg].length === sq.size)
							.forEach(reg => validRegionOutlines.push(sq.region_outline[reg]));
						// Add all valid region outlines of current square
						validRegionOutlines.forEach(outline => outline.forEach(k => { edges[k] = 21; })) // draw (thick) outline
						sq.regions = getregiondata(sq.r, sq.c, sq.size, edges);
						createRegionOutlines(pu, sq);
						let resolved = Object.keys(sq.regions).length === sq.size;
						// if (!resolved) pu.pu_q.lineE = edges;
						return resolved;
					});
				}
				// pu.pu_q.lineE = noFrameEdges;
			}
		}

		let allSquaresResolved = squares.every(sq => Object.keys(sq.regions).length === sq.size && Object.keys(sq.regions).every(reg => sq.regions[reg].length === sq.size))
		if(allSquaresResolved) {
			console.log('All cages are resolved!')
		}
		else {
			console.log(squares);
			console.warn('Not all cages resolved');
		}
	}

	return C;
})();
