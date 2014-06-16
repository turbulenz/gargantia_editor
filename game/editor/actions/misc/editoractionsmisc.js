/*global AABBTree: false*/
/*global ECUIHelpers: false*/
/*global GameManager: false*/
/*global debug: false*/
/*global Editor: false*/
/*global GameSpace: false*/
/*global Level: false*/
/*global SceneMerge: false*/

Editor.Actions.actionMap.toggleEditorMode = function editoractionsExitEditorModeFn(globals, gameManager /*, params*/)
{
    gameManager.toggleEditor();
};

Editor.Actions.actionMap.setFlagOn = function editoractionsSetFlagOnFn(globals, gameManager, params)
{
    var flagName = params.name;

    debug.assert(flagName, 'Cannot set flag on without valid name: ' + flagName);

    Editor.State.flags[flagName] = true;
};

Editor.Actions.actionMap.setFlagOff = function editoractionsSetFlagOffFn(globals, gameManager, params)
{
    var flagName = params.name;

    debug.assert(flagName, 'Cannot set flag off without valid name: ' + flagName);

    Editor.State.flags[flagName] = false;
};

Editor.Actions.actionMap.toggleFlag = function editoractionsToggleFlagFn(globals, gameManager, params)
{
    var flagName = params.name;

    debug.assert(flagName, 'Cannot toggle flag without valid name: ' + flagName);

    Editor.State.flags[flagName] = (Editor.State.flags[flagName] ? false : true);
};

Editor.Actions.actionMap.lockMouse = function editoractionsLockMouseFn(globals /*, gameManager, params*/)
{
    var inputDevice = globals.inputDevice;

    inputDevice.lockMouse();
};

Editor.Actions.actionMap.unlockMouse = function editoractionsUnlockMouseFn(globals /*, gameManager, params*/)
{
    var inputDevice = globals.inputDevice;

    inputDevice.unlockMouse();
};

Editor.Actions.actionMap.hideMouse = function editoractionsHideCursorFn(globals /*, gameManager, params*/)
{
    var inputDevice = globals.inputDevice;

    inputDevice.hideMouse();
};

Editor.Actions.actionMap.showMouse = function editoractionsShowMouseFn(globals /*, gameManager, params*/)
{
    var inputDevice = globals.inputDevice;

    inputDevice.showMouse();
};

Editor.Actions.actionMap.enableEditorECDebugDrawing = function editoractionsEnableEditorECDebugDrawingFn(
    globals, gameManager /*, params*/)
{
    var debugDrawFlags = globals.debugDrawFlags;
    debugDrawFlags.gameSpaces = true;

    gameManager.addECDebugDrawMask(GameManager.ecDebugDrawMasks.editor);
};

Editor.Actions.actionMap.disableEditorECDebugDrawing = function editoractionsDisableEditorECDebugDrawingFn(
    globals, gameManager /*, params*/)
{
    var debugDrawFlags = globals.debugDrawFlags;
    debugDrawFlags.gameSpaces = false;

    gameManager.removeECDebugDrawMask(GameManager.ecDebugDrawMasks.editor);
};

Editor.Actions.actionMap.buildBlockAABBTree = function editoractionsBuildBlockAABBTreeFn(
    globals, gameManager /*, params*/)
{
    Editor.State.aabbTreeBlocks = AABBTree.create(true);

    var gameSpaceList = gameManager.getGameSpaceList();

    var addBlockList = function addBlockListFn(blockList)
    {
        blockList.forEach(function (block) { Editor.addBlock(block); });
    };

    gameSpaceList.forEach(function (gameSpace) { addBlockList(gameSpace.getBlockList()); });

    Editor.State.aabbTreeBlocks.finalize();
};

Editor.Actions.actionMap.buildEntityAABBTree = function editoractionsBuildEntityAABBTreeFn(
    globals, gameManager /*, params*/)
{
    Editor.State.aabbTreeEntities = AABBTree.create(true);

    var gameSpaceList = gameManager.getGameSpaceList();

    var addEntityList = function addEntityListFn(entityList, mathDevice)
    {
        entityList.forEach(function (entity) { Editor.addEntity(entity, mathDevice); });
    };

    var mathDevice = globals.mathDevice;
    gameSpaceList.forEach(function (gameSpace) { addEntityList(gameSpace.getEntityList(), mathDevice); });

    Editor.State.aabbTreeEntities.finalize();
};

Editor.Actions.actionMap.updateBlockAABBTree = function editoractionsUpdateBlockAABBTreeFn()
{
    Editor.State.aabbTreeBlocks.finalize();
};

Editor.Actions.actionMap.updateEntityAABBTree = function editoractionsUpdateEntityAABBTreeFn()
{
    Editor.State.aabbTreeEntities.finalize();
};

Editor.Actions.actionMap.buildWidgetAABBTree = function editoractionsBuildWidgetAABBTreeFn(
    globals /*, gameManager, params*/)
{
    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    var aabbTreeWidgets = null;

    if (selectedObjectGroup && selectedObjectGroup.v3Location)
    {
        var v3Location = selectedObjectGroup.v3Location;
        var camera  = globals.camera;
        var mathDevice = globals.mathDevice;
        var v3CameraLocation = mathDevice.m43Pos(camera.matrix);
        var widgetScale = (mathDevice.v3Distance(v3Location, v3CameraLocation) * Editor.State.widgetScaleFactor);
        Editor.State.widgetScale = widgetScale;

        aabbTreeWidgets = AABBTree.create(true);

        var axisWidth = (0.5 * widgetScale);
        var axisLength = (2.0 * widgetScale);
        var axisLocationOffset = (axisLength * 0.5);

        var v3X = mathDevice.v3Build(1.0, 0.0, 0.0);
        var v3Y = mathDevice.v3Build(0.0, 1.0, 0.0);
        var v3Z = mathDevice.v3Build(0.0, 0.0, 1.0);

        var v3XAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3X, axisLocationOffset);
        var v3YAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3Y, axisLocationOffset);
        var v3ZAxisLocation = mathDevice.v3AddScalarMul(v3Location, v3Z, axisLocationOffset);

        var v3XAxisHalfExtents = mathDevice.v3Build((axisLength * 0.5), (axisWidth * 0.5), (axisWidth * 0.5));
        var v3YAxisHalfExtents = mathDevice.v3Build((axisWidth * 0.5), (axisLength * 0.5), (axisWidth * 0.5));
        var v3ZAxisHalfExtents = mathDevice.v3Build((axisWidth * 0.5), (axisWidth * 0.5), (axisLength * 0.5));

        var xAxisExtents = mathDevice.aabbBuildFromCentreHalfExtents(v3XAxisLocation, v3XAxisHalfExtents);
        var yAxisExtents = mathDevice.aabbBuildFromCentreHalfExtents(v3YAxisLocation, v3YAxisHalfExtents);
        var zAxisExtents = mathDevice.aabbBuildFromCentreHalfExtents(v3ZAxisLocation, v3ZAxisHalfExtents);

        aabbTreeWidgets.add({axis : 0}, xAxisExtents);
        aabbTreeWidgets.add({axis : 1}, yAxisExtents);
        aabbTreeWidgets.add({axis : 2}, zAxisExtents);

        aabbTreeWidgets.finalize();
    }

    Editor.State.aabbTreeWidgets = aabbTreeWidgets;
};

Editor.Actions.actionMap.doGameButtons = function editoractionsDoGameButtonsFn()
{
};

Editor.Actions.actionMap.startDrag = function editoractionsStartDragFn(globals /*, gameManager, params*/)
{
    var mathDevice = globals.mathDevice;

    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    if (selectedObjectGroup)
    {
        var v3Location = mathDevice.v3Copy(selectedObjectGroup.v3Location);
        var v3Rotation = mathDevice.v3Copy(selectedObjectGroup.v3Rotation);
        var v3Scale = mathDevice.v3Copy(selectedObjectGroup.v3Scale);

        Editor.State.startDragState =
        {
            v3Location : v3Location,
            v3Rotation : v3Rotation,
            v3Scale : v3Scale
        };
    }

    Editor.State.v2CursorStartDragScreenLocation = mathDevice.v2Copy(Editor.State.v2CursorScreenLocation);
};

Editor.Actions.actionMap.showSpawners = function editoractionsShowSpawnersFn(globals, gameManager /*, params*/)
{
    var entityList    =   gameManager.getEntitiesWithEC('ECEntitySpawner');

    var entityListLength = entityList.length;
    var entityListIndex;

    var currentEntity;
    for (entityListIndex = 0; entityListIndex < entityListLength; entityListIndex += 1)
    {
        currentEntity   =   entityList[entityListIndex];

        currentEntity.showMesh();
        currentEntity.refreshMesh();
    }
};

Editor.Actions.actionMap.hideSpawners = function editoractionshideSpawnersFn(globals, gameManager /*, params*/)
{
    var entityList    =   gameManager.getEntitiesWithEC('ECEntitySpawner');

    var entityListLength = entityList.length;
    var entityListIndex;

    var currentEntity;
    for (entityListIndex = 0; entityListIndex < entityListLength; entityListIndex += 1)
    {
        currentEntity   =   entityList[entityListIndex];

        currentEntity.hideMesh();
    }
};

Editor.Actions.actionMap.endDrag = function editoractionsEndDragFn()
{
    Editor.State.startDragState = null;
    Editor.State.v2CursorStartDragScreenLocation = null;
};

Editor.Actions.actionMap.setCursorScreenLocation = function editoractionsSetCursorScreenLocationFn(globals, gameManager, params)
{
    var graphicsDevice = globals.graphicsDevice;
    var mathDevice = globals.mathDevice;
    var screenWidth = graphicsDevice.width;
    var screenHeight = graphicsDevice.height;

    debug.assert((params.x !== undefined), 'Cannot update cursor screen location x without new x value.');
    debug.assert((params.y !== undefined), 'Cannot update cursor screen location y without new y value.');

    var screenLocationX = mathDevice.clamp(params.x, 0, screenWidth);
    var screenLocationY = mathDevice.clamp(params.y, 0, screenHeight);

    Editor.State.v2CursorScreenLocation[0] = screenLocationX;
    Editor.State.v2CursorScreenLocation[1] = screenLocationY;
};

Editor.Actions.actionMap.replaceSelectedObjectsWithBlock = function editoractionsmiscReplaceSelectedObjectsWithBlockFn(
    globals, gameManager, params)
{
    var blockArchetypeName = params.text;
    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    var isBlock = true;
    var newObjectGroup = Editor.ObjectGroup.replaceObjectsWithArchetype(
        selectedObjectGroup, blockArchetypeName, isBlock, globals, gameManager);

    Editor.Actions.actionMap.discardSelectedObjects();
    Editor.State.selectedObjectGroup = newObjectGroup;
};

Editor.Actions.actionMap.replaceSelectedObjectsWithEntity =
    function editoractionsmiscReplaceSelectedObjectsWithEntityFn(globals, gameManager, params)
{
    var entityArchetypeName = params.text;
    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    var isBlock = false;
    var newObjectGroup = Editor.ObjectGroup.replaceObjectsWithArchetype(
        selectedObjectGroup, entityArchetypeName, isBlock, globals, gameManager);

    Editor.Actions.actionMap.discardSelectedObjects();
    Editor.State.selectedObjectGroup = newObjectGroup;
};

Editor.Actions.actionMap.clearObjectAtCursor = function editoractionsClearObjectAtCursorFn()
{
    Editor.State.objectAtCursor = null;
};

Editor.Actions.actionMap.createNewLevel = function editoractionsCreateNewLevelFn(
    globals, gameManager /*, params*/)
{
    var mathDevice = globals.mathDevice;

    var v3GameSpaceHalfExtents = mathDevice.v3Build(50.0, 15.0, 50.0);
    var v3GameSpaceCentre = mathDevice.v3BuildZero();
    var extents = mathDevice.aabbBuildFromCentreHalfExtents(v3GameSpaceCentre, v3GameSpaceHalfExtents);
    var m43Transform = mathDevice.m43BuildIdentity();

    var newLevel = Level.createEmptyLevel(gameManager);

    var newGameSpace = GameSpace.create('GameSpace', globals, extents, m43Transform);
    newLevel.gameSpaceList = [newGameSpace];

    gameManager.setCurrentLevel(newLevel);
};

Editor.Actions.actionMap.updateObjectAtCursor = function editoractionsUpdateObjectAtCursorFn(
    globals /*, gameManager, params*/)
{
    var v2CursorScreenLocation = Editor.State.v2CursorScreenLocation;

    var aabbTreeBlocks = Editor.State.aabbTreeBlocks;
    var aabbTreeEntities = Editor.State.aabbTreeEntities;

    var aabbTreeList = [];

    if (Editor.State.flags.enableBlockSelection)
    {
        aabbTreeList.push(aabbTreeBlocks);
    }

    if (Editor.State.flags.enableEntitySelection)
    {
        aabbTreeList.push(aabbTreeEntities);
    }

    var mathDevice = globals.mathDevice;
    var camera = globals.camera;

    var collidedObjectList = Editor.cameraRayTest(v2CursorScreenLocation, camera, aabbTreeList, mathDevice);
    var numberOfCollidedObjects = collidedObjectList.length;

    if (numberOfCollidedObjects > 0)
    {
        Editor.State.objectAtCursor = collidedObjectList[0];
    }
    else
    {
        Editor.State.objectAtCursor = null;
    }
};

Editor.Actions.actionMap.updateWidgetAtCursor = function editoractionsUpdateWidgetAtCursorFn(
    globals /*, gameManager, params*/)
{
    var v2CursorScreenLocation = Editor.State.v2CursorScreenLocation;
    var aabbTreeWidgets = Editor.State.aabbTreeWidgets;

    if (!aabbTreeWidgets)
    {
        return;
    }

    var aabbTreeList = [aabbTreeWidgets];

    var mathDevice = globals.mathDevice;
    var camera = globals.camera;

    var collidedObjectList = Editor.cameraRayTest(v2CursorScreenLocation, camera, aabbTreeList, mathDevice);
    var numberOfCollidedObjects = collidedObjectList.length;

    if (numberOfCollidedObjects > 0)
    {
        Editor.State.widgetAtCursor = collidedObjectList[0];
    }
    else
    {
        Editor.State.widgetAtCursor = null;
    }
};

Editor.Actions.actionMap.enableBlockMovement = function editoractionsEnableBlockMovement(
    globals /*, gameManager, params*/)
{
};

Editor.Actions.actionMap.disableBlockMovement = function editoractionsDisableBlockMovement(
    globals /*, gameManager, params*/)
{
};

Editor.Actions.actionMap.updateSelectedObjectEcProperties = function editoractionsmiscUpdateSelectedObjectEcProperties(
    globals, gameManager, params)
{
    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    var lastSelectedEntityName = Editor.State.lastSelectedEntityName;
    var currentSelectedObject = null;
    var currentSelectedEntityName = null;

    if (selectedObjectGroup && selectedObjectGroup.objectList.length === 1)
    {
        var selectedObject = selectedObjectGroup.objectList[0];
        if (!selectedObject.isFromBlock)
        {
            currentSelectedObject = selectedObject;
            currentSelectedEntityName = currentSelectedObject.name;
        }
    }

    var duiManager = globals.dynamicUI;
    var groupTitle = params.title;
    var ecGroupId = Editor.UI.uiGroupIdMap[groupTitle];

    if (currentSelectedEntityName !== lastSelectedEntityName)
    {
        var removedElementIdList = Editor.UI.uiGroupIdElementIdMap[ecGroupId];
        if (removedElementIdList)
        {
            removedElementIdList.forEach(function (elementId) { duiManager.destroy(elementId); });
            delete Editor.UI.uiGroupIdElementIdMap[ecGroupId];
        }

        if (currentSelectedEntityName)
        {
            var editablePropertiesMap = currentSelectedObject.editableProperties;
            if (editablePropertiesMap)
            {
                Editor.UI.uiGroupIdElementIdMap[ecGroupId] =
                    ECUIHelpers.addEntityUI(editablePropertiesMap, ecGroupId, duiManager);
            }
        }
    }

    Editor.State.lastSelectedEntityName = currentSelectedEntityName;
};

Editor.Actions.actionMap.copySelectedObjects = function editoractionsmiscCopySelectedObjectFn(
    globals, gameManager /*, params*/)
{
    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var objectGroupCopy = Editor.ObjectGroup.copyObjectGroup(selectedObjectGroup, globals, gameManager);
    Editor.State.copyState = Editor.ObjectGroup.serializeObjectGroup(objectGroupCopy, globals.mathDevice);

    Editor.ObjectGroup.discardObjectGroup(objectGroupCopy);
};

Editor.Actions.actionMap.pasteSelectedObjects = function editoractionsmiscPasteSelectedObjects(
    globals, gameManager /*, params*/)
{
    var serializedObjectGroup = Editor.State.copyState;
    if (serializedObjectGroup)
    {
        var parsedObjectGroup = Editor.ObjectGroup.parseObjectGroup(serializedObjectGroup, globals, gameManager);
        var selectedObjectGroup = Editor.State.selectedObjectGroup;
        var newObjectGroup;

        if (selectedObjectGroup)
        {
            newObjectGroup =
                Editor.ObjectGroup.mergeObjectGroup(selectedObjectGroup, parsedObjectGroup, globals.mathDevice);
        }
        else
        {
            newObjectGroup = parsedObjectGroup;
        }

        Editor.State.selectedObjectGroup = newObjectGroup;
    }
};

Editor.Actions.actionMap.setGameSpaceHalfExtents = function editoractionsmiscSetGameSpaceHalfExtentsFn(
    globals, gameManager, params)
{
    var gameSpaceList = gameManager.gameSpaceList;
    debug.assert(gameSpaceList.length === 1, 'Cannot get gamespace size for multiple gamespaces');
    var gameSpace = gameSpaceList[0];
    var v3Location = gameSpace.getv3Location();

    var v3NewHalfExtents = params.value;
    var mathDevice = globals.mathDevice;
    var v3MinExtents = mathDevice.v3Sub(v3Location, v3NewHalfExtents);
    var v3MaxExtents = mathDevice.v3Add(v3Location, v3NewHalfExtents);
    var newExtents = mathDevice.aabbBuild(
        v3MinExtents[0], v3MinExtents[1], v3MinExtents[2],
        v3MaxExtents[0], v3MaxExtents[1], v3MaxExtents[2]);

    var entityList = gameSpace.getEntityList();
    var blockList = gameSpace.getBlockList();

    var removeEntityList = entityList.filter(
        function (entity) { return !Editor.Math.isV3InExtents(newExtents, entity.getv3Location()); });
    removeEntityList.forEach(function (entity)
    {
        entity.setToBeDestroyed();
        Editor.removeEntity(entity);
    });

    var removeBlockList = blockList.filter(
        function (block) { return !Editor.Math.isV3InExtents(newExtents, block.getv3Location()); });
    removeBlockList.forEach(function (block)
    {
        var gameSpace = gameManager.getGameSpace(block.getv3Location());
        block.removeFromGameSpace(gameSpace);
        block.destroy();
        gameSpace.finalizeIfNeeded();
        Editor.removeBlock(block);
    });

    gameSpace.destroyDeadEntities();
    gameSpace.finalizeIfNeeded();

    gameSpace.extents = newExtents;

    Editor.Actions.actionMap.saveToUndoStack(globals, gameManager, params);
    Editor.Actions.actionMap.loadFromUndoStack(globals, gameManager, params);
};