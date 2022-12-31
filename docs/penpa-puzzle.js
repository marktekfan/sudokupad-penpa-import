
	class Point {
		constructor(x, y, type, adjacent, surround, use, neighbor = [], adjacent_dia = [], type2 = 0) {
			this.x = x;
			this.y = y;
			this.type = type;
			this.type2 = type2;
			this.adjacent = adjacent;
			this.adjacent_dia = adjacent_dia;
			this.surround = surround;
			this.neighbor = neighbor;
			this.use = use;
		}
	}

	class PenpaPuzzle {
		constructor(gridtype) {
			this.gridtype = gridtype;	
			// this.resol = 2.5; //window.devicePixelRatio || 1;
			// this.canvasx = 0; //predefine
			// this.canvasy = 0; //predefine
			// this.center_n = 0;
			// this.center_n0 = 0;
			// this.margin = 6;
	
			// this.canvas = document.getElementById("canvas");
			this.ctx = {};
			// this.obj = document.getElementById("dvique");
	
			// Drawing position
			// this.mouse_mode = "";
			// this.mouse_click = 0; // 0 for left, 2 for right
			// this.selection = [];
			// this.cageselection = [];
			// this.last = -1;
			// this.lastx = -1;
			// this.lasty = -1;
			// this.first = -1;
			// this.start_point = {}; //for move_redo
			// this.drawing = false;
			// this.drawing_mode = -1;
			// this.cursol = 0;
			// this.cursolS = 0;
			// this.panelflag = false;
			// Drawing mode
			// this.mmode = ""; // Problem mode
			this.mode = {
				// "qa": "pu_q",
				"grid": ["1", "2", "1"], //grid,lattice,out
				// "pu_q": {
				// 	"edit_mode": "surface",
				// 	"surface": ["", 1],
				// 	"line": ["1", 2],
				// 	"lineE": ["1", 2],
				// 	"wall": ["", 2],
				// 	"cage": ["1", 10],
				// 	"number": ["1", 1],
				// 	"symbol": ["circle_L", 1],
				// 	"special": ["thermo", ""],
				// 	"board": ["", ""],
				// 	"move": ["1", ""],
				// 	"combi": ["battleship", ""],
				// 	"sudoku": ["1", 1]
				// },
				// "pu_a": {
				// 	"edit_mode": "surface",
				// 	"surface": ["", 1],
				// 	"line": ["1", 3],
				// 	"lineE": ["1", 3],
				// 	"wall": ["", 3],
				// 	"cage": ["1", 10],
				// 	"number": ["1", 2],
				// 	"symbol": ["circle_L", 1],
				// 	"special": ["thermo", ""],
				// 	"board": ["", ""],
				// 	"move": ["1", ""],
				// 	"combi": ["battleship", ""],
				// 	"sudoku": ["1", 9]
				// }
			};
			this.theta = 0;
			this.reflect = [1, 1];
			this.centerlist = [];
			this.solution = "";
			// this.sol_flag = 0;
			// this.undoredo_counter = 0;
			// this.loop_counter = false;
			this.rules = "";
			// this.gridmax = {
			// 	'square': 100,
			// 	'hex': 20,
			// 	'tri': 20,
			// 	'pyramid': 20,
			// 	'cube': 20,
			// 	'kakuro': 100,
			// 	'tetrakis': 20,
			// 	'truncated': 20,
			// 	'snub': 20,
			// 	'cairo': 20
			// }; // also defined in general.js
			this.replace = [
				["\"qa\"", "z9"],
				["\"pu_q\"", "zQ"],
				["\"pu_a\"", "zA"],
				["\"grid\"", "zG"],
				["\"edit_mode\"", "zM"],
				["\"surface\"", "zS"],
				["\"line\"", "zL"],
				["\"lineE\"", "zE"],
				["\"wall\"", "zW"],
				["\"cage\"", "zC"],
				["\"number\"", "zN"],
				["\"symbol\"", "zY"],
				["\"special\"", "zP"],
				["\"board\"", "zB"],
				["\"command_redo\"", "zR"],
				["\"command_undo\"", "zU"],
				["\"command_replay\"", "z8"],
				["\"numberS\"", "z1"],
				["\"freeline\"", "zF"],
				["\"freelineE\"", "z2"],
				["\"thermo\"", "zT"],
				["\"arrows\"", "z3"],
				["\"direction\"", "zD"],
				["\"squareframe\"", "z0"],
				["\"polygon\"", "z5"],
				["\"deletelineE\"", "z4"],
				["\"killercages\"", "z6"],
				["\"nobulbthermo\"", "z7"],
				["\"__a\"", "z_"],
				["null", "zO"],
			];
			this.version = [3, 0, 3]; // Also defined in HTML Script Loading in header tag to avoid Browser Cache Problems
			// this.undoredo_disable = false;
			// this.comp = false;
			this.multisolution = false;
			this.borderwarning = true;
			this.user_tags = [];
			// this.conflicts = new Conflicts(this);
			// this.previous_sol = [];
			// this.conflict_cells = [];
			this.url = [];
			// this.ignored_line_types = {
			// 	2: 1, // Black color
			// 	5: 1, // Grey Color
			// 	80: 1, // Thin
			// 	12: 1, // Dotted
			// 	13: 1 // Fat dots
			// };
			// this.replaycutoff = 60 * 60 * 1000; // 60 minutes
			// this.surface_2_edge_types = ['pentominous', 'araf', 'spiralgalaxies', 'fillomino', 'compass'];
			// this.isReplay = false;
		}

		reset() {
			// let pu_qa = ["pu_q", "pu_a"],
			// 	pu_qa_col = ["pu_q_col", "pu_a_col"];
	
			// // Object and Array initialization
			// for (var i of pu_qa) {
			// 	this[i] = {};
			// 	// this[i].command_redo = new Stack();
			// 	// this[i].command_undo = new Stack();
			// 	// this[i].command_replay = new Stack();
			// 	this[i].surface = {};
			// 	this[i].number = {};
			// 	this[i].numberS = {};
			// 	this[i].symbol = {};
			// 	this[i].freeline = {};
			// 	this[i].freelineE = {};
			// 	this[i].thermo = [];
			// 	this[i].arrows = [];
			// 	this[i].direction = [];
			// 	this[i].squareframe = [];
			// 	this[i].polygon = [];
			// 	this[i].line = {};
			// 	this[i].lineE = {};
			// 	this[i].wall = {};
			// 	this[i].cage = {};
			// 	this[i].deletelineE = {};
			// 	this[i].killercages = [];
			// 	this[i].nobulbthermo = [];
			// }
	
			// // Object and Array initialization for custom colors
			// for (var i of pu_qa_col) {
			// 	this[i] = {};
			// 	// this[i].command_redo = new Stack();
			// 	// this[i].command_undo = new Stack();
			// 	// this[i].command_replay = new Stack();
			// 	this[i].surface = {};
			// 	this[i].number = {};
			// 	this[i].numberS = {};
			// 	this[i].symbol = {};
			// 	this[i].freeline = {};
			// 	this[i].freelineE = {};
			// 	this[i].thermo = [];
			// 	this[i].arrows = [];
			// 	this[i].direction = [];
			// 	this[i].squareframe = [];
			// 	this[i].polygon = [];
			// 	this[i].line = {};
			// 	this[i].lineE = {};
			// 	this[i].wall = {};
			// 	this[i].cage = {};
			// 	this[i].deletelineE = {};
			// 	this[i].killercages = [];
			// 	this[i].nobulbthermo = [];
			// }
	
			// this.frame = {};
			// this.freelinecircle_g = [-1, -1];
			this.point = [];
		}
	}

	class PenpaPuzzle_Square extends PenpaPuzzle {
		constructor(nx, ny, size) {
			// Board information
			super('square');
			this.nx = nx;
			this.ny = ny;
			this.nx0 = this.nx + 4;
			this.ny0 = this.ny + 4;
			this.margin = -1; //for arrow of number pointing outside of the grid
			this.sudoku = [0, 0, 0, 0]; // This is for sudoku settings
			this.width0 = this.nx + 1;
			this.height0 = this.ny + 1;
			this.width_c = this.width0;
			this.height_c = this.height0;
			this.width = this.width_c;
			this.height = this.height_c;
			// this.canvasx = this.width_c * this.size;
			// this.canvasy = this.height_c * this.size;
			this.space = [
				parseInt(doc.nb_space1),
				parseInt(doc.nb_space2),
				parseInt(doc.nb_space3),
				parseInt(doc.nb_space4),
			];
			this.size = size;
			this.reset();
		}

		create_point() {
			var k = 0;
			var nx = this.nx0;
			var ny = this.ny0;
			var adjacent, surround, type, use, neighbor, adjacent_dia;
			var point = [];
			//center
			type = 0;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					adjacent = [k - nx, k - 1, k + 1, k + nx];
					adjacent_dia = [k - nx - 1, k - nx + 1, k + nx - 1, k + nx + 1];
					surround = [k + nx * ny - nx - 1, k + nx * ny - nx, k + nx * ny, k + nx * ny - 1];
					neighbor = [k + 2 * nx * ny - nx, k + 2 * nx * ny, k + 3 * nx * ny - 1, k + 3 * nx * ny];
					point[k] = new Point((i + 0.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, adjacent_dia);
					k++;
				}
			}
			//vertex
			type = 1;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					adjacent = [k - nx, k - 1, k + 1, k + nx];
					adjacent_dia = [k - nx - 1, k - nx + 1, k + nx - 1, k + nx + 1];
					surround = [];
					point[k] = new Point(point[i + j * nx].x + 0.5 * this.size, point[i + j * nx].y + 0.5 * this.size, type, adjacent, surround, use, [], adjacent_dia);
					k++;
				}
			}
	
	
			//centervertex
			type = 2;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					adjacent = [k + nx, k - nx];
					surround = [];
					neighbor = [k - 2 * nx * ny, k - 2 * nx * ny + nx];
					point[k] = new Point(point[i + j * nx].x, point[i + j * nx].y + 0.5 * this.size, type, adjacent, surround, use, neighbor);
					k++;
				}
			}
			type = 3;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					adjacent = [k + 1, k - 1];
					surround = [];
					neighbor = [k - 3 * nx * ny, k - 3 * nx * ny + 1];
					point[k] = new Point(point[i + j * nx].x + 0.5 * this.size, point[i + j * nx].y, type, adjacent, surround, use, neighbor);
					k++;
				}
			}
	
			//  1/4
			var r = 0.25;
			type = 4;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					surround = [];
					adjacent = [k - 4 * nx + 2, k - 3, k + 1, k + 2];
					point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
					k++;
					adjacent = [k - 4 * nx + 2, k - 1, k + 3, k + 2];
					point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
					k++;
					adjacent = [k - 2, k - 3, k + 1, k + 4 * nx - 2];
					point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
					k++;
					adjacent = [k - 2, k - 1, k + 3, k + 4 * nx - 2];
					point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
					k++;
				}
			}
	
			//  compass
			var r = 0.3;
			type = 5;
			for (var j = 0; j < ny; j++) {
				for (var i = 0; i < nx; i++) {
					if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
					adjacent = [];
					surround = [];
					point[k] = new Point(point[i + j * nx].x - 0 * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
					k++;
					point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y - 0 * this.size, type, adjacent, surround, use);
					k++;
					point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y + 0 * this.size, type, adjacent, surround, use);
					k++;
					point[k] = new Point(point[i + j * nx].x + 0 * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
					k++;
				}
			}
	
			this.point = point;
		}
	}

	class PenpaPuzzle_Sudoku extends PenpaPuzzle_Square {
		constructor(nx, ny, size) {
			// Board information
			super('sudoku');
			this.gridtype = "sudoku";
			this.nx = nx;
			this.ny = ny;
			this.nx0 = this.nx + 4;
			this.ny0 = this.ny + 4;
			this.margin = -1; //for arrow of number pointing outside of the grid
	
			this.width0 = this.nx + 1;
			this.height0 = this.ny + 1;
			this.width_c = this.width0;
			this.height_c = this.height0;
			this.width = this.width_c;
			this.height = this.height_c;
			// this.canvasx = this.width_c * this.size;
			// this.canvasy = this.height_c * this.size;
			this.sudoku = [
				doc.nb_sudoku1,
				doc.nb_sudoku2,
				doc.nb_sudoku3,
				doc.nb_sudoku4,
			];
			this.space = [
				parseInt(doc.nb_space1),
				parseInt(doc.nb_space2),
				parseInt(doc.nb_space3),
				parseInt(doc.nb_space4),
			];
			this.size = size;
			this.reset();
		}	
	}

	// function draw_circle(ctx, x, y, r) {
    //     // ctx.beginPath();
    //     // ctx.arc(x, y, r * pu.size, 0, Math.PI * 2, false);
    //     // ctx.fill();
    //     // ctx.stroke();
	// 	let opts = ctx.toOpts();
	// 	opts.rounded = true;
	// 	opts.center = [y, x];
	// 	opts.width = 2 * r;
	// 	opts.height = 2 * r;
	// 	puzzleAdd(puzzle, 'overlays', opts);
    // }

	// function draw_polygon(ctx, x, y, r, n, th) {
    //     // ctx.LineCap = "round";
    //     // ctx.beginPath();
    //     // ctx.moveTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
    //     // for (var i = 0; i < n - 1; i++) {
    //     //     th += 360 / n;
    //     //     ctx.lineTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
    //     // }
    //     // ctx.closePath();
    //     // ctx.fill();
    //     // ctx.stroke();
	// 	let opts = ctx.toOpts();
	// 	//opts.rounded = false;
	// 	opts.center = [y, x];
	// 	opts.width = 2 * Math.sqrt(r);
	// 	opts.height = 2 * Math.sqrt(r);
	// 	//if (n !== 4) return;
	// 	if (th !== 45) opts.angle = th - 45;
	// 	puzzleAdd(puzzle, 'overlays', opts);
    // }

	// function draw_symbol(ctx, x, y, num, sym) {
	// 	//FIXME:
	// 	//FIXME:
	// 	//FIXME:
	// 	//FIXME:
	// 	//FIXME:
	// 	return;

    //     switch (sym) {
    //         /* figure */
    //         case "circle_L":
    //             if (num === 0) {
    //                 set_circle_style(ctx, 1);
    //                 draw_circle(ctx, x, y, 0.43);
    //                 draw_circle(ctx, x, y, 0.32);
    //             } else {
    //                 set_circle_style(ctx, num);
    //                 draw_circle(ctx, x, y, 0.43);
    //             }
    //             break;
    //         case "circle_M":
    //             if (num === 0) {
    //                 set_circle_style(ctx, 1);
    //                 draw_circle(ctx, x, y, 0.35);
    //                 draw_circle(ctx, x, y, 0.25);
    //             } else {
    //                 set_circle_style(ctx, num);
    //                 draw_circle(ctx, x, y, 0.35);
    //             }
    //             break;
    //         case "circle_S":
    //             if (num === 0) {
    //                 set_circle_style(ctx, 1);
    //                 draw_circle(ctx, x, y, 0.22);
    //                 draw_circle(ctx, x, y, 0.14);
    //             } else {
    //                 set_circle_style(ctx, num);
    //                 draw_circle(ctx, x, y, 0.22);
    //             }
    //             break;
    //         case "circle_SS":
    //             if (num === 0) {
    //                 set_circle_style(ctx, 1);
    //                 draw_circle(ctx, x, y, 0.13);
    //                 draw_circle(ctx, x, y, 0.07);
    //             } else {
    //                 set_circle_style(ctx, num);
    //                 draw_circle(ctx, x, y, 0.13);
    //             }
    //             break;
    //         case "square_LL":
    //             set_circle_style(ctx, num);
    //             draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, 45);
    //             break;
    //         case "square_L":
    //             set_circle_style(ctx, num);
    //             draw_polygon(ctx, x, y, 0.4 * Math.sqrt(2), 4, 45);
    //             break;
    //         case "square_M":
    //             set_circle_style(ctx, num);
    //             draw_polygon(ctx, x, y, 0.35 * Math.sqrt(2), 4, 45);
    //             break;
    //         case "square_S":
    //             set_circle_style(ctx, num);
    //             draw_polygon(ctx, x, y, 0.22 * Math.sqrt(2), 4, 45);
    //             break;
    //         case "square_SS":
    //             set_circle_style(ctx, num);
    //             draw_polygon(ctx, x, y, 0.13 * Math.sqrt(2), 4, 45);
    //             break;
	// 	}

	// }

