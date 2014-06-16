/*global debug: false*/
/*global Editor: false*/

Editor.Actions =
{
    createActionInstance : function editoractionsCreateActionInstanceFn(actionName, actionMap, actionParams)
    {
        var actionExecuteFn = actionMap[actionName];

        debug.assert(actionExecuteFn, 'Action \'' + actionName +  '\' not recognized.');

        return {
            name : actionName,
            execute : actionExecuteFn,
            params : ((typeof actionParams === 'object') ? actionParams :  {})
        };
    },

    createActionList : function editoractionsCreateActionListFn(actionNameList, actionMap, actionParams)
    {
        var actionNameListLength = actionNameList.length;
        var actionList = [];

        var actionDesc;
        var actionName;
        var explicitActionParams;
        var mergedActionParams;
        var action;
        var actionNameIndex;

        for (actionNameIndex = 0; actionNameIndex < actionNameListLength; actionNameIndex += 1)
        {
            actionDesc = actionNameList[actionNameIndex];

            if (typeof actionDesc === 'object')
            {
                debug.assert(actionDesc.type, 'Action desc must have type set: ' + actionDesc);
                debug.assert(actionDesc.params, 'Action desc must have params set.' + actionDesc);

                actionName = actionDesc.type;
                explicitActionParams = actionDesc.params;
                mergedActionParams = Editor.Actions.mergeActionParams(actionParams, explicitActionParams);
                action = Editor.Actions.createActionInstance(actionName, actionMap, mergedActionParams);
            }
            else
            {
                actionName = actionDesc;
                action = Editor.Actions.createActionInstance(actionName, actionMap, actionParams);
            }

            actionList.push(action);
        }

        return actionList;
    },

    executeActionList : function editoractionsExecuteActionListFn(actionList, globals, gameManager)
    {
        var executeAction = function executeActionFn(action)
        {
//            debug.info('Executing action; ' + action.name);

            return action.execute(globals, gameManager, action.params);
        };

        actionList.forEach(executeAction);
    },

    mergeActionParams : function editoractionsMergeActionParamsFn(paramsA, paramsB)
    {
        var mergedParams = {};

        for (var paramName in paramsA)
        {
            if (paramsA.hasOwnProperty(paramName))
            {
                debug.assert((mergedParams[paramName] === undefined), 'Duplicate param when merging action params!');
                mergedParams[paramName] = paramsA[paramName];
            }
        }

        for (paramName in paramsB)
        {
            if (paramsB.hasOwnProperty(paramName))
            {
                debug.assert((mergedParams[paramName] === undefined), 'Duplicate param when merging action params!');
                mergedParams[paramName] = paramsB[paramName];
            }
        }

        return mergedParams;
    },

    actionMap : {}
};
