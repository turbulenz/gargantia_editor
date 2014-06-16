//
//  ECHoop
//
//  Define entity as a hoop to be flown through.
/*global Config: false*/
/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECHoop = EntityComponentBase.extend(
{
    entityComponentName : 'ECHoop',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : true, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : true, // Setting this to true causes the game to store a global list of all active entities with
                            // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECHoop)

    parameters :
    {
        radius :
        {
            description: "Intersection radius of ring",
            defaultValue: 10.0,
            minValue: 0.5,
            maxValue: 20.0
        }
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecHoopInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        // Add class members here
        this.side = 0;
        this.active = false;

        var ui = globals.dynamicUI;
        if (ui && !ECHoop.uiInited)
        {
            ECHoop.uiInited = true;
            var group = ui.addGroup("Hoop Parameters", globals.uiGroups.settings, function () {}, {collapsable: true});
            ui.watchVariable(
                'Miss Angle',
                ECHoop,
                'missAngle',
                'slider',
                group,
                {
                    min : 0,
                    max : 1,
                    step : 0.1
                });

            ui.watchVariable(
                'Ratio 100%',
                ECHoop,
                'ratio100',
                'slider',
                group,
                {
                    min : 0,
                    max : 1,
                    step : 0.05
                });

            ui.watchVariable(
                'Ratio 80%',
                ECHoop,
                'ratio80',
                'slider',
                group,
                {
                    min : 0,
                    max : 1,
                    step : 0.05
                });

            ui.watchVariable(
                'Ratio 50%',
                ECHoop,
                'ratio50',
                'slider',
                group,
                {
                    min : 0,
                    max : 1,
                    step : 0.05
                });
        }
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecHoopActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    // Can query other entities here
    update : function ecHoopUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
        var active = this.active;
        if (!active)
        {
            return;
        }

        var md = this.globals.mathDevice;

        var hero = this.gameManager.heroEntity;
        var score = hero.getEC("ECScore");
        var forward = this.getv3Forward();

        var scratchPad = ECHoop.scratchPad;
        if (!scratchPad.delta)
        {
            scratchPad.delta = md.v3BuildZero();
            scratchPad.forward = md.v3BuildZero();
            scratchPad.projection = md.v3BuildZero();
        }

        var delta = md.v3Sub(hero.getv3Location(), this.getv3Location(), scratchPad.delta);

        var gameSoundManager = this.globals.gameManager.gameSoundManager;

        var prevSide = this.side;
        var side = this.side = md.v3Dot(delta, forward);
        var radius = this.archetype.radius;
        var projection = md.v3Sub(delta, md.v3ScalarMul(forward, side, scratchPad.forward), scratchPad.projection);

        if (side * prevSide <= 0 && prevSide < 0)
        {
            // hero passed through plane of ring from correct side.
            // check if he intersected radius.
            if (md.v3Length(projection) <= radius)
            {
                // hero passed through ring.
                var states = this.globals.gameManager.getPlayState().collectionStates;
                var accuracy = md.v3Length(projection) / radius;
                if (accuracy <= ECHoop.ratio100)
                {
                    score.ringBullsEye += 1;
                    states[this.index] = 'hudBullsEye';
                }
                else if (accuracy <= ECHoop.ratio80)
                {
                    score.ringInner += 1;
                    states[this.index] = 'hudInner';
                }
                else if (accuracy <= ECHoop.ratio50)
                {
                    score.ringMid += 1;
                    states[this.index] = 'hudMid';
                }
                else
                {
                    score.ringOuter += 1;
                    states[this.index] = 'hudOuter';
                }
                this.entity.setToBeDestroyed();
                gameSoundManager.play('aud_ringSuccess');
                return;
            }
        }

        if ((ECHoop.missAngle < 1 && side > ECHoop.missAngle * md.v3Length(delta)) ||
            (ECHoop.missAngle === 1 && side > 0 && md.v3Length(projection) <= radius))
        {
            score.ringMiss += 1;
            gameSoundManager.play('aud_ringFail');
            this.entity.setToBeDestroyed();
            this.globals.gameManager.getPlayState().collectionStates[this.index] = 'hudMiss';

            this.globals.gameManager.getPlayState().missedHoop();

            return;
        }
    },

    draw : function ecHoopDrawFn()
    {
        if (this.globals.debugDrawFlags.hoopGeometry)
        {
            var dd = this.globals.debugDraw;
            var md = this.globals.mathDevice;

            var loc = this.getv3Location();
            var forward = this.getv3Forward();
            var right = this.getv3Right();
            var up = this.getv3Up();

            dd.drawDebugCircle(loc, forward, this.archetype.radius * ECHoop.ratio100, 0, 1, 0);
            dd.drawDebugCircle(loc, forward, this.archetype.radius * ECHoop.ratio80, 1, 1, 0);
            dd.drawDebugCircle(loc, forward, this.archetype.radius * ECHoop.ratio50, 1, 0, 0);
            dd.drawDebugCircle(loc, forward, this.archetype.radius, 1, 0, 1);

            if (this.active)
            {
                var m = Math.sqrt(1 - ECHoop.missAngle * ECHoop.missAngle) / ECHoop.missAngle;
                var x0 = m === 0 || m === Number.POSITIVE_INFINITY ? 0 : this.archetype.radius / m;

                var isoMax = 450;
                var isoScale = Math.pow(ECHoop.missAngle, 2) + 0.1;

                for (var iso = 50; iso <= isoMax; iso += 50)
                {
                    var r = m === 0 ? this.archetype.radius : ((iso - 50) * isoScale + x0) * (m === Number.POSITIVE_INFINITY ? 10 : m);
                    var r2 = m === 0 ? this.archetype.radius : (iso * isoScale + x0) * (m === Number.POSITIVE_INFINITY ? 10 : m);
                    if (m === Number.POSITIVE_INFINITY)
                    {
                        r += this.archetype.radius;
                        r2 += this.archetype.radius;
                    }

                    dd.drawDebugCircle(md.v3AddScalarMul(loc, forward, iso * isoScale * (m === Number.POSITIVE_INFINITY ? 0 : 1)),
                                       forward,
                                       r2,
                                       iso / isoMax, 1 - iso / isoMax, 0);
                    for (var a = 0; a < Math.PI * 2; a += Math.PI * 0.25)
                    {
                        var c = Math.cos(a);
                        var s = Math.sin(a);
                        dd.drawDebugLine(md.v3AddScalarMul(
                                             md.v3AddScalarMul(
                                                 md.v3AddScalarMul(loc, right, c * r),
                                                 up, s * r),
                                             forward, (iso - 50) * isoScale * (m === Number.POSITIVE_INFINITY ? 0 : 1)),
                                         md.v3AddScalarMul(
                                             md.v3AddScalarMul(
                                                 md.v3AddScalarMul(loc, right, c * r2),
                                                 up, s * r2),
                                             forward, iso * isoScale * (m === Number.POSITIVE_INFINITY ? 0 : 1)),
                                       iso / isoMax, 1 - iso / isoMax, 0);
                    }
                }
            }
        }
    },

    drawDebug : function ecHoopDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecHoopManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    //Death (when health hits 0)
    onDeath : function ecHoopOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecHoopOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecHoopDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECHoop.missAngle = 0.3;
ECHoop.ratio100 = 0.33;
ECHoop.ratio80 = 0.66;
ECHoop.ratio50 = 1.0;

ECHoop.scratchPad = {};

ECHoop.create = function ecHoopCreateFn(globals, parameters)
{
    return new ECHoop(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECHoop.prototype.entityComponentName] = ECHoop;

