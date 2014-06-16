/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/
/*global GameSoundManager: false*/
/*global VMath: false*/

//
//  EntityComponentLocomotion!
//

var ECLocomotion = EntityComponentBase.extend(
{
    entityComponentName : 'ECLocomotion',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.APPLY_FORCES,
    shouldUpdate : true,
    shouldAlwaysUpdate : true,
    shouldDraw : true,

    //Persistence info.
    shouldSave : false,

    realTime : true,    //To honour this make sure you reference parameters through this.archetype

    parameters : null,
    parameterLibrary:  {},
    debugUI : true,

    active : true,

    maxAltituteCutins : 2,
    minAltitudeCutinPeriod: 20.0,
    numAltitudeCutins: 0,
    lastAltitudeCutinTime: 0,

    numStallCutins : 0,
    lastStallCutinTime: 0,
    maxStallCutins : 4,
    minStallCutinPeriod: 20.0,

    idle              : true,
    idleTimeout       : 16.0, // play cutin after this time of being idle
    lastIdleTime      : 0,

    maxIdleCutins     : 3,
    minIdleCutinPeriod: 20.0,
    numIdleCutins     : 0,
    lastIdleCutinTime : 0,

    init : function eCLocomotionInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        this.parameters = {
            gravity             : 8.0,
            liftFactor          : 50,
            maxSpeed            : 80,
            drag                : 0.001,
            liftResponse        : 0.05,
            turnResponse        : 0.125,
            fakedLift           : 0.0,
            fakedTurn           : 0.0,
            bankRatioPower      : 0.5,
            wingResistance      : 0.01,
            forwardResistance   : 0.01,
            alignmentSpeed      : 1.0,
            maxBank             : 0.75,
            maxBankWhenLifting  : 0.5,
            maxLift             : 0.95,
            liftNormalization   : 0.0, //1.0,
            liftAcceleration    : 0.05,
            turnAcceleration    : 0.15, //0.3,
            turnNormalization   : 0.5, //0.3,
            turnReversal        : 1.0,
            turnLift            : 0.75,
            minY                : 300,
            maxY                : 3000,
            reboundAcceleration : 0.05,
            reboundLift         : 0.05,
            reboundDrag         : 0.0025,
            boostSpeed          : 0.3,
            boostRecharge       : 0.1,
            boostDrain          : 0.2,
            boostAcceleration   : 0.1,
            stallSpeed          : 0.0,
            stallRecoveryRate   : 0.1,
            collisionRadius     : 60,
            realCollisionRadius : 6,
            fakeMeshLiftScale   : 1.2,
            constantBoost       : 4.0,
            turnAdditionalDrag  : 0.0,
            turnAdditionalDrop  : 0.0,
            limitsFailTime      : 10.0,
            turnturnturnturn    : 2.5 //3.5
        };

        var baseGroup, ui;
        function expose(group, archetype)
        {
            var physics = ui.addGroup("Physics", group);
            var boost = ui.addGroup("Boost", group);
            var controls = ui.addGroup("Controls", group);
            var bounds = ui.addGroup("Gamespace Bounds", group);

            ui.watchVariable(
                'Min Y',
                archetype,
                'minY',
                'slider',
                bounds,
                {
                    min: 0,
                    max: 500,
                    step: 50
                });

            ui.watchVariable(
                'Max Y',
                archetype,
                'maxY',
                'slider',
                bounds,
                {
                    min: 500,
                    max: 2000,
                    step: 100
                });

            ui.watchVariable(
                'Gravity',
                archetype,
                'gravity',
                'slider',
                physics,
                {
                    min : 0,
                    max : 50,
                    step : 1
                });

            ui.watchVariable(
                'Lift Factor',
                archetype,
                'liftFactor',
                'slider',
                physics,
                {
                    min: 0,
                    max: 100,
                    step: 2
                });

            ui.watchVariable(
                'Drag',
                archetype,
                'drag',
                'slider',
                physics,
                {
                    min: 0.0,
                    max: 0.1,
                    step: 0.00625
                });

            ui.watchVariable(
                'Lift Response',
                archetype,
                'liftResponse',
                'slider',
                controls,
                {
                    min: 0.0,
                    max: 0.3,
                    step: 0.15 / 8
                });

            ui.watchVariable(
                'Turn Response',
                archetype,
                'turnResponse',
                'slider',
                controls,
                {
                    min: 0.0,
                    max: 0.3,
                    step: 0.15 / 8
                });

            ui.watchVariable(
                'Lift Normalisation',
                archetype,
                'liftNormalization',
                'slider',
                controls,
                {
                    min: 0.0,
                    max: 5.0,
                    step: 0.05
                });

            ui.watchVariable(
                'Lift Acceleration',
                archetype,
                'liftAcceleration',
                'slider',
                controls,
                {
                    min: 0.75,
                    max: 0.9,
                    step: 0.025
                });

            ui.watchVariable(
                'Turn Acceleration',
                archetype,
                'turnAcceleration',
                'slider',
                controls,
                {
                    min: 0.05,
                    max: 0.9,
                    step: 0.025
                });

            ui.watchVariable(
                'Turn Normalisation',
                archetype,
                'turnNormalization',
                'slider',
                controls,
                {
                    min: 0.0,
                    max: 5.0,
                    step: 0.05
                });

            ui.watchVariable(
                'Recharge',
                archetype,
                'boostRecharge',
                'slider',
                boost,
                {
                    min: 0.0,
                    max: 0.2,
                    step: 0.0025
                });

            ui.watchVariable(
                'Top Speed',
                archetype,
                'maxSpeed',
                'slider',
                boost,
                {
                    min: 50,
                    max: 200,
                    step: 20
                });

            ui.watchVariable(
                'Speed',
                archetype,
                'boostSpeed',
                'slider',
                boost,
                {
                    min: 0.0,
                    max: 4.0,
                    step: 0.05
                });

            ui.watchVariable(
                'Drain',
                archetype,
                'boostDrain',
                'slider',
                boost,
                {
                    min: 0.0,
                    max: 1.0,
                    step: 0.05
                });

            ui.watchVariable(
                'Constant',
                archetype,
                'constantBoost',
                'slider',
                boost,
                {
                    min: 0.0,
                    max: 20.0,
                    step: 0.25
                });
        }

        if (!ECLocomotion.addedUI)
        {
            ECLocomotion.addedUI = true;
            ui = this.globals.dynamicUI;
            if (ui)
            {
                baseGroup = ui.addGroup("Player Controls", globals.uiGroups.settings, function () {}, {collapsable: true});
                expose(baseGroup, this.parameters);
            }
        }

        this.reset();
    },

    reset : function ecLocomotionResetFn()
    {
        var md = this.globals.mathDevice;
        this.position     = md.v3Build(-60, -30, -100);
        this.velocity     = md.v3Build(0, 0, 20);
        this.acceleration = md.v3Build(0, 0, 0);
        this.orientation  = md.m33BuildIdentity();
        this.meshOrient   = md.m33BuildIdentity();

        this.scratchPad = {
            normalizedVel: md.v3BuildZero(),
            right: md.v3BuildZero(),
            up: md.v3BuildZero(),
            at: md.v3BuildZero(),
            cross: md.v3BuildZero(),
            angX: md.v3BuildZero(),
            angY: md.v3BuildZero(),
            angVel: md.v3BuildZero()
        };

        // player controls
        this.targetTurn = 0;
        this.targetLift = 0;
        this.currentTurn = 0;
        this.currentLift = 0;
        this.accelerateTurn = 0;
        this.accelerateLift = 0;
        this.targetBoost = 0;
        this.currentBoost = 0;
        this.chargedBoost = 1; // 100%
        this.stallScale = 1.0;

        if (this.playingOceanSound)
        {
            this.globals.gameManager.gameSoundManager.stop('aud_ocean');
        }

        if (this.playingThermalSound)
        {
            this.globals.gameManager.gameSoundManager.stop('aud_thermal');
        }

        this.playingOceanSound = false;
        this.playingThermalSound = false;

        this.turnAmount = 0;
        this.forwardAmount = 0;
    },

    activate : function eclocomotionActivateFn()
    {
        this._super();

        this.entity.setGameSpaceDynamic(true);   //Allow parent to poll for current game space.
        this.globals.gameManager.gameSoundManager.play('aud_propeller');
        this.globals.gameManager.gameSoundManager.play('aud_propeller_fast', undefined, undefined, 0);
    },

    setControls : function ecLocomotionSetControlsFn(turn, lift, boost)
    {
        var inversionX = this.globals.gameManager.controlInversionX ? -1 : 1;
        var inversionY = this.globals.gameManager.controlInversionY ? 1 : -1;

        this.accelerateTurn += turn;
        this.accelerateLift += lift;
        this.targetTurn += this.accelerateTurn * inversionX;
        this.targetLift += this.accelerateLift * inversionY;
        this.targetBoost = boost;
        if (boost && this.chargedBoost > 0 && this.currentBoost === 0)
        {
            this.globals.gameManager.gameSoundManager.play('aud_boost');
        }
        else if (!boost)
        {
            this.globals.gameManager.gameSoundManager.stop('aud_boost', undefined, 0.25);
        }

        var animationManager = this.entity.getEC("ECAnimationManager");
        animationManager.setBlendValue(this.turnAmount, "direction");
        animationManager.setBlendValue(this.forwardAmount, "neutral_forward");

        // idle if inputs are all zero
        // and, if in touch mode, the padDrag of controller is null (prevent playing
        //    idle cut-in if touch user holds finger at zero-input on d-pad)
        var controller = this.globals.gameManager.gameController;
        if (controller.isTouchMode() && controller.padDrag !== null)
        {
            this.idle = false;
        }
        else
        {
            this.idle = turn === 0 && lift === 0 && boost === 0;
        }
    },

    getUp : function getUp(dst)
    {
        var md = this.globals.mathDevice;
        return md.m33Up(this.orientation, dst);
    },

    getForward : function getForward(dst)
    {
        var md = this.globals.mathDevice;
        return md.m33At(this.orientation, dst);
    },

    getRight : function getRight(dst)
    {
        var md = this.globals.mathDevice;
        return md.m33Right(this.orientation, dst);
    },

    update : function eCLocomotionUpdateFn()
    {
        var globals = this.globals;
        var md = globals.mathDevice;
        this._super();

        var dt = 1 / 60;

        var scratchPad = this.scratchPad;

        var pos     = this.position;
        var vel     = this.velocity;
        var orient  = this.orientation;
        var accel   = md.v3BuildZero(this.acceleration);
        var up      = this.getUp(scratchPad.up);
        var forward = this.getForward(scratchPad.at);
        var right   = this.getRight(scratchPad.right);

        var score = this.entity.getEC("ECScore");

        var normalizedVel = md.v3Normalize(vel, scratchPad.normalizedVel);

        var stalling = md.v3Length(vel) < this.parameters.stallSpeed;
        var targetStallScale = stalling ? Math.pow(md.v3Length(vel) / this.parameters.stallSpeed, 1) : 1.0;
        this.stallScale += (targetStallScale - this.stallScale) / this.parameters.stallRecoveryRate * dt;
        if (Math.abs(targetStallScale - this.stallScale) < 0.01)
        {
            this.stallScale = targetStallScale;
        }
        var stallScale = this.stallScale;
        var stallScale2 = Math.pow(stallScale, 4);

        score.stallTimeHit += (1 - stallScale) * dt;

        // controls
        this.accelerateTurn *= this.parameters.turnAcceleration;
        this.accelerateLift *= this.parameters.liftAcceleration;
        this.targetTurn *= 0.95 * stallScale;
        this.targetLift *= 0.95 * stallScale;
        this.currentTurn  += (this.targetTurn - this.currentTurn) * 0.2 * stallScale;
        this.currentLift  += (this.targetLift - this.currentLift) * 0.2 * stallScale;
        this.currentBoost += (this.targetBoost - this.currentBoost) * this.parameters.boostAcceleration;
        if (this.currentBoost < 0.01)
        {
            this.currentBoost = 0;
        }

        var turnAmount = VMath.clamp(this.currentTurn * 0.15, -1, 1);
        var forwardAmount = VMath.clamp(this.currentLift * 0.05, 0, 1);
        this.turnAmount = turnAmount;
        this.forwardAmount = VMath.clamp(forwardAmount - Math.abs(turnAmount) * 1.5, 0, 1);

        // encourage plane to return to 0 banking.
        var banking = Math.asin(right[1]);
        this.targetTurn -= banking * this.parameters.turnNormalization * stallScale;

        // encourage plane to return to flat lift
        this.targetLift += this.parameters.liftNormalization * stallScale * forward[1] / 4;

        // drag
        var turnDrag = 1 + Math.abs(right[1]) * this.parameters.turnAdditionalDrag;
        accel[0] -= vel[0] * this.parameters.drag * turnDrag;
        accel[1] -= vel[1] * this.parameters.drag * turnDrag;
        accel[2] -= vel[2] * this.parameters.drag * turnDrag;

        // gravity
        var turnDrop = 1 + Math.abs(right[1]) * this.parameters.turnAdditionalDrop;
        accel[1] -= this.parameters.gravity * turnDrop;

        // lift
        var thermals = EntityComponentBase.getEntitiesWithEC("ECThermals");
        var thermalLift = globals.gameManager.collisions.thermalLift(this, thermals);

        var liftFactor = Math.max(0, (0.125 + md.v3Dot(normalizedVel, forward))) * this.parameters.liftFactor;
        var lift = -md.v3Dot(vel, up) * liftFactor * (1 - 0.3 * Math.abs(right[1])) * stallScale2;

        accel[0] += up[0] * lift + forward[0] * lift * 0.1;
        accel[1] += up[1] * lift + forward[1] * lift * 0.1;
        accel[2] += up[2] * lift + forward[2] * lift * 0.1;

        // turn turn turn turn
        var turnturnturnturn = this.parameters.turnturnturnturn;
        var r0 = right[0];
        var r2 = right[2];
        var rl = -right[1] * turnturnturnturn * 5 / Math.sqrt(r0 * r0 + r2 * r2);
        r0 *= rl;
        r2 *= rl;
        accel[0] += r0;
        accel[2] += r2;
        accel[0] -= vel[0] * Math.abs(rl) * 0.0125;
        accel[1] -= vel[1] * Math.abs(rl) * 0.0125;
        accel[2] -= vel[2] * Math.abs(rl) * 0.0125;
        md.m33RotateY(orient, -rl * 0.0002, orient);

        var upLift = md.v3Dot(thermalLift, up);
        accel[0] += up[1] * up[0] * upLift + forward[0] * upLift * 0.1 + thermalLift[0] * 1;
        accel[1] += up[1] * up[1] * upLift + forward[1] * upLift * 0.1 + thermalLift[1] * 1;
        accel[2] += up[1] * up[2] * upLift + forward[2] * upLift * 0.1 + thermalLift[2] * 1;
        this.targetLift -= upLift * 0.02;

        // resistance
        var resistFactor = Math.abs(md.v3Dot(normalizedVel, up))      * this.parameters.wingResistance +
                           Math.abs(md.v3Dot(normalizedVel, forward)) * this.parameters.forwardResistance;
        var resist = (1 + md.v3Length(vel)) * resistFactor;
        accel[0] -= vel[0] * resist;
        accel[1] -= vel[1] * resist;
        accel[2] -= vel[2] * resist;

        // engine
        this.chargedBoost -= this.currentBoost * this.parameters.boostDrain * dt;
        if (this.currentBoost === 0)
        {
            this.chargedBoost += this.parameters.boostRecharge * dt;
        }
        this.chargedBoost = Math.max(0, Math.min(1, this.chargedBoost));
        var boost = Math.max(0, this.parameters.maxSpeed - md.v3Length(vel)) * this.currentBoost * this.parameters.boostSpeed * Math.sgn(this.chargedBoost);
        accel[0] += forward[0] * (boost + this.parameters.constantBoost);
        accel[1] += forward[1] * (boost + this.parameters.constantBoost);
        accel[2] += forward[2] * (boost + this.parameters.constantBoost);

        pos[0] += thermalLift[0] / 100;
        pos[1] += thermalLift[1] / 100;
        pos[2] += thermalLift[2] / 100;

        // Limits
        var lower = Math.min(0, pos[1] - this.parameters.minY);
        var strength;
        if (lower < 0)
        {
            strength = Math.pow(-lower, 1.5) * 8 * (vel[1] <= 0 ? 1 - 0.5 * vel[1] : 1 / (1 + 0.5 * vel[1]));
            this.currentLift -= strength * dt * this.parameters.reboundLift;
            accel[0] -= vel[0] * this.parameters.reboundDrag;
            accel[1] -= vel[1] * this.parameters.reboundDrag;
            accel[2] -= vel[2] * this.parameters.reboundDrag;
            score.limitsHit += (-lower) * dt;
        }
        var upper = Math.max(0, pos[1] - this.parameters.maxY);
        if (upper > 0)
        {
            strength = Math.pow(upper, 1.5) * 8 * (vel[1] >= 0 ? 1 + 0.5 * vel[1] : 1 / (1 - 0.5 * vel[1]));
            this.currentLift += strength * dt * this.parameters.reboundLift;
            accel[0] -= vel[0] * this.parameters.reboundDrag;
            accel[1] -= vel[1] * this.parameters.reboundDrag;
            accel[2] -= vel[2] * this.parameters.reboundDrag;
            score.limitsHit += upper * dt;
        }

        var gameSpace = this.entity.currentGameSpace;
        if (gameSpace)
        {
            gameSpace.finalizeIfNeeded();
            var tree = gameSpace.cubeTree;
            var blocks = [];
            tree.getSphereOverlappingNodes(pos, this.parameters.collisionRadius, blocks);
            var numObstacleHit = globals.gameManager.collisions.collideWithBlocks(
                        this,
                        blocks,
                        this.parameters.collisionRadius,
                        this.parameters.realCollisionRadius,
                        this.parameters.reboundAcceleration);

            score.obstacleHit += numObstacleHit;
        }

        // Update locomotion
        vel[0] += accel[0] * dt;
        vel[1] += accel[1] * dt;
        vel[2] += accel[2] * dt;
        pos[0] += vel[0] * dt;
        pos[1] += vel[1] * dt;
        pos[2] += vel[2] * dt;

        // rotations
        lift = -this.currentLift * this.parameters.liftResponse * dt * stallScale;
        var turn = -this.currentTurn * this.parameters.turnResponse * dt * stallScale;
        var bankRatio = Math.min(1, Math.abs(right[1]) * this.parameters.bankRatioPower);
        var bankSign = Math.sgn(right[1]);
        if (bankSign * this.currentTurn < 0)
        {
            bankRatio = 0;
            turn *= 1.0 + this.parameters.turnReversal * Math.abs(right[1]);
        }
        md.m33RotateSelfX(orient, lift * (1 - bankRatio) - bankSign * turn * bankRatio * this.parameters.turnLift, orient);
        md.m33RotateSelfZ(orient, turn * (1 - bankRatio) + bankSign * lift * bankRatio, orient);
        md.m33RotateSelfY(orient, -lift * bankRatio * bankSign, orient);

        // faked helpers.
        var xzr = 1 / Math.sqrt(right[0] * right[0] + right[2] * right[2]);
        r0 = right[0] * xzr;
        r2 = right[2] * xzr;
        var dx = -r0 * this.currentTurn * dt * this.parameters.fakedTurn * stallScale;
        var dz = -r2 * this.currentTurn * dt * this.parameters.fakedTurn * stallScale;
        var dy = -this.currentLift * 0.25 - vel[1];
        if (this.currentLift < 0 && dy < 0)
        {
            dy = 0;
        }
        else if (this.currentLift > 0 && dy < 0)
        {
            dy = 0;
        }
        dy *= dt * this.parameters.fakedLift * stallScale2 * md.v3Length(vel) / this.parameters.maxSpeed;

        var vl = md.v3Length(vel);
        vel[0] += dx;
        vel[1] += dy;
        vel[2] += dz;
        vl /= md.v3Length(vel);
        vel[0] *= vl;
        vel[1] *= vl;
        vel[2] *= vl;
        md.v3Normalize(vel, normalizedVel);

        // rotate towards velocity
        var fxv = md.v3Cross(forward, normalizedVel, scratchPad.cross);
        var angleX = md.v3Dot(right, fxv);
        var angleY = md.v3Dot(up, fxv);
        var angVel = md.v3Add(md.v3ScalarMul(right, angleX, scratchPad.angX),
                              md.v3ScalarMul(up, angleY, scratchPad.angY),
                              scratchPad.angVel);
        var alignmentSpeed = this.parameters.alignmentSpeed * dt * stallScale;
        md.m33Integrate(orient, angVel, alignmentSpeed, orient);

        // Ensure we never go beyond 90 degree bank
        // recalculate orientation vectors.
        this.getUp(up);
        this.getForward(forward);
        this.getRight(right);
        var maxBank = this.parameters.maxBank + (this.parameters.maxBankWhenLifting - this.parameters.maxBank) * bankRatio;
        if (up[1] < (1 - maxBank))
        {
            md.m33RotateSelfZ(orient, ((1 - maxBank) - up[1]) * Math.sgn(right[1]), orient);
        }

        // Ensure we never go beyond 90 degree rise/fall
        // recalculate orientation vectors.
        this.getUp(up);
        this.getForward(forward);
        this.getRight(right);
        if (forward[1] > this.parameters.maxLift)
        {
            md.m33RotateSelfX(orient, this.parameters.maxLift - forward[1], orient);
        }
        else if (forward[1] < -this.parameters.maxLift)
        {
            md.m33RotateSelfX(orient, -this.parameters.maxLift - forward[1], orient);
        }

        var targetThermalLift = -forward[1];
        md.m33RotateSelfX(orient, targetThermalLift * thermalLift[1] / 600, orient);

        // Update entity
        this.entity.setv3Location(pos);
        var meshOrient = md.m33Copy(orient, this.meshOrient);
        md.m33RotateSelfX(meshOrient, forward[1] * (this.parameters.fakeMeshLiftScale - 1), meshOrient);
        this.entity.setM33Rotation(meshOrient);

        var gameSoundManager = globals.gameManager.gameSoundManager;

        var speed = md.v3Length(vel);

        var fastPropellerVolume = VMath.clamp((speed - GameSoundManager.propellerFastSpeedMin) / (GameSoundManager.propellerFastSpeedMax - GameSoundManager.propellerFastSpeedMin), 0, 1);
        gameSoundManager.setVolume('aud_propeller', undefined, 1 - fastPropellerVolume, 0);
        gameSoundManager.setVolume('aud_propeller_fast', undefined, fastPropellerVolume, 0);

        var oceanSoundLimit = GameSoundManager.oceanSoundCeiling;
        if (pos[1] < oceanSoundLimit)
        {
            var oceanVolume = 1.0 - pos[1] / oceanSoundLimit;
            if (!this.playingOceanSound)
            {
                this.playingOceanSound = true;
                gameSoundManager.play('aud_ocean');
            }
            gameSoundManager.setVolume('aud_ocean', undefined, oceanVolume, 0);
        }
        else
        {
            if (this.playingOceanSound)
            {
                this.playingOceanSound = false;
                gameSoundManager.stop('aud_ocean');
            }
        }

        if (md.v3LengthSq(thermalLift) > 0)
        {
            if (!this.playingThermalSound)
            {
                gameSoundManager.play('aud_thermal');
                this.playingThermalSound = true;
            }
        }
        else
        {
            if (this.playingThermalSound)
            {
                gameSoundManager.stop('aud_thermal');
                this.playingThermalSound = false;
            }
        }
    },

    draw : function eCLocomotionDrawFn()
    {
    },

    getVisibleDestination : function ecLocomotionGetVisibleDestinationFn()
    {
        return null;
    },

    getPosition : function ecLocomotionGetPositionFn()
    {
        return this.position;
    },

    getVelocity : function ecLocomotionGetVelocityFn()
    {
        return this.velocity;
    },

    getAcceleration : function ecLocomotionGetAccelerationFn()
    {
        return this.acceleration;
    },

    respawn: function ecLocomotionRespawnFn(spawner)
    {
        var md = this.globals.mathDevice;

        this.reset();

        this.position    = md.v3Copy(spawner.entity.getv3Location());
        this.orientation = md.m33BuildRotationXZY(spawner.entity.getV3Rotation());
        this.velocity    = md.v3ScalarMul(md.m33At(this.orientation), 20);

        this.update();
    },

    drawDebug : function eCLocomotionDrawDebugFn()
    {
    },

    onDeath : function eclocomotionOnDeathFn()
    {
        this.setActive(false);
    },

    setActive : function eCLocomotionSetActiveFn(isActive)
    {
        this.active = isActive;
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECLocomotion.prototype.entityComponentName] = ECLocomotion;

ECLocomotion.create = function eCLocomotionCreateFn(globals, parameters)
{
    return new ECLocomotion(globals, parameters);
};
