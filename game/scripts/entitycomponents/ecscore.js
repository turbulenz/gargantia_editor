//
//  ECScore
//
//  Description here

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECScore = EntityComponentBase.extend(
{
    entityComponentName : 'ECScore',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : true,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECScore)

    parameters :
    {
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecScoreInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!
        this.reset();

        // Ensure we have the static score data

    },

    reset : function ecScoreReset()
    {
        this.ringMiss     = 0;
        this.ringBullsEye = 0;
        this.ringInner    = 0;
        this.ringMid      = 0;
        this.ringOuter    = 0;

        this.collectables = 0;
        this.outoforder   = 0;

        this.limitsHit    = 0;
        this.obstacleHit  = 0;
        this.stallTimeHit = 0;
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecScoreActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    // Can query other entities here
    update : function ecScoreUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    draw : function ecScoreDrawFn()
    {
    },

    computeScore : function ecScoreComputeScoreFn(scoring, finishTime, noPenalties)
    {
        return Math.max(0, 0 +
            this.getTimeScore(scoring, finishTime) +

            scoring.ringOuter    * this.ringOuter +
            scoring.ringMid      * this.ringMid +
            scoring.ringInner    * this.ringInner +
            scoring.ringBullsEye * this.ringBullsEye +

            scoring.collectable  * this.collectables +
            scoring.outoforder   * this.outoforder +

            (noPenalties ? 0 :
                scoring.ringMiss     * this.ringMiss +
                scoring.obstacleHit  * this.obstacleHit +
                scoring.limitsHit    * this.limitsHit +
                scoring.stallTimeHit * this.stallTimeHit));
    },

    getTimeScore : function ecScoreGetTimeScore(scoring, finishTime)
    {
        return (finishTime !== null ? (scoring.timeBonus * Math.max(0, Math.round(scoring.timer - finishTime))) : 0);
    },

    classifyScore : function ecScoreClassifyScoreFn(scoring, score)
    {
        return score >= scoring.threeStar ? 3 :
               score >= scoring.twoStar   ? 2 :
               score >= scoring.oneStar   ? 1 : 0;
    },

    forceRating: function ecScoreForceRating(scoring, rating)
    {
        scoring.ringOuter = scoring.ringMid = scoring.ringInner = scoring.ringBullsEye = 0;
        scoring.collectable = scoring.outoforder = 0;
        scoring.ringMiss = scoring.obstacleHit = scoring.limitsHit = scoring.stallTimeHit = 0;

        var timer = scoring.timer;
        if (rating === 0)
        {
            return timer;
        }
        else if (rating === 1)
        {
            return scoring.timer - Math.ceil(scoring.oneStar / scoring.timeBonus);
        }
        else if (rating === 2)
        {
            return scoring.timer - Math.ceil(scoring.twoStar / scoring.timeBonus);
        }
        else
        {
            return scoring.timer - Math.ceil(scoring.threeStar / scoring.timeBonus);
        }
    },

    drawDebug : function ecScoreDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecScoreManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    //Death (when health hits 0)
    onDeath : function ecScoreOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecScoreOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecScoreDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    }
});

ECScore.create = function ecScoreCreateFn(globals, parameters)
{
    return new ECScore(globals, parameters);
};

ECScore.scoreify = function scorify(value)
{
    var str;
    if (Math.abs(value) >= 1000)
    {
        var thousands = (value / 1000) | 0;
        str = "" + Math.abs(value - thousands * 1000);
        while (str.length < 3)
        {
            str = "0" + str;
        }
        str = "" + thousands + "," + str;
    }
    else
    {
        str = "" + value;
    }
    return str;
};

ECScore.timeify = function timeify(time)
{
    var minutes = "" + Math.floor(time / 60);
    var seconds = "" + Math.floor(time % 60);
    if (seconds.length < 2)
    {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
};

ECScore.initScoreRecords = function ecScoreInitScoreRecords(sd)
{
    if (!ECScore.savedScores)
    {
        ECScore.resetScoreRecords(sd);
    }
};

// Unconditionally sync from saved data
ECScore.resetScoreRecords = function ecScoreResetScoreRecords(sd)
{
    var scores = [];
    var ratings = [];

    if (sd.isActive())
    {
        var numStages = sd.getNextStageToPlay();
        var i;
        var result;
        for (i = 0 ; i < numStages ; i += 1)
        {
            result = sd.getResultForMission(i);
            scores[i] = result.score;
            ratings[i] = result.rating;
        }
    }

    ECScore.savedScores = scores;
    ECScore.savedRatings = ratings;
};

ECScore.resultRecorded = function ecScoreHasResultFn(missionIdx)
{
    var scores = ECScore.savedScores;
    return scores[missionIdx];
};

ECScore.recordResult = function ecScoreRecordResultFn(missionIdx, score, rating)
{
    debug.assert("number" === typeof missionIdx);
    debug.assert("number" === typeof score);
    debug.assert("number" === typeof rating);
    debug.assert(0 <= missionIdx && missionIdx <= 3);
    debug.assert(1 <= rating && rating <= 3);

    var scores = ECScore.savedScores;
    var ratings = ECScore.savedRatings;

    if (scores[missionIdx])
    {
        return;
    }

    var i;
    for (i = 0 ; i < missionIdx ; i += 1)
    {
        if (!scores[i])
        {
            return;
        }
    }

    scores[missionIdx] = score;
    ratings[missionIdx] = rating;
};

ECScore.getStagesCompleted = function ecScoregetStagesCompletedFn()
{
    return ECScore.savedScores.length;
};

ECScore.calculateTotals = function ecScoreCalculateTotalsFn()
{
    var scores = ECScore.savedScores;
    var numMissionsPlayed = scores.length;

    if (0 === numMissionsPlayed)
    {
        return { score: 0, rating: 0 };
    }

    var ratings = ECScore.savedRatings;

    var score = 0;
    var rating = 0;
    var i;
    for (i = 0 ; i < numMissionsPlayed ; i += 1)
    {
        score += scores[i];
        rating += ratings[i];
    }

    // score = score;
    rating = Math.round(rating / numMissionsPlayed);

    return {
        score: score,
        rating: rating
    };
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECScore.prototype.entityComponentName] = ECScore;
