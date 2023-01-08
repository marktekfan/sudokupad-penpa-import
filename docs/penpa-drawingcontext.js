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
        this.penpaSize = Number(C.penpaSize);
        this.path = []
        this._start = false;
        this._fill = false;
        this._text = undefined;
        this.x = 0;
        this.y = 0;
    }
    C.ctcSize = 64;
    C.penpaSize = 38;

    function isTransparent(color) {
        return color.slice(7) === '00';
    }

    //helper function to map canvas-textAlign to svg-textAnchor
    function getTextAnchor(textAlign) {
        const mapping = { "left": "start", "right": "end", "center": "middle", "start": "start", "end": "end" };
        return mapping[textAlign] || mapping.start;
    }
    //helper function to map canvas-textBaseline to svg-dominantBaseline
    function getDominantBaseline(textBaseline) {
        const mapping = { "alphabetic": "alphabetic", "hanging": "hanging", "top": "text-before-edge", "bottom": "text-after-edge", "middle": "central" };
        return mapping[textBaseline] || mapping.alphabetic;
    }

    P.setLineDash = function(dash) {
        this.lineDash = dash;
    }

    P.beginPath = function() {
        this._start = false;
    }
    P.moveTo = function(x, y) {
        this._start = true;
        this.path.push(['M', x, y]);
        this.x = x;
        this.y = y;
    }
    P.lineTo = function(x, y) {
        //this.path.push(['L', x, y]);
        this.path.push(['l', x - this.x, y - this.y]);
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
            this.arc(x, y, radius, 0, Math.PI, ccw)
            this.arc(x, y, radius, Math.PI, 0, ccw)
            this.path.push(['z']);
            return;
        }
        let start = polarToCartesian(x, y, radius, endAngle);
        let end = polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
        if (!this._start)
            this.moveTo(start.x, start.y)
        else
            this.lineTo(start.x, start.y)
        const sweep = ccw ? 1 : 0
        this.path.push(['a', radius, radius, 1, largeArcFlag, sweep, end.x - this.x, end.y - this.y]);
        this.x = end.x;
        this.y = end.y;
    }
    P.arcTo = function(x1, y1, x2, y2, radius) {
        var start = {x: x1, y: y1};
        var end = {x: x2, y: y2};

        var largeArcFlag = 0;//endAngle - startAngle <= 180 ? "0" : "1";

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
                || isTransparent(this.strokeStyle)
                || this.strokeStyle === Color.WHITE) {
                // simple narrow arrow
                return this._arrowLine(startX, startY, endX, endY, controlPoints);
            }
        }
        return this._arrowN(startX, startY, endX, endY, controlPoints);
    }
    P._arrowN = function(startX, startY, endX, endY, controlPoints) {
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
        // this.strokeStyle = '#00c040'
        a.push(0, 0);
        for (var i = 0; i < controlPoints.length; i += 2) {
            var x = controlPoints[i];
            var y = controlPoints[i + 1];
            a.push(x < 0 ? len + x : x, y);
        }
        a.push(len, 0);
        for (var i = controlPoints.length; i > 0; i -= 2) {
            var x = controlPoints[i - 2];
            var y = controlPoints[i - 1];
            a.push(x < 0 ? len + x : x, -y);
        }
        //a.push(0, 0);
        for (var i = 0; i < a.length; i += 2) {
            var x = a[i] * cos - a[i + 1] * sin + startX;
            var y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) this.moveTo(x, y);
            else this.lineTo(x, y);
        }
        this.closePath();
    }
    P._arrowLine = function(startX, startY, endX, endY, controlPoints) {
        // Highly tweaked lineWidth calcuation, don't touch!
        this.lineWidth = (controlPoints[1] * 2.2 * this.penpaSize) - 0.2;
        this.lineJoin = 'miter'
        this.lineCap = 'butt'
        this.strokeStyle = this.fillStyle
        // this.strokeStyle = '#ff0000'
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
        var x;
        var y;
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

        for (var i = 0; i < a.length; i += 2) {
            var x = a[i] * cos - a[i + 1] * sin + startX;
            var y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) this.moveTo(x, y);
            else this.lineTo(x, y);
        }
    }

    // P._pathToOpts = function() {
    //     const mapPathToPuzzle = p => {
    //         const {round, round1, round2, toCtcX, toCtcY} = PenpaTools;
    //         const mapX = (d) => round1(toCtcX(d) * this.ctcSize);
    //         const mapY = (d) => round1(toCtcY(d) * this.ctcSize);
    //         const scale = (d) => round1(d * this.ctcSize);
    //         const scale2 = (d) => round2(d * this.ctcSize);
    //             if(p.length === 1) {
    //             return p[0];
    //         }
    //         else if('ML'.includes(p[0])) {
    //             return `${p[0]}${mapX(p[1])} ${mapY(p[2])}`;
    //         }
    //         else if('ml'.includes(p[0])) {
    //             return `${p[0]}${scale(p[1])} ${scale(p[2])}`;
    //         }
    //         else if('A'.includes(p[0])) {
    //             return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${mapX(p[6])} ${mapY(p[7])}`;
    //         }
    //         else if('a'.includes(p[0])) {
    //             if (Math.max(p[1], p[2]) > 0.5) // Large radius should round with more decimals for better precision
    //                 return `${p[0]}${scale2(p[1])} ${scale2(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale2(p[6])} ${scale2(p[7])}`;
    //             else
    //                 return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale(p[6])} ${scale(p[7])}`;
    //         }
    //         else if('Q'.includes(p[0])) {
    //             return `${p[0]}${mapX(p[1])} ${mapY(p[2])} ${mapX(p[3])} ${mapY(p[4])}`;
    //         }
    //         else if('q'.includes(p[0])) {
    //             return `${p[0]}${scale(p[1])} ${scale(p[2])} ${scale(p[3])} ${scale(p[4])}`;
    //         }
    //         else {
    //             console.error('UNEXPECTED PATH COMMAND: ', p);
    //             debugger;
    //             return p.join(' ');
    //         }
    //     }
    //     let ctx = this;
    //     let opts = {};
    //     if (ctx.lineWidth && ctx.strokeStyle && !isTransparent(ctx.strokeStyle)) {
    //         opts.thickness = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
    //         opts.color = ctx.strokeStyle;
    //     }
    //     opts.d = this.path.map(mapPathToPuzzle).join('');
    //     if (this._fill) {
    //         opts.fill = ctx.fillStyle;
    //     }

    //     if (ctx.lineDash.length > 0) {
    //         opts['stroke-dasharray'] = ctx.lineDash.map(scale).map(round).join(',');
    //         if (ctx.lineDashOffset) {
    //             opts['stroke-dashoffset'] = scale(ctx.lineDashOffset);
    //         }
    //     }

    //     if (ctx.target) {
    //         opts.target = ctx.target;
    //     }
    //     if (ctx.lineCap && ctx.lineCap !== 'round') {
    //         opts['stroke-linecap'] = ctx.lineCap;
    //         if (ctx.lineJoin && ctx.lineJoin !== 'round')
    //             opts['stroke-linejoin'] = ctx.lineJoin;
    //     }

    //     // opts.color = '#0080ff'
    //     this.path.length = 0;
    //     return opts;
    // }

    // P.pathToOpts = function() {
    //     // return this._pathToOpts();
    //     return this.toOpts();
    // }

    P._mapPathToPuzzle = function(p, size) {
        const {round, round1, round2, toCtcX, toCtcY} = PenpaTools;
        const mapX = (d) => round1(toCtcX(d) * size);
        const mapY = (d) => round1(toCtcY(d) * size);
        const scale = (d) => round1(d * size);
        const scale2 = (d) => round2(d * size);
            if(p.length === 1) {
            return p[0];
        }
        else if('ML'.includes(p[0])) {
            return `${p[0]}${mapX(p[1])} ${mapY(p[2])}`;
        }
        else if('ml'.includes(p[0])) {
            return `${p[0]}${scale(p[1])} ${scale(p[2])}`;
        }
        else if('A'.includes(p[0])) {
            return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${mapX(p[6])} ${mapY(p[7])}`;
        }
        else if('a'.includes(p[0])) {
            if (Math.max(p[1], p[2]) > 0.5) // Large radius should round with more decimals for better precision
                return `${p[0]}${scale2(p[1])} ${scale2(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale2(p[6])} ${scale2(p[7])}`;
            else
                return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale(p[6])} ${scale(p[7])}`;
        }
        else if('Q'.includes(p[0])) {
            return `${p[0]}${mapX(p[1])} ${mapY(p[2])} ${mapX(p[3])} ${mapY(p[4])}`;
        }
        else if('q'.includes(p[0])) {
            return `${p[0]}${scale(p[1])} ${scale(p[2])} ${scale(p[3])} ${scale(p[4])}`;
        }
        else {
            console.error('UNEXPECTED PATH COMMAND: ', p);
            debugger;
            return p.join(' ');
        }
    }

    P.toOpts = function(intent) {
        const {round, round1} = PenpaTools;
        let ctx = this;
        let opts = {};
        if (!intent) {
            if (ctx.path.length > 0)
                intent = 'path';
            else if (ctx.font || ctx._text)
                intent = 'text';
            else if (ctx.fillStyle && !isTransparent(ctx.fillStyle))
                intent = 'surface';
            else if (ctx.lineWidth)
                intent = 'line';
            else
                intent = 'Should not come here';
        }

        // if (intent === 'path') {
        //     return this._pathToOpts();
        // }
        // else
        if (intent === 'line' || intent === 'path') {
            if (ctx.lineWidth && ctx.strokeStyle && !isTransparent(ctx.strokeStyle)) {
                opts.thickness = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
                opts.color = ctx.strokeStyle;
            }
            if (ctx.lineCap && ctx.lineCap !== 'round') {
                opts['stroke-linecap'] = ctx.lineCap;
                if (ctx.lineJoin && ctx.lineJoin !== 'round')
                    opts['stroke-linejoin'] = ctx.lineJoin;
            }
            if (ctx.path.length > 0) {
                opts.d = ctx.path.map(d => this._mapPathToPuzzle(d, this.ctcSize)).join('');
                ctx.path.length = 0;
            }
            if (ctx._fill) {
                opts.fill = ctx.fillStyle;
            }
        }
        else {
            if (ctx.strokeStyle && !isTransparent(ctx.strokeStyle)) {
                if (ctx.strokeStyle !== ctx.fillStyle)
                    opts.borderColor = ctx.strokeStyle;
            }
            if (ctx.font) {
                const fontsize = ctx.font.split('px')[0];
                opts.fontSize = round1(fontsize * this.ctcSize)
                if (ctx.fillStyle && ctx.fillStyle !== Color.BLACK) {
                    opts.color = ctx.fillStyle;
                }
                if (ctx.fillStyle === Color.WHITE) {
                    ctx['stroke-width'] = 0;
                }
                if(ctx['stroke-width'] !== undefined) {
                    opts['stroke-width'] = round1(ctx['stroke-width']);
                }
                else if (ctx.lineWidth > 0) {
                    opts['stroke-width'] = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
                }
                //opts.fill = '#ff0000';
                if (ctx._text) {
                    if (ctx.strokeStyle && !isTransparent(ctx.strokeStyle)) {
                         opts.textStroke = ctx.strokeStyle;
                    }
                    opts.text = ctx._text;
                    opts.center = [ctx.y, ctx.x];
                    ctx._text = undefined;
                    // opts["font-family"] = font.family
                    if (ctx.textBaseline && ctx.textBaseline !== 'middle') {
                        opts["dominant-baseline"] = getDominantBaseline(this.textBaseline);
                    }
                    if (ctx.textAlign && ctx.textAlign !== 'middle') {
                        opts['text-anchor'] = getTextAnchor(ctx.textAlign)
                    }

                    // FIXME: Remove when Sudokupad has optional width and height
                    opts.height = 0;
                    opts.width = 0;
                }
            }
            else {
                if (ctx.lineWidth) {
                    if (ctx.strokeStyle !== ctx.fillStyle) {
                        opts.borderSize = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
                    }
                }
                if (ctx.fillStyle && !isTransparent(ctx.fillStyle)) {
                    opts.backgroundColor = ctx.fillStyle;
                }
            }
        }

        if (ctx.lineDash.length > 0) {
            const scale = (d) => round1(d * this.ctcSize);
            opts['stroke-dasharray'] = ctx.lineDash.map(scale).map(round).join(',');
            if (ctx.lineDashOffset) {
                opts['stroke-dashoffset'] = scale(ctx.lineDashOffset);
            }
        }

        if (ctx.target)
            opts.target = ctx.target;

        return opts;
    }

    return C;
})();
