/*jshint bitwise: false*/
/*global debug: false*/

//
//  GameSoundManager
//
//  Plays sounds in space, on entities and deals with cross network stuff!
//

function GameSoundManager() {}

GameSoundManager.prototype =
{
    localDepotSize : 32,
    globalDepotSize : 16,

    update : function gameSoundManagerUpdateFn()
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length;)
        {
            currentActiveSound = soundSourceList[soundIndex];

            if (this.updateSoundSource(currentActiveSound))
            {
                soundIndex += 1;
            }
            else
            {
                this.removeActiveSoundByIndex(soundIndex);
            }
        }

        this.updateListener();
    },

    updateListener : function gamesoundmanagerUpdateListenerFn()
    {
        //Update listener.
        var camera = this.globals.camera;
        var sd     = this.globals.soundDevice;

        var md = this.globals.mathDevice;

        this.listenerMatrix = md.m43Copy(camera.matrix, this.listenerMatrix);

        if (this.listenerv3WorldLocation)
        {
            md.m43SetPos(this.listenerMatrix, this.listenerv3WorldLocation);
        }

        if (sd)
        {
            sd.listenerTransform = this.listenerMatrix;
        }
    },

    setListenerWorldLocation : function gamesoundmanagerSetListenerWorldLocationFn(v3WorldLocation)
    {
        var md = this.globals.mathDevice;
        this.listenerv3WorldLocation = md.v3Copy(v3WorldLocation, this.listenerv3WorldLocation);
    },

    initialize : function gameSoundManagerInitializeFn()
    {
        var globals = this.globals;
        var soundDevice = globals.soundDevice;
        var localDepot = [];
        this.localSoundSourceDepot = localDepot;
        var globalDepot = [];
        this.globalSoundSourceDepot = globalDepot;

        this.soundExtension     = '';

        var i;

        if (soundDevice)
        {
            for (i = 0; i < this.localDepotSize; i += 1)
            {
                localDepot[i] = soundDevice.createSource({});
            }

            for (i = 0; i < this.globalDepotSize; i += 1)
            {
                globalDepot[i] = soundDevice.createGlobalSource({});
            }

            if (soundDevice.isSupported("FILEFORMAT_OGG"))
            {
                this.soundExtension = '.ogg';
            }
            else if (soundDevice.isSupported("FILEFORMAT_MP3"))
            {
                this.soundExtension = '.mp3';
            }

            var archetypes = GameSoundManager.archetypes;
            var propertyName;
            var thisArchetype;

            for (propertyName in archetypes)
            {
                if (archetypes.hasOwnProperty(propertyName))
                {
                    thisArchetype = archetypes[propertyName];

                    if (thisArchetype.sounds)
                    {
                        var soundsArchetypes  =  thisArchetype.sounds;
                        var soundArchetype;
                        var soundName;

                        for (soundName in soundsArchetypes)
                        {
                            if (soundsArchetypes.hasOwnProperty(soundName))
                            {
                                soundArchetype = soundsArchetypes[soundName];
                                soundArchetype.path = soundArchetype.path.replace(".ogg", "");
                                soundArchetype.path = soundArchetype.path + this.soundExtension;
                            }
                        }
                    }
                    else
                    {
                        thisArchetype.path = thisArchetype.path.replace(".ogg", "");
                        thisArchetype.path = thisArchetype.path + this.soundExtension;

                        if (thisArchetype.tarfile)
                        {
                            thisArchetype.tarfile =
                                thisArchetype.tarfile.replace(".ogg.tar", this.soundExtension + ".tar");
                        }
                    }
                }
            }
        }

        this.activeSoundSourceList = [];
    },

    getSoundsEnabled : function gamesoundmanagerGetSoundsEnabledFn()
    {
        return this.soundEnabled;
    },

    setSoundsEnabled : function gamesoundmanagerSetSoundsEnabledFn(active)
    {
        this.soundEnabled = active;
        this.globals.settings.volume = this.soundEnabled ? 1.0 : 0.0;
    },

    preload : function gamesoundmanagerPreloadFn()
    {
        this.loadArchetyes(false);
    },

    postload : function gamesoundmanagerPostloadFn()
    {
        this.loadArchetyes(true);
    },

    loadArchetyes : function gameSoundManagerLoadArchetypesFn(delayedLoad)
    {
        var archetypes = GameSoundManager.archetypes;

        var propertyName;

        if (this.globals.soundDevice)
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

    loadArchetype : function gameSoundManagerLoadArchetypeFn(thisArchetype, delayedLoad)
    {
        var sm  =   this.soundManager;
        debug.assert((!thisArchetype.global || !thisArchetype.relative));

        if (thisArchetype.sounds)
        {
            var archetypes  =   thisArchetype.sounds;
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
                if (thisArchetype.tarfile)
                {
                    sm.loadArchive(thisArchetype.tarfile, false,
                                   undefined, undefined,
                                   CutScene.Player.archiveDecode);
                }
                else
                {
                    sm.load(thisArchetype.path);
                }
            }
        }
    },

    extractParametersToPlay : function gameSoundManagerExtractParametersToPlayFn(soundName)
    {
        var thisArchetype   =   GameSoundManager.archetypes[soundName];

        if (thisArchetype.random)
        {
            var random_index = Math.random() * (thisArchetype.sounds.length - 0.1);
            random_index = Math.floor(random_index);
            return  thisArchetype.sounds[random_index];
        }

        return  thisArchetype;
    },

    getSoundSource : function gameSoundManagerGetSoundSourceFn(global, priority)
    {
        //Grab a free one.
        var soundSourceDepot = global ? this.globalSoundSourceDepot : this.localSoundSourceDepot;
        if (soundSourceDepot.length > 0)
        {
            return soundSourceDepot.pop();
        }

        //End a less important sound.
        var soundSource;
        var soundSourceList = this.activeSoundSourceList;
        var soundSourceListLength = soundSourceList.length;
        var soundSourceListIndex;

        var lowestFoundPriority = Number.MAX_VALUE;
        var lowestPriorityIndex = 0;

        for (soundSourceListIndex = 0; soundSourceListIndex < soundSourceListLength; soundSourceListIndex += 1)
        {
            soundSource = soundSourceList[soundSourceListIndex];
            if (soundSource.global === global &&
                (soundSource.priority < lowestFoundPriority) &&
                (soundSource.priority <= priority))
            {
                lowestFoundPriority = soundSource.priority;
                lowestPriorityIndex = soundSourceListIndex;
            }
        }

        if (lowestPriorityIndex !== undefined)
        {
            this.removeActiveSoundByIndex(lowestPriorityIndex);
            return soundSourceDepot.pop();
        }

        return null;
    },

    returnSoundSource : function gameSoundManagerReturnSoundSourceFn(soundSource, global)
    {
        if (global)
        {
            this.globalSoundSourceDepot.push(soundSource);
        }
        else
        {
            this.localSoundSourceDepot.push(soundSource);
        }
    },

    removeActiveSoundByIndex : function gameSoundManagerRemoveActiveSoundByIndex(soundIndex)
    {
        var currentActiveSound  =   this.activeSoundSourceList[soundIndex];

        this.returnSoundSource(currentActiveSound.soundSource, currentActiveSound.global);

        this.activeSoundSourceList.splice(soundIndex, 1);
    },

    playSoundOnSource : function gameSoundManagerPlaySoundOnSourceFn(soundSource, soundPath, volume, loop, listenerRelative, v3Location, maxDistance)
    {
        var sm                      =   this.soundManager;
        var md                      =   this.globals.mathDevice;
        var globalVolume            =   this.globals.settings.volume;
        var sound;

        if (soundSource && soundPath && sm)
        {
            if (sm.isSoundLoaded(soundPath))
            {
                soundSource.gain     = volume * globalVolume;
                soundSource.looping  = loop;
                soundSource.relative = listenerRelative;

                if (!soundSource.relative && v3Location)
                {
                    soundSource.position    =   v3Location;
                }
                else
                {
                    soundSource.position    =   md.v3BuildZero();
                }
                soundSource.maxDistance = maxDistance;

                sound = sm.get(soundPath);

                if (sound)
                {
                    soundSource.play(sound);
                    return  true;
                }
            }
        }
        return  false;
    },

    playSoundOnGlobalSource : function gameSoundManagerPlaySoundOnGlobalSourceFn(soundSource, soundPath, volume, loop)
    {
        var sm                      =   this.soundManager;
        //var md                      =   this.globals.mathDevice;
        var globalVolume            =   this.globals.settings.volume;
        var sound;

        if (soundSource && soundPath && sm)
        {
            if (sm.isSoundLoaded(soundPath))
            {
                soundSource.gain     = volume * globalVolume;
                soundSource.looping  = loop;

                sound = sm.get(soundPath);

                if (sound)
                {
                    soundSource.play(sound);
                    return  true;
                }
            }
        }
        return  false;
    },

    playInternal : function gameSoundManagerPlayInternalFn(soundName, v3Location, guid, volume)
    {
        var params  =   this.extractParametersToPlay(soundName);
        var newSource;

        newSource = this.getSoundSource(params.global, params.priority | 0);

        var listenerRelative = false;
        var v3InitialLocation;

        if (!params.global)
        {
            listenerRelative = v3Location ? false : true;

            if (!listenerRelative)
            {
                v3InitialLocation = v3Location;
            }
        }

        var initialVolume = volume !== undefined ? volume : 1;
        var maxDistance = params.maxDistance !== undefined ?  params.maxDistance : 10000; // 10000 is WebAudio default for PannerNode

        if (params.global ?
            this.playSoundOnGlobalSource(newSource, params.path, params.volume * initialVolume, params.loop) :
            this.playSoundOnSource(newSource, params.path, params.volume * initialVolume, params.loop, listenerRelative, v3InitialLocation, maxDistance))
        {
            this.attachSource(newSource, v3Location, guid, soundName, params.volume, params.priority, params.global, initialVolume);
            newSource.soundName =   soundName;
            return true;
        }
        else
        {
            this.returnSoundSource(newSource, params.global);
            return false;
        }
    },

    stopInternal : function gameSoundManagerStopInternalFn(soundName, guid, fadeTime)
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length; soundIndex += 1)
        {
            currentActiveSound = soundSourceList[soundIndex];

            if (currentActiveSound.soundName === soundName)
            {
                if (currentActiveSound.guid === guid)
                {
                    if (!currentActiveSound.stopping)
                    {
                        currentActiveSound.stopping = true;

                        if (fadeTime > 0.0)
                        {
                            currentActiveSound.fadeTime         =   fadeTime;
                            currentActiveSound.startFadeTime    =   fadeTime;
                        }
                        else
                        {
                            currentActiveSound.soundSource.stop();
                            this.removeActiveSoundByIndex(soundIndex);
                        }
                        return;
                    }
                }
            }
        }
    },

    setVolumeInternal : function gameSoundManagerSetVolumeInternalFn(soundName, guid, volume, fadeTime)
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length; soundIndex += 1)
        {
            currentActiveSound = soundSourceList[soundIndex];

            if (currentActiveSound.soundName === soundName)
            {
                if (currentActiveSound.guid === guid)
                {
                    currentActiveSound.oldVolumeFactor              = currentActiveSound.currentVolumeFactor;
                    currentActiveSound.newVolumeFactor              = volume;
                    currentActiveSound.newVolumeFactorFadeTime      = fadeTime;
                    currentActiveSound.newVolumeFactorStartFadeTime = fadeTime;
                }
            }
        }
    },

    play : function gameSoundManagerPlaySoundFn(soundName, v3Location, guid, volume)
    {
        if (!soundName || !this.globals.soundDevice)
        {
            return false;
        }
        return this.playInternal(soundName, v3Location, guid, volume);
    },

    setVolume : function eCSoundSetVolumeFn(soundName, guid, volume, fadeTime)
    {
        if (!soundName)
        {
            return;
        }

        this.setVolumeInternal(soundName, guid, volume, fadeTime);
    },

    setPitch : function setPitch(soundName, guid, pitch)
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length; soundIndex += 1)
        {
            currentActiveSound = soundSourceList[soundIndex];

            if (currentActiveSound.soundName === soundName)
            {
                if (currentActiveSound.guid === guid)
                {
                    currentActiveSound.soundSource.pitch = pitch;
                }
            }
        }
    },

    setPosition : function setPosition(soundName, guid, position)
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length; soundIndex += 1)
        {
            currentActiveSound = soundSourceList[soundIndex];

            if (currentActiveSound.soundName === soundName)
            {
                if (currentActiveSound.guid === guid)
                {
                    currentActiveSound.soundSource.position = position;
                }
            }
        }
    },

    stop : function eCSoundStopFn(soundName, guid, fadeTime)
    {
        if (!soundName)
        {
            return;
        }

        this.stopInternal(soundName, guid, fadeTime);
    },

    stopAllSounds : function gameSoundManagerStopAllSoundsFn(fadeTime)
    {
        this.gameManager.stopMusic();

        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;

        for (soundIndex = soundSourceList.length - 1; soundIndex >= 0; soundIndex -= 1)
        {
            currentActiveSound = soundSourceList[soundIndex];
            if (currentActiveSound)
            {
                if (fadeTime > 0.0)
                {
                    currentActiveSound.fadeTime         =   fadeTime;
                    currentActiveSound.startFadeTime    =   fadeTime;
                }
                else
                {
                    currentActiveSound.soundSource.stop();
                    this.removeActiveSoundByIndex(soundIndex);
                }
            }
        }
    },

    pauseNonMusic : function gameSoundManagerPauseNonMusicFn()
    {
        var currentActiveSound;
        var soundIndex;
        var archetypes = GameSoundManager.archetypes;
        var soundSourceList = this.activeSoundSourceList;

        for (soundIndex = soundSourceList.length - 1; soundIndex >= 0; soundIndex -= 1)
        {
            currentActiveSound = soundSourceList[soundIndex];
            if (!archetypes[currentActiveSound.soundName].music)
            {
                currentActiveSound.soundSource.pause();
            }
        }
    },

    resumeNonMusic : function gameSoundManagerResumeNonMusicFn()
    {
        var currentActiveSound;
        var soundIndex;
        var archetypes = GameSoundManager.archetypes;
        var soundSourceList = this.activeSoundSourceList;

        for (soundIndex = soundSourceList.length - 1; soundIndex >= 0; soundIndex -= 1)
        {
            currentActiveSound = soundSourceList[soundIndex];
            if (!archetypes[currentActiveSound.soundName].music)
            {
                currentActiveSound.soundSource.resume();
            }
        }
    },

    attachSource : function gameSoundManagerAttachSourceFn(soundSource, v3Location, guid, soundName, volume, priority, global, initialVolume)
    {
        //var md  =   this.globals.mathDevice;

        this.activeSoundSourceList.push(
            {
                soundSource : soundSource,
                v3Location : v3Location,
                guid : guid,
                soundName : soundName,
                originalVolume : volume,
                currentVolumeFactor : initialVolume,
                priority : priority !== undefined ? priority : 0,
                global : global ? true : false
            });
    },

    updateSoundSource : function gameSoundManagerUpdateSoundSourceFn(soundSourceObject)
    {
        var md  =   this.globals.mathDevice;
        var blendFactor;
        var globalVolume;

        if (GameSoundManager.archetypes[soundSourceObject.soundName].music)
        {
            globalVolume = this.globals.settings.musicVolume;
        }
        else
        {
            globalVolume = this.globals.settings.volume;
        }

        if (!soundSourceObject.soundSource.playing)
        {
            return  false;
        }

        var volumeFactor  = soundSourceObject.currentVolumeFactor;

        if (soundSourceObject.startFadeTime !== undefined)
        {
            soundSourceObject.fadeTime  -=  this.globals.gameTimeStep;
            if (soundSourceObject.fadeTime <= 0.0)
            {
                soundSourceObject.soundSource.stop();
            }
            else
            {
                volumeFactor   *=   (soundSourceObject.fadeTime / soundSourceObject.startFadeTime);
            }
        }

        if (soundSourceObject.newVolumeFactor !== undefined)
        {
            soundSourceObject.newVolumeFactorFadeTime  -=  this.globals.gameTimeStep;

            if (soundSourceObject.newVolumeFactorFadeTime <= 0.0)
            {
                volumeFactor  = soundSourceObject.newVolumeFactor;
                soundSourceObject.newVolumeFactor =   undefined;
            }
            else
            {
                blendFactor = md.saturate(1.0 - (soundSourceObject.newVolumeFactorFadeTime / soundSourceObject.newVolumeFactorStartFadeTime));

                volumeFactor  =   md.lerp(soundSourceObject.oldVolumeFactor, soundSourceObject.newVolumeFactor, blendFactor);
            }
        }

        soundSourceObject.currentVolumeFactor = volumeFactor;

        var oldGain = soundSourceObject.soundSource.gain;
        var newGain = volumeFactor * soundSourceObject.originalVolume * globalVolume;
        if (!newGain ||
            Math.abs(newGain - oldGain) > 0.009)
        {
            soundSourceObject.soundSource.gain    = newGain;
        }

        /*
        if (!soundSourceObject.soundSource.relative)
        {
            if (!soundSourceObject.v3Location || !md.v3Equal(soundSourceObject.gameEntity.getv3Location(), soundSourceObject.v3Location))
            {
                soundSourceObject.v3Location           = md.v3Copy(soundSourceObject.gameEntity.getv3Location(), soundSourceObject.v3Location);
                soundSourceObject.soundSource.position = soundSourceObject.v3Location;
            }
        }*/

        return  true;
    },

    destroy : function gameSoundManagerDestroyFn()
    {
        var currentActiveSound;
        var soundIndex;
        var soundSourceList     =   this.activeSoundSourceList;
        for (soundIndex = 0; soundIndex < soundSourceList.length; soundIndex += 1)
        {
            currentActiveSound = soundSourceList[soundIndex];

            currentActiveSound.soundSource.stop();
        }

        //More cleanup ?
        this.activeSoundSourceList.length   =   0;
        this.localSoundSourceDepot.length = 0;
        this.globalSoundSourceDepot.length = 0;
    }
};

GameSoundManager.archetypes =   {};

GameSoundManager.create = function gameSoundManagerCreateFn(globals, gameManager)
{
    var gameSoundManager                =   new GameSoundManager();

    gameSoundManager.globals            =   globals;
    gameSoundManager.gameManager        =   gameManager;

    gameSoundManager.soundManager       =   globals.soundManager;

    gameSoundManager.initialize();

    return gameSoundManager;
};
