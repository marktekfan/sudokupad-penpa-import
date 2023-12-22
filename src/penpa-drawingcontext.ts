import { Color } from './penpa-style';
import { PenpaTools } from './penpa-tools';

type PathType =
	| ['Z' | 'z']
	| ['M' | 'm' | 'L' | 'l', number, number]
	| ['Q' | 'q', number, number, number, number]
	| ['A' | 'a', number, number, number, number, number, number, number, [number, number]];

export class Ctx {
	// Injectable constants
	static ctcSize = 64;
	static penpaSize = 38;

	lineDash: number[] = [];
	lineDashOffset = 0;
	lineWidth = 0;
	fillStyle = Color.TRANSPARENTWHITE;
	strokeStyle = Color.TRANSPARENTWHITE;
	font: string | null = null;
	lineCap = 'round';
	lineJoin = 'round';
	textAlign = 'center';
	textBaseline = 'middle';
	angle = 0;
	ctcSize = Ctx.ctcSize;
	penpaSize = Ctx.penpaSize;
	path: PathType[] = [];
	_strokeStarted = false;
	_strokeCommand = '';
	isFill = false;
	_text?: string;
	x = 0;
	y = 0;

	private _stack: object[] = [];

	constructor() {
		this._stack = [];
		this.reset();
	}

	reset() {
		this.lineDash = [];
		this.lineDashOffset = 0;
		this.lineWidth = 0;
		this.fillStyle = Color.TRANSPARENTWHITE;
		this.strokeStyle = Color.TRANSPARENTWHITE;
		this.font = null;
		this.lineCap = 'round';
		this.lineJoin = 'round';
		this.textAlign = 'center';
		this.textBaseline = 'middle';
		this.angle = 0;
		this.ctcSize = Number(Ctx.ctcSize);
		this.penpaSize = Math.min(Math.max(Number(Ctx.penpaSize), 28), 42);
		this.path = [];
		this._strokeStarted = false;
		this._strokeCommand = '';
		this.isFill = false;
		this._text = undefined;
		this.x = 0;
		this.y = 0;
	}

	//helper function to map canvas-textAlign to svg-textAnchor
	static _getTextAnchor(textAlign: string) {
		const mapping: Dictionary<string> = { left: 'start', right: 'end', center: 'middle', start: 'start', end: 'end' };
		return mapping[textAlign] || mapping.start;
	}
	//helper function to map canvas-textBaseline to svg-dominantBaseline
	static _getDominantBaseline(textBaseline: string) {
		const mapping: Dictionary<string> = {
			alphabetic: 'alphabetic',
			hanging: 'hanging',
			top: 'text-before-edge',
			bottom: 'text-after-edge',
			middle: 'middle',
		};
		return mapping[textBaseline] || mapping.alphabetic;
	}
	push() {
		let state = Object.assign({}, this) as any;
		delete state._stack;
		delete state.path;
		this._stack.push(state);
	}
	pop() {
		if (this._stack.length > 0) {
			let state = this._stack.pop();
			Object.assign(this, state);
		}
	}
	setLineDash(dash: number[]) {
		this.lineDash = dash;
	}

	beginPath() {
		this._strokeStarted = false;
		this._strokeCommand = '';
	}
	moveTo(x: number, y: number) {
		this._strokeStarted = true;
		this.path.push(['M', x, y]);
		this.x = x;
		this.y = y;
		this._strokeCommand = 'M';
	}
	lineTo(x: number, y: number) {
		let dx = x - this.x;
		let dy = y - this.y;
		if (dx === 0 && dy === 0 && this._strokeCommand != 'M') {
			return;
		}
		this.path.push(['l', dx, dy]);
		this.x = x;
		this.y = y;
		this._strokeCommand = 'L';
	}
	arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw = false) {
		function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
			return {
				x: centerX + radius * Math.cos(angle),
				y: centerY + radius * Math.sin(angle),
			};
		}
		const fullCircle = Math.round(((endAngle - startAngle) * 180) / Math.PI) === 360;
		if (fullCircle) {
			if (radius > 0.06) {
				this.arc(x, y, radius, 0, Math.PI, ccw);
				this.arc(x, y, radius, Math.PI, 0, ccw);
				this.path.push(['z']);
				return;
			}
			startAngle += ccw ? -0.1 : 0.1;
			// endAngle += 0.1;
		}
		let start = polarToCartesian(x, y, radius, endAngle);
		let end = polarToCartesian(x, y, radius, startAngle);
		if (!this._strokeStarted) {
			this.moveTo(start.x, start.y);
		} else {
			this.lineTo(start.x, start.y);
		}

		const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
		const sweep = ccw ? 1 : 0;
		this.path.push(['a', radius, radius, 1, largeArcFlag, sweep, end.x - this.x, end.y - this.y, [x, y]]);
		this.x = end.x;
		this.y = end.y;
		this._strokeCommand = 'A';
	}
	// arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
	//     let start = {x: x1, y: y1};
	//     let end = {x: x2, y: y2};

	//     let largeArcFlag = 0;//endAngle - startAngle <= 180 ? "0" : "1";

	//     // if (start.x !== this.x || start.y != this.y)
	//     //     this.path.push(['M', start.x, start.y]);
	//     //this.path.push(['A', radius, radius, 0, largeArcFlag, 1, end.x, end.y]);
	//     this.path.push(['a', radius, radius, 0, largeArcFlag, 1, end.x - this.x, end.y - this.y]);
	//     this.x = end.x;
	//     this.y = end.y;
	//     this._strokeCommand = 'A';
	// }
	quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
		//this.path.push(['Q', cpx, cpy, x, y]);
		this.path.push(['q', cpx - this.x, cpy - this.y, x - this.x, y - this.y]);
		this.x = x;
		this.y = y;
		this._strokeCommand = 'A';
	}
	closePath() {
		this.path.push(['z']);
		this._strokeCommand = '';
	}
	stroke() {}
	fill() {
		this.isFill = true;
	}
	text(text: string, x: number, y: number) {
		if (!text || text.length === 0) return;
		const fontsize = Number(this.font!.split('px')[0]);
		this._text = text;
		this.x = x;
		this.y = y + 0.28 * fontsize;
	}

	arrow(startX: number, startY: number, endX: number, endY: number, controlPoints: number[]) {
		let cp = [...controlPoints];
		while (cp[0] === 0 && cp[1] === 0) cp.splice(0, 2);
		while (cp.length >= 4 && cp[0] === cp[2] && cp[1] === cp[3]) cp.splice(0, 2);
		controlPoints = cp;

		if (controlPoints.length === 6 && cp[1] < 0.1) {
			if (this.fillStyle === this.strokeStyle || !PenpaTools.ColorIsVisible(this.strokeStyle) || this.strokeStyle === Color.WHITE) {
				// simple narrow arrow drawable with a single line
				return this._arrowLine(startX, startY, endX, endY, controlPoints);
			}
		}
		return this._arrowN(startX, startY, endX, endY, controlPoints);
	}
	_arrowN(startX: number, startY: number, endX: number, endY: number, controlPoints: number[]) {
		let dx = endX - startX;
		let dy = endY - startY;
		let len = Math.sqrt(dx * dx + dy * dy);
		let sin = dy / len;
		let cos = dx / len;
		let a = [];
		// this.strokeStyle = '#00c040'
		a.push(0, 0);
		for (let i = 0; i < controlPoints.length; i += 2) {
			let x = controlPoints[i];
			let y = controlPoints[i + 1];
			a.push(x < 0 ? len + x : x, y);
		}
		a.push(len, 0);
		for (let i = controlPoints.length; i > 0; i -= 2) {
			let x = controlPoints[i - 2];
			let y = controlPoints[i - 1];
			a.push(x < 0 ? len + x : x, -y);
		}
		//a.push(0, 0);
		for (let i = 0; i < a.length; i += 2) {
			let x = a[i] * cos - a[i + 1] * sin + startX;
			let y = a[i] * sin + a[i + 1] * cos + startY;
			if (i === 0) this.moveTo(x, y);
			else this.lineTo(x, y);
		}
		this.closePath();
	}
	_arrowLine(startX: number, startY: number, endX: number, endY: number, controlPoints: number[]) {
		// Highly tweaked lineWidth calculation, don't touch!
		this.lineWidth = controlPoints[1] * 2.2 * this.penpaSize - 0.2;
		this.lineJoin = 'miter';
		this.lineCap = 'butt';
		this.strokeStyle = this.fillStyle;
		// this.strokeStyle = '#ff0000'
		let dx = endX - startX;
		let dy = endY - startY;
		let len = Math.sqrt(dx * dx + dy * dy);
		let sin = dy / len;
		let cos = dx / len;
		let a = [];
		let x;
		let y;
		const headwidth = controlPoints[5];
		const taillength = controlPoints[2] + controlPoints[5] * 0.45;
		// Butt
		a.push(0, 0);
		// back of head
		x = taillength;
		a.push(x < 0 ? len + x : x, 0);
		// arrowhead side 1
		y = headwidth;
		a.push(x < 0 ? len + x : x, y / 2);
		// tip
		a.push(len - 0.05, 0);
		// arrowhead side 2
		a.push(x < 0 ? len + x : x, -y / 2);
		// back of head
		a.push(x < 0 ? len + x : x, 0);

		for (let i = 0; i < a.length; i += 2) {
			let x = a[i] * cos - a[i + 1] * sin + startX;
			let y = a[i] * sin + a[i + 1] * cos + startY;
			if (i === 0) this.moveTo(x, y);
			else this.lineTo(x, y);
		}
	}
}

export class DrawingContext extends Ctx {
	target?: string;
	role?: string;

	reset() {
		super.reset();
		this.target = undefined;
		this.role = undefined;
	}

	getPathString() {
		const mapPathToPuzzle = function (p: PathType, size: number) {
			const { round1, round3 } = PenpaTools;
			const scale1 = (d: number) => round1(d * size);
			const scale3 = (d: number) => round3(d * size);
			switch (p[0]) {
				case 'Z':
				case 'z':
					return p[0];
				case 'M':
				case 'm':
				case 'L':
				case 'l':
					return `${p[0]}${scale1(p[1])} ${scale1(p[2])}`;
				case 'A':
				case 'a':
					// Large radii should round to more decimals for better drawing precision
					if (Math.max(p[1], p[2]) > 0.5) {
						return `${p[0]}${scale3(p[1])} ${scale3(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale3(p[6])} ${scale3(p[7])}`;
					} else {
						return `${p[0]}${scale1(p[1])} ${scale1(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale1(p[6])} ${scale1(p[7])}`;
					}
				case 'Q':
				case 'q':
					return `${p[0]}${scale1(p[1])} ${scale1(p[2])} ${scale1(p[3])} ${scale1(p[4])}`;
			}
			// should be unreachable
			console.error('UNEXPECTED PATH COMMAND: ', p);
			return (p as []).join(' ');
		};

		return this.path.map(d => mapPathToPuzzle(d, this.ctcSize)).join('');
	}

	convertPathToWaypoints = (path = this.path) => {
		const { round2 } = PenpaTools;
		const round = (d: number) => round2(d);

		//return null;

		if (path.length < 2) return null;
		let wp = [];
		let started = false;
		let x = 0;
		let y = 0;
		let startx = 0;
		let starty = 0;
		for (let p of path) {
			// Reset origin
			if (p[0] === 'M' || p[0] === 'L') {
				x = 0;
				y = 0;
			}

			switch (p[0]) {
				case 'M':
				case 'm': {
					if (p.length !== 3) break;
					if (started) return null;
					started = true;
					startx = x = x + p[1];
					starty = y = y + p[2];
					wp.push([round(y), round(x)]);
					break;
				}
				case 'L':
				case 'l': {
					if (p.length !== 3) break;
					x = x + p[1];
					y = y + p[2];
					wp.push([round(y), round(x)]);
					break;
				}
				case 'a': {
					if (p.length !== 9) break;
					let [_cmd, r1, _r2, _one, _largearc, sweep, x2, y2, center] = p;
					if (!Array.isArray(center)) return null;
					let [cx, cy] = center;
					x2 += x;
					y2 += y;
					let dAx = x - cx;
					let dAy = y - cy;
					let dBx = x2 - cx;
					let dBy = y2 - cy;
					let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
					let angle1 = Math.atan2(dAy, dAx);
					if (angle < 0) {
						angle = -angle;
					}
					let length = angle * r1;
					let steps = Math.max(2, Math.floor(length * 9));
					//let steps = Math.min(12, Math.max(6, Math.floor(1 * angle / r1)));
					let step = angle / steps;
					step *= sweep ? 1 : -1;
					let a = 0;
					for (let i = 1; i < steps; i++) {
						a += step;
						let si = Math.sin(angle1 + a);
						let co = Math.cos(angle1 + a);
						let xx = cx + r1 * co;
						let yy = cy + r1 * si;
						wp.push([round(yy), round(xx)]);
					}
					x = x2;
					y = y2;
					wp.push([round(y), round(x)]);
					break;
				}
				case 'Z':
				case 'z': {
					wp.push([round(starty), round(startx)]);
					break;
				}

				case 'A':
				case 'Q':
				case 'q':
				default:
					// Not implemented
					console.error('UNEXPECTED PATH COMMAND: ', p[0]);
					return null;
			}
		}
		return started ? wp : null;
	};

	getIntent = () => {
		if (this.path.length > 0) return 'line';
		else if (this._text) return 'text';
		else if (PenpaTools.ColorIsVisible(this.fillStyle)) return 'surface';

		return;
	};

	toOpts = (intent?: string) => {
		const { round1, round2 } = PenpaTools;
		let opts: any = {};
		intent = intent || this.getIntent();
		if (intent === 'line') {
			if (this.lineWidth && PenpaTools.ColorIsVisible(this.strokeStyle)) {
				opts.thickness = round1((this.lineWidth * this.ctcSize) / this.penpaSize);
				opts.color = this.strokeStyle;
			}
			if (this.lineCap && this.lineCap !== 'round') {
				opts['stroke-linecap'] = this.lineCap;
				if (this.lineJoin && this.lineJoin !== 'round') opts['stroke-linejoin'] = this.lineJoin;
			}
			if (this.path.length > 0) {
				let wayPoints = this.convertPathToWaypoints(this.path);
				if (wayPoints) {
					opts.wayPoints = wayPoints;
				} else {
					opts.d = this.getPathString();
				}
				this.path.length = 0; // path consumed
			}
			if (this.isFill) {
				opts.fill = this.fillStyle;
			}
		} else {
			if (this.font) {
				if (PenpaTools.ColorIsVisible(this.strokeStyle)) {
					if (this.strokeStyle !== this.fillStyle) {
						opts.borderColor = this.strokeStyle;
					}
				}
				const fontsize = Number(this.font.split('px')[0]);
				opts.fontSize = round1(fontsize * this.ctcSize - 4); // -4 to compensate for fontSize calculation in SP App.convertPuzzle
				if (this.fillStyle && this.fillStyle !== Color.BLACK) {
					opts.color = this.fillStyle;
				}
				opts['stroke-width'] = round1(((this.lineWidth || 0) * this.ctcSize) / this.penpaSize);
				if (this._text) {
					if (PenpaTools.ColorIsVisible(this.strokeStyle)) {
						opts.textStroke = this.strokeStyle;
					}
					opts.text = this._text;
					opts.center = [round2(this.y), round2(this.x)];
					this._text = undefined; // text is consumed
					//Don't need set font-family
					// opts["font-family"] = font.family
					if (this.textBaseline && this.textBaseline !== 'middle') {
						opts['dominant-baseline'] = Ctx._getDominantBaseline(this.textBaseline);
					}
					if (this.textAlign && this.textAlign !== 'center') {
						opts['text-anchor'] = Ctx._getTextAnchor(this.textAlign);
					}

					// FIXME: Remove when Sudokupad has optional width and height
					opts.height = 0;
					opts.width = 0;
				}
			} else {
				// surface
				if (this.lineWidth) {
					if (PenpaTools.ColorIsVisible(this.strokeStyle)) {
						if (this.strokeStyle !== this.fillStyle) {
							opts.borderColor = this.strokeStyle;
						}
					}
					if (this.strokeStyle !== this.fillStyle) {
						opts.borderSize = round1((this.lineWidth * this.ctcSize) / this.penpaSize);
					}
				}
				if (PenpaTools.ColorIsVisible(this.fillStyle)) {
					opts.backgroundColor = this.fillStyle;
				}
			}
			if (this.angle) {
				opts.angle = this.angle;
				this.angle = 0;
			}
		}

		if (this.lineDash.length > 0) {
			const scale = (d: number) => round1(d * this.ctcSize);
			opts['stroke-dasharray'] = this.lineDash.map(scale).join(',');
			if (this.lineDashOffset) {
				opts['stroke-dashoffset'] = scale(this.lineDashOffset);
			}
		}

		if (this.target) {
			opts.target = this.target;
		}
		if (this.role) {
			opts.role = this.role;
		}

		return opts;
	};
}
