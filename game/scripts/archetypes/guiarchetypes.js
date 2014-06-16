/*global guiColors: false*/
/*global GuiRenderer: false*/

GuiRenderer.archetypes.button =
{
    layer : 2,
    buttonSize : [100, 100],
    instructions : [
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 1.0, scaleY : 1.0, border : 4, color : guiColors.whiteHalf },
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 1.0, scaleY : 1.0, color : guiColors.darkBackSuperStrong },
        { command : 'renderText', pointSize : 16, font : 'bold', boxWidth : 100, boxHeight : 100, upperCase : true }
    ]
};

GuiRenderer.archetypes.buttonDouble =
{
    layer : 2,
    buttonSize : [220, 100],
    instructions : [
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 1.8, scaleY : 0.6, border : 4, color : guiColors.whiteHalf },
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 1.8, scaleY : 0.6, color : guiColors.darkBackSuperStrong },
        { command : 'renderText', pointSize : 32, font : 'bold', boxWidth : 220, boxHeight : 100, upperCase : true }
    ]
};

GuiRenderer.archetypes.gameMessageTitle =
{
    layer : 1,
    instructions : [
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 4.0, scaleY : 0.75, color : guiColors.darkBack},
        { command : 'offsetCentre', x : -0, y : 4 },
        { command : 'renderText', text : 'text1', pointSize : 32, font : 'bold', boxWidth : 400, boxHeight : 50, upperCase : true, color : guiColors.darkBack },
        { command : 'offsetCentre', x : -0, y : -4 },
        { command : 'renderText', text : 'text1', pointSize : 32, font : 'bold', boxWidth : 400, boxHeight : 50, upperCase : true }
    ]
};

GuiRenderer.archetypes.guiDarkBackground =
{
    layer : 1,
    instructions : [
        { command : 'renderSprite', texturePath : 'textures/simple_square.dds', scaleX : 1.0, scaleY : 1.0, color : guiColors.darkBackFaint }
    ]
};

GuiRenderer.archetypes.editorPositionModeIcon =
{
    instructions : [
        { command : 'setRenderLocation', x : 40, y : 40, locationName : 'topLeft' },
        { command : 'renderSprite', texturePath : 'textures/translation.dds', scale : 0.4 }
    ]
};

GuiRenderer.archetypes.editorRotationModeIcon =
{
    instructions : [
        { command : 'setRenderLocation', x : 40, y : 40, locationName : 'topLeft' },
        { command : 'renderSprite', texturePath : 'textures/rotate.dds', scale : 0.4 }
    ]
};

GuiRenderer.archetypes.editorScaleModeIcon =
{
    instructions : [
        { command : 'setRenderLocation', x : 40, y : 40, locationName : 'topLeft' },
        { command : 'renderSprite', texturePath : 'textures/scale.dds', scale : 0.4 }
    ]
};

(function ()
{
    GuiRenderer.archetypes.touchDPad =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        instructions: [
            { command : 'renderSprite', texturePath : null, color: [1, 1, 1, 1] }
        ]
    };
    GuiRenderer.archetypes.touchBoost =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        instructions: [
            { command : 'renderSprite', texturePath : null, color: [1, 1, 1, 1] }
        ]
    };
    GuiRenderer.archetypes.touchFinger =
    {
        instructions: [
            { command : 'renderSprite', texturePath : "textures/touch_finger.dds", scale: 0.75, color: [1, 1, 1, 1] }
        ]
    };

    // to force preloading.
    GuiRenderer.archetypes.touchDPad0 =
    {
        instructions: [
            { command : 'renderSprite', texturePath : "textures/touch_dpad_default.dds" }
        ]
    };
    GuiRenderer.archetypes.touchDPad1 =
    {
        instructions: [
            { command : 'renderSprite', texturePath : "textures/touch_dpad_pressed.dds" }
        ]
    };
    GuiRenderer.archetypes.touchBoost0 =
    {
        instructions: [
            { command : 'renderSprite', texturePath : "textures/touch_boost_default.dds" }
        ]
    };
    GuiRenderer.archetypes.touchBoost1 =
    {
        instructions: [
            { command : 'renderSprite', texturePath : "textures/touch_boost_pressed.dds" }
        ]
    };

    var tb = -160;
    var tx = -280;
    var tx2 = -160;
    var ty = 40;
    var ts = 26;
    var alpha = 0.5;
    for (var i = 0; i < 6; i += 1)
    {
        GuiRenderer.archetypes["score_metric_" + i] =
        {
            fadeType: "alpha",
            fadeInTime: 0.4,
            instructions: [
                { command : 'setRenderLocation', x : tx, locationName : 'centre' },
                GuiRenderer["score_metric_title_" + i] = { command : 'renderText', pointSize : ts, spacing : 2.5, boxWidth : 400, boxHeight: 64, upperCase : true, align : 0 },
                { command : 'setRenderLocation', x : -tx2, locationName : 'centre' },
                GuiRenderer["score_metric_value_" + i] = { command : 'renderText', pointSize : ts, spacing : 2.5, boxWidth : 200, boxHeight: 64, upperCase : true, align : 2, color: [1, 1, 1, alpha] },
                { command : 'setRenderLocation', x : -tx, locationName : 'centre' },
                GuiRenderer["score_metric_score_" + i] = { command : 'renderText', pointSize : ts, spacing : 2.5, boxWidth : 200, boxHeight: 64, upperCase : true, align : 2 }
            ]
        };
    }
    GuiRenderer.archetypes.scorebg =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        instructions : [
            { command : 'setRenderLocation', x : 0, y : 0, locationName : 'centre' },
            GuiRenderer.scorebgBG =
                { command : 'renderSprite', texturePath : null, width : 1080, height: 608, color: [98 / 255, 148 / 255, 154 / 255, 0.85] },

            { command : 'setRenderLocation', x : 0, y : -250, locationName : 'centre' },
            GuiRenderer.missionTitleUI = { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth : 600, boxHeight : 64, upperCase : false, align : 1 }
        ]
    };

    GuiRenderer.archetypes.scorestarbg =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        instructions: [
            { command : 'setRenderLocation', x : 0, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', width : 800, height : 60 }
        ]
    };

    GuiRenderer.archetypes.scoretotal =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        instructions: [
            { command : 'setRenderLocation', x : tx, locationName : 'centre' },
            { command : 'renderText', pointSize : 42, spacing : 2.5, boxWidth : 500, boxHeight: 64, upperCase : true, align : 0, text : 'TOTAL SCORE' },
            { command : 'setRenderLocation', x : -tx, locationName : 'centre' },
            GuiRenderer.scoreTB = { command : 'renderText', pointSize : 42, spacing : 2.5, boxWidth : 200, boxHeight : 64, upperCase : true, align : 2 }
        ]
    };

    GuiRenderer.archetypes.nextButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [80, 57],
        offsetY : titleOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'nextButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : 250, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'NEXT' }
        ]
    };

    GuiRenderer.archetypes.retryButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [80, 57],
        offsetY : titleOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'nextButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : 250, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'RETRY' }
        ]
    };

    var hoverFade = 0.2;
    GuiRenderer.archetypes.nextButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : 250, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    GuiRenderer.archetypes.fullStar =
    {
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/star.dds' }
        ]
    };
    GuiRenderer.archetypes.fadedStar =
    {
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/star.dds', color: [1, 1, 1, 0.35] }
        ]
    };

    GuiRenderer.archetypes.stageSelect =
    {
        instructions: [
            {
                command: 'setRenderLocation',
                x : 0,
                y : -46, // + 25 * n
                locationName : 'centre'
            },
            {
                command: 'renderText', pointSize : 16, spacing: 1.5,
                boxWidth: 140, boxHeight: 40, upperCase: true, align: 1,
                color: [1, 1, 1, 0.75],
                text: 'MISSION SELECT'
            },

            { command : 'offsetCentre', x : 0, y : 14 },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleX : 1.85, scaleY : 1.25, color : [13 / 255, 24 / 255, 26 / 255, 1.0]},
            { command : 'offsetCentre', x : 0, y : -14 }

        ]
    };

    GuiRenderer.missionText = [];
    function debugMission(n)
    {
        GuiRenderer.archetypes["mission" + (n + 1)] =
        {
            dontScaleOnOver: true,
            overArchetype : 'mission' + (n+1) + 'Over',
            fadeOutTime : 0.15,
            fadeType: "alpha",
            buttonSize : [110, 50],
            instructions: [
                {
                    command: 'setRenderLocation',
                    x : 135 * (-1.5 + n),
                    y : -20, // + 25 * n
                    locationName : 'centre'
                },
                GuiRenderer.missionText[n] = {
                    command: 'renderText', pointSize : 24, spacing: 1.5,
                    boxWidth: 140, boxHeight: 40, upperCase: true, align: 1,
                    color: [1.0, 1.0, 1.0, 1.0],
                    text: 'MISSION ' + (n + 1) //, text_ja: 'ステージ　' + (n + 1)
                }
            ]
        };

        GuiRenderer.archetypes['mission' + (n+1) + 'Over'] =
        {
            fadeInTime: hoverFade,
            fadeOutTime: hoverFade,
            fadeType: "alpha",
            instructions : [
                { command : 'setRenderLocation',
                  x : 135 * (-1.5 + n),
                  y : -20, // + 25 * n
                  locationName : 'centre'
                },
                { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleX : 0.4, scaleY : 0.5 }
                ]
            };

    }
    debugMission(0);
    debugMission(1);
    debugMission(2);
    debugMission(3);

    GuiRenderer.archetypes.pauseBase =
    {
        fadeType: "alpha",
        fadeInTime: 0.4,
        fadeOutTime: 0.4,
        instructions: [
            { command : 'setRenderLocation', x : 0, y : 0, locationName : 'centre' },
            { command : 'renderSprite', texturePath: null, color: [98 / 255, 148 / 255, 154 / 255, 0.9], width : 2048, height : 2048 },

            { command : 'setRenderLocation', x : 0, y : 54, locationName : 'centre' },
            { command : 'renderSprite', texturePath: 'textures/gui_separator_line.dds', textureNoMipmaps: true, scaleX : 1.65, scaleY : 1.0, color: [1, 1, 1, 0.3] }
        ]
    };

    var resumeOffsetY = -110;
    GuiRenderer.archetypes.resumeButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : resumeOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'resumeButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : resumeOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5,
              boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
              text : 'RESUME', text_ja : 'ゲームに戻る'
            }
        ]
    };
    GuiRenderer.archetypes.resumeButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : resumeOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var restartOffsetY = -52;
    GuiRenderer.archetypes.restartButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : restartOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'restartButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : restartOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5,
              boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
              text : 'RESTART LEVEL', text_ja: 'リスタート' }
        ]
    };
    GuiRenderer.archetypes.restartButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : restartOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var exitToMenuOffsetY = 6;
    GuiRenderer.archetypes.exitToMenuButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : exitToMenuOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'exitToMenuButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : exitToMenuOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5,
              boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
              text : 'EXIT TO MENU', text_ja: 'タイトルへ戻る' }
        ]
    };
    GuiRenderer.archetypes.exitToMenuButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : exitToMenuOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var inversionOffsetY = 97;
    GuiRenderer.archetypes.inversionButtonY =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : inversionOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'inversionButtonOverY',
        instructions : [
            { command : 'setRenderLocation', x : 200, y : inversionOffsetY, locationName : 'centre' },
            GuiRenderer.inversionTextY = { command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.inversionButtonOverY =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 200, y : inversionOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    GuiRenderer.archetypes.inversionButtonX =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : inversionOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'inversionButtonOverX',
        instructions : [
            { command : 'setRenderLocation', x : -200, y : inversionOffsetY, locationName : 'centre' },
            GuiRenderer.inversionTextX = { command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.inversionButtonOverX =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : -200, y : inversionOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var audioOffsetY = 155;
    var audioOffsetX = -240;
    GuiRenderer.archetypes.audioButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [190, 57],
        offsetX : audioOffsetX,
        offsetY : audioOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'audioButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : audioOffsetX, y : audioOffsetY, locationName : 'centre' },
            GuiRenderer.audioText = { command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.audioButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : audioOffsetX, y : audioOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleY : 1.0, scaleX: 0.6 }
        ]
    };

    var audioMusicOffsetX = -10;
    GuiRenderer.archetypes.audioMusicButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [200, 57],
        offsetX : audioMusicOffsetX,
        offsetY : audioOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'audioMusicButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : audioMusicOffsetX, y : audioOffsetY, locationName : 'centre' },
            GuiRenderer.audioMusicText = { command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.audioMusicButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : audioMusicOffsetX, y : audioOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleY : 1.0, scaleX: 0.6 }
        ]
    };

    var audioVoicesOffsetX = 240;
    GuiRenderer.archetypes.audioVoicesButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [210, 57],
        offsetX : audioVoicesOffsetX,
        offsetY : audioOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'audioVoicesButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : audioVoicesOffsetX, y : audioOffsetY, locationName : 'centre' },
            GuiRenderer.audioVoicesText = { command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.audioVoicesButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : audioVoicesOffsetX, y : audioOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0, scaleX: 0.5 }
        ]
    };

    var advSpeedOffsetY = 213;
    GuiRenderer.archetypes.advSpeedButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [700, 57],
        offsetY : advSpeedOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'advSpeedButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : advSpeedOffsetY,
              locationName : 'centre' },
            GuiRenderer.advSpeedText = {
                command : 'renderText', pointSize : 28,
                color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5,
                boxWidth: 800, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.advSpeedButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : advSpeedOffsetY,
              locationName : 'centre' },
            { command : 'renderSprite',
              texturePath : 'textures/title_hovergradient.dds', scale : 1.0,
            scaleX: 1.4 }
        ]
    };

    var languageOffsetY = 271 + 58;
    GuiRenderer.archetypes.languageButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : languageOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'languageButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : languageOffsetY,
              locationName : 'centre' },
            GuiRenderer.languageText = {
                command : 'renderText', pointSize : 28, color : [255 / 255, 255 / 255, 255 / 255, 0.75], spacing: 1.5,
                boxWidth: 420, boxHeight: 64, upperCase : true, align : 1 }
        ]
    };
    GuiRenderer.archetypes.languageButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : languageOffsetY,
              locationName : 'centre' },
            { command : 'renderSprite',
              texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var titleOffsetY = 265;
    GuiRenderer.titleButtonLoc = {
        command : 'setRenderLocation',
        x : 0, y : titleOffsetY, locationName : 'centre',
        defaultY: titleOffsetY
    };
    GuiRenderer.archetypes.titleButton =
    {

        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : titleOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'titleButtonOver',
        instructions : [
            GuiRenderer.titleButtonLoc,
            { command : 'applyPulseScale', frequency : 1.0, amplitudeDiff : 0.025 },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : false, align : 1,
              text : 'CLICK OR TAP TO START',
              text_ja: 'クリック OR タップ'
            },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleX : 1.5, scaleY : 1.0 }

        ]
    };

    hoverFade = 0.2;
    GuiRenderer.archetypes.titleButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            GuiRenderer.titleButtonLoc,
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleX : 1.5, scaleY : 1.0 },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scaleX : 1.5, scaleY : 1.0 }

        ]
    };

    var startOffsetY = 50;
    GuiRenderer.archetypes.startButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'startButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'START' }
        ]
    };
    GuiRenderer.archetypes.startButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };
    GuiRenderer.archetypes.continueButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'startButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'CONTINUE' }
        ]
    };

    var newGameOffsetY = 50 + 60;
    GuiRenderer.archetypes.newGameButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'newGameButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : newGameOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'NEW GAME' }
        ]
    };
    GuiRenderer.archetypes.newGameButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : newGameOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var roamOffsetY = 30 + 60 + 60 + 50 + 60;
    GuiRenderer.archetypes.roamButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : roamOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'roamButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : roamOffsetY, locationName : 'centre' },
            GuiRenderer.roamText = {
                command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
                text : 'FREE FLIGHT'
                // text_ja: 'エクスプローラーモード'
            }
        ]
    };
    GuiRenderer.archetypes.roamButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : roamOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var arcadeModeOffsetY = 30 + 60 + 60 + 50;
    var arcadeModeOffsetX = 0;
    GuiRenderer.archetypes.arcadeModeButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetX : arcadeModeOffsetX,
        offsetY : arcadeModeOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'arcadeModeButtonOver',
        instructions : [
            { command : 'setRenderLocation', locationName : 'centre',
              x : arcadeModeOffsetX, y : arcadeModeOffsetY },
            GuiRenderer.arcadeModeText = {
                command : 'renderText', pointSize : 32, spacing: 1.5,
                boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
                text : 'MISSION MODE'
                // text_ja : 'アーケードモード'
            }
        ]
    };
    GuiRenderer.archetypes.arcadeModeButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', locationName : 'centre',
              x : arcadeModeOffsetX, y : arcadeModeOffsetY },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    startOffsetY = 50;
    GuiRenderer.archetypes.confirmResetText =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'confirmResetButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5,
              boxWidth: 420, boxHeight: 64, upperCase : true, align : 1,
              text : 'RESET SAVED PROGRESS?', text_ja: 'セーブデータを削除しますか？'
            }
        ]
    };

    startOffsetY = 50 + 60;
    GuiRenderer.archetypes.confirmResetButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'confirmResetButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'OK' }
        ]
    };
    GuiRenderer.archetypes.confirmResetButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    startOffsetY = 50 + 60 + 60;
    GuiRenderer.archetypes.backButton =
    {
        fadeOutTime : 0.15,
        fadeType: "alpha",
        buttonSize : [380, 57],
        offsetY : startOffsetY,
        dontScaleOnOver: true,
        overArchetype : 'backButtonOver',
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderText', pointSize : 32, spacing: 1.5, boxWidth: 420, boxHeight: 64, upperCase : true, align : 1, text : 'CANCEL' }
        ]
    };
    GuiRenderer.archetypes.backButtonOver =
    {
        fadeInTime: hoverFade,
        fadeOutTime: hoverFade,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 0, y : startOffsetY, locationName : 'centre' },
            { command : 'renderSprite', texturePath : 'textures/title_hovergradient.dds', scale : 1.0 }
        ]
    };

    var dialX =  20 + 64;
    var dialY = -20 - 64;

    var boostX = 144 + 64;
    var boostY = - 64 + 25;

    var pauseX = 20 + 20;
    var pauseY = -150 - 24;
    var pauseCutsceneY = -150 - 24 - 52;

    GuiRenderer.archetypes.hud =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions : [
            { command : 'setRenderLocation', x : 200 / 1.5, y : -140 / 1.5, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hud_cornershadow.dds', width : 400 / 1.5, height: 280 / 1.5, scale : 1.0 },
            // { command : 'setRenderLocation', x : -200 / 1.5, y : 140 / 1.5, locationName : 'topRight' },
            // { command : 'renderSprite', texturePath : 'textures/hud_cornershadow.dds', width : 400 / 1.5, height: 280 / 1.5, scale : 1.0, scaleY: -1.0, scaleX: -1.0 },
            { command : 'setRenderLocation', x : -200 / 1.5, y : -140 / 1.5, locationName : 'bottomRight' },
            { command : 'renderSprite', texturePath : 'textures/hud_cornershadow.dds', width : 400 / 1.5, height: 280 / 1.5, scale : 1.0, scaleX: -1.0 },
            // { command : 'setRenderLocation', x : 200 / 1.5, y : 140 / 1.5, locationName : 'topLeft' },
            // { command : 'renderSprite', texturePath : 'textures/hud_cornershadow.dds', width : 400 / 1.5, height: 280 / 1.5, scale : 1.0, scaleY: -1.0 },

            { command : 'setRenderLocation', x : dialX, y : dialY, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hud_speed_bg.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 1.0] },
            GuiRenderer.dialRenderArc = { command : 'renderArc', texturePath : null, color: [98 / 255, 254 / 255, 214 / 255, 0.25],
                innerRadius: 53, outerRadius: 65 },
            GuiRenderer.dialRenderArcInner = { command : 'renderArc', texturePath : null, color: [92 / 255, 237 / 255, 255 / 255, 1],
                innerRadius: 54, outerRadius: 64 },
            GuiRenderer.dialNotch = { command : 'renderSprite', texturePath : 'textures/hud_speed_notch.dds', scale : 1.05 },

            { command : 'setRenderLocation', x : boostX, y : boostY, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hud_boost_bg.png', textureNoMipmaps: true, scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 1.0] },
            GuiRenderer.boostRenderBar = { command : 'renderQuad', texturePath : null, color: [92 / 255, 237 / 255, 255 / 255, 1],
                x0: -60, x2: -60,
                y0: 5, y2: 10, y3: 10 }
        ]
    };

    var scoreTextX = -20 -5;
    var scoreTextY = -98 -5;

    var valueTextX = -20 -5;
    var valueTextY = -70 -5;

    GuiRenderer.archetypes.hudScore =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'setRenderLocation', x : scoreTextX, y : scoreTextY, locationName : 'bottomRight' },
            { command : 'renderText', pointSize : 19.5, spacing: 1.5, boxWidth: 100, boxHeight: 50, upperCase : true, align : 2, text : 'SCORE' },

            { command : 'setRenderLocation', x : valueTextX, y : valueTextY, locationName : 'bottomRight' },
            GuiRenderer.scoreValueText = { command : 'renderText', pointSize : 40, spacing: 1, boxWidth: 200, boxHeight: 70, upperCase : true, align : 2, text : '' }
        ]
    };

    var timeTextX = -20;
    var timeTextY = -128 - 45;

    var timeValueTextX = -20;
    var timeValueTextY = -98 - 45;

    GuiRenderer.archetypes.hudTime =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'setRenderLocation', x : timeTextX, y : timeTextY, locationName : 'bottomRight' },
            { command : 'renderText', pointSize : 19.5, spacing: 1.5, boxWidth: 100, boxHeight: 50, upperCase : true, align : 2, text : 'TIME' },

            { command : 'setRenderLocation', x : timeValueTextX, y : timeValueTextY, locationName : 'bottomRight' },
            GuiRenderer.timeValueText = { command : 'renderText', pointSize : 40, spacing: 1, boxWidth: 200, boxHeight: 70, upperCase : true, align : 2, text : '' }
        ]
    };

    GuiRenderer.archetypes.hudArrowLeft =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'applyPulseScale', frequency : 0.75, amplitudeDiff : 0.25 },
            { command : 'renderSprite', texturePath : 'textures/hud_offscreen_arrow.dds', scale : 1.0, angleOffset : -Math.PI * 0.5 }
        ]
    };
    GuiRenderer.archetypes.hudArrowRight =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'applyPulseScale', frequency : 0.75, amplitudeDiff : 0.25 },
            { command : 'renderSprite', texturePath : 'textures/hud_offscreen_arrow.dds', scale : 1.0, angleOffset : Math.PI * 0.5 }
        ]
    };
    GuiRenderer.archetypes.hudArrowUp =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'applyPulseScale', frequency : 0.75, amplitudeDiff : 0.25 },
            { command : 'renderSprite', texturePath : 'textures/hud_offscreen_arrow.dds', scale : 1.0, angleOffset : 0 }
        ]
    };
    GuiRenderer.archetypes.hudArrowDown =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'applyPulseScale', frequency : 0.75, amplitudeDiff : 0.25 },
            { command : 'renderSprite', texturePath : 'textures/hud_offscreen_arrow.dds', scale : 1.0, angleOffset : Math.PI }
        ]
    };

    GuiRenderer.hudPauseLocationX = pauseX;
    GuiRenderer.hudPauseLocationY = pauseY;
    GuiRenderer.archetypes.hudPause =
    {
        layer : 10,
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        buttonRadius : 19,
        instructions : [
            { command : 'setRenderLocation', x : pauseX, y : pauseY, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hud_button_pause.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 1.0] }
        ]
    };

    var stallX = 128 + 64;
    var stallY = -64 - 32;
    GuiRenderer.archetypes.hudStall =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'setRenderLocation', x : stallX, y : stallY, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hub_stall_notifier.dds', scale : 1.0 }
        ]
    };

    boostX = 128 + 64 + 4;
    boostY = -64;
    GuiRenderer.archetypes.hudBoost =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'setRenderLocation', x : boostX, y : boostY, locationName : 'bottomLeft' },
            { command : 'renderSprite', texturePath : 'textures/hub_accel_notifier.dds', scale : 1.0 }
        ]
    };

    GuiRenderer.archetypes.hudBullsEye =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_bg.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 0.75] },
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_success.dds', scale : 1.0, color: [243 / 255, 224 / 255, 53 / 255, 1] }
        ]
    };
    GuiRenderer.archetypes.hudInner =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_bg.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 0.75] },
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_success.dds', scale : 1.0, color: [243 / 255, 224 / 255, 53 / 255, 1] }
        ]
    };
    GuiRenderer.archetypes.hudMid =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_bg.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 0.75] },
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_success.dds', scale : 1.0, color: [243 / 255, 224 / 255, 53 / 255, 1] }
        ]
    };
    GuiRenderer.archetypes.hudOuter =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_bg.dds', scale : 1.0, color: [255 / 255, 255 / 255, 255 / 255, 0.75] },
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_success.dds', scale : 1.0, color: [243 / 255, 224 / 255, 53 / 255, 1] }
        ]
    };
    GuiRenderer.archetypes.hudMiss =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_missed.dds', scale : 1.0 }
        ]
    };
    GuiRenderer.archetypes.hudUncollected =
    {
        fadeOutTime : 0.25,
        fadeInTime : 0.25,
        fadeType: "alpha",
        instructions: [
            { command : 'renderSprite', texturePath : 'textures/hud_pickup_uncollected.dds', scale : 1.0 }
        ]
    };

})();
