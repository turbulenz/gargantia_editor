
var Materials =
{
};

Materials.Ledo =
{
    effect : "blinn",
    parameters :
    {
        diffuse : "textures/Ledo05.dds"
    },

    meta :
    {
    }
};

Materials.wings =
{
    effect : "constant_nocull",
    parameters :
    {
        diffuse : [0.8, 0.131765, 0.181961, 1.0]
    },

    meta :
    {
        noshadows: true
    }
};

Materials.bars =
{
    effect : "constant_nolight",
    parameters :
    {
        diffuse : [0.394400, 0.211398, 0.119898, 1.0]
    },

    meta :
    {
    }
};

Materials.gargantia_Fleet_wake =
{
    effect : "wake",
    parameters :
    {
        diffuse: "textures/shipwake.dds"
    },

    meta :
    {
        decal: true,
        uvTranslate: [0, -0.035],
        noshadows: true
    }
};

Materials.watertank =
{
    effect : "watertank",

    parameters :
    {
        diffuse: "textures/garden_ship.dds"
    },

    meta :
    {
        noshadows: true
    }
};


Materials.seagull01 =
{
    effect : "bird",
    parameters :
    {
        diffuse : "characters/textures/seagull_01.dds"
    },

    meta :
    {
        noshadows: true
    }
};

Materials.windthermal =
{
    effect : "thermal",
    parameters :
    {
        diffuse: "textures/windthermal.dds"
    },

    meta :
    {
        transparent: true,
        uvTranslate: [0.1, 0.25],
        noshadows: true
    }
};

Materials.propeller_scroll =
{
    effect : "blend",
    parameters :
    {
        diffuse: "textures/propeller_scroll.dds",
        materialColor: [1, 1, 1, 1]
    },

    meta :
    {
        transparent: true,
        uvTranslate: [0, -5],
        noshadows: true,
        alphaFlicker : {
            speed: 4,
            min: 0.3,
            max: 0.6
        }
    }
};

Materials.propeller_scroll2 =
{
    effect : "blend",
    parameters :
    {
        diffuse: "textures/propeller_scroll2.dds",
        materialColor: [1, 1, 1, 1]
    },

    meta :
    {
        transparent: true,
        uvTranslate: [0, -5],
        noshadows: true,
        alphaFlicker : {
            speed: 4,
            min: 0.125,
            max: 0.325
        }
    }
};

Materials.hoopsolidyellow =
{
    effect : "constant_nolight",
    parameters :
    {
        diffuse: [0.95, 0.85, 0.24, 0.00000]
    },

    meta :
    {
        noshadows: true
    }
};

Materials.hooptransparentyellow =
{
    effect : "constant_nolight",
    parameters :
    {
        diffuse: [0.95, 0.85, 0.24, 0.00000]
    },

    meta :
    {
        noshadows: true
    }
};

Materials.hooptransparentwhite =
{
    effect : "constant_nolight",
    parameters :
    {
        diffuse: [1.000000, 1.00, 1.000000, 0.000000]
    },

    meta :
    {
        noshadows: true
    }
};

Materials.preload_textures_dummy =
{
    effect : "blinn",
    parameters :
    {
        t0: "textures/main_gargantia_ship.dds",
        t1: "textures/garden_ship.dds",
        t2: "textures/gargantia_buildings_01.dds"
    },

    meta :
    {
    }
};
