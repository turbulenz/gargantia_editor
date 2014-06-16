//
// Playing state of game
//

/*global GamestatePlaying: false*/
/*global GamestateResetGame: false*/
/*global TurbulenzEngine: false*/
/*global TWEEN: false*/
/*global GameManager: false*/
/*global Draw2DSprite: false*/
/*global EntityComponentBase: false*/
/*global PlayStateBase: false*/

function notToBeDestroyed(entity)
{
    return !entity.toBeDestroyed;
}

function GamestatePlaying() {}

GamestatePlaying.prototype =
{
    name : 'GamestatePlaying',

    preload : function gamestatePlayingPreloadFn()
    {

    },

    setLevel : function gamestatePlayingSetLevelFn(level)
    {
        this.level = level;
    },

    enterState : function gamestatePlayingEnterStateFn()
    {
        var gameManager    = this.gameManager;
        var gameController = gameManager.getGameController();

        this.currentBrightness = 0.0;

        this.startFadeInTween();

        gameManager.exitPaused();

        gameController.setActive(true);
        gameController.setModeCommand();

        gameManager.onLeaveMenu();

        this.globals.renderer.setSkyColor(this.level.skyColor);
        this.globals.gameManager.cloudManager.setDusk(this.level.lighting !== "normal");

        var heroEntity = gameManager.heroEntity;
        if (!heroEntity)
        {
            heroEntity = gameManager.createHero('HeroDude', 'a_ledo');
            gameManager.setHero(heroEntity);
        }

        var previousPlaystate = gameManager.getPlayState();

        if (!this.currentPlayState && previousPlaystate)
        {
            previousPlaystate.gameStatePlayingOwner = this;
            this.setPlayState(undefined, previousPlaystate);
        }
        if (!this.currentPlayState)
        {
            this.setPlayState(this.levelPlayState);
        }
        else
        {
            this.currentPlayState.setLevel(this.level);
        }

        var gameSoundManager = gameManager.getGameSoundManager();
        gameSoundManager.play('aud_wind', null, null);

        this.update();

        this.globals.eventBroadcast.hideMenu();
    },

    exitState : function gamestatePlayingExitStateFn()
    {
        if (this.currentPlayState)
        {
            this.currentPlayState.deInit();
        }
        var gameManager    = this.gameManager;
        var gameSoundManager = gameManager.getGameSoundManager();
        gameSoundManager.stop('aud_wind');

        this.globals.eventBroadcast.showMenu();
    },

    onExitMission : function gamestatePlayingExtMissionFn()
    {
        this.globals.gameManager.birdManager.clear();
        this.globals.gameManager.cloudManager.clear();
    },

    update : function gamestatePlayingUpdateFn()
    {
        var gameManager = this.gameManager;

        gameManager.updateGame();

        gameManager.gameLighting.update();

        if (this.currentPlayState)
        {
            this.currentPlayState.update();
        }

        if (this.gameManager.getActiveGameState() !== this)
        {
            return;
        }

        gameManager.birdManager.update(1 / 60);
        gameManager.cloudManager.update(1 / 60);

        gameManager.updatePerformanceMetrics();

        this.updateButtons();
    },

    updateButtons : function gamestateplayingUpdateButtonsFn()
    {
    },

    startFadeInTween : function gamestatePlayingStartFadeInTween()
    {
        var that = this;

        var currentTime = TurbulenzEngine.time;

        this.fadeInTween = TWEEN.Create({brightness : 0.0})
            .to({brightness : 1.0}, this.fadeInTime)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function ()
                {
                    that.currentBrightness = this.brightness;
                })
            .onComplete(function ()
                {
        })
            .start(currentTime * 1000);
    },

    startFadeOutTween : function gamestatePlayingStartFadeOutTween(fadeOutDelay)
    {
        var that = this;

        var currentTime = TurbulenzEngine.time;

        var currentBrightness = this.currentBrightness;
        var fadeOutTime = this.fadeOutTime * currentBrightness;

        this.fadeOutTween = TWEEN.Create({brightness : currentBrightness})
            .to({brightness : 0.0}, fadeOutTime)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .delay(fadeOutDelay)
            .onUpdate(function ()
                {
                    that.currentBrightness = this.brightness;
                })
            .onComplete(function ()
                {
        })
            .start(currentTime * 1000);

        var gameManager = this.gameManager;

        gameManager.gameLighting.update();

        if (this.currentPlayState)
        {
            this.currentPlayState.update();
        }

        if (this.gameManager.getActiveGameState() !== this)
        {
            return;
        }

        gameManager.updateGame();

        gameManager.updatePerformanceMetrics();

        this.updateButtons();
    },

    draw : function gamestatePlayingDrawFn()
    {

        var gameManager    = this.gameManager;
        var gameController = gameManager.getGameController();

        gameManager.drawGameSpaces();

        gameController.draw();

    },

    draw2D : function gamestatePlayingDraw2DFn()
    {
        var gameManager = this.gameManager;
        var gameController = gameManager.getGameController();

        gameManager.drawGUI();
        gameController.draw2D();

        if (this.currentPlayState)
        {
            this.currentPlayState.draw2D();
        }
    },

    runSpawners : function runSpawnersFn()
    {
        var birds = EntityComponentBase.getEntitiesWithEC("ECBirdSpawner").filter(notToBeDestroyed);
        for (var i = 0; i < birds.length; i += 1)
        {
            birds[i].getEC("ECBirdSpawner").build();
        }

        var hero = this.globals.gameManager.heroEntity;
        var spawners = EntityComponentBase.getEntitiesWithEC("ECEntitySpawner").filter(notToBeDestroyed);
        for (i = 0; i < spawners.length; i += 1)
        {
            if (spawners[i].getEC("ECEntitySpawner").archetype.archetypeToSpawn !== "a_ledo")
            {
                spawners[i].getEC("ECEntitySpawner").spawnEntity();
                spawners[i].setToBeDestroyed();
            }
            else
            {
                var loco = hero.getEC("ECLocomotion");
                loco.respawn(spawners[i].getEC("ECEntitySpawner"));
                spawners[i].setToBeDestroyed();
            }
        }
        hero.getEC("ECScore").reset();
    },

    setPlayState : function gamestateplayingSetPlayStateFn(playStateName, playState)
    {
        if (this.currentPlayState)
        {
            this.currentPlayState.deInit();
        }

        if (!playState && playStateName)
        {
            playState = PlayStateBase.createFromName(playStateName, this, this.globals, undefined);
            this.runSpawners();
            this.globals.gameManager.gameCamera.setModeString(this.globals.gameManager.heroEntity);
        }

        this.currentPlayState   =   playState;
        this.currentPlayState.setLevel(this.level);
    },

    getGameManager : function gamestateplayingGetGameManagerFn()
    {
        return  this.gameManager;
    }
};

GamestatePlaying.vignette = "textures/vignette_cloud.dds";
GamestatePlaying.preload = function gamestatePlayingPreloadFn(globals)
{
    var textureManager = globals.textureManager;
    textureManager.load(GamestatePlaying.vignette);
};

GamestatePlaying.create = function gamestatePlayingCreateFn(gameManager, globals, levelPlayState)
{
    var state = new GamestatePlaying();

    state.gameManager = gameManager;
    state.globals     = globals;
    state.currentBrightness = 0.0;

    state.fadeInTime = 0.5;
    state.fadeOutTime = 0.5;

    state.fadeInTween = null;
    state.fadeOutTween = null;

    state.levelPlayState = levelPlayState || "PlayStateRoam";

    return state;
};

GameManager.gameStateCreationMap.GamestatePlaying = GamestatePlaying;
