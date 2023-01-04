const PenpaNumber = (() => {
    function _constructor(pu, puzzle, size, decoder) {
        this.pu = pu;
        this.puzzle = puzzle;
        this.size = size;
		this.decoder = decoder;
    }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

	const {point2RC, point} = PenpaTools;

	P.draw_number = function(number, p) {
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
				const arrowshape = [[0, 0],[0, arrowlength],[arrowwidth / 2, arrowlength - arrowhead],[-arrowwidth / 2, arrowlength - arrowhead],[0, arrowlength]];
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
					90 : {shape: [[ arrowlength * 0.0  + 0.3,  arrowlength * 0.5  - 0.0], [-arrowlength * 0.0  + 0.3, -arrowlength * 0.5  - 0.0]], textpos: [-0.1,  0.05], textwidth: 0.7},
					180: {shape: [[ arrowlength * 0.5  + 0.0,  arrowlength * 0.0  - 0.3], [-arrowlength * 0.5  + 0.0, -arrowlength * 0.0  - 0.3]], textpos: [ 0.0,  0.15], textwidth: 0.8},
					0  : {shape: [[-arrowlength * 0.5  + 0.0,  arrowlength * 0.0  - 0.3], [ arrowlength * 0.5  + 0.0, -arrowlength * 0.0  - 0.3]], textpos: [ 0.0,  0.15], textwidth: 0.8},
					270: {shape: [[ arrowlength * 0.0  + 0.3, -arrowlength * 0.5  - 0.0], [-arrowlength * 0.0  + 0.3,  arrowlength * 0.5  - 0.0]], textpos: [-0.1,  0.05], textwidth: 0.7},
					135: {shape: [[ arrowlength * 0.35 + 0.19,  arrowlength * 0.35 - 0.19], [-arrowlength * 0.35 + 0.19, -arrowlength * 0.35 - 0.19]], textpos: [-0.05, 0.15], textwidth: 0.7},
					45 : {shape: [[-arrowlength * 0.35 - 0.19,  arrowlength * 0.35 - 0.19], [ arrowlength * 0.35 - 0.19, -arrowlength * 0.35 - 0.19]], textpos: [+0.05, 0.15], textwidth: 0.7},
					225: {shape: [[ arrowlength * 0.35 - 0.19, -arrowlength * 0.35 - 0.19], [-arrowlength * 0.35 - 0.19,  arrowlength * 0.35 - 0.19]], textpos: [+0.05, 0.15], textwidth: 0.7},
					315: {shape: [[-arrowlength * 0.35 + 0.19, -arrowlength * 0.35 - 0.19], [ arrowlength * 0.35 + 0.19,  arrowlength * 0.35 - 0.19]], textpos: [-0.05, 0.15], textwidth: 0.7},
				};
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.42);
				set_font_style(ctx, 0.7, number[1]);
				width = 0.8;
				let direction = directionMap[text.slice(-2)];
				let arrow = arrowMap[direction];
				if (arrow !== undefined) {
					text = text.slice(0, -2);
					if (text.length > 0) {
						width = arrow.textwidth;
						const opts = Object.assign(ctx.toOpts(), {
							center: [p_y - 0.06 + arrow.textpos[1], p_x + arrow.textpos[0]],
							borderColor: Color.TRANSPARENTWHITE,
							text: text,
						});
						this.decoder.puzzleAdd(this.puzzle, 'overlays', opts, 'number arrow:' + JSON.stringify(number));
					}
					let wp = this.arrowWaypoints(p_x + arrow.shape[0][0], p_y + arrow.shape[0][1], p_x + arrow.shape[1][0], p_y + arrow.shape[1][1], arrowshape);
					ctx.strokeStyle = ctx.fillStyle; // Because we use lines, not fill
					ctx.lineWidth = 2;
					// ctx.lineJoin = 'miter';
					 ctx.lineCap = 'butt';
					if (number[1] === 0) ctx.strokeStyle = Color.BLACK_LIGHT;
					this.decoder.puzzleAdd(this.puzzle, 'lines', Object.assign(ctx.toOpts('line'), {
						//thickness: 4,
						wayPoints: PenpaTools.reduceWayPoints(wp),
						target: 'cell-grids' // pick the right z-order
						}), 'number arrow:' + JSON.stringify(number));
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
				//p_y += 0.02 * factor;
				//p_y += -0.03;
				width = 0.9;
				break;
			case "6": //medium
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.25);
				set_font_style(ctx, 0.4, number[1]);
				//p_y += 0.03 * factor;
				//p_y += -0.02;
				width = 0.9;
				break;
			case "10": //big
				this.draw_numbercircle(ctx, number, p, p_x, p_y, 0.36);
				set_font_style(ctx, 0.6, number[1]);
				//p_y += 0.03 * factor;
				p_y +=  0.01;
				width = 0.8;
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
						width = 0.8;
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
					//set_font_style(ctx, 0.5, number[1]);
					//set_circle_style(ctx, 7);
					//this.ctx.fillRect(p_x - 0.2 * this.size, p_y - 0.25 * this.size, this.ctx.measureText(this[pu].number[i][0]).width, 0.5 * this.size);
				}
				set_font_style(ctx, 0.5, number[1]);
				//ctx.fillStyle = '#ff0000'
				p_x += -0.2;
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
			this.draw_rect(ctx, rc[1], rc[0], 0.40, 0.40);
			//draw_circle(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 6) {
			set_circle_style(ctx, 1);
			this.draw_circle(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 7) {
			set_circle_style(ctx, 2);
			this.draw_circle(ctx, rc[1], rc[0], 0.18);
		} else if (number[1] === 11) {
			set_circle_style(ctx, 11);
			this.draw_circle(ctx, rc[1], rc[0], 0.18);
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
            this.draw_circle(ctx, p_x, p_y, size);
			// ctx['stroke-width'] = 0
        } else if (number[1] === 6) { //WHITE
			//ctx.target = 'overlay';
			set_circle_style(ctx, 1);
            this.draw_circle(ctx, p_x, p_y, size);
			// ctx['stroke-width'] = 0
        } else if (number[1] === 7) { //BLACK
			//ctx.target = 'overlay';
			set_circle_style(ctx, 2);
            this.draw_circle(ctx, p_x, p_y, size);
			ctx['stroke-width'] = 0
        } else if (number[1] === 11) { //RED
			//ctx.target = 'overlay';
			set_circle_style(ctx, 11);
			// Draw twice because RED in Sudokupad has alpha 0.5
            this.draw_circle(ctx, p_x, p_y, size);
            this.draw_circle(ctx, p_x, p_y, size);
			ctx['stroke-width'] = 0
        }
    }

	P.draw_circle = function(ctx, x, y, r) {
		let opts = Object.assign(ctx.toOpts(), {
			rounded: true,
			center: [y, x],
			width: 2 * r,
			height: 2 * r,
			target: ctx.target || 'cages',
		});
		this.decoder.puzzleAdd(this.puzzle, 'underlays', opts);
    }

	P.draw_rect = function(ctx, x, y, w, h) {
		let opts = Object.assign(ctx.toOpts(), {
			//opts.rounded = false;
			center: [y, x],
			width: w,
			height: h,
		});
		this.decoder.puzzleAdd(this.puzzle, 'underlays', opts);
    }

    P.arrowWaypoints = function(startX, startY, endX, endY, a) {
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
		wp = [];
        for (var i = 0; i < a.length; i ++) {
            var x = a[i][1] * cos - a[i][0] * sin + startX;
            var y = a[i][1] * sin + a[i][0] * cos + startY;
            wp.push([y, x]);
        }
		return wp;
    }

	return C;
})();
