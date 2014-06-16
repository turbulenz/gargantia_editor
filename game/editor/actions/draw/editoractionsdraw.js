/*global debug: false*/
/*global Editor: false*/
/*global SimpleBlendStyle: false*/

Editor.Actions.actionMap.drawGameSpaces = function editoractionsdrawDrawGameSpacesFn(
    globals, gameManager /*, params*/)
{
    gameManager.drawGameSpaces();
};

Editor.Actions.actionMap.drawGameSpaceExtents = function editoractionsdrawDrawGameSpaceExtentsFn(
    globals, gameManager /*, params*/)
{
    var debugDraw = globals.debugDraw;
    var gameSpaceList = gameManager.getGameSpaceList();
    var gameSpaceExtentsColour = Editor.State.gameSpaceExtentsColour;

    gameSpaceList.forEach(
        function (gameSpace) { Editor.Draw.drawExtents(gameSpace.getExtents(), gameSpaceExtentsColour, debugDraw); });
};

Editor.Actions.actionMap.drawBlockGrids = function editoractionsdrawDrawBlockGridsFn(globals, gameManager, params)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;

    var v3GridColour = Editor.State.majorGridColour;
    var gameSpaceList = gameManager.getGameSpaceList();

    var archetypeList = params.archetypeList;
    var gridElementSize = Editor.getEditorStateFromName('majorGridSize');

    gameSpaceList.forEach(
        function (gameSpace)
        {
            Editor.Draw.drawBlockGridsForGameSpace(
                gameSpace, archetypeList, v3GridColour, gridElementSize, gameManager, debugDraw, mathDevice);
        });
};

Editor.Actions.actionMap.drawMinorBlockGrids = function editoractionsdrawDrawMinorBlockGridsFn(
    globals, gameManager, params)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;

    var v3GridColour = Editor.State.minorGridColour;
    var gameSpaceList = gameManager.getGameSpaceList();

    var archetypeList = params.archetypeList;
    var majorGridElementSize = Editor.getEditorStateFromName('majorGridSize');
    var minorGridElementSize = Editor.getEditorStateFromName('minorGridSize');

    gameSpaceList.forEach(
        function (gameSpace)
        {
            Editor.Draw.drawBlockGridsForGameSpace(
                gameSpace, archetypeList, v3GridColour, minorGridElementSize,
                gameManager, debugDraw, mathDevice, majorGridElementSize);
        });
};

Editor.Actions.actionMap.drawEntitiesWithoutMeshes = function editoractionsdrawDrawEntitiesWithoutMeshesFn(
    globals, gameManager, params)
{
    var v3Colour = params.v3Colour;

    var debugDraw = globals.debugDraw;
    var gameSpaceList = gameManager.getGameSpaceList();
    var mathDevice = globals.mathDevice;

    gameSpaceList.forEach(
        function (gameSpace)
        {
            var entityList = gameSpace.getEntityList();
            var entitiesWithoutMeshList = entityList.filter(function (entity) { return !entity.getEC('ECMesh'); });

            entitiesWithoutMeshList.forEach(
                function (entity) { Editor.Draw.drawEntityExtents(entity, v3Colour, debugDraw, mathDevice); });
        });
};

Editor.Actions.actionMap.drawSelectedEntityExtents = function editoractionsdrawDrawSelectedEntityExtentsFn(
    globals /*, gameManager, params*/)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;
    var selectedObjects = Editor.State.selectedObjects;
    var selectedObjectExtentsColour = Editor.State.selectedEntityExtentsColour;

    selectedObjects.forEach(
        function (selectedObject)
        {
            Editor.Draw.drawEntityExtents(selectedObject, selectedObjectExtentsColour, debugDraw, mathDevice);
        });
};

Editor.Actions.actionMap.drawSelectedObjectGroupExtents = function editoractionsdrawDrawSelectedObjectGroupExtentsFn(
    globals /*, gameManager, params*/)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;
    var selectedObjects = Editor.State.selectedObjectGroup.objectList;
    var selectedObjectExtentsColour = Editor.State.selectedEntityExtentsColour;

    selectedObjects.forEach(
        function (object)
        {
            Editor.Draw.drawEntityExtents(object, selectedObjectExtentsColour, debugDraw, mathDevice);
        });
};

Editor.Actions.actionMap.drawSelectedObjectGroupOrientation = function editoractionsdrawdrawSelectedObjectGroupOrientationFn(
        globals /*, gameManager, params*/)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;
    var selectedObjects = Editor.State.selectedObjectGroup.objectList;
    var selectedObjectOrientColour = Editor.State.selectedEntityOrientationColour;

    selectedObjects.forEach(
            function (object)
            {
                Editor.Draw.drawEntityOrientation(object, selectedObjectOrientColour, debugDraw, mathDevice);
            });
};

Editor.Actions.actionMap.drawObjectAtCursorExtents = function editoractionsdrawDrawObjectAtCursorExtentsFn(
    globals /*, gameManager, params*/)
{
    var debugDraw = globals.debugDraw;
    var objectAtCursor = Editor.State.objectAtCursor;

    if (objectAtCursor)
    {
        var objectAtCursorExtentsColour = Editor.State.objectAtCursorExtentsColour;

        if (objectAtCursor.isBlock)
        {
            Editor.Draw.drawBlockExtents(objectAtCursor, objectAtCursorExtentsColour, debugDraw);
        }
        else
        {
            var mathDevice = globals.mathDevice;
            Editor.Draw.drawEntityExtents(objectAtCursor, objectAtCursorExtentsColour, debugDraw, mathDevice);
        }
    }
};

Editor.Actions.actionMap.drawGuiArchetype = function editoractionsdrawDrawGuiArchetype(globals, gameManager, params)
{
    var guiManager = gameManager.getGuiManager();
    var guiArchetypeName = params.guiArchetypeName;
    var renderInfo = {};

    guiManager.addDrawGui(guiArchetypeName, renderInfo);
};

Editor.Actions.actionMap.drawWidgetAABBTree = function editoractionsdrawDrawWidgetAABBTreeFn(
    globals /*, gameManager, params*/)
{
    var aabbTree = Editor.State.aabbTreeWidgets;
    var nodeList = aabbTree.nodes;

    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;

    var v3ExtentsColour = mathDevice.v3BuildOne();

    nodeList.forEach(
        function (node)
        {
            var extents = node.extents;
            Editor.Draw.drawExtents(extents, v3ExtentsColour, debugDraw);
        });
};

Editor.Actions.actionMap.drawWidgetX = function editoractionsdrawDrawWidgetXFn(
    globals, gameManager, params)
{
    debug.assert((params.spritePath !== undefined), 'Must provide a sprite path to draw the widget.');
    var editorAxisWidgetPath = params.spritePath;

    var simpleSpriteRenderer = globals.simpleSpriteRenderer;
    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    var v3Location = objectGroup.v3Location;
    var widgetScale = Editor.State.widgetScale;

    var v3X = mathDevice.v3Build(1.0, 0.0, 0.0);
    var v3XAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3X, widgetScale);

    var v4XAxisColour = mathDevice.v4Build(1.0, 0.0, 0.0, 1.0);
    var v4SelectedWidgetColour = mathDevice.v4Build(1.0, 1.0, 0.0, 1.0);

    var widgetAtCursor = Editor.State.widgetAtCursor;
    if (widgetAtCursor)
    {
        var axis = widgetAtCursor.axis;
        if (axis === 0)
        {
            v4XAxisColour = v4SelectedWidgetColour;
        }
    }

    var v3XZPlaneOut = mathDevice.v3Build(0.0, 1.0, 0.0);
    var xAxisAngle = (-Math.PI / 2);
    var axisSpriteWidth = (1.5 * widgetScale);
    var axisSpriteLength = (widgetScale);

    // Draw x axis widget
    v4XAxisColour[3] = 0.25;
    var spriteParameters =
    {
        v3Location : v3XAxisLocation,
        sizeX : axisSpriteLength,
        sizeY : axisSpriteWidth,
        blendStyle : SimpleBlendStyle.prototype.blendStyle.NORMAL_NO_Z,
        texture : editorAxisWidgetPath,
        v4color : v4XAxisColour,
        out : v3XZPlaneOut,
        angle : xAxisAngle
    };

    simpleSpriteRenderer.addSprite(spriteParameters);

    spriteParameters.v4color[3] = 1.0;
    spriteParameters.blendStyle = SimpleBlendStyle.prototype.blendStyle.NORMAL;
    simpleSpriteRenderer.addSprite(spriteParameters);
};

Editor.Actions.actionMap.drawWidgetY = function editoractionsdrawDrawWidgetYFn(
    globals, gameManager, params)
{
    debug.assert((params.spritePath !== undefined), 'Must provide a sprite path to draw the widget.');
    var editorAxisWidgetPath = params.spritePath;

    var simpleSpriteRenderer = globals.simpleSpriteRenderer;
    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    var v3Location = objectGroup.v3Location;
    var widgetScale = Editor.State.widgetScale;

    var v3Y = mathDevice.v3Build(0.0, 1.0, 0.0);
    var v3YAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3Y, widgetScale);

    var v4YAxisColour = mathDevice.v4Build(0.0, 1.0, 0.0, 1.0);
    var v4SelectedWidgetColour = mathDevice.v4Build(1.0, 1.0, 0.0, 1.0);

    var widgetAtCursor = Editor.State.widgetAtCursor;
    if (widgetAtCursor)
    {
        var axis = widgetAtCursor.axis;
        if (axis === 1)
        {
            v4YAxisColour = v4SelectedWidgetColour;
        }
    }

    var v3XYPlaneOut = mathDevice.v3Build(0.0, 0.0, 1.0);
    var yAxisAngle = 0.0;

    var axisSpriteWidth = (1.5 * widgetScale);
    var axisSpriteLength = (widgetScale);

    // Draw y axis widget
    v4YAxisColour[3] = 0.25;
    var spriteParameters =
    {
        v3Location : v3YAxisLocation,
        sizeX : axisSpriteWidth,
        sizeY : axisSpriteLength,
        blendStyle : SimpleBlendStyle.prototype.blendStyle.NORMAL_NO_Z,
        texture : editorAxisWidgetPath,
        v4color : v4YAxisColour,
        out : v3XYPlaneOut,
        angle : yAxisAngle
    };

    simpleSpriteRenderer.addSprite(spriteParameters);

    spriteParameters.out = mathDevice.v3Build(1.0, 0.0, 0.0);
    simpleSpriteRenderer.addSprite(spriteParameters);

    spriteParameters.v4color[3] = 1.0;
    spriteParameters.out        = v3XYPlaneOut;
    spriteParameters.blendStyle = SimpleBlendStyle.prototype.blendStyle.NORMAL;
    simpleSpriteRenderer.addSprite(spriteParameters);

    spriteParameters.out = mathDevice.v3Build(1.0, 0.0, 0.0);
    simpleSpriteRenderer.addSprite(spriteParameters);
};

Editor.Actions.actionMap.drawWidgetZ = function editoractionsdrawDrawWidgetZFn(
    globals, gameManager, params)
{
    debug.assert((params.spritePath !== undefined), 'Must provide a sprite path to draw the widget.');
    var editorAxisWidgetPath = params.spritePath;

    var simpleSpriteRenderer = globals.simpleSpriteRenderer;
    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    var v3Location = objectGroup.v3Location;
    var widgetScale = Editor.State.widgetScale;

    var v3Z = mathDevice.v3Build(0.0, 0.0, 1.0);
    var v3ZAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3Z, widgetScale);

    var v4ZAxisColour = mathDevice.v4Build(0.0, 0.0, 1.0, 1.0);
    var v4SelectedWidgetColour = mathDevice.v4Build(1.0, 1.0, 0.0, 1.0);

    var widgetAtCursor = Editor.State.widgetAtCursor;
    if (widgetAtCursor)
    {
        var axis = widgetAtCursor.axis;
        if (axis === 2)
        {
            v4ZAxisColour = v4SelectedWidgetColour;
        }
    }

    var v3XZPlaneOut = mathDevice.v3Build(0.0, 1.0, 0.0);
    var zAxisAngle = 0.0;

    var axisSpriteWidth = (1.5 * widgetScale);
    var axisSpriteLength = (widgetScale);

    // Draw z axis widget
    v4ZAxisColour[3] = 0.25;
    var spriteParameters =
    {
        v3Location : v3ZAxisLocation,
        sizeX : axisSpriteWidth,
        sizeY : axisSpriteLength,
        blendStyle : SimpleBlendStyle.prototype.blendStyle.NORMAL_NO_Z,
        texture : editorAxisWidgetPath,
        v4color : v4ZAxisColour,
        out : v3XZPlaneOut,
        angle : zAxisAngle
    };

    simpleSpriteRenderer.addSprite(spriteParameters);

    // Draw z axis widget
    spriteParameters.v4color[3] = 1.0;
    spriteParameters.blendStyle = SimpleBlendStyle.prototype.blendStyle.NORMAL;
    simpleSpriteRenderer.addSprite(spriteParameters);
};

Editor.Actions.actionMap.drawEditorFlags = function editoractionsdrawDrawEditorFlagsFn(
    globals /*, gameManager, params*/)
{
    var mathDevice = globals.mathDevice;
    var simpleFontRenderer = globals.simpleFontRenderer;

    var editorFlags = Editor.State.flags;
    var lineStepHeight = 15;
    var v2FlagTextCoord = mathDevice.v2Build(300, 10);

    var flagName;
    var flagStateText;

    for (flagName in editorFlags)
    {
        if (editorFlags.hasOwnProperty(flagName))
        {
            flagStateText = flagName + ' : ';
            flagStateText = flagStateText + (editorFlags[flagName] ? 'true' : 'false');

            Editor.Draw.drawDebugText(simpleFontRenderer, v2FlagTextCoord, flagStateText);

            v2FlagTextCoord[1] += lineStepHeight;
        }
    }
};

Editor.Actions.actionMap.drawCurrentLevelName = function editoractionsdrawDrawCurrentLevelNameFn(
    globals /*, gameManager, params*/)
{
    var simpleFontRenderer = globals.simpleFontRenderer;
    var guiRenderer = globals.guiRenderer;

    var xOffset = -10;
    var yOffset = 10;
    var alignment = 2;

    var v2CurrentLevelNameLocation = guiRenderer.getv2RenderLocation(xOffset, yOffset, 'topRight');

    var currentLevelName = Editor.State.currentLevelName ? Editor.State.currentLevelName : 'un-named';
    var currentLevelNameText = 'Current Level: ' + currentLevelName;

    Editor.Draw.drawDebugText(simpleFontRenderer, v2CurrentLevelNameLocation, currentLevelNameText, alignment);
};

Editor.Actions.actionMap.drawSelectedObjectName = function editoractionsdrawDrawSelectedObjectNameFn(
    globals /*, gameManager, params*/)
{
    var simpleFontRenderer = globals.simpleFontRenderer;
    var guiRenderer = globals.guiRenderer;

    var xOffset = -10;
    var yOffset = 25;
    var alignment = 2;

    var v2SelectedObjectNameTextLocation = guiRenderer.getv2RenderLocation(xOffset, yOffset, 'topRight');

    var selectedObjects = Editor.State.selectedObjects;
    var selectedObject = (selectedObjects.length ? selectedObjects[0] : null);

    var selectedObjectArchetypeName = (selectedObject ? selectedObject.archetypeName : 'none');
    var selectedObjectNameText = 'Selected Object: ' + selectedObjectArchetypeName;

    Editor.Draw.drawDebugText(simpleFontRenderer, v2SelectedObjectNameTextLocation, selectedObjectNameText, alignment);
};

Editor.Actions.actionMap.drawObjectAtCursorName = function editoractionsdrawDrawObjectAtCursorNameFn(
    globals /*, gameManager, params*/)
{
    var simpleFontRenderer = globals.simpleFontRenderer;
    var guiRenderer = globals.guiRenderer;

    var objectAtCursor = Editor.State.objectAtCursor;

    var xOffset = -10;
    var yOffset = 40;
    var alignment = 2;

    var v2ObjectAtCursorNameLocation = guiRenderer.getv2RenderLocation(xOffset, yOffset, 'topRight');

    var objectAtCursorArchetypeName = (objectAtCursor ? objectAtCursor.archetypeName : 'none');
    var objectAtCursorNameText = 'Object At Cursor: ' + objectAtCursorArchetypeName;

    Editor.Draw.drawDebugText(simpleFontRenderer, v2ObjectAtCursorNameLocation, objectAtCursorNameText, alignment);
};

Editor.Actions.actionMap.drawCursorLocation = function editoractionsdrawDrawCursorLocationFn(
    globals /*, gameManager, params*/)
{
    var mathDevice = globals.mathDevice;
    var simpleFontRenderer = globals.simpleFontRenderer;
    var v3CursorWorldLocation = Editor.State.v3CursorWorldLocation;

    if (!v3CursorWorldLocation)
    {
        return;
    }

    var v2CursorLocationTextLocation = mathDevice.v2Build(10, 55);

    var cursorLocationText = 'x: ' + v3CursorWorldLocation[0];

    Editor.Draw.drawDebugText(simpleFontRenderer, v2CursorLocationTextLocation, cursorLocationText);

    v2CursorLocationTextLocation[1] += 15;
    cursorLocationText = 'y: ' + v3CursorWorldLocation[1];

    Editor.Draw.drawDebugText(simpleFontRenderer, v2CursorLocationTextLocation, cursorLocationText);

    v2CursorLocationTextLocation[1] += 15;
    cursorLocationText = 'z: ' + v3CursorWorldLocation[2];

    Editor.Draw.drawDebugText(simpleFontRenderer, v2CursorLocationTextLocation, cursorLocationText);
};
