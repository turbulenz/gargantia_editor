/*global Editor: true*/

// 3d grid
Editor.Settings.drawControlLists.push({

    conditionList : [
        {type : 'isFlagOff', name : 'enableScreenshotMode'}
    ],
    controlList : [
        // Draw 3d grid
        {
            conditionList : [
                {type : 'isFlagOn', name : 'enable3dGrid'}
            ],
            actionNameList : [
                {type: 'draw3dGrid', params : { spacing : 1000 }}
            ]
        }
    ]
});