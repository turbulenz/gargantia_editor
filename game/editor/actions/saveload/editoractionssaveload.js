/*global debug: false*/
/*global Editor: false*/
/*global Level: false*/

Editor.Actions.actionMap.setSaveAsLevelName = function editoractionssaveloadSetSaveAsLevelNameFn(
    globals, gameManager, params)
{
    debug.assert((params.text !== undefined), 'Cannot set saveAsLevelName without text.');

    Editor.State.saveAsLevelName = params.text;
};

Editor.Actions.actionMap.saveLevelToLocalAsSingleFile = function editoractionsSaveLevelToLocalAsSingleFileFn(
    globals, gameManager, params)
{
    var levelName = (params.text || Editor.State.saveAsLevelName);

    debug.assert(levelName, 'Cannot save a level without a level name.');

    var isEditorSave = true;
    var shouldResizeGameSpace = (params.resizeGameSpace || false);
    var levelData = Level.Serialize.serializeLevelIntoSingleSave(gameManager, isEditorSave, shouldResizeGameSpace);

    var gameSlug = globals.gameSession.gameSlug;

    var levelPath = '/local/v1/save/';
    levelPath += gameSlug;
    levelPath += '/';
    levelPath += Editor.State.saveLevelDirectory;
    levelPath += '/';
    levelPath += levelName;
    levelPath += '.';
    levelPath += Editor.State.levelFileExtension;

    var requestHandler = globals.requestHandler;

    var onSaveSuccess = function onSaveSuccessFn()
    {
        Editor.State.currentLevelName = levelName;
        Editor.State.saveAsLevelName = levelName;
    };

    Level.SaveLoad.saveLevelToLocal(levelPath, levelData, requestHandler, onSaveSuccess, function () {});
};

Editor.Actions.actionMap.saveLevelToLocalStorage = function editoractionsSaveLevelToLocalStorageFn(
    globals, gameManager, params)
{
    var levelName = (params.text || Editor.State.saveAsLevelName);

    debug.assert(levelName, 'Cannot save a level without a level name.');

    var isEditorSave = true;
    var shouldResizeGameSpace = (params.resizeGameSpace || false);
    var levelData = Level.Serialize.serializeLevelIntoSingleSave(gameManager, isEditorSave, shouldResizeGameSpace);

    var storageKey = 'editor|' + globals.gameSession.gameSlug + '|' + levelName;
    localStorage[storageKey] = JSON.stringify(levelData);
    Editor.State.currentLevelName = levelName;
    Editor.State.saveAsLevelName = levelName;
    window.alert("Saved to browser");
};

//Editor.Actions.actionMap.saveLevelToLocalAsSeparateLevelAndPlayerSave =
//    function editoractionsSaveLevelToLocalAsSeparateLevelAndPlayerSaveFn(globals, gameManager, params)
//{
//    var levelName = (params.text || Editor.State.saveAsLevelName);
//
//    debug.assert(levelName, 'Cannot save a level without a level name.');
//
//    var isEditorSave = true;
//    var levelSaveData = Level.Serialize.serializeLevelSave(gameManager, isEditorSave);
//    var playerSaveData = Level.Serialize.serializePlayerSave(gameManager, isEditorSave);
//
//    var gameSlug = globals.gameSession.gameSlug;
//
//    var levelSavePath = '/local/v1/save/';
//    levelSavePath += gameSlug;
//    levelSavePath += '/';
//    levelSavePath += Editor.State.saveLevelDirectory;
//    levelSavePath += '/';
//    levelSavePath += levelName;
//    levelSavePath += Editor.State.levelSaveFileNameEnding;
//    levelSavePath += '.';
//    levelSavePath += Editor.State.levelFileExtension;
//
//    var playerSavePath = '/local/v1/save/';
//    playerSavePath += gameSlug;
//    playerSavePath += '/';
//    playerSavePath += Editor.State.saveLevelDirectory;
//    playerSavePath += '/';
//    playerSavePath += levelName;
//    playerSavePath += Editor.State.playerSaveFileNameEnding;
//    playerSavePath += '.';
//    playerSavePath += Editor.State.levelFileExtension;
//
//    var requestHandler = globals.requestHandler;
//
//    var saveSuccessCount = 0;
//
//    var onSaveSuccess = function onSaveSuccessFn()
//    {
//        saveSuccessCount += 1;
//
//        if (saveSuccessCount >= 2)
//        {
//            Editor.State.currentLevelName = levelName;
//            Editor.State.saveAsLevelName = levelName;
//        }
//    };
//
//    Level.SaveLoad.saveLevelToLocal(levelSavePath, levelSaveData, requestHandler, onSaveSuccess, function () {});
//    Level.SaveLoad.saveLevelToLocal(playerSavePath, playerSaveData, requestHandler, onSaveSuccess, function () {});
//};

Editor.Actions.actionMap.loadLevelFromLocalAsSingleFile = function editoractionsLoadLevelFromLocalAsSingleFileFn(
    globals, gameManager, params)
{
    var levelName = (params.text || Editor.State.saveAsLevelName);

    debug.assert(levelName, 'Cannot load a level without a level name.');

    var levelPath = Editor.State.loadLevelDirectory;
    levelPath += '/';
    levelPath += levelName;
    levelPath += '.json';

    var requestHandler = globals.requestHandler;

    var onLoadLevelSuccess = function onLoadLevelSuccessFn(levelPath, levelData)
    {
        var blockFactory = gameManager.getBlockFactory();
        var entityFactory = gameManager.getEntityFactory();

        var level = Level.Parse.parseLevelData(levelData, blockFactory, entityFactory, globals);

        Editor.setLevel(level, levelName, gameManager, globals);
    };

    Level.SaveLoad.loadLevelFromLocal(levelPath, requestHandler, onLoadLevelSuccess, function () {});
};

Editor.Actions.actionMap.loadLevelFromLocalStorage = function editoractionsLoadLevelFromLocalStorageFn(
    globals, gameManager, params)
{
    var levelName = (params.text || Editor.State.saveAsLevelName);

    debug.assert(levelName, 'Cannot load a level without a level name.');

    var storageKey = 'editor|' + globals.gameSession.gameSlug + '|' + levelName;

    var levelDataString = localStorage[storageKey];
    if (levelDataString)
    {
        var blockFactory = gameManager.getBlockFactory();
        var entityFactory = gameManager.getEntityFactory();
        var level = Level.Parse.parseLevelData(JSON.parse(levelDataString), blockFactory, entityFactory, globals);
        Editor.setLevel(level, levelName, gameManager, globals);
    }
};

//Editor.Actions.actionMap.loadLevel = function editoractionsLoadLevelFn(
//    globals, gameManager, params)
//{
//    var levelName = params.text;
//
//    debug.assert(levelName, 'Cannot load a level without a level name.');
//
//    var levelSavePath = Editor.State.loadLevelDirectory;
//    levelSavePath += '/';
//    levelSavePath += levelName;
//    levelSavePath += Editor.State.levelSaveFileNameEnding;
//    levelSavePath += '.json';
//
//    var playerSavePath = Editor.State.loadLevelDirectory;
//    playerSavePath += '/';
//    playerSavePath += levelName;
//    playerSavePath += Editor.State.playerSaveFileNameEnding;
//    playerSavePath += '.json';
//
//    var requestHandler = globals.requestHandler;
//
//    var levelSaveData = null;
//    var playerSaveData = null;
//
//    var onLoadLevelSuccess = function onLoadLevelSuccessFn(levelPath, levelSaveData, playerSaveData)
//    {
//        var blockFactory = gameManager.getBlockFactory();
//        var entityFactory = gameManager.getEntityFactory();
//
//        var combinedSaveData =
//        {
//            levelSaveData : levelSaveData,
//            playerSaveData : playerSaveData
//        };
//
//        var level = Level.Parse.parseLevelDataFromLevelAndPlayerSave(
//            combinedSaveData, blockFactory, entityFactory, globals);
//
//        Editor.setLevel(level, levelName, gameManager, globals);
//    };
//
//    var onLoadLevelSaveSuccess = function onLoadLevelSaveSuccessFn(levelPath, levelData)
//    {
//        levelSaveData = levelData;
//
//        if (levelSaveData && playerSaveData)
//        {
//            onLoadLevelSuccess(levelPath, levelSaveData, playerSaveData);
//        }
//    };
//
//    var onLoadPlayerSaveSuccess = function onLoadPlayerSaveSuccessFn(levelPath, levelData)
//    {
//        playerSaveData = levelData;
//
//        if (levelSaveData && playerSaveData)
//        {
//            onLoadLevelSuccess(levelPath, levelSaveData, playerSaveData);
//        }
//    };
//
//    Level.SaveLoad.loadLevelFromLocal(levelSavePath, requestHandler, onLoadLevelSaveSuccess, function () {});
//    Level.SaveLoad.loadLevelFromLocal(playerSavePath, requestHandler, onLoadPlayerSaveSuccess, function () {});
//};

Editor.Actions.actionMap.listLocalLevelFiles = function editoractionsListLocalLevelFiles(globals /*, gameManager, params*/)
{
    var gameSlug = globals.gameSession.gameSlug;

    var path = '/local/v1/list/';
    path += gameSlug;
    path += '/';
    path += 'files';
    path += '/';
    path += Editor.State.loadLevelDirectory;

    var requestHandler = globals.requestHandler;

    var onListSuccess = function onListSuccessFn(path, levelNameList)
    {
        // Strip .json extension
        Editor.State.levelNameList = levelNameList.map(
            function (levelName) { return levelName.substring(0, levelName.indexOf('.')); });
    };

    Level.SaveLoad.listLocalLevelFiles(path, requestHandler, onListSuccess, function () {});
};

Editor.Actions.actionMap.saveToUndoStack = function editoractionssaveloadSaveToUndoStackFn(
    globals, gameManager /*, params*/)
{
    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    if (selectedObjectGroup && !Editor.ObjectGroup.isWithinGameSpace(selectedObjectGroup, gameManager))
    {
        return;
    }

    // We temporarily place any selected objects down before saving then delete the placed objects after saving
    var placedObjectList = Editor.Actions.actionMap.placeSelectedObjects(globals, gameManager);

    var isEditorSave = true;
    var levelData = Level.Serialize.serializeLevelIntoSingleSave(gameManager, isEditorSave);

    if (Editor.State.undoStack === null)
    {
        Editor.State.undoStack = [];
    }

    if (Editor.State.undoStack.length >= Editor.State.saveStackSize)
    {
        var extraUndoSaves = (Editor.State.undoStack.length - Editor.State.saveStackSize);
        Editor.State.undoStack = Editor.State.undoStack.slice(extraUndoSaves);
    }

    Editor.State.undoStack.push(levelData);

    var objectGroup = Editor.ObjectGroup.selectObjects(globals, gameManager, placedObjectList);
    Editor.ObjectGroup.discardObjectGroup(objectGroup);
};

Editor.Actions.actionMap.loadFromUndoStack = function editoractionssaveloadLoadFromToUndoStackFn(
    globals, gameManager /*, params*/)
{
    if (Editor.State.undoStack !== null &&
        Editor.State.undoStack.length > 0)
    {
        Editor.Actions.actionMap.clearObjectAtCursor();
        Editor.Actions.actionMap.discardSelectedObjects();

        var levelData = Editor.State.undoStack.pop();

        var blockFactory = gameManager.getBlockFactory();
        var entityFactory = gameManager.getEntityFactory();

        var level = Level.Parse.parseLevelData(levelData, blockFactory, entityFactory, globals);
        var levelName = Editor.State.currentLevelName;

        Editor.setLevel(level, levelName, gameManager, globals);
    }
};
