//
// Level - namespace for level related functions
//

// LEVEL SAVING OVERVIEW
//
//    Entities are either developer owned (shouldLevelSave = true) or player owned (shouldLevelSave = false).
//    The existence and position the entity is determined either by the player (player owned) or by the game (for developer owned entities).
//    There are two save files: the level save file, and the player save file.
//    The level save file is never written to by the game and is always loaded on startup. It contains the entity save data for all developer owned entities.
//    The player save is updated by the game and contains save data for all the player owned entities and for some developer owned entities (for those which have state e.g. trees).
//    The two save data files are merged on startup, this is done by:
//      Copying over entity data for entities which are saved only in either file but not both
//      For entities which were saved in both files, their existence and location are determined by the level save, but their ecData (component state) is taken from the player save.


var Level = {};

Level.createEmptyLevel =  function editorlevelCreateEmptyLevelFn(gameManager)
{
    var versionNumber = gameManager.versionNumber;
    var saveVersionNumber = gameManager.saveVersionNumber;

    var dateObject = new Date();
    var timeStamp = (dateObject.getTime() * 0.001);

    return {
        versionNumber : versionNumber,
        saveVersionNumber : saveVersionNumber,
        timeStamp : timeStamp,
        uniqueIndex : null,
        uniqueLevelIndex : null,
        gameSettings : null,
        scriptData : null,
        gameSpaceList : []
    };
};