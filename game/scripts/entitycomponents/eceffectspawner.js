//
//  ECEffectSpawner
//
//  Holds a list of special effects that are played throughout the parent entities life.

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/
/*global debug: false*/

var ECEffectSpawner = EntityComponentBase.extend(
{
    entityComponentName : 'ECEffectSpawner',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : false,
    shouldDraw : false,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ecEffectSpawner)

    parameters :
    {
        // Fully define parameters for full slider control and to provide better documentation
        onCreateEffect : 'none',
        onDestroyEffect : 'none',
        onDeathEffect : 'none',
        onUnlockEffect : 'none',
        ambientEffect : 'none',
        incidentalEffect : 'none',
        incidentalMinTime : 10.0,
        incidentalMaxTime : 20.0,
        impactEffect : 'none'
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecEffectSpawnerInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        // Add class members here
    },

    getScale : function ecEffectSpawnerGetScaleFn(scalesWithEntity, scale)
    {
        if (!scalesWithEntity && !scale)
        {
            return null;
        }
        else if (!scale)
        {
            return this.entity.getV3Scale();
        }
        else if (!scalesWithEntity)
        {
            return scale;
        }
        else
        {
            var s = this.entity.getV3Scale();
            return [scale[0] * s[0], scale[1] * s[1], scale[2] * s[2]];
        }
    },

    getOffset : function ecEffectSpawnerGetOffsetFn(scale, offset)
    {
        if (!scale || !offset)
        {
            return offset;
        }
        return [offset[0] / scale[0], offset[1] / scale[1], offset[2] / scale[2]];
    },

    getRotation : function ecEffectSpawnerGetRotationFn(rotatesWithEntity)
    {
        if (!rotatesWithEntity)
        {
            return undefined;
        }

        return this.globals.mathDevice.m33BuildRotationXZY(this.entity.getV3Rotation());
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecEffectSpawnerActivateFn()
    {
        this._super();

        if (this.archetype.onCreateEffect !== 'none')
        {
            this.playEffect(this.archetype.onCreateEffect);
        }

        if (this.archetype.ambientEffect !== 'none')
        {
            this.playEffect(this.archetype.ambientEffect,
                            undefined,
                            this.getScale(this.archetype.ambientEffectScalesWithEntity, this.archetype.ambientEffectScale),
                            undefined,
                            this.getOffset(this.archetype.ambientEffectScale, this.archetype.ambientEffectOffset),
                            this.getRotation(this.archetype.ambientEffectRotatesWithEntity));
        }

        this.prepareIncidentalEffect();
    },

    pause : function eceffectspawnerPauseFn()
    {
        if (this.archetype.ambientEffect !== 'none')
        {
            this.stopEffect(this.archetype.ambientEffect);
        }
        this.setToUpdate(false);
    },

    resume : function eceffectspawnerResumeFn()
    {
        if (this.archetype.ambientEffect !== 'none')
        {
            this.playEffect(this.archetype.ambientEffect,
                            undefined,
                            this.getScale(this.archetype.ambientEffectScalesWithEntity, this.archetype.ambientEffectScale),
                            undefined,
                            this.getOffset(this.archetype.ambientEffectScale, this.archetype.ambientEffectOffset),
                            this.getRotation(this.archetype.ambientEffectRotatesWithEntity));
        }
        this.prepareIncidentalEffect();
    },

    prepareIncidentalEffect : function PrepareIncidentalEffectFn()
    {
        if (this.archetype.incidentalEffect !== 'none')
        {
            this.setToUpdate(true);
            this.setUpdatePeriod(this.archetype.incidentalMinTime + (Math.random() * (this.archetype.incidentalMaxTime - this.archetype.incidentalMinTime)));
        }
    },

    onTakeDamage : function eceffectspawnerOnTakeDamageFn()
    {
        if (this.archetype.impactEffect !== 'none')
        {
            this.playEffect(this.archetype.impactEffect);
        }
    },

    // Can query other entities here
    update : function ecEffectSpawnerUpdateFn()
    {
        this._super();

        debug.assert(this.archetype.incidentalEffect, 'Error: ECEffectSpawners should only update for incidental effects');

        this.playEffect(this.archetype.incidentalEffect);
        this.prepareIncidentalEffect();
    },

    draw : function ecEffectSpawnerDrawFn()
    {
    },

    drawDebug : function ecEffectSpawnerDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    //Death (when health hits 0)
    onDeath : function ecEffectSpawnerOnDeathFn()
    {
        if (this.archetype.onDeathEffect !== 'none')
        {
            this.playEffect(this.archetype.onDeathEffect);
        }

        if (this.archetype.ambientEffect !== 'none')
        {
            this.stopEffect(this.archetype.ambientEffect);
        }
    },

    onUnlock : function eceffectspawnerOnUnlockFn()
    {
        if (this.archetype.onUnlockEffect !== 'none')
        {
            this.playEffect(this.archetype.onUnlockEffect);
        }
    },

    //Destruction.
    onToBeDestroyed : function ecEffectSpawnerOnToBeDestroyedFn()
    {
        this._super();

        if (this.archetype.ambientEffect !== 'none')
        {
            this.stopEffect(this.archetype.ambientEffect);
        }

        if (this.archetype.onDestroyEffect !== 'none')
        {
            this.playEffect(this.archetype.onDestroyEffect);
        }
    },

    destroy : function ecEffectSpawnerDestroyFn()
    {
        this._super();
    }
});

ECEffectSpawner.create = function ecEffectSpawnerCreateFn(globals, parameters)
{
    return new ECEffectSpawner(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECEffectSpawner.prototype.entityComponentName] = ECEffectSpawner;
