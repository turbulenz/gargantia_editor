//
//  GameManager
//
//  Manages an array of GameSpaces.
//

/*global AABBTree: false*/
/*global BirdManager: false*/
/*global BlockFactory: false*/
/*global Collisions: false*/
/*global CloudManager: false*/
/*global Config: false*/
/*global GameController: false*/
/*global debug: false*/
/*global Editor: false*/
/*global EffectFactory: false*/
/*global EntityComponentBase: false*/
/*global EntityFactory: false*/
/*global EventManager: false*/
/*global GameCamera: false*/
/*global GameClock: false*/
/*global GameLighting: false*/
/*global GameParticleManager: false*/
/*global GameSoundManager: false*/
/*global GameSpace: false*/
/*global GamestateEditor: false*/
/*global GamestatePlaying: false*/
/*global GamestateResetGame: false*/
/*global GuiButtons: false*/
/*global GuiHelper: false*/
/*global GuiManager: false*/
/*global LevelArchetypes: false*/
/*global Level: false*/
/*global PlayFlags: false*/
/*global Profile: false*/
/*global TWEEN: false*/
/*global Water: false*/
/*global VMath: false*/
/*global TurbulenzEngine: false*/
/*global ECScore: false*/

function GameManager() {}

GameManager.musicVolume = 0.75;
GameManager.sfxVolume = 0.75;
GameManager.voiceVolume = 1;

GameManager.prototype =
{
    globals : undefined,

    initialise : function gameManagerInitialiseFn()
    {
        var globals = this.globals;

        var gamestate;
        gamestate = GamestateResetGame.create(this, globals);
        gamestate.setNextStateName('GamestateLoading');
        this.setGameState(gamestate);

        // Create

        this.initUI();

        this.refreshLighting();

        this.scratchpad = {
            inRay: {
                origin : null,
                direction : globals.mathDevice.v3BuildZero(),
                maxFactor : 1.0
            }
        };
    },

    preload : function gameManagerPreloadFn()
    {
        var globals = this.globals;

        debug.evaluate(globals.debugDraw.preload());

        this.guiButtons.preload();
        this.gameSoundManager.preload();
        this.gameParticleManager.preload();
        this.effectFactory.preload();
        this.entityFactory.preload();
        this.blockFactory.preload();

        this.gameController.preload();
        GamestatePlaying.preload(globals);

        this.globals.guiRenderer.preload();
        this.cloudManager.preload();
    },

    postload : function gameManagerPostloadFn()
    {
        this.gameSoundManager.postload();
    },

    refreshLighting : function gamemanagerRefreshLightingFn(keyFrame)
    {
        this.gameLighting.setKeyFrames(0.0, keyFrame, keyFrame);
        this.gameLighting.snap();
    },

    setSlomo : function gameManagerSetSlomoFn(timeDilation)
    {
        this.gameClock.setTimeDilation(timeDilation);
    },

    slowDown : function gameManagerSlowDownFn()
    {
        this.speedUpFactor  =   Math.max(this.speedUpFactor * 0.5, 0.125);
        this.setSlomo(this.speedUpFactor);
    },

    speedUp : function gameManagerSpeedUpFn()
    {
        this.speedUpFactor  =   Math.min(this.speedUpFactor * 2.0, 128);
        this.setSlomo(this.speedUpFactor);
    },

    speedReset : function gameManagerSpeedResetFn()
    {
        this.speedUpFactor  = 1.0;
        this.setSlomo(this.speedUpFactor);
    },

    initUI : function gameManagerInitUIFn()
    {
        var globals     =   this.globals;
        var ui          =   globals.dynamicUI;
        if (!ui)
        {
            return;
        }

        this.gameLighting.initUI();
        this.gameController.initUI();
    },

    createHero : function gameManagerCreateHeroFn(heroName, heroArchetype, v3Location)
    {
        var entityFactory   =   this.getEntityFactory();

        var v3LocationToUse  =  v3Location || this.getLevelStartLocation();

        var newEntity   =   entityFactory.createActiveEntityInstance(heroName, heroArchetype, v3LocationToUse);

        return  newEntity;
    },

    clearHero : function gameManagerClearHeroFn()
    {
        this.setHero(null);
    },

    drawExtraTransparent : function gameManagerDrawExtraTransparentFn()
    {
        var gameState = this.getActiveGameState();
        if (gameState.name === GamestatePlaying.prototype.name)
        {
            // playState may still be null if we are paused in a
            // cutscene.

            var playState = this.getPlayState();
            if (playState)
            {
                playState.drawExtraTransparent(false);
            }
        }
    },

    startMusic : function gameManagerStartMusicFn(musicString)
    {
        var playing = true;
        if (this.musicString !== musicString)
        {
            this.stopMusic();

            if (Config.musicEnabled)
            {
                playing = this.gameSoundManager.play(musicString, null, null);
                if (playing)
                {
                    this.musicString = musicString;
                }
            }

            if (!this.getMusicEnabled())
            {
                this.setMusicVolume(0.0, 0.0);
            }
        }
        return playing;
    },

    getMusicEnabled : function gameManagerGetMusicEnabled()
    {
        return true; // this.getPlayerData().getMusicEnabled();
    },

    stopMusic : function gameManagerStopMusicFn()
    {
        if (this.musicString)
        {
            this.gameSoundManager.stop(this.musicString, null, 3.0);
            this.musicString    =   undefined;
        }
    },

    setMusicVolume : function gamemanagerSetMusicVolumeFn(volume, fadeTime)
    {
        if (!this.getMusicEnabled())
        {
            volume = 0.0;
        }

        if (this.musicString)
        {
            if (fadeTime === undefined)
            {
                fadeTime = 0.25;
            }

            this.gameSoundManager.setVolume(this.musicString, undefined, volume, fadeTime);
        }
    },

    calculateCurrentSpace : function gameManagerCalculateCurrentSpaceFn()
    {
        if (!this.heroEntity)
        {
            return;
        }
        var md                  =   this.globals.mathDevice;
        var herov3Location      =   this.heroEntity.v3Location;
        var heroSpace           =   this.heroEntity.getGameSpace();
        var currentGameSpace    =   this.getCurrentGameSpace();

        if (heroSpace !== undefined)
        {
            if (currentGameSpace === undefined)
            {
                this.setCurrentGameSpace(heroSpace);
//                this.enterRoom(heroSpace);
            }
            else if (currentGameSpace !== heroSpace)
            {
                if (md.aabbPointDistance(heroSpace.extents, herov3Location) < md.aabbPointDistance(this.currentGameSpace.extents, herov3Location) - 0.25)
                {
                    this.setCurrentGameSpace(heroSpace);
//                    this.enterRoom(heroSpace);
                }
            }
        }
    },

    setCurrentGameSpace : function gameManagerSetCurrentGameSpaceFn(currentGameSpace)
    {
        this.currentGameSpace   =   currentGameSpace;
    },

    getCurrentGameSpace : function gameManagerGetCurrentSpaceFn()
    {
        return  this.currentGameSpace;
    },

    setHero : function gameManagerSetHeroFn(heroEntity)
    {
        this.heroEntity = heroEntity;
        this.gameController.setHero(heroEntity);
        this.gameCamera.setHero(heroEntity);
    },

    getLevelStartLocation : function gameManagergetLevelStartLocationFn()
    {
        var locationMarker = this.getLevelStartLocationMarker();

        if (locationMarker)
        {
            return locationMarker.getv3Location();
        }
        else
        {
            return this.v3Respawn;
        }
    },

    getLevelStartLocationMarker : function gameManagergetLevelStartLocationMarkerFn()
    {
        var locationMarkerList = this.getEntitiesWithEC('ECLocationMarker');

        var validLocationMarkerList = locationMarkerList.filter(function (gameEntity)
        {
            var ecLocationMarker = gameEntity.getEC('ECLocationMarker');
            return (ecLocationMarker && ecLocationMarker.getType() === 'levelStartLocation');
        });

        if (validLocationMarkerList.length > 0)
        {
            if (this.gameController.recordedInfo && validLocationMarkerList.length > 1) //TODO RECORDED INFO
            {
                return validLocationMarkerList[1];
            }
            return validLocationMarkerList[0];
        }

        return null;
    },

    getLevelEnd : function gamemanagerGetLevelEndFn()
    {
        var locationMarkerList = this.getEntitiesWithEC('ECLocationMarker');
        var locationMarkerListLength = locationMarkerList.length;
        var ecLocationMarker;
        var entityIndex;

        for (entityIndex = 0; entityIndex < locationMarkerListLength; entityIndex += 1)
        {
            ecLocationMarker = locationMarkerList[entityIndex].getEC('ECLocationMarker');
            if (ecLocationMarker.getType() === 'levelEndLocation')
            {
                return ecLocationMarker.getv3Location();
            }
        }

        return undefined;
    },

    setLevelStartLocation : function gameManagersetLevelStartLocationFn(v3Respawn)
    {
        var md = this.globals.mathDevice;

        this.v3Respawn = md.v3Copy(v3Respawn, this.v3Respawn);
    },

    getSceneReadyToRender : function gameManagerGetSceneReadyToRenderFn()
    {
        return this.hasLoadedLevel &&
               (!this.globals.soundManager || this.globals.soundManager.getNumPendingSounds() === 0);
    },

    draw : function gameManagerDrawFn()
    {
        this.activeGameState.draw();

        this.drawDebug();

        this.drawSaveLoadStatus();
        this.drawSpeedUpStatus();
        //this.drawShadowEvaluateStatus();

        this.drawGameInfo();
    },

    drawDebug : function gameManagerDrawDebugFn()
    {
        var debugDrawFlags = this.globals.debugDrawFlags;

        if (debugDrawFlags.physics)
        {
            this.drawGameSpacesDebugPhysics();
        }
        if (debugDrawFlags.controller)
        {
            this.drawDebug();
        }
        if (debugDrawFlags.gameSpaces)
        {
            this.drawGameSpacesDebug();
        }
    },

    drawSaveLoadStatus : function gameManagerDrawSaveLoadStatusFn()
    {
        //Displays loading or saving status...
        if (!this.getLoading() && !this.getSaving())
        {
            return;
        }

        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        var height = graphicsDevice.height;
        var step   = 20;

        var bot_left_info = { x : 10, y : height - step * 2.5, pointSize : 16, alignment : 0};

        if (this.getLoading())
        {
            simpleFontRenderer.drawFontDouble("Loading Level...", bot_left_info);
        }
        if (this.getSaving())
        {
            simpleFontRenderer.drawFontDouble("Saving Level...", bot_left_info);
        }
    },

    drawSpeedUpStatus : function gameManagerDrawSpeedLoadStatusFn()
    {
        if (this.speedUpFactor === 1.0)
        {
            return;
        }

        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        var height  =   graphicsDevice.height;
        var width   =   graphicsDevice.width;

        var message_info = { x : width / 2.0, y : height - 100, pointSize : 32, alignment : 1};

        simpleFontRenderer.drawFontDouble(this.speedUpFactor.toString() + ' x Speedup.', message_info);
    },

    drawGameInfo : function gameManagerDrawGameInfoFn()
    {
        if (!Config.drawInfoText)
        {
            return;
        }

        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        var height  =   graphicsDevice.height;
        var width   =   graphicsDevice.width;

        var message_info = { x : width / 2.0, y : height - 50, pointSize : 32, alignment : 1};

        simpleFontRenderer.drawFontDouble(Config.infoText, message_info);
    },

    drawGUI : function gameManagerDrawGUIFn()
    {
    },

    //
    //Load and save stuff.
    //
    loadLevel : function gamemanagerLoadLevelFn(levelFilePath, local)
    {
        var globals = this.globals;
        var requestHandler = globals.requestHandler;
        var mappingTable = globals.mappingTable;

        var loadedLevelData;

        var onStartUpLevelLoadSuccess = function onStartUpLevelLoadSuccessFn(levelName, levelData)
        {
            loadedLevelData = levelData;

            this.parseAndSetLevel(loadedLevelData);

            this.loadingCount   -=  1;
            this.editedGameState = null;

        }.bind(this);

        var onStartUpLevelLoadError = function onStartUpLevelLoadErrorFn(levelPath)
        {
            debug.error('No level file found: ' + levelPath);

            this.loadingCount   -=  1;

        }.bind(this);

        this.loadingCount += 1;

        if (local)
        {
            Level.SaveLoad.loadLevelFromLocal(
                levelFilePath, requestHandler, onStartUpLevelLoadSuccess, onStartUpLevelLoadError);
        }
        else
        {
            Level.SaveLoad.loadLevelFromFile(
                levelFilePath, requestHandler, mappingTable, onStartUpLevelLoadSuccess, onStartUpLevelLoadError);
        }
    },

    parseAndSetLevel : function gameManagerParseAndSetLevelFn(levelSaveData)
    {
        var blockFactory = this.getBlockFactory();
        var entityFactory = this.getEntityFactory();

        var level = Level.Parse.parseLevelData(
            levelSaveData, blockFactory, entityFactory, this.globals);

        this.setCurrentLevel(level);

        this.onLevelLoaded();
    },

    setCurrentLevel : function gameManagerSetCurrentLevelFn(level)
    {
        var gameSpaceList = level.gameSpaceList;

        this.resetGameState();

        this.shouldAutoUpdateShadows = true;
        this.shouldAutoUpdateLowResolution = true;

        // NB! Set the unique index before activating entities as entities can be created during activation stage
        if (level.uniqueIndex)
        {
            this.uniqueIndex = level.uniqueIndex;
        }

        if (level.uniqueLevelIndex)
        {
            this.uniqueLevelIndex = level.uniqueLevelIndex;
        }

        gameSpaceList.forEach(this.addGameSpaceAndActivate.bind(this));

    },

    getLevelTime : function gamemanagerGetLevelTimeFn()
    {
        return this.globals.gameCurrentTime - this.levelStartTime;
    },

    startLevelTime : function gamemanagerStartLevelTimeFn()
    {
        this.levelStartTime = this.globals.gameCurrentTime;
    },

    resetGameState : function gameManagerResetGameStateFn(/*retainPrevious*/)
    {
        var globals = this.globals;
        var gameClock = this.getGameClock();

        this.clearGameSpaces();
        this.reset();

        // We need to start clock before loading level so that time is correct for new game
        gameClock.start();
        globals.gameCurrentTime = gameClock.getCurrentTime();
        globals.gameTimeStep = gameClock.getTimeStep();

        this.startPaused();

        this.gameSoundManager.stopAllSounds();
        this.gameParticleManager.stopAllParticles();
    },

    onLevelLoaded : function gameManagerOnLevelLoadedFn()
    {
        this.hasLoadedLevel = true;
    },

    getLoading : function gameManagerGetLoadingFn()
    {
        return  this.loadingCount > 0;
    },

    getSaving : function gameManagerIsLoadingFn()
    {
        return  this.savingCount > 0;
    },

    //
    //  Destruction.
    //
    destroy : function gameManagerDestroyFn()
    {
        this.clearGameSpaces();
    },

    addHeroEntity : function gameManagerAddHeroEntity(heroEntity)
    {
        this.heroList.push(heroEntity);
    },

    removeHeroEntity : function gameManagerRemoveHeroEntity(heroEntity)
    {
        var index_to_splice = this.heroList.indexOf(heroEntity);
        if (index_to_splice >= 0)
        {
            this.heroList.splice(index_to_splice, 1);
        }
    },

    restart : function gameManagerRestartFn()
    {
        this.gameCamera.reset();

        var gamestateResetGame = GamestateResetGame.create(this, this.globals);
        this.globals.gameManager.getActiveGameState().setPlayState(null);
        this.setGameState(gamestateResetGame);
    },

    //TODO - move this into gamespace scope? OR perhaps gamespace apply the map globally...
    getGameEntityByName : function gameManagerGetGameEntityFn(gameEntityName)
    {
        var currentSpace;
        var spaceIndex;
        var spaceList       =   this.gameSpaceList;
        var foundEntity;

        if (gameEntityName)
        {
            for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
            {
                currentSpace = spaceList[spaceIndex];
                foundEntity =   currentSpace.getGameEntityByName(gameEntityName);

                if (foundEntity)
                {
                    return  foundEntity;
                }
            }
        }

        return  undefined;
    },

    getNearestGameEntityByFamilyName : function getNearestGameEntityByFamilyNameFn(familyName, v3Location)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;
        var entityList = [];

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            entityList.push.apply(entityList, spaceList[spaceIndex].getEntitiesWithFamilyName(familyName));
        }

        return this.getNearestEntityFromList(v3Location, entityList);
    },

    getGameEntitiesByFamilyName : function geGameEntitiesByFamilyNameFn(familyName)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;
        var result = [];

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            result = result.concat(spaceList[spaceIndex].getEntitiesWithFamilyName(familyName));
        }

        return result;
    },

    getGameEntityByUniqueId : function gameManagerGetGameEntityByUniqueIdFn(uniqueId)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;

        var entity = null;

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            entity = spaceList[spaceIndex].getEntityWithUniqueId(uniqueId);
            if (entity)
            {
                break;
            }
        }

        return entity;
    },

    getNearestGameEntityByArcheType : function getNearestGameEntityByArcheTypeFn(archetype, v3Location)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;
        var entityList = [];

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            entityList.push.apply(entityList, spaceList[spaceIndex].getEntitiesWithArcheType(archetype));
        }

        return this.getNearestEntityFromList(v3Location, entityList);
    },


    getGameEntitiesByArchetype : function geGameEntitiesByArchetypeFn(archeType)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;
        var result = [];

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            result = result.concat(spaceList[spaceIndex].getEntitiesWithArcheType(archeType));
        }

        return result;
    },

    getEntitiesWithEC : function getEntitiesWithECFn(ecName)
    {
        return EntityComponentBase.getEntitiesWithEC(ecName);
    },

    applyToEntitiesWithEC : function gamemanagerApplyToEntitiesWithECFn(ecName, toApply)
    {
        var objectIndex;
        var entList = this.getEntitiesWithEC(ecName);
        if (entList)
        {
            var entListLength = entList.length;
            for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
            {
                toApply(entList[objectIndex]);
            }
        }
    },

    getNearestEntityFromList : function gamemanagerGetNearestEntityFromListFn(v3Location, entityList, minDistance)
    {
        if (!entityList)
        {
            return undefined;
        }

        var md = this.globals.mathDevice;

        var foundEntity;
        var closestDistanceSq = minDistance !== undefined ? (minDistance * minDistance) : Infinity;

        var entityIndex;
        var distanceSq;
        for (entityIndex = 0; entityIndex < entityList.length; entityIndex += 1)
        {
            distanceSq = md.v3DistanceSq(entityList[entityIndex].getv3Location(), v3Location);

            if (distanceSq < closestDistanceSq)
            {
                foundEntity = entityList[entityIndex];
                closestDistanceSq = distanceSq;
            }
        }

        return foundEntity;
    },

    getFirstEntityWithEC : function gameManagerGetFirstEntityWithECFn(ecName)
    {
        var entitiesWithEC = this.getEntitiesWithEC(ecName);
        if (entitiesWithEC.length > 0)
        {
            return entitiesWithEC[0];
        }
        return undefined;
    },

    getNearestEntityWithEC : function gamemanagerGetNearestEntityWithECFn(ecName, v3Location, minDistance)
    {
        return this.getNearestEntityFromList(v3Location, this.getEntitiesWithEC(ecName), minDistance);
    },

    getBlocksByArchetype : function gameManagerGetBlocksByArchetypeFn(archeType)
    {
        var spaceIndex;
        var spaceList = this.gameSpaceList;
        var result = [];

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            result = result.concat(spaceList[spaceIndex].getBlocksByArchetype(archeType));
        }

        return result;
    },

    requestNewGameSpace : function gameManagerRequestNewGameSpaceFn(gameEntity, newGameSpace)
    {
        var migration = this.gameSpaceMigrationRequests[this.numGameSpaceMigrations];
        if (migration)
        {
            migration.gameEntity = gameEntity;
            migration.newGameSpace = newGameSpace;
        }
        else
        {
            this.gameSpaceMigrationRequests[this.numGameSpaceMigrations] = {
                gameEntity : gameEntity,
                newGameSpace : newGameSpace
            };
        }
        this.numGameSpaceMigrations += 1;
    },

    updateMigrationRequests : function gameManagerUpdateMigrationRequests()
    {
        var migrationList       =   this.gameSpaceMigrationRequests;
        var migrationListLength =   this.numGameSpaceMigrations;
        var migrationIndex      =   0;
        var thisMigration;
        for (;migrationIndex < migrationListLength; migrationIndex += 1)
        {
            thisMigration   =   migrationList[migrationIndex];
            if (thisMigration.gameEntity && !thisMigration.gameEntity.toBeDestroyed)
            {
                thisMigration.gameEntity.setGameSpace(thisMigration.newGameSpace);
            }
            thisMigration.gameEntity = null;
            thisMigration.newGameState = null;
        }
        this.numGameSpaceMigrations = 0;
    },

    getHero : function gameManagerGetHeroFn()
    {
        return  this.heroEntity;
    },

    getV3HeroLocation : function gameManagerGetV3HeroLocationFn()
    {
        if (this.heroEntity)
        {
            return this.heroEntity.getv3Location();
        }
        else
        {
            return null;
        }
    },

    getHeroList : function gameManagerGetHeroListFn()
    {
        return this.heroList;
    },

    sweep : function gameManagerSweepFn(v3origin, v3destination, radius, entityToIgnore)
    {
        var collisionInfo   =   this.getCollisionInfo(v3origin, v3destination, undefined, entityToIgnore);

        var md              =   this.globals.mathDevice;
        var v3Direction;

        if (collisionInfo)
        {
            v3Direction =   md.v3Sub(v3destination, v3origin);

            if (md.v3LengthSq(v3Direction) < 0.01 || !radius)
            {
                return  collisionInfo.v3Location;
            }

            md.v3Normalize(v3Direction, v3Direction);

            return  md.v3Sub(collisionInfo.v3Location, md.v3ScalarMul(v3Direction, radius));
        }

        return  v3destination;
    },

    placeOnGround : function gameManagerPlaceOnGroundFn(v3Origin, height, entityToIgnore)
    {
        var md  =   this.globals.mathDevice;

        var v3Down  =   md.v3AddScalarMul(v3Origin, md.v3BuildYAxis(), -10.0);

        v3Origin    =   this.sweep(v3Origin, v3Down, undefined, entityToIgnore);

        if (height !== undefined)
        {
            v3Origin[1] +=  height;
        }

        return  v3Origin;
    },

    getOverlappingObjects : function gameManagerGetOverlappingObjectsFn(aabb, overlappingCubes, overlappingSpheres, ignoreCubes, ignoreSpheres, opaque)
    {
        var md = this.globals.mathDevice;

        var originSpace, destSpace;

        //Build up the cube tree lists.
        var cubeTrees = [];
        var cubeTreeIndex;
        var numCubeTrees;
        var cubeTree;

        var numOverlappingCubes;
        var overlappingCubeIndex;
        var overlappingCube;
        var overlappingCubeNodes = [];

        if (aabb && md)
        {
            originSpace = this.getGameSpace(md.v3Build(aabb[0], aabb[1], aabb[2]));
            destSpace = this.getGameSpace(md.v3Build(aabb[3], aabb[4], aabb[5]));

            if (!ignoreCubes)
            {
                // Get overlapping cubes
                if (originSpace)
                {
                    if (opaque)
                    {
                        originSpace.addOpaqueCubeTreesToList(cubeTrees);
                    }
                    else
                    {
                        originSpace.addPhysicalCubeTreesToList(cubeTrees);
                    }
                }

                if (destSpace && destSpace !== originSpace)
                {
                    if (opaque)
                    {
                        destSpace.addOpaqueCubeTreesToList(cubeTrees);
                    }
                    else
                    {
                        destSpace.addPhysicalCubeTreesToList(cubeTrees);
                    }
                }

                numCubeTrees = cubeTrees.length;

                for (cubeTreeIndex = 0; cubeTreeIndex < numCubeTrees; cubeTreeIndex += 1)
                {
                    cubeTree = cubeTrees[cubeTreeIndex];
                    if (cubeTree)
                    {
                        cubeTree.getOverlappingNodes(aabb, overlappingCubeNodes);
                    }
                }

                // Filter out cubes that are ignoring collision
                numOverlappingCubes = overlappingCubeNodes.length;
                for (overlappingCubeIndex = numOverlappingCubes - 1; overlappingCubeIndex >= 0; overlappingCubeIndex -= 1)
                {
                    overlappingCube = overlappingCubeNodes[overlappingCubeIndex].cube;
                    if (overlappingCube && !overlappingCube.ignoringCollision)
                    {
                        overlappingCubes.push(overlappingCube);
                    }
                }
            }

            if (!ignoreSpheres)
            {
                // Get overlapping spheres
                if (originSpace)
                {
                    originSpace.getOverlappingSpheres(aabb, overlappingSpheres);
                }

                if (destSpace && destSpace !== originSpace)
                {
                    destSpace.getOverlappingSpheres(aabb, overlappingSpheres);
                }
            }
        }
    },

    hasLOS : function gameManagerHasLOSFn(entityA, entityB, yOffset, collisionInfoOut, opaque, cubeCollisionFilter)
    {
        var scratchpad = this.scratchpad;
        var md         = this.globals.mathDevice;

        var v3LocationA = scratchpad.v3LocationA = md.v3Copy(entityA.getv3Location(), scratchpad.v3LocationA);
        var v3LocationB = scratchpad.v3LocationB = md.v3Copy(entityB.getv3Location(), scratchpad.v3LocationB);

        if (yOffset !== undefined)
        {
            v3LocationA[1] += yOffset;
            v3LocationB[1] += yOffset;
        }

        var collisionInfo = this.getCollisionInfo(v3LocationA, v3LocationB, undefined, entityA, opaque, cubeCollisionFilter);

        if (collisionInfoOut)
        {
            collisionInfoOut.collisionInfo = collisionInfo;
        }

        return (!collisionInfo || (collisionInfo.collidedEntity === entityB));
    },

    getCollisionInfo : function gameManagerGetCollisionInfoFn(v3origin, v3destination, useSpheres, entityToIgnore, opaqueList, cubeCollisionFilter)
    {
        var md  =   this.globals.mathDevice;

        var inRay = this.scratchpad.inRay;
        var v3Direction = md.v3Sub(v3destination, v3origin, inRay.direction);
        var v3Normal, v3Location, v3Inside;

        inRay.origin = v3origin;
        inRay.direction = v3Direction;
        inRay.maxFactor = 1.0;

        var returnData;
        var tempReturnData;

        var ignoringCollisionCallback = function (tree, externalNode, ray, factor /*upperBound*/)
        {
            var cube = externalNode.cube;
            if (cube.ignoringCollision ||
                (entityToIgnore && cube.entity === entityToIgnore) ||
                (cubeCollisionFilter && !cubeCollisionFilter(cube)))
            {
                return null;
            }
            else
            {
                return  {
                    factor : factor,
                    externalNode : cube
                };
            }
        };

        //Build up the cube tree lists.
        var allCubeTreeLists            =   [];

        var gameSpaceList = this.getGameSpaceList();
        var gameSpaceListLength = gameSpaceList.length;
        var gameSpaceIndex;
        var gameSpace;

        for (gameSpaceIndex = 0; gameSpaceIndex < gameSpaceListLength; gameSpaceIndex += 1)
        {
            gameSpace = gameSpaceList[gameSpaceIndex];
            if (opaqueList)
            {
                allCubeTreeLists.push(gameSpace.opaqueCubeTree);
                allCubeTreeLists.push(gameSpace.opaqueCubeTreeDynamic);
            }
            else
            {
                allCubeTreeLists.push(gameSpace.cubeTree);
                allCubeTreeLists.push(gameSpace.cubeTreeDynamic);
            }
        }

        var furthestExtent  =   AABBTree.rayTest(allCubeTreeLists, inRay, ignoringCollisionCallback);

        if (furthestExtent !== null && furthestExtent.factor < 1.0)
        {
            v3Location  =   md.v3Add(v3origin, md.v3ScalarMul(v3Direction, furthestExtent.factor));
            v3Normal    =   md.v3Copy(v3Direction);
            md.v3Normalize(v3Normal, v3Normal);
            v3Normal    =   md.v3Sub(v3Location, md.v3ScalarMul(v3Normal, 0.01));
            v3Inside    =   md.aabbClampv3(furthestExtent.externalNode.extents, v3Normal);

            v3Normal    =   md.v3Sub(v3Normal, v3Inside, v3Normal);
            md.v3Normalize(v3Normal, v3Normal);

            returnData =
            {
                v3Location : v3Location,
                v3Normal : v3Normal,
                distance : md.v3Length(v3Direction) * furthestExtent.factor,
                collidedEntity : (furthestExtent.externalNode ? furthestExtent.externalNode.entity : undefined),
                collidedWorldCube : furthestExtent.externalNode
            };
        }

        if (useSpheres)
        {
            for (gameSpaceIndex = 0; gameSpaceIndex < gameSpaceListLength; gameSpaceIndex += 1)
            {
                gameSpace = gameSpaceList[gameSpaceIndex];
                tempReturnData  =   gameSpace.getCollisionInfoForSpheres(v3origin, v3destination, returnData !== undefined ? returnData.distance : undefined);
                if (tempReturnData)
                {
                    returnData  =   tempReturnData;
                }
            }
        }

        return  returnData;
    },

    //TODO - remove this and use gamespace only!
    applyToEntities : function gameManagerApplyToEntities(toApply)
    {
        var currentSpace;
        var spaceIndex;
        var spaceList       =   this.gameSpaceList;

        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            currentSpace = spaceList[spaceIndex];
            currentSpace.applyToEntities(toApply);
        }
    },

    applyToHeroEntities : function gameManagerApplyToHeroEntities(toApply)
    {
        var objectIndex;
        var entList = this.heroList;
        var entListLength = entList.length;
        for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
        {
            toApply(entList[objectIndex]);
        }
    },

    uniqueifyString : function gameManagerUniqueifyStringFn(name)
    {
        var uniqueName;
        uniqueName          =   name + "_" + this.uniqueIndex;

        if (this.uniqueSuffix)
        {
            uniqueName  =   uniqueName + this.uniqueSuffix;
        }

        this.uniqueIndex    +=  1;
        return uniqueName;
    },

    uniquifyLevelEntityName : function gameManagerUniquifyLevelEntityNameFn(entityName)
    {
        var uniqueLevelIndex = this.uniqueLevelIndex;
        this.uniqueLevelIndex += 1;

        return (entityName + '_' + uniqueLevelIndex);
    },

    //
    //  GameSpace management.
    //
    addGameSpace : function gameManagerAddGameSpaceFn(gameSpace)
    {
        this.gameSpaceList.push(gameSpace);
        this.newSpaceList.push(gameSpace);

        this.gameSpaceTree.add(gameSpace, gameSpace.extents);
        this.gameSpaceTree.finalize();

        this.gameSpaceMap[gameSpace.name]   =   gameSpace;

        if (this.v3RespawnLocation === undefined)
        {
            this.setLevelStartLocation(gameSpace.v3Centre);
        }
    },

    addGameSpaceAndActivate : function gameManagerAddGameSpaceAndActivateFn(gameSpace)
    {
        this.addGameSpace(gameSpace);

        gameSpace.activate();
    },

    removeGameSpace : function gameManagerRemoveGameSpaceFn(gameSpace)
    {
        var index_to_splice = this.gameSpaceList.indexOf(gameSpace);
        if (index_to_splice >= 0)
        {
            this.gameSpaceList.splice(index_to_splice, 1);
        }
        else
        {
            debug.error("Trying to remove a game space, but no matching one in the list!");
        }

        this.gameSpaceTree.remove(gameSpace);
        this.gameSpaceTree.finalize();

        this.gameSpaceMap[gameSpace.name]   =   undefined;
        delete  this.gameSpaceMap[gameSpace.name];

        this.deadSpaceList.push(gameSpace.name);
    },

    getGameSpace : function gameManagerGetGameSpaceFn(v3Location, radius)
    {
        var md                      = this.globals.mathDevice;
        var gameSpaceTree           = this.gameSpaceTree;
        var overlappingGameSpaces   = [];

        radius = ((radius !== undefined) ? radius : 0.0);

        gameSpaceTree.getSphereOverlappingNodes(v3Location, radius, overlappingGameSpaces);

        var sortByClosestAABB = function (a, b)
        {
            return md.aabbPointDistanceSq(a.extents, v3Location) - md.aabbPointDistanceSq(b.extents, v3Location);
        };

        //Sort them by closest first.
        overlappingGameSpaces.sort(sortByClosestAABB);

        return  overlappingGameSpaces[0];
    },

    getBlockFactory : function gameManagerGetBlockFactory()
    {
        return this.blockFactory;
    },

    getEntityFactory : function gameManagerGetEntityFactoryFn()
    {
        return this.entityFactory;
    },

    getEffectFactory : function gameManagerGetEffectFactoryFn()
    {
        return this.effectFactory;
    },

    getGameSoundManager : function gameManagerGetSoundManagerFn()
    {
        return  this.gameSoundManager;
    },

    getGameParticleManager : function gamemanagerGetGameParticleManagerFn()
    {
        return this.gameParticleManager;
    },

    applyFunctionToGameSpaces : function gameManagerApplyToGameSpacesFn()
    {
        var args = Array.prototype.slice.call(arguments);
        var gameSpaceFunction   =   args.shift();

        var currentSpace;
        var spaceIndex;
        var spaceList       =   this.gameSpaceList;
        var spaceListLength =   spaceList.length;
        for (spaceIndex = 0; spaceIndex < spaceListLength; spaceIndex += 1)
        {
            currentSpace = spaceList[spaceIndex];

            //gameSpaceFunction.call(currentSpace);

            gameSpaceFunction.apply(currentSpace, args);
        }
    },

    updateGameSpaces : function gameManagerUpdateGameSpaceFn()
    {
        this.applyFunctionToGameSpaces(GameSpace.prototype.update);
    },

    drawGameSpaces : function gameManagerDrawGameSpacesFn()
    {
        this.applyFunctionToGameSpaces(GameSpace.prototype.draw);
    },

    drawGameSpacesDebug : function gameManagerDrawGameSpacesDebugFn()
    {
        this.applyFunctionToGameSpaces(GameSpace.prototype.drawDebug, this.ecDebugDrawFlags);
    },

    drawGameSpacesDebugPhysics : function gameManagerDrawGameSpacesDebugPhysicsFn()
    {
        if (this.getCurrentGameSpace())
        {
            this.getCurrentGameSpace().drawDebugPhysics();
        }
    },

    clearGameSpaces : function gameManagerClearGameSpacesFn()
    {
        //GOTCHA! Destroy the hero first so that resources don't get cleared!
        var hero = this.getHero();
        if (hero)
        {
            hero.setToBeDestroyed();
        }

        var currentSpace;
        var spaceIndex;
        var spaceList       =   this.gameSpaceList;
        for (spaceIndex = 0; spaceIndex < spaceList.length; spaceIndex += 1)
        {
            currentSpace = spaceList[spaceIndex];

            this.removeGameSpace(currentSpace);
            currentSpace.destroy();
        }

        this.setCurrentGameSpace(undefined);
    },

    destroyDeadEntities : function gameManagerDestroyDeadEntitiesFn()
    {
        this.applyFunctionToGameSpaces(GameSpace.prototype.destroyDeadEntities);
    },

    getGameSpaceList : function gameManagerGetGameSpaceListFn()
    {
        return this.gameSpaceList;
    },

    reset : function gameManagerResetFn()
    {
        this.heroEntity = undefined;
        this.heroList   = [];

        this.gameSpaceList = [];
        this.gameSpaceTree = AABBTree.create(true);
        this.gameSpaceMap  = {};
        this.newSpaceList  = [];
        this.deadSpaceList = [];

        this.activeEntityCount = 0;
        this.activeSpaceCount  = 0;
        this.gameController.setHero(undefined);
        this.gameController.reset();

        if (this.globals.profiling)
        {
            this.globals.profilingData.reset();
        }

        this.speedReset();
    },

    setGameState : function gameManagerSetGameStateFn(newGameState,
                                                      retainPrevious)
    {

        debug.assert(newGameState, 'Cannot set invalid gamestate: ' + newGameState);

        if (!retainPrevious)
        {
            var previousGameState = this.activeGameState;
            if (previousGameState)
            {
                previousGameState.exitState();
            }
        }

        //debug.info('Changing state to ' + newGameState.name + '.');

        this.activeGameState = newGameState;

        newGameState.enterState();
    },

    setGameStateByName : function gamemanagerSetGameStateByNameFn(newGameStateName)
    {
        var newGameState;
        if (GameManager.gameStateCreationMap[newGameStateName] !== undefined)
        {
            newGameState = GameManager.gameStateCreationMap[newGameStateName].create(this, this.globals);
        }

        if (newGameState)
        {
            this.setGameState(newGameState);
        }
    },

    getActiveGameState : function gameManagerGetActiveGameStateFn()
    {
        return this.activeGameState;
    },

    detectAndRecoverFromAbsence : function gameManagerDetectAndRecoverFromAbsenceFn()
    {
        if (!this.prevAppCurrentTime)
        {
            this.prevAppCurrentTime = this.globals.appCurrentTime;
            return;
        }

        this.prevAppCurrentTime = this.globals.appCurrentTime;
    },

    updateAutoShadowEnabled : function gameManagerUpdateAutoShadowEnabledFn()
    {
        if (!this.shouldAutoUpdateShadows)
        {
            return;
        }

        if (!this.startPerfMeasureTime)
        {
            this.startPerfMeasureTime = this.globals.appCurrentTime;

            this.perfCounter           = 0;
            this.shadowEvaluateCounter = 0;
        }

        var gd = this.globals.graphicsDevice;
        if (this.globals.appCurrentTime > this.startPerfMeasureTime + 2.0)
        {
            if (gd.fps > 30)
            {
                this.perfCounter    +=  1;
            }
            else
            {
                this.perfCounter    -=  1;
            }
        }

        if (Math.abs(this.perfCounter) > 30)
        {
            this.gameLighting.setShadowsEnabled((this.perfCounter > 0));
            this.shadowEvaluateCounter += 1;
            this.perfCounter            = 0;

            if (this.shadowEvaluateCounter > 1)
            {
                this.shouldAutoUpdateShadows = false;
                this.startPerfMeasureTime = 0;
            }
        }
    },

    updateAutoLowResolutionEnabled : function gamemanagereUpdateAutoLowResolutionEnabledFn()
    {
        if (!this.shouldAutoUpdateLowResolution ||
            this.shouldAutoUpdateShadows)
        {
            return;
        }

        var gd = this.globals.graphicsDevice;

        if (!this.startPerfMeasureTime)
        {
            if (gd.fps >= 20)
            {
                this.shouldAutoUpdateLowResolution = false;
            }
            else
            {
                this.startPerfMeasureTime = this.globals.appCurrentTime;
                this.perfCounter          = 0;
                this.prefReferenceFPS     = gd.fps;
            }
        }

        if (this.shouldAutoUpdateLowResolution)
        {
            if (gd.fps >= this.prefReferenceFPS)
            {
                this.perfCounter    +=  1;
            }
            else
            {
                this.perfCounter    -=  1;
            }

            if (this.globals.appCurrentTime > this.startPerfMeasureTime + 2.0)
            {
                this.shouldAutoUpdateLowResolution       = false;
            }
        }
    },

    _lerpVolume : function gameManagerLerpVolumeFn(currentVolume, targetVolume, timeStep)
    {
        var result;
        var delta = (targetVolume - currentVolume);
        if (Math.abs(delta) < 0.01)
        {
            result = targetVolume;
        }
        else
        {
            result = VMath.clamp((currentVolume + (delta * timeStep * 4)), 0, 1);
        }
        return result;
    },

    update : function gameManagerUpdateFn()
    {
        var gameClock = this.gameClock;

        var steps = this.globals.appMaxTimeSteps;
        var globals = this.globals;
        var settings = globals.settings;

        this.detectAndRecoverFromAbsence();

        while (steps &&
               gameClock.tick(this.variableStep, steps === this.globals.appMaxTimeSteps))
        {
            Profile.start('Update - Game');
            steps -= 1;
            globals.gameCurrentTime = gameClock.getCurrentTime();
            globals.gameTimeStep    = gameClock.getTimeStep();
            globals.physTimeStep    = gameClock.getPhysTimeStep();
            globals.gameAppTimeStep = gameClock.getGameAppTimeStep();

            // Update audio silence
            var ts = globals.gameAppTimeStep;
            settings.volume = this._lerpVolume(settings.volume, this.targetVolume, ts);
            settings.musicVolume  = this._lerpVolume(settings.musicVolume, this.targetMusicVolume, ts);
            settings.voicesVolume = this._lerpVolume(settings.voicesVolume, this.targetVoicesVolume, ts);

            //Clear draw lists.
            globals.simpleFontRenderer.clearFontList();
            globals.simpleSpriteRenderer.clearSpriteList();
            globals.debugDraw.clearDebugLineList();
            this.guiManager.clearDrawList();
            this.guiButtons.clearDrawList();
            this.guiButtons.clearValidation();

            globals.guiRenderer.clearShakeAmount();

            TWEEN.update(this.globals.gameCurrentTime * 1000, this.globals.appCurrentTime * 1000);

            this.activeGameState.update();

            Profile.stop('Update - Game');
        }
    },

    getGuiButtons : function gameManagerGetGuiButtonsFn()
    {
        return  this.guiButtons;
    },

    updateSoundListenerLocation : function gameManagerUpdateSoundListenerLocationFn()
    {
        var hero = this.heroEntity;

        if (hero)
        {
            this.gameSoundManager.setListenerWorldLocation(hero.getv3Location());
        }
    },

    updateGame : function gameManagerUpdateGameFn()
    {
        this.activeEntityCount  =   0;
        this.activeSpaceCount   =   0;

        this.calculateCurrentSpace();

        this.gameController.update();

        this.updateSoundListenerLocation();

        this.gameSoundManager.update();
        this.gameParticleManager.update();

        if (!this.gameClock.isStopped)
        {
            //Now entities.
            this.updateGameSpaces();

            this.globals.particleManager.update(this.globals.gameTimeStep);
        }

        this.updateMigrationRequests();

        this.gameCamera.update();

        this.guiHelper.update();

        this.updateWater();
    },

    draw2D : function gameManagerDraw2DFn()
    {
        var globals = this.globals;
        this.guiButtons.draw2D();
        this.activeGameState.draw2D();

        TWEEN.drawUpdate(this.globals.gameCurrentTime * 1000, this.globals.appCurrentTime * 1000);

        this.getGuiManager().completeDraw();

        this.gameController.draw2D();

        var simpleFontRenderer = globals.simpleFontRenderer;
        simpleFontRenderer.render();
    },

    skipCurrentCutsceneScreen : function gameManagerSkipCurrentSplashScreenFn()
    {
        this.activeGameState.skipCurrentCutsceneScreen();
    },

    clearMissionEnd : function gameManagerClearMissionEndFn()
    {
        this.activeGameState.clearMissionEnd();
    },

    startPaused : function gameManagerStartPauseFn()
    {
        this.paused =   true;
        this.gameClock.pause();
    },

    exitPaused : function gameManagerExitPauseFn()
    {
        this.paused =   false;
        this.gameClock.resume();
    },

    isPaused : function gameManagerIsPausedFn()
    {
        return this.paused;
    },

    onEnterMenu : function gameManagerOnEnterMenuFn()
    {
        var gameController = this.getGameController();

        if (Config.lockMouseInMenus)
        {
            gameController.setMouseLockable(true);
            gameController.lockMouse();
        }
        else
        {
            gameController.setMouseLockable(false);
            gameController.unlockMouse();
        }
    },

    onLeaveMenu : function gameManagerOnLeaveMenuFn()
    {
        var gameController = this.getGameController();

        if (Config.lockMouseInGame)
        {
            gameController.setMouseLockable(true);
            gameController.lockMouse();
        }
        else
        {
            gameController.setMouseLockable(false);
            gameController.unlockMouse();
        }
    },

    toggleControlInversion : function gameManagerToggleControlInversionFn(axis)
    {
        if (axis === 'X')
        {
            this.controlInversionX = !this.controlInversionX;
            this.savedConfig.controlInversionX = this.controlInversionX;
        }
        else
        {
            this.controlInversionY = !this.controlInversionY;
            this.savedConfig.controlInversionY = this.controlInversionY;
        }

        this.globals.saveData.setUserConfig(this.savedConfig);
    },

    isMuted : function gameManagerIsMuted()
    {
        // If all audio is silent, consider it muted
        return this.audioSilence && this.audioMusicSilence && this.audioVoicesSilence;
    },

    muteAll : function gameManagerMuteAll()
    {
        if (!this.audioSilence)
        {
            this.toggleAudioSilence();
        }
        if (!this.audioMusicSilence)
        {
            this.toggleAudioMusicSilence();
        }
        if (!this.audioVoicesSilence)
        {
            this.toggleAudioVoicesSilence();
        }
    },

    unmuteAll : function gameManagerUnuteAll()
    {
        if (this.audioSilence)
        {
            this.toggleAudioSilence();
        }
        if (this.audioMusicSilence)
        {
            this.toggleAudioMusicSilence();
        }
        if (this.audioVoicesSilence)
        {
            this.toggleAudioVoicesSilence();
        }
    },

    toggleAudioSilence : function gameManagerToggleAudioSilenceFn()
    {
        this.audioSilence = !this.audioSilence;
        this.targetVolume = this.audioSilence ? 0 : GameManager.sfxVolume;

        this.globals.cutScenePlayer.sfxSetOptionsVolume(this.targetVolume);

        this.savedConfig.audioSilence = this.audioSilence;
        this.globals.saveData.setUserConfig(this.savedConfig);
    },

    toggleAudioMusicSilence : function gameManagerToggleAudioMusicSilenceFn()
    {
        this.audioMusicSilence = !this.audioMusicSilence;
        this.targetMusicVolume = this.audioMusicSilence ? 0 : GameManager.musicVolume;

        this.globals.cutScenePlayer.bgmSetOptionsVolume(this.targetMusicVolume);

        this.savedConfig.audioMusicSilence = this.audioMusicSilence;
        this.globals.saveData.setUserConfig(this.savedConfig);
    },

    toggleAudioVoicesSilence : function gameManagerToggleAudioMusicSilenceFn()
    {
        this.audioVoicesSilence = !this.audioVoicesSilence;
        this.targetVoicesVolume = this.audioVoicesSilence ? 0 : GameManager.voiceVolume;

        this.savedConfig.audioVoicesSilence = this.audioVoicesSilence;
        this.globals.saveData.setUserConfig(this.savedConfig);
    },

    toggleLanguage : function gameManagerToggleLanguage()
    {
        var newLanguage = ("ja" === this.languageCode) ? ("en") : ("ja");
        this.languageCode = newLanguage;
    },

    // Returns a string.  Either "en" or "ja"
    getLanguage : function gameManagerGetLanguage()
    {
        return this.languageCode;
    },

    getEnableLanguageSetting : function gameManagerGetEnableLanguageSetting()
    {
        return this.enableLanguageSetting;
    },

    togglePause : function gameManagerTogglePauseFn()
    {
    },

    enableInput : function gameManagerEnableInputFn(enable)
    {
        var gameState = this.getActiveGameState();
        var method = gameState.enableInput;
        if (method)
        {
            method.call(gameState, enable);
        }
    },

    setArcadeMode : function gameManagerSetArcadeMode(arcadeMode)
    {
        this.arcadeMode = arcadeMode;
    },

    getArcadeMode : function gameManagerGetArcadeMode()
    {
        return this.arcadeMode;
    },

    getDemoMode : function gameManagerGetDemoModeFn()
    {
        return this.demoMode;
    },

    toggleEditor : function gameManagerToggleEditorFn()
    {
        var gamestateEditor;
        var gamestatePlaying;
        var level;

        if (this.isInEditorMode())
        {
            this.editedGameState = JSON.stringify(Level.Serialize.serializeLevelIntoSingleSave(this, true));
            level = LevelArchetypes["levels/" + Editor.State.currentLevelName + ".json"];
            debug.assert(level);
            this.setPlayState(null);
            gamestatePlaying = GamestatePlaying.create(this, this.globals, level.type);
            gamestatePlaying.setLevel(level);
            this.setGameState(gamestatePlaying);
        }
        else
        {
            var levelData = this.getPlayState().level;
            var levelName = /levels\/(.*)\.json/.exec(levelData.path)[1];
            this.clearHero();
            gamestateEditor = GamestateEditor.create(this, this.globals);
            this.setGameState(gamestateEditor);
            this.hasLoadedLevel = true;
            if (this.editedGameState)
            {
                var blockFactory = this.getBlockFactory();
                var entityFactory = this.getEntityFactory();
                level = Level.Parse.parseLevelData(JSON.parse(this.editedGameState), blockFactory, entityFactory, this.globals);
                Editor.setLevel(level, levelName, this, this.globals);
            }
            else
            {
                Editor.Actions.actionMap.loadLevelFromLocalAsSingleFile(this.globals, this, {text: levelName});
            }
        }
    },

    isInEditorMode : function gameManagerIsInEditorModeFn()
    {
        return this.activeGameState.name === 'GamestateEditor';
    },

    getGameController : function gameManagerGetGameControllerFn()
    {
        return this.gameController;
    },

    getGameCamera : function gameManagerGetGameCameraFn()
    {
        return this.gameCamera;
    },

    getGameClock : function gameManagerGetGameClockFn()
    {
        return this.gameClock;
    },

    getGuiManager : function gameManagerGetGuiManagerFn()
    {
        return  this.guiManager;
    },

    getGuiHelper : function gamemanagerGetGuiHelperFn()
    {
        return this.guiHelper;
    },

    // EC Mask code used when debug drawing

    addECDebugDrawMask : function gameManagerAddECDebugDrawMaskFn(ecMask)
    {
        var ecDebugDrawFlags = this.ecDebugDrawFlags;

        var ecName;

        this.activeECMasks[ecMask.uiName] = true;

        if (ecMask.allECs)
        {
            ecMask = ecDebugDrawFlags;
        }

        for (ecName in ecMask)
        {
            if (ecMask.hasOwnProperty(ecName) && ecName !== 'uiName')
            {
                ecDebugDrawFlags[ecName] = true;
            }
        }
    },

    removeECDebugDrawMask : function gameManagerRemoveECDebugDrawMaskFn(ecMask)
    {
        var ecDebugDrawFlags = this.ecDebugDrawFlags;

        var ecName;

        this.activeECMasks[ecMask.uiName] = false;

        if (ecMask.allECs)
        {
            ecMask = ecDebugDrawFlags;
        }

        for (ecName in ecMask)
        {
            if (ecMask.hasOwnProperty(ecName) && ecName !== 'uiName')
            {
                ecDebugDrawFlags[ecName] = false;
            }
        }
    },

    isActiveECDebugDrawMask : function gameManagerIsActiveECDebugDrawMaskFn(ecMask)
    {
        return this.activeECMasks[ecMask.uiName];
    },

    refreshSelectableFlags : function gameManagerRefreshSelectableFlagsFn()
    {
        var entityList    =   this.getEntitiesWithEC('ECSelectable');

        var entityListLength = entityList.length;
        var entityListIndex;

        var ecSelectable, ecInteractable;
        var currentEntity;
        for (entityListIndex = entityListLength - 1; entityListIndex >= 0; entityListIndex -= 1)
        {
            if (entityList[entityListIndex] && !entityList[entityListIndex].shouldBeDestroyed())
            {
                currentEntity   =   entityList[entityListIndex];

                ecSelectable  =   currentEntity.getEC('ECSelectable');
                if (ecSelectable)
                {
                    ecSelectable.refreshValidity();
                }

                ecInteractable = currentEntity.getEC('ECInteractable');
                if (ecInteractable)
                {
                    ecInteractable.refreshValidity();
                }
            }
        }
    },

    setPlayFlags : function gameManagerSetPlayFlagsFn(playFlagsObject)
    {
        this.playFlags  =   playFlagsObject;
        this.refreshSelectableFlags();
    },

    getPlayFlags : function gameManagerGetPlayFlagsFn()
    {
        return this.playFlags;
    },

    setPlayState : function gameManagerSetPlayStateFn(playState)
    {
        this.playState = playState;
    },

    getPlayState : function gameManagerGetPlayStateFn()
    {
        return this.playState;
    },

    updatePerformanceMetrics : function gameManagerUpdatePerformanceMetricsFn()
    {
        // Slight delay before recording starts to avoid long initial frames
        if (this.globals.gameCurrentTime < 3.0)
        {
            return;
        }

        var fps        = this.globals.graphicsDevice.fps;
        var msPerFrame = (1000 / fps);

        if ((this.minMsPerFrameInGame === null) ||
            (msPerFrame < this.minMsPerFrameInGame))
        {
            this.minMsPerFrameInGame = msPerFrame;
        }

        if ((this.maxMsPerFrameInGame === null) ||
            (msPerFrame > this.maxMsPerFrameInGame))
        {
            this.maxMsPerFrameInGame = msPerFrame;
        }

        this.numberOfFramesInGame       += 1;
        this.cumulativeMsPerFrameInGame += msPerFrame;
    },


    shareViaFacebook : function gamemanagerShareViaFacebookFn(params)
    {
        this.globals.graphicsDevice.fullscreen = false;
        var title = params.title;
        var mainLink = params.mainLink;
        var caption = params.caption;
        var description = params.description;
        var backupLink = params.backupLink;

        if (window.FB)
        {
            window.FB.ui(
                {
                    method : 'feed',
                    name : title,
                    link : mainLink,
                    //picture : 'http://fbrell.com/f8.jpg',
                    caption : caption,
                    description : description
                },
                function (/*response*/)
                {
//                    var wasPublished = (response && response.post_id);
                }
            );
        }
        else
        {
            window.open(backupLink);
        }
    },

    shareViaTwitter : function gamemanagerShareViaTwitterFn(params)
    {
        var link = params.link;

        window.open(link);
    },

    spawnEntitiesIfValid : function gamemanagerSpawnEntitiesIfValidFn(playFlags)
    {
        var entityList = this.getEntitiesWithEC('ECEntitySpawner');

        var entityListLength = entityList.length;
        var entityListIndex;

        var ecEntitySpawner;
        var currentEntity;

        for (entityListIndex = entityListLength - 1; entityListIndex >= 0; entityListIndex -= 1)
        {
            currentEntity = entityList[entityListIndex];
            if (currentEntity && !currentEntity.shouldBeDestroyed())
            {
                ecEntitySpawner = currentEntity.getEC('ECEntitySpawner');
                if (ecEntitySpawner)
                {
                    ecEntitySpawner.applySpawnBehaviourBasedOnFlags(playFlags);
                }
            }
        }
    },

    updateWater : function updateWater()
    {
        var playState = this.getPlayState();
        if (playState)
        {
            var renderer = this.globals.renderer;
            var techniqueParameters = renderer.waterTechniqueParameters;
            var parameters = Water[playState.level.lighting];

            techniqueParameters.waterColorBright[0] =  parameters.colorBright[0];
            techniqueParameters.waterColorBright[1] =  parameters.colorBright[1];
            techniqueParameters.waterColorBright[2] =  parameters.colorBright[2];

            techniqueParameters.waterColorDark[0] =  parameters.colorDark[0];
            techniqueParameters.waterColorDark[1] =  parameters.colorDark[1];
            techniqueParameters.waterColorDark[2] =  parameters.colorDark[2];

            techniqueParameters.waterGain = parameters.gain;

            techniqueParameters.waterSpecularPower = parameters.specularPower;
            techniqueParameters.waterSpecularScale = parameters.specularScale;

            renderer.waterWaveFrequency        = parameters.waveFrequency;
            renderer.waterWaveScale            = parameters.waveScale;
            renderer.waterLayer1OffsetX        = parameters.layer1OffsetX;
            renderer.waterLayer1OffsetZ        = parameters.layer1OffsetZ;
            renderer.waterLayer2OffsetX        = parameters.layer2OffsetX;
            renderer.waterLayer2OffsetZ        = parameters.layer2OffsetZ;
            renderer.waterLayer0SpeedScaleX    = parameters.layer0SpeedScaleX;
            renderer.waterLayer1SpeedScaleX    = parameters.layer1SpeedScaleX;
            renderer.waterLayer1SpeedScaleZ    = parameters.layer1SpeedScaleZ;
            renderer.waterLayer2SpeedScaleX    = parameters.layer2SpeedScaleX;
            renderer.waterLayer2SpeedScaleZ    = parameters.layer2SpeedScaleZ;
            renderer.waterSpeedScale           = parameters.speedScale;

            techniqueParameters.glowColor[0] =  parameters.glowColor[0];
            techniqueParameters.glowColor[1] =  parameters.glowColor[1];
            techniqueParameters.glowColor[2] =  parameters.glowColor[2];

            techniqueParameters.trailColor[0] =  parameters.trailColor[0];
            techniqueParameters.trailColor[1] =  parameters.trailColor[1];
            techniqueParameters.trailColor[2] =  parameters.trailColor[2];
        }
    }
};

GameManager.ecDebugDrawMasks =
{
    all :
    {
        uiName : 'All',
        allECs : true
    },

    debugNav :
    {
        uiName : 'Pathfinding',
        ECNav : true
    },

    editor :
    {
        uiName : 'Editor',

        ECEntitySpawnManager : true,
        ECLocationMarker : true
    }
};

GameManager.gameStateCreationMap = {};

GameManager.create = function gameManagerCreateFn(parameters)
{
    var globals =   parameters.globals;

    //Lazily assign the static globals
    if (GameManager.prototype.globals === undefined)
    {
        GameManager.prototype.globals = globals;
    }

    // Demo Mode

    var demoMode = false;
    if (('undefined' !== typeof window) &&
        ('boolean' === typeof window.demomode))
    {
        demoMode = window.demomode;
    }

    var gameManager                         = new GameManager();

    gameManager.eventManager                = EventManager.create();

    gameManager.uniqueIndex                 = 0;
    gameManager.uniqueLevelIndex            = 0;

    gameManager.gameCamera                  = GameCamera.create(globals, gameManager);
    gameManager.gameController              = GameController.create(globals, gameManager);

    gameManager.guiManager                  = GuiManager.create(globals);
    gameManager.guiButtons                  = GuiButtons.create(globals, gameManager, gameManager.guiManager, gameManager.gameController);
    gameManager.guiHelper                   = GuiHelper.create(globals, gameManager.guiManager, gameManager.guiButtons);

    gameManager.gameClock                   = GameClock.create(globals);
    gameManager.gameLighting                = GameLighting.create(globals, gameManager);

    gameManager.ecDebugDrawFlags            = {};
    gameManager.activeECMasks               = {};

    gameManager.profileECs                  = false;

    gameManager.reset();

    gameManager.gameSoundManager            = GameSoundManager.create(globals, gameManager);
    gameManager.gameParticleManager         = GameParticleManager.create(globals, gameManager);

    gameManager.entityFactory               = EntityFactory.create(globals, gameManager);
    gameManager.blockFactory                = BlockFactory.create(globals, gameManager);
    gameManager.effectFactory               = EffectFactory.create(globals, gameManager);

    gameManager.birdManager                 = new BirdManager(globals);
    gameManager.collisions                  = new Collisions(globals);
    gameManager.cloudManager                = new CloudManager(globals);

    gameManager.gameSpaceMigrationRequests  = [];
    gameManager.numGameSpaceMigrations      = 0;

    gameManager.activeGameState             = null;
    gameManager.musicString = null;

    // Performance
    gameManager.minMsPerFrameInGame         = null;
    gameManager.maxMsPerFrameInGame         = null;
    gameManager.numberOfFramesInGame        = 0;
    gameManager.cumulativeMsPerFrameInGame  = 0;

    gameManager.startUpLevelPath            = parameters.startUpLevelPath;

    gameManager.versionNumber               = parameters.versionNumber;
    gameManager.versionMessage              = parameters.versionMessage;

    gameManager.hasLoadedLevel              = false;

    gameManager.loadingCount                = 0;
    gameManager.savingCount                 = 0;

    gameManager.speedUpFactor               = 1.0;

    gameManager.variableStep                = Config.variableStep;

    gameManager.playFlags                   = PlayFlags.normal;

    //Level stuff.
    gameManager.currentLevelIndex           = 0;
    gameManager.levelInfos                  = [];
    gameManager.arcadeMode = false;
    gameManager.demoMode = demoMode;
    gameManager.editedGameState = false;

    gameManager.advSpeeds = [ "SLOW", "MEDIUM", "FAST", "INSTANT" ];
    gameManager.advSpeedsJA = [ "遅い", "普通", "速い", "瞬間" ];
    gameManager.advSpeedValues = [ 200, 100, 50, 1 ];

    // Language

    var language;
    if (('undefined' !== typeof window) &&
        ('string' === typeof window.language))
    {
        language = window.language;
        gameManager.enableLanguageSetting = false;
    }
    else
    {
        language = TurbulenzEngine.getSystemInfo().userLocale;
        gameManager.enableLanguageSetting = true;
        if (language)
        {
            language = language.slice(0, 2);
        }
    }
    if ("ja" !== language)
    {
        language = "en";
    }
    debug.assert(language);
    gameManager.languageCode = language;

    // Player Settings.  Attempt to retrieve from SaveData.

    var sd = globals.saveData;
    var savedConfig = {};
    sd.getUserConfig(savedConfig);

    savedConfig.controlInversionX = savedConfig.controlInversionX || false;
    savedConfig.controlInversionY = savedConfig.controlInversionY || false;
    savedConfig.audioSilence = savedConfig.audioSilence || false;
    savedConfig.audioMusicSilence = savedConfig.audioMusicSilence || false;
    savedConfig.audioVoicesSilence = savedConfig.audioVoicesSilence || false;

    var currentAdvSpeed = savedConfig.adventureSpeed;
    currentAdvSpeed = ("number" === typeof currentAdvSpeed &&
                       currentAdvSpeed < gameManager.advSpeeds.length) ?
        (currentAdvSpeed) : (1);
    savedConfig.adventureSpeed = currentAdvSpeed;

    gameManager.savedConfig = savedConfig;

    // TODO: Remove these and read everything from 'savedConfig'?

    gameManager.controlInversionX  = savedConfig.controlInversionX;
    gameManager.controlInversionY  = savedConfig.controlInversionY;
    gameManager.audioSilence       = savedConfig.audioSilence;
    gameManager.audioMusicSilence  = savedConfig.audioMusicSilence;
    gameManager.audioVoicesSilence = savedConfig.audioVoicesSilence;
    gameManager.targetVolume       = gameManager.audioSilence ? 0.0 : GameManager.sfxVolume;
    gameManager.targetMusicVolume  = gameManager.audioMusicSilence ? 0.0 : GameManager.musicVolume;
    gameManager.targetVoicesVolume = gameManager.audioVoicesSilence ? 0.0 : GameManager.voiceVolume;
    gameManager.currentAdvSpeed    = savedConfig.adventureSpeed;

    // Handle events from the game

    var evb = globals.eventBroadcast;
    evb.setPageEventHandler(function (eventObject) {

        var eventName = eventObject.event;
        var value;

        if ("setlanguage" === eventName)
        {
            value = eventObject.language;
            if (gameManager.getLanguage() !== value)
            {
                gameManager.toggleLanguage();
            }
        }
        else if ("enableinput" === eventName)
        {
            value = eventObject.enable;
            gameManager.enableInput(!!value);
        }
        else if ("pause" === eventName)
        {
            value = eventObject.enable;
            if (value)
            {
                if (gameManager.savedState)
                {
                    return;
                }

                gameManager.savedState = {
                    paused: gameManager.paused,
                    audioSilence: gameManager.audioSilence,
                    audioMusicSilence: gameManager.audioMusicSilence,
                    audioVoicesSilence: gameManager.audioVoicesSilence
                };

                if (!gameManager.paused)
                {
                    gameManager.togglePause();
                }
                if (!gameManager.audioSilence)
                {
                    gameManager.toggleAudioSilence();
                }
                if (!gameManager.audioMusicSilence)
                {
                    gameManager.toggleAudioMusicSilence();
                }
                if (!gameManager.audioVoicesSilence)
                {
                    gameManager.toggleAudioVoicesSilence();
                }

                // debug.assert(gameManager.paused);
                debug.assert(gameManager.audioSilence);
                debug.assert(gameManager.audioMusicSilence);
                debug.assert(gameManager.audioVoicesSilence);
            }
            else
            {
                // Restore state

                var savedState = gameManager.savedState;
                if (!savedState)
                {
                    return;
                }

                // debug.assert(gameManager.paused);
                debug.assert(gameManager.audioSilence);
                debug.assert(gameManager.audioMusicSilence);
                debug.assert(gameManager.audioVoicesSilence);

                if (!savedState.paused)
                {
                    gameManager.togglePause();
                }
                if (!savedState.audioSilence)
                {
                    gameManager.toggleAudioSilence();
                }
                if (!savedState.audioMusicSilence)
                {
                    gameManager.toggleAudioMusicSilence();
                }
                if (!savedState.audioVoicesSilence)
                {
                    gameManager.toggleAudioVoicesSilence();
                }

                gameManager.savedState = null;
            }
        }

    });

    // Initialize the score record code

    ECScore.initScoreRecords(sd);

    return gameManager;
};
