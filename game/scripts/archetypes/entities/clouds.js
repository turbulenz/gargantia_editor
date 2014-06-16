/*global EntityFactory: false*/

EntityFactory.archetypes.as_cloud =
{
    shouldLevelSave: true,
    shouldPlayerSave: false,

    ECMesh :
    {
        scale : 1.0,
        path : 'models/cube07_mid.dae',
        foreground : true
    },

    ECCloudSpawner :
    {
        distant : false
    }
};

EntityFactory.archetypes.as_distant_cloud =
{
    shouldLevelSave: true,
    shouldPlayerSave: false,

    ECMesh :
    {
        scale : 1.0,
        path : 'models/cube08_mid.dae',
        foreground : true
    },

    ECCloudSpawner :
    {
        distant : true
    }
};

