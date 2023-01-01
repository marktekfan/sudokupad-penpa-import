const PenpaTools = (() => {
    function _constructor() { }
	const C = _constructor;//, P = Object.assign(C.prototype, {constructor: C});
    C.doc = undefined;
	C.reduceSurfaces = function(centers, predicate) {
		const findNext = function(centers, rc, s1) {
			return centers.find(s2 => s2.center[0] === rc[0] && s2.center[1] === rc[1] && (predicate ? predicate(s1, s2) : true));
		}
		centers.forEach(s1 => {
			if(s1.value === null) return;
			let rc = [...s1.center];
			let width = 1;
			let nextCol = findNext(centers, [rc[0], rc[1] + width], s1);
			while (nextCol) {
				width++;
				nextCol.value = null;
				nextCol = findNext(centers, [rc[0], rc[1] + width], s1);
			}
			if (width > 1) {
				s1.center[1] += (width - 1) / 2;
				s1.width = width;
			}
		})
		centers.forEach(s1 => {
			if(s1.value === null) return;
			let rc = [...s1.center];
			let height = 1;
			let nextCol = findNext(centers, [rc[0] + height, rc[1]], s1);
			while (nextCol) {
				height++;
				nextCol.value = null;
				nextCol = findNext(centers, [rc[0] + height, rc[1]], s1);
			}
			if (height > 1) {
				s1.center[0] += (height - 1) / 2;
				s1.height = height;
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

	C.comparePenpaLinePoints = function(a, b) {
		let [a1, a2] = a.split(',').map(n => parseInt(n));
		let [b1, b2] = b.split(',').map(n => parseInt(n));
		if (a1 > b1) return 1;
		if (a1 < b1) return -1;
		if (a2 > b2) return 1;
		if (a2 < b2) return -1;
		return 0;
	}

	C.combineStraightPenpaLines = function(lines) {
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
				delete lines[nextKey];
				p2 = nextp;
			} while (true);
			let newKey = p1 + ',' + p2;
			if (k != newKey) {
				lines[newKey] = lines[k];
				delete lines[k];
			}
		});
		return lines;
	}

	C.reducePenpaLines2WaypointLines = function(list) {
		let comblist = PenpaTools.combineStraightPenpaLines(list);
		let wpLines = PenpaTools.penpaLines2WaypointLines(comblist);
		let combined = PenpaTools.concatenateEndpoints(wpLines);
		return combined;
	}
	C.penpaLines2WaypointLines = function(list) {
		const keys = Object.keys(list);
		keys.sort(PenpaTools.comparePenpaLinePoints);
		let listwp = keys.map(k => {
			let rcs = k.split(",").map(C.point2RC);
			return {wayPoints: [...rcs], value: list[k]};
		});
		return listwp;
	}

	C.concatenateEndpoints = function(listwp) {
		let changes = 0;
		do {
			// listwp.forEach(wp => console.log(JSON.stringify(wp.wayPoints), wp.value));
			changes = 0;
			listwp.forEach(line1 => {
				if(line1.value === null || line1.wayPoints.length < 2) return;
				if(line1.value === 30 || line1.value === 40) return; // dont combine short or double lines
				let startpoint1 = line1.wayPoints[0].toString();
				let endpoint1 = line1.wayPoints[line1.wayPoints.length - 1].toString();
				// console.log('line', line.wayPoints);
				listwp.forEach(line2 => {
					if(line1 === line2 || line1.value !== line2.value)  return;
					// console.log('line2', line2.wayPoints);
					let startpoint2 = line2.wayPoints[0].toString();
					let endpoint2 = line2.wayPoints[line2.wayPoints.length - 1].toString();
					if(endpoint2 === endpoint1) {
						line2.wayPoints.reverse();
						endpoint2 = startpoint2;
						startpoint2 = line2.wayPoints[0].toString();
					}
					if(startpoint1 === startpoint2) {
						line1.wayPoints.reverse();
						endpoint1 = startpoint1;
						startpoint1 = startpoint1 = line1.wayPoints[0].toString();
					}

					if(endpoint1 === startpoint2) {
						line1.wayPoints.push(...line2.wayPoints.slice(1));
						line2.value = null;
						endpoint1 = endpoint2;
						changes++;
					}
					else if(startpoint1 === endpoint2) {
						line1.wayPoints.unshift(...line2.wayPoints.slice(0, -1));
						line2.value = null;
						startpoint1 = startpoint2;
						changes++;
					}
				});
			})
		} while (changes > 0);
		let filtered = listwp.filter(l => l.value !== null);
		// filtered.forEach(wp => console.log(JSON.stringify(wp.wayPoints), wp.value))
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

	// C.normalizePath = function(points) {
	// 	if(points.length <= 2) return points;
	// 	let prev = points[0];
	// 	let line = [prev];
	// 	for (let i = 1; i < points.length - 1; i++) {
	// 		let curr = points[i + 0];
	// 		let next = points[i + 1];
	// 		if(prev[0] !== curr[0] || curr[0] !== next[0])
	// 			line.push(curr);
	// 		else if ((prev[1] !== curr[1] || curr[1] !== next[1]) &&
	// 			(prev[2] !== curr[2] || curr[2] !== next[2])) {
	// 			line.push(curr);
	// 		}
	// 		prev = curr;
	// 	}
	// 	line.push(points[points.length - 1]);
	// 	line.forEach(wp => {
	// 		wp[1] = round(wp[1]);
	// 		wp[2] = round(wp[2]);
	// 	})
	// 	return line;
	// }



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
	C.round = function(num) { return C.round3(num); }


	C.isCtcCell = function(rc, bb) {
		const [r, c] = rc;
		const [top, left, bottom, right] = bb;
		return (r >= top && r <= bottom & c >= left && c <= right);
	}
	C.point2cell = function(p) {
		const point = C.doc.point[p];
		const r = Math.floor(point.y - 2);
		const c = Math.floor(point.x - 2);
		return [r, c];
	}
	C.ctcRC2k = function(r, c = undefined) {
		if (Array.isArray(r)) [r, c] = r;
		else if (c === undefined) ({r, c} = r);
		const cols = C.doc.cols;
		return (Math.floor(r) + 2 + C.doc.row0) * cols + Math.floor(c) + 2 + C.doc.col0;
	}
	C.RC2k = function(r, c = undefined) {
		if (Array.isArray(r)) [r, c] = r;
		else if (c === undefined) ({r, c} = r);
		const cols = C.doc.cols;
		return (Math.floor(r) + 2) * cols + Math.floor(c) + 2;
	}
	C.point2RC = function(p) {
		const point = C.doc.point[p];
		const r = point.y - 2;
		const c = point.x - 2;
		return [r, c];
	}
	C.point = function(p) {
		return C.doc.point[p];
	}

	return C;
})();

