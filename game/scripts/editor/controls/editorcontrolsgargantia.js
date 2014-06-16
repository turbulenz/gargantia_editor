//
// These specify the input controls for the editor - grouped by highest level codition
//

/*global Editor: false*/

// UI controls
Editor.Settings.controlLists.push(
    {
        conditionList : [],
        controlList : [
            // Enable 3d grid
            {
                conditionList : [{type : 'uiElementInteract', id : 'enable3dGrid'}],
                actionNameList : [{type : 'toggleFlag', params : {name : 'enable3dGrid'}}]
            },
            {
                conditionList : [{type : 'uiElementInteract', id : 'save_local'}],
                actionNameList : [
                    'placeSelectedObjects',
                    'discardSelectedObjects',
                    'saveLevelToLocalStorage'
                ]
            },
            {
                conditionList : [{type : 'uiElementInteract', id : 'load_local'}],
                actionNameList : [
                    'clearObjectAtCursor',
                    'discardSelectedObjects',
                    'loadLevelFromLocalStorage'
                ]
            }
        ]
    }
);
