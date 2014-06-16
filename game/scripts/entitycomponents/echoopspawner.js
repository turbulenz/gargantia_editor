//
//  ECHoopSpawner
//
//  Define entity as being a hoop spawner.

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECHoopSpawner = EntityComponentBase.extend(
{
    entityComponentName : 'ECHoopSpawner',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : false,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    shouldSave : true,
    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : true, // Setting this to true causes the game to store a global list of all active entities with
                            // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECHoopSpawner)

    parameters :
    {
    },

    editableProperties :
    [
        {
            name : 'ID',
            type : 'string'
        },
        {
            name : 'nextID',
            type : 'string'
        },
        {
            name : 'archetype',
            type : 'string'
        }
    ],

    serialize : function ecHoopSpawnerSerializeFn()
    {
        return {
            ID: this.ID,
            nextID: this.nextID,
            archetype: this.archetype
        };
    },

    deserialize : function ecHoopSpawnerDeserializeFn(ecData)
    {
        this.ID = ecData.ID;
        this.nextID = ecData.nextID;
        this.archetype = ecData.archetype || "a_hoop";
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecNameInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        this.ID = "#";
        this.nextID = "";
        this.archetype = "a_hoop";
        this.hoopAttach = [];
    },

    spawn : function ecHoopSpawnerSpawnFn()
    {
        var entityFactory = this.gameManager.getEntityFactory();
        var entity = entityFactory.createInactiveEntityInstance(
                        this.archetype,
                        this.archetype,
                        this.getv3Location(),
                        this.entity.getV3Rotation());
        if (entity)
        {
            entity.activate();
            entity.getEC("ECHoop").index = this.index;
        }

        for (var i = 0; i < this.hoopAttach.length; i += 1)
        {
            this.hoopAttach[i].hoop = entity;
        }
        this.hoopAttach = null;

        return entity;
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecNameActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    // Can query other entities here
    update : function ecNameUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    draw : function ecNameDrawFn()
    {
    },

    drawDebug : function ecNameDrawFn()
    {
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecNameManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    //Death (when health hits 0)
    onDeath : function ecNameOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecNameOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecNameDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECHoopSpawner.create = function ecNameCreateFn(globals, parameters)
{
    return new ECHoopSpawner(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECHoopSpawner.prototype.entityComponentName] = ECHoopSpawner;


