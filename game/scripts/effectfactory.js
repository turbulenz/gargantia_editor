//
//  EffectFactory
//  AI effects on demand!
//

/*global EntityComponentBase: false*/
/*global debug: false*/
/*global VisualEffect: false*/
/*global ScreenShakes: false*/
/*global Slomo: false*/
/*global TWEEN: false*/

function EffectFactory() {}

EffectFactory.prototype =
{
    createVisualEffectInstance : function effectFactoryGetEffectInstanceFn(parameters)
    {
        var effectParameters    =   VisualEffect.archetypes[parameters.archetype];

        return VisualEffect.create(this.globals, effectParameters, parameters.v3Location, parameters.v3Direction);
    },

    createEffectInstance : function effectFactoryGetEffectInstanceFn(parameters)
    {
        var effectArchetype   =   EffectFactory.archetypes[parameters.archetype];
        var md = this.globals.mathDevice;

        var nameID = 'eID' + this.eID + parameters.archetype;
        this.eID += 1;

        //effectArchetype
        //
        //v3Location
        //v3Direction
        //gameEntity

        var visualEffectParameters;
        if (effectArchetype.visualEffectArchetype)
        {
            visualEffectParameters        =   VisualEffect.archetypes[effectArchetype.visualEffectArchetype];
            VisualEffect.create(this.globals,
                                visualEffectParameters,
                                parameters.v3Location ? md.v3Copy(parameters.v3Location) : undefined,
                                parameters.v3Direction ? md.v3Copy(parameters.v3Direction) : undefined,
                                parameters.gameEntity,
                                parameters.v2ScreenLocation ? md.v3Copy(parameters.v2ScreenLocation) : undefined,
                                parameters.scale,
                                parameters.timeDilation);
        }

        var visualEffectArchetypeList   =   effectArchetype.visualEffectArchetypeList;
        if (visualEffectArchetypeList)
        {
            var visualEffectArchetypeListLength = visualEffectArchetypeList.length;
            var visualEffectArchetypeListIndex;

            for (visualEffectArchetypeListIndex = 0; visualEffectArchetypeListIndex < visualEffectArchetypeListLength; visualEffectArchetypeListIndex += 1)
            {
                visualEffectParameters        =   VisualEffect.archetypes[visualEffectArchetypeList[visualEffectArchetypeListIndex]];
                VisualEffect.create(this.globals,
                                    visualEffectParameters,
                                    parameters.v3Location ? md.v3Copy(parameters.v3Location) : undefined,
                                    parameters.v3Direction ? md.v3Copy(parameters.v3Direction) : undefined,
                                    parameters.gameEntity,
                                    parameters.v2ScreenLocation ? md.v3Copy(parameters.v2ScreenLocation) : undefined,
                                    parameters.scale,
                                    parameters.timeDilation);
            }
        }

        //SOUNDS
        var gameSoundManager;
        if (effectArchetype.soundEffectArchetype)
        {
            gameSoundManager    =   this.gameManager.gameSoundManager;
            gameSoundManager.playInternal(
                effectArchetype.soundEffectArchetype,
                parameters.v3Location,
                nameID,
                1);
        }

        var soundEffectArchetypeList = effectArchetype.soundEffectArchetypeList;
        if (soundEffectArchetypeList)
        {
            var soundEffectArchetypeListLength = soundEffectArchetypeList.length;
            gameSoundManager    =   this.gameManager.gameSoundManager;

            for (var soundEffectArchetypeListIndex = 0; soundEffectArchetypeListIndex < soundEffectArchetypeListLength; soundEffectArchetypeListIndex += 1)
            {
                gameSoundManager.playInternal(
                    soundEffectArchetypeList[soundEffectArchetypeListIndex],
                    parameters.v3Location,
                    nameID,
                    1);
            }
        }

        //NU PARTICLES
        var gameParticleManager;
        if (effectArchetype.particleArchetype)
        {
            gameParticleManager    =   this.gameManager.gameParticleManager;
            gameParticleManager.playInternal(
                effectArchetype.particleArchetype,
                parameters.v3Location,
                parameters.gameEntity,
                nameID,
                parameters.scale,
                parameters.offset,
                parameters.rotation);
        }

        var particleArchetypeList = effectArchetype.particleArchetypeList;
        if (particleArchetypeList)
        {
            var particleArchetypeListLength = particleArchetypeList.length;
            gameParticleManager    =   this.gameManager.gameParticleManager;

            for (var particleArchetypeListIndex = 0; particleArchetypeListIndex < particleArchetypeListLength; particleArchetypeListIndex += 1)
            {
                gameParticleManager.playInternal(
                    particleArchetypeList[particleArchetypeListIndex],
                    parameters.v3Location,
                    parameters.gameEntity,
                    nameID);
            }
        }

        //Screen shake
        var gameCamera;
        var guiRenderer;
        var screenShakeParameters;
        if (effectArchetype.screenShakeArchetype)
        {
            gameCamera            = this.gameManager.getGameCamera();
            guiRenderer           = this.globals.guiRenderer;
            screenShakeParameters = ScreenShakes[effectArchetype.screenShakeArchetype];
            if (screenShakeParameters)
            {
                gameCamera.addShake(screenShakeParameters.strength, screenShakeParameters.duration);
                guiRenderer.addShake(screenShakeParameters.strength, screenShakeParameters.duration * 0.5);
            }
        }

        var slomo = effectArchetype.slomoArchetype;
        var slomoParams;
        if (slomo)
        {
            slomoParams = Slomo[slomo];
            this.slomo(slomoParams.dilation, slomoParams.duration);
        }

        return nameID;
    },

    slomo : function effectfactorySlomoFn(dilation, duration)
    {
        var gameManager = this.gameManager;

        TWEEN.Create({dilation : dilation})
        .to({dilation : 1.0}, duration)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function ()
            {
                gameManager.setSlomo(this.dilation);
            })
        .setAppTimeBased()
        .start();
    },

    endEffectByID : function effectfactoryEndEffectByIDFn(nameID)
    {
        var gameParticleManager = this.gameManager.gameParticleManager;
        gameParticleManager.stopByNameID(nameID);

        var gameSoundManager = this.gameManager.gameSoundManager;
        gameSoundManager.stopByNameID(nameID);
    },

    setLocationByNameID : function effectfactoryEndEffectByIDFn(nameID, v3Location)
    {
        var gameParticleManager = this.gameManager.gameParticleManager;
        gameParticleManager.setLocationByNameID(nameID, v3Location);

        // var gameSoundManager = this.gameManager.gameSoundManager;
        // gameSoundManager.setLocationByNameID(nameID, v3Location);
    },

    endEffectInstance : function effectfactoryEndEffectInstanceFn(parameters)
    {
        var effectArchetype   =   EffectFactory.archetypes[parameters.archetype];

        //effectArchetype
        //
        //v3Location
        //v3Direction
        //gameEntity

        // var visualEffectParameters;
        // if (effectArchetype.visualEffectArchetype)
        // {
        //     visualEffectParameters        =   VisualEffect.archetypes[effectArchetype.visualEffectArchetype];
        //     VisualEffect.create(this.globals, visualEffectParameters, parameters.v3Location, parameters.v3Direction);
        // }

        var gameSoundManager;
        if (effectArchetype.soundEffectArchetype)
        {
            gameSoundManager    =   this.gameManager.gameSoundManager;
            gameSoundManager.stopInternal(
                effectArchetype.soundEffectArchetype,
                parameters.gameEntity,
                parameters.fadeDuration !== undefined ? parameters.fadeDuration : 0.5);
        }

        var soundEffectArchetypeList = effectArchetype.soundEffectArchetypeList;
        if (soundEffectArchetypeList)
        {
            var soundEffectArchetypeListLength = soundEffectArchetypeList.length;
            gameSoundManager    =   this.gameManager.gameSoundManager;

            for (var soundEffectArchetypeListIndex = 0; soundEffectArchetypeListIndex < soundEffectArchetypeListLength; soundEffectArchetypeListIndex += 1)
            {
                gameSoundManager.stopInternal(
                    soundEffectArchetypeList[soundEffectArchetypeListIndex],
                    parameters.gameEntity,
                    parameters.fadeDuration !== undefined ? parameters.fadeDuration : 0.5);
            }
        }

        //NU PARTICLES
        var gameParticleManager;
        if (effectArchetype.particleArchetype)
        {
            gameParticleManager    =   this.gameManager.gameParticleManager;
            gameParticleManager.stopInternal(
                effectArchetype.particleArchetype,
                parameters.gameEntity,
                parameters.fadeDuration !== undefined ? parameters.fadeDuration : 0.5);
        }

        var particleArchetypeList = effectArchetype.particleArchetypeList;
        if (particleArchetypeList)
        {
            var particleArchetypeListLength = particleArchetypeList.length;
            gameParticleManager    =   this.gameManager.gameParticleManager;

            for (var particleArchetypeListIndex = 0; particleArchetypeListIndex < particleArchetypeListLength; particleArchetypeListIndex += 1)
            {
                gameParticleManager.stopInternal(
                    particleArchetypeList[particleArchetypeListIndex],
                    parameters.gameEntity,
                    parameters.fadeDuration !== undefined ? parameters.fadeDuration : 0.5);
            }
        }

        // var gameCamera;
        // var guiRenderer;
        // var screenShakeParameters;
        // if (effectArchetype.screenShakeArchetype)
        // {
        //     gameCamera            = this.gameManager.getGameCamera();
        //     guiRenderer           = this.globals.guiRenderer;
        //     screenShakeParameters = ScreenShakes[effectArchetype.screenShakeArchetype];
        //     if (screenShakeParameters)
        //     {
        //         gameCamera.addShake(screenShakeParameters.strength, screenShakeParameters.duration);
        //         guiRenderer.addShake(screenShakeParameters.strength, screenShakeParameters.duration * 0.5);
        //     }
        // }
    },

    play : function gameSoundManagerPlaySoundFn(effectName, v3Location, gameEntity, v3Direction, v2ScreenLocation, scale, timeDilation, offset, rotation)
    {
        if (!effectName)
        {
            return;
        }

        var md     = this.globals.mathDevice;
        var params =
        {
            archetype           :   effectName,
            v3Location          :   v3Location ? md.v3Copy(v3Location) : undefined,
            gameEntity          :   gameEntity,
            v3Direction         :   v3Direction,
            v2ScreenLocation    :   v2ScreenLocation,
            scale               :   scale,
            timeDilation        :   timeDilation,
            offset              :   offset,
            rotation            :   rotation
        };

        // var actionManager;
        // if (gameEntity && gameEntity.isManagedByThisMachine())
        // {
        //     actionManager       =   this.gameManager.getActionManager();
        //     actionManager.addAction('SpecialEffect', params);
        // }
        // else
        // {
        return this.createEffectInstance(params);
        //}
    },

    playPersistentEffect : function effectfactoryPlayPersistentEffectFn(effectArchetypeName, v3Location, gameEntity)
    {
        debug.assert(effectArchetypeName, 'Cannot create an effect entity without an archetype name.');
        debug.assert((v3Location || gameEntity), 'Cannot create an effect entity without a v3Location or parent entity.');

        var gameManager = this.gameManager;
        var entityFactory = gameManager.getEntityFactory();

        if (gameEntity)
        {
            v3Location = gameEntity.getv3Location();
        }

        var entity = entityFactory.createInactiveEntityInstance(effectArchetypeName, effectArchetypeName, v3Location);
        var entityName = entity.name;

        if (gameEntity)
        {
            var globals = this.globals;
            var entityECAttach = EntityComponentBase.createFromName('ECAttach', globals);
            entityECAttach.setParent(gameEntity);
            entity.addECToCustomEntity(entityECAttach);
        }

        entity.activate();

        return entityName;
    },

    stopPersistentEffect : function effectfactoryStopPersistentEffectFn(effectEntityName)
    {
        var gameManager = this.gameManager;
        var entity = gameManager.getGameEntityByName(effectEntityName);

        entity.setToBeDestroyed();
    },

    stop : function eCSoundStopFn(effectName, gameEntity, fadeTime)
    {
        if (!effectName)
        {
            return;
        }

        var params =
        {
            archetype   :   effectName,
            gameEntity  :   gameEntity,
            fadeDuration:   fadeTime
        };

        // var actionManager;
        // if (gameEntity && gameEntity.isManagedByThisMachine())
        // {
        //     actionManager    =   this.gameManager.actionManager;
        //     actionManager.addAction('EndSpecialEffect', params);
        // }
        // else
        // {
        this.endEffectInstance(params);
        //}
    },

    preload : function effectfactoryPreloadFn()
    {
        var tm         = this.globals.textureManager;
        var archetypes = VisualEffect.archetypes;

        var archetypeName;
        var archetype;

        // Load all textures up front
        for (archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetype   =   archetypes[archetypeName];
                if (archetype.texturePath)
                {
                    tm.load(archetype.texturePath);
                }
            }
        }
    }
};

EffectFactory.archetypes    =   {};
//
//  visualEffectArchetype
//  soundEffectArchetype
//  screenShakeArchetype
//

EffectFactory.create = function effectFactoryCreateFn(globals, gameManager)
{
    var effectFactory   =   new EffectFactory();

    effectFactory.globals     = globals;
    effectFactory.gameManager = gameManager;

    effectFactory.eID = 0;

    return effectFactory;
};
