const PenpaRegions = (() => {
    function _constructor() { }
	const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	function getregiondata(r, c, size, edge_elements, borderStyle) {
		// 2 = black line
		// 8 = red line
		// 21 = thick black line
		const defaultBorderStyle = [2, 8, 21];
		const {point2cell} = PenpaTools;
		if (borderStyle === undefined) borderStyle = defaultBorderStyle;
		if (!Array.isArray(borderStyle)) { borderStyle = [borderStyle]; }

        // Regions
        var cell_matrix = [];
        var up_matrix = [];
        var right_matrix = [];

		function fillMatrix(borderStyle) {
			cell_matrix.length = 0;
			up_matrix.length = 0;
			right_matrix.length = 0;
			for (var i = 0; i < size; i++) {
				cell_matrix[i] = new Array(size).fill(0);
			}
			for (var i = 0; i < size + 1; i++) {
				up_matrix[i] = new Array(size).fill(0);
			}
			for (var i = 0; i < size; i++) {
				right_matrix[i] = new Array(size + 1).fill(0);
			}

			// Setup Edge Matrices
			var edge, points;
			let count = 0;
			for (edge in edge_elements) {
				// If black edge or thicker edge
				if (borderStyle.includes(edge_elements[edge])) {
					points = edge.split(',');
					let [y, x] = point2cell(points[0]);
					x -= c;
					y -= r;
					if (x < 0 || x >= size || y < 0 || y >= size) continue;
					if ((Number(points[1]) - Number(points[0])) === 1) {
						// data for up matrix
						up_matrix[y][x] = 1;
					} else {
						right_matrix[y][x] = 1;
					}
					count++;
				}
			}
			return count;
		}

		let linecount = fillMatrix(borderStyle);

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
			12: 60
		}
		// try again with default borderStyle;
		if (linecount < (minimumLineCount[size] || 0)) {
			linecount = fillMatrix(defaultBorderStyle);
		}

        var counter = 100;
        // Define regions using numbers
        // Loop through each cell
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
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
                            for (var k = 0; k <= i; k++) {
                                for (var m = 0; m < size; m++) {
                                    if (cell_matrix[k][m] === cell_matrix[i][j]) {
                                        cell_matrix[k][m] = cell_matrix[i - 1][j];
                                    }
                                }
                            }
                        }
                        cell_matrix[i][j] = cell_matrix[i - 1][j];
                    } else {
                        counter++;
                        if (j > 0) {
                            // Change all connected cells to this new value
                            for (var k = 0; k <= i; k++) {
                                for (var m = 0; m < size; m++) {
                                    if (cell_matrix[k][m] === cell_matrix[i][j]) {
                                        cell_matrix[k][m] = counter;
                                    }
                                }
                            }
                        }
                        cell_matrix[i][j] = counter;
                    }
                    // RIGHT
                    if (j < (size) - 1) {
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
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if (unique_nums.indexOf(cell_matrix[i][j]) === -1) {
                    unique_nums.push(cell_matrix[i][j]);
                }
            }
        }
        var size_unique_nums = unique_nums.length;

		let regions = {};
        for (var k = 0; k < size_unique_nums; k++) {
            let region = k; //String.fromCharCode(65 + (k % 26));
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    if (cell_matrix[i][j] === unique_nums[k]) {
						if(regions[region] === undefined) {
							regions[region] = [];
						}
						regions[region].push([i + r, j + c]);
					}
                }
            }
        }

		let complete = Object.keys(regions).filter(reg => regions[reg].length === size).length;
		if (complete === size) {
            // All regions found
			return regions;
		}

		// Merge last region, which can consist of sparse cells.
		if (complete === size - 1) {
			let lastregion;
			let keys = Object.keys(regions).map(Number);
			keys.sort();
			Object.keys(regions).forEach(reg => {
				if (regions[reg].length !== size) {
					if (!lastregion) {
						lastregion = regions[reg];
					}
					else {
						lastregion.push(...regions[reg]);
						delete regions[reg];
					}
				}
			});
            // All regions found
            return regions;
		}
        
        // No or not all regions found
        // TODO: When most regions are found (only 2, maybe 3 missing), use an exact cover algorithm to try to find
        // the unique solution to position the remaining regions.
        // If so then we have all regions. Otherwise no solution is found.

        return regions;
    }

	function findLargestFixedSquareAtRC(squares, cl, r0, c0, maxSize) {
		let size = 2;
		let foundSquare = null;

		do {
			size += 1;
			let inside = squares.some(sq => 
				r0 >= sq.r && r0 + size <= sq.r + sq.size &&
				c0 >= sq.c && c0 + size <= sq.c + sq.size );
			if (inside) continue;
			
			let clash = false;
			for(let r = r0; r < r0 + size; r++) {
				for(let c = c0; c < c0 + size; c++) {
					if(!cl[r] || !cl[r][c]) {
						clash = true;
						break;
					}
				}
				if(clash) break;
			}
			if (clash) {

				clash = false;
				c0 -= 1;
				size -= 1;
				let inside = squares.some(sq => 
					r0 >= sq.r && r0 + size <= sq.r + sq.size &&
					c0 >= sq.c && c0 + size <= sq.c + sq.size );
				if (inside) continue;
	
				for(let r = r0; r < r0 + size; r++) {
					for(let c = c0; c < c0 + size; c++) {
						if(!cl[r] || !cl[r][c]) {
							clash = true;
							break;
						}
					}
					if(clash) break;
				}
			}
			if (clash) {
				break;
			}
			foundSquare = { r: r0, c: c0, size: size };
	
		} while(size < maxSize);

		return foundSquare;
	}

	//Find unused centerList cell
	function findNextSquare(squares, cl, doc) {
		const {width, height} = doc;
		const maxSize = Math.min(width, height);
		for(let r0 = 0; r0 < height; r0++) {
			for(let c0 = 0; c0 < width; c0++) {
				if (!cl[r0] || !cl[r0][c0] || cl[r0][c0].length !== 0) continue;

				let square = findLargestFixedSquareAtRC(squares, cl, r0, c0, maxSize);
				if (square) {					
					// attach to centerlist cells
					for(let r = square.r; r < square.r + square.size; r++) {
						for(let c = square.c; c < square.c + square.size; c++) {
							cl[r][c].push(square); 
						}
					}
					squares.push(square);
					return square;
				}
			}
		}
		return null;
	}

	C.cleanupCenterlist = function(pu) {
		const [top, left, bottom, right] = PenpaTools.getMinMaxRC(pu.centerlist);
		const width = right - left + 1;
		const height = bottom - top + 1;

		const {getAdjacentCellsOfELine, point2cell} = PenpaTools;
		let deleteCells = false;
		for(let k in pu.pu_q.deletelineE) {
			// Don't delete when replaced with another line
			if (k in pu.pu_q.lineE) { 
				continue;
			}
			let adj = getAdjacentCellsOfELine(pu, k);
			// Is on border of centerlist
			if ((pu.centerlist.indexOf(adj[0] === -1)) !== (pu.centerlist.indexOf(adj[1] === -1))) {
				deleteCells = true;
				break;
			}

			let p1 = point2cell(adj[0]);
			let p2 = point2cell(adj[1]);
			// Is on outer ring of centerlist
			if(p1[0] <= 0 || p1[0] >= height - 1 || p1[1] <= 0 || p1[1] >= width - 1) {
				deleteCells = true;
				break;
			}
			if(p2[0] <= 0 || p2[0] >= height - 1 || p2[1] <= 0 || p2[1] >= width - 1) {
				deleteCells = true;
				break;
			}
		}

		if (deleteCells) {
			// delete centerlist cells based on deletelineE			
			for(let k in pu.pu_q.deletelineE) {
				// Don't delete when replaced with another line
				if (k in pu.pu_q.lineE) { 
					continue;
				}
				let adj = getAdjacentCellsOfELine(pu, k);
				let index1 = pu.centerlist.indexOf(adj[0]);
				if (index1 !== -1) {
					pu.centerlist.splice(index1, 1);
				}
				let index2 = pu.centerlist.indexOf(adj[1]);
				if (index2 !== -1) {
					pu.centerlist.splice(index2, 1);
				}
			}
		}
		else {
			// Must have no grid lines, and no frame
			if (pu.mode.grid[0] === '3' && pu.mode.grid[2] === '2') {
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
							cl[adj[0]] +=1;
						}
						if (!cl[adj[1]]) {
							cl[adj[1]] = 1;
						} else {
							cl[adj[1]] +=1;
						}
					}
				}
				// Include when surrounded by 4 lines.
				pu.centerlist.length = 0;
				pu.centerlist.push(...Object.keys(cl).filter(p => cl[p] >= 4));
			}
		}

		// Remove black(-ish) surfaces from centerlist
		let surface = pu.pu_q.surface;
		for(let k in surface) {
			if([1, 4].includes(surface[k])) {
				let index = pu.centerlist.indexOf(Number(k));
				if (index !== -1) {
					pu.centerlist.splice(index, 1);
				}
			}
		}

	}
	
	C.findSudokuSquares = function(pu, doc) {
		const {point2cell} = PenpaTools;
		const squares = [];
		const cl = [];
	
		for(let p of pu.centerlist) {
			let [r, c] = point2cell(p);
			cl[r] = cl[r] || [];
			cl[r][c] = [];
		}

		while(findNextSquare(squares, cl, doc)) { }

		return squares;
	}

	function createRegionOutlines(pu, sq) {
		const {yx2key} = PenpaTools;
		sq.region_outline = {};
		for(let reg in sq.regions) {
			let region = sq.regions[reg];
			if (region.length !== sq.size) {
				continue;
			}

			let frame = {};
			for(let yx of region) {
				let [y, x] = yx;
				let point = pu.point[yx2key(y,  x)];
				let corner = point.surround.length;
				for (let i = 0; i < corner; i++) {
					let max = Math.max(point.surround[i], point.surround[(i + 1) % corner]);
					let min = Math.min(point.surround[i], point.surround[(i + 1) % corner]);
					let key = min.toString() + "," + max.toString();
					if (frame[key]) {
						frame[key] = 1;
					} else {
						frame[key] = 2;
					}
				}
			}

			let outline = Object.keys(frame).filter(k => frame[k] === 2);
			sq.region_outline[reg] = outline;
			// for (let l of sq.region_outline[reg]) {
			//  	pu.pu_q.lineE[l] = 3;
			// }
		}
	}


	C.findSudokuRegions = function(squares, pu, doc) {
		for (let k in pu.pu_q.deletelineE) {
			delete pu.frame[k];
		}
		Object.keys(pu.frame).filter(k => pu.frame[k] === 0).forEach(k => delete pu.frame[k]);

		const {yx2key} = PenpaTools;
		const lineE = pu.pu_q.lineE;

		// Create outlines around squares
		for(let sq of squares) {
			let outline = [];
			for (let i = 0; i < sq.size; i++) {
				let p11 = yx2key(sq.r + i - 1, sq.c - 1, 1)
				let p12 = yx2key(sq.r + i, sq.c - 1, 1)
				let l1 = p11 + ',' + p12;
				outline.push(l1);
				let p21 = yx2key(sq.r - 1, sq.c + i - 1, 1)
				let p22 = yx2key(sq.r - 1, sq.c + i, 1)
				let l2 = p21 + ',' + p22;
				outline.push(l2);
				let p31 = yx2key(sq.r + i - 1, sq.c + sq.size - 1, 1)
				let p32 = yx2key(sq.r + i, sq.c + sq.size - 1, 1)
				let l3 = p31 + ',' + p32;
				outline.push(l3);
				let p41 = yx2key(sq.r + sq.size - 1, sq.c + i - 1, 1)
				let p42 = yx2key(sq.r + sq.size - 1, sq.c + i, 1)
				let l4 = p41 + ',' + p42;
				outline.push(l4);
			}
			sq.outline = outline;

			let counts = {};
			outline.forEach(k => {
				let linetype = lineE[k];
				if (linetype) {
					counts[linetype] = (counts[linetype] || 0) + 1;
				}
			})
			console.log(counts);
			sq.dominantBorderStyle = undefined;
			sq.dominantBorderStyleCount = 0;
			Object.keys(counts).forEach(k => {
				if (counts[k] > sq.dominantBorderStyleCount) {
					sq.dominantBorderStyle = Number(k);
					sq.dominantBorderStyleCount = counts[k];
				}
			});
		}

		for(let sq of squares) {
			let edge_elements = pu.pu_q.lineE;
			sq.regions = getregiondata(sq.r, sq.c, sq.size, edge_elements, sq.dominantBorderStyle);

            // When failed then try again with default borderStyle
			if (Object.keys(sq.regions).length !== sq.size) {
				sq.regions = getregiondata(sq.r, sq.c, sq.size, edge_elements);
			}	
		
			createRegionOutlines(pu, sq);
			// for (let l of sq.outline) {
			// 	pu.pu_q.lineE[l] = 8;
			// }
			console.log(sq);
		}

		if(squares.some(sq => Object.keys(sq.regions).length !== sq.size || Object.keys(sq.regions).some(reg => sq.regions[reg].length !== sq.size))) {
			// remove all square borders and region borders. For current square add all regions borders which have size = sq.size
			// And try again

			let todoSquares = [];
			// delete all square outlines
			let emptyEdges = Object.assign({}, pu.pu_q.lineE);
			// delete all region outlines where region length = sq.size;
			for(let sq of squares) {
				sq.outline.forEach(k => delete emptyEdges[k]);
				Object.keys(sq.regions).forEach(reg => {
					if (sq.regions[reg].length === sq.size) {
						 sq.region_outline[reg].forEach(k => delete emptyEdges[k])
					}
				});

				if (Object.keys(sq.regions).length !== sq.size) {
					todoSquares.push(sq);
				}
			}

			for(let sq of todoSquares) {
				let edges = Object.assign({}, emptyEdges);					
				Object.keys(sq.regions).forEach(reg => {
					if (sq.regions[reg].length === sq.size) {
						sq.region_outline[reg].forEach(k => { edges[k] = 21; }) // add (thick) outline
					}
				});

				sq.regions = getregiondata(sq.r, sq.c, sq.size, edges);
				createRegionOutlines(pu, sq);
				if (Object.keys(sq.regions).length !== sq.size) {
					pu.pu_q.lineE = edges;
				}
			}
		}

		if(squares.some(sq => Object.keys(sq.regions).length !== sq.size || Object.keys(sq.regions).some(reg => sq.regions[reg].length !== sq.size))) {
			console.log(squares);
			console.warn('Not all cages resolved')
		}
		else {
			console.log('All cages are resolved!')
		}

		// pu.pu_q.lineE = {};

		for(let sq of squares) {

		}

		
	}
})();