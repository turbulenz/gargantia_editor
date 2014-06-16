//
//  ECThermals
//
//  Description here

/*global debug: false*/
/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECThermals = EntityComponentBase.extend(
{
    entityComponentName : 'ECThermals',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : false,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    //Persistence info.
    shouldSave : true,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : true, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECThermals)

    parameters :
    {
    },

    editableProperties :
    [
        {
            name : "strength",
            type : "number",
            options : {
                min : 0,
                max : 50,
                step : 5
            }
        },
        {
            name: "turbulenz",
            type: "number",
            options : {
                min : 0,
                max : 50,
                step : 5
            }
        },
        {
            name : "direction",
            type : "string",
            setValue : function (val) {
                this.direction = val;
            }
        }
    ],

    serialize : function ecHoopSpawnerSerializeFn()
    {
        return {
            strength: this.strength,
            direction: this.direction,
            turbulenz: this.turbulenz
        };
    },

    deserialize : function ecHoopSpawnerDeserializeFn(ecData)
    {
        this.strength = ecData.strength || 0;
        this.direction = ecData.direction || "y+";
        this.turbulenz = ecData.turbulenz || 0;
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecThermalsInitFn(globals, parameters)
    {
        this.strength = 25;

        this.id = ECThermals.id;
        ECThermals.id += 1;

        this.direction = "y+";
        this.turbulenz = 0;
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecThermalsActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        var md = this.globals.mathDevice;
        var extents = this.extents = md.aabbBuildEmpty();

        var loc = this.entity.getv3Location();
        var scale = this.entity.getV3Scale();

        var up = this.entity.getv3Up();
        var right = this.entity.getv3Right();
        var forward = this.entity.getv3Forward();

        // As it stands, thermals/wind may only take axial orientations
        debug.assert(Math.abs(up[0] + up[1] + up[2]) < 1.01);
        debug.assert(Math.abs(right[0] + right[1] + right[2]) < 1.01);
        debug.assert(Math.abs(forward[0] + forward[1] + forward[2]) < 1.01);

        var u0 = up[0] * scale[1];
        var u1 = up[1] * scale[1];
        var u2 = up[2] * scale[1];

        var r0 = right[0] * scale[0];
        var r1 = right[1] * scale[0];
        var r2 = right[2] * scale[0];

        var f0 = forward[0] * scale[2];
        var f1 = forward[1] * scale[2];
        var f2 = forward[2] * scale[2];

        var ex = Math.max(Math.max(Math.abs(u0), Math.abs(r0)), Math.abs(f0)) * 0.5;
        var ey = Math.max(Math.max(Math.abs(u1), Math.abs(r1)), Math.abs(f1)) * 0.5;
        var ez = Math.max(Math.max(Math.abs(u2), Math.abs(r2)), Math.abs(f2)) * 0.5;

        extents[0] = loc[0] - ex;
        extents[1] = loc[1];
        extents[2] = loc[2] - ez;
        extents[3] = loc[0] + ex;
        extents[4] = loc[1] + ey * 2;
        extents[5] = loc[2] + ez;

        this.loc = md.v3Build(loc[0], loc[1] + ey, loc[2]);
        this.invHalfSize = md.v3Reciprocal(md.v3Build(ex, ey, ez));

        switch (this.direction)
        {
        case "y+":
            this.m33Direction = md.m33Build([1, 0, 0],  [0, 1, 0],  [0, 0, 1]);
            break;
        case "y-":
            this.m33Direction = md.m33Build([-1, 0, 0],  [0, -1, 0],  [0, 0, -1]);
            break;
        case "x+":
            this.m33Direction = md.m33Build([0, 1, 0],  [1, 0, 0],  [0, 0, 1]);
            break;
        case "x-":
            this.m33Direction = md.m33Build([0, -1, 0],  [-1, 0, 0],  [0, 0, -1]);
            break;
        case "z+":
            this.m33Direction = md.m33Build([1, 0, 0],  [0, 0, 1],  [0, 1, 0]);
            break;
        case "z-":
            this.m33Direction = md.m33Build([-1, 0, 0],  [0, 0, -1],  [0, -1, 0]);
            break;
        default:
            debug.assert(this.direction && false);
        }
    },

    // Can query other entities here
    update : function ecThermalsUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    draw : function ecThermalsDrawFn()
    {
        var dd = this.globals.debugDraw;
        if (this.globals.debugDrawFlags.physics)
        {
            var md = this.globals.mathDevice;
            var extents = this.extents;
            dd.drawDebugExtents(extents, 1, 0, 0);
            var centre = md.v3Build(
                (extents[0] + extents[3]) / 2,
                (extents[1] + extents[4]) / 2,
                (extents[2] + extents[5]) / 2);
            var size = md.v3Build(
                extents[3] - extents[0],
                extents[4] - extents[1],
                extents[5] - extents[2]);
            dd.drawDebugSphere(centre, 4, 1, 0, 0);
            dd.drawDebugLine(centre, md.v3AddScalarMul(centre, md.m33Up(this.m33Direction), Math.abs(md.v3Dot(size, md.m33Up(this.m33Direction)) / 2.5)), 1, 0, 0);
        }
    },

    drawDebug : function ecThermalsDrawFn()
    {
        // var dd = this.globals.debugDraw;
        // dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecThermalsManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    //Death (when health hits 0)
    onDeath : function ecThermalsOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecThermalsOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecThermalsDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECThermals.id = 0;

ECThermals.create = function ecThermalsCreateFn(globals, parameters)
{
    return new ECThermals(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECThermals.prototype.entityComponentName] = ECThermals;

