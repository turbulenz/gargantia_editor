//
//  Game Camera
//
//  Behaviours.
//      Frame Scene (given a direction).
//      Watch Object (given a direction, and a follow amount).

/*global EditorCameraController: false*/
/*global TWEEN: false*/
/*global V3Zoomer: false*/
/*jshint white: false*/

function GameCamera() {}

GameCamera.prototype =
{
    globals : undefined,

    reset : function gameCameraResetFn()
    {
        var md = this.globals.mathDevice;

        this.desiredV3Focus     = md.v3BuildZero();
        this.currentV3Focus     = md.v3Copy(this.desiredV3Focus);
        this.desiredV3Position  = md.v3Build(0.0, 0.0, -1.0);
        this.currentV3Position  = md.v3Copy(this.desiredV3Position);
        this.desiredV3Direction = md.v3Build(0.0, 0.0, 1.0);
        this.currentV3Direction = md.v3Copy(this.desiredV3Direction);
        this.desiredV3Up        = md.v3Build(0.0, 1.0, 0.0);
        this.currentV3Up        = md.v3Copy(this.desiredV3Up);
        this.setDesiredFOV(60);
        this.currentFOV         = this.desiredFOV;

        this.updateFunction     = null;

        this.active             = true;

        this.sphereCentre       = md.v3BuildZero();
        this.sphereRadius       = 5.0;

        this.baseAngle          = -Math.PI * 0.25;
        this.desiredBaseAngle   = -Math.PI * 0.25;
        this.startBaseAngle     = -Math.PI * 0.25;

        this.shakeAmount    =   0.0;
        this.accelerationSmooth = md.v3BuildZero();

        this.scratchPad =   {
            locomotionForward: md.v3BuildZero(),
            forward: md.v3BuildZero(),
            direction: md.v3BuildZero(),
            prediction: md.v3BuildZero()
        };

        this.valueName = "tweak";

        this.debugUI = true;
    },

    updateCameraValues : function gamecameraUpdateCameraValuesFn()
    {
        var newCameraValues = this.calculateCameraValues();
        if (newCameraValues !== this.currentCameraValues)
        {
            this.currentCameraValues    =   newCameraValues;
        }
    },

    calculateCameraValues : function gamecameraCalculateCameraValuesFn()
    {
        var cameraValueLibrary = this.cameraValueLibrary;
        return cameraValueLibrary[this.valueName];
    },

    getCameraValues : function gamecameraGetCameraValuesFn()
    {
        return this.currentCameraValues;
    },

    init : function gameCameraInitFn()
    {
        this.reset();

        var globals                  = this.globals;
        var ui                       = globals.dynamicUI;

        var cameraGroup              = ui ? ui.addGroup("Camera", globals.uiGroups.graphics, function () {}, {collapsable: true}) : null;

        var exposeVariables = function (valueObject, objectName)
        {
            ui.watchVariable(
                'Blend Rate',
                valueObject,
                'blendRate',
                'slider',
                cameraGroup,
                {
                    min : 0.001,
                    max : 1.0,
                    step : 0.001
                });

            ui.watchVariable(
                'FOV',
                valueObject,
                'fov',
                'slider',
                cameraGroup,
                {
                    min : 10.0,
                    max : 135.0,
                    step : 0.1
                });

            ui.watchVariable(
                'Drag',
                valueObject,
                'stringDrag',
                'slider',
                cameraGroup,
                {
                    min: 0.8,
                    max: 1.0,
                    step: 0.02
                }
            );

            ui.watchVariable(
               'Velocity Inherit',
                valueObject,
                'stringVelocityInherit',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 0.5,
                    step: 0.05
                }
            );

            ui.watchVariable(
                'Lookahead Distance',
                valueObject,
                'stringCameraForwardLookahead',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 10.0,
                    step: 0.1
                }
            );

            ui.watchVariable(
                'Lookahead Prediction',
                valueObject,
                'stringCameraAccelerationLookahead',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 10.0,
                    step: 0.1
                }
            );

            ui.watchVariable(
                'Lookahead Weight',
                valueObject,
                'stringLookaheadWeight',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 5.0,
                    step: 0.25
                }
            );

            ui.watchVariable(
                'String Rigidity',
                valueObject,
                'stringRigidity',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 4.0,
                    step: 0.25
                }
            );

            ui.watchVariable(
                'Max Roll',
                valueObject,
                'stringMaxRoll',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 0.2,
                    step: 0.025
                }
            );

            ui.watchVariable(
                'Roll Speed',
                valueObject,
                'stringRollSpeed',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 2.0,
                    step: 0.2
                }
            );

            ui.watchVariable(
                'Roll Smoothing',
                valueObject,
                'stringRollSmoothing',
                'slider',
                cameraGroup,
                {
                    min: 0.0,
                    max: 0.2,
                    step: 0.025
                }
            );

        };

        var cameraValueLibrary = this.cameraValueLibrary = {};

// =======================================================================================================================================
// ****************************************************** T W E A K **********************************************************************
// =======================================================================================================================================

        cameraValueLibrary.tweak   =   {
            zoomerBlend                    : false,
            zoomerBlendTime                : 0.75,
            blendRate                      : 0.7, //NOTE
            fov                            : 90, //NOTE
            cage                           : true,
            minRadius                      : 5.0,
            maxRadius                      : 5.0,
            trackEnemies                   : false,
            trackSuspiciousEnemies         : false,
            enemyNonInterestRange          : 16.0,
            enemyInterestRange             : 8.0,
            trackCursor                    : true,
            cursorLerp                     : 0.7,
            maxCursorDistance              : 10.0,
            trackMovementDest              : true,
            moveDestLerp                   : 0.7,
            maxMoveDestDistance            : 10.0,
            verticalAngle                  : 50.0,
            pivotDistance                  : 120,
            usePivot                       : false,
            focusYOffset                   : -1.5,
            zoomOffset                     : 10,
            pan                            : 1.0,
            stringLength                   : 2.0,

            stringElasticity               : 0.4, //0.5,
            stringDrag                     : 0.93, //0.94,
            stringVelocityInherit          : 0.1,
            stringCameraForwardLookahead     : 8.0,
            stringCameraAccelerationLookahead: 3.0,
            stringCameraLookahead          : 8.0,
            stringLookaheadWeight          : 0.5,
            stringRigidity                 : 1.5,
            stringMaxRoll                  : 0.01,
            stringRollSpeed                : 0.01,
            stringRollSmoothing            : 0.2,
            stringSegmentMinLength         : 3.0,
            stringSegmentBaseLength        : 4.0,
            stringSegmentVelocityScale     : 0.05, //0.05,
            stringSegmentAccelerationScale : 0.75, //0.5,
            stringSegmentAccelerationTimeScale : 0.5,
            stringSegmentAccelerationTimeWeight : 0.5,
            stringSegmentAccelerationTimeDrag : 0.8,
            stringSegmentSmoothing         : 0.005 //0.0025
        };

// =======================================================================================================================================
// ****************************************************** W I N G S **********************************************************************
// =======================================================================================================================================

        cameraValueLibrary.wings   =   {
            zoomerBlend                    : false,
            zoomerBlendTime                : 0.75,
            blendRate                      : 0.5, //NOTE
            fov                            : 90, //NOTE
            cage                           : true,
            minRadius                      : 5.0,
            maxRadius                      : 5.0,
            trackEnemies                   : false,
            trackSuspiciousEnemies         : false,
            enemyNonInterestRange          : 16.0,
            enemyInterestRange             : 8.0,
            trackCursor                    : true,
            cursorLerp                     : 0.7,
            maxCursorDistance              : 10.0,
            trackMovementDest              : true,
            moveDestLerp                   : 0.7,
            maxMoveDestDistance            : 10.0,
            verticalAngle                  : 50.0,
            pivotDistance                  : 120,
            usePivot                       : false,
            focusYOffset                   : -1.5,
            zoomOffset                     : 10,
            pan                            : 1.0,
            stringLength                   : 2.0,

            stringElasticity               : 0.5,
            stringDrag                     : 0.94,
            stringVelocityInherit          : 0.1,
            stringCameraForwardLookahead     : 8.0,
            stringCameraAccelerationLookahead: 3.0,
            stringCameraLookahead          : 8.0,
            stringLookaheadWeight          : 0.5,
            stringRigidity                 : 1.5,
            stringMaxRoll                  : 0.01,
            stringRollSpeed                : 0.01,
            stringRollSmoothing            : 0.2,
            stringSegmentMinLength         : 4.0,
            stringSegmentBaseLength        : 4.0,
            stringSegmentVelocityScale     : 0.05,
            stringSegmentAccelerationScale : 0.5,
            stringSegmentAccelerationTimeScale : 0.5,
            stringSegmentAccelerationTimeWeight : 0.5,
            stringSegmentAccelerationTimeDrag : 0.8,
            stringSegmentSmoothing         : 0.0025
        };

// =======================================================================================================================================
// ****************************************************** T W I T C H ********************************************************************
// =======================================================================================================================================

        cameraValueLibrary.twitch   =   {
            zoomerBlend                    : false,
            zoomerBlendTime                : 0.75,
            blendRate                      : 0.4, //NOTE
            fov                            : 70, //NOTE
            cage                           : true,
            minRadius                      : 5.0,
            maxRadius                      : 5.0,
            trackEnemies                   : false,
            trackSuspiciousEnemies         : false,
            enemyNonInterestRange          : 16.0,
            enemyInterestRange             : 8.0,
            trackCursor                    : true,
            cursorLerp                     : 0.7,
            maxCursorDistance              : 10.0,
            trackMovementDest              : true,
            moveDestLerp                   : 0.7,
            maxMoveDestDistance            : 10.0,
            verticalAngle                  : 50.0,
            pivotDistance                  : 120,
            usePivot                       : false,
            focusYOffset                   : -1.5,
            zoomOffset                     : 10,
            pan                            : 1.0,
            stringLength                   : 2.0,

            stringElasticity               : 0.125,
            stringDrag                     : 0.925,
            stringVelocityInherit          : 0.15,
            stringCameraForwardLookahead     : 3.0,
            stringCameraAccelerationLookahead: 1.0,
            stringCameraLookahead          : 3.0,
            stringLookaheadWeight          : 0.3,
            stringRigidity                 : 0.25,
            stringMaxRoll                  : 0.01,
            stringRollSpeed                : 0.01,
            stringRollSmoothing            : 0.4,
            stringSegmentMinLength         : 3.0,
            stringSegmentBaseLength        : 4.0,
            stringSegmentVelocityScale     : 0.0,
            stringSegmentAccelerationScale : 0.4,
            stringSegmentAccelerationTimeScale : 0.0,
            stringSegmentAccelerationTimeWeight : 0.0,
            stringSegmentAccelerationTimeDrag : 0.8,
            stringSegmentSmoothing         : 0.005
        };

// =======================================================================================================================================
// ****************************************************** A R C A D E ********************************************************************
// =======================================================================================================================================

        cameraValueLibrary.arcade   =   {
            zoomerBlend                    : false,
            zoomerBlendTime                : 0.1, //0.25,
            blendRate                      : 0.3, //NOTE
            fov                            : 70, //75, //NOTE
            cage                           : true,
            minRadius                      : 5.0,
            maxRadius                      : 5.0,
            trackEnemies                   : false,
            trackSuspiciousEnemies         : false,
            enemyNonInterestRange          : 16.0,
            enemyInterestRange             : 8.0,
            trackCursor                    : true,
            cursorLerp                     : 0.7,
            maxCursorDistance              : 10.0,
            trackMovementDest              : true,
            moveDestLerp                   : 0.7,
            maxMoveDestDistance            : 10.0,
            verticalAngle                  : 50.0,
            pivotDistance                  : 120,
            usePivot                       : false,
            focusYOffset                   : -1.5,
            zoomOffset                     : 10,
            pan                            : 1.0,
            stringLength                   : 2.0,

            stringElasticity                  : 0.6, //0.25,
            stringDrag                        : 0.91, //0.91,
            stringVelocityInherit             : 0.05, //0.15,
            stringCameraForwardLookahead      : 2.0,
            stringCameraAccelerationLookahead : 2.0, //3.0,
            stringCameraLookahead             : 2.0,
            stringLookaheadWeight             : 0.05,
            stringRigidity                    : 0.05, //0.9,
            stringMaxRoll                     : 0.025,
            stringRollSpeed                   : 0.1,
            stringRollSmoothing               : 0.1,
            stringSegmentMinLength            : 2.0,
            stringSegmentBaseLength           : 2.0,
            stringSegmentVelocityScale        : 0.0,
            stringSegmentAccelerationScale    : 0.0,
            stringSegmentAccelerationTimeScale : 0.01, //0.3,
            stringSegmentAccelerationTimeWeight : 1.0, //0.75,
            stringSegmentAccelerationTimeDrag : 0.9, //0.7,
            stringSegmentSmoothing            : 0.05
		};

        if (ui)
        {
            exposeVariables(cameraValueLibrary.tweak);
        }
        this.updateCameraValues();
    },

    setHero : function gameCameraSetHeroFn(heroEntity)
    {
        var md  =   this.globals.mathDevice;

        var focusLocation;

        if (this.heroEntity !== heroEntity)
        {
            this.heroEntity =   heroEntity;

            this.baseAngle  = 0.0;
            if (heroEntity)
            {
                focusLocation   =   md.v3Add(heroEntity.getv3Location(), md.v3Build(0.0, -10.0, 0.0));

                this.setDesiredFocus(focusLocation);
                this.setDesiredPosition(md.v3Sub(heroEntity.getv3Location(), this.desiredV3Direction));
            }
            else
            {
                focusLocation = md.v3BuildZero();
                this.setDesiredFocus(focusLocation);
                this.setDesiredPosition(md.v3Sub(md.v3BuildZero(), this.desiredV3Direction));
            }

            this.setShouldSnap();
        }
    },

    setShouldSnap : function gamecameraSetShouldSnapFn()
    {
        this.shouldSnap = true;
    },

    blend : function gamecameraBlendFn(cameraValues)
    {
        if (this.zoomerBlend || cameraValues.zoomerBlend)
        {
            this.blendZoomer(cameraValues.zoomerBlendTime);
        }
        else
        {
            this.blendLerp(this.getTimeAdjustedBlendFactor(cameraValues.blendRate));
        }
    },

    blendLerp : function gameCameraBlendLerpFn(blend_factor)
    {
        var md = this.globals.mathDevice;

        //Used to build position and focus.
        md.v3Lerp(this.currentV3Direction,  this.desiredV3Direction,    1.0,   this.currentV3Direction);
        //md.v3Lerp(this.currentV3Direction,  this.desiredV3Direction,    blend_factor,   this.currentV3Direction);
        md.v3Normalize(this.currentV3Direction, this.currentV3Direction);

        md.v3Lerp(this.currentV3Focus,      this.desiredV3Focus,        blend_factor,   this.currentV3Focus);
        md.v3Lerp(this.currentV3Position,   this.desiredV3Position,     blend_factor,   this.currentV3Position);
        md.v3Lerp(this.currentV3Up,         this.desiredV3Up,           blend_factor,   this.currentV3Up);

        this.currentFOV += (this.desiredFOV - this.currentFOV) * blend_factor;
    },

    getCurrentV3Direction : function gamecameraGetCurrentV3DirectionFn()
    {
        return this.currentV3Direction;
    },

    snap : function gameCameraSnapFn()
    {
        if (this.zoomerBlend)
        {
            this.snapZoomer();
        }
        else
        {
            this.blendLerp(1.0);
        }
    },

    apply : function gameCameraApplyFn()
    {
        var md = this.globals.mathDevice;

        var scratchPad  =   this.scratchPad;

        this.camera.setFOV(this.currentFOV);

        var currentV3Position  = scratchPad.v3Position = md.v3Copy(this.currentV3Position, scratchPad.v3Position);
        var currentV3Up        = scratchPad.v3Up       = md.v3Copy(this.currentV3Up, scratchPad.v3Up);
        var currentV3Focus;

        if (this.useDirection)
        {
            currentV3Focus = scratchPad.v3Focus = md.v3Add(currentV3Position, this.currentV3Direction,
                                                           scratchPad.v3Focus);
        }
        else
        {
            currentV3Focus = scratchPad.v3Focus = md.v3Copy(this.currentV3Focus, scratchPad.v3Focus);
        }

        if (this.gameManager.getGameClock().getTimeStep() > 0.0)
        {
            this.applyShake(currentV3Position, 1.0);
            this.applyShake(currentV3Up, 0.25);
            this.applyShake(currentV3Focus, 1.0);
        }

        // Ensure camera is always atleast 7 metres from hero
        var entity = this.targetEntity;
        if (entity)
        {
            var del = scratchPad.del = md.v3Sub(currentV3Position, entity.getv3Location(), scratchPad.del);
            var dsq = md.v3LengthSq(del);
            if (dsq < 7 * 7)
            {
                md.v3AddScalarMul(entity.getv3Location(), del, 7 / Math.sqrt(dsq), currentV3Position);
            }
        }

        this.camera.lookAt(currentV3Focus,
                           currentV3Up,
                           currentV3Position);

//        this.camera.lookAt([-500, 50, 0], [0, 1, 0], [-300, 300, -350]);

        this.shakeAmount = 0.0;

        this.updateCameraMatrix();
    },

    addShake : function gameCameraAddShakeFn(amount, duration)
    {
        var that = this;
        TWEEN.Create({shake : amount})
                 .to({shake : 0.0}, duration)
                 .easing(TWEEN.Easing.Linear.None)
                 .onUpdate(function () {
                    that.shakeAmount = Math.max(this.shake, that.shakeAmount);
                })
                 .start();
    },

    applyShake : function gamecameraApplyShakeFn(v3CameraVector, scale)
    {
        var md = this.globals.mathDevice;

        if (this.shakeAmount > 0.0)
        {
            md.v3Lerp(v3CameraVector,
                      md.v3Add(v3CameraVector, md.v3BuildRandom(0.2 * scale * this.shakeAmount)),
                      0.25,
                      v3CameraVector);
        }
    },

    getV3PathDestination : function gameCameraGetV3PathDestinationFn()
    {
        var heroEntity = this.heroEntity;
        var ecLocomotion = heroEntity.getEC('ECLocomotion');
        return ecLocomotion.getVisibleDestination();
    },

    teleport : function gameCameraTeleportFn(v3Destination, v3Displacement)
    {
        var md = this.globals.mathDevice;

        this.desiredV3Focus    = md.v3Add(this.desiredV3Focus,    v3Displacement, this.desiredV3Focus);
        this.currentV3Focus    = md.v3Add(this.currentV3Focus,    v3Displacement, this.currentV3Focus);
        this.desiredV3Position = md.v3Add(this.desiredV3Position, v3Displacement, this.desiredV3Position);
        this.currentV3Position = md.v3Add(this.currentV3Position, v3Displacement, this.currentV3Position);
    },

    update : function gameCameraUpdateFn()
    {
        this.updateCameraValues();

        if (this.updateFunction)
        {
            this.updateFunction();
        }

        var cameraValues = this.getCameraValues();

        this.setZoomerBlend(cameraValues.zoomerBlend);

        if (this.active)
        {
            this.setDesiredFOV(this.getCameraValues().fov);

            if (this.shouldSnap)
            {
                this.snap();
                this.shouldSnap = false;
            }
            else
            {
                this.blend(cameraValues);
            }
            this.apply();
        }
    },

    setZoomerBlend : function gamecameraSetZoomerBlendFn(zoomerBlend)
    {
        if (this.zoomerBlend !== zoomerBlend)
        {
            if (zoomerBlend)
            {
                this.startZoomer();
            }
            this.zoomerBlend = zoomerBlend;
        }
    },

    snapZoomer : function gamecameraSnapZoomerFn()
    {
        this.zoomerFocus.setv3Position(this.desiredV3Focus);
        this.zoomerPosition.setv3Position(this.desiredV3Position);
        this.zoomerUp.setv3Position(this.desiredV3Up);
        this.zoomerDirection.setv3Position(this.desiredV3Direction);
    },

    startZoomer : function gamecameraStartZoomerFn()
    {
        this.zoomerFocus     = V3Zoomer.create(this.globals);
        this.zoomerPosition  = V3Zoomer.create(this.globals);
        this.zoomerUp        = V3Zoomer.create(this.globals);
        this.zoomerDirection = V3Zoomer.create(this.globals);

        this.zoomerFocus.setv3Position(this.currentV3Focus);
        this.zoomerPosition.setv3Position(this.currentV3Position);
        this.zoomerUp.setv3Position(this.currentV3Up);
        this.zoomerDirection.setv3Position(this.currentV3Direction);
    },

    zoomTo : function gamecameraZoomToFn(v3Position, v3Focus, timeToArrive)
    {
        this.zoomerPosition.setv3Destination(v3Position, timeToArrive);
        this.zoomerFocus.setv3Destination(v3Focus, timeToArrive);
    },

    blendZoomer : function gamecameraBlendZoomerFn(arriveTime)
    {
        var dt = this.globals.gameAppTimeStep;

        if (!this.continuousZoom)
        {
            this.zoomerFocus    .setv3Destination(this.desiredV3Focus    , arriveTime);
            this.zoomerPosition .setv3Destination(this.desiredV3Position , arriveTime);
            this.zoomerUp       .setv3Destination(this.desiredV3Up       , arriveTime);
            this.zoomerDirection.setv3Destination(this.desiredV3Direction, arriveTime);
        }

        this.zoomerFocus    .update(dt);
        this.zoomerPosition .update(dt);
        this.zoomerUp       .update(dt);
        this.zoomerDirection.update(dt);

        this.currentV3Focus     = this.zoomerFocus    .getv3Location();
        this.currentV3Position  = this.zoomerPosition .getv3Location();
        this.currentV3Up        = this.zoomerUp       .getv3Location();
        this.currentV3Direction = this.zoomerDirection.getv3Location();

        this.currentFOV += (this.desiredFOV - this.currentFOV) * 0.1;
    },

    getTimeAdjustedBlendFactor : function gamecameraGetTimeAdjustedBlendFactorFn(blendRate)
    {
        var timeStepFraction = this.globals.gameAppTimeStep * 30.0;
        return 1.0 - Math.pow(1.0 - blendRate, timeStepFraction);
    },

    updateOrbitAndZoomScene : function gameCameraupdateOrbitAndZoomSceneFn()
    {
        var md                     =  this.globals.mathDevice;

        this.updateRotation();

        //Update the desired direction, then do the normal view scene.
        var rotationMatrix         =  md.m33FromAxisRotation(this.currentV3Up, this.globals.appTimeStep * Math.PI * 0.025);

        this.desiredV3Direction    =  md.m33Transform(rotationMatrix, this.desiredV3Direction);

        var cameraValues           =  this.getCameraValues();

        var required_distance      =  this.getDistanceRequired(5);
        required_distance          += 2.0 * (1.0 + Math.sin(this.globals.appCurrentTime * 0.1));

        md.v3Copy(this.sphereCentre, this.desiredV3Focus);
        this.desiredV3Focus[1]     += cameraValues.focusYOffset;

        md.v3Sub(this.sphereCentre, md.v3ScalarMul(this.currentV3Direction, required_distance), this.desiredV3Position);
    },

    updateOscillateAndZoomScene : function gamecameraUpdateOscillateAndZoomSceneFn()
    {
        var md                     =  this.globals.mathDevice;

        this.updateRotation();

        //Update the desired direction, then do the normal view scene.
        var rotationMatrix         =  md.m33FromAxisRotation(md.v3BuildYAxis(), Math.sin((this.globals.appCurrentTime - this.startOscillateAppTime) * 0.1) * Math.PI * 0.125);

        this.desiredV3Direction    =  md.m33Transform(rotationMatrix, this.startOscillatev3Direction);

        var cameraValues           =  this.getCameraValues();

        var required_distance      =  this.getDistanceRequired(5);
        required_distance          += 2.0 * (1.0 + Math.sin(this.globals.appCurrentTime * 0.1));

        md.v3Copy(this.sphereCentre, this.desiredV3Focus);
        this.desiredV3Focus[1]     += cameraValues.focusYOffset;

        md.v3Sub(this.sphereCentre, md.v3ScalarMul(this.currentV3Direction, required_distance), this.desiredV3Position);
    },

    updateViewScene : function gameCameraUpdateViewSceneFn()
    {
        //var scene = this.globals.scene;
        var md                     = this.globals.mathDevice;

        this.updateRotation();

        this.adjustDesiredAngleBasedOnPanning();
        this.buildSphereCentreAndExtents();

        var cameraValues           =   this.getCameraValues();

        var required_distance      = this.getDistanceRequired(this.sphereRadius);
        required_distance          +=  cameraValues.zoomOffset;

        md.v3Copy(this.sphereCentre, this.desiredV3Focus);
        this.desiredV3Focus[1]     +=  cameraValues.focusYOffset;

        md.v3Sub(this.sphereCentre, md.v3ScalarMul(this.desiredV3Direction, required_distance), this.desiredV3Position);

        this.useDirection = false;
    },

    updateStringAndCage : function gamecameraupdateStringAndCageFn()
    {
        //var scene = this.globals.scene;
        var md = this.globals.mathDevice;

        this.adjustDesiredAngleBasedOnPanning();
        this.buildSphereCentreAndExtents();

        var cameraValues    =   this.getCameraValues();

        var cage_distance = this.getDistanceRequired(this.sphereRadius);
        cage_distance   +=  cameraValues.zoomOffset;

        var string_distance   =   cage_distance + cameraValues.stringLength;

        var scratchPad  =   this.scratchPad;

        //
        //  Focus position.
        //
        scratchPad.prevDesiredV3Focus   =   md.v3Copy(this.desiredV3Focus, scratchPad.prevDesiredV3Focus);

        md.v3Copy(this.sphereCentre, this.desiredV3Focus);
        this.desiredV3Focus[1]  +=  cameraValues.focusYOffset;

        scratchPad.v3DesiredFocusMovement   =   md.v3Sub(this.desiredV3Focus, scratchPad.prevDesiredV3Focus, scratchPad.v3DesiredFocusMovement);

        //
        //  Camera position.
        //
        scratchPad.v3DesiredLocation    = md.v3Copy(this.desiredV3Position, scratchPad.v3DesiredLocation);

        //  Apply panning to current Location.
        scratchPad.v3DesiredLocation    = md.v3AddScalarMul(scratchPad.v3DesiredLocation, scratchPad.v3DesiredFocusMovement, cameraValues.pan);

        scratchPad.v3DesiredLocation[1] = this.sphereCentre[1];

        //If closer than cage, push out.
        //If farther than string, pull in.

        md.v3Sub(scratchPad.v3DesiredLocation, this.sphereCentre, scratchPad.v3DesiredLocation);
        md.v3ClampLength(scratchPad.v3DesiredLocation, cage_distance, string_distance, scratchPad.v3DesiredLocation);
        md.v3Add(scratchPad.v3DesiredLocation, this.sphereCentre, scratchPad.v3DesiredLocation);

        //Set height offset based on angle and string distance.
        var yAngle           = (cameraValues.verticalAngle * 2.0 * Math.PI) / 360.0;
        scratchPad.v3DesiredLocation[1] +=  cage_distance * Math.tan(yAngle);

        md.v3Copy(scratchPad.v3DesiredLocation, this.desiredV3Position);

        //Update desired v3Direction to be this.
        md.v3Sub(this.desiredV3Focus, this.desiredV3Position, this.desiredV3Direction);
        md.v3Normalize(this.desiredV3Direction, this.desiredV3Direction);

        this.useDirection = false;
    },

    updateFreeMove : function gameCameraUpdateFreeMoveFn()
    {
        this.cameraController.update();

        this.updateCameraMatrix();
    },

    updatePanToEntity : function gameCameraUpdatePanToEntityFn()
    {
        var md = this.globals.mathDevice;
        if (this.targetEntity)
        {
            if (this.targetEntity.toBeDestroyed)
            {
                this.targetEntity = null;
            }
            else
            {
                this.setDesiredFocus(this.targetEntity.v3Location);
                md.v3Add(this.targetEntity.v3Location, this.panOffset, this.desiredV3Position);
            }
        }
    },

    updateString : function gameCameraUpdateStringFn()
    {
//        if (this.debugUI)
//        {
//            var info =
//            {
//                 x : 150,
//                 y : 25,
//                 alignment : 0,
//                 pointSize : 16,
//                 specialScale : 1,
//                 color : guiColors.white,
//                 fontStyle : 'bold'
//            };
//            var simpleFontRenderer = this.globals.simpleFontRenderer;
//            simpleFontRenderer.drawFont('camera control mode = ' + this.valueName, info);
//        }

        var entity = this.targetEntity;
        if (!entity)
        {
            return;
        }
        if (entity.toBeDestroyed)
        {
            this.targetEntity = null;
            return;
        }
        var cameraValues    =   this.getCameraValues();
        var md = this.globals.mathDevice;
        var dd = this.globals.debugDrawFlags.camera && this.globals.debugDraw;

        var scratchPad = this.scratchPad;
        var locomotionForward = scratchPad.locomotionForward;
        var forward = scratchPad.forward;
        var direction = scratchPad.direction;
        var prediction = scratchPad.prediction;

        var ecLocomotion = entity.getEC('ECLocomotion');
        var location = ecLocomotion.getPosition();
        var velocity = ecLocomotion.getVelocity();
        var acceleration = ecLocomotion.getAcceleration();
        ecLocomotion.getForward(locomotionForward);

        var targetSegment = cameraValues.stringSegmentBaseLength;
        targetSegment += cameraValues.stringSegmentVelocityScale * md.v3Length(velocity);
        targetSegment += cameraValues.stringSegmentAccelerationScale * md.v3Dot(acceleration, locomotionForward);
        if (!this.accelerationTime)
        {
            this.accelerationTime = 0;
        }
        this.accelerationTime += md.v3Dot(acceleration, locomotionForward) * cameraValues.stringSegmentAccelerationTimeScale;
        this.accelerationTime *= cameraValues.stringSegmentAccelerationTimeDrag;
        targetSegment += cameraValues.stringSegmentAccelerationTimeWeight * this.accelerationTime;

        if (targetSegment < cameraValues.stringSegmentMinLength)
        {
            targetSegment = cameraValues.stringSegmentMinLength;
        }
        this.segmentLength += (targetSegment - this.segmentLength) * cameraValues.stringSegmentSmoothing;
        var segment = this.segmentLength;

        function pull(dir, to, invel, from)
        {
            var pos = from.position;
            var vel = from.velocity;
            var dx = to[0] + segment * dir[0] - pos[0];
            var dy = to[1] + segment * dir[1] - pos[1];
            var dz = to[2] + segment * dir[2] - pos[2];
            var del = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (del === 0)
            {
                del = 0.001;
            }
            var force = del / del * cameraValues.stringElasticity;
            var prevVel0 = vel[0];
            var prevVel1 = vel[1];
            var prevVel2 = vel[2];
            vel[0] += dx * force + (invel[0] - vel[0]) * cameraValues.stringVelocityInherit;
            vel[1] += dy * force + (invel[1] - vel[1]) * cameraValues.stringVelocityInherit;
            vel[2] += dz * force + (invel[2] - vel[2]) * cameraValues.stringVelocityInherit;
            vel[0] *= cameraValues.stringDrag;
            vel[1] *= cameraValues.stringDrag;
            vel[2] *= cameraValues.stringDrag;
            pos[0] += vel[0] / 30;
            pos[1] += vel[1] / 30;
            pos[2] += vel[2] / 30;
            var accel = from.acceleration;
            accel[0] += ((vel[0] - prevVel0) * 30 - accel[0]) * cameraValues.stringRollSmoothing;
            accel[1] += ((vel[1] - prevVel1) * 30 - accel[1]) * cameraValues.stringRollSmoothing;
            accel[2] += ((vel[2] - prevVel2) * 30 - accel[2]) * cameraValues.stringRollSmoothing;
            if (dd)
            {
                dd.drawDebugSphere(to, 0.25, 1.0, 1.0, 0.0);
                dd.drawDebugSphere(md.v3AddScalarMul(to, dir, segment), 0.125, 0.0, 1.0, 0.0);
                dd.drawDebugSphere(pos, 0.5, 1.0, 0.0, 0.0);
            }
        }

        var string = this.string;
        var pre, last;
        md.v3Neg(locomotionForward, forward);
        pull(forward, location, velocity, string[0]);
        for (var i = 1; i < string.length; i += 1)
        {
            pre = string[i - 1];
            last = string[i];
            md.v3Sub(last.position, pre.position, direction);
            md.v3AddScalarMul(direction, forward, segment * cameraValues.stringRigidity, direction);
            md.v3Normalize(direction, direction);
            pull(direction, string[i - 1].position, string[i - 1].velocity, string[i]);
        }

        last = string[string.length - 1];
        md.v3Copy(last.position, this.desiredV3Position);
        pre = string[string.length - 2];
        md.v3Sub(pre.position, last.position, direction);
        md.v3AddScalarMul(location,
                          locomotionForward,
                          md.v3Length(ecLocomotion.getVelocity()) * cameraValues.stringCameraForwardLookahead,
                          prediction);
        if (dd)
        {
            dd.drawDebugSphere(prediction, 0.25, 0.5, 0, 0.5);
        }
        var ecaccel = ecLocomotion.getAcceleration();
        var accel = this.accelerationSmooth;
        accel[0] += (ecaccel[0] - accel[0]) * 0.025;
        accel[1] += (ecaccel[1] - accel[1]) * 0.025;
        accel[2] += (ecaccel[2] - accel[2]) * 0.025;
        md.v3AddScalarMul(prediction,
                          accel,
                          cameraValues.stringCameraAccelerationLookahead,
                          prediction);
        if (dd)
        {
            dd.drawDebugSphere(prediction, 0.5, 1.0, 0, 1.0);
        }
        md.v3AddScalarMul(direction,
                          md.v3Sub(prediction, last.position, prediction),
                          cameraValues.stringLookaheadWeight,
                          direction);
        md.v3Normalize(direction, direction);
        this.useDirection = true;
        md.v3Copy(direction, this.desiredV3Direction);

        // above looking downs
        this.desiredV3Position[1] += 2;
        this.desiredV3Direction[1] -= 0.1;

        accel = last.acceleration;
        this.shakeAmount = 0.2 * (1 - ecLocomotion.stallScale);

        var yUp = this.desiredV3Up;
        md.v3BuildYAxis(yUp);
        md.v3AddScalarMul(yUp,
                          md.v3Build(accel[0], 0, accel[2], direction),
                          Math.min(cameraValues.stringMaxRoll, cameraValues.stringRollSpeed * md.v3Length(last.velocity)),
                          yUp);
        md.v3Normalize(yUp, yUp);

        if (dd)
        {
            dd.drawDebugSphere(last.position, 0.5, 0.0, 1.0, 1.0);
        }
    },

    updateCameraMatrix : function gameCameraUpdateCameraMatrixFn()
    {
        this.camera.updateViewMatrix();
        this.camera.updateViewProjectionMatrix();

        this.camera.updateFrustumPlanes();
    },

    getDistanceRequired : function gameCameraGetDistanceRequiredFn(sphere_radius, fovToUse)
    {
        var fov = fovToUse !== undefined ? fovToUse : this.extractSmallestFOV(this.camera);

        return (sphere_radius / Math.sin(fov * 0.5));
    },

    setDesiredDirection : function gameCameraSetDesiredDirectionFn(v3desired_direction)
    {
        var md = this.globals.mathDevice;
        this.desiredV3Direction = md.v3Copy(v3desired_direction);
        md.v3Normalize(this.desiredV3Direction, this.desiredV3Direction);
    },

    setDesiredFOV : function gameCameraSetDesiredFOVFn(fov)
    {
        this.desiredFOV = fov * Math.PI * 2.0 / 360.0;
    },

    setDesiredPosition : function gameCameraSetDesiredPositionFn(v3Position)
    {
        var md = this.globals.mathDevice;
        this.desiredV3Position = md.v3Copy(v3Position, this.desiredV3Position);
    },

    setDesiredFocus : function gameCameraSetDesiredFocusFn(v3Focus)
    {
        var md = this.globals.mathDevice;
        this.desiredV3Focus = md.v3Copy(v3Focus, this.desiredV3Focus);
    },

    extractSmallestFOV : function gameCameraExtractSmallestFOVFn(camera)
    {
        return  camera.extractSmallestFOV();
    },

    setModeString : function gameCameraSetModeString(entity)
    {
        var md = this.globals.mathDevice;
        this.updateFunction = this.updateString.bind(this);

        this.targetEntity = entity;
        var ecLocomotion = entity.getEC('ECLocomotion');
        var location = ecLocomotion.getPosition();
        var velocity = ecLocomotion.getVelocity();
        var direction = ecLocomotion.getForward();
        var up = ecLocomotion.getUp();

        var cameraValues    =   this.getCameraValues();
        var segment = md.v3Length(velocity) * cameraValues.stringSegmentVelocityScale + cameraValues.stringSegmentBaseLength;
        this.segmentLength = segment;

        this.string = [];
        for (var i = 0; i < 2; i += 1)
        {
            this.string[i] = {
                position: md.v3AddScalarMul(location, direction, -(i + 1) * segment),
                velocity: md.v3Copy(velocity),
                acceleration: md.v3BuildZero()
            };
        }
        var last = this.string[this.string.length - 1];
        md.v3Copy(last.position, this.currentV3Position);
        md.v3Copy(last.position, this.desiredV3Position);
        md.v3Copy(direction, this.currentV3Direction);
        md.v3Copy(direction, this.desiredV3Direction);
        md.v3Copy(up, this.currentV3Up);
        md.v3Copy(up, this.desiredV3Up);
    },

    setModeViewScene : function gameCameraSetModeViewSceneSideOnFn(/*controlledEntity*/)
    {
        var md = this.globals.mathDevice;
        this.updateFunction         =   this.updateViewScene;
        this.desiredV3Direction     =   md.v3Build(1.0, -1.5, 1.0);
        this.desiredV3Up            =   md.v3Build(0.0, 1.0, 0.0);
    },

    setModeOrbitScene : function gameCameraSetModeOrbitSceneFn()
    {
        var md = this.globals.mathDevice;

        this.updateFunction         =   this.updateOrbitAndZoomScene;

        this.desiredV3Up            = md.v3Build(0.0, 1.0, 0.0);
    },

    setModeOscillateScene : function gameCameraSetModeOscillateSceneFn()
    {
        var md = this.globals.mathDevice;

        this.updateFunction         =   this.updateOscillateAndZoomScene;

        this.startOscillatev3Direction  = this.desiredV3Direction;
        this.startOscillateAppTime      = this.globals.appCurrentTime;

        this.desiredV3Up            = md.v3Build(0.0, 1.0, 0.0);
    },

    centreOnLevelCentre : function gamecameraCentreOnLevelCentreFn()
    {
        var gameSpace = this.gameManager.getGameSpace(this.currentV3Focus);

        var md = this.globals.mathDevice;

        if (gameSpace)
        {
            this.sphereCentre       = md.v3Copy(gameSpace.getv3Location());
            this.desiredV3Focus     = md.v3Copy(gameSpace.getv3Location());
            this.currentV3Focus     = md.v3Copy(this.desiredV3Focus);
            this.desiredV3Position  = md.v3Add(this.desiredV3Focus, md.v3Build(0.0, 0.0, -1.0));
            this.currentV3Position  = md.v3Copy(this.desiredV3Position);
        }
    },


    setModeEditor : function gamecameraSetModeEditorFn()
    {
        this.updateFunction = this.updateFreeMove;
        this.active = false;
    },

    exitModeEditor : function gamecameraExitEditorModeFn()
    {
        this.active = true;
    },

    rotate : function gamecameraRotateFn(angleDiff)
    {
        var md  =   this.globals.mathDevice;

        this.desiredBaseAngle = md.boundAngle(this.desiredBaseAngle + angleDiff);
    },

    updateRotation : function gamecameraUpdateRotationFn()
    {
        //Get the vector from the focus to the camera.
        var md  =   this.globals.mathDevice;

        var prevAngle  = this.baseAngle;
        this.baseAngle = md.lerpAngle(this.baseAngle, this.desiredBaseAngle, this.getTimeAdjustedBlendFactor(this.shouldSnap ? 1.0 : 0.15));
        var angleDiff  = md.diffAngles(prevAngle, this.baseAngle);

        if (Math.abs(angleDiff) < 0.001)
        {
            return;
        }

        var scratchPad  =   this.scratchPad;

        scratchPad.rotationMatrix  =  md.m33BuildRotationY(angleDiff, scratchPad.rotationMatrix);

        this.desiredV3Direction    =  md.m33Transform(scratchPad.rotationMatrix, this.desiredV3Direction, this.desiredV3Direction);

        //Current
        scratchPad.focusToLocation = md.v3Sub(this.currentV3Position, this.currentV3Focus, scratchPad.focusToLocation);
        scratchPad.focusToLocation = md.m33Transform(scratchPad.rotationMatrix, scratchPad.focusToLocation, scratchPad.focusToLocation);

        this.currentV3Position  =   md.v3Add(this.currentV3Focus, scratchPad.focusToLocation, this.currentV3Position);

        //Desired
        scratchPad.focusToLocation = md.v3Sub(this.desiredV3Position, this.currentV3Focus, scratchPad.focusToLocation);
        scratchPad.focusToLocation = md.m33Transform(scratchPad.rotationMatrix, scratchPad.focusToLocation, scratchPad.focusToLocation);

        this.desiredV3Position  =   md.v3Add(this.currentV3Focus, scratchPad.focusToLocation, this.desiredV3Position);
    },

    buildDesiredDirectionFromOffsets : function gamecameraGetDesiredAngleFn(horizontalOffset, verticalOffset)
    {
        var md               = this.globals.mathDevice;

        if (horizontalOffset === undefined)
        {
            horizontalOffset = 0.0;
        }
        if (verticalOffset   === undefined)
        {
            verticalOffset   = 0.0;
        }

        var cameraValues     = this.getCameraValues();
        var yAngle           = (cameraValues.verticalAngle * 2.0 * Math.PI) / 360.0;

        var v3Direction      = md.angleToV3(this.baseAngle + horizontalOffset);
        v3Direction[1]       = -Math.tan(yAngle + verticalOffset);

        return  v3Direction;
    },

    buildSphereCentreAndExtents : function gameCameraBuildSphereCentreAndExtentsFn()
    {
        //Go through each entity.
        var md = this.globals.mathDevice;

        var cameraValues = this.getCameraValues();
        var min_radius   = cameraValues.minRadius;
        var max_radius   = cameraValues.maxRadius;

        var distance_between_centres;
        var toward_new_centre;
        var desired_radius;
        var how_far_to_move;

        var sphereList  =   [];
        var thisSphere;

        var debugDraw   =   this.globals.debugDrawFlags.camera;

        //var roomCentre;
        //var roomRadius;

        var dd  =   this.globals.debugDraw;

        var primaryFocus;
        var heroLocation;

        var addLocation = function (v3Location, radius, farInterestRange, nearInterestRange)
        {
            var destv3Location  =   md.v3Copy(v3Location);
            if (primaryFocus !== undefined && farInterestRange && nearInterestRange)
            {
                var factor     = md.getFactor(farInterestRange, nearInterestRange, md.v3Distance(heroLocation, v3Location));
                factor         = md.saturate(factor);
                destv3Location = md.v3Lerp(primaryFocus, v3Location, factor);
                radius         = md.lerp(0.5, radius, factor);
            }

            sphereList.push({v3Location : destv3Location, radius : radius !== undefined ? radius : 2.0});
        };

        var addEntity = function (gameEntity, radius, farInterestRange, nearInterestRange)
        {
            addLocation(gameEntity.v3Location, radius, farInterestRange, nearInterestRange);
        };

        //Add focus destination.
        // var ecLocomotion    =   this.heroEntity.getEC('ECLocomotion');
        // var locomotionRadius = cameraValues.movementDestStartRadius;
        // if (ecLocomotion && cameraValues.trackMovementDest)
        // {
        //     locomotionRadius = md.lerp(cameraValues.movementDestStartRadius, cameraValues.movementDestMaxRadius, ecLocomotion.getTimeHeld());

        //     addLocation(ecLocomotion.getSmoothDestination(), locomotionRadius);
        // }

        //
        //Add hero.
        //
        //Set primary focus to be hero location.
        if (this.heroEntity)
        {
            heroLocation        =   this.heroEntity.getv3Location();
            primaryFocus        =   heroLocation;

            var pathDestination = this.getV3PathDestination();
            if (pathDestination && cameraValues.trackMovementDest)
            {
                //addLocation(pathDestination, 3.0);
                addLocation(md.v3ClampDistance(heroLocation,
                                               md.v3Lerp(heroLocation, pathDestination, cameraValues.moveDestLerp),
                                               0.0,
                                               cameraValues.maxMoveDestDistance),
                                               1.0);
            }

            var gameController  =   this.gameManager.gameController;
            if (cameraValues.trackCursor && !this.gameManager.isPaused())
            {
                var v3CursorTrackLocation = gameController.getCameraPanLocation();

                addLocation(md.v3ClampDistance(heroLocation,
                                               md.v3Lerp(heroLocation, v3CursorTrackLocation, cameraValues.cursorLerp),
                                               0.0,
                                               cameraValues.maxCursorDistance),
                                               1.0);
            }

            addEntity(this.heroEntity, 1.0);
        }

        //
        //Go through them
        //
        var current_centre;
        var current_radius;
        var new_centre;
        var new_radius;

        var cage    =   cameraValues.cage;

        if (cage)
        {
            addLocation(this.sphereCentre, min_radius);
        }

        //TODO.

        //Make cage work.
        //Build the desired new sphere.
        //Move the current sphere over to it as much as it can.

        var sphereIndex;
        for (sphereIndex = 0; sphereIndex < sphereList.length; sphereIndex += 1)
        {
            thisSphere  =   sphereList[sphereIndex];
            new_centre  =   thisSphere.v3Location;
            new_radius  =   thisSphere.radius;

            if (debugDraw)
            {
                dd.drawDebugSphere(new_centre, new_radius, 0.0, 1.0, 0.0);
            }

            //Todo, draw debug sphere.

            //Condition, first point.
            if (current_centre === undefined)
            {
                current_centre = md.v3Copy(new_centre);
                current_radius = Math.min(new_radius, max_radius);
            }
            else
            {
                toward_new_centre   =   md.v3Sub(new_centre, current_centre);
                distance_between_centres = md.v3Length(toward_new_centre);
                md.v3Normalize(toward_new_centre, toward_new_centre);

                if ((distance_between_centres + current_radius) < new_radius)
                {
                    //Condition - new sphere completely encloses old one.
                    desired_radius = Math.min(new_radius, max_radius);

                    how_far_to_move =   Math.min(desired_radius - current_radius, distance_between_centres);
                    if (desired_radius > current_radius)
                    {
                        current_centre  =   md.v3Add(current_centre, md.v3ScalarMul(toward_new_centre, how_far_to_move));
                        current_radius  =   desired_radius;
                    }
                }
                else if ((distance_between_centres + new_radius) < current_radius)
                {
                    //Condition - old sphere completely encloses new one.
                    //No action.
                }
                else
                {
                    //Condition - neither are enclosed.
                    //Determine the radius, and move the centre based on this new radius towards the new centre.
                    desired_radius = (distance_between_centres + current_radius + new_radius) * 0.5;

                    if (sphereIndex > 0 || !cage)
                    {
                        desired_radius = Math.min(desired_radius, max_radius);
                    }

                    if (desired_radius > current_radius)
                    {
                        current_centre  =   md.v3Add(current_centre, md.v3ScalarMul(toward_new_centre, (desired_radius - current_radius)));
                        current_radius  =   desired_radius;
                    }
                    //dd.drawDebugSphere(current_centre, current_radius, 0.0, 0.5, 0.0);
                }
            }
        }

        current_radius   =   md.clamp(current_radius, min_radius, max_radius);

        if (debugDraw)
        {
            dd.drawDebugSphere(current_centre, current_radius, 1.0, 1.0, 0.0);
        }

        this.currentGameSpace    =   this.gameManager.getCurrentGameSpace();

        if (this.currentGameSpace !== undefined)
        {
            current_centre  =   md.aabbClampSphere(this.currentGameSpace.extents, current_centre, current_radius + 3, current_centre);
        }

        if (debugDraw)
        {
            dd.drawDebugSphere(current_centre, current_radius, 1.0, 1.0, 1.0);
        }

        this.sphereRadius = current_radius;
        this.sphereCentre = current_centre;
    },

    adjustDesiredAngleBasedOnPanning : function gamecameraAdjustDesiredAngleBasedOnPanning()
    {
        var cameraValues             = this.getCameraValues();

        if (!cameraValues.usePivot)
        {
            this.setDesiredDirection(this.buildDesiredDirectionFromOffsets(0.0, 0.0));
            return;
        }

        var md                       = this.globals.mathDevice;
        var currentGameSpace         = this.gameManager.getCurrentGameSpace();

        if (!currentGameSpace)
        {
            return;
        }
        var pivotDistance            = cameraValues.pivotDistance;
        var gameSpaceCentre          = currentGameSpace.getv3Location();

        var centreToFocus           = md.v3Sub(this.desiredV3Focus, gameSpaceCentre);
        centreToFocus[1]            = 0.0;

        var baseDesiredDirection     = this.buildDesiredDirectionFromOffsets(0.0, 0.0);
        var flatDesiredDirection    = md.v3Copy(baseDesiredDirection);
        flatDesiredDirection[1]     = 0.0;

        var additionalPivotDistance =   md.v3Dot(centreToFocus, flatDesiredDirection);

        var centreLocation           = md.v3Add(gameSpaceCentre, md.v3ScalarMul(flatDesiredDirection, - pivotDistance + additionalPivotDistance));

        var centreLocationToCamera   = md.v3Sub(this.desiredV3Position, centreLocation);

        var newDesiredDirection      = md.v3Normalize(centreLocationToCamera);
        newDesiredDirection[1]  =   baseDesiredDirection[1];

        this.setDesiredDirection(newDesiredDirection);
    },

    setModePanToEntity : function gameCameraSetModePanToEntityFn(targetEntity)
    {
        this.updateFunction = this.updatePanToEntity;
        this.targetEntity = targetEntity;
        this.panOffset = this.globals.mathDevice.v3Sub(this.desiredV3Position, this.desiredV3Focus, this.panOffset);
    },

    getCurrentV3Position : function gameCameraGetCurrentV3PositionFn()
    {
        return this.currentV3Position;
    },

    getCurrentV3Focus : function gameCameraGetCurrentV3FocusFn()
    {
        return this.currentV3Focus;
    },

    getDesiredV3Focus : function gameCameraGetDesiredV3FocusFn()
    {
        return this.desiredV3Focus;
    },

    intersectWithMyPlanes : function gamecameraIntersectWithMyPlanesFn(v3Location)
    {
        if (!this.currentV3Focus)
        {
            return  undefined;
        }

        var frustumPlanes  =   this.camera.frustumPlanes;
        if (!frustumPlanes)
        {
            return  undefined;
        }

        var closestDistanceSq   =   -1;
        var thisDistanceSq;
        var v3CollisionLocation;
        var thisv3CollisionLocation;

        var scratchPad  =   this.scratchPad;

        var md           = this.globals.mathDevice;
        var v3LineOrigin = scratchPad.v3LineOrigin = md.v3Copy(this.currentV3Focus, scratchPad.v3LineOrigin);
        v3LineOrigin[1] = v3Location[1];
        var v3LineNormal = md.v3Sub(v3Location, v3LineOrigin);

        //var dd  =   this.globals.debugDraw;
        //dd.drawDebugLine(v3Location, v3LineOrigin);

        var v3CameraLocation    =   this.camera.getv3Location();

        var thisPlane;

        var frustumPlaneIndex;

        //dd.drawDebugSphere(v3LineOrigin, 2, 1, 1, 1);

        for (frustumPlaneIndex = 0; frustumPlaneIndex < 4; frustumPlaneIndex += 1)
        {
            thisPlane   =   frustumPlanes[frustumPlaneIndex];
            scratchPad.v3Plane  =   md.v3Build(thisPlane[0], thisPlane[1], thisPlane[2], scratchPad.v3Plane);
            //scratchPad.v3Plane    =    md.m43TransformVector(this.camera.matrix, scratchPad.v3Plane);
            thisv3CollisionLocation =   md.getRayPlanePositiveIntersection(
                                                               v3CameraLocation,
                                                               scratchPad.v3Plane,
                                                               v3LineOrigin,
                                                               v3LineNormal);

            if (thisv3CollisionLocation)
            {
                // dd.drawDebugSphere(v3CameraLocation, 5.0, 0, 1, 1);
                // dd.drawDebugSphere(thisv3CollisionLocation, 10.0, 0, 1, 0);
                // dd.drawDebugPoint(thisv3CollisionLocation);
                // dd.drawDebugLine(thisv3CollisionLocation, v3LineOrigin);
                thisDistanceSq  =   md.v3DistanceSq(thisv3CollisionLocation, v3LineOrigin);
                if (thisDistanceSq < closestDistanceSq || !v3CollisionLocation)
                {
                    v3CollisionLocation =   thisv3CollisionLocation;
                    closestDistanceSq   =   thisDistanceSq;
                }
            }
        }

        return  v3CollisionLocation;
    },

    isOnScreen : function gamecameraIsOnScreenFn(v3Location)
    {
        var frustumPlanes  =   this.camera.frustumPlanes;
        if (!frustumPlanes)
        {
            return  undefined;
        }

        var md = this.globals.mathDevice;

        return md.isInsidePlanesPoint(v3Location, frustumPlanes);
    },

    getv2ScreenLocationFromWorld : function gameCameraGetv2ScreenLocationFromWorldFn(v3Location, allowOffscreen)
    {
        var globals        = this.globals;
        var camera         = globals.camera;
        var graphicsDevice = globals.graphicsDevice;

        var width   =   graphicsDevice.width;
        var height  =   graphicsDevice.height;

        var v2ScreenLocation            =   camera.worldToScreen(v3Location);

        if (allowOffscreen)
        {
            //If off screen, then use a tighter tether.
            if (!v2ScreenLocation ||
                v2ScreenLocation[0] < 0.0 ||
                v2ScreenLocation[0] > width ||
                v2ScreenLocation[1] < 0.0 ||
                v2ScreenLocation[1] > height)
            {
                var newv3Location           =   this.intersectWithMyPlanes(v3Location);
                if (!newv3Location)
                {
                    return  undefined;
                }
                v2ScreenLocation            =   camera.worldToScreen(newv3Location);
            }
        }

        if (!v2ScreenLocation)
        {
            return  undefined;
        }

        //Here is where we ensure that the coordinate is bound.

        return  v2ScreenLocation;
    }
};

GameCamera.create = function gameCameraCreateFn(globals, gameManager)
{
    //Lazily assign the static globals
    if (GameCamera.prototype.globals === undefined)
    {
        GameCamera.prototype.globals = globals;
    }

    var gameCamera = new GameCamera();

    gameCamera.gameManager      = gameManager;
    gameCamera.camera           = globals.camera;
    gameCamera.cameraController = null;
    if (typeof EditorCameraController !== "undefined")
    {
        gameCamera.cameraController = EditorCameraController.create(globals.graphicsDevice, globals.camera);
    }

    gameCamera.init();

    return gameCamera;
};
