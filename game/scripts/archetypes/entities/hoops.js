/*global EntityFactory: false*/

EntityFactory.archetypes.as_hoop =
{
    shouldLevelSave : true,
    shouldPlayerSave : false,

    ECHoopSpawner :
    {
        ID: "#",
        nextID: ""
    },

    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_01.dae',
        foreground : false,
        scale : 0.5
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [0, 0, -1],
        v3Oscillate : [1, 1, 1]
    }
};

EntityFactory.archetypes.a_hoop_part2 =
{
    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_01.dae',
        foreground : false,
        scale : 0.33
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [0, 0, -2],
        v3Oscillate : [1, 1, 1]
    }
};

EntityFactory.archetypes.a_hoop_part3 =
{
    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_04.dae',
        foreground : false,
        scale : 0.66
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [0, 0, 2.0],
        v3Oscillate : [1, 1, 1]
    }
};


EntityFactory.archetypes.a_hoop =
{
    shouldLevelSave : false,
    shouldPlayerSave : false,

    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_01.dae',
        foreground : false,
        scale : 0.25
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [0, 0, 2.0],
        v3Oscillate : [1, 1, 1]
    },

    'ECSockets' :
    {
        sockets : [
            {
                archetypeName : 'a_hoop_part2',
                localOffset : [0.0, 0.0, 0.0]
            },
            {
                archetypeName : 'a_hoop_part3',
                localOffset : [0.0, 0.0, 0.0]
            }
        ]
    },

    ECHoop :
    {
        radius: 5
    },

    'ECSprite' :
    {
        size        :   20.0,
        path        :   'textures/glowfull.dds',
        additive    :   true,
        color       :   [255 / 255, 235 / 255, 104 / 255, 0.10]
    },

    'ECEffectSpawner' :
    {
        ambientEffect : 'sfx_ring_ambient',
        onDestroyEffect : 'sfx_ring_hit'
    }
};

EntityFactory.archetypes.a_hoop_goal =
{
    shouldLevelSave : false,
    shouldPlayerSave : false,

    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_04.dae',
        foreground : false,
        scale : 0.4
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [1.8, 1.4, 1.6],
        v3Oscillate : [1.1, 1.2, 1.3],

        v3Offset : [0.4, 0.5, 0.6],
        v3OffsetFrequency : [0, 1.0 / 3.0, 0]
    },

    'ECSockets' :
    {
        sockets : [
            {
                archetypeName : 'a_pinion_hoop_part2',
                localOffset : [0.0, 0.0, 0.0]
            }
            // {
            //     archetypeName : 'a_pinion_hoop_part3',
            //     localOffset : [0.0, 0.0, 0.0]
            // }
        ]
    },

    ECHoop :
    {
        radius: 5
    },

    // 'ECSprite' :
    // {
    //     size        :   5.0,
    //     path        :   'textures/questionmark.dds',
    //     additive    :   false,
    //     color       :   [255 / 255, 230 / 255, 65 / 255, 1.0]
    // },

    'ECEffectSpawner' :
    {
        ambientEffect : 'sfx_ring_ambient',
        onDestroyEffect : 'sfx_ring_hit'
    }
};

EntityFactory.archetypes.a_pinion_hoop_part2 =
{
    ECMesh :
    {
        rotationY : Math.PI,
        path : 'models/hoop_01.dae',
        foreground : false,
        scale : 1.5
    },

    ECMeshAnimation :
    {
        v3RotationSpeed : [1.6, 1.8, 1.4],
        v3Oscillate : [1.3, 1.1, 1.2]
    }
};