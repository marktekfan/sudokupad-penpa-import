'use strict';
(()=>{
	let fpuz = [];
	let puzzle = [];

	// Irregular 6x6
	fpuz[0] = {
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

	// "title": "XV (-) Sudoku",
	// "author": "Bill Murphy",
	// "ruleset": "Normal sudoku rules apply. Adjacent cells must not sum to 5 or 10.\n",
	fpuz[1] = {
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

	// "title": "Myself",
	// "author": "Bill Murphy",
	// "ruleset": "Normal sudoku rules apply. Digits separated by a white dot must be differ by the number in the dot.\n",
	fpuz[2] = {
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
	  
	//   Play on f-puzzles: https://f-puzzles.com/?id=ywayluvu
	//   Play on CTC App: https://tinyurl.com/3ceakdz7
	// "title": "That's 3 in the Top Right",
	// "author": "Philip Newman",
	// "ruleset": "(October 13, 2023)\n\nNormal sudoku rules apply.\nArrow: Digits along arrows must sum to the total given in the corresponding circle.\nDifference Pairs: Digits in cells separated by a white dot must have the difference given.\nRatio Pairs: Digits in cells separated by a black dot must have the ratio given.",
  	fpuz[3] = 
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
	  
	// killer cages
	fpuz[4] =
	{
		"size": 9,
		"grid": [
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
		],
		"killercage": [{"cells": ["R5C2", "R5C3", "R5C4", "R6C2", "R6C3", "R6C4", "R7C2", "R7C3", "R8C4"], "value": "123"}]
	  }
  
	  puzzle[0] = 
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

	  puzzle[1] = 
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
	  fpuz[5] = 
	  {
		"size": 9,
		"grid": [
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
		],
		"odd": [{"cell": "R1C1"}, {"cell": "R9C9"}],
		"even": [{"cell": "R9C1"}, {"cell": "R1C9"}],
		"thermometer": [{"lines": [["R2C2", "R2C3", "R2C4", "R3C5", "R3C6"]]}, {"lines": [["R4C4", "R3C5"]]}],
		"palindrome": [{"lines": [["R1C2", "R1C3", "R1C4"]]}],
		"renban": [{"lines": [["R1C5", "R1C6", "R1C7"]]}],
		"whispers": [{"lines": [["R1C8", "R2C8", "R3C9", "R4C9"]]}],
		"regionsumline": [{"lines": [["R2C1", "R3C1", "R4C2", "R4C3"]]}],
		"line": [
		  {"lines": [["R1C5", "R1C6", "R1C7"]], "outlineC": "#F067F0", "width": 0.4, "fromConstraint": "Renban"},
		  {"lines": [["R1C8", "R2C8", "R3C9", "R4C9"]], "outlineC": "#67F067", "width": 0.3, "fromConstraint": "Whispers"},
		  {"lines": [["R2C1", "R3C1", "R4C2", "R4C3"]], "outlineC": "#2ECBFF", "width": 0.25, "fromConstraint": "Region Sum Line"}
		]
	  }
	  ;

	  fpuz[6] =
	  {
		"size": 9,
		"grid": [
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
		],
		"sandwichsum": [
		  {"cell": "R2C0", "value": "11"},
		  {"cell": "R0C5", "value": "12"},
		  {"cell": "R3C10", "value": "13"},
		  {"cell": "R10C9", "value": "14"},
		  {"cell": "R10C3", "value": "15"}
		]
	  };
	  fpuz[7] =
	  {
		"size": 9,
		"grid": [
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{"value": 1, "given": true}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
		],
		// "sandwichsum": [
		//   {"cell": "R2C0", "value": "11"},
		//   {"cell": "R0C5", "value": "12"},
		//   {"cell": "R3C10", "value": "13"},
		//   {"cell": "R10C9", "value": "14"},
		//   {"cell": "R10C3", "value": "15"}
		// ],
		 "text": [{"cells": ["R2C2"], "value": "9", "fontC": "#000000", "size": 0.5}, {"cells": ["R2C3"], "fontC": "#000000", "size": 0.5}],
		 "circle": [
		   {"cells": ["R2C3"], "value": "7", "baseC": "#FFFFFF", "outlineC": "#000000", "fontC": "#000000", "width": 0.5, "height": 0.5},
		   {"cells": ["R2C4"], "baseC": "#FFFFFF", "outlineC": "#000000", "fontC": "#000000", "width": 0.5, "height": 0.5}
		 ],
		"rectangle": [{"cells": ["R2C5"], "value": "7", "baseC": "#FFFFFF", "outlineC": "#000000", "fontC": "#000000", "width": 0.5, "height": 0.5}],
		 // "cage": [{"cells": ["R5C3", "R5C4"], "outlineC": "#000000", "fontC": "#000000"}]
	  };
 	let puz = loadFPuzzle.parseFPuzzle(fpuz[7]);
	//let puz = puzzle[2]

	PenpaFromFPuzzles.convertToPenpa(puz);
})();

