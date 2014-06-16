// Copyright (c) 2009-2012 Turbulenz Limited

/*global Config: false*/

function DebugDraw(mathDevice, shaderManager, graphicsDevice, camera)
{
    this.mathDevice = mathDevice;
    this.shaderManager = shaderManager;
    this.graphicsDevice = graphicsDevice;
    this.camera = camera;

    var gd = this.graphicsDevice;

    if (typeof this.debugLineVertexBuffer === "undefined")
    {
        var debugLinesAttributes = [ gd.VERTEXFORMAT_FLOAT3, gd.VERTEXFORMAT_FLOAT3 ];
        this.numAttributeComponents = 6;
        this.vertexBuffer = gd.createVertexBuffer({
                numVertices: (2 * this.maximumLines),
                attributes: debugLinesAttributes,
                dynamic: true,
                'transient': true
            });

        this.semantics = gd.createSemantics([ gd.SEMANTIC_POSITION,
                                              gd.SEMANTIC_COLOR ]);

        this.data = new Float32Array((2 * this.maximumLines) * this.numAttributeComponents);
        this.debugLinesCount   =   0;
    }

    this.scratchM33 = mathDevice.m33BuildIdentity();
    this.scratchV3 = mathDevice.v3BuildZero();
    this.scratchV3_2 = mathDevice.v3BuildZero();
}

DebugDraw.prototype =
{
    maximumLines : Config.maxDebugLines,

    drawDebugLine : function debugDrawDrawDebugLineFn(v3pos0, v3pos1, r, g, b)
    {
        if (this.debugLinesCount >= this.maximumLines)
        {
            return;
        }

        var dstIndex    =   this.debugLinesCount * (2 * this.numAttributeComponents);

        this.data[dstIndex + 0] = v3pos0[0];
        this.data[dstIndex + 1] = v3pos0[1];
        this.data[dstIndex + 2] = v3pos0[2];
        this.data[dstIndex + 3] = r;
        this.data[dstIndex + 4] = g;
        this.data[dstIndex + 5] = b;

        this.data[dstIndex + 6] = v3pos1[0];
        this.data[dstIndex + 7] = v3pos1[1];
        this.data[dstIndex + 8] = v3pos1[2];
        this.data[dstIndex + 9] = r;
        this.data[dstIndex + 10] = g;
        this.data[dstIndex + 11] = b;

        this.debugLinesCount += 1;
    },

    getColourFromID : function debugDrawGetColourFromID(id)
    {
        var md = this.mathDevice;

        if (this.randomColours === undefined)
        {
            this.randomColours  =   [
                md.v3Build(1.0, 0.0, 0.0),
                md.v3Build(0.0, 1.0, 0.0),
                md.v3Build(0.0, 0.0, 1.0),
                md.v3Build(0.0, 1.0, 1.0),
                md.v3Build(1.0, 0.0, 1.0),
                md.v3Build(1.0, 1.0, 0.0)
            ];
        }

        return  this.randomColours[id % this.randomColours.length];
    },

    drawDebugArc : function debugDrawDrawDebugArcFn(v3pos, v3normal, radius, r, g, b, arc, angle)
    {
        var md = this.mathDevice;

        var number_of_segments = Math.floor(Math.min(25, Math.max(5, 2 * radius * (arc / Math.PI))));
        var radian_per_segment = arc / number_of_segments;

        var n0, n1, n2;
        if (v3normal)
        {
            n0 = v3normal[0];
            n1 = v3normal[1];
            n2 = v3normal[2];
            var nl = 1 / Math.sqrt(n0 * n0 + n1 * n1 + n2 * n2);
            n0 *= nl;
            n1 *= nl;
            n2 *= nl;
        }
        else
        {
            n0 = n2 = 0;
            n1 = 1;
        }

        var o0, o1, o2;
        if (n1 * n1 !== 1)
        {
            var ol = radius / Math.sqrt(n0 * n0 + n2 * n2);
            o0 = -n2 * ol;
            o1 = 0;
            o2 = n0 * ol;
        }
        else
        {
            o0 = n1 * radius;
            o1 = o2 = 0;
        }

        var m = this.scratchM33;
        var d0, d1, d2;
        var normal = this.scratchV3;
        normal[0] = n0;
        normal[1] = n1;
        normal[2] = n2;
        if (angle !== undefined)
        {
            md.m33FromAxisRotation(normal, angle - arc * 0.5, m);
            d0 = m[0] * o0 + m[3] * o1 + m[6] * o2;
            d1 = m[1] * o0 + m[4] * o1 + m[7] * o2;
            d2 = m[2] * o0 + m[5] * o1 + m[8] * o2;
            o0 = d0;
            o1 = d1;
            o2 = d2;
        }

        md.m33FromAxisRotation(normal, radian_per_segment, m);

        var previous = this.scratchV3;
        var current = this.scratchV3_2;
        previous[0] = current[0] = v3pos[0] + o0;
        previous[1] = current[1] = v3pos[1] + o1;
        previous[2] = current[2] = v3pos[2] + o2;

        var j;
        for (j = 1; j < number_of_segments + 1; j += 1)
        {
            d0 = m[0] * o0 + m[3] * o1 + m[6] * o2;
            d1 = m[1] * o0 + m[4] * o1 + m[7] * o2;
            d2 = m[2] * o0 + m[5] * o1 + m[8] * o2;
            current[0] = v3pos[0] + d0;
            current[1] = v3pos[1] + d1;
            current[2] = v3pos[2] + d2;

            this.drawDebugLine(previous, current, r, g, b);

            o0 = d0;
            o1 = d1;
            o2 = d2;
            previous[0] = current[0];
            previous[1] = current[1];
            previous[2] = current[2];
        }
    },

    drawDebugCircle : function debugDrawDrawDebugCircleFn(v3pos, v3normal, radius, r, g, b)
    {
        this.drawDebugArc(v3pos, v3normal, radius, r, g, b, Math.PI * 2.0, 0);
    },

    drawDebugPoint : function debugDrawDrawDebugPointFn(v3pos, r, g, b, size)
    {
        var sz = 0.25;
        if (size !== undefined)
        {
            sz = size;
        }

        var pad = this.scratchpad;
        var v0 = pad.v0;
        var v1 = pad.v1;
        var x = v3pos[0];
        var y = v3pos[1];
        var z = v3pos[2];

        v0[0] = x - sz;
        v1[0] = x + sz;
        v0[1] = v1[1] = y;
        v0[2] = v1[2] = z;
        this.drawDebugLine(v0, v1, r, g, b);

        v0[1] = y - sz;
        v1[1] = y + sz;
        v0[0] = v1[0] = x;
        v0[2] = v1[2] = z;
        this.drawDebugLine(v0, v1, r, g, b);

        v0[2] = z - sz;
        v1[2] = z + sz;
        v0[0] = v1[0] = x;
        v0[1] = v1[1] = y;
        this.drawDebugLine(v0, v1, r, g, b);
    },

    drawDebugSphere : function debugDrawDrawDebugSphere(v3pos, radius, r, g, b)
    {
        var v = this.scratchV3;
        v[0] = 1;
        v[1] = 0;
        v[2] = 0;
        this.drawDebugCircle(v3pos, v, radius, r, g, b);
        v[0] = 0;
        v[1] = 1;
        v[2] = 0;
        this.drawDebugCircle(v3pos, v, radius, r, g, b);
        v[0] = 0;
        v[1] = 0;
        v[2] = 1;
        this.drawDebugCircle(v3pos, v, radius, r, g, b);
    },

    drawDebugHalfCube : function debugDrawDrawDebugCubeFn(v3pos, length, r, g, b)
    {
        //8 corners.
        //   a   b
        // c   d
        //
        //   e   f
        // g   h

        //12 lines.
        //ab,bd,bc,ca
        //ae,bf,dh,cg
        //ef,fh,hg,ge

        var md = this.mathDevice;
        //var ca, cb, cc, cd, ce, cf, cg, ch;
        var ca, cb, cc, ce;
        var half_length =   md.v3Build(length * 0.5, length * 0.5, length * 0.5);

        ca   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], -half_length[2]));
        cb   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], -half_length[2]));
        cc   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], +half_length[2]));
        //cd   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], +half_length[2]));
        ce   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], -half_length[2]));
        //cf   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], -half_length[2]));
        //cg   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], +half_length[2]));
        //ch   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], +half_length[2]));

        this.drawDebugLine(ca, cb, r, g, b);
        //this.drawDebugLine(cb,cd,r,g,b);
        //this.drawDebugLine(cd,cc,r,g,b);
        this.drawDebugLine(cc, ca, r, g, b);

        this.drawDebugLine(ca, ce, r, g, b);
       // this.drawDebugLine(cb,cf,r,g,b);
       // this.drawDebugLine(cd,ch,r,g,b);
       // this.drawDebugLine(cc,cg,r,g,b);

        //this.drawDebugLine(ce,cf,r,g,b);
        //this.drawDebugLine(cf,ch,r,g,b);
        //this.drawDebugLine(ch,cg,r,g,b);
        //this.drawDebugLine(cg,ce,r,g,b);
    },

    drawDebugExtents : function debugDrawExtentsFn(extents, r, g, b)
    {
        var v0 = this.scratchpad.v0;
        var v1 = this.scratchpad.v1;
        var x0 = extents[0];
        var x1 = extents[3];
        var y0 = extents[1];
        var y1 = extents[4];
        var z0 = extents[2];
        var z1 = extents[5];
        v0[1] = v1[1] = y0;
        v0[2] = v1[2] = z0;
        v0[0] = x0;
        v1[0] = x1;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[0] = x1;
        v0[1] = y1;
        this.drawDebugLine(v0, v1, r, g, b);
        v1[1] = y1;
        v1[2] = z1;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[2] = z1;
        v0[0] = x0;
        this.drawDebugLine(v0, v1, r, g, b);
        v1[0] = x0;
        v1[2] = z0;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[2] = z0;
        v0[1] = y0;
        this.drawDebugLine(v0, v1, r, g, b);
        v1[1] = y0;
        v1[2] = z1;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[2] = z1;
        v0[0] = x1;
        this.drawDebugLine(v0, v1, r, g, b);
        v1[0] = x1;
        v1[2] = z0;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[0] = x0;
        v0[1] = v1[1] = y1;
        v0[2] = z0;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[2] = v1[2] = z1;
        v1[0] = x0;
        v1[1] = y0;
        this.drawDebugLine(v0, v1, r, g, b);
        v0[0] = v1[0] = x1;
        this.drawDebugLine(v0, v1, r, g, b);
    },

    drawDebugHalfExtents : function debugDrawDrawDebugHalfExtentsFn(extents, r, g, b)
    {
        //8 corners.
        //   a   b
        // c   d
        //
        //   e   f
        // g   h

        //12 lines.
        //ab,bd,bc,ca
        //ae,bf,dh,cg
        //ef,fh,hg,ge

        var md = this.mathDevice;
        //var ca, cb, cc, cd, ce, cf, cg, ch;
        var ca, cb, cc, ce;
        var v3pos = md.v3BuildZero();
        var half_length =   md.v3BuildZero();

        md.aabbGetCenterAndHalf(extents, v3pos, half_length);

        ca   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], -half_length[2]));
        cb   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], -half_length[2]));
        cc   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], +half_length[2]));
        //cd   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], +half_length[2]));
        ce   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], -half_length[2]));
        //cf   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], -half_length[2]));
        //cg   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], +half_length[2]));
        //ch   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], +half_length[2]));

        this.drawDebugLine(ca, cb, r, g, b);
        //this.drawDebugLine(cb,cd,r,g,b);
        //this.drawDebugLine(cd,cc,r,g,b);
        this.drawDebugLine(cc, ca, r, g, b);

        this.drawDebugLine(ca, ce, r, g, b);
       // this.drawDebugLine(cb,cf,r,g,b);
       // this.drawDebugLine(cd,ch,r,g,b);
       // this.drawDebugLine(cc,cg,r,g,b);

        //this.drawDebugLine(ce,cf,r,g,b);
        //this.drawDebugLine(cf,ch,r,g,b);
        //this.drawDebugLine(ch,cg,r,g,b);
        //this.drawDebugLine(cg,ce,r,g,b);
    },

    drawDebugCuboid : function debugDrawDrawDebugCubeFn(v3pos, length, r, g, b)
    {
        //8 corners.
        //   a   b
        // c   d
        //
        //   e   f
        // g   h

        //12 lines.
        //ab,bd,bc,ca
        //ae,bf,dh,cg
        //ef,fh,hg,ge

        var md = this.mathDevice;
        var ca, cb, cc, cd, ce, cf, cg, ch;
        var half_length =   md.v3Build(length[0] * 0.5, length[1] * 0.5, length[2] * 0.5);

        ca   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], -half_length[2]));
        cb   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], -half_length[2]));
        cc   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], +half_length[2]));
        cd   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], +half_length[2]));
        ce   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], -half_length[2]));
        cf   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], -half_length[2]));
        cg   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], +half_length[2]));
        ch   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], +half_length[2]));

        this.drawDebugLine(ca, cb, r, g, b);
        this.drawDebugLine(cb, cd, r, g, b);
        this.drawDebugLine(cd, cc, r, g, b);
        this.drawDebugLine(cc, ca, r, g, b);

        this.drawDebugLine(ca, ce, r, g, b);
        this.drawDebugLine(cb, cf, r, g, b);
        this.drawDebugLine(cd, ch, r, g, b);
        this.drawDebugLine(cc, cg, r, g, b);

        this.drawDebugLine(ce, cf, r, g, b);
        this.drawDebugLine(cf, ch, r, g, b);
        this.drawDebugLine(ch, cg, r, g, b);
        this.drawDebugLine(cg, ce, r, g, b);
    },

    drawDebugCube : function debugDrawDrawDebugCubeFn(v3pos, length, r, g, b)
    {
        //8 corners.
        //   a   b
        // c   d
        //
        //   e   f
        // g   h

        //12 lines.
        //ab,bd,bc,ca
        //ae,bf,dh,cg
        //ef,fh,hg,ge

        var md = this.mathDevice;
        var ca, cb, cc, cd, ce, cf, cg, ch;
        var half_length =   md.v3Build(length * 0.5, length * 0.5, length * 0.5);

        ca   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], -half_length[2]));
        cb   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], -half_length[2]));
        cc   =   md.v3Add(v3pos, md.v3Build(-half_length[0], +half_length[1], +half_length[2]));
        cd   =   md.v3Add(v3pos, md.v3Build(+half_length[0], +half_length[1], +half_length[2]));
        ce   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], -half_length[2]));
        cf   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], -half_length[2]));
        cg   =   md.v3Add(v3pos, md.v3Build(-half_length[0], -half_length[1], +half_length[2]));
        ch   =   md.v3Add(v3pos, md.v3Build(+half_length[0], -half_length[1], +half_length[2]));

        this.drawDebugLine(ca, cb, r, g, b);
        this.drawDebugLine(cb, cd, r, g, b);
        this.drawDebugLine(cd, cc, r, g, b);
        this.drawDebugLine(cc, ca, r, g, b);

        this.drawDebugLine(ca, ce, r, g, b);
        this.drawDebugLine(cb, cf, r, g, b);
        this.drawDebugLine(cd, ch, r, g, b);
        this.drawDebugLine(cc, cg, r, g, b);

        this.drawDebugLine(ce, cf, r, g, b);
        this.drawDebugLine(cf, ch, r, g, b);
        this.drawDebugLine(ch, cg, r, g, b);
        this.drawDebugLine(cg, ce, r, g, b);
    },

    // mat being a maths m43
    drawDebugMatrix : function debugDrawDrawDebugMatrixFn(mat)
    {
        // var sz = 1.0;

        var md = this.mathDevice;

        var po = md.m43Pos(mat);
        // var px = md.m43TransformPoint(mat, md.v3Build(sz, 0, 0));
        // var py = md.m43TransformPoint(mat, md.v3Build(0, sz, 0));
        // var pz = md.m43TransformPoint(mat, md.v3Build(0, 0, sz));

        //this.drawDebugLine(po, px, 255, 0, 0);
        //this.drawDebugLine(po, py, 0, 255, 0);
        //this.drawDebugLine(po, pz, 0, 0, 255);

        this.drawDebugLine(po, md.v3Add(po, md.v3Normalize(md.m43Right(mat))), 255, 0, 0);
        this.drawDebugLine(po, md.v3Add(po, md.v3Normalize(md.m43Up(mat))), 0, 255, 0);
        this.drawDebugLine(po, md.v3Add(po, md.v3Normalize(md.m43At(mat))), 0, 0, 255);
    },

    drawDebugAxis : function debugDrawDrawDebugAxisFn(v3Location, scale)
    {
        var md = this.mathDevice;

        this.drawDebugLine(v3Location, md.v3Add(v3Location, md.v3Build(scale, 0.0, 0.0)), 255, 0, 0);
        this.drawDebugLine(v3Location, md.v3Add(v3Location, md.v3Build(0.0, scale, 0.0)), 0, 255, 0);
        this.drawDebugLine(v3Location, md.v3Add(v3Location, md.v3Build(0.0, 0.0, scale)), 0, 0, 255);
    },

    buildArrowPoints : function debugDrawBuildArrowPoints()
    {
        if (DebugDraw.prototype.arrowPoints === undefined)
        {
            var md      =   this.mathDevice;
            var baseWidth = 0.5;
            var neckWidth = 0.4;
            var neckHeight = 0.75;

            DebugDraw.prototype.arrowPoints = [
                md.v3Build(0.0,         0.0, -baseWidth),
                md.v3Build(0.0,         0.0, baseWidth),
                md.v3Build(neckHeight,  0.0, neckWidth),
                md.v3Build(neckHeight,  0.0, 1.0),
                md.v3Build(1.0,         0.0, 0.0),  //Top
                md.v3Build(neckHeight,  0.0, -1.0),
                md.v3Build(neckHeight,  0.0, -neckWidth),
                md.v3Build(0.0,         0.0, -baseWidth)
            ];
        }
    },

    //
    // drawDebugArrow
    //
    drawDebugArrow : function debugDrawDrawDebugArrowFn(v3Start, v3End, width, r, g, b)
    {
        var md      =   this.mathDevice;
        var forward =   md.v3Sub(v3End, v3Start);
        var length  =   md.v3Length(forward);

        var rotationAmount  =   md.v3ToAngle(forward);
        var m43ScaleMatrix  =   md.m43BuildScale(md.v3Build(length - 0.5, 1.0, width));
        var m43RotateMatrix =   md.m43BuildRotationY(rotationAmount);
        var tMatrix         =   md.m43Mul(m43ScaleMatrix, m43RotateMatrix);
        var worldOffset     =   md.m43TransformVector(m43RotateMatrix, md.v3Build(0.5, 0.0, 0.0));
        md.m43SetPos(tMatrix, md.v3Add(v3Start, worldOffset));

        //this.drawDebugMatrix(tMatrix,r,g,b);

        this.buildArrowPoints();

        var arrowPoints         =   this.arrowPoints;
        var arrowPointsLength   =   arrowPoints.length;

        var thisPoint;
        var prevPoint  =    md.m43TransformPoint(tMatrix, arrowPoints[0]);
        var aPIndex;
        for (aPIndex = 1; aPIndex < arrowPointsLength; aPIndex += 1)
        {
            thisPoint   =   md.m43TransformPoint(tMatrix, arrowPoints[aPIndex], thisPoint);
            this.drawDebugLine(prevPoint, thisPoint, r, g, b);

            prevPoint   =   md.v3Copy(thisPoint, prevPoint);
        }
    },

    //
    // drawDebugLines
    //
    drawDebugLines : function debugDrawDrawDebugLinesFn()
    {
        if (this.debugLinesCount === 0)
        {
            return;
        }

        var sm  =   this.shaderManager;
        var gd  =   this.graphicsDevice;
        var camera = this.camera;

        var shader      = sm.get("shaders/debug.cgfx");
        var technique   = shader.getTechnique("debug_lines");
        if (!technique)
        {
            return;
        }

        gd.setTechnique(technique);

        var techniqueParameters = this.debugLinesTechniqueParameters;
        if (!techniqueParameters)
        {
            techniqueParameters = gd.createTechniqueParameters(
            {
                worldViewProjection: camera.viewProjectionMatrix
            });
            this.debugLinesTechniqueParameters = techniqueParameters;
        }
        else
        {
            techniqueParameters.worldViewProjection = camera.viewProjectionMatrix;
        }

        gd.setTechniqueParameters(techniqueParameters);

        this.vertexBuffer.setData(this.data, 0, (2 * this.debugLinesCount));
        gd.setStream(this.vertexBuffer, this.semantics);
        gd.draw(gd.PRIMITIVE_LINES, (2 * this.debugLinesCount), 0);

        this.clearDebugLineList();
    },

    preload : function debugdrawPreloadFn()
    {
        var sm = this.shaderManager;

        sm.load('shaders/debug.cgfx');
    },

    clearDebugLineList : function debugdrawClearDebugLineListFn()
    {
        this.debugLinesCount = 0;
    }
};

DebugDraw.createFromGlobals = function debugDrawCreateFromGlobalsFn(globals)
{
    return  DebugDraw.create(globals.mathDevice, globals.shaderManager, globals.graphicsDevice, globals.camera);
};

DebugDraw.create = function debugDrawCreateFn(mathDevice, shaderManager, graphicsDevice, camera)
{
    var ret = new DebugDraw(mathDevice, shaderManager, graphicsDevice, camera);
    ret.scratchpad = {
        v0: mathDevice.v3BuildZero(),
        v1: mathDevice.v3BuildZero()
    };
    return ret;
};
