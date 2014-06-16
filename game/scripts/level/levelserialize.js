//
// Level.Serialize - namespace for level serializing functionality
//

/*global debug: false*/
/*global Level: false*/

Level.Serialize =
{
    serializeLevelIntoLevelAndPlayerSave : function levelserializeSerializeLevelIntoLevelAndPlayerSaveFn(gameManager, isEditorSave)
    {
        var levelSaveData = Level.Serialize.serializeLevelSave(gameManager, isEditorSave);
        var playerSaveData = Level.Serialize.serializePlayerSave(gameManager, isEditorSave);

        return {
            levelSaveData : levelSaveData,
            playerSaveData : playerSaveData
        };
    },

    serializeLevelSave : function levelserializeSerializeLevelSaveFn(gameManager, isEditorSave)
    {
        var saveScripts = false;
        var saveBlocks = true;
        var saveLevelSaveEntities = true;
        var savePlayerSaveEntities = false;

        return Level.Serialize.serializeLevel(
            gameManager, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, saveScripts, isEditorSave);
    },

    serializePlayerSave : function levelserializeSerializePlayerSaveFn(gameManager, isEditorSave)
    {
        var saveScripts = true;
        var saveBlocks = false;
        var saveLevelSaveEntities = false;
        var savePlayerSaveEntities = true;

        return Level.Serialize.serializeLevel(
            gameManager, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, saveScripts, isEditorSave);
    },

    serializeLevelIntoSingleSave : function levelserializeSerializeLevelIntoSingleSaveFn(gameManager, isEditorSave)
    {
        var saveScripts = true;
        var saveBlocks = true;
        var saveLevelSaveEntities = true;
        var savePlayerSaveEntities = true;

        return Level.Serialize.serializeLevel(
            gameManager, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, saveScripts, isEditorSave);
    },

    serializeLevel : function levelserializeSerializeLevelFn(
        gameManager, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, saveScripts, isEditorSave)
    {
        var gameSpaceList = gameManager.getGameSpaceList();
        var versionNumber = gameManager.versionNumber;
        var saveVersionNumber = gameManager.saveVersionNumber;
        var uniqueIndex = gameManager.uniqueIndex;
        var uniqueLevelIndex = gameManager.uniqueLevelIndex;

        var dateObject = new Date();
        var timeStampInSeconds = (dateObject.getTime() * 0.001);

        var gameSpaceListData = gameSpaceList.map(
            function (gameSpace)
            {
                return Level.Serialize.serializeGameSpace(
                    gameSpace, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, isEditorSave);
            });

        return {
            versionNumber : versionNumber,
            saveVersionNumber : saveVersionNumber,
            timeStamp : timeStampInSeconds,
            uniqueIndex : uniqueIndex,
            uniqueLevelIndex : uniqueLevelIndex,
            gameSpaceList : gameSpaceListData
        };
    },

    serializeGameSpace : function levelserializeSerializeGameSpaceFn(
        gameSpace, saveBlocks, saveLevelSaveEntities, savePlayerSaveEntities, isEditorSave)
    {
        var blockDataList = null;

        if (saveBlocks)
        {
            var gameSpaceBlockList = gameSpace.getBlockList();
            blockDataList = gameSpaceBlockList.map(
                function (block) { return Level.Serialize.serializeBlock(block); });
        }

        var entityDataList = null;

        if (saveLevelSaveEntities || savePlayerSaveEntities)
        {
            var gameSpaceEntityList = gameSpace.getEntityList();

            var serializableEntityList = gameSpaceEntityList.filter(
                function (entity)
                {
                    return ((entity.shouldLevelSave && saveLevelSaveEntities) ||
                        (entity.shouldPlayerSave && savePlayerSaveEntities));
                });

            entityDataList = serializableEntityList.map(
                function (entity) { return Level.Serialize.serializeEntity(entity, isEditorSave); });
        }

        return {
            extents : gameSpace.getExtents(),
            m43Transform : gameSpace.getM43FullTransform(),
            blockList : blockDataList,
            entityList : entityDataList
        };
    },

    serializeBlock : function levelserializeSerializeBlockFn(block)
    {
        var blockArchetype = block.getArchetypeName();

        debug.assert(blockArchetype, 'No archetype set for serialized block.');

        return {
            archetype : blockArchetype,
            v3Location : block.getv3Location(),
            v3Scale : block.getV3Scale(),
            v3Rotation : block.getV3Rotation()
        };
    },

    serializeEntity : function levelserializeSerializeEntityFn(entity, isEditorSave)
    {
        if (entity.archetypeName)
        {
            return Level.Serialize.serializeArchetypeEntity(entity, isEditorSave);
        }
        else
        {
            return Level.Serialize.serializeCustomEntity(entity, isEditorSave);
        }
    },

    serializeArchetypeEntity : function levelserializeSerializeArchetypeEntityFn(entity, isEditorSave)
    {
        debug.assert(entity.archetypeName, 'Cannot serialize an entity without an archetype.');

        var name = entity.name;
        var ecData = entity.getECSaveData(isEditorSave);

        return {
            name : name,
            archetypeName : entity.archetypeName,
            v3Location : entity.getv3Location(),
            v3Rotation : entity.getV3Rotation(),
            v3Scale : entity.getV3Scale(),
            ecData : ecData
        };
    },

    serializeCustomEntity : function levelserializeSerializeCustomEntityFn(entity, isEditorSave)
    {
        var name = entity.name;
        var familyName = entity.familyName;
        var ecData = entity.getECSaveData(isEditorSave);

        return {
            name : name,
            familyName : familyName,
            customArchetype : entity.getCustomArchetype(),
            v3Location : entity.getv3Location(),
            v3Rotation : entity.getV3Rotation(),
            v3Scale : entity.getV3Scale(),
            ecData : ecData
        };
    }
};
