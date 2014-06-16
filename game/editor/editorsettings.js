/*global Editor: false*/

Editor.Settings =
{
    saveLevelDirectory : 'game/assets/levels',
    loadLevelDirectory : 'game/assets/levels',
    levelFileExtension : 'json',

    selectedEntityExtentsColour : [0.0, 1.0, 0.0],
    objectAtCursorExtentsColour : [1.0, 0.0, 1.0],

    gameSpaceExtentsColour : [1.0, 1.0, 1.0],
    majorGridColour : [0.45, 0.45, 0.45],
    minorGridColour : [0.35, 0.35, 0.35],

    widgetScaleFactor : 0.05,
    dragFactor : 0.025,
    positionFactor : 0.04,
    rotationFactor : 0.02,
    scaleFactor : 0.03,
    snapScaleFactor : 1.0,
    majorGridSize : 1.0,
    minorGridSize : 0.25,

    controlLists : [],
    drawControlLists : [],
    draw2dControlLists : [],

    cameraZoomSpeed : 2.5,
    cameraLookSpeed : 1.0,
    cameraMovementSpeed : 1.0,

    saveStackSize : 10,

    actionListOnEnterEditorMode : [
        'listLocalLevelFiles',
        'unlockMouse',
        'showMouse',
        'showSpawners',
        'enableBlockMovement',
        'enableEditorECDebugDrawing',
        'buildBlockAABBTree',
        'buildEntityAABBTree',
        'buildWidgetAABBTree',
        'removeAllEntitiesFromLevelIfNotLevelSave',

        {type : 'setFlagOn', params : {name : 'drawBlockGridOverlays'}},
        {type : 'setFlagOn', params : {name : 'drawSelectedObjectName'}},
        {type : 'setFlagOn', params : {name : 'drawObjectAtCursorName'}},
        {type : 'setFlagOn', params : {name : 'drawCurrentLevelName'}},
        {type : 'setFlagOn', params : {name : 'enableBlockSelection'}},
        {type : 'setFlagOn', params : {name : 'enableEntitySelection'}},
        {type : 'setFlagOn', params : {name : 'enableGridSnap'}},
        {type : 'setFlagOn', params : {name : 'enablePositionMode'}},

        {type : 'setFlagOff', params : {name : 'drawCursor'}},
        {type : 'setFlagOff', params : {name : 'drawCursorLocation'}},
        {type : 'setFlagOff', params : {name : 'drawFlagStates'}},
        {type : 'setFlagOff', params : {name : 'enableDragSelect'}},
        {type : 'setFlagOff', params : {name : 'enableFreeCamLook'}},
        {type : 'setFlagOff', params : {name : 'enableMinorGridSnap'}},
        {type : 'setFlagOff', params : {name : 'enableMultipleObjectSelection'}},
        {type : 'setFlagOff', params : {name : 'enablePositionX'}},
        {type : 'setFlagOff', params : {name : 'enablePositionY'}},
        {type : 'setFlagOff', params : {name : 'enablePositionZ'}},
        {type : 'setFlagOff', params : {name : 'enableRotationMode'}},
        {type : 'setFlagOff', params : {name : 'enableRotationX'}},
        {type : 'setFlagOff', params : {name : 'enableRotationY'}},
        {type : 'setFlagOff', params : {name : 'enableRotationZ'}},
        {type : 'setFlagOff', params : {name : 'enableScaleMode'}},
        {type : 'setFlagOff', params : {name : 'enableScaleX'}},
        {type : 'setFlagOff', params : {name : 'enableScaleY'}},
        {type : 'setFlagOff', params : {name : 'enableScaleZ'}},
        {type : 'setFlagOff', params : {name : 'enableScreenshotMode'}},
        {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}}
    ],

    actionListOnExitEditorMode : [
        'disableBlockMovement',
        'disableEditorECDebugDrawing',
        'hideSpawners',
        'refreshSpawners'
    ],

    uiElementList :
    [
        // Save/load
        {
            id : 'saveAsLevelName',
            type : 'textBox',
            getValue : 'getSaveAsLevelName',
            title : 'Save Name'
        },
        {
            id : 'save',
            type : 'button',
            buttonText : 'Save'
        },
        {
            id : 'load',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'levelNameList',
            buttonText : 'Load'
        },
        {
            id : 'refreshLevelFiles',
            type : 'button',
            buttonText : 'Refresh Level Filenames'
        },
        // File separator
        {
            id : 'editorControlSeparatorFiles',
            type : 'separator'
        },
        // Selected entity world location
        {
            id : 'setSelectedObjectWorldLocationX',
            type : 'numberBox',
            title : 'Position x',
            getValue : 'getSelectedObjectWorldLocationX'
        },
        {
            id : 'setSelectedObjectWorldLocationY',
            type : 'numberBox',
            title : 'Position y',
            getValue : 'getSelectedObjectWorldLocationY'
        },
        {
            id : 'setSelectedObjectWorldLocationZ',
            type : 'numberBox',
            title : 'Position z',
            getValue : 'getSelectedObjectWorldLocationZ'
        },
        // Position separator
        {
            id : 'editorControlSeparatorPosition',
            type : 'separator'
        },
        // Selected entity scale
        {
            id : 'setSelectedObjectScaleX',
            type : 'numberBox',
            title : 'Scale x',
            getValue : 'getSelectedObjectScaleX'
        },
        {
            id : 'setSelectedObjectScaleY',
            type : 'numberBox',
            title : 'Scale y',
            getValue : 'getSelectedObjectScaleY'
        },
        {
            id : 'setSelectedObjectScaleZ',
            type : 'numberBox',
            title : 'Scale z',
            getValue : 'getSelectedObjectScaleZ'
        },
        // Rotation separator
        {
            id : 'editorControlSeparatorRotation',
            type : 'separator'
        },
        // Selected entity rotation
        {
            id : 'setSelectedObjectRotationX',
            type : 'numberBox',
            title : 'Rotate x',
            getValue : 'getSelectedObjectRotationXInDegrees'
        },
        {
            id : 'setSelectedObjectRotationY',
            type : 'numberBox',
            title : 'Rotate y',
            getValue : 'getSelectedObjectRotationYInDegrees'
        },
        {
            id : 'setSelectedObjectRotationZ',
            type : 'numberBox',
            title : 'Rotate z',
            getValue : 'getSelectedObjectRotationZInDegrees'
        },
        // Entity ec properties group
        {
            id : 'selectedObjectEcProperties',
            type : 'group',
            title : 'Properties'
        },
        // Entity separator
        {
            id : 'editorControlSeparatorEntity',
            type : 'separator'
        },
        {
            id : 'addBlock',
            title : 'Blocks',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'blockArchetypeList',
            buttonText : 'Add'
        },
        {
            id : 'addEntity',
            title : 'All Entities',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'entityArchetypeList',
            buttonText : 'Add'
        },
        {
            id : 'selectAllBlocksOfArchetype',
            title : 'Select Blocks',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'blockArchetypeList',
            buttonText : 'Select All'
        },
        {
            id : 'selectAllEntitiesOfArchetype',
            title : 'Select Entities',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'entityArchetypeList',
            buttonText : 'Select All'
        },
        {
            id : 'selectEverything',
            title : 'Select Everything',
            type : 'button',
            buttonText : 'Select Everything'
        },
        // Replace selected with block
        {
            id : 'replaceSelectedObjectsWithBlock',
            title : 'Replace',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'blockArchetypeList',
            buttonText : 'Replace With Block'
        },
        // Replace selected with entity
        {
            id : 'replaceSelectedObjectsWithEntity',
            title : 'Replace',
            type : 'selectBoxWithSubmitButton',
            valueListName : 'entityArchetypeList',
            buttonText : 'Replace With Entity'
        },
        // Clear entities
        {
            id : 'removeAllEntities',
            type : 'button',
            buttonText : 'Clear Entities'
        },
        // Create new gamespace
        {
            id : 'createNewLevel',
            type : 'button',
            buttonText : 'Create New Level'
        },
        // Set level half extents
        {
            id : 'setGameSpaceHalfExtents',
            type : 'v3',
            titleList : ['Level HalfSize x', 'Level HalfSize y', 'Level HalfSize z'],
            getValue : 'getV3GameSpaceHalfExtents'
        },
        // Allow block selection
        {
            id : 'enableBlockSelection',
            title : 'Enable Block Selection',
            type : 'checkbox',
            flagName : 'enableBlockSelection'
        },
        // Allow entity selection
        {
            id : 'enableEntitySelection',
            title : 'Enable Entity Selection',
            type : 'checkbox',
            flagName : 'enableEntitySelection'
        },
        // Enable screenshot mode
        {
            id : 'enableScreenshotMode',
            title : 'Enable Screenshot Mode',
            type : 'checkbox',
            flagName : 'enableScreenshotMode'
        },
        // Control separator
        {
            id : 'editorControlSeparator',
            type : 'separator'
        },
        // Free cam translate controls
        {
            id : 'editorControlsFreeCamTranslate',
            title : 'Translate cam',
            type : 'text',
            text : 'RMB + WASD'
        },
        // Free cam look controls
        {
            id : 'editorControlsFreeCamLook',
            title : 'Cam look:',
            type : 'text',
            text : 'RMB + MOUSE MOVE'
        },
        // Position mode controls
        {
            id : 'editorControlsPositionMode',
            title : 'Position mode',
            type : 'text',
            text : 'W'
        },
        // Rotation mode controls
        {
            id : 'editorControlsRotationMode',
            title : 'Rotation mode',
            type : 'text',
            text : 'E'
        },
        // Scale mode controls
        {
            id : 'editorControlsScaleMode',
            title : 'Scale mode',
            type : 'text',
            text : 'R'
        },
        // Duplicate controls
        {
            id : 'editorControlsDuplicate',
            title : 'Duplicate',
            type : 'text',
            text : 'LEFT CTRL + D'
        },
        // Select all controls
        {
            id : 'editorControlsSelectAllOfArchetype',
            title : 'Select all',
            type : 'text',
            text : 'LEFT CTRL + A'
        },
        // Add to selection
        {
            id : 'editorControlsAddToSelection',
            title : 'Add/remove from selection',
            type : 'text',
            text : 'LEFT CTRL + LMB'
        }
    ]
};
