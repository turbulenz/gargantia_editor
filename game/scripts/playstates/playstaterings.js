//
// PlayStateRings
//

/*global console: false*/
/*global debug: false*/
/*global PlayStateBase: false*/
/*global EntityComponentBase: false*/
/*global Editor: false*/

function notToBeDestroyed(entity)
{
    return !entity.toBeDestroyed;
}

var PlayStateRings = PlayStateBase.extend({
    playStateName : 'PlayStateRings',
    playFlagName: 'playFlagsRings',

    maxMissCutins     : 3,
    minMissCutinPeriod: 10.0,
    numMissCutins     : 0,
    lastMissCutinTime : 0,

    missCutinRequiredCount : 2, // after 2 hoops missed, play cutin.
    missedCount: 0,

    init: function playstatedefaultInitFn(gameStatePlayingOwner, globals, parameters)
    {
        //Called on construction.
        this._super(gameStatePlayingOwner, globals, parameters);

        // hide stuffs (emulate editor exit).
        Editor.Actions.actionMap.exitEditorGargantia(this.globals, this.globals.gameManager, null);

        this.reset();
    },

    reset : function resetFn()
    {
        this.computeRingTopology();
        this.baseTime = this.globals.gameManager.gameClock.currentTime;
    },

    nextRingToSpawn: function playStateRingsNextRingToSpawnFn()
    {
        var hoops = this.hoopSpawners;
        if (hoops.length === 0)
        {
            return null;
        }
        var ret = hoops[0];
        hoops.shift();
        return ret;
    },

    collectionState : function playStateRingsCollectionStateFn()
    {

    },

    missedHoop : function missedHoopFn()
    {
        this.missedCount += 1;
    },

    computeRingTopology : function playStateRingsComputeRingTopologyFn()
    {
        var spawners = EntityComponentBase.getEntitiesWithEC("ECHoopSpawner").filter(notToBeDestroyed);
        var initSpawners = [];
        var ec, found, ec2;
        for (var i = 0; i < spawners.length; i += 1)
        {
            ec = spawners[i].getEC("ECHoopSpawner");
            found = false;
            for (var j = 0; j < spawners.length; j += 1)
            {
                if (i === j)
                {
                    continue;
                }

                ec2 = spawners[j].getEC("ECHoopSpawner");
                if (ec.ID === ec2.nextID)
                {
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                initSpawners.push(spawners[i]);
            }
        }
        if (initSpawners.length > 1)
        {
            console.log("Too many initial hoops in topology");
            this.hoopSpawners = [];
            return;
        }

        var hoops = this.hoopSpawners = initSpawners;
        if (hoops.length === 0)
        {
            return;
        }

        spawners.splice(spawners.indexOf(hoops[0]), 1);
        ec = hoops[0].getEC("ECHoopSpawner");
        while (spawners.length !== 0)
        {
            var next = [];
            for (i = 0; i < spawners.length; i += 1)
            {
                ec2 = spawners[i].getEC("ECHoopSpawner");
                if (ec2.ID === ec.nextID)
                {
                    next.push(spawners[i]);
                }
            }
            if (next.length > 1)
            {
                console.log("Too many following hoops in topology");
                this.hoopSpawners = [];
                return;
            }

            hoops.push(next[0]);
            spawners.splice(spawners.indexOf(next[0]), 1);
            ec = next[0].getEC("ECHoopSpawner");
        }

        this.collectionStates = [];
        for (i = 0; i < hoops.length; i += 1)
        {
            hoops[i].getEC("ECHoopSpawner").index = i;
            this.collectionStates.push('hudUncollected');
        }
    },

    update: function playeStateRingsUpdate()
    {
        this._super();

        var gameStateMissionEnd;
        var forceWin;

        var time = this.globals.gameManager.gameClock.currentTime - this.baseTime;
        this.gameTime = Math.max(0, this.level.scoring.timer - time);
        this.setTime(this.gameTime);
        if (time >= this.level.scoring.timer)
        {
            this.missionEnd(time);
        }

        // Ensure at least 2 hoops are visible/active.
        var hoops = EntityComponentBase.getEntitiesWithEC("ECHoop").filter(notToBeDestroyed);
        if (hoops.length < 2)
        {
            while (hoops.length < 2)
            {
                var spawner = this.nextRingToSpawn();
                if (!spawner)
                {
                    break;
                }

                hoops.push(spawner.getEC("ECHoopSpawner").spawn());
                spawner.setToBeDestroyed();
            }

            for (var i = 0; i < hoops.length; i += 1)
            {
                hoops[i].getEC("ECHoop").active = (i === 0);
            }
        }

        if (hoops.length === 0 || forceWin)
        {
            this.missionEnd(time);
        }
    },

    updateUI: function playeStateRingsUpdateUI()
    {
        this._super();

        var hoops = EntityComponentBase.getEntitiesWithEC("ECHoop").filter(notToBeDestroyed);
        if (hoops.length > 0)
        {
            var gd = this.globals.graphicsDevice;
            var md = this.globals.mathDevice;
            var guiManager = this.globals.gameManager.getGuiManager();

            var camera = this.globals.gameManager.gameCamera;
            var hoopPosition = hoops[0].getv3Location();
            var viewProjection = camera.camera.viewProjectionMatrix;

            var v4Pos = this.v4Pos = md.v4Build(hoopPosition[0], hoopPosition[1], hoopPosition[2], 1, this.v4Pos);
            md.m44Transform(viewProjection, v4Pos, v4Pos);
            v4Pos[0] /= v4Pos[3];
            v4Pos[1] /= v4Pos[3];

            var scale;
            if (v4Pos[0] < -0.5 || (v4Pos[0] <= 0 && v4Pos[2] < 0))
            {
                scale = (v4Pos[2] < 0) ? 1 : Math.pow(Math.min(-v4Pos[0] - 0.5, 1), 0.1);
                guiManager.addDrawGui("hudArrowLeft", { scale: scale, x : 20, y : gd.height / 2 }, "hudArrowLeft");
            }
            else if (v4Pos[0] > 0.5 || (v4Pos[0] > 0 && v4Pos[2] < 0))
            {
                scale = (v4Pos[2] < 0) ? 1 : Math.pow(Math.min(v4Pos[0] - 0.5, 1), 0.1);
                guiManager.addDrawGui("hudArrowRight", { scale: scale, x : gd.width - 20, y : gd.height / 2 }, "hudArrowRight");
            }
        }
    },

    draw2D: function playStateRingsDraw2D(paused)
    {
        this._super(paused);
    }
});

PlayStateRings.drawHoopOrders = function playStateRingsDrawHoopOrders(globals)
{
    var dd = globals.debugDraw;
    var spawners = EntityComponentBase.getEntitiesWithEC("ECHoopSpawner").filter(notToBeDestroyed);
    var entitySpawners = EntityComponentBase.getEntitiesWithEC("ECEntitySpawner").filter(notToBeDestroyed);
    var heroSpawners = [];
    for (var i = 0; i < entitySpawners.length; i += 1)
    {
        if (entitySpawners[i].getEC("ECEntitySpawner").archetype.archetypeToSpawn === "a_ledo")
        {
            heroSpawners.push(entitySpawners[i]);
            dd.drawDebugSphere(entitySpawners[i].getv3Location(), 2.0, 1, 0, 0);
        }
    }
    var attach = EntityComponentBase.getEntitiesWithEC("ECHoopAttach").filter(notToBeDestroyed);

    var recurse;
    recurse = function (spawner)
    {
        var found = false;
        for (var i = 0; i < spawners.length; i += 1)
        {
            if (spawner.getEC("ECHoopSpawner").nextID === spawners[i].getEC("ECHoopSpawner").ID)
            {
                dd.drawDebugLine(spawner.getv3Location(), spawners[i].getv3Location(), 1, 1, 0);
                recurse(spawners[i]);
            }
            if (spawners[i].getEC("ECHoopSpawner").nextID === spawner.getEC("ECHoopSpawner").ID)
            {
                found = true;
            }
        }
        for (i = 0; i < attach.length; i += 1)
        {
            if (attach[i].getEC("ECHoopAttach").ID === spawner.getEC("ECHoopSpawner").ID)
            {
                dd.drawDebugLine(attach[i].getv3Location(), spawner.getv3Location(), 0, 0, 1);
                dd.drawDebugSphere(attach[i].getv3Location(), 1.0, 0, 0, 1);
            }
        }
        if (!found)
        {
            dd.drawDebugSphere(spawner.getv3Location(), 2.0, 1, 0, 0);
            for (var j = 0; j < heroSpawners.length; j += 1)
            {
                dd.drawDebugLine(spawner.getv3Location(), heroSpawners[j].getv3Location(), 1, 0, 0);
            }
        }
        else
        {
            dd.drawDebugSphere(spawner.getv3Location(), 1.0, 1, 1, 0);
        }
    };

    for (i = 0; i < spawners.length; i += 1)
    {
        recurse(spawners[i]);
    }
};

PlayStateRings.create = function playStateRingsCreateFn(gameStatePlayingOwner, globals, parameters)
{
    return new PlayStateRings(gameStatePlayingOwner, globals, parameters);
};

PlayStateRings.createFromName = function playStateRingsCreateFromNameFn(playStateName, gameStatePlayingOwner, globals, parameters)
{
    var playStateClassToCreate = PlayStateRings.prototype.playStateCreationMap[playStateName];

    var playState;

    debug.assert(playStateClassToCreate !== undefined,
                        'Trying to create an unknown Play State : ' + playStateName);

    playState   =   playStateClassToCreate.create(gameStatePlayingOwner, globals, parameters);

    return playState;
};

// Build this into the Entity map.
PlayStateBase.prototype.playStateCreationMap[PlayStateRings.prototype.playStateName] = PlayStateRings;
