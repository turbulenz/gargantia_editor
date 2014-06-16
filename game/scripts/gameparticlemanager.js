//
//  GameParticleManager
//
//  Plays particles in space
//

/*global DefaultParticleRenderer: false*/

function GameParticleManager() {}

GameParticleManager.prototype =
{
    update : function gameParticleManagerUpdateFn()
    {
        var currentActiveParticleSystem;
        var particleSystemIndex;
        var particleSystemList     =   this.activeParticleSystemList;
        for (particleSystemIndex = 0; particleSystemIndex < particleSystemList.length;)
        {
            currentActiveParticleSystem = particleSystemList[particleSystemIndex];

            if (this.updateParticleSource(currentActiveParticleSystem))
            {
                particleSystemIndex += 1;
            }
            else
            {
                this.removeParticleSource(currentActiveParticleSystem);
                particleSystemList.splice(particleSystemIndex, 1);
            }
        }
    },

    initialize : function gameParticleManagerInitializeFn()
    {
        this.activeParticleSystemList = [];
        this.loadedArchetypes = {};

        var graphicsDevice = this.globals.graphicsDevice;
        var shaderManager = this.globals.shaderManager;
        var particleManager = this.globals.particleManager;

        particleManager.registerRenderer("alpha_lit", DefaultParticleRenderer.parseArchetype, DefaultParticleRenderer.compressArchetype, DefaultParticleRenderer.load, DefaultParticleRenderer.create.bind(null, graphicsDevice, shaderManager, "alpha_lit"), "default");

        particleManager.registerRenderer("additive_lit", DefaultParticleRenderer.parseArchetype, DefaultParticleRenderer.compressArchetype, DefaultParticleRenderer.load, DefaultParticleRenderer.create.bind(null, graphicsDevice, shaderManager, "additive_lit"), "default");

        particleManager.registerRenderer("opaque_lit", DefaultParticleRenderer.parseArchetype, DefaultParticleRenderer.compressArchetype, DefaultParticleRenderer.load, DefaultParticleRenderer.create.bind(null, graphicsDevice, shaderManager, "opaque_lit"), "default");

    },

    preload : function gameParticlemanagerPreloadFn()
    {
        this.loadArchetyes(false);
    },

    postload : function gameParticlemanagerPostloadFn()
    {
        this.loadArchetyes(true);
    },

    loadArchetyes : function gameParticleManagerLoadArchetypesFn(delayedLoad)
    {
        var archetypes = GameParticleManager.archetypes;

        var propertyName;

        if (this.globals.particleManager)
        {
            for (propertyName in archetypes)
            {
                if (archetypes.hasOwnProperty(propertyName))
                {
                    this.loadArchetype(archetypes[propertyName], delayedLoad);
                }
            }
        }
    },

    loadArchetype : function gameParticleManagerLoadArchetypeFn(thisArchetype, delayedLoad)
    {
        if (thisArchetype.particles)
        {
            var archetypes  =   thisArchetype.particles;
            var propertyName;

            for (propertyName in archetypes)
            {
                if (archetypes.hasOwnProperty(propertyName))
                {
                    this.loadArchetype(archetypes[propertyName], delayedLoad);
                }
            }
        }
        else
        {
            var assetDelayed = thisArchetype.delayedLoad ? thisArchetype.delayedLoad : false;
            if (delayedLoad === assetDelayed)
            {
                //Request file. do something to it when it appears.
                this.loadArchetypeFromPath(thisArchetype.path);
            }
        }
    },

    loadArchetypeFromPath : function gameparticlemanagerLoadArchetypeFromPathFn(archetypePath)
    {
        var that = this;
        var onLoad = function onLoadFn(response, status /*, callContext*/)
        {
            if (status === 200)
            {
                that.parseArchetype(archetypePath, JSON.parse(response));
            }
            else
            {
                //Error.
            }
        };

        var globals            = this.globals;
        var mappingTable       = globals.mappingTable;
        var mappedParticlePath = mappingTable.getURL(archetypePath);

        var requestHandler     = globals.requestHandler;

        var params =
        {
            src : mappedParticlePath,
            onload : onLoad
        };

        requestHandler.request(params);
    },

    parseArchetype : function gameparticlemanagerParseArchetypeFn(archetypePath, archetypeData)
    {
        //Do the thing.
        var particleManager = this.globals.particleManager;

        var animations = archetypeData.animations;
        for (var i = 0 ; i < animations.length; i += 1)
        {
            particleManager.registerParticleAnimation(animations[i]);
        }
        var archetype = particleManager.deserializeArchetype(archetypeData.serialisedArchetype);
        // Load all assets required to create and work with the particle system archetypes we're using.

        var onLoad = function ()
        {
            this.loadedArchetypes[archetypePath] = archetype;
        }.bind(this);

        particleManager.loadArchetype(archetype, onLoad);
    },

    extractParametersToPlay : function gameParticleManagerExtractParametersToPlayFn(particleName)
    {
        var thisArchetype   =   GameParticleManager.archetypes[particleName];

        if (thisArchetype.random)
        {
            var random_index = Math.random() * (thisArchetype.particles.length - 0.1);
            random_index = Math.floor(random_index);
            return  thisArchetype.particles[random_index];
        }

        return  thisArchetype;
    },

    playParticleOnSource : function gameParticleManagerPlayParticleOnSourceFn(newSource, particleData, particleName, v3InitialLocation, gameEntity, scale, offset, rotation)
    {
        var md = this.globals.mathDevice;
        var renderer = this.globals.renderer;

        newSource.particleName  = particleName;
        newSource.gameEntityName = gameEntity ? gameEntity.getName() : undefined;
        newSource.gameEntity = gameEntity;

        if (particleData.duration)
        {
            newSource.stopTime = this.globals.gameCurrentTime + particleData.duration;
        }

        //Make a particle here.
        var particleManager = this.globals.particleManager;
        var particleArchetype = this.loadedArchetypes[particleData.path];

        if (particleArchetype)
        {
            newSource.instance = particleManager.createInstance(particleArchetype, undefined, renderer.globalTechniqueParametersArray);

            newSource.v3Location = md.v3Copy(v3InitialLocation);
            newSource.v3Scale = scale ? md.v3Copy(scale) : undefined;
            newSource.v3Offset = offset ? md.v3Copy(offset) : undefined;
            newSource.m33Rotation = rotation ? md.m33Copy(rotation) : undefined;
            this.updateParticleSource(newSource);

            particleManager.addInstanceToScene(newSource.instance);
        }

        this.activeParticleSystemList.push(newSource);
    },

    getParticleSource : function gameparticlemanagerGetParticleSourceFn()
    {
        return {};
    },

    playInternal : function gameParticleManagerPlayInternalFn(particleName, v3Location, gameEntity, nameID, scale, offset, rotation)
    {
        var particleData  =   this.extractParametersToPlay(particleName);

        var newSource   =   this.getParticleSource(/*archetype.priority*/);

        newSource.nameID = nameID;

        this.playParticleOnSource(newSource, particleData, particleName, v3Location, gameEntity, scale, offset, rotation);
    },

    stopInternal : function gameParticleManagerStopInternalFn(particleName, gameEntity)
    {
        var gameEntityName = gameEntity ? gameEntity.getName() : undefined;
        var currentActiveParticleSystem;
        var particleSystemIndex;
        var particleSystemList     =   this.activeParticleSystemList;
        for (particleSystemIndex = 0; particleSystemIndex < particleSystemList.length; particleSystemIndex += 1)
        {
            currentActiveParticleSystem = particleSystemList[particleSystemIndex];

            if (currentActiveParticleSystem.particleName    ===   particleName)
            {
                if (currentActiveParticleSystem.gameEntityName === gameEntityName)
                {
                    if (!currentActiveParticleSystem.stopping)
                    {
                        this.removeParticleSource(currentActiveParticleSystem);
                        particleSystemList.splice(particleSystemIndex, 1);
                        return;
                    }
                }
            }
        }
    },

    stopByNameID : function gameParticleManagerStopInternalFn(nameID, fadeTime)
    {
        var currentActiveParticle;
        var particleIndex;
        var particleSystemList     =   this.activeParticleSystemList;
        for (particleIndex = particleSystemList.length - 1; particleIndex >= 0; particleIndex -= 1)
        {
            currentActiveParticle = particleSystemList[particleIndex];

            if (currentActiveParticle.nameID === nameID)
            {
                if (!currentActiveParticle.stopping)
                {
                    currentActiveParticle.stopping = true;

                    if (fadeTime > 0.0)
                    {
                        currentActiveParticle.fadeTime         =   fadeTime;
                        currentActiveParticle.startFadeTime    =   fadeTime;
                    }
                    else
                    {
                        currentActiveParticle.soundSource.stop();
                        this.removeActiveSoundByIndex(particleIndex);
                    }
                }
            }
        }
    },

    setLocationByNameID : function gameParticleManagerSetLocationByNameID(nameID, v3Location)
    {
        var md = this.globals.mathDevice;

        var currentActiveParticle;
        var particleIndex;
        var particleSystemList     =   this.activeParticleSystemList;
        for (particleIndex = particleSystemList.length - 1; particleIndex >= 0; particleIndex -= 1)
        {
            currentActiveParticle = particleSystemList[particleIndex];

            if (currentActiveParticle.nameID === nameID)
            {
                currentActiveParticle.v3Location = md.v3Copy(v3Location, currentActiveParticle.v3Location);
            }
        }
    },

    play : function gameParticleManagerPlayParticleFn(particleName, v3Location, gameEntity, nameID)
    {
        if (!particleName)
        {
            return;
        }

        // if (gameEntity && gameEntity.isManagedByThisMachine())
        // {
        //     var md              =   this.globals.mathDevice;
        //     var actionManager    =   this.gameManager.actionManager;
        //     actionManager.addAction('ParticleEffect',
        //         {
        //             particleName : particleName,
        //             v3Location : v3Location ? md.v3Copy(v3Location) : undefined,
        //             gameEntity : gameEntity
        //         });
        // }
        // else
        // {
        this.playInternal(particleName, v3Location, gameEntity, nameID);
        //}
    },

    stop : function gameParticleManagerStopFn(particleName, gameEntity, fadeTime)
    {
        if (!particleName)
        {
            return;
        }

        // if (gameEntity && gameEntity.isManagedByThisMachine())
        // {
        //     var actionManager    =   this.gameManager.actionManager;
        //     actionManager.addAction('StopParticleEffect',
        //         {
        //             particleName : particleName,
        //             gameEntity : gameEntity,
        //             fadeTime : fadeTime
        //         });
        // }
        // else
        // {
        this.stopInternal(particleName, gameEntity, fadeTime);
        //}
    },

    stopAllParticles : function gameParticleManagerStopAllParticlesFn()
    {
        var currentActiveParticleSystem;
        var particleSystemIndex;
        var particleSystemList     =   this.activeParticleSystemList;

        for (particleSystemIndex = particleSystemList.length - 1; particleSystemIndex >= 0; particleSystemIndex -= 1)
        {
            currentActiveParticleSystem = particleSystemList[particleSystemIndex];
            if (currentActiveParticleSystem)
            {
                this.removeParticleSource(currentActiveParticleSystem);
                particleSystemList.splice(particleSystemIndex, 1);
            }
        }
    },

    updateParticleSource : function gameParticleManagerupdateParticleSourceFn(particleSourceObject)
    {
        //var sr = this.globals.simpleSpriteRenderer;
        var md = this.globals.mathDevice;

        if (particleSourceObject.gameEntity)
        {
            particleSourceObject.v3Location = md.v3Copy(particleSourceObject.gameEntity.getv3Location(), particleSourceObject.v3Location);
        }

        var renderable = particleSourceObject.instance.renderable;
        var transform = renderable.getLocalTransform();
        var v3Loc = particleSourceObject.v3Location;
        var v3Scale = particleSourceObject.v3Scale;
        md.m43BuildIdentity(transform);
        if (v3Scale)
        {
            transform[0] = v3Scale[0];
            transform[4] = v3Scale[1];
            transform[8] = v3Scale[2];
        }
        var m33Rotation = particleSourceObject.m33Rotation;
        if (m33Rotation)
        {
            md.m43MulM33(transform, m33Rotation, transform);
        }
        transform[9]  = v3Loc[0];
        transform[10] = v3Loc[1];
        transform[11] = v3Loc[2];
        var v3Offset = particleSourceObject.v3Offset;
        if (v3Offset)
        {
            transform[9]  += transform[0] * v3Offset[0];
            transform[10] += transform[4] * v3Offset[1];
            transform[11] += transform[8] * v3Offset[2];
        }
        renderable.setLocalTransform(transform);

        // sr.addSprite(
        // {
        //     v3Location : particleSourceObject.v3Location,
        //     size : 0.5,
        //     blendStyle : SimpleBlendStyle.prototype.blendStyle.ADD,
        //     texture : 'textures/simple_square.dds',
        //     v4color : guiColors.whiteHalf
        // });

        if (particleSourceObject.endTime !== undefined)
        {
            return this.globals.gameCurrentTime < particleSourceObject.endTime;
        }
        else
        {
            if (particleSourceObject.stopTime !== undefined)
            {
                if (this.globals.gameCurrentTime > particleSourceObject.stopTime)
                {
                    particleSourceObject.endTime = this.globals.gameCurrentTime + this.helperStopEmitters(particleSourceObject);
                }
            }
        }
        return  true;
    },

    helperStopEmitters : function gameparticlemanagerHelperStopEmittersFn(particleSourceObject)
    {
        var longestParticleLifetime = 0.0;
        var emitters                = particleSourceObject.instance.synchronizer.emitters;
        var emittersLength          = emitters.length;

        for (var emittersIndex = 0; emittersIndex < emittersLength; emittersIndex += 1)
        {
            emitters[emittersIndex].disable();
            //Get the longest life of the particle.
            longestParticleLifetime = Math.max(longestParticleLifetime, emitters[emittersIndex].getMaxLifeTime());
        }
        return longestParticleLifetime;
    },

    removeParticleSource : function gameparticlemanagerRemoveParticleSourceFn(particleSourceObject)
    {
        if (particleSourceObject.removed)
        {
            return;
        }

        var particleManager = this.globals.particleManager;
        particleManager.removeInstanceFromScene(particleSourceObject.instance);

        particleSourceObject.removed = true;
    },

    destroy : function gameParticleManagerDestroyFn()
    {
        var currentActiveParticleSystem;
        var particleSystemIndex;
        var particleSystemList     =   this.activeParticleSystemList;
        for (particleSystemIndex = 0; particleSystemIndex < particleSystemList.length; particleSystemIndex += 1)
        {
            currentActiveParticleSystem = particleSystemList[particleSystemIndex];

            currentActiveParticleSystem.particleSource.stop();
        }

        //More cleanup ?
        this.activeParticleSystemList.length   =   0;
    }
};

GameParticleManager.archetypes =   {};

GameParticleManager.create = function gameParticleManagerCreateFn(globals, gameManager)
{
    var gameParticleManager                =   new GameParticleManager();

    gameParticleManager.globals            =   globals;
    gameParticleManager.gameManager        =   gameManager;

    gameParticleManager.initialize();

    return gameParticleManager;
};
