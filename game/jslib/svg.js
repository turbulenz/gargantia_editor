// Copyright (c) 2013-2014 Turbulenz Limited
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
;

var SVGNodeTransform = (function () {
    function SVGNodeTransform() {
    }
    SVGNodeTransform.Translate = 0;
    SVGNodeTransform.Rotate = 1;
    SVGNodeTransform.Scale = 2;
    SVGNodeTransform.Matrix = 3;
    return SVGNodeTransform;
})();
;

//
// SVGBaseNode
//
var SVGBaseNode = (function () {
    function SVGBaseNode() {
        this.draw = null;
        this.draw = this._drawShape;
    }
    SVGBaseNode.prototype.addChild = function (child) {
        var children = this._children;
        if (!children) {
            this._children = [child];
            if (this.draw === this._drawState) {
                this.draw = this._drawStateChildren;
            } else {
                debug.assert(this.draw === this._drawShape);
                this.draw = this._drawChildren;
            }
        } else {
            children.push(child);
        }
    };

    SVGBaseNode.prototype.removeChild = function (child) {
        var children = this._children;
        if (children) {
            var i = children.indexOf(child);
            if (i !== -1) {
                if (children.length === 1) {
                    this._children = null;
                    if (this.draw === this._drawStateChildren) {
                        this.draw = this._drawState;
                    } else {
                        debug.assert(this.draw === this._drawChildren);
                        this.draw = this._drawShape;
                    }
                } else {
                    children.splice(i, 1);
                }
            }
        }
    };

    SVGBaseNode.prototype.getNumChildren = function () {
        return (this._children ? this._children.length : 0);
    };

    SVGBaseNode.prototype.getChild = function (i) {
        return (this._children ? this._children[i] : null);
    };

    SVGBaseNode.prototype.setFillStyle = function (style) {
        this._fill = style;
        this._checkState();
    };

    SVGBaseNode.prototype.getFillStyle = function () {
        return this._fill;
    };

    SVGBaseNode.prototype.setStrokeStyle = function (style) {
        this._stroke = style;
        this._checkState();
    };

    SVGBaseNode.prototype.getStrokeStyle = function () {
        return this._stroke;
    };

    SVGBaseNode.prototype.setLineWidth = function (lineWidth) {
        this._lineWidth = lineWidth;
        this._checkState();
    };

    SVGBaseNode.prototype.getLineWidth = function () {
        return this._lineWidth;
    };

    SVGBaseNode.prototype.translate = function (x, y) {
        this._addTransform(SVGNodeTransform.Translate, [x, y]);
    };

    SVGBaseNode.prototype.scale = function (x, y) {
        this._addTransform(SVGNodeTransform.Scale, [x, y]);
    };

    SVGBaseNode.prototype.rotate = function (angle, x, y) {
        this._addTransform(SVGNodeTransform.Rotate, [angle, x, y]);
    };

    SVGBaseNode.prototype.transform = function (a, b, c, d, e, f) {
        this._addTransform(SVGNodeTransform.Matrix, [a, b, c, d, e, f]);
    };

    SVGBaseNode.prototype._addTransform = function (type, values) {
        var transforms = this._transforms;
        if (!transforms) {
            this._transforms = [type, values];
        } else {
            var numTransforms = transforms.length;
            var lastValues = transforms[numTransforms - 1];
            var lastType = transforms[numTransforms - 2];
            var doAdd = false;
            if (lastType === SVGNodeTransform.Translate) {
                if (type === SVGNodeTransform.Translate) {
                    lastValues[0] += values[0];
                    lastValues[1] += values[1];
                } else {
                    doAdd = true;
                }
            } else if (lastType === SVGNodeTransform.Scale) {
                if (type === SVGNodeTransform.Scale) {
                    lastValues[0] *= values[0];
                    lastValues[1] *= values[1];
                } else {
                    doAdd = true;
                }
            } else if (lastType === SVGNodeTransform.Rotate) {
                if (type === SVGNodeTransform.Rotate && lastValues[1] === values[1] && lastValues[2] === values[2]) {
                    lastValues[0] += values[0];
                } else {
                    doAdd = true;
                }
            } else if (lastType === SVGNodeTransform.Matrix) {
                if (type === SVGNodeTransform.Translate) {
                    lastValues[4] += (lastValues[0] * values[0] + lastValues[2] * values[1]);
                    lastValues[5] += (lastValues[1] * values[0] + lastValues[3] * values[1]);
                } else if (type === SVGNodeTransform.Scale) {
                    lastValues[0] *= values[0];
                    lastValues[1] *= values[0];
                    lastValues[2] *= values[1];
                    lastValues[3] *= values[1];
                } else {
                    doAdd = true;
                }
            }

            if (doAdd) {
                transforms.push(type, values);
                if (7 < transforms.length) {
                    this._combineTransforms();
                }
            }
        }
        this._checkState();
    };

    SVGBaseNode.prototype._combineTransforms = function () {
        var transforms = this._transforms;
        var numTransforms = transforms.length;
        var matrix = [1, 0, 0, 1, 0, 0];
        var ax, ay;
        var m0, m1, m2, m3;
        for (var t = 0; t < numTransforms; t += 2) {
            var type = transforms[t];
            var arg = transforms[t + 1];
            switch (type) {
                case SVGNodeTransform.Translate:
                    ax = arg[0];
                    ay = arg[1];
                    matrix[4] += (matrix[0] * ax + matrix[2] * ay);
                    matrix[5] += (matrix[1] * ax + matrix[3] * ay);
                    break;

                case SVGNodeTransform.Scale:
                    ax = arg[0];
                    ay = arg[1];
                    matrix[0] *= ax;
                    matrix[1] *= ax;
                    matrix[2] *= ay;
                    matrix[3] *= ay;
                    break;

                case SVGNodeTransform.Rotate:
                    var angle = arg[0];
                    if (angle !== 0) {
                        var s = Math.sin(angle);
                        var c = Math.cos(angle);
                        if (s < -0.005 || 0.005 < s || c < 0.995 || 1.005 < c) {
                            ax = arg[1];
                            ay = arg[2];

                            m0 = matrix[0];
                            m1 = matrix[1];
                            m2 = matrix[2];
                            m3 = matrix[3];

                            if (ax !== 0 || ay !== 0) {
                                matrix[4] += (m0 * ax + m2 * ay);
                                matrix[5] += (m1 * ax + m3 * ay);

                                matrix[0] = (m0 * c + m2 * s);
                                matrix[1] = (m1 * c + m3 * s);
                                matrix[2] = (m0 * -s + m2 * c);
                                matrix[3] = (m1 * -s + m3 * c);

                                matrix[4] -= (matrix[0] * ax + matrix[2] * ay);
                                matrix[5] -= (matrix[1] * ax + matrix[3] * ay);
                            } else {
                                matrix[0] = (m0 * c + m2 * s);
                                matrix[1] = (m1 * c + m3 * s);
                                matrix[2] = (m0 * -s + m2 * c);
                                matrix[3] = (m1 * -s + m3 * c);
                            }
                        }
                    }
                    break;

                case SVGNodeTransform.Matrix:
                    m0 = matrix[0];
                    m1 = matrix[1];
                    m2 = matrix[2];
                    m3 = matrix[3];
                    matrix[0] = (m0 * arg[0] + m2 * arg[1]);
                    matrix[1] = (m1 * arg[0] + m3 * arg[1]);
                    matrix[2] = (m0 * arg[2] + m2 * arg[3]);
                    matrix[3] = (m1 * arg[2] + m3 * arg[3]);

                    matrix[4] += (m0 * arg[4] + m2 * arg[5]);
                    matrix[5] += (m1 * arg[4] + m3 * arg[5]);
                    break;

                default:
                    break;
            }
        }
        transforms.length = 2;
        transforms[0] = SVGNodeTransform.Matrix;
        transforms[1] = matrix;
    };

    SVGBaseNode.prototype.removeTransforms = function () {
        this._transforms = null;
        this._checkState();
    };

    SVGBaseNode.prototype._checkState = function () {
        if (!this._fill && !this._stroke && !this._lineWidth && !this._transforms) {
            if (this.draw === this._drawState) {
                this.draw = this._drawShape;
            } else if (this.draw === this._drawStateChildren) {
                this.draw = this._drawChildren;
            } else {
                debug.assert(this.draw === this._drawShape || this.draw === this._drawChildren);
            }
        } else {
            if (this.draw === this._drawShape) {
                this.draw = this._drawState;
            } else if (this.draw === this._drawChildren) {
                this.draw = this._drawStateChildren;
            } else {
                debug.assert(this.draw === this._drawState || this.draw === this._drawStateChildren);
            }
        }
    };

    SVGBaseNode.prototype._setState = function (ctx) {
        var fill = this._fill;
        if (fill) {
            ctx.fillStyle = fill;
        }

        var stroke = this._stroke;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }

        var lineWidth = this._lineWidth;
        if (lineWidth) {
            ctx.lineWidth = lineWidth;
        }

        var transforms = this._transforms;
        if (transforms) {
            var numTransforms = transforms.length;
            for (var t = 0; t < numTransforms; t += 2) {
                var type = transforms[t];
                var arg = transforms[t + 1];
                var ax, ay;
                switch (type) {
                    case SVGNodeTransform.Translate:
                        ax = arg[0];
                        ay = arg[1];
                        if (ax !== 0 || ay !== 0) {
                            ctx.translate(ax, ay);
                        }
                        break;

                    case SVGNodeTransform.Scale:
                        ax = arg[0];
                        ay = arg[1];
                        if (ax !== 1 || ay !== 1) {
                            ctx.scale(ax, ay);
                        }
                        break;

                    case SVGNodeTransform.Rotate:
                        var angle = arg[0];
                        ax = arg[1];
                        ay = arg[2];
                        if (angle !== 0) {
                            if (ax !== 0 || ay !== 0) {
                                ctx.translate(ax, ay);
                                ctx.rotate(angle);
                                ctx.translate(-ax, -ay);
                            } else {
                                ctx.rotate(angle);
                            }
                        }
                        break;

                    case SVGNodeTransform.Matrix:
                        ctx.transform(arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
                        break;

                    default:
                        break;
                }
            }
        }
    };

    SVGBaseNode.prototype._drawState = function (ctx) {
        ctx.save();

        this._setState(ctx);

        this._drawShape(ctx);

        ctx.restore();
    };

    SVGBaseNode.prototype._drawStateChildren = function (ctx) {
        ctx.save();

        this._setState(ctx);

        this._drawShape(ctx);

        var children = this._children;
        var numChildren = children.length;
        for (var n = 0; n < numChildren; n += 1) {
            children[n].draw(ctx);
        }

        ctx.restore();
    };

    SVGBaseNode.prototype._drawChildren = function (ctx) {
        this._drawShape(ctx);

        var children = this._children;
        var numChildren = children.length;
        for (var n = 0; n < numChildren; n += 1) {
            children[n].draw(ctx);
        }
    };

    /* tslint:disable:no-empty */
    SVGBaseNode.prototype._drawShape = function (ctx) {
    };
    return SVGBaseNode;
})();
;

//
// SVGEmptyNode
//
var SVGEmptyNode = (function (_super) {
    __extends(SVGEmptyNode, _super);
    function SVGEmptyNode() {
        _super.apply(this, arguments);
    }
    /* tslint:disable:no-empty */
    SVGEmptyNode.prototype._drawState = function (ctx) {
    };

    /* tslint:enable:no-empty */
    SVGEmptyNode.prototype._drawStateChildren = function (ctx) {
        ctx.save();

        this._setState(ctx);

        var children = this._children;
        var numChildren = children.length;
        for (var n = 0; n < numChildren; n += 1) {
            children[n].draw(ctx);
        }

        ctx.restore();
    };

    SVGEmptyNode.prototype._drawChildren = function (ctx) {
        var children = this._children;
        var numChildren = children.length;
        for (var n = 0; n < numChildren; n += 1) {
            children[n].draw(ctx);
        }
    };
    return SVGEmptyNode;
})(SVGBaseNode);
;

//
// SVGPathNode
//
var SVGPathNode = (function (_super) {
    __extends(SVGPathNode, _super);
    function SVGPathNode(path) {
        _super.call(this);

        debug.assert(path);

        this.compiledPath = CanvasContext.prototype.parsePath(path);
    }
    SVGPathNode.prototype._drawShape = function (ctx) {
        var compiledPath = this.compiledPath;

        ctx.beginPath();

        ctx.compiledPath(compiledPath);

        if (ctx.fillStyle !== 'none') {
            ctx.fill();
        }

        if (ctx.strokeStyle !== 'none') {
            ctx.stroke();
        }
    };
    return SVGPathNode;
})(SVGBaseNode);
;

//
// SVGPolygonNode
//
var SVGPolygonNode = (function (_super) {
    __extends(SVGPolygonNode, _super);
    function SVGPolygonNode(points) {
        _super.call(this);

        this.points = points;

        debug.assert(points);
    }
    SVGPolygonNode.prototype._drawShape = function (ctx) {
        var values = this.points;
        var numValues = values.length;

        ctx.beginPath();

        ctx.moveTo(values[0], values[1]);

        for (var n = 2; n < numValues; n += 2) {
            ctx.lineTo(values[n], values[n + 1]);
        }

        ctx.closePath();

        if (ctx.fillStyle !== 'none') {
            ctx.fill();
        }

        if (ctx.strokeStyle !== 'none') {
            ctx.stroke();
        }
    };
    return SVGPolygonNode;
})(SVGBaseNode);
;

//
// SVGPolylineNode
//
var SVGPolylineNode = (function (_super) {
    __extends(SVGPolylineNode, _super);
    function SVGPolylineNode(points) {
        _super.call(this);

        this.points = points;

        debug.assert(points);
    }
    SVGPolylineNode.prototype._drawShape = function (ctx) {
        var values = this.points;
        if (values) {
            var numValues = values.length;

            ctx.beginPath();

            ctx.moveTo(values[0], values[1]);

            for (var n = 2; n < numValues; n += 2) {
                ctx.lineTo(values[n], values[n + 1]);
            }

            if (ctx.fillStyle !== 'none') {
                ctx.fill();
            }

            if (ctx.strokeStyle !== 'none') {
                ctx.stroke();
            }
        }
    };
    return SVGPolylineNode;
})(SVGBaseNode);
;

//
// SVGRectNode
//
var SVGRectNode = (function (_super) {
    __extends(SVGRectNode, _super);
    function SVGRectNode(x, y, w, h) {
        _super.call(this);

        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    SVGRectNode.prototype._drawShape = function (ctx) {
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;

        if (ctx.fillStyle !== 'none') {
            ctx.fillRect(x, y, width, height);
        }

        if (ctx.strokeStyle !== 'none') {
            ctx.strokeRect(x, y, width, height);
        }
    };
    return SVGRectNode;
})(SVGBaseNode);
;

//
// SVGCircleNode
//
var SVGCircleNode = (function (_super) {
    __extends(SVGCircleNode, _super);
    function SVGCircleNode(x, y, r) {
        _super.call(this);

        this.x = x;
        this.y = y;
        this.radius = r;
    }
    SVGCircleNode.prototype._drawShape = function (ctx) {
        var radius = this.radius;
        if (0 < radius) {
            var x = this.x;
            var y = this.y;

            ctx.beginPath();

            ctx.arc(x, y, radius, 0, (2 * Math.PI));

            if (ctx.fillStyle !== 'none') {
                ctx.fill();
            }

            if (ctx.strokeStyle !== 'none') {
                ctx.stroke();
            }
        }
    };
    return SVGCircleNode;
})(SVGBaseNode);
;

//
// SVGEllipseNode
//
var SVGEllipseNode = (function (_super) {
    __extends(SVGEllipseNode, _super);
    function SVGEllipseNode(x, y, rx, ry) {
        _super.call(this);

        this.x = x;
        this.y = y;
        this.radiusX = rx;
        this.radiusY = ry;
    }
    SVGEllipseNode.prototype._drawShape = function (ctx) {
        var rx = this.radiusX;
        var ry = this.radiusY;
        if (rx > 0 && ry > 0) {
            var x = this.x;
            var y = this.y;

            ctx.beginPath();

            if (rx !== ry) {
                var r, sx, sy;
                if (rx > ry) {
                    r = rx;
                    sx = 1;
                    sy = ry / rx;
                } else {
                    r = ry;
                    sx = rx / ry;
                    sy = 1;
                }

                ctx.translate(x, y);
                ctx.scale(sx, sy);
                ctx.arc(0, 0, r, 0, (2 * Math.PI));
                ctx.scale(1 / sx, 1 / sy);
                ctx.translate(-x, -y);
            } else {
                ctx.arc(x, y, rx, 0, (2 * Math.PI));
            }

            if (ctx.fillStyle !== 'none') {
                ctx.fill();
            }

            if (ctx.strokeStyle !== 'none') {
                ctx.stroke();
            }
        }
    };
    return SVGEllipseNode;
})(SVGBaseNode);
;

//
// SVGLineNode
//
var SVGLineNode = (function (_super) {
    __extends(SVGLineNode, _super);
    function SVGLineNode(x1, y1, x2, y2) {
        _super.call(this);

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    SVGLineNode.prototype._drawShape = function (ctx) {
        var x1 = this.x1;
        var y1 = this.y1;
        var x2 = this.x2;
        var y2 = this.y2;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (ctx.strokeStyle !== 'none') {
            ctx.stroke();
        }
    };
    return SVGLineNode;
})(SVGBaseNode);
;

//
// SVGTextNode
//
var SVGTextNode = (function (_super) {
    __extends(SVGTextNode, _super);
    function SVGTextNode(font, text, x, y) {
        _super.call(this);

        this.font = font;
        this.text = text;
        this.x = x;
        this.y = y;
    }
    SVGTextNode.prototype._drawShape = function (ctx) {
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y);
    };
    return SVGTextNode;
})(SVGBaseNode);
;
