const PenpaTools = (() => {
    function _constructor() { }
	const C = _constructor;//, P = Object.assign(C.prototype, {constructor: C});

    C.doc = undefined; // Will be injected

	C.reduceSurfaces = function(centers, predicate = () => true) {
		//Sort centers, this will give best results.
		centers.sort((a, b) => C.compareRC(a.center, b.center));
		const findNext = function(centers, rc, s1) {
			return centers.find(s2 => s2.center[0] === rc[0] && s2.center[1] === rc[1] && predicate(s1, s2));
		}
		// merge right
		centers.forEach(s1 => {
			if(s1.value === null) return; // 'removed'
			let [row, col] = s1.center;
			let height = s1.height || 1;
			let width = s1.width || 1;
			let newwidth = width;
			nextCol = findNext(centers, [row, col + newwidth], s1);
			while (nextCol && nextCol.value !== null && (nextCol.width || 1) === width && (nextCol.height || 1) === height) {
				newwidth += width;
				nextCol.value = null; // mark as 'removed'
				nextCol = findNext(centers, [row, col + newwidth], s1);
			}
			if (newwidth > width) {
				s1.center[1] += (newwidth - 1) / 2;
				s1.width = newwidth;
			}
		})
		// merge down
		centers.forEach(s1 => {
			if(s1.value === null) return; // 'removed'
			let [row, col] = s1.center;
			let height = s1.height || 1;
			let width = s1.width || 1;
			let newheight = height;
			nextCol = findNext(centers, [row + newheight, col], s1);
			while (nextCol && nextCol.value !== null && (nextCol.width || 1) === width && (nextCol.height || 1) === height) {
				newheight += height;
				nextCol.value = null; // mark as 'removed'
				nextCol = findNext(centers, [row + newheight, col], s1);
			}
			if (newheight > height) {
				s1.center[0] += (newheight - 1) / 2;
				s1.height = newheight;
			}
		})
		return centers.filter(l => l.value !== null);
	}

	C.inflateSurface = function(list, top, left, bottom, right, v) {
		const eps = 0.1;
		list.forEach(s => {
			let width = s.width || 1;
			let height = s.height || 1;
			if (s.center[0] - height / 2 - eps < top) {
				s.center[0] -= v / 2;
				s.height = height + v;
			}
			if (s.center[0] + height / 2 + eps > bottom + 1) {
				s.center[0] += v / 2;
				s.height = height + v;
			}
			if (s.center[1] - width / 2 - eps < left) {
				s.center[1] -= v / 2;
				s.width = width + v;
			}
			if (s.center[1] + width / 2 + eps > right + 1) {
				s.center[1] += v / 2;
				s.width = width + v;
			}
		});
		return list;
	}

	C.compareRC = function(r, c) {
		let [r1, c1] = r;
		let [r2, c2] = c;
		if (r1 > r2) return 1;
		if (r1 < r2) return -1;
		if (c1 > c2) return 1;
		if (c1 < c2) return -1;
		return 0;
	}

	C.comparePenpaLinePoints = function(a, b) {
		let [a1, a2] = a.split(',').map(n => parseInt(n));
		let [b1, b2] = b.split(',').map(n => parseInt(n));
		if (a1 > b1) return 1;
		if (a1 < b1) return -1;
		if (a2 > b2) return 1;
		if (a2 < b2) return -1;
		return 0;
	}

	C.combineStraightPenpaLines = function(lines, linesCol) {
		lines = Object.assign({}, lines);
        const point = C.doc.point;
		const keys = Object.keys(lines);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		keys.forEach(k => {
			if (lines[k] === undefined) return;
			if (lines[k] === 98) return; // x-mark, has only a single point.
			if (lines[k] === 40) return; // don't combine short lines
			let [p1, p2] = k.split(',').map(n => parseInt(n));
			let dir = point[p1].adjacent.indexOf(p2);
			if(dir === -1) return; // Not an adjacent point
			do {
				let nextp = point[p2].adjacent[dir];
				let nextKey = p2 + ',' + nextp;
				let nextVal = lines[nextKey];
				if (nextVal === undefined || lines[k] !== nextVal) break; // not found or different line style
				if (linesCol && linesCol[k] !== linesCol[nextKey]) break // or not same custom color
				delete lines[nextKey];
				p2 = nextp;
			} while (true);
			let newKey = p1 + ',' + p2;
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
	}

	C.reducePenpaLines2WaypointLines = function(list, listCol) {
		let comblist = PenpaTools.combineStraightPenpaLines(list, listCol);
		let wpLines = PenpaTools.penpaLines2WaypointLines(comblist, listCol);
		let combined = PenpaTools.concatenateEndpoints(wpLines);
		return combined;
	}

	C.penpaLines2WaypointLines = function(list, listCol) {
		const keys = Object.keys(list);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		let listwp = keys.map(k => {
			let rcs = k.split(",").map(C.point2RC);
			let line = {wayPoints: [...rcs], value: list[k], keys: k.split(",").map(Number)};
			if (listCol && listCol[k]) line.cc = listCol[k]
			return line;
		});
		return listwp;
	}

	// Shorten line by a fixed amount
	C.shortenLine = function(wayPoints, shortenStart, shortenEnd) {
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
	C.shrinkLine = function(wayPoints, r) {
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

	C.concatenateEndpoints = function(listwp) {
		let changes = 0;
		do {
			changes = 0;
			listwp.forEach(line1 => {
				if(line1.value === null || line1.wayPoints.length < 2) return;
				if(line1.value === 30 || line1.value === 40) return; // dont combine short or double lines
				let startpoint1 = line1.wayPoints[0].toString();
				let endpoint1 = line1.wayPoints[line1.wayPoints.length - 1].toString();
				listwp.forEach(line2 => {
					if(line1 === line2 || line1.value !== line2.value)  return;
					if(line1.cc !== line2.cc)  return;
					let startpoint2 = line2.wayPoints[0].toString();
					let endpoint2 = line2.wayPoints[line2.wayPoints.length - 1].toString();
					if(endpoint2 === endpoint1) {
						line2.wayPoints.reverse();
						line2.keys.reverse();
						endpoint2 = startpoint2;
						startpoint2 = line2.wayPoints[0].toString();
					}
					if(startpoint1 === startpoint2) {
						line1.wayPoints.reverse();
						line1.keys.reverse();
						endpoint1 = startpoint1;
						startpoint1 = startpoint1 = line1.wayPoints[0].toString();
					}

					if(endpoint1 === startpoint2) {
						line1.wayPoints.push(...line2.wayPoints.slice(1));
						line1.keys.push(...line2.keys.slice(1));
						line2.value = null;
						endpoint1 = endpoint2;
						changes++;
					}
					else if(startpoint1 === endpoint2) {
						line1.wayPoints.unshift(...line2.wayPoints.slice(0, -1));
						line1.keys.unshift(...line2.keys.slice(0, -1));
						line2.value = null;
						startpoint1 = startpoint2;
						changes++;
					}
				});
			})
		} while (changes > 0);
		let filtered = listwp.filter(l => l.value !== null);
		/*
		filtered.forEach(line => {
			console.assert(line.wayPoints.length === line.keys.length);
			for(let i = 0; i < line.keys.length; i++) {
				let rc = PenpaTools.point2RC(line.keys[i]);
				let wp = line.wayPoints[i];
				console.assert(rc[0] === wp[0]);
				console.assert(rc[1] === wp[1]);
			}
		});
		*/
		return filtered;
	}

	C.reduceWayPoints = function(points) {
		let prev = points[0];
		let line = [prev];
		if(points.length > 1) {
			for (let i = 1; i < points.length - 1; i++) {
				let curr = points[i + 0];
				let next = points[i + 1];
				if ((prev[0] !== curr[0] || curr[0] !== next[0]) &&
					(prev[1] !== curr[1] || curr[1] !== next[1])) {
					line.push(curr);
				}
				prev = curr;
			}
			line.push(points[points.length - 1]);
		}
		// line.forEach(wp => {
		// 	wp[0] = round(wp[0]);
		// 	wp[1] = round(wp[1]);
		// })
		return line;
	}

	C.normalizePath = function(points) {
		if(points.length <= 2) return points;
		let prev = points[0];
		let line = [prev];
		for (let i = 1; i < points.length - 1; i++) {
			let curr = points[i + 0];
			let next = points[i + 1];
			if(prev[0] !== curr[0] || curr[0] !== next[0])
				line.push(curr);
			else if ((prev[1] !== curr[1] || curr[1] !== next[1]) &&
				     (prev[2] !== curr[2] || curr[2] !== next[2])) {
				line.push(curr);
			}
			prev = curr;
		}
		line.push(points[points.length - 1]);
		// line.forEach(wp => {
		// 	wp[1] = round(wp[1]);
		// 	wp[2] = round(wp[2]);
		// })
		return line;
	}

	C.getAdjacentCellsOfELine = function(pu, eline) {
		const {point2centerPoint} = C;
		let [k1, k2] = eline.split(',').map(Number);
		let p1 = pu.point[k1];
		let p2 = pu.point[k2];
		// Find common surrounding cells
		let adjacent1 = [k1, p1.adjacent[2], p1.adjacent[3], p1.adjacent_dia[3]].map(point2centerPoint);
		let adjacent2 = [k2, p2.adjacent[2], p2.adjacent[3], p2.adjacent_dia[3]].map(point2centerPoint);
		let commonCells = adjacent1.filter(k => adjacent2.includes(k));
		return commonCells;
	}

	C.getCellOutline = function(cells, os = 0) {
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

	C.round0 = function(num) {
		if (Array.isArray(num)) return num.map(C.round0);
		return Math.round((num + Number.EPSILON));
	}
	C.round1 = function(num) {
		if (Array.isArray(num)) return num.map(C.round1);
		return Math.round((num + Number.EPSILON) * 10) / 10;
	}
	C.round2 = function(num) {
		if (Array.isArray(num)) return num.map(C.round2);
		return Math.round((num + Number.EPSILON) * 100) / 100;
	}
	C.round3 = function(num) {
		if (Array.isArray(num)) return num.map(C.round3);
		return Math.round((num + Number.EPSILON) * 1000) / 1000;
	}
	C.round256 = function(num) {
		if (Array.isArray(num)) return num.map(C.round256);
		return Math.round((num + Number.EPSILON) * 256) / 256;
	}
	C.round = function(num) { return C.round3(num); }


	C.isBoardCell = function(rc) {
		const [r, c] = rc;
		return (r >= 0 && r < C.doc.height && c >= 0 && c < C.doc.width);
	}

	C.point2RC = function(p) {
		const point = C.doc.point[p];
		const r = point.y - 2 - C.doc.row0;
		const c = point.x - 2 - C.doc.col0;
		return [r, c];
	}
	C.point2cell = function(p) {
		let [r, c] = C.point2RC(p);
		return [Math.floor(r), Math.floor(c)];
	}

	C.point = function(p) {
		return C.doc.point[p];
	}

	C.point2matrix = function(p) {
		p = C.point2centerPoint(p);
		let x = (p % C.doc.nx0); //column
		let y = Math.floor(p / C.doc.nx0); //row
		return [y - 2, x - 2];
	}
	C.matrix2point = function(y, x, type = 0) {
		if (Array.isArray(y)) {
			[y, x] = y;
			type = 0;
		}
		let p = (y + 2) * C.doc.nx0 + (x + 2) + type * (C.doc.nx0 * C.doc.ny0);
		return p;
	}

	C.point2centerPoint = function(p) {
		const point = C.doc.point[p];
		switch(point.type) {
			case 0:
				return p;
			case 1:
			case 2:
			case 3:
				return p - point.type * C.doc.nx0 * C.doc.ny0;		
			case 4:			
			case 5:			
				return Math.floor((p - 4 * C.doc.nx0 * C.doc.ny0) / 4) - (point.type - 4) * C.doc.nx0 * C.doc.ny0;			
		}
	}

	C.getMinMaxRC = function(list = [], mapper = ([r, c]) => [r, c]) {
		const rcs = [].concat(list.map(mapper)),
					rows = rcs.map(([r, c]) => r),
					cols = rcs.map(([r, c]) => c);
		return [
			Math.min(...rows), Math.min(...cols),
			Math.max(...rows), Math.max(...cols),
		];
	};

	C.getBoundsRC = function(list = [], mapper) {
		const [top, left, bottom, right] = C.getMinMaxRC(list, mapper);
		const width = right - left + 1;
		const height = bottom - top + 1;
		return {top, left, bottom, right, height, width};
	};

	C.ColorRgba2Hex = function(rgba) {
		let rgb = rgba.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
		let alpha = (rgb && rgb[4]) || '';
		let hex = !rgb ? rgba : '#' +
			(rgb[1] | 1 << 8).toString(16).slice(1) +
			(rgb[2] | 1 << 8).toString(16).slice(1) +
			(rgb[3] | 1 << 8).toString(16).slice(1);

		if (alpha !== '' && alpha < 1) {
		  hex = hex + (Math.floor(alpha * 256) | 1 << 8).toString(16).slice(1);
		}
		return hex.toUpperCase();
	}

	const opaqueColors = ['#000000', '#CFCFCF', '#FFFFFF'];
	C.ColorIsOpaque = function(hex) {
		return hex && opaqueColors.includes(hex);
	}
	C.ColorApplyAlpha = function(hex, alpha = undefined) {
		if (alpha === undefined) {
			alpha = PenpaDecoder.flags.doubleLayer ? 0.75 : 0.5;
		}
		if (!hex || C.ColorIsOpaque(hex) || C.ColorIsTransparent(hex)) return hex; 
		let r = parseInt(hex.slice(1, 3), 16);
		let g = parseInt(hex.slice(3, 5), 16);
		let b = parseInt(hex.slice(5, 7), 16);
		let newR = alpha * r + (1 - alpha) * 255;
		let newG = alpha * g + (1 - alpha) * 255;
		let newB = alpha * b + (1 - alpha) * 255;

		let newHex = '#' +
			(newR | 1 << 8).toString(16).slice(1).toUpperCase() +
			(newG | 1 << 8).toString(16).slice(1).toUpperCase() +
			(newB | 1 << 8).toString(16).slice(1).toUpperCase();
		return newHex;
	}

	C.ColorSaturate = function(hex) {
		if (!hex || C.ColorIsOpaque(hex) || C.ColorIsTransparent(hex)) return hex; 
		if (!PenpaDecoder.flags.doubleLayer) {
			if (hex.length === 7) {
				return hex + 'FF';
			}
			if (hex.length === 4) {
				return hex + 'F';
			}
			return hex;
		}
		return hex;
	}

    C.ColorIsTransparent = function(hex) {
        // if (typeof color !== 'string') debugger
        return !hex || hex.slice(7) === '00' || (hex.length === 5 && hex.slice(4) === '0');
    }

	return C;
})();

