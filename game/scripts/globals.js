//
//  A holder object for;
//      devices
//
//      requesthandler
//
//      managers
//
//      scene?
//      sceneloader?
//      simplesceneloader?
//

/*global Config: false*/

function Globals() {}

Globals.prototype =
{
    destroy : function globalsDestroyFn()
    {
        var propertyName;

        for (propertyName in this)
        {
            if (this.hasOwnProperty(propertyName))
            {
                if (this[propertyName] && this[propertyName].destroy && typeof this[propertyName].destroy === "function")
                {
                    this[propertyName].destroy();
                }

                this[propertyName] = null;
            }
        }
    }
};

Globals.create = function globalsCreateFn()
{
    var globals                  = new Globals();
// architect
    globals.allowCheats          = false;
    globals.enableEditor         = false;
    globals.profileCheats        = false;
    globals.enableEditor         = false;
    globals.cheats               =
    {
        godMode                  : false,
        invisibleMode            : false,
        silentMode               : false,
        grindless                : false
    };

    globals.debugDrawFlags =
    {
        hoopOrders : false,
        hoopGeometry : false,
        physics : false,
        birds : false,
        clouds : false,
        disableImposters : false,
        scene : true,
        sceneRenderableExtents : false,
        sceneDynamicNodesAABB : false,
        sceneStaticNodesAABB : false,
        shadowMap : false,
        silhouetteBuffer : false,
        colorBuffer : false,
        finalBuffer : false,
        simpleSprites : true,
        ui : true,
        timeGPURendering : false,
        camera : false
    };

    globals.releaseDebugUI = false;

    if (Config.debugEnableWireframe)
    {
        globals.debugDrawFlags.sceneWireframe = false;
    }

    globals.debugDrawUIGroup = null;

    globals.graphicsDevice       = null;
    globals.mathDevice           = null;
    globals.inputDevice          = null;
    globals.physicsDevice        = null;
    globals.soundDevice          = null;

    globals.mappingTable         = null;

    globals.requestHandler       = null;
    globals.gameSession          = null;

    globals.animationManager     = null;
    globals.textureManager       = null;
    globals.soundManager         = null;
    globals.shaderManager        = null;
    globals.effectManager        = null;
    globals.particleManager      = null;

    globals.leaderboardManager   = null;
    globals.userDataManager      = null;
    globals.storeManager         = null;

    globals.renderer               = null;
    globals.scene                  = null;
    globals.sceneLoader            = null;
    globals.simpleSceneLoader      = null;
    globals.simpleFontRenderer     = null;
    globals.simpleBlendStyle       = null;
    globals.simpleSpriteRenderer   = null;
    globals.guiRenderer            = null;
    globals.gamePostEffects        = null;

    globals.wallManager          = null;

    globals.debugDraw            = null;

    globals.camera               = null;

    globals.gameCurrentTime      = 0;
    globals.gameTimeStep         = 0;
    globals.physTimeStep         = 0;
    globals.gameAppTimeStep      = 0;

    globals.appCurrentTime       = 0;
    globals.appTimeStep          = 0;
    globals.appFPS               = 0;

    globals.gameManager          = null;

    globals.metricsManager       = null;
    globals.gameBadgeManager     = null;
    globals.gamePurchaseManager  = null;

    globals.console              = null;

    globals.dynamicUI            = null;

    globals.draw2D               = null;

    globals.performanceTimer     = null;

    globals.saveData             = null;

    globals.eventBroadcast       = null;

    globals.clearColor           = new Float32Array([98 / 255, 148 / 255, 154 / 255, 1.0]);

    globals.settings             =
    {
        volume                   : 1.0,
        musicVolume              : 1.0,
        voicesVolume             : 1.0,
        shadows                  : true
    };

    return globals;
};
