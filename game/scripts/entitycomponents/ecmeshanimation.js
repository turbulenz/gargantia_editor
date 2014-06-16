//
//  ECMeshAnimation
//
//  Description here

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECMeshAnimation = EntityComponentBase.extend(
{
    entityComponentName : 'ECMeshAnimation',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : true, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : false,

    //Networking info.
    shouldSerialize        : false,
    shouldDeltaSerialize   : false,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECMeshAnimation)

    parameters :
    {
        // Fully define parameters for full slider control and to provide better documentation
        v3RotationSpeed : [0, 0.0, 0],

        v3Offset : [0, 0.125 * 0.5, 0],
        v3OffsetFrequency : [0, 1.0 / 6.0, 0],

        v3Oscillate : [0, 0, 0],
        v3OscillateFrequency : [0, 0, 0]
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ECMeshAnimationInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        var md = globals.mathDevice;

        // Add class members here
        this.scratchpad     = { v3Temp : globals.mathDevice.v3BuildZero()};
        this.randomOffset   = Math.random();
        this.v3RandomOffset = md.v3Build(0, 0, 0); // md.v3Build(Math.random(), Math.random(), Math.random());
        this.v3RotationRandomOffset = md.v3Build(0, 0, 0);

        this.v3RotationRandomOffset[0] /= this.archetype.v3RotationSpeed[0] > 0 ? this.archetype.v3RotationSpeed[0] : 1.0;
        this.v3RotationRandomOffset[1] /= this.archetype.v3RotationSpeed[1] > 0 ? this.archetype.v3RotationSpeed[1] : 1.0;
        this.v3RotationRandomOffset[2] /= this.archetype.v3RotationSpeed[2] > 0 ? this.archetype.v3RotationSpeed[2] : 1.0;
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ECMeshAnimationActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    // Can query other entities here
    update : function ECMeshAnimationUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        var globals     =   this.globals;
        var md          =   globals.mathDevice;
        var archetype   =   this.archetype;
        var eCMesh      =   this.getEntityEC('ECMesh');

        if (this.flyingTween)
        {
            return;
        }

        var scratchpad     = this.scratchpad;
        var gameCurrentTime = globals.gameCurrentTime;
        if (eCMesh)
        {
            var v3RotationSpeed      = archetype.v3RotationSpeed;
            var v3OscillateFrequency = archetype.v3OscillateFrequency;
            var v3Oscillate          = archetype.v3Oscillate;

            if (!md.v3IsZero(v3RotationSpeed) ||
                !md.v3IsZero(v3Oscillate))
            {
                eCMesh.setv3Rotation(md.v3Build(
                                      (v3Oscillate[0] <= 0.0 ? 0.0 : v3Oscillate[0] * Math.sin((gameCurrentTime * v3OscillateFrequency[0] + this.v3RandomOffset[0]) * (Math.PI * 2.0))) + v3RotationSpeed[0] * (gameCurrentTime + this.v3RotationRandomOffset[0]),
                                      (v3Oscillate[1] <= 0.0 ? 0.0 : v3Oscillate[1] * Math.sin((gameCurrentTime * v3OscillateFrequency[1] + this.v3RandomOffset[1]) * (Math.PI * 2.0))) + v3RotationSpeed[1] * (gameCurrentTime + this.v3RotationRandomOffset[1]),
                                      (v3Oscillate[2] <= 0.0 ? 0.0 : v3Oscillate[2] * Math.sin((gameCurrentTime * v3OscillateFrequency[2] + this.v3RandomOffset[2]) * (Math.PI * 2.0))) + v3RotationSpeed[2] * (gameCurrentTime + this.v3RotationRandomOffset[2]),
                                      scratchpad.v3Temp));
            }

            var v3Offset          = archetype.v3Offset;
            var v3OffsetFrequency = archetype.v3OffsetFrequency;
            if (!md.v3IsZero(v3Offset))
            {
                eCMesh.setLocalOffset(md.v3Build(
                                      v3Offset[0] <= 0.0 ? 0.0 : v3Offset[0] * Math.sin((gameCurrentTime * v3OffsetFrequency[0] + this.v3RandomOffset[0]) * (Math.PI * 2.0)),
                                      v3Offset[1] <= 0.0 ? 0.0 : v3Offset[1] * Math.sin((gameCurrentTime * v3OffsetFrequency[1] + this.v3RandomOffset[1]) * (Math.PI * 2.0)),
                                      v3Offset[2] <= 0.0 ? 0.0 : v3Offset[2] * Math.sin((gameCurrentTime * v3OffsetFrequency[2] + this.v3RandomOffset[2]) * (Math.PI * 2.0)),
                                      scratchpad.v3Temp));
            }
        }
    },

    draw : function ECMeshAnimationDrawFn()
    {
    },

    drawDebug : function ECMeshAnimationDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ECMeshAnimationManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    serialize : function ECMeshAnimationSerializeFn(eCData)
    {
        this._super(eCData);
    },

    serializeDelta : function ECMeshAnimationSerializeDeltaFn(/*eCData*/)
    {

    },

    //Death (when health hits 0)
    onDeath : function ECMeshAnimationOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ECMeshAnimationOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ECMeshAnimationDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECMeshAnimation.create = function ECMeshAnimationCreateFn(globals, parameters)
{
    return new ECMeshAnimation(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECMeshAnimation.prototype.entityComponentName] = ECMeshAnimation;
