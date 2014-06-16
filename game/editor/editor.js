/*global AABBTree: false*/
/*global debug: false*/

var Editor =
{
    State :
    {
        // Settings

        saveLevelDirectory : null,
        loadLevelDirectory : null,
        levelFileExtension : null,

        cameraZoomSpeed : null,
        cameraLookSpeed : null,
        cameraMovementSpeed : null,

        controlLists : null,
        drawControlLists : null,
        draw2dControlLists : null,
        uiElementList : null,
        entityArchetypeList : null,
        blockArchetypeList : null,

        actionListOnEnterEditorMode : null,
        actionListOnExitEditorMode : null,

        // Selected entity
        selectedEntityExtentsColour : null,

        // Gamespace
        gameSpaceExtentsColour : null,
        majorGridColour : null,
        minorGridColour : null,

        // Entity at cursor
        objectAtCursorExtentsColour : null,

        // Entity manipulation
        widgetScaleFactor : null,
        dragFactor : null,
        positionFactor : null,
        rotationFactor : null,
        scaleFactor : null,
        snapScaleFactor : null,

        // Grids
        majorGridSize : null,
        minorGridSize : null,

        // Undo support
        saveStackSize : null,

        // Run-time state

        currentLevelName : null,
        saveAsLevelName : null,
        levelNameList : [],
        uiAdded : false,
        lastSelectedEntityName : null,

        cursorVisible : true,

        v2CursorScreenLocation : null,

        selectedObjects : [],
        selectedObjectGroup : null,

        objectAtCursor : null,

        widgetAtCursor : null,

        flags : {},

        startDragState : null,
        v2CursorStartDragScreenLocation : null,

        aabbTreeBlocks : null,
        aabbTreeEntities : null,
        aabbTreeWidgets : null,
        widgetScale : 1,

        undoStack : null,
        copyState : null
    },

    initState : function editorInitState(
        settings, entityArchetypeList, blockArchetypeList, v2CursorScreenLocation, globals, gameManager)
    {
        var mathDevice = globals.mathDevice;
        var state = Editor.State;

        debug.assert(settings.saveLevelDirectory, 'No \'saveLevelDirectory\' property found in editor settings.');
        state.saveLevelDirectory = settings.saveLevelDirectory;

        debug.assert(settings.loadLevelDirectory, 'No \'loadLevelDirectory\' property found in editor settings.');
        state.loadLevelDirectory = settings.loadLevelDirectory;

        debug.assert(settings.levelFileExtension, 'No \'levelFileExtension\' property found in editor settings.');
        state.levelFileExtension = settings.levelFileExtension;

        debug.assert(settings.cameraLookSpeed, 'No \'cameraLookSpeed\' property found in editor settings.');
        state.cameraLookSpeed = settings.cameraLookSpeed;

        debug.assert(settings.cameraMovementSpeed, 'No \'cameraMovementSpeed\' property found in editor settings.');
        state.cameraMovementSpeed = settings.cameraMovementSpeed;

        debug.assert(settings.cameraZoomSpeed, 'No \'cameraZoomSpeed\' property found in editor settings.');
        state.cameraZoomSpeed = settings.cameraZoomSpeed;

        debug.assert(settings.uiElementList, 'No \'uiElementList\' property found in editor settings.');
        state.uiElementList = settings.uiElementList;

        debug.assert(settings.controlLists, 'No \'controlLists\' property found in editor settings.');
        state.controlLists = settings.controlLists;

        debug.assert(settings.drawControlLists, 'No \'drawControlLists\' property found in editor settings.');
        state.drawControlLists = settings.drawControlLists;

        debug.assert(settings.draw2dControlLists, 'No \'draw2dControlLists\' property found in editor settings.');
        state.draw2dControlLists = settings.draw2dControlLists;

        debug.assert(entityArchetypeList, 'No \'entityArchetypeList\' passed into Editor.initState().');
        state.entityArchetypeList = entityArchetypeList;

        debug.assert(blockArchetypeList, 'No \'blockArchetypeList\' passed into Editor.initState().');
        state.blockArchetypeList = blockArchetypeList;

        debug.assert(settings.actionListOnEnterEditorMode, 'No \'actionListOnEnterEditorMode\' property found in editor settings.');
        state.actionListOnEnterEditorMode = settings.actionListOnEnterEditorMode;

        debug.assert(settings.actionListOnExitEditorMode, 'No \'actionListOnExitEditorMode\' property found in editor settings.');
        state.actionListOnExitEditorMode = settings.actionListOnExitEditorMode;

        debug.assert(settings.selectedEntityExtentsColour,
            'No \'selectedEntityExtentsColour\' property found in editor settings.');
        state.selectedEntityExtentsColour = settings.selectedEntityExtentsColour;

        debug.assert(settings.gameSpaceExtentsColour, 'No \'gameSpaceExtentsColour\' property found in editor settings.');
        state.gameSpaceExtentsColour = settings.gameSpaceExtentsColour;

        debug.assert(settings.majorGridColour, 'No \'majorGridColour\' property found in editor settings.');
        state.majorGridColour = settings.majorGridColour;

        debug.assert(settings.minorGridColour, 'No \'minorGridColour\' property found in editor settings.');
        state.minorGridColour = settings.minorGridColour;

        debug.assert(settings.objectAtCursorExtentsColour,
            'No \'objectAtCursorExtentsColour\' property found in editor settings.');
        state.objectAtCursorExtentsColour = settings.objectAtCursorExtentsColour;

        debug.assert(settings.widgetScaleFactor, 'No \'widgetScaleFactor\' property found in editor settings.');
        state.widgetScaleFactor = settings.widgetScaleFactor;

        debug.assert(settings.dragFactor, 'No \'dragFactor\' property found in editor settings.');
        state.dragFactor = settings.dragFactor;

        debug.assert(settings.positionFactor, 'No \'positionFactor\' property found in editor settings.');
        state.positionFactor = settings.positionFactor;

        debug.assert(settings.rotationFactor, 'No \'rotationFactor\' property found in editor settings.');
        state.rotationFactor = settings.rotationFactor;

        debug.assert(settings.scaleFactor, 'No \'scaleFactor\' property found in editor settings.');
        state.scaleFactor = settings.scaleFactor;

        debug.assert(settings.snapScaleFactor, 'No \'snapScaleFactor\' property found in editor settings.');
        state.snapScaleFactor = settings.snapScaleFactor;

        debug.assert(settings.majorGridSize, 'No \'majorGridSize\' property found in editor settings.');
        state.majorGridSize = settings.majorGridSize;

        debug.assert(settings.minorGridSize, 'No \'minorGridSize\' property found in editor settings.');
        state.minorGridSize = settings.minorGridSize;

        debug.assert(settings.saveStackSize, 'No \'saveStackSize\' property found in editor settings.');
        state.saveStackSize = settings.saveStackSize;

        debug.assert(v2CursorScreenLocation, 'No \'v2CursorScreenLocation\' passed into Editor.initState().');
        state.v2CursorScreenLocation = mathDevice.v2Copy(v2CursorScreenLocation);

        state.objectAtCursor = null;
    },

    initUI: function editorInitUiFn(settings, globals, gameManager)
    {
        var state = Editor.State;
        if (!state.uiAdded)
        {
            state.uiAdded = true;

            var uiGroupID = globals.editorUIGroupId;

            Editor.UI.addEditorUI(settings.uiElementList, uiGroupID, globals, gameManager);
        }
    },

    removeUI: function editorRemoveUIFn(globals)
    {
        var uiGroupID = globals.editorUIGroupId;
        if (uiGroupID)
        {
            Editor.State.uiAdded = false;
            globals.dynamicUI.removeAllFromGroup(uiGroupID, [], true);
        }
    },

    getEditorStateFromName : function editorGetStateFromNameFn(propertyName)
    {
        debug.assert(Editor.State.hasOwnProperty(propertyName),
            '\'' + propertyName + '\' is not a recognized editor state var.');

        return Editor.State[propertyName];
    },

    getEditorFlagStateFromName : function editorGetEditorFlagStateFromNameFn(flagName)
    {
        debug.assert(Editor.State.flags.hasOwnProperty(flagName),
            '\'' + flagName + '\' is not a recognized editor flag. You need to initialise all flags.');

        return Editor.State.flags[flagName];
    },

    createEditorObjectFromEntityArchetype : function editorCreateEditorObjectFromEntityArchetypeFn(
        globals, v3Location, v3Scale, v3Rotation, archetypeName, entityFactory)
    {
        var editorObjectName = ('editorObject_' + archetypeName);

        var ecMeshParams = entityFactory.getECArchetype(archetypeName, 'ECMesh');

        var newEditorObject = entityFactory.createInactiveEditorObjectInstance(
            editorObjectName, ecMeshParams, v3Location);

        newEditorObject.archetypeName = archetypeName;

        if ((v3Scale !== null) && (v3Scale !== undefined))
        {
            newEditorObject.setV3Scale(v3Scale);
        }

        if ((v3Rotation !== null) && (v3Rotation !== undefined))
        {
            newEditorObject.setV3Rotation(v3Rotation);
        }

        newEditorObject.activate();
        newEditorObject.update();

        return newEditorObject;
    },

    createEditorObjectFromBlockArchetype : function editorCreateEditorObjectFromBlockArchetypeFn(
        globals, v3Location, v3Scale, v3Rotation, archetypeName, blockFactory, entityFactory)
    {
        var editorObjectName = ('editorObject_' + archetypeName);

        var blockArchetype = blockFactory.getArchetype(archetypeName);

        debug.assert(blockArchetype, 'Block archetype not recognised: ' + archetypeName);

        var meshPath = blockArchetype.path;

        if (!v3Scale)
        {
            v3Scale = (blockArchetype.v3CreationScale || [1.0, 1.0, 1.0]);
        }

        var v3Offset = blockArchetype.v3MeshOffset;
        var md = globals.mathDevice;
        if (!v3Offset)
        {
            v3Offset = md.v3BuildZero();
        }

        var ecMeshParams =
        {
            path : meshPath,
            localOffset : v3Offset
        };

        var newEditorObject = entityFactory.createInactiveEditorObjectInstance(
            editorObjectName, ecMeshParams, v3Location);

        newEditorObject.archetypeName = archetypeName;
        newEditorObject.isFromBlock = true;
        newEditorObject.setV3Scale(v3Scale);

        if (blockArchetype.v3EditorPhysicsScale)
        {
            newEditorObject.setv3EditorExtents(blockArchetype.v3EditorPhysicsScale);
        }

        if (v3Rotation)
        {
            newEditorObject.setV3Rotation(v3Rotation);
        }

        newEditorObject.activate();
        newEditorObject.update();

        return newEditorObject;
    },

    addBlock : function editorAddBlockFn(block)
    {
        var blockExtents = Editor.getEditorBlockExtents(block);

        Editor.State.aabbTreeBlocks.add(block, blockExtents);
    },

    removeBlock : function editorRemoveBlockFn(block)
    {
        Editor.State.aabbTreeBlocks.remove(block);
    },

    addEntity : function editorAddEntityFn(entity, mathDevice)
    {
        var entityExtents = Editor.getEditorEntityExtents(entity, mathDevice);

        Editor.State.aabbTreeEntities.add(entity, entityExtents);
    },

    removeEntity : function editorRemoveEntityFn(entity)
    {
        Editor.State.aabbTreeEntities.remove(entity);
    },

    updateEntity : function editorUpdateEntityFn(entity, mathDevice)
    {
        var entityExtents = Editor.getEditorEntityExtents(entity, mathDevice);

        Editor.State.aabbTreeEntities.update(entity, entityExtents);
    },

    cameraRayTest : function editorCameraRayTestFn(v2ScreenLocation, camera, aabbTreeList, mathDevice)
    {
        var distanceInFrontOfCamera = 2.0;
        var v3FrontOfCameraLocation =
            camera.screenToWorld(v2ScreenLocation[0], v2ScreenLocation[1], distanceInFrontOfCamera);
        var v3LineStart = mathDevice.m43Pos(camera.matrix);
        var v3LineTangent = mathDevice.v3Sub(v3FrontOfCameraLocation, v3LineStart);
        mathDevice.v3Normalize(v3LineTangent, v3LineTangent);
        var lineLength = camera.farPlane;

        var ray = {
            origin : v3LineStart,
            direction : v3LineTangent,
            maxFactor : lineLength
        };

        var rayTestFilter = function rayTestFilterFn(tree, externalNode, ray, factor /*, upperBound*/)
        {
            return {
                factor : factor,
                externalNode : externalNode
            };
        };

        var collisionInfo = AABBTree.rayTest(aabbTreeList, ray, rayTestFilter);

        var collisionList = [];

        if (collisionInfo)
        {
            collisionList.push(collisionInfo.externalNode);
        }

        return collisionList;
    },

    getV3NewObjectLocation : function editorGetV3NewObjectLocationFn(globals, gameManager)
    {
        var camera = globals.camera;
        var mathDevice = globals.mathDevice;
        var graphicsDevice = globals.graphicsDevice;

        var screenWidth = graphicsDevice.width;
        var screenHeight = graphicsDevice.height;
        var v2ScreenLocation = mathDevice.v2Build((screenWidth / 2), (screenHeight / 2));

        var distanceFromCameraToAddNewObject = 100;
        var v3DestinationLocation   = camera.screenToWorld(v2ScreenLocation[0], v2ScreenLocation[1], distanceFromCameraToAddNewObject);
        var v3CameraLocation        = camera.getv3Location();

        var collisionInfo = gameManager.getCollisionInfo(v3CameraLocation, v3DestinationLocation);

        if (collisionInfo)
        {
            return camera.screenToWorld(v2ScreenLocation[0], v2ScreenLocation[1], collisionInfo.distance - 5);
        }
        return camera.screenToWorld(v2ScreenLocation[0], v2ScreenLocation[1], distanceFromCameraToAddNewObject);
    },

    getEditorBlockExtents : function editorGetEditorBlockExtentsFn(block)
    {
        var extents = block.getEditorExtents();

        var halfMinExtentsSize = 0.001;

        if (extents[0] === extents[3])
        {
            extents[0] -= halfMinExtentsSize;
            extents[3] += halfMinExtentsSize;
        }

        if (extents[1] === extents[4])
        {
            extents[1] -= halfMinExtentsSize;
            extents[4] += halfMinExtentsSize;
        }

        if (extents[2] === extents[5])
        {
            extents[2] -= halfMinExtentsSize;
            extents[5] += halfMinExtentsSize;
        }

        return extents;
    },

    getEditorEntityExtents : function editorGetEditorEntityExtentsFn(entity, mathDevice)
    {
        var ecMesh = entity.getEC('ECMesh');
        var ecPhysicsCube = entity.getEC('ecPhysicsCube');

        var extents = entity.getEditorExtents();

        if (!extents)
        {
            if (ecMesh)
            {
                var meshNode = ecMesh.node;
                if (meshNode)
                {
                    meshNode.update();
                    extents = meshNode.calculateHierarchyWorldExtents();
                }
            }
            else if (ecPhysicsCube)
            {
                extents = ecPhysicsCube.getExtents();
            }

            if (!extents)
            {
                var v3Location = entity.getv3Location();
                var minHalfExtentsSize = 0.55;
                var v3HalfExtents = mathDevice.v3Build(minHalfExtentsSize, minHalfExtentsSize, minHalfExtentsSize);

                extents = mathDevice.aabbBuildFromCentreHalfExtents(v3Location, v3HalfExtents);
            }
        }

        return extents;
    },

    getScreenSpaceDragDistanceAlongWorldVector : function editorGetScreenSpaceDragDistanceAlongWorldVectorFn(
        v2DragStartScreenLocation, v2DragEndScreenLocation, v3AxisStartWorldLocation, v3AxisEndWorldLocation,
        camera, mathDevice)
    {
        var v2AxisCentreScreenLocation = camera.worldToScreen(v3AxisStartWorldLocation);
        var v2AxisEndScreenLocation = camera.worldToScreen(v3AxisEndWorldLocation);
        var v2AxisScreen = mathDevice.v2Sub(v2AxisEndScreenLocation, v2AxisCentreScreenLocation);
        mathDevice.v2Normalize(v2AxisScreen, v2AxisScreen);

        var v2DragScreen = mathDevice.v2Sub(v2DragEndScreenLocation, v2DragStartScreenLocation);

        return mathDevice.v2Dot(v2AxisScreen, v2DragScreen);
    },

    getSnappedEntityLocation : function editorGetSnappedEntityLocationFn(
        globals, gameManager, selectedObject, v3Location, axisToSnap)
    {
        debug.assert((axisToSnap === 0 || axisToSnap === 1 || axisToSnap === 2),
            'Cannot snap object lcoation with invalid axis: ' + axisToSnap);

        var gameSpace = gameManager.getGameSpace(v3Location);
        var mathDevice = globals.mathDevice;

        var v3SnappedLocation = mathDevice.v3Copy(v3Location);

        if (!gameSpace)
        {
            return v3SnappedLocation;
        }

        if (axisToSnap === 1)
        {
            v3SnappedLocation[1] = Math.round(v3SnappedLocation[1] * 2.0) / 2;
            return v3SnappedLocation;
        }

        var gridSize =
            (Editor.State.flags.enableMinorGridSnap ? Editor.State.minorGridSize : Editor.State.majorGridSize);

        var v3GridLine = Editor.snapToGameSpaceGrid(gameSpace, v3Location, gridSize, true, mathDevice);
        var v3GridSquare = Editor.snapToGameSpaceGrid(gameSpace, v3Location, gridSize, false, mathDevice);

        var selectedObjectExtents = Editor.getEditorEntityExtents(selectedObject, mathDevice);

        var selectedObjectSizeInAxis = (selectedObjectExtents[(axisToSnap + 3)] - selectedObjectExtents[axisToSnap]);
        selectedObjectSizeInAxis = (Math.round(selectedObjectSizeInAxis / gridSize) * gridSize);

        if (((selectedObjectSizeInAxis % (2 * gridSize)) === gridSize) ||
            selectedObjectSizeInAxis === 0)
        {
            v3SnappedLocation[axisToSnap] = v3GridSquare[axisToSnap];
        }
        else if ((selectedObjectSizeInAxis % (2 * gridSize)) === 0)
        {
            v3SnappedLocation[axisToSnap] = v3GridLine[axisToSnap];
        }

        return v3SnappedLocation;
    },

    snapToGameSpaceGrid : function editorSnapToGameSpaceGridFn(gameSpace, v3Location, gridSize, snapToLine, mathDevice)
    {
        var gameSpaceExtents = gameSpace.getExtents();
        var v3MinExtents = mathDevice.v3Build(gameSpaceExtents[0], gameSpaceExtents[1], gameSpaceExtents[2]);

        if (!snapToLine)
        {
            v3MinExtents[0] += (gridSize * 0.5);
            v3MinExtents[2] += (gridSize * 0.5);
        }

        var v3Difference = mathDevice.v3Sub(v3Location, v3MinExtents);

        v3Difference[0] = (Math.round(v3Difference[0] / gridSize) * gridSize);
        v3Difference[2] = (Math.round(v3Difference[2] / gridSize) * gridSize);

        return mathDevice.v3Add(v3MinExtents, v3Difference);
    },

    getAllBlocksOfArchetype : function editorGetAllBlocksOfArchetypeFn(gameManager, archetypeName)
    {
        var blockList = Editor.getAllBlocks(gameManager);
        return blockList.filter(function (block) { return (block.getArchetypeName() === archetypeName); });
    },

    getAllBlocks : function editorGetAllBlocksFn(gameManager)
    {
        var gameSpaceList = gameManager.getGameSpaceList();
        return gameSpaceList.reduce(
            function (blockList, gameSpace) { return blockList.concat(gameSpace.getBlockList()); }, []);
    },

    getAllEntitiesOfArchetype : function editorGetAllEntitiesOfArchetypeFn(gameManager, archetypeName)
    {
        var entityList = Editor.getAllEntities(gameManager);
        return entityList.filter(function (entity) { return (entity.getArchetypeName() === archetypeName); });
    },

    getAllEntities : function editorGetAllEntitiesFn(gameManager)
    {
        var gameSpaceList = gameManager.getGameSpaceList();
        return gameSpaceList.reduce(
            function (entityList, gameSpace) { return entityList.concat(gameSpace.getEntityList()); }, []);
    },

    setLevel : function editorSetLevelFn(level, levelName, gameManager, globals)
    {
        gameManager.setCurrentLevel(level);

        Editor.State.currentLevelName = levelName;
        Editor.State.saveAsLevelName = levelName;

        Editor.Actions.actionMap.buildBlockAABBTree(globals, gameManager);
        Editor.Actions.actionMap.buildEntityAABBTree(globals, gameManager);
    },

    getValueMap :
    {
        getSaveAsLevelName : function editorGetSaveAsLevelNameFn()
        {
            return Editor.State.saveAsLevelName;
        },

        getSelectedObjectWorldLocationX : function editorGetSelectedObjectWorldLocationXFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Location[0];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectWorldLocationY : function editorGetSelectedObjectWorldLocationYFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Location[1];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectWorldLocationZ : function editorGetSelectedObjectWorldLocationZFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Location[2];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectScaleX : function editorGetSelectedObjectScaleXFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Scale[0];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectScaleY : function editorGetSelectedObjectScaleYFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Scale[1];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectScaleZ : function editorGetSelectedObjectScaleZFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                return selectedObjectGroup.v3Scale[2];
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectRotationXInDegrees : function editorGetSelectedObjectRotationXInDegreesFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                var rotationXInRadians = selectedObjectGroup.v3Rotation[0];
                return Math.round((360 / (2 * Math.PI)) * rotationXInRadians);
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectRotationYInDegrees : function editorGetSelectedObjectRotationYInDegreesFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                var rotationYInRadians = selectedObjectGroup.v3Rotation[1];
                return Math.round((360 / (2 * Math.PI)) * rotationYInRadians);
            }
            else
            {
                return null;
            }
        },

        getSelectedObjectRotationZInDegrees : function editorGetSelectedObjectRotationZInDegreesFn()
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;

            if (selectedObjectGroup)
            {
                var rotationZInRadians = selectedObjectGroup.v3Rotation[2];
                return Math.round((360 / (2 * Math.PI)) * rotationZInRadians);
            }
            else
            {
                return null;
            }
        },

        getV3GameSpaceHalfExtents : function editorGetV3GameSpaceHalfExtentsFn(gameManager, globals)
        {
            var mathDevice = globals.mathDevice;
            var gameSpaceList = gameManager.gameSpaceList;
            if (gameSpaceList.length)
            {
                debug.assert(gameSpaceList.length === 1, 'Cannot get gamespace size for multiple gamespaces');
                var gameSpace = gameSpaceList[0];
                return mathDevice.v3Copy(gameSpace.getv3HalfExtents());
            }
            else
            {
                return mathDevice.v3BuildZero();
            }
        }
    }
};
