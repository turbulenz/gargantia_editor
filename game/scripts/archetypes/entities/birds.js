/*global EntityFactory: false*/

EntityFactory.archetypes.as_bird =
{
    shouldLevelSave: true,
    shouldPlayerSave: false,

    ECBirdSpawner :
    {
    },

    ECMesh :
    {
        scale : 1.0,
        path : 'models/ghost_cube04_mid.dae'
    }
};

EntityFactory.archetypes.a_bird =
{
    shouldLevelSave: false,
    shouldPlayerSave: false,

    ECMesh :
    {
        scale : 2.0,
        path : 'characters/seagull_01.dae'
    }
};
