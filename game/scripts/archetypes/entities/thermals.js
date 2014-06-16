/*global EntityFactory: false*/

EntityFactory.archetypes.a_thermal =
{
    shouldLevelSave: true,
    shouldPlayerSave: false,

    ECMesh :
    {
        path: 'models/windthermal01.dae'
    },

    ECThermals :
    {
    },

    'ECEffectSpawner' :
    {
        ambientEffect : 'sfx_thermal',
        ambientEffectOffset : [0, 0.75, 0],
        ambientEffectScale : [0.05, 0.05, 0.05],
        ambientEffectScalesWithEntity : true
    }
};

EntityFactory.archetypes.a_wind =
{
    shouldLevelSave: true,
    shouldPlayerSave: false,

    // ECMesh :
    // {
    //     path: 'models/ghost_cube04_mid.dae'
    // },

    ECThermals :
    {
    },

    'ECEffectSpawner' :
    {
        ambientEffect : 'sfx_sidewind',
        ambientEffectOffset : [0, 0.0, 0],
        ambientEffectScale : [0.05, 0.05, 0.05],
        ambientEffectScalesWithEntity : true,
        ambientEffectRotatesWithEntity : true
    }
};
