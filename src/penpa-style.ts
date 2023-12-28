import type { Ctx } from './penpa-drawingcontext';
////////////////////////////
//Style
//
/////////////////////////////

// Colors: should be the same as in light_theme.css/dark_theme.css
export const Color = {
	BLACK: '#000000',
	BLACK_LIGHT: '#232323',
	BLUE: '#0000FF',
	BLUE_DARK_VERY: '#00008B',
	BLUE_LIGHT: '#187BCD',
	BLUE_LIGHT_VERY: '#C0E0FF',
	BLUE_SKY: '#3085D6',
	BROWN_LIGHT: '#EECAB1',
	GREEN: '#208020',
	GREEN_LIGHT: '#4C9900',
	GREEN_LIGHT_VERY: '#B3FFB3',
	GREY: '#999999',
	GREY_DARK: '#777777',
	GREY_DARK_LIGHT: '#B3B3B3',
	GREY_DARK_VERY: '#444444',
	// GREY_LIGHT: "#CCCCCC",
	GREY_LIGHT: '#CFCFCF', // ML Opaque color in SP
	GREY_LIGHT_VERY: '#F0F0F0',
	ORANGE_LIGHT: '#FFCC80',
	ORANGE_TRANSPARENT: '#FF670099', //"rgba(255, 103, 0, 0.6)",
	PINK_LIGHT: '#FFB3FF',
	PURPLE_LIGHT: '#CC99FF',
	RED: '#FF0000',
	RED_LIGHT: '#FFA3A3',
	RED_TRANSPARENT: '#FF0000B3',
	TRANSPARENTBLACK: '#00000000', //"rgba(0, 0, 0, 0)",
	TRANSPARENTWHITE: '#FFFFFF00', //"rgba(255, 255, 255, 0)",
	WHITE: '#FFFFFF',
	YELLOW: '#FFFFA3',
};

export function set_surface_style(ctx: Ctx, type: number) {
	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;
	//ctx.lineCap = "square";
	ctx.lineWidth = 0.5;
	switch (type) {
		case 0:
			ctx.fillStyle = Color.TRANSPARENTWHITE;
			break;
		case 1:
			ctx.fillStyle = Color.GREY_DARK_VERY;
			break;
		case 2:
			ctx.fillStyle = Color.GREEN_LIGHT_VERY;
			break;
		case 3:
			ctx.fillStyle = Color.GREY_LIGHT;
			break;
		case 4:
			ctx.fillStyle = Color.BLACK;
			break;
		case 5:
			ctx.fillStyle = Color.BLUE_LIGHT_VERY;
			break;
		case 6:
			ctx.fillStyle = Color.RED_LIGHT;
			break;
		case 7:
			ctx.fillStyle = Color.YELLOW;
			break;
		case 8:
			ctx.fillStyle = Color.GREY;
			break;
		case 9:
			ctx.fillStyle = Color.PINK_LIGHT;
			break;
		case 10:
			ctx.fillStyle = Color.ORANGE_LIGHT;
			break;
		case 11:
			ctx.fillStyle = Color.PURPLE_LIGHT;
			break;
		case 12:
			ctx.fillStyle = Color.BROWN_LIGHT;
			break;
		case 13:
			ctx.fillStyle = Color.ORANGE_TRANSPARENT;
			break;
		case 99:
			ctx.fillStyle = Color.GREY_LIGHT_VERY;
			break;
		case 100: // for conflicts
			ctx.fillStyle = Color.RED_LIGHT;
			break;
	}
	ctx.strokeStyle = ctx.fillStyle;
}

export function set_line_style(ctx: Ctx, type: number, ccolor: string = 'none') {
	const pu = { size: 1 };
	//Initialization
	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;
	//ctx.lineCap = "square";
	ctx.strokeStyle = Color.BLACK;
	ctx.lineWidth = 2;
	switch (type) {
		case 0:
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0;
			break;
		case 1: //grid
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 0.8;
			break;
		case 2: // grid thick
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 3 * 0.85; //ML
			break;
		case 21: // grid extra thick
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 5 * 0.85; //ML
			break;
		case 3:
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.GREEN;
			ctx.lineWidth = 3;
			break;
		case 4:
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 2;
			break;
		case 5:
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.GREY;
			ctx.lineWidth = 3;
			break;
		case 6:
			ctx.strokeStyle = Color.GREY;
			ctx.lineWidth = 12;
			break;
		case 7: // cage
		case 107:
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.GREY_DARK;
			ctx.lineWidth = 1;
			break;
		case 8:
			ctx.strokeStyle = Color.RED;
			ctx.lineWidth = 3;
			break;
		case 9:
			ctx.strokeStyle = Color.BLUE_LIGHT;
			ctx.lineWidth = 3;
			break;
		case 10: //cage
			// var b = pu.size * 0.1;
			// var w = pu.size * 0.1;
			var b = (pu.size * 4) / 64; //ML
			var w = (pu.size * 4) / 64;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 1;
			break;
		case 110: //cage
			// var b = pu.size * 0.08;
			// var w = pu.size * 0.1;
			var b = (pu.size * 4) / 64; //ML
			var w = (pu.size * 4) / 64;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.lineCap = 'round';
			if (ccolor !== 'none') {
				ctx.strokeStyle = ccolor;
			} else {
				ctx.strokeStyle = Color.BLACK;
			}
			// ctx.lineWidth = 1
			ctx.lineWidth = 0.9; //ML
			break;
		case 11: //grid dash
			var b = pu.size * 0.06;
			var w = pu.size * 0.14;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 1;
			break;
		case 12: //dash line
			var b = pu.size * 0.06;
			var w = pu.size * 0.14;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.strokeStyle = Color.GREY_DARK_VERY;
			ctx.lineWidth = 1;
			break;
		case 13: //bold dash
			var b = pu.size * 0.04;
			var w = pu.size * 0.21;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = (pu.size * 0.1 * 32) | 0; //ML
			break;
		case 14: //dash
			var b = pu.size * 0.11;
			var w = pu.size * 0.14;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.strokeStyle = Color.GREY_DARK;
			ctx.lineWidth = 2;
			break;
		case 15: //cage dash
			// var b = pu.size * 0.1;
			// var w = pu.size * 0.1;
			var b = (pu.size * 4) / 64; //ML
			var w = (pu.size * 4) / 64;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.lineCap = 'round';
			if (ccolor !== 'none') {
				ctx.strokeStyle = ccolor;
			} else {
				ctx.strokeStyle = Color.GREY_DARK;
			}
			ctx.lineWidth = 1;
			break;
		case 115: //cage dash
			// var b = pu.size * 0.08;
			// var w = pu.size * 0.1;
			var b = ((pu.size * 4) / 64) * 0.8; //ML
			var w = (pu.size * 4) / 64;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.lineCap = 'round';
			if (ccolor !== 'none') {
				ctx.strokeStyle = ccolor;
			} else {
				ctx.strokeStyle = Color.GREY_DARK;
			}
			// ctx.lineWidth = 1;
			ctx.lineWidth = 0.9; //ML
			break;
		case 16: // cage
		case 116:
			ctx.lineCap = 'round';
			if (ccolor !== 'none') {
				ctx.strokeStyle = ccolor;
			} else {
				ctx.strokeStyle = Color.BLACK;
			}
			ctx.lineWidth = 1;
			break;
		case 17: //bold dash for wall
			var b = pu.size * 0.12;
			var w = pu.size * 0.13;
			ctx.setLineDash([b, w]);
			ctx.lineDashOffset = b * 0.5;
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = pu.size * 0.1; //ML | 0;
			break;
		case 20:
			ctx.strokeStyle = Color.WHITE;
			ctx.lineWidth = 1;
			break;
		case 30: //double line
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.GREEN;
			ctx.lineWidth = 3;
			break;
		case 40: //short line
			ctx.strokeStyle = Color.GREY;
			ctx.lineWidth = 2;
			break;
		case 80: //grid-like line
			ctx.lineCap = 'round';
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 1;
			break;
		case 98: //x-mark
			ctx.strokeStyle = Color.GREEN;
			ctx.lineWidth = 1;
			break;
		case 99: //cursor
			ctx.strokeStyle = Color.RED;
			ctx.lineWidth = 2;
			break;
		case 100: //cursor_panel
			ctx.strokeStyle = Color.RED;
			ctx.lineWidth = 2.5;
			break;
		case 101: // Sudoku cursor
			ctx.strokeStyle = Color.RED_TRANSPARENT;
			ctx.lineWidth = 2;
			break;
	}
}

export function set_font_style(ctx: Ctx, size: number, type: number, ccolor: string = 'none') {
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.setLineDash([]);
	var fontfamily = 'Helvetica,Arial';
	ctx.font = size + 'px ' + fontfamily;
	switch (type) {
		case 0:
			ctx.fillStyle = Color.TRANSPARENTWHITE;
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 0.5;
			break;
		case 1:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.BLACK;
			}
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 2:
			ctx.fillStyle = Color.GREEN_LIGHT;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 3:
			ctx.fillStyle = Color.GREY;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 4:
			ctx.fillStyle = Color.WHITE;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 5:
			ctx.fillStyle = Color.BLACK;
			ctx.strokeStyle = Color.WHITE;
			ctx.lineWidth = 2;
			break;
		case 6:
			ctx.fillStyle = Color.BLACK;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 7:
			ctx.fillStyle = Color.WHITE;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 8:
			ctx.fillStyle = Color.BLUE_LIGHT;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 9:
			ctx.fillStyle = Color.BLUE;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 10:
			ctx.fillStyle = Color.RED;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 11:
			ctx.fillStyle = Color.WHITE;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
	}
}

export function set_circle_style(ctx: Ctx, num: number, ccolor: string = 'none') {
	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;
	//ctx.lineCap = "butt";
	ctx.strokeStyle = Color.BLACK;
	ctx.lineWidth = 1;
	switch (num) {
		case 1:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.WHITE;
			}
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 1;
			break;
		case 2:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
				ctx.strokeStyle = ccolor;
			} else {
				ctx.fillStyle = Color.BLACK;
				ctx.strokeStyle = Color.BLACK;
			}
			ctx.lineWidth = 1;
			break;
		case 3:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.GREY_LIGHT;
			}
			ctx.strokeStyle = Color.TRANSPARENTBLACK;
			ctx.lineWidth = 0; //ML
			break;
		case 4:
			ctx.setLineDash([4 / 38, 4 / 38]);
			if (ccolor !== 'none') {
				ctx.fillStyle = Color.TRANSPARENTWHITE;
				ctx.strokeStyle = ccolor;
			} else {
				ctx.fillStyle = Color.TRANSPARENTWHITE;
				ctx.strokeStyle = Color.BLACK;
			}
			ctx.lineWidth = 1;
			break;
		case 5:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.GREY_LIGHT;
			}
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 1;
			break;
		case 6:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.WHITE;
			}
			ctx.strokeStyle = Color.GREY;
			ctx.lineWidth = 2;
			break;
		case 7:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.WHITE;
			}
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
		case 8:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.WHITE;
			}
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 2;
			break;
		case 9:
			if (ccolor !== 'none') {
				ctx.fillStyle = ccolor;
			} else {
				ctx.fillStyle = Color.GREY_LIGHT;
			}
			ctx.strokeStyle = Color.BLACK;
			ctx.lineWidth = 2;
			break;
		case 10:
			ctx.fillStyle = Color.WHITE;
			ctx.strokeStyle = Color.BLACK;
			if (ccolor !== 'none') {
				ctx.strokeStyle = ccolor;
			} else {
				ctx.strokeStyle = Color.BLACK;
			}
			ctx.lineWidth = 2;
			break;
		case 11:
			ctx.fillStyle = Color.RED;
			ctx.strokeStyle = Color.RED;
			ctx.lineWidth = 1;
			break;
		case 12:
			ctx.fillStyle = Color.GREEN;
			ctx.strokeStyle = Color.GREEN;
			ctx.lineWidth = 1;
			break;
		case 13:
			if (ccolor !== 'none') {
				ctx.fillStyle = Color.TRANSPARENTWHITE;
				ctx.strokeStyle = ccolor;
			} else {
				ctx.fillStyle = Color.TRANSPARENTWHITE;
				ctx.strokeStyle = Color.BLACK;
			}
			ctx.lineWidth = 1;
			break;
		default:
			ctx.fillStyle = Color.TRANSPARENTWHITE;
			ctx.strokeStyle = Color.TRANSPARENTWHITE;
			ctx.lineWidth = 0; //ML
			break;
	}
}
