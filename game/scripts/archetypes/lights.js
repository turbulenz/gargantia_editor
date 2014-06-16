/*global GameLighting: false*/

GameLighting.keyframes =
{
    normal :
    {
        ambient :
        {
            r : 234,
            g : 255,
            b : 255,
            intensity : 0.1
        },

        worldLight1 :
        {
            r : 255,
            g : 228,
            b : 170,
            intensity : 1.5,
            shadowStrength : 0.5,
            pitch : -0.82,
            yaw : 0.41
        },

        fogColor :
        {
            r : 158,
            g : 216,
            b : 211,
            intensity : 1.1
        },

        skyColor :
        {
            r : 0,
            g : 107,
            b : 188,
            intensity : 1
        },

        foregroundAlbedoScale :
        [
            1.0,
            0.7,
            0.6
        ]
    },

    night :
    {
        ambient :
        {
            r : 254,
            g : 255,
            b : 234,
            intensity : 0.01
        },

        worldLight1 :
        {
            r : 255,
            g : 215,
            b : 163,
            intensity : 1.35,
            shadowStrength : 1.0,
            pitch : -0.40,
            yaw : -1.2
        },

        fogColor :
        {
            r : 255,
            g : 178,
            b : 102,
            intensity : 1.2
        },

        skyColor :
        {
            r : 58,
            g : 48,
            b : 90,
            intensity : 0.85
        },

        foregroundAlbedoScale :
        [
            0.65,
            0.35,
            0.25
        ]
    }
};
