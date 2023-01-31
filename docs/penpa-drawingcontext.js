const DrawingContext = (() => {
    "use strict";
    function _constructor() {
        this.reset();
    }
    const C = _constructor, P = Object.assign(C.prototype, {constructor: C});

    P.reset = function() {
        this.lineDash = [];
        this.lineDashOffset = 0;
        this.lineWidth = 0;
        this.fillStyle = Color.TRANSPARENTWHITE;
        this.strokeStyle = Color.TRANSPARENTWHITE;
        this.font = undefined;
        this.lineCap = "round";
        this.textAlign = "center";
        this.textBaseline = "middle";
        this.ctcSize = Number(C.ctcSize);
        this.penpaSize = Math.min(Math.max(Number(C.penpaSize), 28), 42);
        this.path = []
        this._strokeStarted = false;
        this._fill = false;
        this._text = null;
        this.x = 0;
        this.y = 0;
    }

    // Injectable constants
    C.ctcSize = 64;
    C.penpaSize = 38;

    //helper function to map canvas-textAlign to svg-textAnchor
    function getTextAnchor(textAlign) {
        const mapping = { "left": "start", "right": "end", "center": "middle", "start": "start", "end": "end" };
        return mapping[textAlign] || mapping.start;
    }
    //helper function to map canvas-textBaseline to svg-dominantBaseline
    function getDominantBaseline(textBaseline) {
        const mapping = { "alphabetic": "alphabetic", "hanging": "hanging", "top": "text-before-edge", "bottom": "text-after-edge", "middle": "middle" };
        return mapping[textBaseline] || mapping.alphabetic;
    }

    P.setLineDash = function(dash) {
        this.lineDash = dash;
    }

    P.beginPath = function() {
        this._strokeStarted = false;
    }
    P.moveTo = function(x, y) {
        this._strokeStarted = true;
        this.path.push(['M', x, y]);
        this.x = x;
        this.y = y;
    }
    P.lineTo = function(x, y) {
        let dx = x - this.x;
        let dy = y - this.y;
        if (dx === 0 && dy === 0) {
            return;
        }
        this.path.push(['l', dx, dy]);
        this.x = x;
        this.y = y;
    }
    P.arc = function(x, y, radius, startAngle, endAngle, ccw = false) {
        function polarToCartesian(centerX, centerY, radius, angle) {
            return {
                x: centerX + (radius * Math.cos(angle)),
                y: centerY + (radius * Math.sin(angle))
            };
        }
        const fullCircle = Math.round((endAngle - startAngle) * 180 / Math.PI) === 360;
        if (fullCircle) {
            if (radius > 0.06) {
                this.arc(x, y, radius, 0, Math.PI, ccw)
                this.arc(x, y, radius, Math.PI, 0, ccw)
                this.path.push(['z']);
                return;
            }
            startAngle += ccw ? -0.1 : 0.1;
            // endAngle += 0.1;
        }
        let start = polarToCartesian(x, y, radius, endAngle);
        let end = polarToCartesian(x, y, radius, startAngle);
        if (!this._strokeStarted) {
            this.moveTo(start.x, start.y)
        }
        else {
            this.lineTo(start.x, start.y)
        }

        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
        const sweep = ccw ? 1 : 0
        this.path.push(['a', radius, radius, 1, largeArcFlag, sweep, end.x - this.x, end.y - this.y]);
        this.x = end.x;
        this.y = end.y;
    }
    P.arcTo = function(x1, y1, x2, y2, radius) {
        let start = {x: x1, y: y1};
        let end = {x: x2, y: y2};

        let largeArcFlag = 0;//endAngle - startAngle <= 180 ? "0" : "1";

        // if (start.x !== this.x || start.y != this.y)
        //     this.path.push(['M', start.x, start.y]);
        //this.path.push(['A', radius, radius, 0, largeArcFlag, 1, end.x, end.y]);
        this.path.push(['a', radius, radius, 0, largeArcFlag, 1, end.x - this.x, end.y - this.y]);
        this.x = end.x;
        this.y = end.y;
    }
    P.quadraticCurveTo = function(cpx, cpy, x, y) {
        //this.path.push(['Q', cpx, cpy, x, y]);
        this.path.push(['q', cpx - this.x, cpy - this.y, x - this.x, y - this.y]);
        this.x = x;
        this.y = y;
    }
    P.closePath = function() {
        this.path.push(['z']);
    }
    P.stroke = function() {
    }
    P.fill = function() {
        this._fill = true;
    }
    P.text = function(text, x, y) {
        if (!text || text.length === 0) return;
        const fontsize = Number(this.font.split('px')[0]);
        this._text = text;
        this.x = x;
        this.y = y + 0.28 * fontsize;
    }

    P.arrow = function(startX, startY, endX, endY, controlPoints) {
        let cp = [...controlPoints];
        while (cp[0] === 0 && cp[1] === 0) cp.splice(0, 2);
        while (cp.length >= 4 && cp[0] === cp[2] && cp[1] === cp[3]) cp.splice(0, 2);
        controlPoints = cp;

        if(controlPoints.length === 6 && cp[1] < 0.1) {
            if (this.fillStyle === this.strokeStyle
                || PenpaTools.ColorIsTransparent(this.strokeStyle)
                || this.strokeStyle === Color.WHITE) {
                // simple narrow arrow drawable with a single line
                return this._arrowLine(startX, startY, endX, endY, controlPoints);
            }
        }
        return this._arrowN(startX, startY, endX, endY, controlPoints);
    }
    P._arrowN = function(startX, startY, endX, endY, controlPoints) {
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
    P._arrowLine = function(startX, startY, endX, endY, controlPoints) {
        // Highly tweaked lineWidth calculation, don't touch!
        this.lineWidth = (controlPoints[1] * 2.2 * this.penpaSize) - 0.2;
        this.lineJoin = 'miter'
        this.lineCap = 'butt'
        this.strokeStyle = this.fillStyle
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
        a.push(x < 0 ? len + x : x, y/2);
        // tip
        a.push(len - 0.05, 0);
        // arrowhead side 2
        a.push(x < 0 ? len + x : x, -y/2);
        // back of head
        a.push(x < 0 ? len + x : x, 0);

        for (let i = 0; i < a.length; i += 2) {
            let x = a[i] * cos - a[i + 1] * sin + startX;
            let y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) this.moveTo(x, y);
            else this.lineTo(x, y);
        }
    }

    const mapPathToPuzzle = function(p, size) {
        const {round1, round3} = PenpaTools;
        const scale1 = (d) => round1(d * size);
        const scale2 = (d) => round3(d * size);
        if(p.length === 1) {
            return p[0];
        }
        else if('MmLl'.includes(p[0])) {
            return `${p[0]}${scale1(p[1])} ${scale1(p[2])}`;
        }
        else if('A'.includes(p[0])) {
            return `${p[0]}${scale1(p[1])} ${scale1(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale1(p[6])} ${scale1(p[7])}`;
        }
        else if('a'.includes(p[0])) {
            if (Math.max(p[1], p[2]) > 0.5) // Large radii should round with more decimals for better drawing precision
                return `${p[0]}${scale2(p[1])} ${scale2(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale2(p[6])} ${scale2(p[7])}`;
            else
                return `${p[0]}${scale1(p[1])} ${scale1(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale1(p[6])} ${scale1(p[7])}`;
        }
        else if('Qq'.includes(p[0])) {
            return `${p[0]}${scale1(p[1])} ${scale1(p[2])} ${scale1(p[3])} ${scale1(p[4])}`;
        }
        else {
            console.error('UNEXPECTED PATH COMMAND: ', p);
            // debugger;
            return p.join(' ');
        }
    }

    P.convertPathToWaypoints = function(path = this.path) {
        const {round3} = PenpaTools;
        const scale1 = (d) => round3(d);
        
        //return null;

        if (path.length < 2) return null;// || path.length > 10) return null;
        let wp = [];
        let started = false;
        let x = 0;
        let y = 0;
        let startx = 0;
        let starty = 0;
        for(let p of path) {
            switch (p[0]) {
                case 'M': {
                    if (started) return null;
                    started = true;
                    startx = x = p[1];
                    starty = y = p[2];                    
                    wp.push([scale1(y), scale1(x)]);
                    break;
                }
                case 'l': {
                    x = x + p[1];
                    y = y + p[2];
                    wp.push([scale1(y), scale1(x)]);
                    break;
                }
                case 'Z': 
                case 'z': 
                    wp.push([scale1(starty), scale1(startx)]);
                    break;

                default:
                    return null;
            }            
        }
        return started ? wp : null;
    }

    P.getIntent = function() {
        if (this.path.length > 0)
            return 'line';
        else if (this._text)
            return 'text';
        else if (this.fillStyle && !PenpaTools.ColorIsTransparent(this.fillStyle))
            return  'surface';

        return undefined;
    }

    P.toOpts = function(intent) {
        const {round, round1} = PenpaTools;
        let opts = {};
        intent = intent || this.getIntent()
        if (intent === 'line') {
            if (this.lineWidth && this.strokeStyle && !PenpaTools.ColorIsTransparent(this.strokeStyle)) {
                opts.thickness = round1(this.lineWidth * this.ctcSize / this.penpaSize);
                opts.color = this.strokeStyle;
            }
            if (this.lineCap && this.lineCap !== 'round') {
                opts['stroke-linecap'] = this.lineCap;
                if (this.lineJoin && this.lineJoin !== 'round')
                    opts['stroke-linejoin'] = this.lineJoin;
            }
            if (this.path.length > 0) {
                let wayPoints = this.convertPathToWaypoints(this.path);
                if (wayPoints) {
                    opts.wayPoints = wayPoints;
                }
                else {
                    opts.d = this.path.map(d => mapPathToPuzzle(d, this.ctcSize)).join('');
                }
                this.path.length = 0; // path consumed
            }
            if (this._fill) {
                opts.fill = this.fillStyle;
            }
        }
        else {
            if (this.strokeStyle && !PenpaTools.ColorIsTransparent(this.strokeStyle)) {
                if (this.strokeStyle !== this.fillStyle) {
                    opts.borderColor = this.strokeStyle;
                }
            }
            if (this.font) {
                const fontsize = this.font.split('px')[0];
                opts.fontSize = round1(fontsize * this.ctcSize - 4);// -4 to compensate for fontSize calculation in SP App.convertPuzzle
                if (this.fillStyle && this.fillStyle !== Color.BLACK) {
                    opts.color = this.fillStyle;
                }
                if (this.fillStyle === Color.WHITE) {
                    this['stroke-width'] = 0;
                }
                if(this['stroke-width'] !== undefined) {
                    opts['stroke-width'] = round1(this['stroke-width']);
                }
                else if (this.lineWidth > 0) {
                    opts['stroke-width'] = round1(this.lineWidth * this.ctcSize / this.penpaSize);
                }
                if (this._text) {
                    if (this.strokeStyle && !PenpaTools.ColorIsTransparent(this.strokeStyle)) {
                         opts.textStroke = this.strokeStyle;
                    }
                    opts.text = this._text;
                    opts.center = [this.y, this.x];
                    this._text = null; // text consumed
                    //Don't need set font-family
                    // opts["font-family"] = font.family
                    if (this.textBaseline && this.textBaseline !== 'middle') {
                        opts["dominant-baseline"] = getDominantBaseline(this.textBaseline);
                    }
                    if (this.textAlign && this.textAlign !== 'center') {
                        opts['text-anchor'] = getTextAnchor(this.textAlign)
                    }

                    // FIXME: Remove when Sudokupad has optional width and height
                    opts.height = 0;
                    opts.width = 0;
                }
            }
            else {
                if (this.lineWidth) {
                    if (this.strokeStyle !== this.fillStyle) {
                        opts.borderSize = round1(this.lineWidth * this.ctcSize / this.penpaSize);
                    }
                }
                if (this.fillStyle && !PenpaTools.ColorIsTransparent(this.fillStyle)) {
                    opts.backgroundColor = this.fillStyle;
                }
            }
            if (this.angle) {
                opts.angle = this.angle;
                this.angle = 0;
                // opts['clip-path'] = "circle(40px at 10% 50%)";
            }
            // opts['clip-path'] = "polygon(0% 0%, 100% 0%, 0% 100%)";
            
        }

        if (this.lineDash.length > 0) {
            const scale = (d) => round1(d * this.ctcSize);
            opts['stroke-dasharray'] = this.lineDash.map(scale).join(',');
            if (this.lineDashOffset) {
                opts['stroke-dashoffset'] = scale(this.lineDashOffset);
            }
        }

        if (this.target) {
            opts.target = this.target;
        }

        return opts;
    }

    return C;
})();
