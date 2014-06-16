/*global EntityFactory: false*/

EntityFactory.archetypes.fleet =
{
    shouldLevelSave : true,
    shouldPlayerSave : false,

    ECMesh :
    {
        scale : 10,
        scaleZ : 1,
        path : 'models/fleet.dae',
        stationary : true,
        loadOptions :
        {
        }
    },

    ECVolumeBox :
    {
        sound: 'aud_fleet',
        maxDistance : 600
    }
};

EntityFactory.archetypes.watertanks =
{
    shouldLevelSave : true,
    shouldPlayerSave : false,

    ECMesh :
    {
        scale : 10,
        scaleZ : 1,
        path : 'models/watertanks.dae',
        stationary : true,
        loadOptions :
        {
        }
    }
};

