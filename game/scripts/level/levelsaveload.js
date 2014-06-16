//
// Level.SaveLoad - namespace for saving, loading and removing levels from user data and
// local filesystem
//

/*global debug: false*/
/*global Level: false*/
/*global Utilities: false*/

Level.SaveLoad =
{
    // From userdata

    saveLevelToUserData : function levelsaveloadSaveLevelToUserDataFn(
        levelName, levelData, userDataManager, onSaveLevelSuccess, onSaveLevelError)
    {
        debug.assert(levelName, 'Cannot save level without a valid name.');
        debug.assert(onSaveLevelSuccess, 'Cannot save level without a success callback.');
        debug.assert(onSaveLevelError, 'Cannot save level without an error callback.');

        var levelDataString = JSON.stringify(levelData, Level.SaveLoad.typedArrayReplacer);

        Level.SaveLoad.saveDataToUserData(
            levelName, levelDataString, userDataManager, onSaveLevelSuccess, onSaveLevelError);
    },

    loadLevelFromUserData : function levelsaveloadLoadLevelFromUserDataFn(levelName, userDataManager, onLoadLevelSuccess, onLoadLevelError)
    {
        debug.assert(levelName, 'Cannot load level without a valid name.');
        debug.assert(onLoadLevelSuccess, 'Cannot load level without a success callback.');
        debug.assert(onLoadLevelError, 'Cannot load level without an error callback.');

        Level.SaveLoad.loadDataFromUserData(
            levelName, userDataManager, onLoadLevelSuccess, onLoadLevelError);
    },

    deleteLevelFromUserData : function levelsaveloadDeleteLevelFromUserDataFn(
        levelName, userDataManager, onDeleteLevelSuccess, onDeleteLevelError)
    {
        debug.assert(levelName, 'Cannot delete level without a valid name.');
        debug.assert(onDeleteLevelSuccess, 'Cannot delete level without a success callback.');
        debug.assert(onDeleteLevelError, 'Cannot delete level without an error callback.');

        var levelDataString = '';

        Level.SaveLoad.saveDataToUserData(
            levelName, levelDataString, userDataManager, onDeleteLevelSuccess, onDeleteLevelError);
    },

    // From resource file (in staticmax)

    loadLevelFromFile : function levelsaveloadLoadLevelFromFileFn(
        levelPath, requestHandler, mappingTable, onLoadLevelSuccess, onLoadLevelError)
    {
        var mappedLevelPath = mappingTable.getURL(levelPath);

        debug.assert(levelPath, 'Cannot load level from staticmax without a valid path.');
        debug.assert(mappedLevelPath, 'Level name not found in mapping table: ' + levelPath);
        debug.assert(onLoadLevelSuccess, 'Cannot load level without a success callback.');
        debug.assert(onLoadLevelError, 'Cannot load level without an error callback.');

        Level.SaveLoad.loadDataFromLocal(mappedLevelPath, requestHandler, onLoadLevelSuccess, onLoadLevelError);
    },

    // From local

    saveLevelToLocal : function levelsaveloadSaveLevelToLocalFn(
        levelPath, levelData, requestHandler, onSaveLevelSuccess, onSaveLevelError)
    {
        debug.assert(levelPath, 'Cannot save level locally without a valid save path.');
        debug.assert(onSaveLevelSuccess, 'Cannot save level without a success callback.');
        debug.assert(onSaveLevelError, 'Cannot save level without an error callback.');

        var levelDataString = JSON.stringify(levelData, Level.SaveLoad.typedArrayReplacer);

        Level.SaveLoad.saveDataToLocal(
            levelPath, levelDataString, requestHandler, onSaveLevelSuccess, onSaveLevelError);
    },

    loadLevelFromLocal : function levelsaveloadLoadLevelFromLocalFn(
        levelPath, requestHandler, onLoadLevelSuccess, onLoadLevelError)
    {
        debug.assert(levelPath, 'Cannot load level locally without a valid load path.');
        debug.assert(onLoadLevelSuccess, 'Cannot load level without a success callback.');
        debug.assert(onLoadLevelError, 'Cannot load level without an error callback.');

        Level.SaveLoad.loadDataFromLocal(
            levelPath, requestHandler, onLoadLevelSuccess, onLoadLevelError);
    },

    listLocalLevelFiles : function levelsaveloadListLocalLevelFilesFn(path, requestHandler, onGetListSuccess, onGetListError)
    {
        var onGetList = function onGetListFn(response, status /*, callContext*/)
        {
            if (status === 200)
            {
                var itemList = response.data.items;
                var fileList = itemList.filter(function (item) { return !item.isDirectory; });
                var levelNameList = fileList.map(function (fileDesc) { return fileDesc.assetName; });

                onGetListSuccess(path, levelNameList);
            }
            else
            {
                onGetListError(path);
            }
        };

        var params =
        {
            url : path,
            requestHandler : requestHandler,
            method : 'POST',
            callback : onGetList
        };

        Utilities.ajax(params);
    },

    saveDataToUserData : function levelsaveloadSaveDataToUserDataFn(key, value, userDataManager, onSaveSuccessCallback, onSaveErrorCallback)
    {
        var onSetDataSuccess = function (returnedKey)
        {
            onSaveSuccessCallback(returnedKey);
        };

        var onSetDataError = function (errorMsg, httpStatus, calledByFn, calledByParams)
        {
            onSaveErrorCallback(errorMsg, httpStatus, calledByFn, calledByParams);
        };

        userDataManager.set(key, value, onSetDataSuccess, onSetDataError);
    },

    loadDataFromUserData : function levelsaveloadLoadDataFromUserDataFn(key, userDataManager, onLoadSuccessCallback, onLoadErrorCallback)
    {
        var onGetDataSuccess = function (returnedKey, returnedValue)
        {
            onLoadSuccessCallback(returnedKey, returnedValue);
        };

        var onGetDataError = function (errorMsg, httpStatus, calledByFn, calledByParams)
        {
            onLoadErrorCallback(errorMsg, httpStatus, calledByFn, calledByParams);
        };

        userDataManager.get(key, onGetDataSuccess, onGetDataError);
    },

    saveDataToLocal : function levelsaveloadSaveDataToLocalFn(
        path, value, requestHandler, onSaveSuccessCallback, onSaveErrorCallback)
    {
        var onLoad = function onLoadFn(response, status /*, callContext*/)
        {
            if (status === 200)
            {
                onSaveSuccessCallback(path, response);
            }
            else
            {
                onSaveErrorCallback(path);
            }
        };

        var params =
        {
            url : path,
            requestHandler : requestHandler,
            method : 'POST',
            callback : onLoad,
            data : { content : value }
        };

        Utilities.ajax(params);
    },

    loadDataFromLocal : function levelsaveloadLoadDataFromLocaFn(
        path, requestHandler, onLoadSuccessCallback, onLoadErrorCallback)
    {
        var onLoad = function onLoadFn(response, status /*, callContext*/)
        {
            if (status === 200)
            {
                onLoadSuccessCallback(path, JSON.parse(response));
            }
            else
            {
                onLoadErrorCallback(path);
            }
        };

        var params =
        {
            src : path,
            onload : onLoad
        };

        requestHandler.request(params);

    },

    typedArrayReplacer : function levelsaveloadTypedArrayReplacerFn(key, value)
    {
        if (Object.prototype.toString.call(value) === "[object Float32Array]")
        {
            return Array.apply([], value);
        }
        /*else if (value && value.buffer)
         {
         return [value[0], value[1], value[2]];
         }*/
        else
        {
            return value;
        }
    }
};
