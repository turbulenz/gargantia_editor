//
//  ECHoopAttach
//
//  Define entity as being attached to a spawned hoop.

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECHoopAttach = EntityComponentBase.extend(
{
    entityComponentName : 'ECHoopAttach',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.MOVE_LOCATION,
    shouldUpdate : true,
    shouldAlwaysUpdate : true, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    shouldSave : true,
    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : true, // Setting this to true causes the game to store a global list of all active entities with
                            // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECHoopAttach)

    parameters :
    {
    },

    editableProperties :
    [
        {
            name : 'ID',
            type : 'string'
        }
    ],

    serialize : function ecHoopAttachSerializeFn()
    {
        return {
            ID: this.ID
        };
    },

    deserialize : function ecHoopAttachDeserializeFn(ecData)
    {
        this.ID = ecData.ID;
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecNameInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        this.ID = "#";
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecNameActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        var spawners = EntityComponentBase.getEntitiesWithEC("ECHoopSpawner");
        var spawner = null;
        for (var i = 0; i < spawners.length; i += 1)
        {
            if (spawners[i].getEC("ECHoopSpawner").ID === this.ID)
            {
                spawner = spawners[i];
                break;
            }
        }

        var md = this.globals.mathDevice;
        if (spawner)
        {
            var offset = md.v3Sub(spawner.getv3Location(), this.getv3Location());
            var transform = md.m43BuildRotationXZY(this.entity.getV3Rotation());
            md.m43Inverse(transform, transform);
            md.m43TransformVector(transform, offset, offset);
            this.hoopOffset = offset;
            spawner.getEC("ECHoopSpawner").hoopAttach.push(this);
        }
    },

    // Can query other entities here
    update : function ecNameUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        var md = this.globals.mathDevice;
        if (this.hoop)
        {
            var transform = md.m43BuildRotationXZY(this.entity.getV3Rotation());
            md.m43Translate(transform, this.getv3Location());
            this.hoop.setv3Location(md.m43TransformPoint(transform, this.hoopOffset));
        }
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

ECHoopAttach.create = function ecNameCreateFn(globals, parameters)
{
    return new ECHoopAttach(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECHoopAttach.prototype.entityComponentName] = ECHoopAttach;



