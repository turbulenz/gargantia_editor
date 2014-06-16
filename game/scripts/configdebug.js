// Copyright (c) 2013 Turbulenz Limited

//
//  Config DEBUG
//

/*exported Config*/

var Config =
{
    //Version
    version : '0.9',
    saveVersionNumber : 1,

    versionMessage : 'DEBUG CONFIG',

    infoText :  'Work in progress.',
    drawInfoText : false,

    //Rendering.
    cameraNearPlane : 3.0,
    cameraFarPlane : 14000.0,
    imposterPageSize: 1024,

    //Performance.
    targetFPS : 60,
    variableStep : false,

    //Startup.
    useLoadingBar : true,   // If you set this to false shaders etc may not work.
    useSplashScreens : false,
    skipToMission : true,

    //Debugging.
    maxDebugLines : 16384,
    cheats : true,
    resetKey : true,
    debugText : true,               //Needs to be enabled for the following things to work at all.
    debugUpdate : false,            //Requires debugText.
    debugRender : false,            //Requires debugText.
    debugNav : false,               //Requires debugText.
    profiling : false,              // Forces cheats
    debugEnableWireframe : true,    // Keeps copy of vertex data
    debugDrawGameSpaces : false,
    debugSliders : true,
    enableDynamicUI : true,
    addArchetypeSliders : false,
    debugWebGL : false,
    debugDrawHoops : false,

    // Audio
    disableSound : false,

    //Controller.
    controlOneButton : false,
    controlWasd : true,
    controlPad : true,

    //Levels
    startUpLevelPath : 'levels/mission_1.json',

    starsEnabled : true,
    levelProgressionStartIndex : 100,
    levelProgressionEndIndex : 100,

    //Editor
    enableEditor : true,
    editorScreenShotMode : false,

    //Mouse lock
    lockMouseInGame : false,
    lockMouseInMenus : false,
    enableCustomCursors : true,

    //Music enabled.
    musicEnabled : false,

    //Whether to render to a render buffer
    useRenderBuffer : false,
    renderBufferWidth : null,// - use device width
    renderBufferHeight : null // - use device height
};
