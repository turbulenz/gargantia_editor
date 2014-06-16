/*global debug: false*/
/*global Editor: false*/

Editor.UI =
{
    // State!!!
    uiElementStateMap : {},
    uiGroupIdMap : {},
    uiGroupIdElementIdMap : {},

    getUIState : function editoruiGetUIStateFn()
    {
        return Editor.UI.uiElementStateMap;
    },

    clearState : function editoruiClearStateFn()
    {
        var object = Editor.UI.uiElementStateMap;

        var property;

        for (property in object)
        {
            if (object.hasOwnProperty(property))
            {
                delete object[property];
            }
        }
    },

    addEditorUI : function editoruiAddEditorUIFn(uiElementList, uiGroupId, globals, gameManager)
    {
        uiElementList.map(
            function (uiElementList) { return Editor.UI.addUIElement(uiElementList, uiGroupId, globals, gameManager); });
    },

    addUIElement : function editoruiAddUIElementFn(uiElement, uiGroupId, globals, gameManager)
    {
        var uiType = uiElement.type;
        var uiConstructor = Editor.UI.uiElementFactory[uiType];

        debug.assert(uiConstructor, 'UI element type not recognised: \'' + uiType + '\'.');

        Editor.UI.uiElementFactory[uiType](
            uiElement, Editor.UI.uiElementStateMap, Editor.getValueMap, uiGroupId, globals, gameManager);
    },

    uiElementFactory :
    {
        group : function editoruiGroup(uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var groupName = uiElement.title;
            debug.assert(groupName, 'Can\'t add a ui group without a valid name');

            Editor.UI.uiGroupIdMap[groupName] = duiManager.addGroup(groupName, uiGroupId);
        },

        separator : function editoruiSeparator(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            globals.dynamicUI.addSeparator(uiElement.text || '', uiGroupId);
        },

        iconGrid : function editoruiIconGridFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals, gameManager)
        {
            var duiManager = globals.dynamicUI;
            var uiElementId = uiElement.id;

            var iconDataList = uiElement.iconDataList;  //image url & function on click

            if (!iconDataList)
            {
                var valueListName = uiElement.valueListName;
                var iconObjectList = Editor.getEditorStateFromName(valueListName);
                var optionalFilterString = uiElement.optionalFilterString;

                var filteredIconObjectList = iconObjectList;

                if (optionalFilterString)
                {
                    filteredIconObjectList = iconObjectList.filter(
                        function (currentValue)
                        {
                            return (currentValue.indexOf(optionalFilterString) !== -1);
                        });
                }

                if (uiElement.isEntityList)
                {
                    var entityFactory = gameManager.getEntityFactory();

                    var archetypesWithIconList = filteredIconObjectList.filter(function (archetypeName)
                        {
                            var archetype = entityFactory.getEntityArchetype(archetypeName);
                            return (archetype.editorIconPath !== undefined);
                        });

                    iconDataList = archetypesWithIconList.map(
                        function (archetypeName)
                        {
                            var archetype = entityFactory.getEntityArchetype(archetypeName);
                            var iconPath = archetype.editorIconPath;

                            return {
                                name : archetypeName,
                                imageUrl : iconPath
                            };
                        });
                }
                else
                {
                    var blockFactory = gameManager.getBlockFactory();

                    var blocksWithIconList = filteredIconObjectList.filter(function (blockName)
                        {
                            var block = blockFactory.getArchetype(blockName);
                            return (block.editorIconPath !== undefined);
                        });

                    iconDataList = blocksWithIconList.map(
                        function (blockName)
                        {
                            var archetype = blockFactory.getArchetype(blockName);
                            var iconPath = archetype.editorIconPath;

                            return {
                                name : blockName,
                                imageUrl : iconPath
                            };
                        });
                }

            }

            function onSelectionChange(selectedIcon)
            {
                uiElementStateMap[uiElementId] = { text : selectedIcon };
            }

            var options =
            {
                dataArray : iconDataList
            };

            var textTitle = uiElement.title;

            duiManager.addIconGrid(textTitle, onSelectionChange, uiGroupId, options);
        },

        text : function editoruiTextFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var textTitle = uiElement.title;
            var text = uiElement.text;

            debug.assert((text !== undefined), 'Cannot create text element without some text.');

            var getValue = function getValueFn()
            {
                return text;
            };

            duiManager.addWatch(textTitle, getValue, uiGroupId);
        },

        textFromValue : function editoruiTextFromValueFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var textTitle = uiElement.title;
            var textName = uiElement.textName;

            debug.assert(textName, 'Cannot create textFromValue element without a text name.');

            var getValue = function getValueFn()
            {
                return Editor.getEditorStateFromName(textName);
            };

            duiManager.addWatch(textTitle, getValue, uiGroupId);
        },

        button : function editoruiAddButtonFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var buttonId = uiElement.id;
            var buttonTitle = (uiElement.title || '');
            var buttonText = uiElement.buttonText;

            var onButtonPress = function onButtonPressFn()
            {
                uiElementStateMap[buttonId] = true;
            };

            var options =
            {
                value : buttonText
            };

            duiManager.addButton(buttonTitle, onButtonPress, uiGroupId, options);
        },

        checkbox : function editoruiCheckboxFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var checkboxId = uiElement.id;
            var checkboxTitle = (uiElement.title || '');
            var flagName = uiElement.flagName;

            var setValue = function setValueFn()
            {
                uiElementStateMap[checkboxId] = true;
            };

            var getValue = function getValueFn()
            {
                return Editor.getEditorFlagStateFromName(flagName);
            };

            duiManager.addCheckbox(checkboxTitle, getValue, setValue, uiGroupId, null);
        },

        textBox : function editoruiTextBoxFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var uiElementId = uiElement.id;
            var textBoxTitle = (uiElement.title || '');

            var getValueFunctionName = uiElement.getValue;
            var getValue = getValueMap[getValueFunctionName];

            debug.assert(getValueFunctionName, 'Cannot create text element without a get value name.');

            var setValue = function setValueFn(textBoxValue)
            {
                uiElementStateMap[uiElementId] = { text : textBoxValue };
            };

            duiManager.addTextBox(textBoxTitle, getValue, setValue, uiGroupId);
        },

        numberBox : function editoruiNumberBoxFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var uiElementId = uiElement.id;
            var numberBoxTitle = (uiElement.title || '');

            var getValueFunctionName = uiElement.getValue;
            var getValue = getValueMap[getValueFunctionName];

            debug.assert(getValueFunctionName, 'Cannot create numberBox element without a get value name.');

            var setValue = function setValueFn(textBoxValue)
            {
                var value = Number(textBoxValue);
                if (!isNaN(value))
                {
                    uiElementStateMap[uiElementId] = { value : value };
                }
            };

            var options =
            {
                setOnEnter : true
            };

            duiManager.addTextBox(numberBoxTitle, getValue, setValue, uiGroupId, options);
        },

        textBoxWithSubmitButton : function editoruiAddTextBoxWithSubmitButtonFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var uiElementId = uiElement.id;
            var textBoxTitle = (uiElement.title || '');
            var buttonText = uiElement.buttonText;

            var getValue = function ()
            {
                return uiElementStateMap[uiElementId] && uiElementStateMap[uiElementId].text;
            }

            var onButtonPress = function onButtonPressFn(textBoxValue)
            {
                uiElementStateMap[uiElementId] = { text : textBoxValue };
            };

            var options =
            {
                value : buttonText
            };

            duiManager.addTextBox(textBoxTitle, getValue, onButtonPress, uiGroupId, options);
        },

        selectBoxWithSubmitButton : function editoruiAddSelectBoxWithSubmitButtonFn(
            uiElement, uiElementStateMap, getValueMap, uiGroupId, globals /*, gameManager*/)
        {
            var duiManager = globals.dynamicUI;
            var uiElementId = uiElement.id;
            var selectBoxTitle = (uiElement.title || '');
            var buttonText = uiElement.buttonText;
            var valueListName = uiElement.valueListName;
            var optionalFilterString = uiElement.optionalFilterString;

            debug.assert(valueListName, 'Cannot create selectbox without a value list name.');

            var valueList = Editor.getEditorStateFromName(valueListName);

            var filteredValueList;

            if (optionalFilterString)
            {
                filteredValueList = valueList.filter(
                    function (currentValue)
                    {
                        return (currentValue.indexOf(optionalFilterString) !== -1);
                    });
            }

            var options =
            {
                buttonText : buttonText,
                values : valueList,
                stringValues : true
            };

            var getValue = function getValueFn()
            {
                // If the list has been filtered for this select box then we use that,
                // otherwise we recheck the editor state
                // Continuously update the list of entries
                options.values = (filteredValueList || Editor.getEditorStateFromName(valueListName));
                duiManager.pushOptions(itemId, options);
                return uiElementStateMap[uiElementId] && uiElementStateMap[uiElementId].text;
            };

            var onButtonPress = function onButtonPressFn(selectBoxValue)
            {
                uiElementStateMap[uiElementId] = { text : selectBoxValue };
            };

            var itemId = duiManager.addSelect(selectBoxTitle, getValue, onButtonPress, uiGroupId, options);
        },

        v3 : function editoruiAddV3Fn(uiElement, uiElementStateMap, getValueMap, uiGroupId, globals, gameManager)
        {
            var duiManager = globals.dynamicUI;
            var mathDevice = globals.mathDevice;
            var uiElementId = uiElement.id;
            var titleList = (uiElement.titleList || '');

            var getValueFunctionName = uiElement.getValue;
            var getValue = getValueMap[getValueFunctionName];

            debug.assert(getValueFunctionName, 'Cannot create vector element without a get value name.');

            var addElementUI = function addElementUIFn(
                title, index, getValue, uiElementStateMap, uiElementId, uiGroupId, duiManager, mathDevice)
            {
                var setValue = function setValueFn(textBoxValue)
                {
                    var value = Number(textBoxValue);
                    if (!isNaN(value))
                    {
                        var v3CurrentValue = mathDevice.v3Copy(getValue(gameManager, globals));
                        v3CurrentValue[index] = value;
                        uiElementStateMap[uiElementId] = { value : v3CurrentValue };
                    }
                };

                var getIndexValue = function getIndexValueFn()
                {
                    return getValue(gameManager, globals)[index];
                };

                var options =
                {
                    setOnEnter : true
                };

                duiManager.addTextBox(title, getIndexValue, setValue, uiGroupId, options);
            };

            var vectorDimension = 3;
            for (var index = 0; index < vectorDimension; index += 1)
            {
                var title = titleList[index];
                addElementUI(title, index, getValue, uiElementStateMap, uiElementId, uiGroupId, duiManager, mathDevice);
            }
        }
    }
};
