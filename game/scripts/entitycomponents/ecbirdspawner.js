/*global EntityComponentBase: false*/
/*global Bird: false*/
/*global EntityComponentSortOrder: false*/

//
//  EntityComponentBirdSpawner!
//

var ECBirdSpawner = EntityComponentBase.extend(
{
    entityComponentName : 'ECBirdSpawner',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.APPLY_FORCES,
    shouldUpdate : false,
    shouldAlwaysUpdate : false,
    shouldDraw : false,

    //Persistence info.
    shouldSave : true,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype
    storeGlobalList : true,

    parameters :
    {
    },

    editableProperties :
    [
        {
            name : "density",
            type : "number",
            options : {
                min : 0.25,
                max : 50,
                step: 0.25
            }
        }
    ],

    init : function eCBirdSpawnerInitFn(globals, parameters)
    {
        this.density = 1;
        this._super(globals, parameters);
    },

    serialize : function ecBirdSpawnerSerializeFn()
    {
        return {
            density: this.density
        };
    },

    deserialize : function ecBirdSpawnerDeserializeFn(ecData)
    {
        this.density = ecData.density || 1;
    },

    activate : function ecBirdSpawnerActivateFn()
    {
        this._super();

        this.entity.setGameSpaceDynamic(true);   //Allow parent to poll for current game space.
    },

    build : function ecBirdSpawnerBuildFn()
    {
        var md = this.globals.mathDevice;
        var loc = this.entity.getv3Location();
        var scale = this.entity.getV3Scale();
        var bounds = md.aabbBuild(
                        loc[0] - scale[0] / 2,
                        loc[1] - scale[1] / 2,
                        loc[2] - scale[2] / 2,
                        loc[0] + scale[0] / 2,
                        loc[1] + scale[1] / 2,
                        loc[2] + scale[2] / 2);
        var count = Math.ceil(scale[0] * scale[1] * scale[2] * this.density / 4000000);
        var birdManager = this.globals.gameManager.birdManager;
        var pos = md.v3BuildZero();
        var dir = md.v3BuildZero();
        var pos2 = md.v3BuildZero();
        var dir2 = md.v3BuildZero();
        for (var i = 0; i < count;)
        {
            md.v3Build(loc[0] - scale[0] / 2 + scale[0] * Math.random(),
                       loc[1] - scale[1] / 2 + scale[1] * Math.random(),
                       loc[2] - scale[2] / 2 + scale[2] * Math.random(),
                       pos);
            md.v3Build(Math.random() * Math.PI * 2,
                       Math.random() * Math.PI * 2,
                       0,
                       dir);
            var count2 = Math.ceil(Math.random() * 10);
            for (var j = 0; i < count && j < count2; i += 1, j += 1)
            {
                md.v3Build(pos[0] + Math.random() * 20 - 10,
                           pos[1] + Math.random() * 20 - 10,
                           pos[2] + Math.random() * 20 - 10,
                           pos2);
                md.v3Build(dir[0] + Math.random() * 0.2 - 0.1,
                           dir[1] + Math.random() * 0.2 - 0.1,
                           dir[2],
                           dir2);
                var bird = new Bird(this.globals, pos2, md.v3ScalarMul(dir2, 15));
                bird.bounds = bounds;
                birdManager.add(bird);
            }
        }
    },

    update : function eCBirdSpawnerUpdateFn()
    {
    },

    draw : function eCBirdSpawnerDrawFn()
    {

    },

    drawDebug : function eCBirdSpawnerDrawDebugFn()
    {
    },

    onDeath : function ecBirdSpawnerOnDeathFn()
    {
        this.setActive(false);
    },

    setActive : function eCBirdSpawnerSetActiveFn(isActive)
    {
        this.active = isActive;
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECBirdSpawner.prototype.entityComponentName] = ECBirdSpawner;

ECBirdSpawner.create = function eCBirdSpawnerCreateFn(globals, parameters)
{
    return new ECBirdSpawner(globals, parameters);
};



