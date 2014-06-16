/*global Editor: false*/

// Always drawn
Editor.Settings.drawControlLists.push({

    conditionList : [],
    controlList : [
        // Draw gamespace extents
        {
            conditionList : [],
            actionNameList : ['drawGameSpaces']
        }
    ]
});

// Misc controls
Editor.Settings.drawControlLists.push({

    conditionList : [
        {type : 'isFlagOff', name : 'enableScreenshotMode'}
    ],
    controlList : [
        // Draw gamespace extents
        {
            conditionList : [],
            actionNameList : ['drawGameSpaceExtents']
        },
        // Draw minor block grid overlays
        {
            conditionList : [
                {type : 'isFlagOn', name : 'drawBlockGridOverlays'},
                {type : 'isFlagOn', name : 'enableMinorGridSnap'}
            ],
            actionNameList : [
                {type: 'drawMinorBlockGrids', params : { archetypeList : ['a_bl_proto_cube07', 'a_bl_s_floorsquare']}}
            ]
        },
        // Draw major block grid overlays
        {
            conditionList : [
                {type : 'isFlagOn', name : 'drawBlockGridOverlays'}
            ],
            actionNameList : [{type: 'drawBlockGrids', params : { archetypeList : ['a_bl_proto_cube07', 'a_bl_s_floorsquare']}}]
        },
        // Draw invisible entities
        {
            conditionList : [],
            actionNameList : [{type : 'drawEntitiesWithoutMeshes', params : {v3Colour : [0.8, 0.8, 0.8]}}]
        },
        // Draw object at cursor extents
        {
            conditionList : [{type : 'isNotDragging'}],
            actionNameList : ['drawObjectAtCursorExtents']
        },
        // Draw object group
        {
            conditionList : [{type : 'hasSelectedObjects'}],
            actionNameList : ['drawSelectedObjectGroupExtents']
        },
        // Draw object group
        {
            conditionList : [{type : 'hasSelectedObjects'}],
            actionNameList : ['drawSelectedObjectGroupOrientation']
        },
        // Draw editor flag states (for debugging)
        {
            conditionList : [{type : 'isFlagOn', name : 'drawFlagStates'}],
            actionNameList : ['drawEditorFlags']
        },
        // Draw current level name
        {
            conditionList : [{type : 'isFlagOn', name : 'drawCurrentLevelName'}],
            actionNameList : ['drawCurrentLevelName']
        },
        // Draw selected object name
        {
            conditionList : [{type : 'isFlagOn', name : 'drawSelectedObjectName'}],
            actionNameList : ['drawSelectedObjectName']
        },
        // Draw object at cursor name
        {
            conditionList : [{type : 'isFlagOn', name : 'drawObjectAtCursorName'}],
            actionNameList : ['drawObjectAtCursorName']
        },
        // Draw cursor world location coords
        {
            conditionList : [{type : 'isFlagOn', name : 'drawCursorLocation'}],
            actionNameList : ['drawCursorLocation']
        },
        // Draw position mode icon
        {
            conditionList : [{type : 'isFlagOn', name : 'enablePositionMode'}],
            actionNameList : [{type : 'drawGuiArchetype', params : {guiArchetypeName : 'editorPositionModeIcon'}}]
        },
        // Draw rotation mode icon
        {
            conditionList : [{type : 'isFlagOn', name : 'enableRotationMode'}],
            actionNameList : [{type : 'drawGuiArchetype', params : {guiArchetypeName : 'editorRotationModeIcon'}}]
        },
        // Draw scale mode icon
        {
            conditionList : [{type : 'isFlagOn', name : 'enableScaleMode'}],
            actionNameList : [{type : 'drawGuiArchetype', params : {guiArchetypeName : 'editorScaleModeIcon'}}]
        }
    ]
});

// Position controls
Editor.Settings.drawControlLists.push({

    conditionList : [
        {type : 'isFlagOff', name : 'enableScreenshotMode'},
        {type : 'isFlagOn', name : 'enablePositionMode'},
        {type : 'hasSelectedObjects'},
        {type : 'isSet', name : 'aabbTreeWidgets'}
    ],
    controlList : [
        // Draw widget x
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetX', params : {spritePath : 'textures/move_widget.dds'}}]
        },
        // Draw widget z
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetZ', params : {spritePath : 'textures/move_widget.dds'}}]
        },
        // Draw widget y
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetY', params : {spritePath : 'textures/move_widget.dds'}}]
        }
//        // Draw widget aabb extents
//        {
//            conditionList : [],
//            actionNameList : ['drawWidgetAABBTree']
//        }
    ]
});

// Rotation controls
Editor.Settings.drawControlLists.push({

    conditionList : [
        {type : 'isFlagOff', name : 'enableScreenshotMode'},
        {type : 'isFlagOn', name : 'enableRotationMode'},
        {type : 'hasSelectedObjects'}
    ],
    controlList : [
        // Draw widget x
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetX', params : {spritePath : 'textures/move_widget.dds'}}]
        },
        // Draw widget y
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetY', params : {spritePath : 'textures/move_widget.dds'}}]
        },
        // Draw widget z
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetZ', params : {spritePath : 'textures/move_widget.dds'}}]
        }
    ]
});

// Scale controls
Editor.Settings.drawControlLists.push({

    conditionList : [
        {type : 'isFlagOff', name : 'enableScreenshotMode'},
        {type : 'isFlagOn', name : 'enableScaleMode'},
        {type : 'hasSelectedObjects'}
    ],
    controlList : [
        // Draw widget x
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetX', params : {spritePath : 'textures/scale_widget.dds'}}]
        },
        // Draw widget z
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetZ', params : {spritePath : 'textures/scale_widget.dds'}}]
        },
        // Draw widget y
        {
            conditionList : [],
            actionNameList : [{type : 'drawWidgetY', params : {spritePath : 'textures/scale_widget.dds'}}]
        }
    ]
});
