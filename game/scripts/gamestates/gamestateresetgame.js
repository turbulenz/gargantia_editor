//
// StartGame - removes old game gamespaces/entities and sets up the new gamespaces/entities for the game
//

/*global Config: false*/
/*global GameManager: false*/
/*global GamestateLevelStart: false*/

function GamestateResetGame() {}

GamestateResetGame.prototype =
{
    name : 'GamestateResetGame',

    enterState : function gamestateResetGameEnterStateFn()
    {
    },

    exitState : function gamestateResetGameExitStateFn()
    {
    },

    setNextStateName : function gamestateresetgameSetNextStateNameFn(nextStateName)
    {
        this.nextStateName = nextStateName;
    },

    clearAndStart : function gamestateresetgameClearAndStartFn()
    {
        var gameManager = this.gameManager;

        gameManager.clearGameSpaces();
        gameManager.gameCamera.reset();
        gameManager.reset();

        this.startGame();

        this.gameManager.gameSoundManager.stopAllSounds(0.25);
        this.gameManager.gameParticleManager.stopAllParticles();

        this.gameManager.setPlayState(null);
    },

    update : function gamestateResetGameUpdateFn()
    {
        var gameManager = this.gameManager;

        gameManager.gameSoundManager.update();

        if (!this.hasCleared)
        {
            this.clearAndStart();
            this.hasCleared = true;
        }

        if (gameManager.getLoading())
        {
            return;
        }

        gameManager.gameCamera.setModeViewScene();

        gameManager.gameLighting.setShadowsEnabled(true);

        gameManager.gameSoundManager.setSoundsEnabled(true);

        gameManager.eventManager.notify('GameStarted');

        gameManager.updateGameSpaces();

        if (this.nextStateName)
        {
            gameManager.setGameStateByName(this.nextStateName);
        }
        else
        {
            // Move to start screen
            var gamestateLevelStart = GamestateLevelStart.create(gameManager, this.globals);
            gameManager.setGameState(gamestateLevelStart);
        }
    },

    draw : function gamestateResetGameDrawFn()
    {

    },

    draw2D : function gamestateResetGameDraw2DFn()
    {

    },

    startGame : function gamestateResetGameStartGameFn()
    {
        var gameManager = this.gameManager;
        var globals     = this.globals;
        var md          = globals.mathDevice;
        var gameClock   = gameManager.getGameClock();
        var gameCamera  = gameManager.getGameCamera();

        gameCamera.setDesiredPosition(md.v3Build(-1.0, 0.0, 0.0));
        gameCamera.setDesiredDirection(md.v3Build(0.0, -2.5, 1.0));
        gameCamera.setDesiredFocus(md.v3Build(0.0, 0.0, 0.0));
        gameCamera.setDesiredFOV(60);
        gameCamera.snap();

        // Start clock before loading level so that time is correct for new game
        gameClock.start();
        globals.gameCurrentTime = gameClock.getCurrentTime();
        globals.gameTimeStep    = gameClock.getTimeStep();
    }
};

GamestateResetGame.create = function gamestateResetGameCreateFn(gameManager, globals)
{
    var state = new GamestateResetGame();

    state.gameManager = gameManager;
    state.globals     = globals;

    state.levelPath   = Config.startUpLevelPath;

    return state;
};

GameManager.gameStateCreationMap.GamestateResetGame = GamestateResetGame;
