/*global EntityFactory: false*/

EntityFactory.archetypes.as_ledo =
{
    shouldLevelSave : true,
    shouldPlayerSave: false,

    ECEntitySpawner :
    {
        archetypeToSpawn : 'a_ledo'
    }
};

EntityFactory.archetypes.a_ledo =
{
    shouldLevelSave: false,
    shouldPlayerSave: false,

    ECMesh :
    {
        scale       :   1.0,
        scaleX      :   1.0,
        scaleY      :   1.0,
        scaleZ      :   1.0,
        offsetY     :   1.0,
        rotationX   :   0.0,
        path        :   'characters/ledo_kite.dae',
        localOffset :   [0.0, -1.0, 0.0],
        foreground : true
    },

    ECHero : {
    },

    ECLocomotion : {
    },

    ECAnimationManager : {
        animationSet : 'ledo_kite'
    },

    ECScore : {
    },

    ECEffectSpawner : {
        ambientEffect: 'sfx_dust'
    }
};
