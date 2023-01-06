const PenpaSymbol = (() => {
    function _constructor(pu, puzzle, size, decoder) {
        this.pu = pu;
        this.puzzle = puzzle;
        this.size = size;
		this.decoder = decoder;
    }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

    const shape_map1 = {
        "circle_L":  {s1: 0.43, s2: 0.32 },
        "circle_M":  {s1: 0.35, s2: 0.25 },
        "circle_S":  {s1: 0.22, s2: 0.14 },
        "circle_SS": {s1: 0.13, s2: 0.07 },
        "square_LL": {s1: 0.5 },
        "square_L":  {s1: 0.4 },
        "square_M":  {s1: 0.35 },
        "square_S":  {s1: 0.22 },
        "square_SS": {s1: 0.13 },
        "triup_L":    {s1: 0, s2: 0.5,   r:0.5,  n: 3, a: 90},
        "triup_M":    {s1: 0, s2: 0.4,   r:0.4,  n: 3, a: 90},
        "triup_S":    {s1: 0, s2: 0.25,  r:0.25, n: 3, a: 90},
        "triup_SS":   {s1: 0, s2: 0.16,  r:0.16, n: 3, a: 90},
        "tridown_L":  {s1: 0, s2: -0.5,  r:0.5,  n: 3, a: -90},
        "tridown_M":  {s1: 0, s2: -0.4,  r:0.4,  n: 3, a: -90},
        "tridown_S":  {s1: 0, s2: -0.25, r:0.25, n: 3, a: -90},
        "tridown_SS": {s1: 0, s2: -0.16, r:0.16, n: 3, a: -90},
        "triright_L": {s1: -0.5,  s2: 0, r:0.5,  n: 3, a: 180},
        "triright_M": {s1: -0.4,  s2: 0, r:0.4,  n: 3, a: 180},
        "triright_S": {s1: -0.25, s2: 0, r:0.25, n: 3, a: 180},
        "triright_SS":{s1: -0.16, s2: 0, r:0.16, n: 3, a: 180},
        "trileft_L":  {s1: 0.5,  s2: 0, r:0.5,  n:3, a: 0},
        "trileft_M":  {s1: 0.4,  s2: 0, r:0.4,  n:3, a: 0},
        "trileft_S":  {s1: 0.25, s2: 0, r:0.25, n:3, a: 0},
        "trileft_SS": {s1: 0.16, s2: 0, r:0.16, n:3, a: 0},
        "diamond_L":  {s1: 0, s2: 0, r:0.43, n: 4, a: 0},
        "diamond_M":  {s1: 0, s2: 0, r:0.35, n: 4, a: 0},
        "diamond_S":  {s1: 0, s2: 0, r:0.22, n: 4, a: 0},
        "diamond_SS": {s1: 0, s2: 0, r:0.13, n: 4, a: 0},
        "hexpoint_LL":{s1: 0, s2: 0, r:0.48, n: 6, a: 30},
        "hexpoint_L": {s1: 0, s2: 0, r:0.40, n: 6, a: 30},
        "hexpoint_M": {s1: 0, s2: 0, r:0.30, n: 6, a: 30},
        "hexpoint_S": {s1: 0, s2: 0, r:0.20, n: 6, a: 30},
        "hexpoint_SS":{s1: 0, s2: 0, r:0.13, n: 6, a: 30},
        "hexflat_LL": {s1: 0, s2: 0, r:0.48, n: 6, a: 0},
        "hexflat_L":  {s1: 0, s2: 0, r:0.40, n: 6, a: 0},
        "hexflat_M":  {s1: 0, s2: 0, r:0.30, n: 6, a: 0},
        "hexflat_S":  {s1: 0, s2: 0, r:0.20, n: 6, a: 0},
        "hexflat_SS": {s1: 0, s2: 0, r:0.13, n: 6, a: 0},
    }
    const arrow_map1 = {
        "arrow_B_B": {circle_style: 2, fn: "draw_arrowB" },
        "arrow_B_G": {circle_style: 3, fn: "draw_arrowB" },
        "arrow_B_W": {circle_style: 1, fn: "draw_arrowB" },
        "arrow_N_B": {circle_style: 2, fn: "draw_arrowN" },
        "arrow_N_G": {circle_style: 3, fn: "draw_arrowN" },
        "arrow_N_W": {circle_style: 1, fn: "draw_arrowN" },
        "arrow_S":   {circle_style: 2, fn: "draw_arrowS" },
        "arrow_GP":  {circle_style: 2, fn: "draw_arrowGP" },
        "arrow_GP_C":{circle_style: 2, fn: "draw_arrowGP_C" },
        "arrow_Short": {circle_style: 2, fn: "draw_arrowShort" },
        "arrow_tri_B": {circle_style: 2, fn: "draw_arrowtri" },
        "arrow_tri_G": {circle_style: 3, fn: "draw_arrowtri" },
        "arrow_tri_W": {circle_style: 1, fn: "draw_arrowtri" },
        "arrow_cross": {circle_style: 2, fn: "draw_arrowcross" },
        "arrow_eight": {circle_style: 2, fn: "draw_arroweight" },
        "arrow_fourtip": {circle_style: 2, fn: "draw_arrowfourtip" },
    }
    const color_map = {
        "ox_B": Color.BLACK,
        "ox_E": Color.GREEN,
        "ox_G": Color.GREY
    }
    const bar_map = {
        "bars_B": {fillStyle: Color.BLACK, strokeStyle: Color.BLACK},
        "bars_G": {fillStyle: Color.GREY_LIGHT, strokeStyle: Color.BLACK},
        "bars_W": {fillStyle: Color.WHITE, strokeStyle: Color.BLACK},
    }

	P.draw_symbol = function(ctx, x, y, num, sym, cc) {
         switch (sym) {
             case "circle_L":
             case "circle_M":
             case "circle_S":
             case "circle_SS": {
                const {s1, s2} = shape_map1[sym];
                if (num === 0) {
                    set_circle_style(ctx, 1);
                    this.draw_circle(ctx, x, y, s1);
                    this.draw_circle(ctx, x, y, s2);
                } else {
                    set_circle_style(ctx, num, cc);
                    this.draw_circle(ctx, x, y, s1);
                }
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'draw_polygon');
                break;
            }
            case "square_LL":
            case "square_L":
            case "square_M":
            case "square_S":
            case "square_SS": {
                const {s1} = shape_map1[sym];
                set_circle_style(ctx, num, cc);
                this.draw_polygon(ctx, x, y, s1 * Math.sqrt(2), 4, 45);
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:square');
                break;
            }
            case "triup_L":
            case "triup_M":
            case "triup_S":
            case "triup_SS":
            case "tridown_L":
            case "tridown_M":
            case "tridown_S":
            case "tridown_SS":
            case "triright_L":
            case "triright_M":
            case "triright_S":
            case "triright_SS":
            case "trileft_L":
            case "trileft_M":
            case "trileft_S":
            case "trileft_SS":
            case "diamond_L":
            case "diamond_M":
            case "diamond_S":
            case "diamond_SS":
            case "hexpoint_LL":
            case "hexpoint_L":
            case "hexpoint_M":
            case "hexpoint_S":
            case "hexpoint_SS":
            case "hexflat_LL":
            case "hexflat_L":
            case "hexflat_M":
            case "hexflat_S":
            case "hexflat_SS": {
                const {s1, s2, r, n, a} = shape_map1[sym];
                set_circle_style(ctx, num, cc);
                this.draw_polygon(ctx, x + s1 * 0.25, y + s2 * 0.25, r, n, a);
                break;
            }
            case "ox_B":
                ctx.setLineDash([]);
                //ctx.lineCap = "butt";//ok
                ctx.fillStyle = cc || Color.BLACK;
                ctx.strokeStyle = color_map[sym];
                ctx.lineWidth = 2;
                this.draw_ox(ctx, num, x, y);
                break;
            case "ox_E":
            case "ox_G": {
                ctx.setLineDash([]);
                //ctx.lineCap = "butt";//ok
                ctx.fillStyle = Color.TRANSPARENTWHITE;
                ctx.strokeStyle = color_map[sym];
                ctx.lineWidth = 2;
                this.draw_ox(ctx, num, x, y);
                break;
            }
            case "tri": {
                this.draw_tri(ctx, num, x, y, cc);
                break;
            }
            case "cross": {
                ctx.setLineDash([]);
                ctx.lineCap = "butt";//ok
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = cc || Color.BLACK;
                ctx.lineWidth = 3;
                this.draw_cross(ctx, num, x, y);
                break;
            }
            case "line": {
                this.draw_linesym(ctx, num, x, y, cc);
                break;
            }
            case "frameline":
                this.draw_framelinesym(ctx, num, x, y, cc);
                break;
            case "bars_B":
                ctx.setLineDash([]);
                // ctx.lineCap = "butt";
                ctx.fillStyle = cc || Color.BLACK;
                ctx.strokeStyle = cc || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
            case "bars_G":
                ctx.setLineDash([]);
                // ctx.lineCap = "butt";
                ctx.fillStyle = cc || Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
            case "bars_W":
                ctx.setLineDash([]);
                // ctx.lineCap = "butt";
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
            case "inequality":
                set_circle_style(ctx, 10);
                this.draw_inequality(ctx, num, x, y, cc);
                break;
            case "math":
                set_font_style(ctx, 0.8, 1, cc);
                this.draw_math(ctx, num, x, y + 0.05);
                break;
            case "math_G":
                set_font_style(ctx, 0.8, 2);
                this.draw_math(ctx, num, x, y + 0.05);
                break;

            case "degital":
                set_circle_style(ctx, 2, cc);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_B":
                set_circle_style(ctx, 2, cc);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_E":
                set_circle_style(ctx, 12);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_G":
                set_circle_style(ctx, 3);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_f":
                this.draw_degital_f(ctx, num, x, y, cc);
                break;
            case "dice":
                set_circle_style(ctx, 2, cc);
                this.draw_dice(ctx, num, x, y);
                break;
            case "pills":
                this.draw_pills(ctx, num, x, y, cc);
                break;
                
            case "arrow_N_B":
            case "arrow_S":
            case "arrow_GP":
            case "arrow_GP_C":
            case "arrow_Short":
            case "arrow_tri_B":
            case "arrow_fourtip":
            case "arrow_cross":
            case "arrow_eight":
            {
                const style = undefined;
                const handler = arrow_map1[sym];
                set_circle_style(ctx, style !== undefined ? style : handler.circle_style, cc);
                this[handler.fn](ctx, num, x, y);
                break;
            }
            case "arrow_B_B":
            case "arrow_B_G":
            case "arrow_B_W":
            case "arrow_N_G":
            case "arrow_N_W":
            case "arrow_tri_G":
            case "arrow_tri_W":
            {
                const style = undefined;
                const handler = arrow_map1[sym];
                set_circle_style(ctx, style !== undefined ? style : handler.circle_style);
                this[handler.fn](ctx, num, x, y);
                break;
            }
            case "arrow_fouredge_B":
                set_circle_style(ctx, 2, cc);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;
            case "arrow_fouredge_G":
                set_circle_style(ctx, 2);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.fillStyle = Color.GREY;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;
            case "arrow_fouredge_E":
                set_circle_style(ctx, 2);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.fillStyle = Color.GREEN_LIGHT;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;

            case "kakuro":
            case "compass":
            case "star":
            case "tents":
            case "angleloop":
            case "firefly":
            case "sun_moon":
            case "sudokuetc":
            case "sudokumore":
            case "polyomino":
            case "polyhex":
            case "pencils":
            case "slovak":
            case "arc":
            case "darts":
            case "spans":
            case "neighbors":
                this['draw_' + sym](ctx, num, x, y, cc);
                break;
            case "battleship_B":
                const color = undefined;
                var font_style_type = 1;
                set_circle_style(ctx, 2, cc);
                this.draw_battleship(ctx, num, x, y, font_style_type, color);
                break;
            case "battleship_G":
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                font_style_type = 3;
                this.draw_battleship(ctx, num, x, y, font_style_type);
                break;
            case "battleship_W":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 2;
                this.draw_battleship(ctx, num, x, y);
                break;
            case "battleship_B+":
                set_circle_style(ctx, 2, cc);
                this.draw_battleshipplus(ctx, num, x, y);
                break;
            case "battleship_G+":
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                this.draw_battleshipplus(ctx, num, x, y);
                break;
            case "battleship_W+":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 2;
                this.draw_battleshipplus(ctx, num, x, y);
                break;


            default:
                console.warn('symbol not implemented:', sym);
                return;
        }
        if (ctx.path && ctx.path.length > 0)
            this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:' + sym);
        else if (ctx._text) {
            const offset = [-0.00, 0];
            this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
        }
    }

    
	P.draw_number = function(number, p) {
		const {point2RC, point} = PenpaTools;
		let text = number[0];
		//const str_alph_low = "abcdefghijklmnopqrstuvwxyz";
		//let factor = str_alph_low.includes(text) ? 0 : 1;
		if (p.slice(-1) === 'E') p = slice(0, -1);
		let [p_y, p_x] = point2RC(p);
		const ctx = new FakeContext();
		// Vertex numbers/circles (point.type=1 or 2) should be drawn over gridlines
		if (point(p).type === 1 || point(p).type === 2) {
			ctx.target =  'overlay'
		}
		switch(number[2]) {
			case "1": //normal
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.42);
				set_font_style(ctx, 0.7, number[1]);
				p_y += 0.01
				break;
			case "2": //arrow
				const arrowlength = 0.7; // arrowlength
				const arrowhead = 0.2;
				const arrowwidth = 0.13;
				//const arrowshape = [[0, 0],[0, arrowlength],[arrowwidth / 2, arrowlength - arrowhead],[-arrowwidth / 2, arrowlength - arrowhead],[0, arrowlength]];
                const arrowshape = [0, 1/ctx.penpaSize, -0.25, 1/ctx.penpaSize, -0.25, 3/ctx.penpaSize]
				const directionMap = {
					"_0": 90,
					"_1": 180,
					"_2": 0,
					"_3": 270,
					"_4": 135,
					"_5": 45,
					"_6": 225,
					"_7": 315,
				}
				const arrowMap = {
					90 : {midarrow: [+0.3,  -0.0 ], textpos: [-0.1,  0.05], textwidth: 0.7, dir: 3},
					180: {midarrow: [+0.0,  -0.3 ], textpos: [ 0.0,  0.15], textwidth: 0.8, dir: 1},
					0  : {midarrow: [+0.0,  -0.3 ], textpos: [ 0.0,  0.15], textwidth: 0.8, dir: 5},
					270: {midarrow: [+0.3,  -0.0 ], textpos: [-0.1,  0.05], textwidth: 0.7, dir: 7},
					135: {midarrow: [+0.19, -0.19], textpos: [-0.05, 0.15], textwidth: 0.7, dir: 2},
					45 : {midarrow: [-0.19, -0.19], textpos: [+0.05, 0.15], textwidth: 0.7, dir: 4},
					225: {midarrow: [-0.19, -0.19], textpos: [+0.05, 0.15], textwidth: 0.7, dir: 8},
					315: {midarrow: [+0.19, -0.19], textpos: [-0.05, 0.15], textwidth: 0.7, dir: 6},
				};
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.42);
				set_font_style(ctx, 0.7, number[1]);
				let direction = directionMap[text.slice(-2)];
				let arrow = arrowMap[direction];
				if (arrow !== undefined) {
					text = text.slice(0, -2);
					if (text.length > 0) {
						const opts = Object.assign(ctx.toOpts(), {
							center: [p_y - 0.06 + arrow.textpos[1], p_x + arrow.textpos[0]],
							borderColor: Color.TRANSPARENTWHITE,
							text: text,
						});
						this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number arrow:' + JSON.stringify(number));
					}
                    var len1 = 0.33; //tail
                    var len2 = 0.32; //tip
                    var w1 = 1 / ctx.penpaSize; // head width
                    var w2 = 3 / ctx.penpaSize; // tail width
                    var ri = -0.22; // head length
                    this.draw_arrow(ctx, arrow.dir, p_x + arrow.midarrow[0], p_y + arrow.midarrow[1], len1, len2, w1, w2, ri);
                    ctx.target = 'cell-grids'; // This is the correct z-order for number arrows
                    this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'number arrow:' + JSON.stringify(number));
					return;
				}
				break;
			case "4": //tapa
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.44);
				const tapa_pos = {
					1: {font: 0.7,  offset: [[ 0.06, 0]]},
					2: {font: 0.48, offset: [[-0.15,-0.16], [ 0.19, 0.18]]},
					3: {font: 0.45, offset: [[-0.14,-0.22], [-0.05, 0.24], [0.30, 0]]},
					4: {font: 0.4,  offset: [[-0.22, 0],    [ 0.04,-0.26], [0.04, 0.26], [0.30, 0]]},
				};
				let values = [...number[0]]; // This is to handle unicode symbols.
				let pos = tapa_pos[values.length];
				if (pos) {
					set_font_style(ctx, pos.font * 0.9, number[1]);
					for (let i = 0; i < pos.offset.length; i++) {
						const offset = pos.offset[i];
						const opts = Object.assign(ctx.toOpts(), {
							center: [p_y + offset[0] - 0.04, p_x + offset[1]],
							text: values[i],
						});
						this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number tapa:' + JSON.stringify(number));
					}
				}
				return;
				break;
			case "5": //small
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.17);
				set_font_style(ctx, 0.25, number[1]);
				break;
			case "6": //medium
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.25);
				set_font_style(ctx, 0.4, number[1]);
				break;
			case "10": //big
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.36);
				set_font_style(ctx, 0.6, number[1]);
				p_y +=  0.01;
				break;
			case "7": //sudoku
				{
					let sum = 0, pos = 0;
					for (var j = 0; j < 9; j++) {
						if (number[0][j] === 1) {
							sum += 1;
							pos = j;
						}
					}
					if (sum === 1) {
						set_font_style(ctx, 0.7, number[1]);
						text = (pos + 1).toString();
						break;
					} else {
						set_font_style(ctx, 0.3, number[1]);
						for (var j = 0; j < 9; j++) {
							if (number[0][j] === 1) {
								const opts = Object.assign(ctx.toOpts(), {
									center: [p_y + (((j / 3 | 0) - 1) * 0.28 + 0.02), p_x + ((j % 3 - 1) * 0.28)],
									text: (j + 1).toString(),
								});
								this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number sudoku:' + JSON.stringify(number));
							}
						}
					}
				}
				return;
			case "8": //long
				if (number[1] === 5) {
					// White background
					//set_font_style(ctx, 0.5, number[1]);
					//set_circle_style(ctx, 7);
					//this.ctx.fillRect(p_x - 0.2 * this.size, p_y - 0.25 * this.size, this.ctx.measureText(this[pu].number[i][0]).width, 0.5 * this.size);
				}
				set_font_style(ctx, 0.5, number[1]);
				//ctx.fillStyle = '#ff0000'
				p_x += -0.2;
				p_y -= 0.06;
				const opts = Object.assign(ctx.toOpts(), {
					center: [p_y, p_x],
					text: number[0],
					'text-anchor': 'left',
				});
				this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number:' + JSON.stringify(number));
				return;
		}

		const opts = Object.assign(ctx.toOpts(), {
			center: [p_y, p_x],
			text: text,
			//textStroke: '#ff0000',
			//color: '#FF00FF'

		});
		this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number' + JSON.stringify(number));
	}

	P.draw_numberS = function(number, p) {
		const {point2cell, point2RC} = PenpaTools;
		let ctx = new FakeContext();
		let rc = point2RC(p)
		if (number[1] === 5) {
			set_circle_style(ctx, 7);
			this.draw_rect_elem(ctx, rc[1], rc[0], 0.40, 0.40);
			//draw_circle_elem(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 6) {
			set_circle_style(ctx, 1);
			this.draw_circle_elem(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 7) {
			set_circle_style(ctx, 2);
			this.draw_circle_elem(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 11) {
			set_circle_style(ctx, 11);
			this.draw_circle_elem(ctx, rc[1], rc[0], 0.18);
		}
		if (this.pu.point[p]) {
			ctx = new FakeContext();
			set_font_style(ctx, 0.32, number[1]);
			ctx.textAlign = "center";
			let [r, c] = point2RC(p);
			if (c - Math.floor(c) === 0.25 && r - Math.floor(r) === 0.25) {
				let rc = point2cell(p);
				let cellRC = [rc[0] - doc.row0, rc[1] - doc.col0];
				if (cellRC[0] >= 0 && cellRC[1] >= 0 &&
					cellRC[0] < puzzle.cells.length &&
					cellRC[1] < puzzle.cells[0].length) {
					let cell = puzzle.cells[cellRC[0]][cellRC[1]];
					cell.pencilMarks = [' '];
				}
			}
			const opts = Object.assign(ctx.toOpts(), {
				center: [r - 0.00, c],
				//textStroke: '#ff0000',
				//color: '#FF00FF',
				text: number[0]//.trim(),
			});
			this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'numberS:' + JSON.stringify(number));
		}
	}

    P.draw_numbercircle = function(ctx, number, i, p_x, p_y, size) {
		if (number[1] === 5) {  //WHITE no border
			//ctx.target = 'overlay';
			set_circle_style(ctx, 7);
            this.draw_circle_elem(ctx, p_x, p_y, size);
			// ctx['stroke-width'] = 0
        } else if (number[1] === 6) { //WHITE
			//ctx.target = 'overlay';
			set_circle_style(ctx, 1);
            this.draw_circle_elem(ctx, p_x, p_y, size);
			// ctx['stroke-width'] = 0
        } else if (number[1] === 7) { //BLACK
			//ctx.target = 'overlay';
			set_circle_style(ctx, 2);
            this.draw_circle_elem(ctx, p_x, p_y, size);
			ctx['stroke-width'] = 0
        } else if (number[1] === 11) { //RED
			//ctx.target = 'overlay';
			set_circle_style(ctx, 11);
			// Draw twice because RED in Sudokupad has alpha 0.5
            this.draw_circle_elem(ctx, p_x, p_y, size);
            this.draw_circle_elem(ctx, p_x, p_y, size);
			ctx['stroke-width'] = 0
        }
    }

	P.draw_circle_elem = function(ctx, x, y, r) {
		let opts = Object.assign(ctx.toOpts(), {
			rounded: true,
			center: [y, x],
			width: 2 * r,
			height: 2 * r,
			target: ctx.target || 'cages',
		});
		this.decoder.puzzleAdd(this.puzzle, 'underlays', opts);
    }

	P.draw_rect_elem = function(ctx, x, y, w, h) {
		let opts = Object.assign(ctx.toOpts(), {
			//opts.rounded = false;
			center: [y, x],
			width: w,
			height: h,
		});
		this.decoder.puzzleAdd(this.puzzle, 'underlays', opts);
    }

    // P.arrowWaypoints = function(startX, startY, endX, endY, a) {
    //     var dx = endX - startX;
    //     var dy = endY - startY;
    //     var len = Math.sqrt(dx * dx + dy * dy);
    //     var sin = dy / len;
    //     var cos = dx / len;
	// 	wp = [];
    //     for (var i = 0; i < a.length; i ++) {
    //         var x = a[i][1] * cos - a[i][0] * sin + startX;
    //         var y = a[i][1] * sin + a[i][0] * cos + startY;
    //         wp.push([y, x]);
    //     }
	// 	return wp;
    // }

    P.draw_circle = function(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
    }
	// P.draw_circle = function(ctx, x, y, r) {
	// 	let opts = Object.assign(ctx.toOpts('surface'), {
	// 		rounded: true,
	// 		center: [y, x],
	// 		width: 2 * r,
	// 		height: 2 * r,
	// 	});
	// 	this.decoder.puzzleAdd(this.puzzle, 'underlays', opts, 'draw_circle');
    // }

	P.draw_rect = function(ctx, x, y, w, h) {
		let opts = Object.assign(ctx.toOpts('surface'), {
			//opts.rounded = false;
			center: [y, x],
			width: w,
			height: h,
		});
		this.decoder.puzzleAdd(this.puzzle, 'underlays', opts, 'draw_rect');
    }

    P.draw_polygon = function(ctx, x, y, r, n, th) {
        ctx.LineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r * Math.cos(th * (Math.PI / 180)), y - r * Math.sin(th * (Math.PI / 180)));
        for (var i = 0; i < n - 1; i++) {
            th += 360 / n;
            ctx.lineTo(x - r * Math.cos(th * (Math.PI / 180)), y - r * Math.sin(th * (Math.PI / 180)));
        }
        ctx.closePath();
        ctx.fill();
    }

    P.draw_rectbar = function(ctx, x, y, rx, ry, n, th) {
        ctx.LineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - rx * Math.cos(th * (Math.PI / 180)), y - ry * Math.sin(th * (Math.PI / 180)));
        for (var i = 0; i < n - 1; i++) {
            th += 360 / n;
            ctx.lineTo(x - rx * Math.cos(th * (Math.PI / 180)), y - ry * Math.sin(th * (Math.PI / 180)));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    P.draw_slash = function(ctx, x, y, r) {
        var th;
        th = 45 ;//+ this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)), y + r * Math.sin(th * (Math.PI / 180)));
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)), y + r * Math.sin((th + 180) * (Math.PI / 180)));
        ctx.stroke();
    }

    P.draw_ast = function(ctx, x, y, r) {
        var th;
        th = 45 ;//+ this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)), y + r * Math.sin(th * (Math.PI / 180)));
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)), y + r * Math.sin((th + 180) * (Math.PI / 180)));
        ctx.stroke();
        th = 135 ;//+ this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)), y + r * Math.sin(th * (Math.PI / 180)));
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)), y + r * Math.sin((th + 180) * (Math.PI / 180)));
        ctx.stroke();
    }

    P.draw_ox = function(ctx, num, x, y) {
        var r = 0.3;
        switch (num) {
            case 1:
                this.draw_circle(ctx, x, y, r);
                break;
            case 2:
                this.draw_polygon(ctx, x, y + 0.05, 0.3, 3, 90);
                break;
            case 3:
                this.draw_polygon(ctx, x, y, 0.35, 4, 45);
                break;
            case 4:
                this.draw_x(ctx, x, y, r);
                break;
            case 5:
                r = 0.5;
                ctx.beginPath();
                ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)), y + r * Math.sin(45 * (Math.PI / 180)));
                ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)), y + r * Math.sin(225 * (Math.PI / 180)));
                ctx.stroke();
                break;
            case 6:
                r = 0.5;
                ctx.beginPath();
                ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)), y + r * Math.sin(135 * (Math.PI / 180)));
                ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)), y + r * Math.sin(315 * (Math.PI / 180)));
                ctx.stroke();
                break;
            case 7:
                this.draw_x(ctx, x, y, 0.5);
                break;
            case 8:
                r = 0.05;
                ctx.setLineDash([]);
                //ctx.lineCap = "butt";
                ctx.fillStyle = ctx.strokeStyle;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x, y, r);
                break;
            case 9:
                r = 0.3;
                this.draw_circle(ctx, x, y, r);
                this.draw_x(ctx, x, y, 0.45);
                break;
        }
    }

    P.draw_x = function(ctx, x, y, r) {
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)), y + r * Math.sin(45 * (Math.PI / 180)));
        ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)), y + r * Math.sin(225 * (Math.PI / 180)));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)), y + r * Math.sin(135 * (Math.PI / 180)));
        ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)), y + r * Math.sin(315 * (Math.PI / 180)));
        ctx.stroke();
    }

    P.draw_tri = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.5,
            th;
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                set_circle_style(ctx, 2, ccolor);
                th = this.rotate_theta(-90 * (num - 1));
                ctx.beginPath();
                ctx.moveTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.75));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.25), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.25));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th + Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th + Math.PI * 0.75));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.75));
                ctx.fill();
                break;
            case 5:
                set_circle_style(ctx, 2, ccolor);
                this.draw_polygon(ctx, x, y, r * Math.sqrt(2), 4, 45);
                break;
            case 6:
            case 7:
            case 8:
            case 9:
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                th = this.rotate_theta(-90 * (num - 1));
                ctx.beginPath();
                ctx.moveTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.75));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.25), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.25));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th + Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th + Math.PI * 0.75));
                ctx.lineTo(x + Math.sqrt(2) * r * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * Math.sin(th - Math.PI * 0.75));
                ctx.fill();
                break;
            case 0:
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                this.draw_polygon(ctx, x, y, r * Math.sqrt(2), 4, 45);
                break;
        }
    }

    P.draw_cross = function(ctx, num, x, y) {
        const lineWidth = ctx.lineWidth / 32;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                var th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.moveTo(x + (lineWidth) * 0.3 * Math.cos(th), y + (lineWidth) * 0.3 * Math.sin(th));
                ctx.lineTo(x - 0.5 * Math.cos(th), y - 0.5 * Math.sin(th));
                ctx.stroke();
            }
        }
    }

    P.draw_linesym = function(ctx, num, x, y, ccolor = "none") {
        let r = 0.32;
        const o = 0.13;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        if (ccolor !== "none") {
            ctx.strokeStyle = ccolor;
        } else {
            ctx.strokeStyle = Color.BLACK;
        }
        ctx.lineWidth = 3;
        switch (num) {
            case 1:
                ctx.beginPath();
                ctx.moveTo(x - r, y - 0);
                ctx.lineTo(x + r, y + 0);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                ctx.beginPath();
                ctx.moveTo(x - 0, y - r);
                ctx.lineTo(x + 0, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                ctx.beginPath();
                ctx.moveTo(x - r, y - 0);
                ctx.lineTo(x + r, y + 0);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - 0, y - r);
                ctx.lineTo(x + 0, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                r = r * 0.65;
                ctx.beginPath();
                ctx.moveTo(x + r, y - r + o);
                ctx.lineTo(x - r + o, y + r);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + r - o, y - r);
                ctx.lineTo(x - r, y + r - o);
                ctx.closePath();
                ctx.stroke();
                break;
            case 8:
                r = r * 0.65;
                ctx.beginPath();
                ctx.moveTo(x - r, y - r + o);
                ctx.lineTo(x + r - o, y + r);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - r + o, y - r);
                ctx.lineTo(x + r, y + r - o);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    P.draw_framelinesym = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.32;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 3;
        switch (num) {
            case 1:
                set_line_style(ctx, 115, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                set_line_style(ctx, 15, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                set_line_style(ctx, 16, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                set_line_style(ctx, 110, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r, y - r);
                ctx.lineTo(x - r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                set_line_style(ctx, 115, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                set_line_style(ctx, 15, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                set_line_style(ctx, 16, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 8:
                set_line_style(ctx, 110, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r, y - r);
                ctx.lineTo(x + r, y + r);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    P.draw_bars = function(ctx, num, x, y) {
        switch (num) {
            case 1:
                this.draw_rectbar(ctx, x, y, 0.1, 0.5, 4, 45);
                break;
            case 2:
                this.draw_rectbar(ctx, x, y, 0.5, 0.1, 4, 45);
                break;
            case 3:
                this.draw_rectbar(ctx, x, y, 0.2, 0.5, 4, 45);
                break;
            case 4:
                this.draw_rectbar(ctx, x, y, 0.5, 0.2, 4, 45);
                break;
        }
    }

    P.draw_inequality = function(ctx, num, x, y) {
        var th;
        var len = 0.14;
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                th = this.rotate_theta((num - 1) * 90 + 45);
                ctx.moveTo(x + len * Math.sqrt(2) * Math.cos(th), y + len * Math.sqrt(2) * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 180);
                ctx.lineTo(x + len * Math.cos(th), y + len * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 315);
                ctx.lineTo(x + len * Math.sqrt(2) * Math.cos(th), y + len * Math.sqrt(2) * Math.sin(th));
                ctx.fill();
                ctx.stroke();
                break;
                //for square
            case 5:
            case 6:
            case 7:
            case 8:
                len = 0.12;
                ctx.beginPath();
                th = this.rotate_theta((num - 1) * 90 + 80);
                ctx.moveTo(x + len * Math.sqrt(2) * Math.cos(th), y + len * Math.sqrt(2) * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 180);
                ctx.lineTo(x + len * Math.cos(th), y + len * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 280);
                ctx.lineTo(x + len * Math.sqrt(2) * Math.cos(th), y + len * Math.sqrt(2) * Math.sin(th));
                ctx.stroke();
                break;
        }
    }
    P.draw_math = function(ctx, num, x, y) {
        switch (num) {
            case 1:
                ctx.font = 0.7 + "px sans-serif";
                ctx.text("\u{221E}", x, y);
                break;
            case 2:
                ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("＋", x, y + 0.1);
                break;
            case 3:
                ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("－", x, y);
                break;
            case 4:
                    ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("×", x, y);
                break;
            case 5:
                ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("＊", x, y);
                break;
            case 6:
                    ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("÷", x, y);
                break;
            case 7:
                ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("＝", x, y);
                break;
            case 8:
                    ctx.font = 0.7 + "px Helvetica,Arial";
                ctx.text("≠", x, y);
                break;
            case 9:
                    ctx.font = 0.8 + "px Helvetica,Arial";
                ctx.text("≦", x, y);
                break;
            case 0:
                    ctx.font = 0.8 + "px Helvetica,Arial";
                ctx.text("≧", x, y);
                break;
        }

    }

    P.draw_degital = function(ctx, num, x, y) {
        ctx.lineCap = 'round';
        ctx.lineWidth = 4;
        var w1, w2, w3, w4, z1, z2, m;
        m = 0.05;
        z1 = 0.17;
        z2 = 0.015;
        w3 = 0.05;
        w4 = 0.05;
        if (num[0] === 1) {
            w1 = z1;
            w2 = -2 * (z1 + z2);
            ctx.beginPath();
            //ctx.arrow(x - w1, y + w2, x + w1, y + w2,
                //  [w3, w4, -w3, w4]);
            ctx.moveTo(x - w1 + m, y + w2)
            ctx.lineTo(x + w1 - m, y + w2)
            //ctx.fill();
        }
        //ctx.lineWidth = 0;
        if (num[1] === 1) {
            w1 = -(z1 + z2);
            w2 = -2 * z1;
            ctx.beginPath();
            // ctx.arrow(x + w1, y + w2, x + w1, y - 2 * z2,
            //     [w3, w4, -w3, w4]);
            ctx.moveTo(x + w1, y + w2 + m)
            ctx.lineTo(x + w1, y - 2 * z2 - m)
            // ctx.fill();
        }
        if (num[2] === 1) {
            w1 = z1 + z2;
            w2 = -2 * z1;
            ctx.beginPath();
            // ctx.arrow(x + w1, y + w2, x + w1, y - 2 * z2,
            //     [w3, w4, -w3, w4]);
            ctx.moveTo(x + w1, y + w2 + m)
            ctx.lineTo(x + w1, y - 2 * z2 - m)
            // ctx.fill();
        }
        if (num[3] === 1) {
            w1 = z1;
            w2 = 0;
            ctx.beginPath();
            // ctx.arrow(x - w1, y + w2, x + w1, y + w2,
            //     [w3, w4, -w3, w4]);
            ctx.moveTo(x - w1 + m, y + w2)
            ctx.lineTo(x + w1 - m, y + w2)
                // ctx.fill();
        }
        if (num[4] === 1) {
            w1 = -(z1 + z2);
            w2 = 2 * z1;
            ctx.beginPath();
            // ctx.arrow(x + w1, y + w2, x + w1, y + 2 * z2,
            //     [w3, w4, -w3, w4]);
            // ctx.fill();
            ctx.moveTo(x + w1, y + w2 - m)
            ctx.lineTo(x + w1, y + 2 * z2 + m)
        }
        if (num[5] === 1) {
            w1 = z1 + z2;
            w2 = 2 * z1;
            ctx.beginPath();
            // ctx.arrow(x + w1, y + w2, x + w1, y + 2 * z2,
            //     [w3, w4, -w3, w4]);
            // ctx.fill();
            ctx.moveTo(x + w1, y + w2 - m)
            ctx.lineTo(x + w1, y + 2 * z2 + m)
        }
        if (num[6] === 1) {
            w1 = z1;
            w2 = 2 * (z1 + z2);
            ctx.beginPath();
            // ctx.arrow(x - w1, y + w2, x + w1, y + w2,
            //     [w3, w4, -w3, w4]);
            // ctx.fill();
            ctx.moveTo(x - w1 + m, y + w2)
            ctx.lineTo(x + w1 - m, y + w2)
        }
    }

    P.draw_degital_f = function(ctx, num, x, y, ccolor = "none") {
        set_line_style(ctx, 5);
        ctx.strokeStyle = Color.GREY_LIGHT;

        this.draw_degital(ctx, num.map(n => n ? 0 : 1), x, y);
        this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:' );

        //contents
        set_circle_style(ctx, 2, ccolor);
        this.draw_degital(ctx, num, x, y);
    }

    P.draw_dice = function(ctx, num, x, y) {
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_circle(ctx, x + (i % 3 - 1) * 0.25, y + ((i / 3 | 0) - 1) * 0.25, 0.09);
            }
        }
    }

    P.draw_pills = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.15;
        if (ccolor !== "none") {
            ctx.fillStyle = ccolor;
        } else {
            ctx.fillStyle = Color.GREY;
        }
        switch (num) {
            case 1:
                this.draw_circle(ctx, x, y, r);
                break;
            case 2:
                this.draw_circle(ctx, x - 0.22, y - 0.22, r);
                this.draw_circle(ctx, x + 0.22, y + 0.22, r);
                break;
            case 3:
                this.draw_circle(ctx, x - 0, y - 0.23, r);
                this.draw_circle(ctx, x + 0.23, y + 0.2, r);
                this.draw_circle(ctx, x - 0.23, y + 0.2, r);
                break;
            case 4:
                this.draw_circle(ctx, x - 0.22, y - 0.22, r);
                this.draw_circle(ctx, x + 0.22, y + 0.22, r);
                this.draw_circle(ctx, x - 0.22, y + 0.22, r);
                this.draw_circle(ctx, x + 0.22, y - 0.22, r);
                break;
            case 5:
                this.draw_circle(ctx, x, y, r);
                this.draw_circle(ctx, x - 0.24, y - 0.24, r);
                this.draw_circle(ctx, x + 0.24, y + 0.24, r);
                this.draw_circle(ctx, x - 0.24, y + 0.24, r);
                this.draw_circle(ctx, x + 0.24, y - 0.24, r);
                break;
        }
    }

    P.draw_arrowB = function(ctx, num, x, y) {
        var len1 = 0.38; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0.2;
        var w2 = 0.4;
        var ri = -0.4;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    P.draw_arrowN = function(ctx, num, x, y) {
        var len1 = 0.38; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0.035//0.03;
        var w2 = 0.13;
        var ri = -0.25;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    P.draw_arrowS = function(ctx, num, x, y) {
        var len1 = 0.3; //nemoto
        var len2 = 0.32; //tip
        var w1 = 0.03//0.02;
        var w2 = 0.14//0.12;
        var ri = -0.22//-0.2;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    P.draw_arrow = function(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * Math.cos(th), y - len1 * Math.sin(th), x + len2 * Math.cos(th), y + len2 * Math.sin(th),
                [0, w1, ri, w1, ri, w2]);
            ctx.fill();
            ctx.stroke();
        }
    }

    P.draw_arrowGP = function(ctx, num, x, y) {
        var len1 = 0.35; //nemoto
        var len2 = 0.35; //tip
        var w1 = 0.12;
        var w2 = 0.23;
        var w3 = 0.34;
        var r1 = -0.33;
        var r2 = -0.44;
        var r3 = -0.32;
        var th;
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * Math.cos(th), y - len1 * Math.sin(th), x + len2 * Math.cos(th), y + len2 * Math.sin(th),
                [0, w1, r1, w1, r2, w2, r3, w3]);
            ctx.fill();
            ctx.stroke();
        }
    }

    P.draw_arrowGP_C = function(ctx, num, x, y) {
        if (num > 0 && num <= 8) {
            this.draw_circle(ctx, x, y, 0.4);
            var th = this.rotate_theta((num - 1) * 45 - 180);
            this.draw_arrowGP(ctx, num, x + 0.6 * Math.cos(th), y + 0.6 * Math.sin(th));
        }
    }

    P.draw_arrowShort = function(ctx, num, x, y) {
        var len1 = 0.3; //nemoto
        var len2 = 0.3; //tip
        var w1 = 0.15;
        var w2 = 0.31;
        var ri = -0.33;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    P.draw_arrowtri = function(ctx, num, x, y) {
        var len1 = 0.25; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0;
        var w2 = 0.35;
        var ri = 0;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
        //let th = ((num - 1) * 45);
        //this.draw_polygon(ctx, x, y, 0.5 / Math.sqrt(2), 3, th);
    }

    P.draw_arrowcross = function(ctx, num, x, y) {
        var w1 = 0.025;
        var w2 = 0.12;
        var len1 = 0.5 * w1; //nemoto
        var len2 = 0.45; //tip
        var ri = -0.18;
        var th;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.arrow(x - len1 * Math.cos(th), y - len1 * Math.sin(th), x + len2 * Math.cos(th), y + len2 * Math.sin(th),
                    [0, w1, ri, w1, ri, w2]);
                ctx.fill();
            }
        }
    }

    P.draw_arroweight = function(ctx, num, x, y) {
        var len1 = -0.2; //nemoto
        var len2 = 0.45; //tip
        var w1 = 0.032//0.025;
        var w2 = 0.10;
        var ri = -0.16//-0.15;
        for (var i = 0; i < 8; i++) {
            if (num[i] === 1) {
                this.draw_arrow8(ctx, i + 1, x, y, len1, len2, w1, w2, ri);
            }
        }
    }

    P.draw_arrow8 = function(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num === 2 || num === 4 || num === 6 || num === 8) {
            len1 *= 1.3;
            len2 *= 1.2;
        }
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * Math.cos(th), y - len1 * Math.sin(th), x + len2 * Math.cos(th), y + len2 * Math.sin(th),
                [0, w1, ri, w1, ri, w2]);
            ctx.fill();
            ctx.stroke();
        }
    }

    P.draw_arrowfourtip = function(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = -0.25; //tip
        var w1 = 0.0;
        var w2 = 0.2;
        var ri = 0.0;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                this.draw_arrow4(ctx, i + 1, x, y, len1, len2, w1, w2, ri);
            }
        }
    }

    P.draw_arrow4 = function(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num > 0 && num <= 4) {
            th = this.rotate_theta((num - 1) * 90);
            ctx.beginPath();
            ctx.arrow(x - len1 * Math.cos(th), y - len1 * Math.sin(th), x + len2 * Math.cos(th), y + len2 * Math.sin(th),
                [0, w1, ri, w1, ri, w2]);
            ctx.fill();
            ctx.stroke();
        }
    }

    P.arrowML = function(ctx, startX, startY, endX, endY, controlPoints) {
        controlPoints = [...controlPoints];
        ctx.lineWidth = controlPoints[1] * 64 * 64 / 38;
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
        var x;
        var y;
        a.push(0, 0);
        x = controlPoints[2];
        a.push(x < 0 ? len + x : x, 0);
        y = controlPoints[5];
        a.push(x < 0 ? len + x : x, y/2);
        a.push(len-0.05, 0);
        a.push(x < 0 ? len + x : x, -y/2);
        a.push(x < 0 ? len + x : x, 0);
        // for (var i = 0; i < controlPoints.length; i += 2) {
        //     var x = controlPoints[i];
        //     var y = controlPoints[i + 1];
        //     a.push(x < 0 ? len + x : x, y);
        // }
        // a.push(len, 0);
        // for (var i = controlPoints.length; i > 0; i -= 2) {
        //     var x = controlPoints[i - 2];
        //     var y = controlPoints[i - 1];
        //     a.push(x < 0 ? len + x : x, -y);
        // }
        // a.push(0, 0);
        for (var i = 0; i < a.length; i += 2) {
            var x = a[i] * cos - a[i + 1] * sin + startX;
            var y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    };
    P.draw_arrowfouredge = function(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = 0.5;
        var t1 = 0.00;
        var t2 = 0.50;
        var w1 = 0.02;
        var w2 = 0.07;
        var ri = 0.42;
        var th1, th2;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len1 * Math.cos(th1 + Math.PI * t1) + 0.1 * Math.cos(th2), y + len1 * Math.sin(th1 + Math.PI * t1) + 0.1 * Math.sin(th2), x + len2 * Math.cos(th1 + Math.PI * t2) - 0.05 * Math.cos(th2), y + len2 * Math.sin(th1 + Math.PI * t2) - 0.05 * Math.sin(th2),
                [0.0 , w1, ri, w1+0.02, ri, w2]);
            }
        }
        for (var i = 4; i < 8; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len2 * Math.cos(th1 + Math.PI * t2) - 0.1 * Math.cos(th2), y + len2 * Math.sin(th1 + Math.PI * t2) - 0.1 * Math.sin(th2), x + len1 * Math.cos(th1 + Math.PI * t1) + 0.05 * Math.cos(th2), y + len1 * Math.sin(th1 + Math.PI * t1) + 0.05 * Math.sin(th2),
                    [0, w1, ri, w1, ri, w2]);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    P.draw_neighbors = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.85;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1);
                ctx.fillStyle = Color.GREY;
                this.draw_polygon(ctx, x, y, 1 / Math.sqrt(2), 4, 45);
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.GREY_LIGHT;
                }
                this.draw_polygon(ctx, x, y, r / Math.sqrt(2), 4, 45);
                break;
        }
    }

    P.draw_kakuro = function(ctx, num, x, y, ccolor = "none") {
        var th = this.rotate_theta(45) * 180 / Math.PI;
        switch (num) {
            case 1:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.BLACK;
                }
                ctx.strokeStyle = Color.TRANSPARENTWHITE;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.WHITE;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 2:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.BLACK;
                }
                ctx.strokeStyle = Color.TRANSPARENTWHITE;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
            case 3:
                ctx.fillStyle = Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 4:
                ctx.fillStyle = Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
            case 5:
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 6:
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
        }
    }


    P.draw_compass = function(ctx, num, x, y, ccolor = "none") {
        switch (num) {
            case 1:
                var r = 0.5;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
            case 2:
                var r = 0.33;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
            case 3:
                var r = 0.5;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.WHITE;
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
        }
    }

    P.draw_tents = function(ctx, num, x, y, ccolor = "none") {
        switch (num) {
            case 1:
                var r1;
                var r2;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                ctx.fillStyle = Color.WHITE;
                r1 = 0.1;
                r2 = 0.4;
                ctx.beginPath();
                ctx.moveTo(x - r1, y);
                ctx.lineTo(x + r1, y);
                ctx.lineTo(x + r1, y + r2);
                ctx.lineTo(x - r1, y + r2);
                ctx.lineTo(x - r1, y);
                ctx.fill();
                ctx.stroke();
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:');
                r1 = 0.2;
                r2 = 0.4;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.GREY;
                }
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)), y - (r1 * Math.sin(90 * (Math.PI / 180)) + 0));
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)), y - (r2 * Math.sin(210 * (Math.PI / 180)) + 0));
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)), y - (r2 * Math.sin(330 * (Math.PI / 180)) + 0));
                //ctx.arc(x,y-0.1,0.3,0,2*Math.PI,false);
                ctx.fill();
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:');
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)), y - (r1 * Math.sin(90 * (Math.PI / 180)) + 0.2));
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)), y - (r2 * Math.sin(210 * (Math.PI / 180)) + 0.2));
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)), y - (r2 * Math.sin(330 * (Math.PI / 180)) + 0.2));
                ctx.fill();
                break;
            case 2:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.GREY_LIGHT;
                }
                ctx.lineWidth = 1;
                r1 = 0.3;
                r2 = 0.4;
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)), y - (r1 * Math.sin(90 * (Math.PI / 180)) - 0.1));
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)), y - (r2 * Math.sin(210 * (Math.PI / 180)) - 0.1));
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)), y - (r2 * Math.sin(330 * (Math.PI / 180)) - 0.1));
                ctx.lineTo(x - r1 * Math.cos(90 * (Math.PI / 180)), y - (r1 * Math.sin(90 * (Math.PI / 180)) - 0.1));
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)), y - (r2 * Math.sin(210 * (Math.PI / 180)) - 0.1));
                ctx.fill();
                ctx.stroke();
                break;
            case 3: //anglers
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 0.35, y);
                ctx.quadraticCurveTo(x - 0., y + 0.37, x + 0.3, y - 0.2);
                ctx.stroke();
                ctx.moveTo(x - 0.35, y);
                ctx.quadraticCurveTo(x - 0., y - 0.37, x + 0.3, y + 0.2);
                ctx.stroke();
                break;
            case 4:
                set_font_style(ctx, 0.8.toString(10), 1, ccolor);
                //y+=0.00
                ctx.text("～", x, y - 0.20);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                ctx.text("～", x, y - 0.00);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                ctx.text("～", x, y + 0.20);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                break;
        }
    }

    P.draw_star = function(ctx, num, x, y, ccolor = "none") {
        var r1 = 0.38;
        var r2 = 0.382 * r1;
        switch (num) {
            case 1:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03, r1, r2, 5);
                break;
            case 2:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.BLACK;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03, r1, r2, 5);
                break;
            case 3:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03, r1, r2, 5);
                break;
            case 4:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 5:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.BLACK;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 6:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 7:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 8:
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.BLACK;
                }
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 9:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 0:
                var r = 0.4;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    P.draw_star0 = function(ctx, x, y, r1, r2, n) {
        var th1 = 90;
        var th2 = th1 + 180 / n;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r1 * Math.cos(th1 * (Math.PI / 180)), y - (r1 * Math.sin(th1 * (Math.PI / 180)) - 0));
        ctx.lineTo(x - r2 * Math.cos(th2 * (Math.PI / 180)), y - (r2 * Math.sin(th2 * (Math.PI / 180)) - 0));
        for (var i = 0; i < n; i++) {
            th1 += 360 / n;
            th2 += 360 / n;
            ctx.lineTo(x - r1 * Math.cos(th1 * (Math.PI / 180)), y - (r1 * Math.sin(th1 * (Math.PI / 180)) - 0));
            ctx.lineTo(x - r2 * Math.cos(th2 * (Math.PI / 180)), y - (r2 * Math.sin(th2 * (Math.PI / 180)) - 0));
        }
        ctx.fill();
        ctx.stroke();
    }

    P.draw_battleship = function(ctx, num, x, y, color_type = 1, ccolor = "none") {
        var r = 0.4;
        var th;
        switch (num) {
            case 1:
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.stroke();
                break;
            case 2:
                th = this.rotate_theta(45) * 180 / Math.PI;
                this.draw_polygon(ctx, x, y, 0.36 * Math.sqrt(2), 4, th);
                break;
            case 3:
                this.draw_battleship_tip(ctx, x, y, 0);
                break;
            case 4:
                this.draw_battleship_tip(ctx, x, y, 90);
                break;
            case 5:
                this.draw_battleship_tip(ctx, x, y, 180);
                break;
            case 6:
                this.draw_battleship_tip(ctx, x, y, 270);
                break;
            case 7:
                set_font_style(ctx, 0.8.toString(10), color_type, ccolor);
                ctx.text("～", x, y - 0.20);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                ctx.text("～", x, y - 0.00);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                ctx.text("～", x, y + 0.20);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                break;
            case 8:
                r = 0.05;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    if (color_type === 3) {
                        ctx.fillStyle = Color.GREY;
                    } else {
                        ctx.fillStyle = Color.BLACK;
                    }
                }
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x, y, r);
                break;
        }
    }

    P.draw_battleship_tip = function(ctx, x, y, th) {
        var r = 0.36;
        th = this.rotate_theta(th);
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI * 0.5 + th, Math.PI * 1.5 + th, false);
        ctx.moveTo(x + r * Math.sin(th), y - r * Math.cos(th));
        ctx.lineTo(x + r * Math.sqrt(2) * Math.sin(th + 45 / 180 * Math.PI), y - r * Math.sqrt(2) * Math.cos(th + 45 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * Math.sin(th + 135 / 180 * Math.PI), y - r * Math.sqrt(2) * Math.cos(th + 135 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sin(th + Math.PI), y - r * Math.cos(th + Math.PI));
        ctx.fill();
        ctx.stroke();
    }

    P.draw_battleshipplus = function(ctx, num, x, y) {
        var r = 0.4;
        var th;
        switch (num) {
            case 1:
                this.draw_battleship_tipplus(ctx, x, y, 0);
                break;
            case 2:
                this.draw_battleship_tipplus(ctx, x, y, 90);
                break;
            case 3:
                this.draw_battleship_tipplus(ctx, x, y, 180);
                break;
            case 4:
                this.draw_battleship_tipplus(ctx, x, y, 270);
                break;
        }
    }

    P.draw_battleship_tipplus = function(ctx, x, y, th) {
        var r = 0.36;
        th = this.rotate_theta(th);
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI * 0.5 + th, Math.PI * 1.0 + th, false);
        ctx.moveTo(x - r * Math.sin(th), y + r * Math.cos(th));
        ctx.lineTo(x + r * Math.sqrt(2) * Math.sin(-th + 45 / 180 * Math.PI), y + r * Math.sqrt(2) * Math.cos(-th + 45 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * Math.sin(-th + 135 / 180 * Math.PI), y + r * Math.sqrt(2) * Math.cos(-th + 135 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * Math.sin(-th + 225 / 180 * Math.PI), y + r * Math.sqrt(2) * Math.cos(-th + 225 / 180 * Math.PI));
        ctx.lineTo(x - r * Math.sin(-th + 0.5 * Math.PI), y - r * Math.cos(-th + 0.5 * Math.PI));
        ctx.fill();
        ctx.stroke();
    }

    P.draw_angleloop = function(ctx, num, x, y, ccolor = "none") {
        var r;
        switch (num) {
            case 1:
                r = 0.24;
                set_circle_style(ctx, 2, ccolor);
                this.draw_polygon(ctx, x, y, r, 3, 90);
                break;
            case 2:
                r = 0.24;
                set_circle_style(ctx, 5);
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.GREY;
                }
                this.draw_polygon(ctx, x, y, r, 4, 45);
                break;
            case 3:
                r = 0.215;
                set_circle_style(ctx, 1, ccolor);
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, r, 5, 90);
                break;
            case 4:
                r = 0.25;
                set_circle_style(ctx, 1);
                ctx.lineWidth = 2;
                this.draw_x(ctx, x, y, r);
                break;
        }
    }

    P.draw_firefly = function(ctx, num, x, y, ccolor = "none") {
        var r1 = 0.36,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                var th = this.rotate_theta((num - 1) * 90 - 180);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol: pencils');
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * Math.cos(th), y - r1 * Math.sin(th), r2);
                break;
            case 5:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }

    P.draw_sun_moon = function(ctx, num, x, y, ccolor = "none") {
        var r1 = 0.36,
            r2 = 0.34;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
            case 2:
                set_circle_style(ctx, 2, ccolor);
                ctx.beginPath();
                ctx.arc(x, y,               r1, -0.34 * Math.PI,  0.73 * Math.PI, false);
                ctx.arc(x - 0.12, y - 0.08, r2,  0.67 * Math.PI, -0.28 * Math.PI, true);
                ctx.closePath();
                ctx.fill();
                break;
            case 3:
                set_font_style(ctx, 0.6.toString(10), 10);
                ctx.text("💡", x, y, 0.7, this.size * 0.8);
                break;
            case 4:
                set_font_style(ctx, 0.6.toString(10), 10);
                ctx.text("💣", x + 0.04, y + 0.04, 0.7, this.size * 0.8);
                break;
            case 5:
                // FIXME: bombs should be closer together
                set_font_style(ctx, 0.5.toString(10), 10);
                ctx.text("💣", x - 0.21, y - 0.10, 0.7, this.size * 0.8);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));
                ctx.text("💣", x + 0.21, y + 0.10, 0.7, this.size * 0.8);
                this.decoder.puzzleAdd(this.puzzle, 'overlays', ctx.toOpts(), 'symbol math:' + JSON.stringify(ctx.text));

                break;
        }
    }

    P.draw_pencils = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.2,
            th;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        if (ccolor !== "none") {
            ctx.fillStyle = ccolor;
            ctx.strokeStyle = ccolor;
        } else {
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.BLACK;
        }
        ctx.lineWidth = 2;
        ctx.lineJoin = "bevel"
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                th = this.rotate_theta(90 * (num - 1));
                ctx.moveTo((x + Math.sqrt(2) * 0.5 * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * Math.sin(th + Math.PI * 0.25)));
                ctx.lineTo(x, y);
                ctx.lineTo((x + Math.sqrt(2) * 0.5 * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * Math.sin(th - Math.PI * 0.25)));
                ctx.stroke();
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol: pencils');
                ctx.beginPath();
                ctx.moveTo((x + Math.sqrt(2) * 0.25 * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.25 * Math.sin(th + Math.PI * 0.25)));
                ctx.lineTo(x, y);
                ctx.lineTo((x + Math.sqrt(2) * 0.25 * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.25 * Math.sin(th - Math.PI * 0.25)));
                ctx.closePath();
                ctx.fill();
                break;
        }
    }

    P.draw_slovak = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.09,
            h = 0.37;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y + h, r);
                break;
            case 2:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.2, y + h, r);
                this.draw_circle(ctx, x + 0.2, y + h, r);
                break;
            case 3:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.25, y + h, r);
                this.draw_circle(ctx, x + 0.0, y + h, r);
                this.draw_circle(ctx, x + 0.25, y + h, r);
                break;
            case 4:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.36, y + h, r);
                this.draw_circle(ctx, x - 0.12, y + h, r);
                this.draw_circle(ctx, x + 0.12, y + h, r);
                this.draw_circle(ctx, x + 0.36, y + h, r);
                break;
            case 5:
                set_font_style(ctx, 0.35.toString(10), 1, ccolor);
                ctx.text("?", x, y + h);
                break;
        }
    }

    P.draw_sudokuetc = function(ctx, num, x, y, ccolor = "none") {
        switch (num) {
            case 1:
                var r = 0.14;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.fillStyle = ccolor;
                } else {
                    ctx.fillStyle = Color.GREY_LIGHT;
                }
                this.draw_polygon(ctx, x - r, y + r, r * Math.sqrt(2), 4, 45);
                this.draw_polygon(ctx, x + r, y - r, r * Math.sqrt(2), 4, 45);
                this.decoder.puzzleAdd(this.puzzle, 'lines', ctx.pathToOpts(), 'symbol:');
                ctx.fillStyle = Color.GREY_DARK;
                this.draw_polygon(ctx, x - r, y - r, r * Math.sqrt(2), 4, 45);
                this.draw_polygon(ctx, x + r, y + r, r * Math.sqrt(2), 4, 45);
                break;
            case 2:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.GREY_LIGHT;
                }
                ctx.lineWidth = 4;
                this.draw_circle(ctx, x, y, 0.71);
                break;
            case 3:
                var r = 0.99;
                set_circle_style(ctx, 3, ccolor);
                ctx.beginPath();
                ctx.moveTo(x, y + r);
                ctx.lineTo(x + r, y);
                ctx.lineTo(x, y - r);
                ctx.lineTo(x - r, y);
                ctx.closePath();
                ctx.fill();
                break;
            case 4:
                var r = 0.2;
                var w = 1.8;
                var h = 0.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                var r = 0.2;
                var w = 0.8;
                var h = 1.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                var r = 0.2;
                var w = 2.8;
                var h = 0.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                var r = 0.2;
                var w = 0.8;
                var h = 2.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.BLACK;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    P.draw_sudokumore = function(ctx, num, x, y, ccolor = "none") {
        switch (num) {
            case 1:
                var r = 0.4;
                var w = 1.8;
                var h = 0.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                // if ((this.version[0] < 2) || (this.version[0] == 2 && this.version[1] < 25) || (this.version[0] == 2 && this.version[1] == 25 && this.version[2] < 9)) {
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                // } else {
                    ctx.fillStyle = Color.WHITE;
                // }
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                //ctx.arcTo(x + w, y, x + w, y + r, r);
                //ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                //ctx.arcTo(x, y + h, x, y + h - r, r);
                // ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 2:
                var r = 0.4;
                var w = 0.8;
                var h = 1.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                // if ((this.version[0] < 2) || (this.version[0] == 2 && this.version[1] < 25) || (this.version[0] == 2 && this.version[1] == 25 && this.version[2] < 9)) {
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                // } else {
                    ctx.fillStyle = Color.WHITE;
                // }
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                //ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                //ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                //ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 3:
                var r = 0.4;
                var w = 2.8;
                var h = 0.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                // if ((this.version[0] < 2) || (this.version[0] == 2 && this.version[1] < 25) || (this.version[0] == 2 && this.version[1] == 25 && this.version[2] < 9)) {
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                // } else {
                    ctx.fillStyle = Color.WHITE;
                // }
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                //ctx.arcTo(x + w, y, x + w, y + r, r);
                //ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                //ctx.arcTo(x, y + h, x, y + h - r, r);
                //ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 4:
                var r = 0.4;
                var w = 0.8;
                var h = 2.8;
                x = x - 0.40;
                y = y - 0.40;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                // if ((this.version[0] < 2) || (this.version[0] == 2 && this.version[1] < 25) || (this.version[0] == 2 && this.version[1] == 25 && this.version[2] < 9)) {
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                // } else {
                    ctx.fillStyle = Color.WHITE;
                // }
                if (ccolor !== "none") {
                    ctx.strokeStyle = ccolor;
                } else {
                    ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                }
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                //ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                //ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                //ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    P.draw_arc = function(ctx, num, x, y, ccolor = "none") {
        var r = 0.2,
            th;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        if (ccolor !== "none") {
            ctx.fillStyle = ccolor;
            ctx.strokeStyle = ccolor;
        } else {
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.BLACK;
        }
        ctx.lineWidth = 3;
        ctx.lineJoin = "bevel"
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                th = this.rotate_theta(90 * (num - 1) + 180) ;
                ctx.moveTo((x + Math.sqrt(2) * 0.5 * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * Math.sin(th + Math.PI * 0.25)));
                ctx.arcTo( (x + Math.sqrt(2) * 0.5 * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * Math.sin(th - Math.PI * 0.25)),
                           (x + Math.sqrt(2) * 0.5 * Math.cos(th - Math.PI * 0.75)), (y + Math.sqrt(2) * 0.5 * Math.sin(th - Math.PI * 0.75)), 1);
                ctx.stroke();
                break;
            case 5:
            case 6:
                ctx.beginPath();
                th = this.rotate_theta(90 * (num - 5));
                ctx.moveTo((x + Math.sqrt(2) * 0.5 * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * Math.sin(th + Math.PI * 0.25)));
                ctx.lineTo((x + Math.sqrt(2) * 0.5 * Math.cos(th - Math.PI * 0.75)), (y + Math.sqrt(2) * 0.5 * Math.sin(th - Math.PI * 0.75)));
                ctx.stroke();
        }
    }

    P.draw_darts = function(ctx, num, x, y, ccolor = "none") {
        set_circle_style(ctx, 13, ccolor);
        if (1 <= num, num <= 4) {
            for (var i = 1; i <= num; i++) {
                this.draw_circle(ctx, x, y, Math.sqrt(2) * 0.5 * (2 * i - 1));
            }
        }
        for (var i = 0; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo((x + Math.sqrt(2) * 0.5 * Math.cos(Math.PI * 0.5 * i)), (y + Math.sqrt(2) * 0.5 * Math.sin(Math.PI * 0.5 * i)));
            ctx.lineTo((x + Math.sqrt(2) * 0.5 * Math.cos(Math.PI * 0.5 * i) * (2 * num - 1)), (y + Math.sqrt(2) * 0.5 * Math.sin(Math.PI * 0.5 * i) * (2 * num - 1)));
            ctx.stroke();
        }
    }

    P.draw_spans = function(ctx, num, x, y, ccolor = "none") {
        var h = 0.15;
        switch (num) {
            case 1:
                set_circle_style(ctx, 8);
                ctx.lineWidth = 3;
                ctx.beginPath()
                ctx.moveTo(x + 0.5, y - h);
                ctx.lineTo(x + 0.5, y + h);
                ctx.lineTo(x + h, y + 0.5);
                ctx.lineTo(x - h, y + 0.5);
                ctx.lineTo(x - 0.5, y + h);
                ctx.lineTo(x - 0.5, y - h);
                ctx.lineTo(x - h, y - 0.5);
                ctx.lineTo(x + h, y - 0.5);
                ctx.lineTo(x + 0.5, y - h);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    P.draw_polyomino = function(ctx, num, x, y, ccolor = "none") {
        ctx.setLineDash([]);
        if (ccolor !== "none") {
            ctx.fillStyle = ccolor;
        } else {
            ctx.fillStyle = Color.GREY_LIGHT;
        }
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "butt";
        var r = 0.25;
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_polygon(ctx, x + (i % 3 - 1) * r, y + ((i / 3 | 0) - 1) * r, r * 0.5 * Math.sqrt(2), 4, 45);
            }
        }
    }

    P.draw_polyhex = function(ctx, num, x, y, ccolor = "none") {
        ctx.setLineDash([]);
        if (ccolor !== "none") {
            ctx.fillStyle = ccolor;
        } else {
            ctx.fillStyle = Color.GREY_LIGHT;
        }
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "butt";
        var r = 0.2;
        var degrees = [-120, -60, 180, null, 0, 120, 60];
        var r2 = r * 1.23;
        for (var i = 0; i < 7; i++) {
            if (num[i] === 1) {
                if (i == 3) {
                    this.draw_polygon(ctx, x, y, r * 0.5 * Math.sqrt(2), 6, 30);
                } else {
                    this.draw_polygon(ctx, x + r2 * Math.cos(degrees[i] * Math.PI / 180), y + r2 * Math.sin(degrees[i] * Math.PI / 180), r * 0.5 * Math.sqrt(2), 6, 30);
                }
            }
        }
    }

    P.rotate_theta = function(th) {
        // FIXME
        //th = (th + this.theta);
        // if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        // if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

	return C;
})();
