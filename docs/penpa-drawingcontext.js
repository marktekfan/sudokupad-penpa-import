class FakeContext {
    constructor() {
        this.reset();
    }
    reset() {
        this.lineDash = [];
        this.lineDashOffset = 0;
        this.lineWidth = 0;
        this.fillStyle = Color.TRANSPARENTWHITE;
        this.strokeStyle = Color.TRANSPARENTWHITE;
        this.font = undefined;
        this.lineCap = "round";
        // this.textAlign = "center";
        // this.textBaseline = "alphabetic";
        this.ctcSize = FakeContext.ctcSize;
        this.penpaSize = FakeContext.penpaSize;
        this.offet = FakeContext.offset;
        this.path = []
        this._start = false;
        this._fill = false;
        this._text = undefined;
        this.x = 0;
        this.y = 0;
    }
    static offset = [0, 0];
    static ctcSize = 64;
    static penpaSize = 38;

    setLineDash(dash) {
        this.lineDash = dash;
    }

    beginPath() {
        this._start = false;        
    }
    moveTo(x, y) {
        this._start = true;
        this.path.push(['M', x, y]);
        this.x = x;
        this.y = y;
    }
    lineTo(x, y) {
        //this.path.push(['L', x, y]);
        // 16436 bytes before relative compression
        // 14036 bytes after relative compression = 17% improvement
        this.path.push(['l', x - this.x, y - this.y]);
        this.x = x;
        this.y = y;
    }
    arc(x, y, radius, startAngle, endAngle, ccw = false) {
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
    arcTo(x1, y1, x2, y2, radius) {
        // const {round} = PenpaTools;
        // startAngle = round(startAngle * 180 / Math.PI);
        // endAngle = round(endAngle * 180 / Math.PI);
        //const fullCircle = endAngle - startAngle === 360;
        var start = {x: x1, y: y1};
        var end = {x: x2, y: y2};

        var largeArcFlag = 0;//endAngle - startAngle <= 180 ? "0" : "1";

        if (start.x !== this.x || start.y != this.y)
            //this.path.push(['M', start.x, start.y]);
        //this.path.push(['A', radius, radius, 0, largeArcFlag, 1, end.x, end.y]);
        this.path.push(['a', radius, radius, 0, largeArcFlag, 1, end.x - this.x, end.y - this.y]);
        this.x = end.x;
        this.y = end.y;
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        //this.path.push(['Q', cpx, cpy, x, y]);
        this.path.push(['q', cpx - this.x, cpy - this.y, x - this.x, y - this.y]);
        this.x = x;
        this.y = y;
    }
    closePath() {
        this.path.push(['z']);
    }
    stroke() {
    }
    fill() {
        this._fill = true;
    }
    text(text, x, y) {
        this._text = text;
        this.x = x;
        this.y = y;
    }

    arrow(startX, startY, endX, endY, controlPoints) {
        let cp = [...controlPoints];
        while (cp[0] === 0 && cp[1] === 0) cp.splice(0, 2);
        while (cp.length >= 4 && cp[0] === cp[2] && cp[1] === cp[3]) cp.splice(0, 2);
        controlPoints = cp;
        
        if(controlPoints.length === 6 && cp[1] < 0.1) {
            if (this.fillStyle === this.strokeStyle || this.strokeStyle === Color.TRANSPARENTBLACK || this.strokeStyle === Color.TRANSPARENTWHITE)
            // simple narrow arrow
            return this.arrowLine(startX, startY, endX, endY, controlPoints);
        }
        return this.arrowN(startX, startY, endX, endY, controlPoints);
    }
    arrowN(startX, startY, endX, endY, controlPoints) {
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
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
        // console.warn(controlPoints.length, a.length);
    };
    arrowLine(startX, startY, endX, endY, controlPoints) {
        this.lineWidth = controlPoints[1] * this.ctcSize * 1.8;
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
        a.push(len-0.05, 0);
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
    };




    pathToOpts() {
        const {round, round1} = PenpaTools;
        const mapX = (d) => round1((d - FakeContext.offset[1]) * this.ctcSize);
        const mapY = (d) => round1((d - FakeContext.offset[0]) * this.ctcSize);
        const scale = (d) => round1(d * this.ctcSize);
        const mapPathToPuzzle = p => {
            if('ML'.includes(p[0])) {
                return `${p[0]}${mapX(p[1])} ${mapY(p[2])}`
            }
            else if('ml'.includes(p[0])) {
                return `${p[0]}${scale(p[1])} ${scale(p[2])}`
            }
            else if('A'.includes(p[0])) {
                return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${mapX(p[6])} ${mapY(p[7])}`
            }
            else if('a'.includes(p[0])) {
                return `${p[0]}${scale(p[1])} ${scale(p[2])} ${p[3]} ${p[4]} ${p[5]} ${scale(p[6])} ${scale(p[7])}`
            }
            else if('Q'.includes(p[0])) {
                return `${p[0]}${mapX(p[1])} ${mapY(p[2])} ${mapX(p[3])} ${mapY(p[4])}`
            }
            else if('q'.includes(p[0])) {
                return `${p[0]}${scale(p[1])} ${scale(p[2])} ${scale(p[3])} ${scale(p[4])}`
            }
            else if(p.length === 1) {
                return p[0]
            }
            else {
                console.error('UNEXPECTED PATH COMMAND: ', p);
                debugger;
                return p.join(' '); 
            }
        }
        let ctx = this;
        let opts = {};
        if (ctx.lineWidth && ctx.strokeStyle && ctx.strokeStyle !== Color.TRANSPARENTWHITE) {
            opts.thickness = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
            opts.color = ctx.strokeStyle;
        }
        opts.d = this.path.map(mapPathToPuzzle).join('');
        if (this._fill) {            
            opts.fill = ctx.fillStyle;
            //opts['fill-rule'] = 'evenodd';
        }

        if (ctx.lineDash.length > 0) {
            opts['stroke-dasharray'] = ctx.lineDash.map(scale).map(round).join(',');
            if (ctx.lineDashOffset) {
                opts['stroke-dashoffset'] = scale(ctx.lineDashOffset);
            }
        }

        if (ctx.target) {
            opts.target = ctx.target;
        }
        if (ctx.lineCap && ctx.lineCap !== 'round') {
            opts['stroke-linecap'] = ctx.lineCap;
            if (ctx.lineJoin && ctx.lineJoin !== 'round')
                opts['stroke-linejoin'] = ctx.lineJoin;
        }

        // opts.color = '#0080ff'
        this.path.length = 0;
        return opts;
    }

    toOpts(intent) {
        const {round, round1} = PenpaTools;
        let ctx = this;
        let opts = {};
        if (!intent) {
            if (ctx.font || ctx._text)
                intent = 'text';
            else if (ctx.fillStyle && ctx.fillStyle !== Color.TRANSPARENTWHITE)
                intent = 'surface';
            else if (ctx.lineWidth)
                intent = 'line';
            else
                intent = 'Should not come here';
        }

        if (intent === 'line') {
            if (ctx.lineWidth && ctx.strokeStyle && ctx.strokeStyle !== Color.TRANSPARENTWHITE) {
                opts.thickness = round1(ctx.lineWidth * this.ctcSize / this.penpaSize);
                opts.color = ctx.strokeStyle;
            }    
        }
        else {
            if (ctx.strokeStyle && ctx.strokeStyle !== Color.TRANSPARENTWHITE) {
                if (ctx.strokeStyle !== ctx.fillStyle)
                    opts.borderColor = ctx.strokeStyle;
            }
            if (ctx.lineWidth) {
                if (ctx.strokeStyle !== ctx.fillStyle)
                    opts.borderSize = ctx.lineWidth * this.ctcSize / this.penpaSize;
            }
            if (ctx.font) {
                const fontsize = ctx.font.split('px')[0];
                opts.height = round(fontsize * 1.5);
                opts.width = round(2 / this.ctcSize); //Hack to remove background rect
                opts.fontSize = fontsize * this.ctcSize * 0.9;
                if (ctx.fillStyle && ctx.fillStyle !== Color.BLACK)
                    opts.color = ctx.fillStyle;
                if (ctx.fillStyle === Color.WHITE) {
                    ctx['stroke-width'] = 0;
                }
                if(ctx['stroke-width'] !== undefined) {
                    opts['stroke-width'] = ctx['stroke-width'];
                }
                //opts.fill = '#ff0000';

                if (ctx.fillStyle === Color.TRANSPARENTWHITE) {
                    opts.textStroke = ctx.strokeStyle;
                    opts.borderColor = Color.TRANSPARENTWHITE;
                }
                if (ctx._text) {
                    opts.text = ctx._text;
                    opts.center = [ctx.y, ctx.x];
                    ctx._text = undefined;
                }
            }
            else {
                if (ctx.fillStyle && ctx.fillStyle !== Color.TRANSPARENTWHITE)
                opts.backgroundColor = ctx.fillStyle;
            }
        }

        if (ctx.lineDash.length > 0) {
            opts['stroke-dasharray'] = ctx.lineDash.map(p => p * this.ctcSize / this.penpaSize).map(round).join(',');
            if (ctx.lineDashOffset) {
                opts['stroke-dashoffset'] = round(ctx.lineDashOffset * this.ctcSize / this.penpaSize);
            }
        }

        if (ctx.target)
            opts.target = ctx.target;

        return opts;
    }

}
