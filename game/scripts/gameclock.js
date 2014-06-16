//
//  GameClock!
//
//  Tick tock.
//

function GameClock() {}

GameClock.prototype =
{
    tick : function gameclockTickFn(variable, forceTick)
    {
        var globals        = this.globals;
        var targetInterval = globals.appTimeStep;
        var timeDilation   = this.getTimeDilation();
        var n_t            = globals.appCurrentTime;
        var d_t            = n_t - this.prevEngineTime;
        var frozenTime     = targetInterval * this.globals.appMaxTimeSteps;

        // This is a huristic for long delays. It could set d_t = targetInterval, though it would be a bit more choppy.
        if (d_t > frozenTime)
        {
            d_t = frozenTime;
        }

        this.remainingTime += d_t;
        this.prevEngineTime = n_t;

        var accumulatedTime   = this.remainingTime;
        var updateInterval    = targetInterval;
        var minimumInterval   = targetInterval;

        if (variable)
        {
            updateInterval = accumulatedTime;
        }

        updateInterval    = Math.min(updateInterval, 1.0 / 30);

        if (accumulatedTime >= minimumInterval ||
            (forceTick && accumulatedTime > 0))
        {
            this.remainingTime -= updateInterval;

            if (!this.isStopped)
            {
                this.timeStep       =   updateInterval * timeDilation;
                this.physTimeStep   =   updateInterval;
                if (timeDilation <= 1.0)
                {
                    this.physTimeStep   =   updateInterval * timeDilation;
                }

                this.currentTime    +=  this.timeStep;
            }

            this.gameAppTimeStep = updateInterval;

            this.currentFrame   +=  1;

            return true;
        }
        return false;
    },

    getFrameIndex : function gameClockGetFrameIndexFn()
    {
        return  this.currentFrame;
    },

    getCurrentTime : function gameClockGetCurrentTimeFn()
    {
        return this.currentTime;
    },

    getGameAppTimeStep : function gameclockGetGameAppTimeStepFn()
    {
        //Ignores time dilation or being stopped.
        return this.gameAppTimeStep;
    },

    start : function gameClockStartFn()
    {
        this.currentTime            = 0.0;
        this.prevEngineTime         = this.globals.appCurrentTime;
        this.remainingTime          = 0;

        this.isStopped              = false;
    },

    stop : function gameClockStopFn()
    {
        this.isStopped  = true;

        this.timeStep     = 0.0;
        this.physTimeStep = 0.0;
    },

    pause : function gameClockPauseFn()
    {
        this.isStopped  =   true;

        this.timeStep     = 0.0;
        this.physTimeStep = 0.0;
    },

    resume : function gameClockResumeFn()
    {
        this.isStopped = false;
    },

    setTimeDilation : function gameClockSetTimeDilationFn(timeDilation)
    {
        this.timeDilation   =   timeDilation;
    },

    getTimeDilation : function gameClockGetTimeDilationFn()
    {
        return  this.timeDilation;
    },

    getTimeStep : function gameClockGetTimeStep()
    {
        return this.timeStep;
    },

    getPhysTimeStep : function gameClockGetTimeStep()
    {
        return this.physTimeStep;
    }

};

GameClock.create = function gameClockCreateFn(globals)
{
    var gameClock = new GameClock();

    gameClock.currentFrame  =   0;

    gameClock.currentTime     = null;
    gameClock.startTime       = null;
    gameClock.timeStep        = 0.0;
    gameClock.physTimeStep    = 0.0;
    gameClock.gameAppTimeStep = 0.0;
    gameClock.isStopped       = true;

    gameClock.timeDilation           =    1.0;

    gameClock.globals   =   globals;
    gameClock.remainingTime = 0;
    gameClock.prevEngineTime = 0;

    return gameClock;
};
