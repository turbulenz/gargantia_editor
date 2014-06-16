//
//  EntityComponentBase
//
//  Base class for entity components.
//

/*global debug: false*/
/*global tzBaseObject: false*/
/*global VMath: false*/

var EntityComponentSortOrder   =
{
    SOCKETS         :   0,
    APPLY_FORCES    :   1,
    AI              :   2,
    MOVE_LOCATION   :   3,
    NORMAL          :   4,
    DRAW            :   5
};

var EntityComponentBase = tzBaseObject.extend({

    entityComponentName : 'ECBase',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    //Persistence info.
    shouldSave : false,
    shouldLevelSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    interestedInMovement : false,

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ecName)

    eCCreationMap : [],

    init : function entityComponentBaseInitFn(globals, parameters)
    {
        //this._super( globals, parameters );

        //Lazily assign the static globals
        if (EntityComponentBase.prototype.globals === undefined)
        {
            EntityComponentBase.prototype.globals = globals;
            EntityComponentBase.prototype.globalnumberAlive = {};
            EntityComponentBase.prototype.globalrationedCounters = {};
            EntityComponentBase.prototype.globalActiveEntityList = {};
        }

        this.entity                 = null;

        this.dirtyDeserialized      = false;

        this.archetype              = VMath.copyAndConvertMathTypes(parameters);

        this.rationedCounterTracker = {};

        this.nextTimeToUpdate       = 0.0;
        this.hasUpdated             = false;
        this.timeSinceLastUpdate    = 0.0;
        this.lastUpdateTime         = 0.0;
    },

    addToGlobalActiveEntityList : function entityComponentBaseAddToGlobalActiveEntityListFn()
    {
        if (this.globalActiveEntityList[this.getName()] === undefined)
        {
            this.globalActiveEntityList[this.getName()] = [];
        }

        if (this.globalActiveEntityList[this.getName()].indexOf(this.entity) < 0)
        {
            this.globalActiveEntityList[this.getName()].push(this.entity);
        }
    },

    removeFromGlobalActiveEntityList : function entityComponentBaseRemoveFromGlobalActiveEntityListFn()
    {
        var ecIndex;

        if (this.globalActiveEntityList[this.getName()] === undefined)
        {
            this.globalActiveEntityList[this.getName()] = [];
        }

        ecIndex = this.globalActiveEntityList[this.getName()].indexOf(this.entity);
        if (ecIndex >= 0)
        {
            this.globalActiveEntityList[this.getName()].splice(ecIndex, 1);
        }
    },

    getAllActiveEntitiesWithEC : function entityComponentBaseGetAllActiveEntitiesWithECFn()
    {
        return this.globalActiveEntityList[this.getName()];
    },

    adjustGlobalECCount : function entitycomponentbaseAdjustGlobalECCountFn(amount)
    {
        if (this.globalnumberAlive[this.getName()] === undefined)
        {
            this.globalnumberAlive[this.getName()]      = 0;
            this.globalrationedCounters[this.getName()] = {};
        }

        this.globalnumberAlive[this.getName()]        +=  amount;
    },

    getGlobalECCount : function entitycomponentbaseGetGlobalECCountFn()
    {
        return  this.globalnumberAlive[this.getName()];
    },

    getRationedCounter : function entitycomponentbaseGetRationedCounterFn()
    {
        return  this.globalrationedCounters[this.getName()];
    },

    canDoRationedAction : function entitycomponentbaseCanDoRationedActionFn(rationedID)
    {
        var frameNumber =   this.gameManager.gameClock.getFrameIndex();

        var rationedCounters   =   this.getRationedCounter();

        var accepted    =   false;

        if (this.rationedCounterTracker[rationedID] > frameNumber)
        {
            return  false;
        }

        if (rationedCounters[rationedID] === undefined)
        {
            rationedCounters[rationedID]    =   frameNumber;

            accepted    =   true;
        }
        if (rationedCounters[rationedID] < frameNumber)
        {
            accepted    =   true;
        }

        if (accepted)
        {
            rationedCounters[rationedID]            = frameNumber;
            this.rationedCounterTracker[rationedID] = frameNumber + this.getGlobalECCount();
            return  true;
        }

        return  false;

        //Check frame number.
        //If done this frame, then no.
        //If not, then yes, and set frame number.
    },

    getName : function entityComponentBaseGetNameFn()
    {
        return  this.entityComponentName;
    },

    getArchetypeName : function entityComponentBaseGetArchetypeNameFn()
    {
        return this.entity.getArchetypeName();
    },

    attach : function entityComponentBaseAttachFn(gameEntity)
    {
        this.entity   =   gameEntity;

        //Lazily assign the static globals
        if (EntityComponentBase.prototype.gameManager === undefined)
        {
            EntityComponentBase.prototype.gameManager = gameEntity.gameManager;
        }
    },

    activate : function entitycomponentbaseActivateFn()
    {
        if (this.shouldAlwaysUpdate)
        {
            this.setToAlwaysUpdate(true);
        }

        if (this.shouldUpdate)
        {
            this.setToUpdate(true);
        }

        if (this.shouldDraw)
        {
            this.setToDraw(true);
        }

        if (this.storeGlobalList)
        {
            this.addToGlobalActiveEntityList();
        }

        this.adjustGlobalECCount(1);

        var gameCurrentTime         = this.globals.gameCurrentTime;

        this.nextTimeToUpdate       = gameCurrentTime   +   Math.random() * this.updatePeriod;
        this.lastUpdateTime         = gameCurrentTime;
    },

    setUpdatePeriod : function entitycomponentbaseSetUpdatePeriodFn(updatePeriod)
    {
        this.updatePeriod   =   updatePeriod;
        if (this.entity)
        {
            this.nextTimeToUpdate   =   this.globals.gameCurrentTime +   this.updatePeriod;
            this.entity.refreshNextTimeToUpdate(this);
        }
    },

    isActive : function entitycomponentbaseIsActiveFn()
    {
        return (this.entity && this.entity.active);
    },

    getInterestedInMovement : function entityComponentBaseGetInterestedInMovementFn()
    {
        return  this.interestedInMovement;
    },

    setInterestedInMovement : function entityComponentBaseSetInterestedInMovementFn(interestedInMovement)
    {
        if (this.interestedInMovement !== interestedInMovement)
        {
            this.interestedInMovement   =   interestedInMovement;

            if (interestedInMovement)
            {
                this.entity.addECToMoveInterest(this);
            }
            else
            {
                this.entity.removeECFromMoveInterest(this);
            }
        }
    },

    setInterestedInRotation : function entityComponentBaseSetInterestedInRotationFn(interestedInRotation)
    {
        if (this.interestedInRotation !== interestedInRotation)
        {
            this.interestedInRotation   =   interestedInRotation;

            if (interestedInRotation)
            {
                this.entity.addECToRotateInterest(this);
            }
            else
            {
                this.entity.removeECFromRotateInterest(this);
            }
        }
    },

    setInterestedInScaling : function entityComponentBaseSetInterestedInScalingFn(interestedInScaling)
    {
        if (this.interestedInScaling !== interestedInScaling)
        {
            this.interestedInScaling = interestedInScaling;

            if (interestedInScaling)
            {
                this.entity.addECToScaleInterest(this);
            }
            else
            {
                this.entity.removeECFromScaleInterest(this);
            }
        }
    },

    setToUpdate : function entityComponentBaseSetToUpdateFn(toUpdate)
    {
        if (this.toUpdate !== toUpdate)
        {
            this.toUpdate   =   toUpdate;

            if (toUpdate)
            {
                //Will cause a refesh next frame.
                this.entity.addECToUpdate(this);

                //Will cause a refresh now.
                if (this.toAlwaysUpdate)
                {
                    this.entity.addECToAlwaysUpdate(this);
                }

                var gameCurrentTime         = this.globals.gameCurrentTime;

                this.nextTimeToUpdate       = gameCurrentTime   +   Math.random() * this.updatePeriod;
                this.lastUpdateTime         = gameCurrentTime;
            }
            else
            {
                //Will cause a refresh next frame.
                this.entity.removeECFromUpdate(this);

                //Will cause a refresh now.
                this.entity.removeECFromAlwaysUpdate(this);
            }
        }
        //TODO.
        //Remove double refreshes. Should be benigh, but suboptimal.
    },

    setToAlwaysUpdate : function entityComponentBaseSetToAlwaysUpdateFn(toAlwaysUpdate)
    {
        if (this.toAlwaysUpdate !== toAlwaysUpdate)
        {
            this.toAlwaysUpdate   =   toAlwaysUpdate;

            if (toAlwaysUpdate && this.toUpdate)
            {
                this.entity.addECToAlwaysUpdate(this);
            }
            else
            {
                this.entity.removeECFromAlwaysUpdate(this);
            }
        }
    },

    isTimeToUpdate : function entitycomponentbaseIsTimeToUpdateFn(gameCurrentTime)
    {
        return !this.hasUpdated || gameCurrentTime > this.nextTimeToUpdate;
    },

    preUpdate : function entitycomponentbasePreUpdateFn(gameCurrentTime)
    {
        this.timeSinceLastUpdate    =   gameCurrentTime -   this.lastUpdateTime;
    },

    getTimeSinceLastUpdate : function entitycomponentbaseGetTimeSinceLastUpdateFn()
    {
        return  this.timeSinceLastUpdate;
    },

    getTimeForNextUpdate : function entitycomponentbaseGetTimeForNextUpdateFn()
    {
        return  this.nextTimeToUpdate;
    },

    postUpdate : function entitycomponentbasePostUpdateFn(gameCurrentTime)
    {
        if (this.hasUpdated)
        {
            this.nextTimeToUpdate   =   gameCurrentTime +   this.updatePeriod;
        }
        this.dirtyDeserialized = false;
        this.hasUpdated        = true;
        this.lastUpdateTime    = gameCurrentTime;
    },

    update : function entityComponentBaseUpdateFn()
    {
    },

    updateOffScreen : function entityComponentBaseUpdateOffScreenFn()
    {
        // By default, we do the same as when we're visible
        this.update();
    },

    setToDraw : function entityComponentBaseSetToDrawFn(toDraw)
    {
        if (this.toDraw !== toDraw)
        {
            this.toDraw   =   toDraw;

            if (toDraw)
            {
                this.entity.addECToDraw(this);
            }
            else
            {
                this.entity.removeECFromDraw(this);
            }
        }
    },

    draw : function entityComponentBaseDrawFn()
    {
    },

    drawDebug : function entityComponentBaseDrawFn()
    {
        var dd = this.globals.debugDraw;
        dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    getv3Location : function eCBaseGetLocationFn()
    {
        return this.entity.v3Location;
    },

    getRotationX : function entitycomponentbaseGetRotationXFn()
    {
        return this.entity.v3Angle[0];
    },

    getRotationY : function entitycomponentbaseGetRotationYFn()
    {
        return this.entity.v3Angle[1];
    },

    getRotationZ : function entitycomponentbaseGetRotationZFn()
    {
        return this.entity.v3Angle[2];
    },

    getV3Rotation : function eCBaseGetV3RotationFn()
    {
        return this.entity.v3Angle;
    },

    getv3Up : function entityComponentBaseGetv3UpFn()
    {
        return this.entity.getv3Up();
    },

    getv3Right : function entityComponentBaseGetv3RightFn()
    {
        return this.entity.getv3Right();
    },

    getv3Forward : function entityComponentBaseGetv3ForwardFn()
    {
        return this.entity.getv3Forward();
    },

    getEntityEC : function eCBasegetEntityECFn(eCString)
    {
        return  this.entity.getEC(eCString);
    },

    entityHasEC : function eCBaseHasECFn(eCString)
    {
        var ecExists = false;

        if (this.entity && this.entity.hasEC(eCString))
        {
            ecExists  = true;
        }

        return ecExists;
    },

    autoSaveLevel : function ecBaseAutoSaveLevelFn()
    {
        this.globals.gameManager.autoSaveLevel();
    },

    setShouldserialize : function entitycomponentbaseSetShouldserializeFn(shouldserialize)
    {
        this.shouldSave = shouldserialize;
    },

    getShouldserialize : function ecBaseGetShouldserializeFn()
    {
        return  this.shouldSave;
    },

    getShouldLevelserialize : function entitycomponentbaseGetShouldLevelserializeFn()
    {
        return this.shouldLevelSave;
    },

    serializeArchetype : function eCBaseSerializeArchetypeFn(eCData)
    {
        //Data has already been scoped by the time it is here.
        eCData.archetype    =   this.archetype;
    },

    getECParameters : function entitycomponentbaseGetECParametersFn()
    {
        return this.archetype;
    },

    deserialize : function eCBaseDeserializeFn(eCData)
    {
        this.dirtyDeserialized = true;

        var propertyName;
        var property;

        for (propertyName in eCData)
        {
            if (eCData.hasOwnProperty(propertyName))
            {
                property    =   eCData[propertyName];

                if (property && property.isGameEntity)
                {
                    if (property.isSmartPointer)
                    {
                        property    =   this.unpackSmartPointer(property);
                    }
                    else
                    {
                        property    =   this.unpackGameEntity(property);
                    }
                }
                if (property && property.isGameEntityList)
                {
                    property    =   this.unpackEntityList(property);
                }

                this[propertyName]  =    property;
            }
        }
    },

    // (De)Serialization helper functions
    packGameEntity : function entityComponentBasePackGameEntityFn(entity)
    {
        if (!entity)
        {
            return undefined;
        }

        var dataPacket =
        {
            isGameEntity    : true,
            entityName      : entity.getName()
        };

        return dataPacket;
    },

    unpackGameEntity : function entityComponentBaseUnpackGameEntityFn(dataPacket)
    {
        var entity = null;

        if (dataPacket)
        {
            if (this.entity.levelEntityNameMap)
            {
                entity =  this.entity.levelEntityNameMap[dataPacket.entityName];
            }
            else
            {
                entity = this.gameManager.getGameEntityByName(dataPacket.entityName);
            }
        }

        return entity;
    },

    packSmartPointer : function entitycomponentbasePackSmartPointerFn(smartPointer)
    {
        var dataPacket = this.packGameEntity(smartPointer.get());

        if (dataPacket)
        {
            dataPacket.isSmartPointer = true;
        }

        return dataPacket;
    },

    unpackSmartPointer : function entitycomponentbaseUnpackSmartPointerFn(dataPacket)
    {
        var entity  =   this.unpackGameEntity(dataPacket);

        if (!entity)
        {
            return  undefined;
        }

        return  entity.getSmartPointer();
    },

    packEntityList : function entitycomponentbasePackEntityListFn(entityList)
    {
        var packedList       = [];
        var entityListLength = entityList.length;

        var entity;
        var packedEntity;
        var entityListIndex;

        for (entityListIndex = 0; entityListIndex < entityListLength; entityListIndex += 1)
        {
            entity       = entityList[entityListIndex];
            packedEntity = this.packGameEntity(entity);

            packedList.push(packedEntity);
        }

        return {isGameEntityList : true, packedList : packedList};
    },

    // Removes the successfully unpacked items from the packedList and returns a list of unpacked items
    unpackEntityList : function entitycomponentbaseUnpackEntityListFn(packedListObject)
    {
        var packedList   = packedListObject.packedList;
        var unpackedList = [];

        var packedListIndex;

        for (packedListIndex = 0; packedListIndex < packedList.length; packedListIndex += 1)
        {
            var packedEntity   = packedList[packedListIndex];
            var unpackedEntity = this.unpackGameEntity(packedEntity);

            if (unpackedEntity)
            {
                unpackedList.push(unpackedEntity);

                packedList.splice(packedListIndex, 1);
                packedListIndex -= 1;
            }
        }

        return unpackedList;
    },

    // Save
    serialize : function entitycomponentbaseserializeFn()
    {
        debug.assert('No serialize method defined for' + this.getName());

        // return {
        //     saveInfo : this.saveInfo
        // };
    },

    // After the game sleeps.
    manageLargeTimeStep : function entitycomponentbaseManageLargeTimeStepFn()
    {

    },

    onToBeDestroyed : function entityComponentBaseOnToBeDestroyedFn()
    {
        if (this.storeGlobalList)
        {
            this.removeFromGlobalActiveEntityList();
        }
    },

    onDeath : function entityComponentBaseOnDeathFn()
    {
    },

    destroy : function entityComponentBaseDestroyFn()
    {
        this.adjustGlobalECCount(-1);
    },

    safeCopy : function safeCopyFn(value, defaultValue)
    {
        if (value !== undefined)
        {
            return  value;
        }
        return  defaultValue;
    },

    v3SafeCopy : function v3CopyFn(src, dst)
    {
        if (src === undefined)
        {
            return dst;
        }
        var md = this.globals.mathDevice;
        dst =   md.v3Copy(src, dst);
        return  dst;
    },

    setGameSpace : function eCBaseSetGameSpaceFn(/*newSpace*/)
    {

    },

    buildTwoNumberHash : function entityComponentBaseBuildTwoNumberHashFn(a, b)
    {
        return  (a * 1000) + b;
    },

    buildIDArray : function entityComponentBaseBuildIDArray(roomID, idArray)
    {
        var i;
        var returnIDArray;

        if (!idArray)
        {
            return undefined;
        }

        returnIDArray   =   [idArray.length];
        for (i = 0; i < idArray.length; i += 1)
        {
            returnIDArray[i]    =   this.buildTwoNumberHash(roomID, idArray[i]);
        }
        return  returnIDArray;
    },

    arrayContains : function entityComponentBaseArrayContainsFn(array, value)
    {
        if (array === undefined)
        {
            return  false;
        }
        return  (array.indexOf(value) > -1);
    },

    numberToCommaString : function entitycomponentbaseNumberToCommaStringFn(number)
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;

        return simpleFontRenderer.numberToCommaString(number);
    },

    formatTimeToString : function entitycomponentbaseFormatTimeToStringFn(timeInSeconds, spacious)
    {
        var hours = Math.floor(timeInSeconds / (60 * 60));
        var minutes = Math.floor(timeInSeconds / 60) - (hours * 60);
        var seconds = Math.floor(timeInSeconds % 60);

        var timeText = '';
        if (hours > 0)
        {
            timeText    =   timeText + hours + (spacious ? (hours > 1 ? ' hrs ' : ' hr ') :  'h');
        }
        if (minutes > 0)
        {
            timeText    =   timeText + minutes + (spacious ? (minutes > 1 ? ' mins ' : ' min ') : 'm');
        }
        if (seconds > 0 || (!hours && !minutes))
        {
            timeText    =   timeText + seconds + (spacious ? (seconds > 1 ? ' secs ' : ' sec ') : 's');
        }

        return timeText;
    },

    playSound : function entityComponentBasePlaySoundFn(soundName)
    {
        this.entity.playSound(soundName);
    },

    stopSound : function entityComponentBaseStopSoundFn(soundName, fadeTime)
    {
        this.entity.stopSound(soundName, fadeTime);
    },

    playEffect : function entitycomponentbasePlayEffectFn(effectName, v3Velocity, scale, timeDilation, offset, rotation)
    {
        this.entity.playEffect(effectName, v3Velocity, scale, timeDilation, offset, rotation);
    },

    stopEffect : function entitycomponentbaseStopEffectFn(effectName, fadeTime)
    {
        this.entity.stopEffect(effectName, fadeTime);
    },

    playPersistentEffect : function entitycomponentbasePlayPersistentEffectFn(effectArchetypeName)
    {
        return this.entity.playPersistentEffect(effectArchetypeName);
    },

    stopPersistentEffect : function entitycomponentbaseStopPersistentEffectFn(effectEntityName)
    {
        this.entity.stopPersistentEffect(effectEntityName);
    },

    getParentAge : function entityComponentGetParentAgeFn()
    {
        return  this.entity.getAge();
    },

    isManagedByThisMachine : function entityComponentBaseIsManagedByThisMachineFn()
    {
        return  this.entity.isManagedByThisMachine();
    }
});

EntityComponentBase.createFromName = function entityComponentBaseCreateFromNameFn(eCName, globals, parameters)
{
    var eCClassToCreate = EntityComponentBase.prototype.eCCreationMap[eCName];

    var component;

    debug.assert(eCClassToCreate !== undefined,
                        'Trying to create an unknown Entity Component : ' + eCName);

    parameters  =   EntityComponentBase.completeParameters(eCName, parameters);

    component   =   eCClassToCreate.create(globals, parameters);

    return component;
};

EntityComponentBase.getECClass = function entityComponentBaseGetECClassFn(eCName)
{
    var eCClass =   EntityComponentBase.prototype.eCCreationMap[eCName];

    debug.assert(eCClass !== undefined, "Requesting unknown Entity Component : " + eCName);

    return  eCClass;
};

EntityComponentBase.forEachECClass = function entityComponentBaseForEachECClassFn(func)
{
    var ecName;
    var ecClass;
    var ecCreationMap = EntityComponentBase.prototype.eCCreationMap;

    for (ecName in ecCreationMap)
    {
        if (ecCreationMap.hasOwnProperty(ecName))
        {
            ecClass = ecCreationMap[ecName];
            func(ecClass);
        }
    }
};

EntityComponentBase.getECPrototype = function entityComponentBaseGetECPrototypeFn(eCName)
{
    var eCClass =   EntityComponentBase.prototype.eCCreationMap[eCName];

    debug.assert(eCClass !== undefined, "Requesting prototype of an unknown Entity Component : " + eCName);

    return  eCClass.prototype;
};

EntityComponentBase.getECParameters = function entityComponentBaseGetECParametersFn(eCName)
{
    var eCClass =   EntityComponentBase.prototype.eCCreationMap[eCName];

    debug.assert(eCClass !== undefined, "Requesting parameters of an unknown Entity Component : " + eCName);

    return eCClass.prototype.parameters;
};

EntityComponentBase.completeParameters = function entityComponentBaseCompleteParametersFn(componentName, parameters)
{
    if (parameters === undefined)
    {
        parameters  =   {};
    }

    if (parameters.entityComponentParametersCompleted)
    {
        return  parameters;
    }

    var componentParameters =   EntityComponentBase.getECParameters(componentName);

    var parameterName;
    var parameter;
    var defaultValue;

    for (parameterName in componentParameters)
    {
        if (componentParameters.hasOwnProperty(parameterName))
        {
            parameter       =   componentParameters[parameterName];

            if (parameter instanceof Array)
            {
                defaultValue = parameter.slice();
            }
            else if (typeof parameter === 'object')
            {
                defaultValue    =   parameter.defaultValue;
            }
            else
            {
                defaultValue    =   parameter;
            }

            if ((defaultValue !== undefined) &&
                (parameters[parameterName] === undefined))
            {
                parameters[parameterName]    =   defaultValue;
            }
        }
    }

    parameters.entityComponentParametersCompleted   =   true;

    return  parameters;
};


EntityComponentBase.getEntitiesWithEC = function entityComponentBaseGetEntitiesWithECFn(eCName)
{
    var globalEntityList;

    if (EntityComponentBase.prototype.globalActiveEntityList)
    {
        globalEntityList = EntityComponentBase.prototype.globalActiveEntityList[eCName];
    }

    if (!globalEntityList)
    {
        globalEntityList = [];
    }

    return globalEntityList;
};

//
// EntityComponentBase.preload(globals)
//      Optional: preload class assets

//
// EntityComponentBase.preloadComponent(globals, componentParameters)
//      Optional: preload archetype's component assets


EntityComponentBase.create = function entityComponentBaseCreateFn(globals, parameters)
{
    return new EntityComponentBase(globals, parameters);
};
