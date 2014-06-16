/*global Editor: false*/

Editor.Draw =
{
    drawEntityExtents : function editordrawDrawEntityExtentsFn(entity, v3ExtentsColour, debugDraw, mathDevice)
    {
        if (!entity.toBeDestroyed)
        {
            var entityExtents = Editor.getEditorEntityExtents(entity, mathDevice);

            Editor.Draw.drawExtents(entityExtents, v3ExtentsColour, debugDraw);
        }
    },

    drawBlockExtents : function editordrawDrawBlockExtentsFn(block, v3ExtentsColour, debugDraw)
    {
        var blockExtents;

        if (block.hasEditorExtents())
        {
            blockExtents = block.getEditorExtents();
        }
        else
        {
            var meshNode = block.meshNode;
            if (meshNode)
            {
                blockExtents = meshNode.calculateHierarchyWorldExtents();
            }
            else
            {
                var blockWorldCube = block.getWorldCube();
                if (blockWorldCube)
                {
                    blockExtents = blockWorldCube.getExtents();
                }
                else
                {
                    blockExtents = block.getEditorExtents();
                }
            }
        }

        Editor.Draw.drawExtents(blockExtents, v3ExtentsColour, debugDraw);
    },

    drawEntityOrientation : function editordrawDrawEntityOrientationFn(entity, v3OrientColour, debugDraw, mathDevice)
    {
        if (!entity.toBeDestroyed)
        {
            var m43 = mathDevice.m43BuildRotationXZY(entity.getV3Rotation());

            var scale = Editor.State.widgetScale || 0;

            debugDraw.drawDebugLine(entity.getv3Location(),
                    mathDevice.v3AddScalarMul(entity.getv3Location(), mathDevice.m43Up(m43), scale),
                    0, 1, 0);

            debugDraw.drawDebugLine(entity.getv3Location(),
                    mathDevice.v3AddScalarMul(entity.getv3Location(), mathDevice.m43Right(m43), scale),
                    1, 0, 0);

            debugDraw.drawDebugLine(entity.getv3Location(),
                    mathDevice.v3AddScalarMul(entity.getv3Location(), mathDevice.m43At(m43), scale),
                    0, 0, 1);
        }
    },

    drawExtents : function editordrawDrawExtentsFn(extents, v3ExtentsColour, debugDraw)
    {
        debugDraw.drawDebugExtents(extents, v3ExtentsColour[0], v3ExtentsColour[1], v3ExtentsColour[2]);
    },

    drawDebugText : function editordrawDrawDebugTextFn(simpleFontRenderer, v2TextCoord, text, alignment)
    {
        var textInfo =
        {
            x : v2TextCoord[0],
            y : v2TextCoord[1],
            pointSize : 16,
            alignment : (alignment || 0)
        };

        simpleFontRenderer.drawFontDouble(text, textInfo);
    },

    drawBlockGridsForGameSpace : function editordrawDrawBlockGridsForGameSpaceFn(
        gameSpace, archetypeList, v3GridColour, gridElementSize, gameManager, debugDraw, mathDevice, ignoreGridSize)
    {
        var gameSpaceExtents = gameSpace.getExtents();
        var v2GridReferencePoint = mathDevice.v2Build(gameSpaceExtents[0], gameSpaceExtents[2]);

        var blockList = archetypeList.reduce(
            function (blockList, archetypeName)
            {
                return blockList.concat(Editor.getAllBlocksOfArchetype(gameManager, archetypeName));
            }, []);

        blockList.forEach(
            function (block) {
                Editor.Draw.drawGridOverlayOnBlock(
                    block, v3GridColour, gridElementSize, v2GridReferencePoint, debugDraw, mathDevice, ignoreGridSize);
            });
    },

    drawGridOverlayOnBlock : function editordrawDrawGridOverlayOnBlockFn(
        block, v3GridColour, gridElementSize, v2GridReferencePoint, debugDraw, mathDevice, ignoreGridSize)
    {
        var blockExtents = Editor.getEditorBlockExtents(block);
        var y = (Math.max(blockExtents[1], blockExtents[4]) + 0.001);
        var v2Min = mathDevice.v2Build(blockExtents[0], blockExtents[2]);
        var v2Max = mathDevice.v2Build(blockExtents[3], blockExtents[5]);

        var v2Difference = mathDevice.v2Sub(v2GridReferencePoint, v2Min);
        v2Difference[0] = (gridElementSize * Editor.Math.roundAwayFromZero(v2Difference[0] / gridElementSize));
        v2Difference[1] = (gridElementSize * Editor.Math.roundAwayFromZero(v2Difference[1] / gridElementSize));
        var v2Start = mathDevice.v2Sub(v2GridReferencePoint, v2Difference);

        mathDevice.v2Sub(v2GridReferencePoint, v2Max, v2Difference);
        v2Difference[0] = (gridElementSize * Editor.Math.roundAwayFromZero(v2Difference[0] / gridElementSize));
        v2Difference[1] = (gridElementSize * Editor.Math.roundAwayFromZero(v2Difference[1] / gridElementSize));
        var v2End = mathDevice.v2Sub(v2GridReferencePoint, v2Difference);

        Editor.Draw.drawGrid(v2Start, v2End, v2Min, v2Max, y,
            v3GridColour, gridElementSize, debugDraw, mathDevice, ignoreGridSize, v2GridReferencePoint);
    },

    drawGrid : function editordrawDrawGridFn(
        v2Start, v2End, v2Min, v2Max, height, v3GridColour, gridElementSize, debugDraw,
        mathDevice, ignoreGridSize, v2GridRefPoint)
    {
        var minStartX = Math.min(v2Start[0], v2End[0]);
        var maxStartX = Math.max(v2Start[0], v2End[0]);
        var minStartZ = Math.min(v2Start[1], v2End[1]);
        var maxStartZ = Math.max(v2Start[1], v2End[1]);

        var minX = Math.min(minStartX, v2Min[0]);
        var maxX = Math.min(maxStartX, v2Max[0]);
        var minZ = Math.min(minStartZ, v2Min[1]);
        var maxZ = Math.min(maxStartZ, v2Max[1]);

        var refPointX = v2GridRefPoint[0];
        var refPointZ = v2GridRefPoint[1];

        var v3LineStart = mathDevice.v3BuildZero();
        var v3LineEnd = mathDevice.v3BuildZero();

        var x;
        var z;
        if (ignoreGridSize === undefined)
        {
            for (x = minStartX; x < maxX; x += gridElementSize)
            {
                mathDevice.v3Build(x, height, minZ, v3LineStart);
                mathDevice.v3Build(x, height, maxZ, v3LineEnd);

                debugDraw.drawDebugLine(v3LineStart, v3LineEnd, v3GridColour[0], v3GridColour[1], v3GridColour[2]);
            }

            for (z = minStartZ; z < maxZ; z += gridElementSize)
            {
                mathDevice.v3Build(minX, height, z, v3LineStart);
                mathDevice.v3Build(maxX, height, z, v3LineEnd);

                debugDraw.drawDebugLine(v3LineStart, v3LineEnd, v3GridColour[0], v3GridColour[1], v3GridColour[2]);
            }
        }
        else
        {
            for (x = minStartX; x < maxX; x += gridElementSize)
            {
                if (((x - refPointX) % ignoreGridSize) !== 0.0)
                {
                    mathDevice.v3Build(x, height, minZ, v3LineStart);
                    mathDevice.v3Build(x, height, maxZ, v3LineEnd);

                    debugDraw.drawDebugLine(v3LineStart, v3LineEnd, v3GridColour[0], v3GridColour[1], v3GridColour[2]);
                }
            }

            for (z = minStartZ; z < maxZ; z += gridElementSize)
            {
                if (((z - refPointZ) % ignoreGridSize) !== 0.0)
                {
                    mathDevice.v3Build(minX, height, z, v3LineStart);
                    mathDevice.v3Build(maxX, height, z, v3LineEnd);

                    debugDraw.drawDebugLine(v3LineStart, v3LineEnd, v3GridColour[0], v3GridColour[1], v3GridColour[2]);
                }
            }
        }

    },

    draw3dGrid : function editordrawDraw3dGridFn(extents, spacing, v3LineColour, debugDraw, mathDevice)
    {
        var minX = extents[0];
        var maxX = extents[3];
        var minY = extents[1];
        var maxY = extents[4];
        var minZ = extents[2];
        var maxZ = extents[5];
        var r = v3LineColour[0];
        var g = v3LineColour[1];
        var b = v3LineColour[2];

        var v3Start = mathDevice.v3BuildZero();
        var v3End = mathDevice.v3BuildZero();

        var x;
        var y;
        var z;

        v3Start[0] = minX;
        v3End[0] = maxX;
        for (y = minY; y <= maxY; y += spacing)
        {
            v3Start[1] = v3End[1] = y;
            for (z = minZ; z <= maxZ; z += spacing)
            {
                v3Start[2] = v3End[2] = z;
                debugDraw.drawDebugLine(v3Start, v3End, r, g, b);
            }
        }

        v3Start[1] = minY;
        v3End[1] = maxY;
        for (z = minZ; z <= maxZ; z += spacing)
        {
            v3Start[2] = v3End[2] = z;
            for (x = minX; x <= maxX; x += spacing)
            {
                v3Start[0] = v3End[0] = x;
                debugDraw.drawDebugLine(v3Start, v3End, r, g, b);
            }
        }

        v3Start[2] = minZ;
        v3End[2] = maxZ;
        for (x = minX; x <= maxX; x += spacing)
        {
            v3Start[0] = v3End[0] = x;
            for (y = minY; y <= maxY; y += spacing)
            {
                v3Start[1] = v3End[1] = y;
                debugDraw.drawDebugLine(v3Start, v3End, r, g, b);
            }
        }
    },

    draw2dBox : function editordrawDraw2dBoxFn(minX, minY, maxX, maxY, v4Color, draw2D, textureManager)
    {
        var blockTexture   = textureManager.load('textures/simple_square.dds');
        if (!blockTexture)
        {
            return;
        }

        draw2D.begin('alpha', 'texture');

        draw2D.draw({
            texture : blockTexture,
            destinationRectangle : [minX, minY, maxX, maxY],
            color : v4Color
        });

        draw2D.end();
    }
};
