/*global debug: false*/
/*global Editor: false*/

Editor.Controller =
{
    convertControlsIntoActions : function editorcontrollerConvertControlsIntoActionsFn(
        controlsList, conditionMap, actionMap, newInputState, previousInputState, uiElementStateMap, inputDevice)
    {
        var keyCodes = (inputDevice ? inputDevice.keyCodes : null);
        var mouseCodes = (inputDevice ? inputDevice.mouseCodes : null);

        var actionList = [];

        return Editor.Controller.convertControlListIntoActions(
            controlsList, conditionMap, actionMap, newInputState,
            previousInputState, keyCodes, mouseCodes, uiElementStateMap, actionList);
    },

    convertControlListIntoActions : function editorcontrollerConvertControlListIntoActionsFn(
        controlList, conditionMap, actionMap, newInputState, previousInputState,
        keyCodes, mouseCodes, uiElementStateMap, resultList)
    {
        return controlList.reduce(function (actionList, control) {
            return Editor.Controller.convertControlToActions(
                control, conditionMap, actionMap, newInputState, previousInputState,
                keyCodes, mouseCodes, uiElementStateMap, actionList);
        }, resultList);
    },

    convertControlToActions : function editorcontrollerConvertControlToActionsFn(
        control, conditionMap, actionMap, newInputState,
        previousInputState, keyCodes, mouseCodes, uiElementStateMap, resultList)
    {
        var conditionList = control.conditionList;
        var controlList = control.controlList;
        var actionNameList = control.actionNameList;
        var elseControlList = control.elseControlList;
        var elseActionNameList = control.elseActionNameList;

        var controlValue = Editor.Controller.testConditionList(
            conditionList, conditionMap, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap);

        var actionList;

        debug.assert(conditionList, 'Editor control must contain a conditionList.');
        debug.assert(controlList || actionNameList, 'Editor control must contain a controlList or actionNameList.');

        if (controlValue)
        {
            if (controlList)
            {
                resultList = Editor.Controller.convertControlListIntoActions(
                    controlList, conditionMap, actionMap, newInputState,
                    previousInputState, keyCodes, mouseCodes, uiElementStateMap, resultList);
            }
            else
            {
                actionList = Editor.Actions.createActionList(actionNameList, actionMap, controlValue);
                resultList.push.apply(resultList, actionList);
            }
        }
        else
        {
            if (elseControlList)
            {
                resultList = Editor.Controller.convertControlListIntoActions(
                    elseControlList, conditionMap, actionMap, newInputState,
                    previousInputState, keyCodes, mouseCodes, uiElementStateMap, resultList);
            }
            else if (elseActionNameList)
            {
                actionList = Editor.Actions.createActionList(elseActionNameList, actionMap, controlValue);
                resultList.push.apply(resultList, actionList);
            }
        }

        return resultList;
    },

    testConditionList : function editorcontrollerTestConditionList(
        conditionList, conditionMap, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap)
    {
        var conditionListLength = conditionList.length;

        var conditionIndex;
        var controlValue;

        if (conditionListLength === 0)
        {
            return true;
        }

        for (conditionIndex = 0; conditionIndex < conditionListLength; conditionIndex += 1)
        {
            var condition = conditionList[conditionIndex];

            controlValue =
                conditionMap[condition.type](
                    condition, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap);

            if (!controlValue)
            {
                return false;
            }
        }

        return controlValue;
    }
};