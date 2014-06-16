/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

//
//  EntityComponentCloudSpawner!
//

var ECCloudSpawner = EntityComponentBase.extend(
{
    entityComponentName : 'ECCloudSpawner',

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
        distant : false
    },

    editableProperties :
    [
        {
            name : "density",
            type : "number",
            options : {
                min : 0.25,
                max : 10,
                step: 0.25
            }
        },
        {
            name : "cluster",
            type : "string"
        },
        {
            name : "type",
            type : "string"
        }
    ],

    init : function eCCloudSpawnerInitFn(globals, parameters)
    {
        this.density = 1;
        this.cluster = "#";
        this.type = "#";
        this._super(globals, parameters);
    },

    serialize : function ecHoopSpawnerSerializeFn()
    {
        return {
            density: this.density,
            cluster: this.cluster,
            type: this.type
        };
    },

    deserialize : function ecHoopSpawnerDeserializeFn(ecData)
    {
        this.density = ecData.density || 1;
        this.cluster = ecData.cluster || "#";
        this.type = ecData.type || "#";
    },

    activate : function eclocomotionActivateFn()
    {
        this._super();

        this.entity.setGameSpaceDynamic(true);   //Allow parent to poll for current game space.
    },

    build : function ecCloudSpawnerBuildFn()
    {
    },

    update : function eCCloudSpawnerUpdateFn()
    {
    },

    draw : function eCCloudSpawnerDrawFn()
    {

    },

    drawDebug : function eCCloudSpawnerDrawDebugFn()
    {
    },

    onDeath : function eclocomotionOnDeathFn()
    {
        this.setActive(false);
    },

    setActive : function eCCloudSpawnerSetActiveFn(isActive)
    {
        this.active = isActive;
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECCloudSpawner.prototype.entityComponentName] = ECCloudSpawner;

ECCloudSpawner.create = function eCCloudSpawnerCreateFn(globals, parameters)
{
    return new ECCloudSpawner(globals, parameters);
};




