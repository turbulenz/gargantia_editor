//
// Level.Parse - namespace for level parsing functionality
//

/*global debug: false*/
/*global GameSpace: false*/
/*global Level: false*/
/*global TurbulenzEngine: false*/

Level.Parse =
{
    parseLevelDataFromLevelAndPlayerSave : function levelparseParseLevelDataFromLevelAndPlayerSaveFn(
        saveData, blockFactory, entityFactory, globals)
    {
        debug.assert(saveData.levelSaveData, 'Combined level save does not have level save data.');
        debug.assert(saveData.playerSaveData, 'Combined level save does not have player save data.');

        var levelSaveData = saveData.levelSaveData;
        var playerSaveData = saveData.playerSaveData;

        debug.assert(Level.Parse.areLevelAndPlayerSaveMergeable(levelSaveData, playerSaveData),
            'Aborting level parse as level and player save are not compatible.');

        var combinedSaveData = Level.Parse.combineLevelAndPlayerSaveData(
            levelSaveData, playerSaveData, entityFactory);

        return Level.Parse.parseLevelData(combinedSaveData, blockFactory, entityFactory, globals);
    },

    areLevelAndPlayerSaveMergeable : function levelparseAreLevelAndPlayerSaveMergeableFn(levelSave, playerSave)
    {
        var haveMatchingSaveVersion = (levelSave.saveVersionNumber === playerSave.saveVersionNumber);
        var haveSameSizeGameSpaceLists = (levelSave.gameSpaceList.length === playerSave.gameSpaceList.length);

        debug.assert(haveMatchingSaveVersion, 'Trying to merge a player and level save with different save versions.');
        debug.assert(haveSameSizeGameSpaceLists,
            'Trying to merge a player and level save with different size gamespace lists.');

        return (haveMatchingSaveVersion && haveSameSizeGameSpaceLists);
    },

    combineLevelAndPlayerSaveData : function levelparseCombineLevelAndPlayerSaveDataFn(
        levelSaveData, playerSaveData, entityFactory)
    {
        var timeStamp =
            ((playerSaveData.timeStamp > levelSaveData.timeStamp) ? playerSaveData.timeStamp : levelSaveData.timeStamp);

        var levelGameSpaceList = levelSaveData.gameSpaceList;
        var playerGameSpaceList = playerSaveData.gameSpaceList;

        var combinedSaveData =
        {
            versionNumber : playerSaveData.versionNumber,
            saveVersionNumber : levelSaveData.saveVersionNumber,
            timeStamp : timeStamp,
            uniqueIndex : playerSaveData.uniqueIndex,
            uniqueLevelIndex : levelSaveData.uniqueLevelIndex,
            scriptData : playerSaveData.scriptData,
            gameSpaceList : levelSaveData.gameSpaceList
        };

        var levelEntityDataMap = Level.Parse.getEntityDataMapFromGamespaceList(levelGameSpaceList);

        var gameSpaceIndex;
        var gameSpaceListLength = levelGameSpaceList.length;

        var combinedGameSpaceList = [];

        for (gameSpaceIndex = 0; gameSpaceIndex < gameSpaceListLength; gameSpaceIndex += 1)
        {
            var levelGameSpace = levelGameSpaceList[gameSpaceIndex];
            var playerGameSpace = playerGameSpaceList[gameSpaceIndex];
            var levelEntityList = levelGameSpace.entityList;
            var playerEntityList = playerGameSpace.entityList;

            var combinedGameSpace = Level.Parse.mergeGameSpaceEntityLists(
                levelGameSpace, levelEntityList, playerEntityList, levelEntityDataMap, entityFactory);

            combinedGameSpaceList.push(combinedGameSpace);
        }

        combinedSaveData.gameSpaceList = combinedGameSpaceList;

        return combinedSaveData;
    },

    mergeGameSpaceEntityLists : function levelparseMergeGameSpaceEntityListsFn(
        gameSpace, levelEntityList, playerEntityList, levelEntityDataMap, entityFactory)
    {
        gameSpace.entityList = Level.Parse.combineLevelAndPlayerSaveEntityLists(
            levelEntityList, playerEntityList, levelEntityDataMap, entityFactory);

        return gameSpace;
    },

    combineLevelAndPlayerSaveEntityLists : function levelparseCombineLevelAndPlayerSaveEntityListsFn(
        levelEntityDataList, playerEntityDataList, levelEntityDataMap, entityFactory)
    {
        var entityIndex;
        var levelEntityData;
        var playerEntityData;
        var entityName;
        var entityListLength = playerEntityDataList.length;

        var resultEntityDataList = levelEntityDataList;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            playerEntityData = playerEntityDataList[entityIndex];
            entityName = playerEntityData.name;
            levelEntityData = levelEntityDataMap[entityName];

            if (levelEntityData)
            {
                levelEntityData.ecData = playerEntityData.ecData;
            }
            else
            {
                // Read this property off the archetype as this allows us to change it between game versions
                var archetypeName = playerEntityData.archetypeName;
                var archetype =
                    (archetypeName ? entityFactory.getEntityArchetype(archetypeName) : playerEntityData.customArchetype);

                // If an entity should level save but doesn't exist in the level save then discard it
                // Else we add it to the kept entity list
                if (!archetype.shouldLevelSave)
                {
                    resultEntityDataList.push(playerEntityData);
                    levelEntityDataMap[entityName] = playerEntityData;
                }
            }
        }

        return resultEntityDataList;
    },

    getEntityDataMapFromGamespaceList : function levelparseGetEntityDataMapFromGamespaceListFn(gameSpaceList)
    {
        var totalEntityDataList = gameSpaceList.reduce(function (totalEntityDataList, gameSpace)
            {
                var entityList = (gameSpace.entityList || []);
                return totalEntityDataList.concat(entityList);
            }, []);

        return Level.Parse.getMapFromList(totalEntityDataList, 'name');
    },

    getEntityMapFromGameSpaceList : function levelparseGetEntityMapFromGameSpaceListFn(gameSpaceList)
    {
        var totalEntityList = gameSpaceList.reduce(function (totalEntityList, gameSpace)
        {
            var entityList = (gameSpace.entityList || []);
            return totalEntityList.concat(entityList);
        }, []);

        return Level.Parse.getMapFromList(totalEntityList, 'name');
    },

    getMapFromList : function levelparseGetMapFromListFn(list, mapKeyName)
    {
        return list.reduce(function (map, entity)
        {
            map[entity[mapKeyName]] = entity;
            return map;
        }, {});
    },

    parseLevelData : function editorLevelParseLevelDataFn(levelData, blockFactory, entityFactory, globals)
    {
        var uniquifyEntityNames = (levelData.uniqueIndex === null);

        var gameSpaceDataList = levelData.gameSpaceList;

        var gameSpaceList = Level.Parse.parseGameSpaceDataList(
            gameSpaceDataList, uniquifyEntityNames, blockFactory, entityFactory, globals);

        var deserializedGameSpaceList = Level.Parse.deserializeGameSpaceList(gameSpaceList, gameSpaceDataList);

        return {
            versionNumber : levelData.versionNumber,
            saveVersionNumber : levelData.saveVersionNumber,
            timeStamp : levelData.timeStamp,
            uniqueIndex : levelData.uniqueIndex,
            uniqueLevelIndex : levelData.uniqueLevelIndex,
            gameSettings : levelData.gameSettings,
            scriptData : levelData.scriptData,
            gameSpaceList : deserializedGameSpaceList
        };
    },

    parseGameSpaceDataList : function levelparseParseGameSpaceDataListFn(
        gameSpaceDataList, uniquifyEntityNames, blockFactory, entityFactory, globals)
    {
        return gameSpaceDataList.map(
            function (gameSpaceData) { return Level.Parse.parseGameSpaceData(
            gameSpaceData, uniquifyEntityNames, blockFactory, entityFactory, globals);
                                    });
    },

    parseGameSpaceData : function levelparseParseGameSpaceDataFn(
        gameSpaceData, uniquifyEntityNames, blockFactory, entityFactory, globals)
    {
        var md = TurbulenzEngine.getMathDevice();
        var extents = md.aabbCopy(gameSpaceData.extents);
        var m43Transform = md.m43Copy(gameSpaceData.m43Transform);

        var gameSpace = GameSpace.create('GameSpace', globals, extents, m43Transform);

        var blockList = gameSpaceData.blockList.map(
            function (blockData) { return Level.Parse.parseBlockData(blockData, blockFactory); });

        blockList.forEach(function (block) { block.addToGameSpace(gameSpace); });

        var entityList = gameSpaceData.entityList.map(
            function (entityData) { return Level.Parse.parseEntityData(entityData, uniquifyEntityNames, entityFactory); });

        gameSpace.addEntities(entityList);

        return gameSpace;
    },

    parseBlockData : function levelparseParseBlockDataFn(blockData, blockFactory)
    {
        var md = TurbulenzEngine.getMathDevice();

        var v3Location = md.v3Copy(blockData.v3Location);
        var v3Scale = md.v3Copy(blockData.v3Scale);
        // backwards compatible with old level files having only yRotation
        var v3Rotation;
        if (!blockData.v3Rotation)
        {
            v3Rotation = md.v3Build(0, blockData.rotationY !== undefined ? blockData.rotationY : 0, 0);
        }
        else
        {
            v3Rotation = md.v3Copy(blockData.v3Rotation);
        }
        var blockArchetype = blockData.archetype;

        return blockFactory.createBlockInstance(blockArchetype, v3Location, v3Scale, v3Rotation);
    },

    parseEntityData : function levelparseParseEntityDataFn(entityData, uniquifyEntityNames, entityFactory)
    {
        var md = TurbulenzEngine.getMathDevice();

        var archetypeName = entityData.archetypeName;
        var name = entityData.name;
        var customArchetype = entityData.customArchetype;
        var familyName = entityData.familyName;
        var v3Location = md.v3Copy(entityData.v3Location);
        // backwards compatible with old level files having only yRotation
        var v3Rotation;
        if (!entityData.v3Rotation)
        {
            v3Rotation = md.v3Build(0, entityData.yRotation !== undefined ? entityData.yRotation : 0, 0);
        }
        else
        {
            v3Rotation = md.v3Copy(entityData.v3Rotation);
        }
        var v3Scale = md.v3Copy(entityData.v3Scale);

        var entity;

        if (archetypeName)
        {
            entity = entityFactory.createInactiveEntityInstance(name, archetypeName, v3Location, v3Rotation);
        }
        else
        {
            entity = entityFactory.createEntity(name, familyName, customArchetype, v3Location, v3Rotation);
        }

        if (v3Scale)
        {
            entity.setV3Scale(v3Scale);
        }

        if (!uniquifyEntityNames && name)
        {
            entity.name = name;
        }

        return entity;
    },

    deserializeGameSpaceList : function levelparseDeserializeGameSpaceListFn(gameSpaceList, gameSpaceDataList)
    {
        var entityNameMap = Level.Parse.getEntityMapFromGameSpaceList(gameSpaceList);

        var gameSpaceListLength = gameSpaceList.length;
        var gameSpaceIndex;
        var gameSpace;
        var gameSpaceData;

        for (gameSpaceIndex = 0; gameSpaceIndex < gameSpaceListLength; gameSpaceIndex += 1)
        {
            gameSpace = gameSpaceList[gameSpaceIndex];
            gameSpaceData = gameSpaceDataList[gameSpaceIndex];

            Level.Parse.deserializeGameSpace(gameSpace, gameSpaceData, entityNameMap);
        }

        return gameSpaceList;
    },

    deserializeGameSpace : function levelparseDeserializeGameSpaceFn(
        gameSpace, gameSpaceData, entityNameMap)
    {
        var gameSpaceEntityList = gameSpace.getEntityList();
        var gameSpaceDataEntityDataList = gameSpaceData.entityList;

        debug.assert(gameSpaceEntityList.length === gameSpaceDataEntityDataList.length,
            'Entity list and entity data list must match in length.');

        return gameSpaceEntityList.map(
            function (entity, entityIndex)
            {
                var ecData = gameSpaceDataEntityDataList[entityIndex].ecData;
                return Level.Parse.deserializeEntity(entity, ecData, entityNameMap);
            }
        );
    },

    deserializeEntity : function levelparseDeserializeEntity(entity, ecData, entityNameMap)
    {
        if (ecData)
        {
            entity.setLevelEntityNameMap(entityNameMap);
            entity.deserializeECSaveData(ecData);
            entity.clearLevelEntityNameMap();
        }

        return entity;
    }
};
