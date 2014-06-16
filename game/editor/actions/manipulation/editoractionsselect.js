/*global debug: false*/
/*global Editor: false*/

Editor.Actions.actionMap.addNewSelectedEntity = function editoractionsselectAddNewSelectedEntityFn(
    globals, gameManager, params)
{
    var entityFactory = gameManager.getEntityFactory();

    var archetypeName = params.text;

    debug.assert(archetypeName, 'Cannot add an entity without a valid archetype name.');

    var v3Location = Editor.getV3NewObjectLocation(globals, gameManager);

    var newSelectedObject = Editor.createEditorObjectFromEntityArchetype(
        globals, v3Location, null, null, archetypeName, entityFactory);

    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    if (!objectGroup)
    {
        objectGroup = Editor.ObjectGroup.createNewObjectGroup();
    }

    Editor.State.selectedObjectGroup =
        Editor.ObjectGroup.addObjectToObjectGroup(objectGroup, newSelectedObject, mathDevice);
};

Editor.Actions.actionMap.addNewSelectedBlock = function editoractionsselectAddNewSelectedBlockFn(
    globals, gameManager, params)
{
    var entityFactory = gameManager.getEntityFactory();
    var blockFactory = gameManager.getBlockFactory();

    var archetypeName = params.text;

    debug.assert(archetypeName, 'Cannot add a block without a valid archetype name.');

    var v3Location = Editor.getV3NewObjectLocation(globals, gameManager);

    var newSelectedObject = Editor.createEditorObjectFromBlockArchetype(
        globals, v3Location, null, null, archetypeName, blockFactory, entityFactory);

    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    if (!objectGroup)
    {
        objectGroup = Editor.ObjectGroup.createNewObjectGroup();
    }

    Editor.State.selectedObjectGroup =
        Editor.ObjectGroup.addObjectToObjectGroup(objectGroup, newSelectedObject, mathDevice);
};

Editor.Actions.actionMap.selectObject = function editoractionsSelectObjectFn(globals, gameManager, params)
{
    var objectToSelect = (params.objectToSelect || Editor.State.objectAtCursor);

    if (!objectToSelect)
    {
        return;
    }

    var selectedObject = Editor.ObjectGroup.selectObject(globals, gameManager, objectToSelect);

    var mathDevice = globals.mathDevice;

    var objectGroup = Editor.State.selectedObjectGroup;
    if (!objectGroup)
    {
        objectGroup = Editor.ObjectGroup.createNewObjectGroup();
    }

    Editor.State.selectedObjectGroup =
        Editor.ObjectGroup.addObjectToObjectGroup(objectGroup, selectedObject, mathDevice);

    Editor.State.objectAtCursor = null;
};

Editor.Actions.actionMap.selectAllObjectsOfArchetype = function editoractionsselectSelectAllObjectsOfArchetypeFn(
    globals, gameManager, params)
{
    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var object = selectedObjectGroup.objectList[0];
    var archetypeName = object.getArchetypeName();
    var isBlock = object.isFromBlock;

    Editor.Actions.actionMap.placeSelectedObjects(globals, gameManager, params);
    Editor.Actions.actionMap.discardSelectedObjects(globals, gameManager, params);

    params.text = archetypeName;
    if (isBlock)
    {
        Editor.Actions.actionMap.selectAllBlocksOfArchetype(globals, gameManager, params);
    }
    else
    {
        Editor.Actions.actionMap.selectAllEntitiesOfArchetype(globals, gameManager, params);
    }
};

Editor.Actions.actionMap.selectAllBlocksOfArchetype = function editoractionsselectSelectAllBlocksOfArchetypeFn(
    globals, gameManager, params)
{
    var archetypeName = params.text;
    var blockOfDesiredType = Editor.getAllBlocksOfArchetype(gameManager, archetypeName);

    blockOfDesiredType.forEach(
        function (block) { Editor.Actions.actionMap.selectObject(globals, gameManager, { objectToSelect : block }); });
};

Editor.Actions.actionMap.selectAllEntitiesOfArchetype = function editoractionsselectSelectAllEntitiesOfArchetypeFn(
    globals, gameManager, params)
{
    var archetypeName = params.text;
    var entitiesOfDesiredType = Editor.getAllEntitiesOfArchetype(gameManager, archetypeName);

    entitiesOfDesiredType.forEach(
        function (block) { Editor.Actions.actionMap.selectObject(globals, gameManager, { objectToSelect : block }); });
};

Editor.Actions.actionMap.selectAll = function editoractionsselectSelectAllFn(globals, gameManager /*, params*/)
{
    var blockList = Editor.getAllBlocks(gameManager);
    var entityList = Editor.getAllEntities(gameManager);
    var combinedList = blockList.concat(entityList);

    combinedList.forEach(
        function (object) { Editor.Actions.actionMap.selectObject(globals, gameManager, { objectToSelect : object }); });
};

Editor.Actions.actionMap.removeObject = function editoractionsRemoveObjectFn(globals, gameManager /*, params*/)
{
    var objectAtCursor = Editor.State.objectAtCursor;

    if (!objectAtCursor)
    {
        return;
    }

    var mathDevice = globals.mathDevice;
    var objectGroup = Editor.State.selectedObjectGroup;

    Editor.ObjectGroup.placeObject(gameManager, mathDevice, objectAtCursor);
    Editor.ObjectGroup.discardObject(objectAtCursor);

    Editor.State.selectedObjectGroup =
        Editor.ObjectGroup.removeObjectFromObjectGroup(objectGroup, objectAtCursor, mathDevice);

    Editor.State.objectAtCursor = null;
};

Editor.Actions.actionMap.removeAllEntitiesFromLevelIfNotLevelSave = function editoractionsRemoveAllEntitiesFromLevelIfNotLevelSaveFn(
    globals, gameManager /*, params*/)
{
    var gameSpaceList = gameManager.getGameSpaceList();
    gameSpaceList.forEach(
        function (gameSpace)
        {
            var entityList = gameSpace.getEntityList().slice();
            entityList.forEach(Editor.ObjectGroup.discardObjectIfNotLevelSave);
        });
};

Editor.Actions.actionMap.removeAllEntitiesFromLevel = function editoractionsRemoveAllEntitiesFromLevelFn(
    globals, gameManager /*, params*/)
{
    var gameSpaceList = gameManager.getGameSpaceList();
    gameSpaceList.forEach(
        function (gameSpace)
        {
            var entityList = gameSpace.getEntityList().slice();
            entityList.forEach(Editor.ObjectGroup.discardObject);
        });
};

Editor.Actions.actionMap.placeSelectedObjects = function editoractionsselectPlaceSelectedObjectsFn(
    globals, gameManager /*, params*/)
{
    var objectGroup = Editor.State.selectedObjectGroup;

    if (!objectGroup)
    {
        return [];
    }

    var mathDevice = globals.mathDevice;

    return Editor.ObjectGroup.placeObjectGroup(objectGroup, gameManager, mathDevice);
};

Editor.Actions.actionMap.discardSelectedObjects = function editoractionsselectDiscardSelectedObjectsFn()
{
    var objectGroup = Editor.State.selectedObjectGroup;

    if (!objectGroup)
    {
        return;
    }

    Editor.ObjectGroup.discardObjectGroup(objectGroup);
    Editor.State.selectedObjectGroup = null;
};

Editor.Actions.actionMap.selectDragArea = function editoractionsselectSelectDragAreaFn(
    globals, gameManager /*, params*/)
{
    var v2StartDragLocation = Editor.State.v2CursorStartDragScreenLocation;
    var v2CurrentLocation = Editor.State.v2CursorScreenLocation;

    var mathDevice = globals.mathDevice;
    var camera = globals.camera;

//    var graphicsDevice = globals.graphicsDevice;
//    var cameraFrustumPlaneList = globals.camera.extractFrustumPlanes(camera.viewProjectionMatrix);
//    var minTestScreenX = 0;
//    var maxTestScreenX = graphicsDevice.width;
//    var minTestScreenY = 0;
//    var maxTestScreenY = graphicsDevice.height;
//    var testFrustumPlaneList = Editor.Math.calculateFrustumPlanesForScreenArea(
//        minTestScreenX, minTestScreenY, maxTestScreenX, maxTestScreenY, camera, mathDevice);
//    testFrustumPlaneList.forEach(function (v4Plane, planeIndex) {
//        debug.assert(mathDevice.v4Equal(v4Plane, cameraFrustumPlaneList[planeIndex], 0.2));
//    });

    var minScreenX = Math.min(v2StartDragLocation[0], v2CurrentLocation[0]);
    var maxScreenX = Math.max(v2StartDragLocation[0], v2CurrentLocation[0]);
    var minScreenY = Math.min(v2StartDragLocation[1], v2CurrentLocation[1]);
    var maxScreenY = Math.max(v2StartDragLocation[1], v2CurrentLocation[1]);
    var dragFrustumPlaneList = Editor.Math.calculateFrustumPlanesForScreenArea(
        minScreenX, minScreenY, maxScreenX, maxScreenY, camera, mathDevice);

    var gameSpaceList = gameManager.getGameSpaceList();
    var insideObjectList = gameSpaceList.reduce(
        function (insideList, gameSpace)
        {
            var entityList = gameSpace.getEntityList();
            var blockList = gameSpace.getBlockList();

            var insideEntityList = entityList.filter(function (entity) {
                var extents = Editor.getEditorEntityExtents(entity, mathDevice);
                return mathDevice.aabbIsInsidePlanes(extents, dragFrustumPlaneList);
            });

            var insideBlockList = blockList.filter(function (block) {
                var extents = Editor.getEditorBlockExtents(block);
                return mathDevice.aabbIsInsidePlanes(extents, dragFrustumPlaneList);
            });

            return insideList.concat(insideEntityList, insideBlockList);
        }, []);

    if (insideObjectList.length > 0)
    {
        Editor.State.selectedObjectGroup = Editor.ObjectGroup.selectObjects(globals, gameManager, insideObjectList);
    }
};