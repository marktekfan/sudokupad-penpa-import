
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

	class Stack {
		constructor() {}
	}
	class PenpaPuzzle {
		constructor(gridtype) {
			this.gridtype = gridtype;	
			// this.resol = 2.5; //window.devicePixelRatio || 1;
			this.canvasx = 0; //predefine
			this.canvasy = 0; //predefine
			this.center_n = 0;
			this.center_n0 = 0;
			this.margin = 6;
	
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
				"qa": "pu_q",
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
			let pu_qa = ["pu_q", "pu_a"],
				pu_qa_col = ["pu_q_col", "pu_a_col"];
	
			// Object and Array initialization
			for (var i of pu_qa) {
				this[i] = {};
				// this[i].command_redo = new Stack();
				// this[i].command_undo = new Stack();
				// this[i].command_replay = new Stack();
				this[i].surface = {};
				this[i].number = {};
				this[i].numberS = {};
				this[i].symbol = {};
				this[i].freeline = {};
				this[i].freelineE = {};
				this[i].thermo = [];
				this[i].arrows = [];
				this[i].direction = [];
				this[i].squareframe = [];
				this[i].polygon = [];
				this[i].line = {};
				this[i].lineE = {};
				this[i].wall = {};
				this[i].cage = {};
				this[i].deletelineE = {};
				this[i].killercages = [];
				this[i].nobulbthermo = [];
			}
	
			// Object and Array initialization for custom colors
			for (var i of pu_qa_col) {
				this[i] = {};
				// this[i].command_redo = new Stack();
				// this[i].command_undo = new Stack();
				// this[i].command_replay = new Stack();
				this[i].surface = {};
				this[i].number = {};
				this[i].numberS = {};
				this[i].symbol = {};
				this[i].freeline = {};
				this[i].freelineE = {};
				this[i].thermo = [];
				this[i].arrows = [];
				this[i].direction = [];
				this[i].squareframe = [];
				this[i].polygon = [];
				this[i].line = {};
				this[i].lineE = {};
				this[i].wall = {};
				this[i].cage = {};
				this[i].deletelineE = {};
				this[i].killercages = [];
				this[i].nobulbthermo = [];
			}
	
			// this.frame = {};
			// this.freelinecircle_g = [-1, -1];
			this.point = [];
		}

		reset_frame(){
			this.create_point();
			this.space = [//ML
				parseInt(PenpaPuzzle.document.getElementById("nb_space1").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space2").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space3").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space4").value)
			];
	
			this.centerlist = []
			// for (var j = 2; j < this.ny0 - 2; j++) {
			// 	for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
			// 		this.centerlist.push(i + j * (this.nx0));
			// 	}
			// }
			// this.search_center();
			// this.center_n0 = this.center_n;
			// this.canvasxy_update();
			// this.canvas_size_setting();
			// this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
	
			this.centerlist = [] //reset centerlist to match the margins
			for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
				for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
					this.centerlist.push(i + j * (this.nx0));
				}
			}
	
			this.make_frameline();
			// this.cursol = this.centerlist[0];
			// this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
		}
		mode_grid(mode) {
			if (mode.slice(0, -1) === "nb_grid") {
				this.mode.grid[0] = mode.slice(-1);
			} else if (mode.slice(0, -1) === "nb_lat") {
				this.mode.grid[1] = mode.slice(-1);
			} else if (mode.slice(0, -1) === "nb_out") {
				this.mode.grid[2] = mode.slice(-1);
			}		}
		draw_panel(){}
		mode_set(v){}
		mode_qa(mode){this.mode.qa = mode;}
		subcombimode(v){}
		redraw(){}
		make_frameline() {}
		submode_check(v) {}
		search_center() {}
		canvasxy_update() {}
		canvas_size_setting() {}
		point_move(){}
		record(){}
		subsymbolmode(mode) {}
		
		//ML FIXME: not yet implemented. used by 
		// resize_top(sign, celltype = 'black') {}
		// resize_right(sign, celltype = 'black') {}
		// resize_bottom(sign, celltype = 'black') {}
		// resize_left(sign, celltype = 'black') {}
		resize_top(sign, celltype = 'black') {
			// reset the selection while resizing the grid
			this.selection = [];
	
			sign = parseInt(sign);
			// if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
				let originalspace = [...this.space];
				if (celltype === 'white') {
					// Over, under, left, right
					if (sign === 1) {
						this.space[0] = this.space[0] + 1;
					} else {
						if (this.space[0] > 0) {
							this.space[0] = this.space[0] - 1;
						}
					}
				}
				if (!this.originalnx) {
					this.originalnx = this.nx;
				}
				if (!this.originalny) {
					this.originalny = this.ny;
				}
				let originalnx0 = this.nx0;
				let originalny0 = this.ny0;
	
				// this.nx = nx; // Columns
				this.ny = this.ny + (1 * sign); // Rows, Adding/Subtracting 1 row
				// this.nx0 = this.nx + 4;
				this.ny0 = this.ny + 4;
				// this.width0 = this.nx + 1;
				this.height0 = this.ny + 1;
				// this.width_c = this.width0;
				this.height_c = this.height0;
				// this.width = this.width_c;
				this.height = this.height_c;
				// this.canvasx = this.width_c * this.size;
				this.canvasy = this.height_c * this.size;
	
				// Find the missing boxes
				var old_centerlist = this.centerlist;
				var old_idealcenterlist = []; // If no box was missing
				for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
					// the top and left edges are unused
					for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) {
						old_idealcenterlist.push(i + j * (originalnx0));
					}
				}
				var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);
	
				this.create_point();
				this.centerlist = []
				for (var j = 2; j < this.ny0 - 2; j++) {
					for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
				this.search_center();
				this.center_n0 = this.center_n;
				this.canvasxy_update();
				this.canvas_size_setting();
				this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
				if (this.reflect[0] === -1) {
					this.point_reflect_LR();
				}
				if (this.reflect[1] === -1) {
					this.point_reflect_UD();
				}
				this.centerlist = [] //reset centerlist to match the margins
				for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
					for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
	
				// Remove Box elements
				if (boxremove) {
					for (let n = 0; n < boxremove.length; n++) {
						let num = boxremove[n];
						let m = num + parseInt(originalnx0) * sign;
						let index = this.centerlist.indexOf(m);
						if (index !== -1) {
							this.centerlist.splice(index, 1);
						}
					}
				}
	
				this.make_frameline();
				this.cursol = this.centerlist[0];
				this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
				let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
	
				for (var i of pu_qa) {
					this[i].command_redo = new Stack();
					this[i].command_undo = new Stack();
					this[i].command_replay = new Stack();
	
					// shift Surface elements to next row
					if (this[i].surface) {
						let temp = this[i].surface;
						this[i].surface = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let m = parseInt(keys[k]) + parseInt(originalnx0) * sign;
							this.record("surface", m);
							this[i].surface[m] = temp[keys[k]];
						}
					}
	
					// shift Number elements to next row
					if (this[i].number) {
						let temp = this[i].number;
						this[i].number = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							let m = parseInt(keys[k]) + (factor + 1) * parseInt(originalnx0) * sign;
							this.record("number", m);
							this[i].number[m] = temp[keys[k]];
						}
					}
	
					// shift Number elements to next row
					if (this[i].numberS) {
						let m;
						let temp = this[i].numberS;
						this[i].numberS = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							if (factor >= 8) {
								m = parseInt(keys[k]) + 12 * parseInt(originalnx0) * sign;
							} else {
								m = parseInt(keys[k]) + 8 * parseInt(originalnx0) * sign;
							}
							this.record("numberS", m);
							this[i].numberS[m] = temp[keys[k]];
						}
					}
	
					// shift Symbol elements to next row
					if (this[i].symbol) {
						let m;
						let temp = this[i].symbol;
						this[i].symbol = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							m = parseInt(keys[k]) + (factor + 1) * parseInt(originalnx0) * sign;
							this.record("symbol", m);
							this[i].symbol[m] = temp[keys[k]];
						}
					}
	
					// shift Line elements to next row
					if (this[i].line) {
						let m;
						let temp = this[i].line;
						this[i].line = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + (factor + 1) * parseInt(originalnx0) * sign;
								this.record("line", m);
								this[i].line[m] = temp[k];
							} else {
								let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
								var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
								var k2 = parseInt(k.split(",")[1]) + (factor + 1) * parseInt(originalnx0) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("line", key);
								this[i].line[key] = temp[k];
							}
						}
					}
	
					// shift Edge elements to next row
					if (this[i].lineE) {
						let m;
						let temp = this[i].lineE;
						this[i].lineE = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + (factor + 1) * parseInt(originalnx0) * sign;
								this.record("lineE", m);
								this[i].lineE[m] = temp[k];
							} else {
								var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
								var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("lineE", key);
								this[i].lineE[key] = temp[k];
							}
						}
					}
	
	
					// shift DeleteEdge elements to next row            
					if (this[i].deletelineE) {
						let temp = this[i].deletelineE;
						this[i].deletelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("deletelineE", key);
							this[i].deletelineE[key] = temp[k];
						}
					}
	
					// shift FreeLine elements to next row
					if (this[i].freeline) {
						let temp = this[i].freeline;
						this[i].freeline = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freeline", key);
							this[i].freeline[key] = temp[k];
						}
					}
	
					// shift FreeEdge elements to next row
					if (this[i].freelineE) {
						let temp = this[i].freelineE;
						this[i].freelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freelineE", key);
							this[i].freelineE[key] = temp[k];
						}
					}
	
					// shift Thermo elements to next row
					if (this[i].thermo) {
						let temp = this[i].thermo;
						this[i].thermo = {};
						this[i].thermo = new Array(temp.length);
						for (var k in temp) {
							this.record("thermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].thermo[k] = temp[k];
						}
					}
	
					// shift No Bulb Thermo elements to next row
					if (this[i].nobulbthermo) {
						let temp = this[i].nobulbthermo;
						this[i].nobulbthermo = {};
						this[i].nobulbthermo = new Array(temp.length);
						for (var k in temp) {
							this.record("nobulbthermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].nobulbthermo[k] = temp[k];
						}
					}
	
					// shift Arrow elements to next row
					if (this[i].arrows) {
						let temp = this[i].arrows;
						this[i].arrows = {};
						this[i].arrows = new Array(temp.length);
						for (var k in temp) {
							this.record("arrows", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].arrows[k] = temp[k];
						}
					}
	
					// shift Direction elements to next row
					if (this[i].direction) {
						let temp = this[i].direction;
						this[i].direction = {};
						this[i].direction = new Array(temp.length);
						for (var k in temp) {
							this.record("direction", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].direction[k] = temp[k];
						}
					}
	
					// shift RectangleFrame elements to next row
					if (this[i].squareframe) {
						let temp = this[i].squareframe;
						this[i].squareframe = {};
						this[i].squareframe = new Array(temp.length);
						for (var k in temp) {
							this.record("squareframe", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].squareframe[k] = temp[k];
						}
					}
	
					// shift Wall elements to next row
					if (this[i].wall) {
						let temp = this[i].wall;
						this[i].wall = {};
						for (var k in temp) {
							let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
							var k1 = parseInt(k.split(",")[0]) + (factor + 1) * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + (factor + 1) * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("wall", key);
							this[i].wall[key] = temp[k];
						}
					}
	
					// shift Cage elements to next row
					if (this[i].cage) {
						let temp = this[i].cage;
						this[i].cage = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + 8 * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + 8 * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("cage", key);
							this[i].cage[key] = temp[k];
						}
					}
	
					// shift Killer Cages to next row
					if (this[i].killercages) {
						let temp = this[i].killercages;
						this[i].killercages = {};
						this[i].killercages = new Array(temp.length);
						for (var k in temp) {
							this.record("killercages", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].killercages[k] = temp[k];
						}
					}
	
					// shift Polygon elements to next row
					if (this[i].polygon) {
						let temp = this[i].polygon;
						this[i].polygon = {};
						this[i].polygon = new Array(temp.length);
						for (var k in temp) {
							this.record("polygon", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + 2 * parseInt(originalnx0) * sign;
							}
							this[i].polygon[k] = temp[k];
						}
					}
				}
				this.redraw();
			// } else {
			// 	if (sign === 1) {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	} else {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Min row size reached <h2 class="warn">1</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	}
			// }
		}
	
		resize_bottom(sign, celltype = 'black') {
			// reset the selection while resizing the grid
			this.selection = [];
	
			sign = parseInt(sign);
			// if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
				let originalspace = [...this.space];
				if (celltype === 'white') {
					// Over, under, left, right
					if (sign === 1) {
						this.space[1] = this.space[1] + 1;
					} else {
						if (this.space[1] > 0) {
							this.space[1] = this.space[1] - 1;
						}
					}
				}
				if (!this.originalnx) {
					this.originalnx = this.nx;
				}
				if (!this.originalny) {
					this.originalny = this.ny;
				}
				let originalnx0 = this.nx0;
				let originalny0 = this.ny0;
	
				// this.nx = nx; // Columns
				this.ny = this.ny + (1 * sign); // Rows, Adding/Removing 1 row
				// this.nx0 = this.nx + 4;
				this.ny0 = this.ny + 4;
				// this.width0 = this.nx + 1;
				this.height0 = this.ny + 1;
				// this.width_c = this.width0;
				this.height_c = this.height0;
				// this.width = this.width_c;
				this.height = this.height_c;
				// this.canvasx = this.width_c * this.size;
				this.canvasy = this.height_c * this.size;
	
				// Find the missing boxes
				var old_centerlist = this.centerlist;
				var old_idealcenterlist = []; // If no box was missing
				for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
					for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
						old_idealcenterlist.push(i + j * (originalnx0));
					}
				}
				var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);
				this.create_point();
				this.centerlist = []
				for (var j = 2; j < this.ny0 - 2; j++) {
					for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
				this.search_center();
				this.center_n0 = this.center_n;
				this.canvasxy_update();
				this.canvas_size_setting();
				this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
				if (this.reflect[0] === -1) {
					this.point_reflect_LR();
				}
				if (this.reflect[1] === -1) {
					this.point_reflect_UD();
				}
				this.centerlist = [] //reset centerlist to match the margins
				for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
					for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
	
				// Remove Box elements
				if (boxremove) {
					for (let n = 0; n < boxremove.length; n++) {
						let num = boxremove[n];
						let index = this.centerlist.indexOf(num);
						if (index !== -1) {
							this.centerlist.splice(index, 1);
						}
					}
				}
	
				this.make_frameline();
				this.cursol = this.centerlist[0];
				this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
				let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
	
				for (var i of pu_qa) {
					this[i].command_redo = new Stack();
					this[i].command_undo = new Stack();
					this[i].command_replay = new Stack();
	
					// shift Number elements to next row
					if (this[i].number) {
						let temp = this[i].number;
						this[i].number = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							let m = parseInt(keys[k]) + factor * parseInt(originalnx0) * sign;
							this.record("number", m);
							this[i].number[m] = temp[keys[k]];
						}
					}
	
					// Maintain NumberS elements to be in the same row
					if (this[i].numberS) {
						let m;
						let temp = this[i].numberS;
						this[i].numberS = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							if (factor >= 8) {
								m = parseInt(keys[k]) + 8 * parseInt(originalnx0) * sign;
							} else {
								m = parseInt(keys[k]) + 4 * parseInt(originalnx0) * sign;
							}
							this.record("numberS", m);
							this[i].numberS[m] = temp[keys[k]];
						}
					}
	
					// Maintain Symbol elements to be in the same row
					if (this[i].symbol) {
						let m;
						let temp = this[i].symbol;
						this[i].symbol = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							m = parseInt(keys[k]) + factor * parseInt(originalnx0) * sign;
							this.record("symbol", m);
							this[i].symbol[m] = temp[keys[k]];
						}
					}
	
					// Maintain cross elements to be in the same row
					if (this[i].line) {
						let m;
						let temp = this[i].line;
						this[i].line = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + (factor * parseInt(originalnx0)) * sign;
								this.record("line", m);
								this[i].line[m] = temp[k];
							} else {
								let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
								var k1 = parseInt(k.split(",")[0]);
								var k2 = parseInt(k.split(",")[1]) + factor * parseInt(originalnx0) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("line", key);
								this[i].line[key] = temp[k];
							}
						}
					}
	
					// Maintain Edge elements in the same row
					if (this[i].lineE) {
						let m;
						let temp = this[i].lineE;
						this[i].lineE = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + (factor * parseInt(originalnx0)) * sign;
								this.record("lineE", m);
								this[i].lineE[m] = temp[k];
							} else {
								var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
								var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("lineE", key);
								this[i].lineE[key] = temp[k];
							}
						}
					}
	
					// Maintain DeleteEdge elements in the same row     
					if (this[i].deletelineE) {
						let m;
						let temp = this[i].deletelineE;
						this[i].deletelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("deletelineE", key);
							this[i].deletelineE[key] = temp[k];
						}
					}
	
					// Maintain FreeEdge elements in the same place
					if (this[i].freelineE) {
						let m;
						let temp = this[i].freelineE;
						this[i].freelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freelineE", key);
							this[i].freelineE[key] = temp[k];
						}
					}
	
					// Maintain Wall elements in the same row
					if (this[i].wall) {
						let temp = this[i].wall;
						this[i].wall = {};
						for (var k in temp) {
							let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
							var k1 = parseInt(k.split(",")[0]) + factor * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + factor * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("wall", key);
							this[i].wall[key] = temp[k];
						}
					}
	
					// Maintain Cage elements in the same row
					if (this[i].cage) {
						let temp = this[i].cage;
						this[i].cage = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + 4 * parseInt(originalnx0) * sign;
							var k2 = parseInt(k.split(",")[1]) + 4 * parseInt(originalnx0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("cage", key);
							this[i].cage[key] = temp[k];
						}
					}
	
					// Maintain Polygon elements in the same row
					if (this[i].polygon) {
						let temp = this[i].polygon;
						this[i].polygon = {};
						this[i].polygon = new Array(temp.length);
						for (var k in temp) {
							this.record("polygon", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
							}
							this[i].polygon[k] = temp[k];
						}
					}
				}
				this.redraw();
			// } else {
			// 	if (sign === 1) {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	} else {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Min row size reached <h2 class="warn">1</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	}
			// }
		}
	
		resize_left(sign, celltype = 'black') {
			// reset the selection while resizing the grid
			this.selection = [];
	
			sign = parseInt(sign);
			// if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
				let originalspace = [...this.space];
				if (celltype === 'white') {
					// Over, under, left, right
					if (sign === 1) {
						this.space[2] = this.space[2] + 1;
					} else {
						if (this.space[2] > 0) {
							this.space[2] = this.space[2] - 1;
						}
					}
				}
				if (!this.originalnx) {
					this.originalnx = this.nx;
				}
				if (!this.originalny) {
					this.originalny = this.ny;
				}
				let originalnx0 = this.nx0;
				let originalny0 = this.ny0;
	
				this.nx = this.nx + (1 * sign); // Columns, Adding/Removing 1 column
				// this.ny = this.ny; // Rows
				this.nx0 = this.nx + 4;
				// this.ny0 = this.ny + 4;
				this.width0 = this.nx + 1;
				// this.height0 = this.ny + 1;
				this.width_c = this.width0;
				// this.height_c = this.height0;
				this.width = this.width_c;
				// this.height = this.height_c;
				this.canvasx = this.width_c * this.size;
				// this.canvasy = this.height_c * this.size;
	
				// Find the missing boxes
				var old_centerlist = this.centerlist;
				var old_idealcenterlist = []; // If no box was missing
				for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
					for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
						old_idealcenterlist.push(i + j * (originalnx0));
					}
				}
				var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);
	
				this.create_point();
				this.centerlist = []
				for (var j = 2; j < this.ny0 - 2; j++) {
					for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
				this.search_center();
				this.center_n0 = this.center_n;
				this.canvasxy_update();
				this.canvas_size_setting();
				this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
				if (this.reflect[0] === -1) {
					this.point_reflect_LR();
				}
				if (this.reflect[1] === -1) {
					this.point_reflect_UD();
				}
				this.centerlist = [] //reset centerlist to match the margins
				for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
					for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
	
				// Remove Box elements
				if (boxremove) {
					for (let n = 0; n < boxremove.length; n++) {
						let num = boxremove[n];
						let m = num + ((parseInt(num / originalnx0) - 2) + 3) * sign;
						let index = this.centerlist.indexOf(m);
						if (index !== -1) {
							this.centerlist.splice(index, 1);
						}
					}
				}
	
				this.make_frameline();
				this.cursol = this.centerlist[0];
				this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
				let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
	
				for (var i of pu_qa) {
					this[i].command_redo = new Stack();
					this[i].command_undo = new Stack();
					this[i].command_replay = new Stack();
	
					// shift Surface elements to next column
					if (this[i].surface) {
						let temp = this[i].surface;
						this[i].surface = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let m = parseInt(keys[k]) + ((parseInt(parseInt(keys[k]) / originalnx0) - 2) + 3) * sign;
							this.record("surface", m);
							this[i].surface[m] = temp[keys[k]];
						}
					}
	
					// shift Number elements to next column
					if (this[i].number) {
						let temp = this[i].number;
						this[i].number = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
							let m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
							this.record("number", m);
							this[i].number[m] = temp[keys[k]];
						}
					}
	
					// shift NumberS elements to next column
					if (this[i].numberS) {
						let temp = this[i].numberS;
						this[i].numberS = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let normal_cursor = parseInt(keys[k] / 4) - (originalnx0 * originalny0);
							let m = parseInt(keys[k]) + (4 * (parseInt(normal_cursor / originalnx0) + originalny0) + 4) * sign;
							this.record("numberS", m);
							this[i].numberS[m] = temp[keys[k]];
						}
					}
	
					// shift Symbol elements to next column
					if (this[i].symbol) {
						let m;
						let temp = this[i].symbol;
						this[i].symbol = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
							m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
							this.record("symbol", m);
							this[i].symbol[m] = temp[keys[k]];
						}
					}
	
					// shift Line elements to next column
					if (this[i].line) {
						let m;
						let temp = this[i].line;
						this[i].line = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
								this.record("line", m);
								this[i].line[m] = temp[k];
							} else {
								let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
								var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 3) * sign;
								if (factor == 0) {
									var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 3) * sign;
								} else {
									var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
								}
								var key = (k1.toString() + "," + k2.toString());
								this.record("line", key);
								this[i].line[key] = temp[k];
							}
						}
					}
	
					// shift Edge elements to next column
					if (this[i].lineE) {
						let m;
						let temp = this[i].lineE;
						this[i].lineE = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
								this.record("lineE", m);
								this[i].lineE[m] = temp[k];
							} else {
								var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
								var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("lineE", key);
								this[i].lineE[key] = temp[k];
							}
						}
					}
	
					// shift DeleteEdge elements to next column           
					if (this[i].deletelineE) {
						let temp = this[i].deletelineE;
						this[i].deletelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
							var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("deletelineE", key);
							this[i].deletelineE[key] = temp[k];
						}
					}
	
					// shift FreeLine elements to next column
					if (this[i].freeline) {
						let temp = this[i].freeline;
						this[i].freeline = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 3) * sign;
							var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 3) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freeline", key);
							this[i].freeline[key] = temp[k];
						}
					}
	
					// shift FreeEdge elements to next column
					if (this[i].freelineE) {
						let temp = this[i].freelineE;
						this[i].freelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
							var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freelineE", key);
							this[i].freelineE[key] = temp[k];
						}
					}
	
					// shift Thermo elements to next column
					if (this[i].thermo) {
						let temp = this[i].thermo;
						this[i].thermo = {};
						this[i].thermo = new Array(temp.length);
						for (var k in temp) {
							this.record("thermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].thermo[k] = temp[k];
						}
					}
	
					// shift No Bulb Thermo elements to next column
					if (this[i].nobulbthermo) {
						let temp = this[i].nobulbthermo;
						this[i].nobulbthermo = {};
						this[i].nobulbthermo = new Array(temp.length);
						for (var k in temp) {
							this.record("nobulbthermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].nobulbthermo[k] = temp[k];
						}
					}
	
					// shift Arrow elements to next column
					if (this[i].arrows) {
						let temp = this[i].arrows;
						this[i].arrows = {};
						this[i].arrows = new Array(temp.length);
						for (var k in temp) {
							this.record("arrows", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].arrows[k] = temp[k];
						}
					}
	
					// shift Direction elements to next column
					if (this[i].direction) {
						let temp = this[i].direction;
						this[i].direction = {};
						this[i].direction = new Array(temp.length);
						for (var k in temp) {
							this.record("direction", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].direction[k] = temp[k];
						}
					}
	
					// shift RectangleFrame elements to next column
					if (this[i].squareframe) {
						let temp = this[i].squareframe;
						this[i].squareframe = {};
						this[i].squareframe = new Array(temp.length);
						for (var k in temp) {
							this.record("squareframe", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].squareframe[k] = temp[k];
						}
					}
	
					// shift Wall elements to next column
					if (this[i].wall) {
						let temp = this[i].wall;
						this[i].wall = {};
						for (var k in temp) {
							let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
							var k1 = parseInt(k.split(",")[0]) + ((parseInt((parseInt(k.split(",")[0]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
							var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("wall", key);
							this[i].wall[key] = temp[k];
						}
					}
	
					// shift Cage elements to next column
					if (this[i].cage) {
						let temp = this[i].cage;
						this[i].cage = {};
						for (var k in temp) {
							let normal_cursor1 = parseInt(parseInt(k.split(",")[0]) / 4) - (originalnx0 * originalny0);
							let normal_cursor2 = parseInt(parseInt(k.split(",")[1]) / 4) - (originalnx0 * originalny0);
							var k1 = parseInt(k.split(",")[0]) + (4 * (parseInt(normal_cursor1 / originalnx0) + originalny0) + 4) * sign;
							var k2 = parseInt(k.split(",")[1]) + (4 * (parseInt(normal_cursor2 / originalnx0) + originalny0) + 4) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("cage", key);
							this[i].cage[key] = temp[k];
						}
					}
	
					// shift Killer cages to next column
					if (this[i].killercages) {
						let temp = this[i].killercages;
						this[i].killercages = {};
						this[i].killercages = new Array(temp.length);
						for (var k in temp) {
							this.record("killercages", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
							}
							this[i].killercages[k] = temp[k];
						}
					}
	
	
					// shift Polygon elements to next column
					if (this[i].polygon) {
						let temp = this[i].polygon;
						this[i].polygon = {};
						this[i].polygon = new Array(temp.length);
						for (var k in temp) {
							this.record("polygon", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + (parseInt((parseInt(temp[k][m]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
							}
							this[i].polygon[k] = temp[k];
						}
					}
				}
				this.redraw();
			// } else {
			// 	if (sign === 1) {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	} else {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Min column size reached <h2 class="warn">1</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	}
			// }
		}
	
		resize_right(sign, celltype = 'black') {
			// reset the selection while resizing the grid
			this.selection = [];
	
			sign = parseInt(sign);
			// if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
				let originalspace = [...this.space];
				if (celltype === 'white') {
					// Over, under, left, right
					if (sign === 1) {
						this.space[3] = this.space[3] + 1;
					} else {
						if (this.space[3] > 0) {
							this.space[3] = this.space[3] - 1;
						}
					}
				}
				if (!this.originalnx) {
					this.originalnx = this.nx;
				}
				if (!this.originalny) {
					this.originalny = this.ny;
				}
				let originalnx0 = this.nx0;
				let originalny0 = this.ny0;
	
				this.nx = this.nx + (1 * sign); // Columns, Adding/Removing 1 column
				// this.ny = this.ny; // Rows
				this.nx0 = this.nx + 4;
				// this.ny0 = this.ny + 4;
				this.width0 = this.nx + 1;
				// this.height0 = this.ny + 1;
				this.width_c = this.width0;
				// this.height_c = this.height0;
				this.width = this.width_c;
				// this.height = this.height_c;
				this.canvasx = this.width_c * this.size;
				// this.canvasy = this.height_c * this.size;
	
				// Find the missing boxes
				var old_centerlist = this.centerlist;
				var old_idealcenterlist = []; // If no box was missing
				for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
					for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
						old_idealcenterlist.push(i + j * (originalnx0));
					}
				}
				var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);
	
				this.create_point();
				this.centerlist = []
				for (var j = 2; j < this.ny0 - 2; j++) {
					for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
				this.search_center();
				this.center_n0 = this.center_n;
				this.canvasxy_update();
				this.canvas_size_setting();
				this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
				if (this.reflect[0] === -1) {
					this.point_reflect_LR();
				}
				if (this.reflect[1] === -1) {
					this.point_reflect_UD();
				}
				this.centerlist = [] //reset centerlist to match the margins
				for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
					for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
						this.centerlist.push(i + j * (this.nx0));
					}
				}
	
				// Remove Box elements
				if (boxremove) {
					for (let n = 0; n < boxremove.length; n++) {
						let num = boxremove[n];
						let m = num + ((parseInt(num / originalnx0) - 2) + 2) * sign;
						let index = this.centerlist.indexOf(m);
						if (index !== -1) {
							this.centerlist.splice(index, 1);
						}
					}
				}
	
				this.make_frameline();
				this.cursol = this.centerlist[0];
				this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
				let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
	
				for (var i of pu_qa) {
					this[i].command_redo = new Stack();
					this[i].command_undo = new Stack();
					this[i].command_replay = new Stack();
	
					// Maintain Surface elements in the same column
					if (this[i].surface) {
						let temp = this[i].surface;
						this[i].surface = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let m = parseInt(keys[k]) + ((parseInt(parseInt(keys[k]) / originalnx0) - 2) + 2) * sign;
							this.record("surface", m);
							this[i].surface[m] = temp[keys[k]];
						}
					}
	
					// Maintain Number elements in the same column
					if (this[i].number) {
						let temp = this[i].number;
						this[i].number = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
							let m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
							this.record("number", m);
							this[i].number[m] = temp[keys[k]];
						}
					}
	
					// Maintain NumberS elements in the same column
					if (this[i].numberS) {
						let temp = this[i].numberS;
						this[i].numberS = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let normal_cursor = parseInt(keys[k] / 4) - (originalnx0 * originalny0);
							let m = parseInt(keys[k]) + (4 * (parseInt(normal_cursor / originalnx0) + originalny0)) * sign;
							this.record("numberS", m);
							this[i].numberS[m] = temp[keys[k]];
						}
					}
	
					// Maintain Symbol elements in the same column
					if (this[i].symbol) {
						let m;
						let temp = this[i].symbol;
						this[i].symbol = {};
						let keys = Object.keys(temp);
						for (var k = 0; k < keys.length; k++) {
							let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
							m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
							this.record("symbol", m);
							this[i].symbol[m] = temp[keys[k]];
						}
					}
	
					// Maintain Line elements in the same column
					if (this[i].line) {
						let m;
						let temp = this[i].line;
						this[i].line = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
								this.record("line", m);
								this[i].line[m] = temp[k];
							} else {
								let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
								var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 2) * sign;
								if (factor == 0) {
									var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 2) * sign;
								} else {
									var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
								}
								var key = (k1.toString() + "," + k2.toString());
								this.record("line", key);
								this[i].line[key] = temp[k];
							}
						}
					}
	
					// Maintain Edge elements in the same column
					if (this[i].lineE) {
						let m;
						let temp = this[i].lineE;
						this[i].lineE = {};
						for (var k in temp) {
							if (temp[k] === 98) {
								let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
								m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
								this.record("lineE", m);
								this[i].lineE[m] = temp[k];
							} else {
								var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
								var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
								var key = (k1.toString() + "," + k2.toString());
								this.record("lineE", key);
								this[i].lineE[key] = temp[k];
							}
						}
					}
	
					// Maintain DeleteEdge elements in the same column           
					if (this[i].deletelineE) {
						let temp = this[i].deletelineE;
						this[i].deletelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
							var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("deletelineE", key);
							this[i].deletelineE[key] = temp[k];
						}
					}
	
					// Maintain FreeLine elements in the same column
					if (this[i].freeline) {
						let temp = this[i].freeline;
						this[i].freeline = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 2) * sign;
							var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 2) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freeline", key);
							this[i].freeline[key] = temp[k];
						}
					}
	
					// Maintain FreeEdge elements in the same column
					if (this[i].freelineE) {
						let temp = this[i].freelineE;
						this[i].freelineE = {};
						for (var k in temp) {
							var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
							var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("freelineE", key);
							this[i].freelineE[key] = temp[k];
						}
					}
	
					// Maintain Thermo elements in the same column
					if (this[i].thermo) {
						let temp = this[i].thermo;
						this[i].thermo = {};
						this[i].thermo = new Array(temp.length);
						for (var k in temp) {
							this.record("thermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].thermo[k] = temp[k];
						}
					}
	
					// Maintain No Bulb Thermo elements in the same column
					if (this[i].nobulbthermo) {
						let temp = this[i].nobulbthermo;
						this[i].nobulbthermo = {};
						this[i].nobulbthermo = new Array(temp.length);
						for (var k in temp) {
							this.record("nobulbthermo", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].nobulbthermo[k] = temp[k];
						}
					}
	
					// Maintain Arrow elements in the same column
					if (this[i].arrows) {
						let temp = this[i].arrows;
						this[i].arrows = {};
						this[i].arrows = new Array(temp.length);
						for (var k in temp) {
							this.record("arrows", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].arrows[k] = temp[k];
						}
					}
	
					// Maintain Direction elements in the same column
					if (this[i].direction) {
						let temp = this[i].direction;
						this[i].direction = {};
						this[i].direction = new Array(temp.length);
						for (var k in temp) {
							this.record("direction", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].direction[k] = temp[k];
						}
					}
	
					// Maintain RectangleFrame elements in the same column
					if (this[i].squareframe) {
						let temp = this[i].squareframe;
						this[i].squareframe = {};
						this[i].squareframe = new Array(temp.length);
						for (var k in temp) {
							this.record("squareframe", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].squareframe[k] = temp[k];
						}
					}
	
					// Maintain Wall elements in the same column
					if (this[i].wall) {
						let temp = this[i].wall;
						this[i].wall = {};
						for (var k in temp) {
							let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
							var k1 = parseInt(k.split(",")[0]) + ((parseInt((parseInt(k.split(",")[0]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
							var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("wall", key);
							this[i].wall[key] = temp[k];
						}
					}
	
					// Maintain Cage elements in the same column
					if (this[i].cage) {
						let temp = this[i].cage;
						this[i].cage = {};
						for (var k in temp) {
							let normal_cursor1 = parseInt(parseInt(k.split(",")[0]) / 4) - (originalnx0 * originalny0);
							let normal_cursor2 = parseInt(parseInt(k.split(",")[1]) / 4) - (originalnx0 * originalny0);
							var k1 = parseInt(k.split(",")[0]) + (4 * (parseInt(normal_cursor1 / originalnx0) + originalny0)) * sign;
							var k2 = parseInt(k.split(",")[1]) + (4 * (parseInt(normal_cursor2 / originalnx0) + originalny0)) * sign;
							var key = (k1.toString() + "," + k2.toString());
							this.record("cage", key);
							this[i].cage[key] = temp[k];
						}
					}
	
					// Maintain Killer Cages in the same column
					if (this[i].killercages) {
						let temp = this[i].killercages;
						this[i].killercages = {};
						this[i].killercages = new Array(temp.length);
						for (var k in temp) {
							this.record("killercages", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
							}
							this[i].killercages[k] = temp[k];
						}
					}
	
					// Maintain Polygon elements in the same column
					if (this[i].polygon) {
						let temp = this[i].polygon;
						this[i].polygon = {};
						this[i].polygon = new Array(temp.length);
						for (var k in temp) {
							this.record("polygon", k);
							for (var m = 0; m <= (temp[k].length - 1); m++) {
								temp[k][m] = parseInt(temp[k][m]) + (parseInt((parseInt(temp[k][m]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
							}
							this[i].polygon[k] = temp[k];
						}
					}
				}
				this.redraw();
			// } else {
			// 	if (sign === 1) {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	} else {
			// 		Swal.fire({
			// 			title: 'Swaroop says:',
			// 			html: 'Min column size reached <h2 class="warn">1</h2>',
			// 			icon: 'error',
			// 			confirmButtonText: 'ok 🙂',
			// 		})
			// 	}
			// }
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
			this.space = [//ML
				parseInt(PenpaPuzzle.document.getElementById("nb_space1").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space2").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space3").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space4").value)
			];
			this.size = 1;
			this._size = size;
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

		draw_sudokugrid(rows, cols, start, end, linestyle) {
			let x, y, key;
			for (var j = 0; j < cols.length; j++) { //  column
				for (var i = start; i <= end; i++) { // row
					x = this.nx0 * i + cols[j] + this.nx0 * this.nx0;
					y = this.nx0 * (i + 1) + cols[j] + this.nx0 * this.nx0;
					key = x.toString() + "," + y.toString();
					this["pu_q"]["lineE"][key] = linestyle;
				}
			}
			for (var j = 0; j < rows.length; j++) { //  row
				for (var i = start; i <= end; i++) { // column
					x = this.nx0 * rows[j] + i + this.nx0 * this.nx0;
					y = this.nx0 * rows[j] + i + 1 + this.nx0 * this.nx0;
					key = x.toString() + "," + y.toString();
					this["pu_q"]["lineE"][key] = linestyle;
				}
			}
		}
		draw_kakurogrid() {
			let rows = this.ny;
			let cols = this.nx;
	
			// R1C1 as black
			let i = 0,
				j = 0;
			this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [2, "kakuro", 2];
	
			// Row 1 Blacks
			for (i = 1; i < cols; i++) { // column
				this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [1, "kakuro", 2];
			}
	
			// Col 1 Blacks
			i = 0;
			for (j = 1; j < rows; j++) { // column
				this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [1, "kakuro", 2];
			}
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
			this.space = [//ML
				parseInt(PenpaPuzzle.document.getElementById("nb_sudoku1").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_sudoku2").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_sudoku3").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_sudoku4").value)
			];
			this.space = [//ML
				parseInt(PenpaPuzzle.document.getElementById("nb_space1").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space2").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space3").value),
				parseInt(PenpaPuzzle.document.getElementById("nb_space4").value)
			];
			this.size = 1;
			this._size = size;
			this.reset();
		}	
	}

	class Puzzle_square extends PenpaPuzzle_Square {
		constructor(nx, ny, size) {
			super(nx, ny, size);
		}
	}

	class Puzzle_kakuro extends PenpaPuzzle_Square {
		constructor(nx, ny, size) {
			super(nx, ny, size);
		}
	}

	class Puzzle_sudoku extends PenpaPuzzle_Sudoku {
		constructor(nx, ny, size) {
			super(nx, ny, size);
		}
	}

