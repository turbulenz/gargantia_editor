//
// Loading play state of game
//
//
/*global Config: false*/
/*global GameManager: false*/
/*global GamestatePlaying: false*/
/*global GuiRenderer: false*/
/*global LevelArchetypes: false*/
/*global TurbulenzEngine: false*/

function GamestateLoading() {}

GamestateLoading.prototype =
{
    name : 'GamestateLoading',

    enterState : function gamestateLoadingEnterStateFn()
    {
        var gameManager = this.gameManager;
        var level = this.levelToLoad;

        // If a level has been specified, load it, otherwise we are
        // just a spinner screen.

        if (level)
        {
            gameManager.getGameClock().start();
            gameManager.loadLevel(this.levelToLoad.path, false);

            var gameController = gameManager.getGameController();
            gameController.setActive(true);
            gameController.setModeCutsceneScreen();
        }

        gameManager.gameSoundManager.stopAllSounds(0.25);
        gameManager.gameParticleManager.stopAllParticles();
    },

    exitState : function gamestateLoadingExitStateFn()
    {
    },

    skipCurrentCutsceneScreen : function gameStateCutSceneSkipCurrentCutsceneScreen()
    {
        if (this.currentTextureIdx < this.numTextures - 1)
        {
            // If we are already fading, ignore.

            if (-1 === this.fadeStartTime)
            {
                this.fadeStartTime = TurbulenzEngine.getTime();
                this.fadeOut = true;
            }
        }
        else
        {
            if (!this.loading && !this.finished)
            {
                this.fadeStartTime = TurbulenzEngine.getTime();
                this.fadeOut = true;
                this.finished = true;
            }
        }
    },

    update : function gamestateLoadingUpdateFn()
    {
        if (!this.levelToLoad)
        {
            return;
        }

        var gameManager = this.gameManager;
        var gameController = gameManager.gameController;
        gameController.update();

        var loading = gameManager.getLoading();
        this.loading = loading;

        if (this.currentTextureIdx < this.numTextures ||
            loading ||
            (this.globals.soundManager && this.globals.soundManager.getNumPendingSounds()))
        {
            return;
        }

        gameManager.getGameClock().start();
        var gamestatePlaying = GamestatePlaying.create(this.gameManager, this.globals, this.levelToLoad.type);
        gamestatePlaying.setLevel(this.levelToLoad);
        this.gameManager.setGameState(gamestatePlaying);
    },

    draw : function gamestateLoadingDrawFn()
    {
    },

    get : function gamestateLoadingGet(path)
    {
        var tm = this.globals.textureManager;
        var asset = tm.get(path);
        return (asset === tm.get("")) ? null : asset;
    },

    draw2D : function gamestateLoadingDraw2DFn()
    {
        var gameManager    = this.gameManager;
        var gameController = gameManager.getGameController();
        var gd = this.globals.graphicsDevice;
        var draw2D = this.globals.draw2D;
        var time = TurbulenzEngine.getTime();

        var width =  gd.width;
        var height = gd.height;

        var loadingX = width - 75;
        var loadingY = height - 59;

        gameManager.drawGUI();
        gameController.draw2D();

        draw2D.begin("alpha", "deferred", true);

        // background color or texture

        var background = this.background;
        var backgroundTexture = background?(this.get(background)):null;

        if (backgroundTexture)
        {
            draw2D.draw({
                texture: backgroundTexture,
                destinationRectangle: [0, 0, width, height]
            });
        }
        else
        {
            draw2D.draw({
                texture: null,
                destinationRectangle: [0, 0, width, height],
                color: this.bgcolor
            });
        }

        draw2D.end();

        var simpleFontRenderer = this.globals.simpleFontRenderer;

        // Spinner

        var lrR = 1;
        var lrG = 1;
        var lrB = 1;
        var lrA = 1;

        var period = 2000;
        var loadingProgress =
            (time - (Math.floor(time / period) * period)) / period;

        var startV;
        var endV;
        if (loadingProgress < 0.5)
        {
            startV = 0;
            endV = 2 * loadingProgress;
        }
        else
        {
            startV = 2 * (loadingProgress - 0.5);
            endV = 1;
        }

        var showSpinner = this.loading || (time < this.minLoadingTime);
        var loadingRing;
        var startRing;
        if (showSpinner && (loadingRing = this.get(this.loadingRingPath)))
        {
            draw2D.begin("alpha", "deferred", true);

            draw2D.draw({
                texture: loadingRing,
                destinationRectangle: [loadingX - loadingRing.width  / 1.83,
                                       loadingY - loadingRing.height / 1.83,
                                       loadingX + loadingRing.width  / 1.83,
                                       loadingY + loadingRing.height / 1.83],
                color: [lrR, lrG, lrB, 0.25 * lrA]
            });

            this.globals.guiRenderer.renderArc({
                innerRadius: 28,
                outerRadius: 34,
                overrideArcMin: startV,
                overrideArcMax: endV,
                color: [lrR, lrG, lrB, 0.075 * lrA]
            }, {
                _x: loadingX,
                _y: loadingY,
                _scaleX: 1.0
            });
            this.globals.guiRenderer.renderArc({
                innerRadius: 29,
                outerRadius: 33,
                overrideArcMin: startV,
                overrideArcMax: endV,
                color: [lrR, lrG, lrB, 0.075 * lrA]
            }, {
                _x: loadingX,
                _y: loadingY,
                _scaleX: 1.0
            });
            this.globals.guiRenderer.renderArc({
                innerRadius: 30,
                outerRadius: 32,
                overrideArcMin: startV,
                overrideArcMax: endV,
                color: [lrR, lrG, lrB, 0.125 * lrA]
            }, {
                _x: loadingX,
                _y: loadingY,
                _scaleX: 1.0
            });
            draw2D.end();
        }
        else if (!showSpinner && (startRing = this.get(this.startRingPath)))
        {
            draw2D.begin("alpha", "deferred", true);

            draw2D.draw({
                texture: startRing,
                destinationRectangle: [loadingX - startRing.width  / 1.83,
                                       loadingY - startRing.height / 1.83,
                                       loadingX + startRing.width  / 1.83,
                                       loadingY + startRing.height / 1.83],
                color: [lrR, lrG, lrB, lrA]
            });
            draw2D.end();

            simpleFontRenderer.drawFont(this.currentTextureIdx >= this.numTextures - 1 ? "START" : "NEXT", {
                x: loadingX,
                y: loadingY - 65,
                pointSize: 22,
                alignment: 1,
                spacing: 2.5,
                valignment: 0,
                color: [1, 1, 1, 1]
            });
        }
    },

    getGameManager : function gamestateplayingGetGameManagerFn()
    {
        return  this.gameManager;
    },

    getMessage : function gamestateplayingGetMessageFn(lang, screen)
    {
        debug.assert(lang);
        var msgList = GamestateLoading.messages[screen][lang];
        var msgIdx = Math.floor(Math.random() * msgList.length);
        return msgList[msgIdx];
    },

    setLevelToLoad : function setLevelToLoad(levelToLoad)
    {
        this.levelToLoad = levelToLoad;
    }
};

GamestateLoading.create = function gamestateLoadingCreateFn(gameManager, globals)
{
    var state = new GamestateLoading();

    state.gameManager = gameManager;
    state.globals     = globals;
    state.levelToLoad = LevelArchetypes[Config.startUpLevelPath];

    // state.backgroundPath = GamestateLoading.backgroundPath;
    state.loadingRingPath = GamestateLoading.loadingRingPath;
    state.startRingPath = GamestateLoading.startRingPath;
    // state.separatorPath = GamestateLoading.separatorPath;
    state.fadeTime = GamestateLoading.fadeTime;
    state.minLoadingTime = TurbulenzEngine.getTime() +
        GamestateLoading.minLoadingTime;

    state.messages = null;
    state.fontStyle = null;

    var bgcol = GuiRenderer.scorebgBG.color;
    state.bgcolor = [bgcol[0], bgcol[1], bgcol[2], 1];

    state.loading = true;
    state.background = null;
    state.textures = [];
    state.currentTextureIdx = 0;
    state.fadeStartTime = -1;
    state.fadeOut = false;
    state.finished = false;
    state.numTextures = 0;

    globals.textureManager.load(GamestateLoading.loadingRingPath);
    globals.textureManager.load(GamestateLoading.startRingPath);

    return state;
};

GamestateLoading.loadingRingPath = "textures/gui_loading_ring.dds";
GamestateLoading.startRingPath = "textures/loading_button_continue.dds";

GamestateLoading.fadeTime = 500;
GamestateLoading.minLoadingTime = 2000;

GameManager.gameStateCreationMap.GamestateLoading = GamestateLoading;
