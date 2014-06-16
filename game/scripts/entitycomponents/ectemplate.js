//
//  ECName
//
//  Description here

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECName = EntityComponentBase.extend(
{
    entityComponentName : 'ECName',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECName)

    parameters :
    {
        // Fully define parameters for full slider control and to provide better documentation
        param1 :
        {
            description     :   'What param1 is',
            defaultValue    :   3.0,
            minValue        :   0.0,
            maxValue        :   20.0
        },
        // Params without a default will only have ui control added if the param is defined in the archetype
        param2 :
        {
            description     :   'This may or may not be set in the archetype',
            minValue        :   0.0,
            maxValue        :   20.0
        },
        // Can just provide a single default value for the parameter
        param3 : 5,
        param4 : true
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecNameInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        // Add class members here
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
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
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

ECName.create = function ecNameCreateFn(globals, parameters)
{
    return new ECName(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECName.prototype.entityComponentName] = ECName;
