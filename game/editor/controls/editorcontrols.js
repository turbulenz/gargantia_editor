/*global Editor: false*/

// 'Always-update' controls
Editor.Settings.controlLists.push({
    conditionList : [],
    controlList : [
        // Re-build/update aabb trees
        {
            conditionList : [],
            actionNameList : [
                'updateBlockAABBTree',
                'updateEntityAABBTree',
                'buildWidgetAABBTree'
            ]
        },

        // Cursor movement
        {
            conditionList : [{type : 'mouseOver'}],
            actionNameList : [
                'setCursorScreenLocation',
                'updateObjectAtCursor',
                'updateWidgetAtCursor'
            ]
        }
    ]
});

// Key controls
Editor.Settings.controlLists.push({
    conditionList : [],
    controlList : [
        // Toggle editor mode
        {
            conditionList : [{type : 'keyPress', key : 'RETURN'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'toggleEditorMode'
            ]
        },

        // Enable position mode
        {
            conditionList : [
                {type : 'keyPress', key : 'W'},
                {type : 'mouseUp', button : 'BUTTON_1'}
            ],
            actionNameList : [
                {type : 'setFlagOn', params : {name : 'enablePositionMode'}},
                {type : 'setFlagOff', params : {name : 'enableRotationMode'}},
                {type : 'setFlagOff', params : {name : 'enableScaleMode'}}
            ]
        },
        // Enable rotation mode
        {
            conditionList : [
                {type : 'keyPress', key : 'E'},
                {type : 'mouseUp', button : 'BUTTON_1'}
            ],
            actionNameList : [
                {type : 'setFlagOff', params : {name : 'enablePositionMode'}},
                {type : 'setFlagOn', params : {name : 'enableRotationMode'}},
                {type : 'setFlagOff', params : {name : 'enableScaleMode'}}
            ]
        },
        // Enable scale mode
        {
            conditionList : [{type : 'keyPress', key : 'R'}],
            actionNameList : [
                {type : 'setFlagOff', params : {name : 'enablePositionMode'}},
                {type : 'setFlagOff', params : {name : 'enableRotationMode'}},
                {type : 'setFlagOn', params : {name : 'enableScaleMode'}}
            ]
        },

        // Toggle multiple object select
        {
            conditionList : [{type : 'keyPress', key : 'LEFT_CONTROL'}],
            actionNameList : [
                {type : 'setFlagOn', params : {name : 'enableMultipleObjectSelection'}}
            ]
        },
        {
            conditionList : [{type : 'keyRelease', key : 'LEFT_CONTROL'}],
            actionNameList : [
                {type : 'setFlagOff', params : {name : 'enableMultipleObjectSelection'}}
            ]
        },

        // Undo
        {
            conditionList : [
                {type : 'keyDown', key : 'LEFT_CONTROL'},
                {type : 'keyPress', key : 'Z'}
            ],
            actionNameList : ['loadFromUndoStack']
        },

        // Copy objects
        {
            conditionList : [
                {type : 'keyDown', key : 'LEFT_CONTROL'},
                {type : 'keyPress', key : 'C'},
                {type : 'hasSelectedObjects'}
            ],
            actionNameList : ['copySelectedObjects']
        },
        // Paste objects
        {
            conditionList : [
                {type : 'keyDown', key : 'LEFT_CONTROL'},
                {type : 'keyPress', key : 'V'}
            ],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'pasteSelectedObjects'
            ]
        },

        // Key controls for selected objects
        {
            conditionList : [{type : 'hasSelectedObjects'}],
            controlList : [
                // Duplicate objects
                {
                    conditionList : [
                        {type : 'keyDown', key : 'LEFT_CONTROL'},
                        {type : 'keyPress', key : 'D'}
                    ],
                    actionNameList : ['placeSelectedObjects']
                },
                // Select all objects with same archetype
                {
                    conditionList : [
                        {type : 'keyDown', key : 'LEFT_CONTROL'},
                        {type : 'keyPress', key : 'A'}
                    ],
                    actionNameList : ['selectAllObjectsOfArchetype']
                },
                // Discard objects
                {
                    conditionList : [
                        {type : 'keyPress', key : 'DELETE'}
                    ],
                    actionNameList : ['saveToUndoStack', 'discardSelectedObjects']
                }
            ]
        },

        // Toggle grid snap
        {
            conditionList : [{type : 'keyPress', key : 'CAPS_LOCK'}],
            actionNameList : [
                {type : 'toggleFlag', params : {name : 'enableGridSnap'}}
            ]
        },

        // Toggle minor grid snap.
        {
            conditionList : [{type : 'keyPress', key : 'G'}],
            actionNameList : [{type : 'toggleFlag', params : {name : 'enableMinorGridSnap'}}]
        },

        // Debug draw info
        {
            conditionList : [{type : 'keyPress', key : 'F'}],
            actionNameList : [{type : 'toggleFlag', params : {name : 'drawFlagStates'}}]
        }
    ]
});

// Mouse Selection controls
Editor.Settings.controlLists.push({
    conditionList : [{type : 'isFlagOff', name : 'enableFreeCamLook'}],
    controlList : [
        // Object selection/manipulation
        {
            conditionList : [{type : 'hasSelectedObjects'}],
            controlList : [
                // Position mode
                {
                    conditionList : [{type : 'isFlagOn', name : 'enablePositionMode'}],
                    controlList : [
                        // Enable position x
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetXAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enablePositionX'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable position x
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enablePositionX'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable position y
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetYAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enablePositionY'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable position y
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enablePositionY'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable position z
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetZAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enablePositionZ'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable position z
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enablePositionZ'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        }
                    ]
                },
                // Rotation mode
                {
                    conditionList : [{type : 'isFlagOn', name : 'enableRotationMode'}],
                    controlList : [
                        // Enable rotation x
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetXAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableRotationX'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable rotation x
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableRotationX'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable rotation y
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetYAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableRotationY'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable rotation y
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableRotationY'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable rotation z
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetZAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableRotationZ'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable rotation z
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableRotationZ'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        }
                    ]
                },
                // Scale mode
                {
                    conditionList : [{type : 'isFlagOn', name : 'enableScaleMode'}],
                    controlList : [
                        // Enable scale x
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetXAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableScaleX'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable scale x
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableScaleX'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable scale y
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetYAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableScaleY'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable scale y
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableScaleY'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        },
                        // Enable scale z
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'},
                                {type : 'isWidgetZAtCursor'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableScaleZ'}},
                                {type : 'setFlagOn', params : {name : 'enableWidgetDrag'}},
                                'saveToUndoStack',
                                'startDrag'
                            ]
                        },
                        // Disable scale z
                        {
                            conditionList : [{type : 'mouseRelease', button : 'BUTTON_0'}],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableScaleZ'}},
                                {type : 'setFlagOff', params : {name : 'enableWidgetDrag'}},
                                'endDrag'
                            ]
                        }
                    ]
                }
            ]
        },
        {
            conditionList: [{type : 'isFlagOff', name : 'enableWidgetDrag'}],
            controlList : [
                {
                    conditionList : [
                        {type : 'isFlagOff', name : 'enableDragSelect'}
                    ],
                    controlList : [
                        // Start drag
                        {
                            conditionList : [
                                {type : 'mousePress', button : 'BUTTON_0'}
                            ],
                            actionNameList : [
                                'startDrag'
                            ]
                        },
                        // End drag
                        {
                            conditionList : [
                                {type : 'mouseRelease', button : 'BUTTON_0'}
                            ],
                            actionNameList : [
                                'endDrag'
                            ]
                        },
                        // Start drag selection
                        {
                            conditionList : [
                                {type : 'isDragging'},
                                {type : 'isDragDistanceGreaterThan', distance : 5}
                            ],
                            actionNameList : [
                                {type : 'setFlagOn', params : {name : 'enableDragSelect'}},
                                'placeSelectedObjects',
                                'discardSelectedObjects'
                            ]
                        },
                        {
                            conditionList : [
                                {type : 'hasSelectedObjects'}
                            ],
                            controlList : [
                                {
                                    conditionList : [{type : 'isFlagOn', name : 'enableMultipleObjectSelection'}],
                                    controlList : [
                                        // Add to current selection
                                        {
                                            conditionList : [
                                                {type : 'mouseRelease', button : 'BUTTON_0'},
                                                {type : 'isObjectAtCursorUnselected'}
                                            ],
                                            actionNameList : ['selectObject']
                                        },
                                        // Remove from current selection
                                        {
                                            conditionList : [
                                                {type : 'mouseRelease', button : 'BUTTON_0'},
                                                {type : 'isObjectAtCursorSelected'}
                                            ],
                                            actionNameList : ['removeObject']
                                        }
                                    ],
                                    elseControlList : [
                                        // Discard held objects and select new
                                        {
                                            conditionList : [
                                                {type : 'mouseRelease', button : 'BUTTON_0'},
                                                {type : 'isObjectAtCursorUnselected'}
                                            ],
                                            actionNameList : ['placeSelectedObjects', 'discardSelectedObjects', 'selectObject']
                                        }
                                    ]
                                }
                            ],
                            elseControlList : [
                                // Select entity
                                {
                                    conditionList : [
                                        {type : 'isSet', name : 'objectAtCursor'},
                                        {type : 'mouseRelease', button : 'BUTTON_0'}
                                    ],
                                    actionNameList : ['selectObject']
                                }
                            ]
                        }
                    ],
                    elseControlList : [
                        // End drag select
                        {
                            conditionList : [
                                {type : 'mouseRelease', button : 'BUTTON_0'}
                            ],
                            actionNameList : [
                                {type : 'setFlagOff', params : {name : 'enableDragSelect'}},
                                'selectDragArea',
                                'endDrag'
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

// UI controls
Editor.Settings.controlLists.push({
    conditionList : [],
    controlList : [

        // Save/load
        {
            conditionList : [{type : 'uiElementInteract', id : 'saveAsLevelName'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'setSaveAsLevelName'
            ]
        },
        {
            conditionList : [{type : 'uiElementInteract', id : 'save'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'saveLevelToLocalAsSingleFile'
            ]
        },
        {
            conditionList : [{type : 'uiElementInteract', id : 'load'}],
            actionNameList : [
                'clearObjectAtCursor',
                'discardSelectedObjects',
                'loadLevelFromLocalAsSingleFile'
            ]
        },
        {
            conditionList : [{type : 'uiElementInteract', id : 'refreshLevelFiles'}],
            actionNameList : ['listLocalLevelFiles']
        },
        // Set selected object location x
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectWorldLocationX'}],
            actionNameList : [{type : 'setSelectedObjectsLocationInAxis', params : {axis : 0}}]
        },
        // Set selected object location y
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectWorldLocationY'}],
            actionNameList : [{type : 'setSelectedObjectsLocationInAxis', params : {axis : 1}}]
        },
        // Set selected object location z
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectWorldLocationZ'}],
            actionNameList : [{type : 'setSelectedObjectsLocationInAxis', params : {axis : 2}}]
        },
        // Set selected object scale x
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectScaleX'}],
            actionNameList : [{type : 'setSelectedObjectsScaleInAxis', params : {axis : 0}}]
        },
        // Set selected object scale y
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectScaleY'}],
            actionNameList : [{type : 'setSelectedObjectsScaleInAxis', params : {axis : 1}}]
        },
        // Set selected object scale z
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectScaleZ'}],
            actionNameList : [{type : 'setSelectedObjectsScaleInAxis', params : {axis : 2}}]
        },
        // Set selected object rotation x
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectRotationX'}],
            actionNameList : [{type : 'setSelectedObjectsRotationAxisInDegrees', params : {axis : 0}}]
        },
        // Set selected object rotation y
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectRotationY'}],
            actionNameList : [{type : 'setSelectedObjectsRotationAxisInDegrees', params : {axis : 1}}]
        },
        // Set selected object rotation y
        {
            conditionList : [{type : 'uiElementInteract', id : 'setSelectedObjectRotationZ'}],
            actionNameList : [{type : 'setSelectedObjectsRotationAxisInDegrees', params : {axis : 2}}]
        },
        // Add entities
        {
            conditionList : [{type : 'uiElementInteract', id : 'addEntity'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'addNewSelectedEntity'
            ]
        },
        {
            conditionList : [{type : 'uiElementInteract', id : 'addBlock'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'addNewSelectedBlock'
            ]
        },
        // Select blocks of type
        {
            conditionList : [{type : 'uiElementInteract', id : 'selectAllBlocksOfArchetype'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'selectAllBlocksOfArchetype'
            ]
        },
        // Select entities of type
        {
            conditionList : [{type : 'uiElementInteract', id : 'selectAllEntitiesOfArchetype'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'selectAllEntitiesOfArchetype'
            ]
        },
        // Select everything
        {
            conditionList : [{type : 'uiElementInteract', id : 'selectEverything'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'selectAll'
            ]
        },
        // Replace selected objects with block
        {
            conditionList : [{type : 'uiElementInteract', id : 'replaceSelectedObjectsWithBlock'}],
            actionNameList : [
                'replaceSelectedObjectsWithBlock'
            ]
        },
        // Replace selected objects with entity
        {
            conditionList : [{type : 'uiElementInteract', id : 'replaceSelectedObjectsWithEntity'}],
            actionNameList : [
                'replaceSelectedObjectsWithEntity'
            ]
        },
        // Clear entities
        {
            conditionList : [{type : 'uiElementInteract', id : 'removeAllEntities'}],
            actionNameList : ['removeAllEntitiesFromLevel']
        },
        // Create new gamespace
        {
            conditionList : [{type : 'uiElementInteract', id : 'createNewLevel'}],
            actionNameList : ['discardSelectedObjects', 'clearObjectAtCursor', 'createNewLevel', 'buildBlockAABBTree', 'buildEntityAABBTree']
        },
        // Set gamespace half extents
        {
            conditionList : [{type : 'uiElementInteract', id : 'setGameSpaceHalfExtents'}],
            actionNameList : [
                'placeSelectedObjects',
                'discardSelectedObjects',
                'clearObjectAtCursor',
                'setGameSpaceHalfExtents',
                'buildBlockAABBTree',
                'buildEntityAABBTree'
            ]
        },
        // Allow block selection
        {
            conditionList : [{type : 'uiElementInteract', id : 'enableBlockSelection'}],
            actionNameList : [{type : 'toggleFlag', params : {name : 'enableBlockSelection'}}]
        },
        // Allow entity selection
        {
            conditionList : [{type : 'uiElementInteract', id : 'enableEntitySelection'}],
            actionNameList : [{type : 'toggleFlag', params : {name : 'enableEntitySelection'}}]
        },
        // Enable screenshot mode
        {
            conditionList : [{type : 'uiElementInteract', id : 'enableScreenshotMode'}],
            controlList : [
                {
                    conditionList : [{type : 'isFlagOn', name : 'enableScreenshotMode'}],
                    actionNameList : [
                        {type : 'setFlagOff', params : {name : 'enableScreenshotMode'}},
                        'enableEditorECDebugDrawing'
                    ],
                    elseActionNameList : [
                        {type : 'setFlagOn', params : {name : 'enableScreenshotMode'}},
                        'disableEditorECDebugDrawing'
                    ]
                }
            ]
        },
        // Update ec properties ui
        {
            conditionList : [],
            actionNameList : [{type : 'updateSelectedObjectEcProperties', params : {title : 'Properties'}}]
        }
    ]
});

// Position mode
Editor.Settings.controlLists.push({
    conditionList : [
        {type : 'isFlagOn', name : 'enablePositionMode'},
        {type : 'hasSelectedObjects'}
    ],
    controlList : [
        // Drag position x-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enablePositionX'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'positionSelectedObjectsFromDragInAxis', params : {axis : 0}}]
        },
        // Drag position y-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enablePositionY'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'positionSelectedObjectsFromDragInAxis', params : {axis : 1}}]
        },
        // Drag position z-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enablePositionZ'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'positionSelectedObjectsFromDragInAxis', params : {axis : 2}}]
        }
    ]
});

// Rotation mode
Editor.Settings.controlLists.push({
    conditionList : [
        {type : 'isFlagOn', name : 'enableRotationMode'},
        {type : 'hasSelectedObjects'}
    ],
    controlList : [
        // Drag rotation x-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableRotationX'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type: 'rotateSelectedObjectsFromDragInAxis', params : {axis : 0}}]
        },
        // Drag rotation y-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableRotationY'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'rotateSelectedObjectsFromDragInAxis', params : {axis : 1}}]
        },
        // Drag rotation z-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableRotationZ'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'rotateSelectedObjectsFromDragInAxis', params : {axis : 2}}]
        }
    ]
});

// Scale mode
Editor.Settings.controlLists.push({
    conditionList : [
        {type : 'isFlagOn', name : 'enableScaleMode'},
        {type : 'hasSelectedObjects'}
    ],
    controlList : [
        // Drag scaling x-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableScaleX'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'scaleSelectedObjectsFromDragInAxis', params : {axis : 0}}]
        },
        // Drag scaling y-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableScaleY'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'scaleSelectedObjectsFromDragInAxis', params : {axis : 1}}]
        },
        // Drag scaling z-axis
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enableScaleZ'},
                {type : 'mouseOver'}
            ],
            actionNameList : [{type : 'scaleSelectedObjectsFromDragInAxis', params : {axis : 2}}]
        }
    ]
});

// Free cam controls
Editor.Settings.controlLists.push({
    conditionList : [],
    controlList : [
        // Enable free cam look
        {
            conditionList : [{type : 'mousePress', button : 'BUTTON_1'}],
            actionNameList : [
                {type : 'setFlagOn', params : {name : 'enableFreeCamLook'}},
                'lockMouse',
                'hideMouse'
            ]
        },
        // Disable free cam look
        {
            conditionList : [{type : 'mouseRelease', button : 'BUTTON_1'}],
            actionNameList : [
                {type : 'setFlagOff', params : {name : 'enableFreeCamLook'}},
                'unlockMouse',
                'showMouse'
            ]
        },
        // Look/move
        {
            conditionList : [{type : 'isFlagOn', name : 'enableFreeCamLook'}],
            controlList : [
                {
                    conditionList : [{type : 'keyDown', key : 'W'}],
                    actionNameList : ['freeCamForward']
                },
                {
                    conditionList : [{type : 'keyDown', key : 'S'}],
                    actionNameList : ['freeCamBackward']
                },
                {
                    conditionList : [{type : 'keyDown', key : 'A'}],
                    actionNameList : ['freeCamLeft']
                },
                {
                    conditionList : [{type : 'keyDown', key : 'D'}],
                    actionNameList : ['freeCamRight']
                },
                {
                    conditionList : [{type : 'keyDown', key : 'Q'}],
                    actionNameList : ['freeCamUp']
                },
                {
                    conditionList : [{type : 'keyDown', key : 'E'}],
                    actionNameList : ['freeCamDown']
                },
                {
                    conditionList : [{type : 'mouseMoveX'}],
                    actionNameList : ['freeCamTurn']
                },
                {
                    conditionList : [{type : 'mouseMoveY'}],
                    actionNameList : ['freeCamPitch']
                }
            ]
        }
    ]
});
