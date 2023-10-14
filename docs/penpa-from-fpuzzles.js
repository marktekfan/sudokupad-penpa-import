const PenpaFromFPuzzles = (() => {
	'use strict';	
    function _constructor() { }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	let document = new FakeDoc();
	PenpaPuzzle.document = document;

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

	parse.underlays = (puzzle, pu) => {
		parse.anylays(pu, puzzle.underlays, 1);
	}

	parse.overlays = (puzzle, pu) => {
		parse.anylays(pu, puzzle.overlays, 2);
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

	const fontSizeMap = [
		{size: 0.7,  type: '1'}, //normal
		{size: 0.25, type: '5'}, //small
		{size: 0.4,  type: '6'}, //medium
		{size: 0.6,  type: '10'}, //big
		{size: 0.3,  type: '7'}, //sudoku corner
		{size: 0.5,  type: '1'}, //'8'=long
	]

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

	parse.anylays = (pu, features, layer = 1) => {
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
		

		const {point2RC, findPoint, ColorIsVisible} = PenpaTools;
		(features || []).forEach(lay => {
			if (!lay.text) return;
			let [y, x] = lay.center;

			let fontSize = lay.height;
			let py = y;
			if (lay.fontSize) {
				fontSize = lay.fontSize ? (lay.fontSize + 4) / 64 : lay.height;
				py = y - 0.28 * fontSize;
				py = py - fontSize * 0.08;
			}
	
			let k = findPoint(py, x);
			if (k) {
				[y, x] = point2RC(k);
				let circle = lay.rounded ? lay : features.filter(lay => lay.rounded && !lay.text && Math.abs(lay.center[0]- y) < 0.01 && Math.abs(lay.center[1] - x) < 0.01)[0];

				if (pu.point[k].type < 4) { // number
					if (circle) {
						const circleStyle = getCircleStyle(circle);
						if (!circleStyle) { // circle not visible
							circle = undefined;
						}
						else {
							let goal = Math.min(circle.height || 0, circle.width || 0);
							if (goal <= 0) return; // zero size
							goal += (circle.borderSize === undefined ? 2 : circle.borderSize) / 64;
							let best = sizeMap[2].reduce((prev, curr) => {
								return (Math.abs(curr.size - goal) < Math.abs(prev.size - goal) ? curr : prev);
							});		

							// if (best.feature === 'symbol') {
							// 	const over = (lay.target === 'overlay' || layer == 2) ? 2 : 1; // TODO: handle target: 'underlay'
							// 	let sym = [circleStyle, best.obj[1], over];
							// 	pu.pu_q.symbol[k] = sym;
							// }
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

								circle.height = -circle.height; // make invisible
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
					}
				}
				else { // numberS
					if (circle) {
						const circleStyle = getCircleStyle(circle);
						if (!circleStyle) { // circle not visible
							circle = undefined;
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

							circle.height = -circle.height; // make invisible
						}
					}
					if (!circle) {
						if (fontSize > 0.35) {
							console.warn(`fontSize ${fontSize}] is too big. clipped into 0.32`, JSON.stringify(pu.pu_q.number[k]), 'with', lay.text);
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
					}	
				}

				// if (best.feature === 'symbol') {
				// 	const over = (lay.target === 'overlay' || layer == 2) ? 2 : 1; // TODO: handle target: 'underlay'
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
				// 	let num = ['x', numberCircleStyle, best.obj[2]];
				// 	pu.pu_q.number[k] = num;
				// }
			}
		});


		(features || []).forEach(lay => {
			if (lay.text) return;
			let [y, x] = lay.center;

			// Surface
			if (!lay.rounded && !lay.borderColor && ((lay.height % 1) === 0 && (lay.width % 1) === 0)) {
				if (!ColorIsVisible(lay.backgroundColor)) return;
				
				let style = getSurfaceStyle(lay);

				for (let r = y - lay.height / 2; r < y + lay.height / 2; r++) {
					for (let c = x - lay.width / 2; c < x + lay.width / 2; c++) {
						let k = findPoint(r + 0.5, c + 0.5, [0]);
						if (style > 0)
							pu.pu_q.surface[k] = style;
						else {
							pu.pu_q.surface[k] = 1;
							pu.pu_q_sol.surface[k] = style;
						}
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
						const over = (lay.target === 'overlay' || layer == 2) ? 2 : 1; // TODO: handle target: 'underlay'
						let sym = [circleStyle, best.obj[1], over];
						pu.pu_q.symbol[k] = sym;
					}
					else if (best.feature === 'number') {
						const numberCircleStyleMap = {
							1: 6,
							2: 7,
							7: 5,
						};
						const numberCircleStyle = numberCircleStyleMap[circleStyle] || 6;
						let num = ['x', numberCircleStyle, best.obj[2]];
						pu.pu_q.number[k] = num;
					}
				}
			}
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

	C.convertFPuzzlesToPenpa = function (fpuz) {
		const {matrix2point} = PenpaTools;

		fpuz = {
			"size": 6,
			"grid": [
				[{}, {}, {}, {}, {}, {}],
				[{}, {"region": 2}, {}, {}, {}, {}],
				[{}, {}, {"region": 0}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {"region": 4}, {}, {}],
				[{}, {}, {"region": 5}, {}, {}, {}]
			]
		};

		fpuz = {
			"size": 9,
			"title": "XV (-) Sudoku",
			"author": "Bill Murphy",
			"ruleset": "Normal sudoku rules apply. Adjacent cells must not sum to 5 or 10.\n",
			"grid": [
				[{"value": 6, "given": true, },{},{},{},{"value": 2, "given": true, },{},{},{},{}],
				[{},{"value": 2, "given": true, },{},{"value": 1, "given": true, },{},{},{"value": 8, "given": true, },{"value": 7, "given": true, },{"value": 4, "given": true, }],
				[{},{},{"value": 7, "given": true, },{},{},{},{},{},{}],
				[{},{"value": 9, "given": true, },{},{"value": 4, "given": true, },{},{},{},{},{}],
				[{"value": 8, "given": true, },{},{},{},{"value": 1, "given": true, },{},{},{},{"value": 9, "given": true, }],
				[{},{},{},{},{},{"value": 7, "given": true, },{},{"value": 4, "given": true, },{}],
				[{},{},{},{},{},{"value": 9, "given": true, },{},{"value": 8, "given": true, },{}],
				[{},{},{},{},{},{"value": 2, "given": true, },{},{"value": 5, "given": true, },{}],
				[{},{},{},{},{},{},{"value": 6, "given": true, },{},{}]
			],
			"negative": ["xv"],
			"xv": [],
			"disabledlogic": [],
			"truecandidatesoptions": ["colored"],
			"solution": [6,1,8,7,2,4,3,9,5,9,2,5,1,6,3,8,7,4,3,4,7,8,9,5,1,6,2,5,9,2,4,3,8,7,1,6,8,7,4,2,1,6,5,3,9,1,6,3,9,5,7,2,4,8,2,5,1,6,7,9,4,8,3,7,8,6,3,4,2,9,5,1,4,3,9,5,8,1,6,2,7]
		}

		fpuz = {
			"size": 9,
			"title": "Myself",
			"author": "Bill Murphy",
			"ruleset": "Normal sudoku rules apply. Digits separated by a white dot must be differ by the number in the dot.\n",
			"grid": [
			  [
				{},{},{},{"value": 1, "given": true, },
				{},{},{},{},{}
			  ],
			  [
				{},{},{},{"value": 2, "given": true, },
				{},{},{},{},{}
			  ],
			  [
				{},{},{},{"value": 3, "given": true, },
				{},{},{},{},{}
			  ],
			  [
				{},{},{},{},{},{},{"value": 2, "given": true, },
				{"value": 5, "given": true, },
				{"value": 8, "given": true, }
			  ],
			  [
				{},{},{},{},{},{},{},{},{}
			  ],
			  [
				{"value": 7, "given": true, },
				{"value": 4, "given": true, },
				{"value": 1, "given": true, },
				{},{},{},{},{},{}
			  ],
			  [
				{},{},{},{},{},{"value": 4, "given": true, },
				{},{},{}
			  ],
			  [
				{},{},{},{},{},{"value": 5, "given": true, },
				{},{},{}
			  ],
			  [
				{},{},{},{},{},{"value": 6, "given": true, },
				{},{},{}
			  ]
			],
			"difference": [
			  {"cells": ["R1C4", "R1C5"], "value": "3"},
			  {"cells": ["R2C4", "R2C5"], "value": "3"},
			  {"cells": ["R3C4", "R3C5"], "value": "3"},
			  {"cells": ["R7C6", "R7C5"], "value": "3"},
			  {"cells": ["R8C5", "R8C6"], "value": "3"},
			  {"cells": ["R9C5", "R9C6"], "value": "3"},
			  {"cells": ["R2C7", "R3C7"], "value": "1"},
			  {"cells": ["R2C7", "R2C8"], "value": "1"},
			  {"cells": ["R2C9", "R2C8"], "value": "1"},
			  {"cells": ["R1C9", "R2C9"], "value": "1"},
			  {"cells": ["R4C7", "R5C7"], "value": "1"},
			  {"cells": ["R5C8", "R4C8"], "value": "1"},
			  {"cells": ["R4C9", "R5C9"], "value": "1"},
			  {"cells": ["R6C1", "R5C1"], "value": "1"},
			  {"cells": ["R5C2", "R6C2"], "value": "1"},
			  {"cells": ["R5C3", "R6C3"], "value": "1"},
			  {"cells": ["R8C1", "R7C1"], "value": "1"},
			  {"cells": ["R8C1", "R8C2"], "value": "1"},
			  {"cells": ["R8C3", "R8C2"], "value": "1"},
			  {"cells": ["R9C3", "R8C3"], "value": "1"}
			],
			"disabledlogic": [],
			"truecandidatesoptions": ["colored"],
			"solution": [
			  9,6,7,1,4,8,3,2,5,1,3,4,2,5,9,8,7,6,2,8,5,3,6,7,9,1,4,3,9,6,4,7,1,2,5,8,8,5,2,6,9,3,1,4,7,7,4,1,5,8,2,6,9,3,5,2,3,8,1,4,7,6,9,6,7,8,9,2,5,4,3,1,4,1,9,7,3,6,5,8,2
			]
		  };
		  
		fpuz = 
		{
			"size": 9,
			"title": "That's 3 in the Top Right",
			"author": "Philip Newman",
			"ruleset": "(October 13, 2023)\n\nNormal sudoku rules apply.\nArrow: Digits along arrows must sum to the total given in the corresponding circle.\nDifference Pairs: Digits in cells separated by a white dot must have the difference given.\nRatio Pairs: Digits in cells separated by a black dot must have the ratio given.",
			"grid": [
			  [{}, {}, {}, {}, {}, {}, {}, {}, {"value": 3, "given": true}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
			],
			"difference": [
			  {"cells": ["R7C2", "R6C2"], "value": "2"},
			  {"cells": ["R3C8", "R4C8"], "value": "1"},
			  {"cells": ["R8C6", "R8C7"], "value": "1"},
			  {"cells": ["R2C4", "R2C3"], "value": "2"},
			  {"cells": ["R7C4", "R8C4"], "value": "1"}
			],
			"ratio": [
			  {"cells": ["R2C8", "R3C8"], "value": "3"},
			  {"cells": ["R2C2", "R2C3"], "value": "3"},
			  {"cells": ["R7C2", "R8C2"], "value": "2"},
			  {"cells": ["R8C8", "R8C7"], "value": "2"},
			  {"cells": ["R7C5", "R7C6"], "value": "2"},
			  {"cells": ["R7C6", "R6C6"], "value": "2"},
			  {"cells": ["R2C6", "R3C6"], "value": "3"}
			],
			"arrow": [
			  {"lines": [["R2C2", "R2C3", "R2C4", "R2C5"]], "cells": ["R2C2"]},
			  {"lines": [["R2C8", "R3C8", "R4C8", "R5C8"]], "cells": ["R2C8"]},
			  {"lines": [["R8C8", "R8C7", "R8C6", "R8C5"]], "cells": ["R8C8"]},
			  {"lines": [["R8C2", "R7C2", "R6C2", "R5C2"]], "cells": ["R8C2"]},
			  {"lines": [["R7C3", "R6C3", "R5C3"]], "cells": ["R7C3"]},
			  {"lines": [["R3C3", "R3C4", "R3C5"]], "cells": ["R3C3"]},
			  {"lines": [["R3C7", "R4C7", "R5C7"]], "cells": ["R3C7"]},
			  {"lines": [["R7C7", "R7C6", "R7C5"]], "cells": ["R7C7"]},
			  {"lines": [["R3C6", "R4C6", "R5C6"]], "cells": ["R3C6"]},
			  {"lines": [["R7C4", "R6C4", "R5C4"]], "cells": ["R7C4"]}
			],
			"solution": [
			  2,
			  5,
			  6,
			  9,
			  8,
			  7,
			  1,
			  4,
			  3,
			  4,
			  9,
			  3,
			  1,
			  5,
			  2,
			  8,
			  6,
			  7,
			  1,
			  8,
			  7,
			  4,
			  3,
			  6,
			  9,
			  2,
			  5,
			  6,
			  7,
			  8,
			  3,
			  9,
			  5,
			  2,
			  1,
			  4,
			  9,
			  2,
			  5,
			  6,
			  4,
			  1,
			  7,
			  3,
			  8,
			  3,
			  1,
			  4,
			  2,
			  7,
			  8,
			  5,
			  9,
			  6,
			  7,
			  3,
			  9,
			  8,
			  2,
			  4,
			  6,
			  5,
			  1,
			  5,
			  6,
			  2,
			  7,
			  1,
			  3,
			  4,
			  8,
			  9,
			  8,
			  4,
			  1,
			  5,
			  6,
			  9,
			  3,
			  7,
			  2
			]
		  }
		;
		  
		// Inject puzzle/doc metrics into helper classes
		const doc = {}
		PenpaTools.doc = doc;
		  
		let puzzle = loadFPuzzle.parseFPuzzle(fpuz);
/*
		  puzzle = 
		  {
			"id": "penpa5934799e7b7096e4e13ac9b6307de675",
			"settings": {"conflictchecker": 0},
			"cellSize": 64,
			"cells": [
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
			],
			"underlays": [
			  {"class": "board-position", "backgroundColor": "#FFFFFF00", "center": [5, 5], "width": 10, "height": 10},
			  {"backgroundColor": "#B3FFB3", "center": [1.5, 5], "width": 10, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [1.5, 5], "width": 10, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [3.5, 5], "width": 10, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [3.5, 5], "width": 10, "height": 1},
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [3.5, 0.5],
				"width": 0.886,
				"height": 0.886
			  },
			  {"target": "overlay", "backgroundColor": "#000000", "rounded": 1, "center": [3.5, 1.5], "width": 0.886, "height": 0.886},
			  {"target": "overlay", "backgroundColor": "#CFCFCF", "rounded": 1, "center": [3.5, 2.5], "width": 0.86, "height": 0.86},
			  {
				"borderSize": 1.7,
				"stroke-dasharray": "6.7,6.7",
				"target": "overlay",
				"borderColor": "#000000",
				"rounded": 1,
				"center": [3.5, 3.5],
				"width": 0.886,
				"height": 0.886
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#CFCFCF",
				"rounded": 1,
				"center": [3.5, 4.5],
				"width": 0.886,
				"height": 0.886
			  },
			  {
				"borderSize": 3.4,
				"target": "overlay",
				"borderColor": "#999999",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [3.5, 5.5],
				"width": 0.913,
				"height": 0.913
			  },
			  {"target": "overlay", "backgroundColor": "#FFFFFF", "rounded": 1, "center": [3.5, 6.5], "width": 0.86, "height": 0.86},
			  {
				"borderSize": 3.4,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [3.5, 7.5],
				"width": 0.913,
				"height": 0.913
			  },
			  {
				"borderSize": 3.4,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#CFCFCF",
				"rounded": 1,
				"center": [3.5, 8.5],
				"width": 0.913,
				"height": 0.913
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [3.5, 9.5],
				"width": 0.886,
				"height": 0.886
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [3.5, 9.5],
				"width": 0.666,
				"height": 0.666
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"center": [5.5, 0.5],
				"width": 1.026,
				"height": 1.026
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"center": [5.5, 1.5],
				"width": 0.826,
				"height": 0.826
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"center": [5.5, 2.5],
				"width": 0.726,
				"height": 0.726
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"center": [5.5, 3.5],
				"width": 0.466,
				"height": 0.466
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"center": [5.5, 4.5],
				"width": 0.286,
				"height": 0.286
			  },
			  {
				"borderSize": 3.4,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#CFCFCF",
				"center": [5.5, 5.5],
				"width": 0.753,
				"height": 0.753
			  },
			  {"target": "overlay", "backgroundColor": "#FFFFFF", "center": [5.5, 6.5], "width": 0.44, "height": 0.44},
			  {"target": "overlay", "backgroundColor": "#CFCFCF", "center": [5.5, 7.5], "width": 0.8, "height": 0.8},
			  {
				"borderSize": 1.7,
				"stroke-dasharray": "6.7,6.7",
				"target": "overlay",
				"borderColor": "#000000",
				"center": [5.5, 8.5],
				"width": 0.726,
				"height": 0.726
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [1.5, 1],
				"width": 0.286,
				"height": 0.286
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [1.5, 3],
				"width": 0.466,
				"height": 0.466
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [1.5, 6],
				"width": 0.726,
				"height": 0.726
			  },
			  {
				"borderSize": 1.7,
				"target": "overlay",
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": 1,
				"center": [1.5, 8],
				"width": 0.886,
				"height": 0.886
			  }
			],
			"overlays": [
			  {"backgroundColor": "#FFFFFF", "rounded": true, "center": [2.5, 6.5], "width": 0.84, "height": 0.84},
			  {
				"stroke-width": 3.4,
				"textStroke": "#FFFFFF",
				"dominant-baseline": "alphabetic",
				"borderColor": "#FFFFFF",
				"fontSize": 40.8,
				"text": "A",
				"center": [2.76, 6.5],
				"height": 0,
				"width": 0
			  },
			  {"borderSize": 1.7, "borderColor": "#000000", "backgroundColor": "#FFFFFF", "rounded": true, "center": [1.5, 2], "width": 0.34, "height": 0.34},
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 12, "text": 1, "center": [1.59, 2], "height": 0, "width": 0},
			  {"borderSize": 1.7, "borderColor": "#000000", "backgroundColor": "#FFFFFF", "rounded": true, "center": [1.5, 4], "width": 0.5, "height": 0.5},
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 21.6, "text": 1, "center": [1.64, 4], "height": 0, "width": 0},
			  {"borderSize": 1.7, "borderColor": "#000000", "backgroundColor": "#FFFFFF", "rounded": true, "center": [1.5, 5], "width": 0.72, "height": 0.72},
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 34.4, "text": 1, "center": [1.7, 5], "height": 0, "width": 0},
			  {"borderSize": 1.7, "borderColor": "#000000", "backgroundColor": "#FFFFFF", "rounded": true, "center": [1.5, 7], "width": 0.84, "height": 0.84},
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 40.8, "text": 1, "center": [1.76, 7], "height": 0, "width": 0}
			],
			"lines": [{"target": "overlay", "thickness": 4.3, "color": "#000000", "wayPoints": [[10, 0], [0, 0], [0, 10], [10, 10], [10, 0]]}],
			"cages": [
			  {"unique": false, "hidden": true, "cells": [[0, 0], [9, 9]]},
			  {"value": "title: Untitled"},
			  {"value": "author: Unknown"},
			  {"value": "rules: No rules provided for this puzzle. Please check the related video or website for rules."}
			]
		  }
		  puzzle = 
		  {
			"id": "penpafee1778e4addfed68bfc30cffdd3cced",
			"settings": {"conflictchecker": 0},
			"cellSize": 64,
			"cells": [
			  [{"given": true, "value": 1}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{"pencilMarks": [" "]}, {"pencilMarks": [" "]}, {}, {}, {}, {}, {}, {}, {"pencilMarks": [" "]}, {"pencilMarks": [" "]}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
			  [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
			],
			"underlays": [
			  {"class": "board-position", "backgroundColor": "#FFFFFF00", "center": [5, 5], "width": 10, "height": 10},
			  {"backgroundColor": "#B3FFB3", "center": [0.5, 5], "width": 10, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [0.5, 5], "width": 10, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [0.5, 10.5], "width": 1, "height": 1},
			  {"backgroundColor": "#B3FFB3", "center": [0.5, 10.5], "width": 1, "height": 1}
			],
			"overlays": [
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#4C9900",
				"text": 2,
				"center": [0.76, 1.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#187BCD",
				"text": 3,
				"center": [0.76, 2.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#999999",
				"text": 4,
				"center": [0.76, 3.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#0000FF",
				"text": 5,
				"center": [0.76, 4.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#FF0000",
				"text": 6,
				"center": [0.76, 5.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#FFFFFF",
				"text": 7,
				"center": [0.76, 6.5],
				"height": 0,
				"width": 0
			  },
			  {"borderSize": 1.7, "borderColor": "#000000", "backgroundColor": "#FFFFFF", "rounded": true, "center": [0.5, 7.5], "width": 0.84, "height": 0.84},
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 40.8, "text": 9, "center": [0.76, 7.5], "height": 0, "width": 0},
			  {"backgroundColor": "#000000", "rounded": true, "center": [0.5, 8.5], "width": 0.84, "height": 0.84},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#FFFFFF",
				"text": 10,
				"center": [0.76, 8.5],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [0.5, 9.5], "width": 0.84, "height": 0.84},
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [0.5, 9.5], "width": 0.84, "height": 0.84},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 40.8,
				"color": "#FFFFFF",
				"text": 11,
				"center": [0.76, 9.5],
				"height": 0,
				"width": 0
			  },
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 15.2, "text": 1, "center": [1.36, 0.25], "height": 0, "width": 0},
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#4C9900",
				"text": 2,
				"center": [1.36, 1.25],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#187BCD",
				"text": 3,
				"center": [1.36, 2.75],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#000000", "rounded": true, "center": [1.25, 8.25], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 1,
				"center": [1.36, 8.25],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#000000", "rounded": true, "center": [1.25, 8.75], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 2,
				"center": [1.36, 8.75],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#000000", "rounded": true, "center": [1.75, 8.25], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 3,
				"center": [1.86, 8.25],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#000000", "rounded": true, "center": [1.75, 8.75], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 4,
				"center": [1.86, 8.75],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.25, 9.25], "width": 0.36, "height": 0.36},
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.25, 9.25], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 1,
				"center": [1.36, 9.25],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.25, 9.75], "width": 0.36, "height": 0.36},
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.25, 9.75], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 2,
				"center": [1.36, 9.75],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.75, 9.25], "width": 0.36, "height": 0.36},
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.75, 9.25], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 3,
				"center": [1.86, 9.25],
				"height": 0,
				"width": 0
			  },
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.75, 9.75], "width": 0.36, "height": 0.36},
			  {"backgroundColor": "#FF0000", "rounded": true, "center": [1.75, 9.75], "width": 0.36, "height": 0.36},
			  {
				"stroke-width": 1.7,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FFFFFF",
				"text": 4,
				"center": [1.86, 9.75],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#999999",
				"text": 3,
				"center": [1.61, 3.8],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#0000FF",
				"text": 4,
				"center": [1.31, 4.5],
				"height": 0,
				"width": 0
			  },
			  {
				"stroke-width": 0,
				"dominant-baseline": "alphabetic",
				"fontSize": 15.2,
				"color": "#FF0000",
				"text": 5,
				"center": [1.61, 5.2],
				"height": 0,
				"width": 0
			  },
			  {
				"borderSize": 1.7,
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": true,
				"center": [1.19921875, 7.5],
				"width": 0.36,
				"height": 0.36
			  },
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 15.2, "text": 2, "center": [1.31, 7.5], "height": 0, "width": 0},
			  {
				"borderSize": 1.7,
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": true,
				"center": [1.5, 7.80078125],
				"width": 0.36,
				"height": 0.36
			  },
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 15.2, "text": 3, "center": [1.61, 7.8], "height": 0, "width": 0},
			  {
				"borderSize": 1.7,
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": true,
				"center": [1.5, 7.19921875],
				"width": 0.36,
				"height": 0.36
			  },
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 15.2, "text": 1, "center": [1.61, 7.2], "height": 0, "width": 0},
			  {
				"borderSize": 1.7,
				"borderColor": "#000000",
				"backgroundColor": "#FFFFFF",
				"rounded": true,
				"center": [1.80078125, 7.5],
				"width": 0.36,
				"height": 0.36
			  },
			  {"stroke-width": 0, "dominant-baseline": "alphabetic", "fontSize": 15.2, "text": 4, "center": [1.91, 7.5], "height": 0, "width": 0}
			],
			"lines": [{"target": "overlay", "thickness": 4.3, "color": "#000000", "wayPoints": [[10, 0], [0, 0], [0, 10], [10, 10], [10, 0]]}],
			"cages": [
			  {"unique": false, "hidden": true, "cells": [[0, 0], [9, 9]]},
			  {"value": "title: Untitled"},
			  {"value": "author: Unknown"},
			  {"value": "rules: No rules provided for this puzzle. Please check the related video or website for rules."}
			]
		  }
		  ;
*/
		let pu = makeEmptyPu(puzzle.cells[0].length, puzzle.cells.length);

		parse.cells(puzzle, pu);
		parse.regions(puzzle, pu);

		parse.underlays(puzzle, pu);
		parse.overlays(puzzle, pu);

		parse.cages(puzzle, pu);
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
