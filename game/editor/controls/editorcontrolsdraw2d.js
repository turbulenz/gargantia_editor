/*global Editor: false*/

// Always drawn
Editor.Settings.draw2dControlLists.push({

    conditionList : [],
    controlList : [
        // Drag select
        {
            conditionList : [{type : 'isFlagOn', name : 'enableDragSelect'}],
            actionNameList : ['drawSelectionArea']
        }
    ]
});
