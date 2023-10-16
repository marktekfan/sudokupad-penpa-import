const PenpaFromFPuzzles = (() => {
	'use strict';	
    function _constructor() { }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	let document = new FakeDoc();
	PenpaPuzzle.document = document;

	const featureCheckMinMax = ({width: w, height: h}, {min: i, max: a}) => (
		(i?(w?w>=i:true)&&(h?h>=i:true):true)&&(a?(w?w<=a:true)&&(h?h<=a:true):true)
	);
	const featureCheckSize = (part, sizes) => (
		sizes.length === 1 && (sizes[0].min || sizes[0].max)
			?	featureCheckMinMax(part, sizes[0])
			: sizes.includes(part.height) && sizes.includes(part.width)
	);
	const isOnEdge = ([r, c]) => ((Math.abs(r % 1) === 0) || (Math.abs(c % 1) === 0)) && (Math.abs(r % 1) !== Math.abs(c % 1));
	const isInCell = ([r, c]) => (Math.abs(r % 1) !== 0) && (Math.abs(c % 1) !== 0);
	const isLineInCell = (points = []) => {
		for(let i = 0, len = points.length; i < len; i++) if(!isInCell(points[i])) return false;
		return true;
	};
	const featureCheck = (part, checks) => {
		var res = true;
		Object.keys(checks).forEach(key => {
			const check = Array.isArray(checks[key]) ? checks[key] : [checks[key]];
			switch(key) {
				case 'size': res = res && featureCheckSize(part, check); break;
				case 'sizeMin': res = res && (part.width >= check[0] && part.height >= check[0]); break;
				case 'sizeMax': res = res && (part.width <= check[0] && part.height <= check[0]); break;
				case 'center': res = res && ((typeof check[0] === 'number' ? [check] : check).find(center => isSameRC(part.center, center)) !== undefined); break;
				case 'centerRounded': res = res && ((typeof check[0] === 'number' ? [check] : check).find(center => isSameRC(roundCenter(part.center), roundCenter(center))) !== undefined); break;
				case 'isOnEdge': res = res && (isOnEdge(part.center) === check[0]); break;
				case 'isInCell': res = res && (isInCell(part.center) === check[0]); break;
				case 'isLineInCell': res = res && (isLineInCell(part.wayPoints) === check[0]); break;
				case 'wayPointsCount': res = res && (part.wayPoints || []).length === check[0]; break;
				case 'wayPointsCountMin': res = res && (part.wayPoints || []).length >= check[0]; break;
				case 'wayPointsCountMax': res = res && (part.wayPoints || []).length <= check[0]; break;
				case 'wayPointsLenMin': res = res && (pathLength(part.wayPoints) >= check[0]); break;
				case 'wayPointsLenMax': res = res && (pathLength(part.wayPoints) <= check[0]); break;
				case 'textMatch': res = res && (String(part.text || '').match(check[0]) !== null); break;
				case 'cellsMin': res = res && (part.cells || []).length >= check[0]; break;
				case 'minThickness': res = res && part.thickness >= check[0]; break;
				case 'hasFeature': res = res && (part.feature !== undefined) === check[0]; break;
				case 'colorNoAlpha': res = res && (part.color.length === 5
						? part.color.slice(0, 4) === check[0].slice(0, 4)
						: part.color.slice(0, 7) === check[0].slice(0, 7)
					);
					break;
				case 'color':
				case 'borderColor':
					res = res && (part[key] !== undefined && check.includes(part[key])
						|| check.includes(String(part[key]).toUpperCase())
						|| check.includes(String(part[key]).toLowerCase()));
					break;
				default: res = res && check.includes(part[key]); break;
			}
		});
		return res;
	};

	const highlightColours = '#a8a8a8a8,#000,#ffa0a0,#ffdf61,#feffaf,#b0ffb0,#61d060,#d0d0ff,#8180f0,#ff08ff,#ffd0d0'.split(',');
	const layerOrder = 'size,title,author,ruleset,clone,grid,disjointgroups,thermometer,killercage,arrow,difference,ratio,betweenline,lockout,quadruple,rectangle,circle,text,palindrome,line,minimum,maximum'.split(',');

	const parse = {};
	// parse.grid = (pu, puzzle, fpuz) => {
	// 	fpuz.grid.forEach((row, r) => {
	// 		row.forEach((cell, c) => {
	// 			if (cell.given) {
	// 				pu.pu_q.number[matrix2point(r, c)] = [cell.value, 1, '1'];
	// 			}
	// 			let col = cell.c || (cell.cArray || [])[0];
	// 			if(Array.isArray(cell.cArray) && cell.cArray.length > 1) {
	// 				console.warn('f-puzzles decoder does not currently support multiple given colors. Please submit this puzzle for testing.');
	// 			}
	// 			if(highlightColours[parseInt(col)] !== undefined) col = highlightColours[parseInt(col)];
	// 			if(![null, undefined].includes(col)) {
	// 				puzzleAdd(puzzle, 'underlays', {
	// 					backgroundColor: col,
	// 					center: [r + 0.5, c + 0.5],
	// 					rounded: false,
	// 					width: 1, height: 1,
	// 				});
	// 			}

	// 		});
	// 	});	

	// 	// Add Region borders
	// 	puzzle.regions.forEach(r => {
	// 		let outline = PenpaRegions.createOutline(pu, r);
	// 		outline.forEach(k => { pu.pu_q.lineE[k] = 2; });	
	// 	});
	// }

	parse.cells = (puzzle, pu) => {
		const {matrix2point} = PenpaTools;
		puzzle.cells.forEach((row, r) => {
			row.forEach((cell, c) => {
				if (cell.value) {
					pu.pu_q.number[matrix2point(r, c)] = [cell.value, 1, '1'];
				}
			});
		});	
	}

	parse.regions = (puzzle, pu) => {
		// Add Region borders
		(puzzle.regions || []).forEach(r => {
			let outline = PenpaRegions.createOutline(pu, r);
			outline.forEach(k => { pu.pu_q.lineE[k] = 2; });	
		});
	}

	parse.cages = (puzzle, pu) => {
		(puzzle.cages || []).forEach(cage => {
			//TODO
		});
	}

	const surfaceStyleMap = {};
	for (let type = 0; type <= 13; type++) {
		const ctx = {setLineDash: ()=>{}};
		set_surface_style(ctx, type);
		if (ctx.fillStyle) {
			surfaceStyleMap[ctx.fillStyle.toUpperCase()] ||= type;
		}		
	}
	function getSurfaceStyle(lay) {
		const {backgroundColor = ''} = lay;
		let style = surfaceStyleMap[backgroundColor.toUpperCase()];
		return style || backgroundColor.toUpperCase() || 1;
	}

	const fontStyleColorMap = {};
	for (let type = 0; type <= 11; type++) {
		const ctx = {setLineDash: ()=>{}};
		set_font_style(ctx, 12, type);
		if (ctx.fillStyle) {
			fontStyleColorMap[ctx.fillStyle.toUpperCase()] ||= type;
		}		
	}
	function getFontStyle(lay) {
		const {color = ''} = lay;
		let style = fontStyleColorMap[color.toUpperCase()];
		return style || color.toUpperCase() || 1;
	}

	function getCircleStyle(lay) {
		let {backgroundColor = '', borderColor = '', borderSize = 2} = lay;
		let strokeDasharray = lay['stroke-dasharray'];

		if (backgroundColor === '#FFFFFF') {
			if (borderColor === '#000000') {
				if (borderSize > 3)
					return 8; // white, thick black border
				else {
					return 1; // white,, black border
				}
			}
			if (borderColor.includes('#9')) {
				return 6;
			}
			else 
				return 7; // white, no border
		}
		if (backgroundColor === '#000000') {
			return 2; // black
		}
		if (backgroundColor.includes('#C')) {
			if (borderColor === '#000000') {
				if (borderSize > 3)
					return 9; // gray, thick black border
				else 
					return 5; // gray, black border
					
			}
			else 
				return 3; // gray, no border
		}
		if (!backgroundColor && strokeDasharray) {
			return 4;						
		}
		if (backgroundColor === '#FF0000') {
			return 11;
		}
		// if (backgroundColor === '#208020') {
		// 	return 12;
		// }
		if (backgroundColor === '#FFFFFF00') {
			return null;
		}
		return 1;
	}

	parse.underlays = (puzzle, pu) => {
		const sizeMap = [
			[
				{size: 0.286, feature: 'symbol', obj: [1, 'square_SS', 2]}, // 1 = circle_style, 2 = layer
				{size: 0.466, feature: 'symbol', obj: [1, 'square_S', 2]}, 	// 
				{size: 0.726, feature: 'symbol', obj: [1, 'square_M', 2]}, 	// 
				{size: 0.826, feature: 'symbol', obj: [1, 'square_L', 2]}, 	//  1 = circle_style, 2 = layer
				{size: 1.026, feature: 'symbol', obj: [1, 'square_LL', 2]}, 	//  1 = circle_style, 2 = layer
			],
			[
				{size: 0.286, feature: 'symbol', obj: [1, 'circle_SS', 2]}, // 1 = circle_style, 2 = layer
				{size: 0.34 , feature: 'number', obj: ['', 6, '5']},	 	// 6 = white, '5' = small
				{size: 0.466, feature: 'symbol', obj: [1, 'circle_S', 2]}, 	// 
				{size: 0.5  , feature: 'number', obj: ['', 6, '6']}, 		//  6 = white, '6' = medium
				{size: 0.72 , feature: 'number', obj: ['', 6, '10']}, 		//  6 = white, '10' = big
				{size: 0.726, feature: 'symbol', obj: [1, 'circle_M', 2]}, 	// 
				{size: 0.84 , feature: 'number', obj: ['', 6, '1']}, 		//  5 = style 7, 6 = style 1, 7 = style 2, '1' = normal
				{size: 0.886, feature: 'symbol', obj: [1, 'circle_L', 2]}, 	//  1 = circle_style, 2 = layer
			],
			[
				{size: 0.34 , feature: 'number', obj: ['', 6, '5']},	 	// 6 = white, '5' = small
				{size: 0.5  , feature: 'number', obj: ['', 6, '6']}, 		//  6 = white, '6' = medium
				{size: 0.72 , feature: 'number', obj: ['', 6, '10']}, 		//  6 = white, '10' = big
				{size: 0.84 , feature: 'number', obj: ['', 6, '1']}, 		//  5 = style 7, 6 = style 1, 7 = style 2, '1' = normal
			]
		];

		const fontSizeMap = [
			{size: 0.25, type: '5'}, //small
			{size: 0.36,  type: '6'}, //medium
			{size: 0.55,  type: '10'}, //big
			{size: 0.7,  type: '1'}, //normal
			//{size: 0.5,  type: '1'}, //'8'=long
		]
	
	
		
		const features = puzzle.lays;
		const {point2RC, findPoint, ColorIsVisible} = PenpaTools;

		//
		// Add text features:
		// - number + numberCircle
		// - numberS + numberCircle
		//
		(features || []).forEach(lay => {
			if (lay.done || !lay.text) return;
			let [y, x] = lay.center;

			let fontSize = lay.height;
			let py = y;
			//if (lay.fontSize) 
			{
				fontSize = lay.fontSize ? (lay.fontSize + 4) / 64 : lay.height * 0.8;
				py = y - 0.28 * fontSize;
				py -= fontSize * 0.08;
				py -= lay.height * 0.06;
				py += lay.height * 0.5;
			}
	
			let k = findPoint(py, x);
			if (k) {
				[y, x] = point2RC(k);
				let circle = lay.rounded ? lay : features.filter(lay => lay.rounded && !lay.text && Math.abs(lay.center[0]- y) < 0.01 && Math.abs(lay.center[1] - x) < 0.01)[0];

				if (pu.point[k].type < 4) { // number
					if (circle) {
						const circleStyle = getCircleStyle(circle);
						if (!circleStyle) { // circle not visible
							circle = null;
						}
						else {
							let goal = Math.min(circle.height || 0, circle.width || 0);
							if (goal <= 0) return; // zero size
							goal += (circle.borderSize === undefined ? 2 : circle.borderSize) / 64;
							let best = sizeMap[2].reduce((prev, curr) => {
								return (Math.abs(curr.size - goal) < Math.abs(prev.size - goal) ? curr : prev);
							});		

							if (best.feature === 'number') {
								const numberCircleStyleMap = {
									1: 6,
									2: 7,
									7: 5,
									11: 11,
								};
								const numberCircleStyle = numberCircleStyleMap[circleStyle] || 6;
								let num = [lay.text, numberCircleStyle, best.obj[2]];
								pu.pu_q.number[k] = num;

								circle.done = k;
							}
						}
					}
					if (!circle) {

						let goal = fontSize;
						let best = fontSizeMap.reduce((prev, curr) => {
							return (Math.abs(curr.size - goal) < Math.abs(prev.size - goal) ? curr : prev);
						});	

						if (pu.pu_q.number[k]) {
							if (pu.pu_q.number[k][0] != '') {
								console.warn(`overwriting number[${k}]`, JSON.stringify(pu.pu_q.number[k]), 'with', lay.text);
							}
							pu.pu_q.number[k][0] = String(lay.text);
						}
						else {
							const fontStyle = getFontStyle(lay);
							let num = [String(lay.text), fontStyle, best.type];
							pu.pu_q.number[k] = num;
						}
						if (lay.height && ColorIsVisible(lay.backgroundColor)) {
							lay.text = '';  // only text has been added, not yet its shape
						}
						else {
							lay.done = k;
						}
					}
				}
				else { // numberS
					if (circle) {
						const circleStyle = getCircleStyle(circle);
						if (!circleStyle) { // circle not visible
							circle = null;
						}
						else {
							let goal = Math.min(circle.height || 0, circle.width || 0);
							if (goal <= 0) return; // zero size

							const numberCircleStyleMap = {
								1: 6,
								2: 7,
								7: 5,
								11: 11,
							};
							const numberCircleStyle = numberCircleStyleMap[circleStyle] || 6;
							let num = [lay.text, numberCircleStyle];
							pu.pu_q.numberS[k] = num;

							circle.done = k;
						}
					}
					if (!circle) {
						if (fontSize > 0.35) {
							console.warn(`fontSize ${fontSize}] is too big. clipped into 0.32`, JSON.stringify(pu.pu_q.numberS[k]), 'with', lay.text);
						}

						if (pu.pu_q.numberS[k]) {
							if (pu.pu_q.numberS[k][0] != '') {
								console.warn(`overwriting numberS[${k}]`, JSON.stringify(pu.pu_q.numberS[k]), 'with', lay.text);
							}
							pu.pu_q.numberS[k][0] = String(lay.text);
						}
						else {
							const fontStyle = getFontStyle(lay);
							let num = [String(lay.text), fontStyle];
							pu.pu_q.numberS[k] = num;
						}
						if (lay.height && ColorIsVisible(lay.backgroundColor)) {
							lay.text = ''; // only text has been added, not yet its shape
						}
						else {
							lay.done = k;
						}
					}	
				}

				// if (best.feature === 'symbol') {
				// const underover = (lay.target === 'overlay') ? 2 : 1;
				// 	let sym = [circleStyle, best.obj[1], over];
				// 	pu.pu_q.symbol[k] = sym;
				// }
				// else if (best.feature === 'number') {
				// 	const numberCircleStyleMap = {
				// 		1: 6,
				// 		2: 7,
				// 		7: 5,
				// 	};
				// 	const numberCircleStyle = numberCircleStyleMap[circleStyle] || 6;
				// 	let num = ['', numberCircleStyle, best.obj[2]];
				// 	pu.pu_q.number[k] = num;
				// }
			}
		});


		//
		// Add non-text features:
		// - surface
		// - symbol (circle + square)
		// - numberCircle (empty)
		//
		(features || []).forEach(lay => {
			if (lay.done || lay.text) return;
			let [y, x] = lay.center;

			// Surface
			if (!lay.rounded && !lay.borderColor && ((lay.height % 1) === 0 && (lay.width % 1) === 0)) {
				if (!ColorIsVisible(lay.backgroundColor)) return;
				
				let style = getSurfaceStyle(lay);

				lay.done = [];
				for (let r = y - lay.height / 2; r < y + lay.height / 2; r++) {
					for (let c = x - lay.width / 2; c < x + lay.width / 2; c++) {
						let k = findPoint(r + 0.5, c + 0.5, [0]);
						if (style > 0)
							pu.pu_q.surface[k] = style;
						else {
							pu.pu_q.surface[k] = 1;
							pu.pu_q_sol.surface[k] = style;
						}
						lay.done.push(k);
					}
				}

				return;
			}
			else {
				let k = findPoint(y, x);
				if (k) {
					const circleStyle = getCircleStyle(lay);
					if (!circleStyle) return; // not visible

					let goal = Math.min(lay.height || 0, lay.width || 0);
					if (goal <= 0) return; // zero size
					goal += (lay.borderSize === undefined ? 2 : lay.borderSize) / 64;
					let best = sizeMap[lay.rounded ? 1 : 0].reduce((prev, curr) => {
						return (Math.abs(curr.size - goal) < Math.abs(prev.size - goal) ? curr : prev);
					});		

					if (best.feature === 'symbol') {
						const underover = (lay.target === 'overlay') ? 2 : 1;
						let sym = [circleStyle, best.obj[1], underover];
						pu.pu_q.symbol[k] = sym;
						lay.done = k;
					}
					else if (best.feature === 'number') {
						const numberCircleStyleMap = {
							1: 6,
							2: 7,
							7: 5,
						};
						const numberCircleStyle = numberCircleStyleMap[circleStyle] || 6;
						let num = ['', numberCircleStyle, best.obj[2]];
						pu.pu_q.number[k] = num;
						lay.done = k;
					}
				}
			}
		});
	}

	parse.cages = (puzzle, pu) => {
		const {findPoint, getCellOutline, makePointPair} = PenpaTools;
		const {cages} = puzzle;
		cages.forEach(cage => {
			if (cage.done) return;
			if (cage.hidden) return;
			if ((cage.cells || []).length === 0) return;

			let cells = cage.cells.map(([r,c]) => findPoint(r + 0.5, c + 0.5, [0]));
			cells.sort((a, b) => a - b);
			pu.pu_q.killercages.push([...cells]);
			let value = String(cage.value || '');
			if (value) {				
				let text = ' '.repeat(value.length - 1) + value;
				let key = pu.nx0 * pu.ny0 * 4 + cells[0] * 4;
				pu.pu_q.numberS[key] = [text, 1];
			}

			let style = 10; // TODO: get cage style
			// Create cage outline
			let edgePoints = getCellOutline(cage.cells, 0.25);
			let x0 = 0, y0 = 0;
			let px = 0, py = 0;
			edgePoints.forEach(edge => {
				let [type, y, x] = edge;
				if (type === 'M') {
					x0 = x;
					y0 = y;
				}
				else {
					if (type === 'Z') {
						x = x0;
						y = y0;
					}
					let dx = Math.abs(x - px);
					let dy = Math.abs(y - py);
					let sx = Math.sign(x - px);
					let sy = Math.sign(y - py);
					let p1, p2;
					if (x % 1 === 0.5) {
						while (dx > 0) {
							x = px + 0.5 * sx;
							p1 = findPoint(py, px, [4]);
							p2 = findPoint(y,  x,  [4]);
							pu.pu_q.cage[makePointPair(p1, p2)] = style;
							px = x;
							py = y;
							dx -= 0.5;
						}
					}					
					else if (y % 1 === 0.5) {
						while (dy > 0) {
							y = py + 0.5 * sy;
							p1 = findPoint(py, px, [4]);
							p2 = findPoint(y,  x,  [4]);
							pu.pu_q.cage[makePointPair(p1, p2)] = style;
							px = x;
							py = y;
							dy -= 0.5;
						}
					}
					else {
						p1 = findPoint(py, px, [4]);
						p2 = findPoint(y,  x,  [4]);
						pu.pu_q.cage[makePointPair(p1, p2)] = style;
					}
				}
				px = x;
				py = y;				
			});
			cage.done = 1;
		})
	}

	parse.arrows = (puzzle, pu) => {
		const {findPoint} = PenpaTools;
		const {arrows = [], underlays = [], overlays = []} = puzzle;
		const arrowsumColors = ['#000000', '#CFCFCF', '#a1a1a1'];
		const arrowFeatures = {color: arrowsumColors, thickness: [2, 3, 5], headLength: 0.3, wayPointsCountMin: 2,};
		const bulbFeatures = {sizeMin: 0.60, sizeMax: 2.90, borderColor: arrowsumColors, rounded: true, isInCell: true};
		arrows.forEach(arrow => {
			if (arrow.done) return;
			if (featureCheck(arrow, arrowFeatures)) {
				let segs = arrow.wayPoints.map(p => findPoint(p, [0]));

				if (segs.length > 1) {					
					bulbFeatures.center = [roundCenter(arrow.wayPoints[0]), roundCenter(arrow.wayPoints[arrow.wayPoints.length - 1])];
					[].concat(underlays, overlays).find(bulb => {
						if (bulb.done) return;
						const w = Math.floor(bulb.width) + 1, h = Math.floor(bulb.height) + 1;
						for(let x = 0; x < w; x++) {
							for(let y = 0; y < h; y++) {
								let center = [bulb.center[0] - (h - 1) * 0.5 + y, bulb.center[1] - (w - 1) * 0.5 + x];
								if(featureCheck(Object.assign({}, bulb, {center}), bulbFeatures)) {
									let bulbpoint = findPoint(bulb.center, [0]);
									if (segs.includes(bulbpoint)) {
										pu.pu_q.arrows.push([...segs]);
										bulb.done = 1;	
										arrow.done = 1;
										return true;
									}
								}
							}
						}
					});				
				}
				if (!arrow.done) {
					pu.pu_q.direction.push([...segs]);
					arrow.done = 1;
				}
			}
		});
	}

	parse.thermos = (puzzle, pu) => {
		const {findPoint} = PenpaTools;
		const {lines = [], underlays = [], overlays = []} = puzzle;
		const lineFeatures = {wayPointsCountMin: 2, minThickness: 16, isLineInCell: true};
		const bulbFeatures = {size: {min: 0.6, max: 0.85}, rounded: [true, 1], isInCell: true};

		lines.filter(line => featureCheck(line, lineFeatures)).forEach(line => {
			if (line.done) return;
			let segs = line.wayPoints.map(p => findPoint(p, [0]));
			let color = line.color.toUpperCase();
			bulbFeatures.center = [roundCenter(line.wayPoints[0]), roundCenter(line.wayPoints[line.wayPoints.length - 1])];
			[].concat(underlays, overlays).find(bulb => {
				if (bulb.done) return;
				const w = Math.floor(bulb.width) + 1, h = Math.floor(bulb.height) + 1;
				for(let x = 0; x < w; x++) {
					for(let y = 0; y < h; y++) {
						let center = [bulb.center[0] - (h - 1) * 0.5 + y, bulb.center[1] - (w - 1) * 0.5 + x];
						if(featureCheck(Object.assign({}, bulb, {center}), bulbFeatures)) {
							let bulbpoint = findPoint(bulb.center, [0]);
							let idx = segs.indexOf(bulbpoint);
							if (idx >= 0) {
								if (idx > 0) {
									let segs2 = segs.splice(0, idx);
									segs2.push(segs[0]); // duplicate bulb cell
									segs2.reverse();
									pu.pu_q.thermo.push([...segs2]);
									idx = 0;
									// TODO: custom color
								}
								if (segs.length > 1) {
									pu.pu_q.thermo.push([...segs]);
									// TODO: custom color
								}
								bulb.done = 1;	
								line.done = 1;
								return true;
							}
						}
					}
				}
			});
			if (!line.done) {
				if (line.thickness >= 21) {
					pu.pu_q.nobulbthermo.push([...segs]);
					// TODO: custom color
					line.done = 1;
				}
			}
		});
	}

	parse.lines = (puzzle, pu) => {
		const {findPoint, makePointPair, point2RC} = PenpaTools;
		const {lines = []} = puzzle;
		const lineFeatures = {wayPointsCountMin: 2, minThickness: 1};
		
		lines.filter(line => featureCheck(line, lineFeatures)).forEach(line => {
			if (line.done) return;
			let segs = line.wayPoints.map(p => findPoint(p, [0, 1, 2]));
			let style = line.thickness > 8 ? 21 : 3;
			let color = line.color.toUpperCase();
			for (let i = 1; i < segs.length; i++) {
				let p1 = segs[i - 1];
				let p2 = segs[i];
				let key = makePointPair(p1, p2);
				let rc1 = point2RC(p1);
				let rc2 = point2RC(p2);
				// Orthogonal or Diagonal
				if (rc1[0] === rc2[0] || rc1[1] === rc2[1] || Math.abs(rc1[0] - rc2[0] === Math.abs(rc1[1] - rc2[1]))) {
					if (pu.point[p1].type === 0 || pu.point[p1].type === 0) {
						pu.pu_q.line[key] = style;
						pu.pu_q_col.line[key] = color;
					} else {
						pu.pu_q.lineE[key] = style;
						pu.pu_q_col.lineE[key] = color;
					}
				}
				else {
					if (pu.point[p1].type === 0 || pu.point[p1].type === 0) {
						pu.pu_q.freeline[key] = style;
						pu.pu_q_col.freeline[key] = color;
					} else {
						pu.pu_q.freelineE[key] = style;
						pu.pu_q_col.freelineE[key] = color;
					}
				}
			}
			line.done = 1;
		});
	}

	parse.solution = (puzzle, pu) => {
		const {matrix2point} = PenpaTools;
		const metadata = extractPuzzleMeta(puzzle);
		if (metadata.solution) {
			var sol = [
				[], // 0 = shading
				[], // 1 = Line / FreeLine
				[], // 2 = Edge / FreeEdge
				[], // 3 = Wall
				[], // 4 = Number
				[]  // 5 = Symbol
			];
			[...metadata.solution].forEach((n, i) => {
				let r = Math.floor(i / puzzle.cells[0].length);
				let c = i % puzzle.cells[0].length;
				let k = matrix2point(r, c);
				if (!'.0?'.includes(n)) {
					if (pu["pu_q"].number[k] && pu["pu_q"].number[k][1] === 1 && (pu["pu_q"].number[k][2] === "1" || pu["pu_q"].number[k][2] === "10")) {
						// (Black) and (Normal or L) in Problem mode then ignore
					} else {
						sol[4].push(`${k},${n}`);
					}
				}
			});
			for (let i = 0; i < sol.length; i++) {
				sol[i].sort();
			}
			pu.solution = JSON.stringify(sol);
			pu.multisolution = false;

			document.getElementById("answersetting");
			document.getElementById('sol_number').classList.add('solcheck');

			document.getElementById('sol_number').checked = true; // Enable Number solution check
			document.getElementById("custom_message").value = '';
		}
	}

	function extractPuzzleMeta(puzzle = {}) {
		const reMetaTags = /^(.+?):\s*([\s\S]+)/m;
		const metadata = puzzle.metadata || {};
		(puzzle.cages || []).forEach(cage => {
			if((cage.cells || []).length === 0) {
				let [_, metaName, metaVal] = (String(cage.value || '').match(reMetaTags) || []);
				if(metaName && metaVal) {
					if(metaName === 'rules') {
						metadata.rules = metadata.rules || [];
						metadata.rules.push(sanitizeHTML(metaVal));
					}
					else {
						metadata[metaName] = metaVal;
					}
				}
				return;
			}
		});
		return metadata;
	};

	C.convertToPenpa = function (puzzle) {

		let pu = makeEmptyPu(puzzle.cells[0].length, puzzle.cells.length);

		const {underlays = [], overlays = []} = puzzle;
		underlays.forEach(lay => lay.target ||= 'underlay');
		overlays.forEach(lay => lay.target ||= 'overlay');

		puzzle.lays = [].concat(underlays, overlays);

		parse.cells(puzzle, pu);
		parse.regions(puzzle, pu);

		parse.cages(puzzle, pu);
		parse.arrows(puzzle, pu);
		parse.thermos(puzzle, pu);
		parse.lines(puzzle, pu);

		parse.underlays(puzzle, pu);

		parse.solution(puzzle, pu);


		const metadata = extractPuzzleMeta(puzzle);
		document.getElementById("saveinfotitle").value = metadata.title || '';
		document.getElementById("saveinfoauthor").value = metadata.author || '';
		document.getElementById("saveinforules").value = Array.isArray(metadata.rules) ? metadata.rules.join('\n') : metadata.rules || '';
		document.getElementById("saveinfosource").value = '';
		
		document.getElementById("genre_tags_opt").val = [];

		pu.mode["pu_a"]["edit_mode"] = 'sudoku'; // Mode: Sudoku
		pu.mode["pu_a"]['sudoku'][0] = '1';      // Sub: Normal
		document.getElementById("save_undo").checked = false;
		var text = pu.maketext_solve("answercheck");
		if (pu.solution) {
			var ba = encrypt_data(pu.solution);
			text += "&a=" + ba;
		}

		console.log(pu);
		console.log('https://marknn3.github.io/penpa-edit/' + text);

		// console.log(pu, puzzle);
		return pu;
	};

	function makeEmptyPu(nx, ny, boardtype = 'sudoku', space = [0, 0, 0, 0]) {
		const {matrix2point} = PenpaTools;

		const size = 38;
		let pu = boardtype === 'sudoku' 
			? new Puzzle_sudoku(nx, ny, size)
			: new Puzzle_square(nx, ny, size);
		pu.space = [...space];

		pu.size = 1;
		pu.canvasxy_update();

		pu.create_point();

		// create_point did reset size to 1
		pu.size = size;
		pu.canvasxy_update();

		// Inject puzzle/doc metrics into helper classes
		PenpaTools.doc = {};
		Object.assign(PenpaTools.doc, {
			// Copied from pu:
			point: pu.point, // point coordinate map
			nx: pu.nx, // width
			ny: pu.ny, // height
			nx0: pu.nx0, // width + 4
			ny0: pu.ny0, // height + 4
			theta: pu.theta, // rotation angle
			reflect: pu.reflect, // [0] = -1: reft LR; [1] = -1: reflect UD
			width_c: pu.width_c, // canvas width, default = nx + 1
			height_c: pu.height_c, // canvas height, default = ny + 1
			//center_n: pu.center_n, // center point of canvas
			//centerlist: pu.centerlist, // board cells list
			// Calculated parameters:
			col0: 0, // offset of puzzle cell(0,0)
			row0: 0, //  offset of puzzle cell(0,0)
			//width: 0, // number of columns in puzzle (=after translation)
			//height: 0, // number of rows in puzzle (=after translation)
			//maskedCells: [],
			//id: `penpa${md5Digest(JSON.stringify(pu))}`,
		});	

		pu.centerlist = [];
		for (var y = pu.space[0]; y < pu.ny - pu.space[1]; y++) {
			for (var x = pu.space[2]; x < pu.nx - pu.space[3]; x++) {
				pu.centerlist.push(matrix2point(y, x));
			}
		}
		
		pu.search_center();
		pu.center_n0 = pu.center_n;

		return pu;
	}

	return C;
})();
