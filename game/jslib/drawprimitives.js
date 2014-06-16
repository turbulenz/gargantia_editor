// Copyright (c) 2009-2013 Turbulenz Limited
/*global TurbulenzEngine: false */
var DrawPrimitives = (function () {
    function DrawPrimitives() {
        this.rectPositionsParameters = {
            numVertices: 4,
            attributes: ['SHORT2'],
            dynamic: true
        };
        this.rectSemanticsParameters = ['POSITION'];
        this.rectNumVertices = 4;
        this.rectTexPositionsParameters = {
            numVertices: 4,
            attributes: ['SHORT2', 'SHORT2'],
            dynamic: true
        };
        this.rectTexSemanticsParameters = ['POSITION', 'TEXCOORD0'];
        this.rectTexNumVertices = 4;
        this.boxPositionsParameters = {
            numVertices: 36,
            attributes: ['FLOAT3'],
            dynamic: true
        };
        this.boxSemanticsParameters = ['POSITION'];
        this.boxNumVertices = 36;
    }
    DrawPrimitives.prototype.initalize = function (gd, shaderPath) {
        this.device = gd;
        this.boxPrimitive = gd.PRIMITIVE_TRIANGLES;
        this.boxPositions = gd.createVertexBuffer(this.boxPositionsParameters);
        this.boxSemantics = gd.createSemantics(this.boxSemanticsParameters);

        this.rectPrimitive = gd.PRIMITIVE_TRIANGLE_STRIP;
        this.rectPositions = gd.createVertexBuffer(this.rectPositionsParameters);
        this.rectSemantics = gd.createSemantics(this.rectSemanticsParameters);

        this.rectTexPrimitive = gd.PRIMITIVE_TRIANGLE_STRIP;
        this.rectTexPositions = gd.createVertexBuffer(this.rectTexPositionsParameters);
        this.rectTexSemantics = gd.createSemantics(this.rectTexSemanticsParameters);

        debug.assert((this.boxPositions && this.rectPositions && this.rectTexPositions), "Buffers not created.");

        if (this.boxPositions && this.rectPositions && this.rectTexPositions) {
            var that = this;
            var fileName = shaderPath + this.shaderName;
            TurbulenzEngine.request(fileName, function shaderReceivedFn(shaderText) {
                if (shaderText) {
                    var shaderParameters = JSON.parse(shaderText);
                    var shader = gd.createShader(shaderParameters);
                    if (shader) {
                        that.technique = shader.getTechnique(that.techniqueName);
                    }
                }
            });
        }
    };

    DrawPrimitives.prototype.setTechnique = function (technique, isTechnique2D) {
        this.technique = technique;
        this.isTechnique2D = isTechnique2D;
    };

    DrawPrimitives.prototype.updateParameters = function (params) {
        var gd = this.device;
        var parameters = {
            worldViewProjection: null
        };

        for (var p in params) {
            if (params.hasOwnProperty(p)) {
                parameters[p] = params[p];
            }
        }

        this.techniqueParameters = gd.createTechniqueParameters(parameters);
    };

    DrawPrimitives.prototype.update2DTex = function (posa, posb) {
        var positions = this.rectTexPositions;
        var writer = positions.map();
        if (writer) {
            var v = [
                [posa[0], posa[1]],
                [posa[0], posb[1]],
                [posb[0], posb[1]],
                [posb[0], posa[1]]
            ];

            var t = [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0]
            ];

            var index = [
                0,
                1,
                3,
                2
            ];

            var i, j;
            for (i = 0; i < 4; i += 1) {
                j = index[i];
                writer(v[j], t[j]);
            }

            positions.unmap(writer);
            this.isTextured = true;
        }
    };

    DrawPrimitives.prototype.update2D = function (posa, posb) {
        var positions = this.rectPositions;
        var writer = positions.map();
        if (writer) {
            var v = [
                [posa[0], posa[1]],
                [posa[0], posb[1]],
                [posb[0], posb[1]],
                [posb[0], posa[1]]
            ];

            var index = [
                0,
                1,
                3,
                2
            ];

            var i;
            for (i = 0; i < 4; i += 1) {
                writer(v[index[i]]);
            }

            positions.unmap(writer);
        }
    };

    DrawPrimitives.prototype.update = function (posa, posb) {
        var positions = this.boxPositions;
        var writer = positions.map();
        if (writer) {
            var v = [
                [posa[0], posa[1], posa[2]],
                [posa[0], posa[1], posb[2]],
                [posa[0], posb[1], posa[2]],
                [posa[0], posb[1], posb[2]],
                [posb[0], posa[1], posa[2]],
                [posb[0], posa[1], posb[2]],
                [posb[0], posb[1], posa[2]],
                [posb[0], posb[1], posb[2]]
            ];

            var index = [
                0,
                2,
                1,
                1,
                2,
                3,
                0,
                1,
                4,
                1,
                5,
                4,
                1,
                3,
                5,
                3,
                7,
                5,
                3,
                2,
                7,
                2,
                6,
                7,
                0,
                4,
                2,
                2,
                4,
                6,
                4,
                5,
                6,
                5,
                7,
                6
            ];

            var i;
            for (i = 0; i < 3 * 12; i += 1) {
                writer(v[index[i]]);
            }

            positions.unmap(writer);
        }
    };

    DrawPrimitives.prototype.dispatch = function (camera) {
        var gd = this.device;
        var technique = this.technique;
        var isTechnique2D = this.isTechnique2D;
        var isTextured = this.isTextured;

        var vertexBuffer, semantics, primitive, numVertices;

        if (isTechnique2D) {
            if (isTextured) {
                vertexBuffer = this.rectTexPositions;
                semantics = this.rectTexSemantics;
                primitive = this.rectTexPrimitive;
                numVertices = this.rectTexNumVertices;
            } else {
                vertexBuffer = this.rectPositions;
                semantics = this.rectSemantics;
                primitive = this.rectPrimitive;
                numVertices = this.rectNumVertices;
            }
        } else {
            vertexBuffer = this.boxPositions;
            semantics = this.boxSemantics;
            primitive = this.boxPrimitive;
            numVertices = this.boxNumVertices;
        }

        var techniqueParameters = this.techniqueParameters;

        if (technique !== null) {
            techniqueParameters['worldViewProjection'] = camera.viewProjectionMatrix;

            gd.setTechnique(technique);
            gd.setTechniqueParameters(techniqueParameters);
            gd.setStream(vertexBuffer, semantics);
            gd.draw(primitive, numVertices);
        }
    };

    DrawPrimitives.create = function (gd, shaderPath, shaderName, techniqueName) {
        var dp = new DrawPrimitives();
        dp.shaderName = shaderName ? shaderName : "generic3D.cgfx";
        dp.techniqueName = techniqueName ? techniqueName : "constantColor3D";
        dp.isTechnique2D = false;
        dp.isTextured = false;
        dp.initalize(gd, shaderPath);
        return dp;
    };
    DrawPrimitives.version = 1;
    return DrawPrimitives;
})();
