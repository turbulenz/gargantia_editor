//
// GamestateMissionEnd
//
/*global debug*/
/*global ECScore: false*/
/*global GamestateLoading: false*/
/*global GuiRenderer: false*/
/*global LevelArchetypes: false*/
/*global TurbulenzEngine: false*/
/*global TWEEN: false*/

function GamestateMissionEnd() {}

GamestateMissionEnd.prototype =
{
    name : 'GamestateMissionEnd',

    preload : function gamestateMissionEndPreloadFn()
    {
    },

    enterState : function gamestateMissionEndEnterStateFn()
    {
        var gameManager    = this.gameManager;
        var gameController = gameManager.getGameController();

        gameController.setActive(true);
        gameController.setModeMissionEnd();

        this.currentBrightness = 0.0;
        this.startFadeInTween();

        gameManager.startPaused();

        var gameSoundManager = this.globals.gameManager.gameSoundManager;

        gameSoundManager.pauseNonMusic();
        if (this.missionRating > 0)
        {
            gameSoundManager.play('aud_missionSuccess');
        }
        else
        {
            gameSoundManager.play('aud_missionFailed');
        }
    },

    exitState : function gamestateMissionEndExitStateFn()
    {
        this.globals.eventBroadcast._send({event:"modalclose"});
        this.gameManager.exitPaused();
    },

    // Index of the level just played
    _getLevelIndex: function getLevelIndexFn()
    {
        debug.assert(this.level);
        return this.level.missionIndex;
    },

    _getNextLevel: function getNextLevelFn()
    {
        debug.assert(this.level);
        debug.assert(this.level.path);
        return LevelArchetypes[this.level.path];
    },

    _getSameLevel: function getSameLevelFn()
    {
        debug.assert(this.level);
        debug.assert(this.level.path);
        return LevelArchetypes[this.level.path];
    },

    enableInput : function gamestateMissionEndEnableInputFn(enable)
    {
        this._enableInput = enable;
    },

    update : function gamestateMissionEndUpdateFn()
    {
        var currentTime = TurbulenzEngine.time;
        var gameManager = this.gameManager;
        var guiButtons = gameManager.getGuiButtons();
        var md = this.globals.mathDevice;
        var gd = this.globals.graphicsDevice;
        var gameController = gameManager.getGameController();
        var enableInput = this._enableInput;
        var isJA = "ja" === gameManager.getLanguage();

        if (gameController && enableInput)
        {
            gameController.update();
        }

        TWEEN.update(currentTime * 1000, currentTime * 1000);

        var guiManager = gameManager.getGuiManager();
        var ecScore = gameManager.heroEntity.getEC("ECScore");

        var buttonId;
        var failState;
        if (this.missionRating > 0)
        {
            failState = "COMPLETE";
            buttonId = "nextButton";
        }
        else
        {
            failState = "FAILED";
            buttonId = "retryButton";
        }

        // Avoid using the "RETRY" button if this is a replay of the
        // level.  (Potentially we could use "OK" instead).

        if (this.gameAlreadyCompleted)
        {
            buttonId = "nextButton";
        }

        GuiRenderer.scorebgBG.width = gd.width;
        GuiRenderer.scorebgBG.height = gd.height;
        GuiRenderer.missionTitleUI.text = "MISSION " + failState;

        var metrics = [];
        var scoring = this.level.scoring;
        var alpha = 0.5;
        if (scoring.ringMid > 0.0)
        {
            metrics.push({
                title: "GOOD",
                value: "" + ecScore.ringMid,
                score: ECScore.scoreify(scoring.ringMid * ecScore.ringMid),
                valueColor: [1, 1, 1, alpha],
                scoreColor: [1, 1, 1, 1]
            });
        }
        if (scoring.ringInner > 0.0)
        {
            metrics.push({
                title: "GREAT",
                value: "" + ecScore.ringInner,
                score: ECScore.scoreify(scoring.ringInner * ecScore.ringInner),
                valueColor: [1, 1, 1, alpha],
                scoreColor: [1, 1, 1, 1]
            });
        }
        if (scoring.ringBullsEye > 0.0)
        {
            metrics.push({
                title: "PERFECT",
                value: "" + ecScore.ringBullsEye,
                score: ECScore.scoreify(scoring.ringBullsEye * ecScore.ringBullsEye),
                valueColor: [1, 1, 1, alpha],
                scoreColor: [1, 1, 1, 1]
            });
        }
        if (scoring.collectable > 0.0)
        {
            metrics.push({
                title: (isJA)?('COLLECTED BONUS'):('COLLECTED'),
                value: "" + ecScore.collectables,
                score: ECScore.scoreify(scoring.collectable * ecScore.collectables),
                valueColor: [1, 1, 1, alpha],
                scoreColor: [1, 1, 1, 1]
            });
        }
        else if (scoring.collectable < 0.0)
        {
            // pinion mission
            metrics.push({
                title: (isJA)?('MISSED'):('INCORRECT'),
                value: "" + ecScore.collectables,
                score: ECScore.scoreify(scoring.collectable * ecScore.collectables),
                valueColor: ecScore.collectables !== 0 ? [1, 0, 0, 0.5] : [1, 1, 1, 0.5],
                scoreColor: ecScore.collectables !== 0 ? [1, 0, 0, 1] : [1, 1, 1, 1]
            });
        }
        if (scoring.outoforder < 0.0)
        {
            metrics.push({
                title: (isJA)?('MISSED'):('OUT-OF-ORDER'),
                value: "" + ecScore.outoforder,
                score: ECScore.scoreify(scoring.outoforder * ecScore.outoforder),
                valueColor: ecScore.outoforder !== 0 ? [1, 0, 0, 0.5] : [1, 1, 1, 0.5],
                scoreColor: ecScore.outoforder !== 0 ? [1, 0, 0, 1] : [1, 1, 1, 1]
            });
        }
        if (scoring.ringMiss < 0.0)
        {
            metrics.push({
                title: "MISSED",
                value: "" + ecScore.ringMiss,
                score: ECScore.scoreify(scoring.ringMiss * ecScore.ringMiss),
                valueColor: ecScore.ringMiss !== 0 ? [1, 0, 0, 0.5] : [1, 1, 1, 0.5],
                scoreColor: ecScore.ringMiss !== 0 ? [1, 0, 0, 1] : [1, 1, 1, 1]
            });
        }
        if (scoring.timeBonus > 0.0)
        {
            metrics.push({
                title: "TIME BONUS",
                value: ECScore.timeify(Math.max(0, Math.floor(scoring.timer - this.missionFinishTime))),
                score: ECScore.scoreify(ecScore.getTimeScore(scoring, this.missionFinishTime)),
                valueColor: [1, 1, 1, alpha],
                scoreColor: [1, 1, 1, 1]
            });
        }

        metrics.push({
            title: "LEVEL SCORE",
            value: " ",
            score: ECScore.scoreify(this.missionScore),
            valueColor: [0, 0, 0, 0],
            scoreColor: [1, 1, 1, 1]
        });

        var tb = gd.height / 2 - 210;
        var ty = 40;

        var result = this.existingMissionResult;
        if (result)
        {
            tb += 50;
        }

        var numMetrics = metrics.length;
        tb += (6 - numMetrics) * ty * 0.5;

        var tb2 = tb + ty * (numMetrics + 1);
        var stary = tb2 - 25;
        var stary2 = tb2 + 120;
        var scorey = tb2 + 55;
        var missionScale = 0.7;
        guiManager.addDrawGui('scorebg', {}, 'scorebg');
        if (!result)
        {
            guiManager.addDrawGui('scorestarbg', { y: stary2 }, 'scorestarbg2');
        }
        guiManager.addDrawGui('scorestarbg', { y: stary, scaleY : missionScale }, 'scorestarbg');

        if (!result)
        {
            var totals = ECScore.calculateTotals();
            GuiRenderer.scoreTB.text = "" + ECScore.scoreify(totals.score);
            guiManager.addDrawGui('scoretotal', { y: scorey }, 'scoretotal');
        }

        var i;
        for (i = 0; i < numMetrics; i += 1)
        {
            var metric = metrics[i];
            GuiRenderer["score_metric_title_" + i].text = metric.title;
            GuiRenderer["score_metric_value_" + i].text = metric.value;
            GuiRenderer["score_metric_score_" + i].text = metric.score;
            GuiRenderer["score_metric_value_" + i].color = metric.valueColor;
            GuiRenderer["score_metric_score_" + i].color = metric.scoreColor;
            guiManager.addDrawGui('score_metric_' + i, { y: tb + ty * i }, 'score_metric_' + i);
        }

        var w = 50 * missionScale;
        var wb = gd.width / 2 - w;
        for (i = 0; i < this.missionRating; i += 1)
        {
            guiManager.addDrawGui('fullStar', { x : i * w + wb, y : stary, scale : missionScale }, 'star' + i);
        }
        for (i = this.missionRating; i < 3; i += 1)
        {
            guiManager.addDrawGui('fadedStar', { x : i * w + wb, y : stary, scale : missionScale }, 'star' + i);
        }

        if (!result)
        {
            w = 50;
            wb = gd.width / 2 - w;
            for (i = 0; i < totals.rating; i += 1)
            {
                guiManager.addDrawGui('fullStar', { x : i * w + wb, y : stary2 }, 'star2' + i);
            }
            for (i = totals.rating; i < 3; i += 1)
            {
                guiManager.addDrawGui('fadedStar', { x : i * w + wb, y : stary2 }, 'star2' + i);
            }
        }

        if (enableInput)
        {
            var nextPressed = guiButtons.doGuiButton(
                buttonId,
                { v2ScreenLocation: md.v2Build(gd.width / 2, gd.height / 2 + 250) },
                buttonId);
            if (nextPressed)
            {
                gameManager.clearMissionEnd();
            }
        }
    },

    startFadeInTween : function gamestateMissionEndStartFadeInTween()
    {
        var that = this;

        var currentTime = TurbulenzEngine.time;

        var fadeInTime = this.fadeInTime;

        this.fadeInTween = TWEEN.Create({brightness : 0.0})
            .to({brightness : 1.0}, fadeInTime)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function ()
                {
                    that.currentBrightness = this.brightness;
                })
            .onComplete(function ()
                {
                    that.fadeInTween = null;
                    that.currentBrightness = 1.0;
                })
            .start(currentTime * 1000);
    },

    startFadeOutTween : function gamestateMissionEndStartFadeOutTween(fadeOutDelay)
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
                    that.fadeOutTween = null;
                    that.clearMissionEnd();
                })
            .start(currentTime * 1000);
    },

    setLevelInfo: function gamestateLevelPassFn(level, finishTime)
    {
        debug.assert("string" !== typeof level);
        debug.assert("object" === typeof level);

        // We should have all the information we need to determine
        // what the next gamestate should be, and to start it loading.

        var scoring = level.scoring;
        var missionIndex = level.missionIndex;

        var globals = this.globals;
        var gameManager = globals.gameManager;
        var ecScore = gameManager.heroEntity.getEC("ECScore");
        var score = ecScore.computeScore(scoring, finishTime);
        var stars = ecScore.classifyScore(scoring, score);
        var arcadeMode = gameManager.getArcadeMode();

        var dontSendDMMCode = false;
        var allowSkip = false;

        score = (0 === stars) ? (0) : (score);

        this.level = level;
        this.missionScore = score;
        this.missionRating = stars;
        this.missionFinishTime = finishTime;

        this.existingMissionResult = ECScore.resultRecorded(missionIndex);

        if (undefined !== missionIndex)
        {
            // This was a proper mission.  Not free-flight.  Get the
            // completion state before we write SaveData

            var stagesCompleted = ECScore.getStagesCompleted();
            var saveData = globals.saveData;

            this.gameAlreadyCompleted = (4 === stagesCompleted);
            dontSendDMMCode = saveData.hasBeenCompleted();

            allowSkip = (stagesCompleted > missionIndex);

            // Write the score and calculate the totals.  Don't write
            // to saveData in arcade mode.

            if (0 < stars)
            {
                ECScore.recordResult(missionIndex, score, stars);
            }
            if (!arcadeMode)
            {
                saveData.setResultForMission(missionIndex, score, stars);
            }

            // Note that the totals calculation can return 0 if the
            // missions are played out of sequence.

            var totals = ECScore.calculateTotals();
            this.totalScore = totals.score || score;
            this.totalRating = totals.rating || stars;
        }
        this.nextState = GamestateLoading.create(gameManager, globals);
        this.nextState.setLevelToLoad(this._getSameLevel());
    },

    setLevelToLoad: function gamestateMissionSetLevelToLoadFn(level)
    {
        debug.assert(false, "GamestateMissionEnd ignores this");
        this.levelToLoad = level;
    },

    clearMissionEnd : function gamestateMissionEndClearFn()
    {
        if (this.fadeOutTween)
        {
            TWEEN.remove(this.fadeOutTween);
            this.fadeOutTween = null;
        }
        this.currentBrightness = 0;

        var globals = this.globals;
        var gameManager = globals.gameManager;
        var playState = gameManager.getPlayState();
        if (playState)
        {
            playState.deInit();
            gameManager.setPlayState(null);
        }

        var nextState = this.nextState;
        debug.assert(nextState);
        gameManager.setGameState(nextState);
    },

    draw : function gamestateMissionEndDrawFn()
    {
    },

    draw2D : function gamestateMissionEndDraw2DFn()
    {
    }
};

GamestateMissionEnd.create = function gamestateMissionEndCreateFn(gameManager, globals)
{
    var state = new GamestateMissionEnd();

    state.gameManager = gameManager;
    state.globals     = globals;

    state.currentBrightness = 0.0;
    state.fadeInTime = 0.5;
    state.fadeOutTime = 0.5;

    state.fadeInTween = null;
    state.fadeOutTween = null;

    state.level = null;
    state.missionScore = null;
    state.missionRating = null;
    state.missionFinishTime = null;
    state.gameAlreadyCompleted = false;
    state._enableInput = true;

    state.nextState = null;

    return state;
};
