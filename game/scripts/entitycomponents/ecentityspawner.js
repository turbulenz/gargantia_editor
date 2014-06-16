//
//  ECEntitySpawner
//
//  Description here

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECEntitySpawner = EntityComponentBase.extend(
{
    entityComponentName : 'ECEntitySpawner',

    updatePeriod : 0.0,
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : false,
    shouldAlwaysUpdate : false,
    shouldDraw : true,

    shouldSave : false,
    realTime : false,
    storeGlobalList : true,

    parameters :
    {
        archetypeToSpawn : '',
        archetypesToSpawn : undefined,
        randomArchetypesToSpawn : undefined,
        spawnValidType : 'default'
    },

    init : function ecEntitySpawnerInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        this.scratchpad = {};
    },

    activate : function ecEntitySpawnerActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    applySpawnBehaviourBasedOnFlags : function ecentityspawnerApplySpawnBehaviourBasedOnFlagsFn(playFlags)
    {
        this.spawnEntitiesUsingFlags(playFlags);
        this.entity.hideMesh(true);
    },

    getSpawnValidType : function ecentityspawnerGetSpawnValidTypeFn()
    {
        return this.archetype.spawnValidType;
    },

    shouldSpawnMultipleEntities : function ecEntitySpawnerShouldSpawnMultipleArchetypesFn()
    {
        var spawnsMultipleEntities = false;

        if (this.getArchetypesToSpawn())
        {
            spawnsMultipleEntities = true;
        }

        return spawnsMultipleEntities;
    },

    getArchetypesToSpawn : function ecEntitySpawnerGetArchetypesToSpawnFn()
    {
        return this.archetype.archetypesToSpawn;
    },

    getArchetypeToSpawn : function ecEntitySpawnerGetArchetypeToSpawnFn()
    {
        var archetypeToSpawn = null;
        var randomArchetypesToSpawn = this.archetype.randomArchetypesToSpawn;

        if (randomArchetypesToSpawn && randomArchetypesToSpawn.length > 0)
        {
            archetypeToSpawn = randomArchetypesToSpawn[Math.floor(Math.random() * randomArchetypesToSpawn.length)];
        }
        else
        {
            archetypeToSpawn = this.archetype.archetypeToSpawn;
        }

        return archetypeToSpawn;
    },

    spawnEntitiesUsingFlags : function ecEntitySpawnerSpawnEntitiesUsingFlagsFn(playFlags)
    {
        if (this.shouldSpawnMultipleEntities())
        {
            this.spawnEntityGroup(playFlags);
        }
        else
        {
            if (playFlags.validSpawnTypes[this.getSpawnValidType()])
            {
                this.spawnEntity(this.getArchetypeToSpawn());
            }
        }
    },

    spawnEntityGroup : function ecEntitySpawnerSpawnEntityGroupFn(playFlags)
    {
        var archetypeGroup = this.getArchetypesToSpawn();

        var numArchetypes;
        var archetypeIndex;
        var archetypeInfo;

        var defaultSpawnValidType = this.getSpawnValidType();
        var currentSpawnValidType;

        if (archetypeGroup)
        {
            numArchetypes = archetypeGroup.length;
            for (archetypeIndex = 0; archetypeIndex < numArchetypes; archetypeIndex += 1)
            {
                archetypeInfo         = archetypeGroup[archetypeIndex];
                currentSpawnValidType = archetypeInfo.spawnValidType ? archetypeInfo.spawnValidType : defaultSpawnValidType;

                if (playFlags.validSpawnTypes[currentSpawnValidType])
                {
                    if (archetypeInfo.archetype)
                    {
                        this.spawnEntity(archetypeInfo.archetype, archetypeInfo.localOffset);
                    }
                    else
                    {
                        this.spawnEntity(archetypeInfo);
                    }
                }
            }
        }
    },

    spawnEntity : function ecentityspawnerSpawnEntityFn(archetypeToSpawn, localOffset)
    {
        var scratchpad      = this.scratchpad;
        var globals         = this.globals;
        var mathDevice      = globals.mathDevice;
        var entityFactory   = this.gameManager.getEntityFactory();
        var entity;

        var v3SpawnLocation;

        if (!archetypeToSpawn)
        {
            archetypeToSpawn = this.getArchetypeToSpawn();
        }

        var v3Rotation;
        var v3RotationM43;
        var v3SpawnOffset;

        if (archetypeToSpawn)
        {
            if (localOffset)
            {
                v3SpawnLocation = scratchpad.v3SpawnLocation = mathDevice.v3Copy(this.getv3Location(), scratchpad.v3SpawnLocation);

                v3RotationM43   = scratchpad.v3RotationM43 = mathDevice.m43BuildRotationXZY(v3Rotation, scratchpad.v3RotationM43);
                v3SpawnOffset   = scratchpad.v3SpawnOffset = mathDevice.v3Build(localOffset[0], localOffset[1], localOffset[2], scratchpad.v3SpawnOffset);

                v3SpawnOffset   = mathDevice.m43TransformVector(v3RotationM43, v3SpawnOffset, v3SpawnOffset);
                v3SpawnLocation = mathDevice.v3Add(v3SpawnLocation, v3SpawnOffset, v3SpawnLocation);
            }
            else
            {
                v3SpawnLocation = this.getv3Location();
            }

            entity = entityFactory.createInactiveEntityInstance(archetypeToSpawn,
                                                     archetypeToSpawn,
                                                     v3SpawnLocation,
                                                     this.entity.getV3Rotation());

            if (entity)
            {
                entity.spawnerId = this.entity.uniqueId;
                entity.activate();
            }
        }

        return entity;
    },

    // Can query other entities here
    update : function ecEntitySpawnerUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    draw : function ecEntitySpawnerDrawFn()
    {
    },

    drawDebug : function ecEntitySpawnerDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecEntitySpawnerManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    //Death (when health hits 0)
    onDeath : function ecEntitySpawnerOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecEntitySpawnerOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecEntitySpawnerDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECEntitySpawner.create = function ecEntitySpawnerCreateFn(globals, parameters)
{
    return new ECEntitySpawner(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECEntitySpawner.prototype.entityComponentName] = ECEntitySpawner;
