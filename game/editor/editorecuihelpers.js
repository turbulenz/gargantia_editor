/*global debug: false*/
/*global EntityComponentBase: false*/

var ECUIHelpers = {};

ECUIHelpers.getEditableEntityProperties = function editorecuihelpersGetEditableEntityPropertiesFn(
    entity, ecNameList)
{
    var ecCreationMap = EntityComponentBase.prototype.eCCreationMap;
    var ecMap = entity.eCMap;
    var tempValueStore = {};
    var ecNameListLength = ecNameList.length;

    for (var nameIndex = 0; nameIndex < ecNameListLength; nameIndex += 1)
    {
        var ecName = ecNameList[nameIndex];
        var editablePropertiesList = ecCreationMap[ecName].prototype.editableProperties;
        if (editablePropertiesList)
        {
            var ec = ecMap[ecName];
            var ecValueStore = {};
            tempValueStore[ecName] = ecValueStore;
            ECUIHelpers.copyEditableECProperties(ec, editablePropertiesList, ecValueStore);
        }
    }

    return tempValueStore;
};

ECUIHelpers.copyEditableECProperties = function editorecuihelpersCopyEditableECPropertiesFn(
    ec, editablePropertiesList, valueStore)
{
    var editablePropertiesListLength = editablePropertiesList.length;

    for (var propertyIndex = 0; propertyIndex < editablePropertiesListLength; propertyIndex += 1)
    {
        var ecPropertyDesc = editablePropertiesList[propertyIndex];
        var ecPropertyName = ecPropertyDesc.name;
        valueStore[ecPropertyName] = ec[ecPropertyName];
    }

    return valueStore;
};

ECUIHelpers.applyStoredECState = function editorecuihelpersApplyStoredECStateFn(entity, entityParamsMap)
{
    var ecMap = entity.eCMap;

    for (var ecName in entityParamsMap)
    {
        if (entityParamsMap.hasOwnProperty(ecName))
        {
            var ecParamsMap = entityParamsMap[ecName];
            var ec = ecMap[ecName];
            for (var ecParamName in ecParamsMap)
            {
                if (ecParamsMap.hasOwnProperty(ecParamName))
                {
                    ec[ecParamName] = ecParamsMap[ecParamName];
                }
            }
        }
    }
};

ECUIHelpers.addEntityUI = function editorecuihelpersAddEntityUIFn(entityParamsMap, ecGroupId, duiManager)
{
    var entityUIElementIdList = [];

    for (var ecName in entityParamsMap)
    {
        if (entityParamsMap.hasOwnProperty(ecName))
        {
            var ecParamsMap = entityParamsMap[ecName];
            var editablePropertiesList = EntityComponentBase.prototype.eCCreationMap[ecName].prototype.editableProperties;
            if (editablePropertiesList)
            {
                var ecUIElementIdList = ECUIHelpers.addECUI(ecParamsMap, editablePropertiesList, ecGroupId, duiManager);
                entityUIElementIdList.push.apply(entityUIElementIdList, ecUIElementIdList);
            }
        }
    }

    return entityUIElementIdList;
};

ECUIHelpers.addECUI = function editorecuihelpersAddECUIFn(valueStore, editablePropertiesList, ecGroupId, duiManager)
{
    var uiElementIdList = [];
    var editablePropertiesListLength = editablePropertiesList.length;

    for (var propertyIndex = 0; propertyIndex < editablePropertiesListLength; propertyIndex += 1)
    {
        var ecPropertyDesc = editablePropertiesList[propertyIndex];
        var elementId = ECUIHelpers.addECPropertyUI(valueStore, ecPropertyDesc, ecGroupId, duiManager);
        uiElementIdList.push(elementId);
    }

    return uiElementIdList;
};

ECUIHelpers.addECPropertyUI = function editorecuihelpersAddECPropertyUIFn(
    valueStore, ecPropertyDesc, ecGroupId, duiManager)
{
    var propertyType = ecPropertyDesc.type;
    var propertyName = ecPropertyDesc.name;
    var options = ecPropertyDesc.options || {};

    var getter = ecPropertyDesc.getValue;
    if (getter)
    {
        options.getValue = getter.bind(valueStore);
    }
    var setter = ecPropertyDesc.setValue;
    if (setter)
    {
        options.setValue = setter.bind(valueStore);
    }

    switch (propertyType)
    {
    case 'string':
        {
            return ECUIHelpers.addECPropertyUIString(valueStore, propertyName, options, ecGroupId, duiManager);
        }
    case 'number':
        {
            return ECUIHelpers.addECPropertyUINumber(valueStore, propertyName, options, ecGroupId, duiManager);
        }
    default:
        {
            debug.error('EC property type unsupported: ' + ecPropertyDesc.name + ', ' + propertyType);
        }
    }
};

ECUIHelpers.addECPropertyUIString = function editorecuihelpersAddECPropertyUIStringFn(
    valueStore, propertyName, options, ecGroupId, duiManager)
{
    return duiManager.watchVariable(propertyName, valueStore, propertyName, 'text', ecGroupId, options);
};

ECUIHelpers.addECPropertyUINumber = function editorecuihelpersAddECPropertyUIStringFn(
    valueStore, propertyName, options, ecGroupId, duiManager)
{
    return duiManager.watchVariable(propertyName, valueStore, propertyName, 'slider', ecGroupId, options);
};
