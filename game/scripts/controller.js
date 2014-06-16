//
//  GameController!
//
//  Casts a ray into the scene.
//  Is assigned a player character.
//  Gives orders to that character.
//

/*global Config: false*/
/*global debug: false*/
/*global console: false*/
/*global ControllerAction: false*/
/*global GamestatePlaying: false*/
/*global TurbulenzEngine: false*/
/*global Config: false*/

function GameController() {}

GameController.prototype =
{
    initUI : function gameControllerInitUIFn()
    {
        var globals     =   this.globals;
        var ui          =   globals.dynamicUI;
        if (!ui)
        {
            return;
        }
    },

    setActive : function gameControllerSetActiveFn(active)
    {
        if (this.active === active)
        {
            return;
        }

        this.active =   active;

        if (active)
        {
            this.addEventHandlers();
            this.setCursorTexture('textures/cursors/cursormid.png');
        }
        else
        {
            this.removeEventHandlers();
        }
    },

    isActive : function gameControllerIsActiveFn()
    {
        return this.active;
    },

    getv2ScreenCoordX : function gameControllerGetv2ScreenCoordXFn()
    {
        return  this.sx;
    },

    getv2ScreenCoordY : function gameControllerGetv2ScreenCoordYFn()
    {
        return  this.sy;
    },

    getv2ScreenCoord : function gameControllerGetv2ScreenCoordFn()
    {
        var md  =   this.globals.mathDevice;

        return  md.v2Build(this.sx, this.sy);
    },

    getGuiDown : function gameControllerGetMouseDownFn()
    {
        return  this.guiDown;
    },

    update : function gameControllerUpdateFn()
    {
        this.evaluateMouseOwnership();
        //this.calculateCollisionInfo();

        if (this.padMode || this.touchMode)
        {
            if (!this.globals.inputDevice.isHidden() && this.globals.inputDevice.hideMouse())
            {
                this.setCursorTexture(null);
            }
        }
        else
        {
            if (this.globals.inputDevice.showMouse())
            {
                this.setCursorTexture('textures/cursors/cursormid.png');
            }
        }

        var down0, down1;

        var mousePressed = this.mousePressed;
        var mouseLifted = this.mouseLifted;
        var mousePressed0 = this.mousePressed0;
        var mousePressed1 = this.mousePressed1;
        var mouseLifted0 = this.mouseLifted0;
        var mouseLifted1 = this.mouseLifted1;

        // We add a frame of latency to touch input so that guiButtons has time to adjust to the instant new touch position
        if (this.isTouchMode())
        {
            if (this.controlOneButton || this.controlWasd)
            {
                mousePressed = this.mousePressedPrevious;
                mouseLifted = this.mouseLiftedPrevious;

                this.mousePressedPrevious = this.mousePressed;
                this.mouseLiftedPrevious = this.mouseLifted;
            }
            else
            {
                mousePressed0 = this.mousePressed0Previous;
                mousePressed1 = this.mousePressed1Previous;
                mouseLifted0 = this.mouseLifted0Previous;
                mouseLifted1 = this.mouseLifted1Previous;

                this.mousePressed0Previous = this.mousePressed0;
                this.mousePressed1Previous = this.mousePressed1;
                this.mouseLifted0Previous = this.mouseLifted0;
                this.mouseLifted1Previous = this.mouseLifted1;
            }
        }

        if (this.controlOneButton || this.controlWasd)
        {
            down0   =   this.controllerActionA.update(mousePressed, mouseLifted, true);
        }
        else
        {
            down0   =   this.controllerActionA.update(mousePressed0, mouseLifted0, true);
            down1   =   this.controllerActionB.update(mousePressed1, mouseLifted1, true);
        }

        this.guiDown = down0;

        if (down0)
        {
            this.mousePressed   =   false;
            this.mousePressed0  =   false;
        }
        else
        {
            this.mouseLifted    =   false;
            this.mouseLifted0   =   false;
        }
        if (down1)
        {
            this.mousePressed1  =   false;
        }
        else
        {
            this.mouseLifted1   =   false;
        }


        if (!this.globals.gameManager.isPaused())
        {
            if (this.controlWasd && !this.padMode && !this.touchMode)
            {
                this.updateMovementFromKeys();
            }
            if (this.touchMode)
            {
                this.updateMovementFromTouch();
            }
        }
    },

    lockMouse : function gameControllerLockMouseFn()
    {
        debug.assert(this.inputDevice, 'Cannot lock mouse without inputDevice.');

        this.inputDevice.lockMouse();
    },

    unlockMouse : function gameControllerUnlockMouseFn()
    {
        var inputDevice = this.inputDevice;
        if (inputDevice)
        {
            inputDevice.unlockMouse();
        }
    },

    callDown : function gameControllerCallDownFn(button)
    {
        var mouseCodes  = this.inputDevice.mouseCodes;

        this.mousePressed = true;

        this.mousePressed0 = (button === mouseCodes.BUTTON_0);
        this.mousePressed1 = (button === mouseCodes.BUTTON_1);
    },

    callUp : function gameControllerCallUpFn(button)
    {
        var mouseCodes  = this.inputDevice.mouseCodes;

        this.mouseLifted = true;

        this.mouseLifted0 = (button === mouseCodes.BUTTON_0);
        this.mouseLifted1 = (button === mouseCodes.BUTTON_1);

        //this.gameManager.gameSoundManager.play('uiUp', this.v3WorldCursorLocation);
    },

    clearMousePresses : function gameControllerClearMousePressesFn()
    {
        var controllerActionA = this.controllerActionA;
        var controllerActionB = this.controllerActionB;

        controllerActionA.update(false, true, false);
        controllerActionB.update(false, true, true);
    },

    draw : function gameControllerDrawFn()
    {
        if (this.isActive() &&
            this.drawFunction)
        {
            this.drawFunction();
        }
        this.controllerActionA.draw();
        this.controllerActionB.draw();
    },

    draw2D : function gameControllerDraw2DFn()
    {
        if (this.isActive() &&
            this.draw2DFunction)
        {
            this.draw2DFunction();
        }
        this.controllerActionA.draw2D();
        this.controllerActionB.draw2D();
    },

    calculateCollisionInfo : function gameControllerCalculateCollisionInfo()
    {
        this.v3WorldCursorLocation  =   this.calculatev3WorldCursorLocation(this.v3WorldCursorLocation);
        this.collisionInfo          =   this.buildCollisionInfo(this.v3WorldCursorLocation);

        this.v3LegitimateWorldCursorLocation = this.v3WorldCursorLocation;

        this.v3LegitimateWorldCursorLocation[1] = this.v3WorldCursorLocation[1];
    },

    buildCollisionInfo : function gameControllerBuildCollisionInfoFn(v3Destination)
    {
        var globals = this.globals;
        var md  =   globals.mathDevice;
        var collisionInfo;

        var scratchPad = this.scratchPad;
        var highHeroLocation          = this.getHighHeroLocation();
        var highv3WorldCursorLocation = md.v3Copy(v3Destination, scratchPad.v3Pos);
        highv3WorldCursorLocation[1]  = highHeroLocation[1];

        collisionInfo  =   this.gameManager.getCollisionInfo(highHeroLocation, highv3WorldCursorLocation);

        //this.collisionInfo   =   this.gameManager.getollisionInfo(highHeroLocation,
        //                               this.v3WorldCursorLocation);

        if (collisionInfo)
        {
            var distanceOut           = 0.5;
            var v3Direction           = md.v3Sub(highv3WorldCursorLocation, highHeroLocation, scratchPad.v3Normal);
            var v3DirectionNormalize  = md.v3Normalize(v3Direction, v3Direction);
            var dotDirectionToNormals = md.v3Dot(v3DirectionNormalize, collisionInfo.v3Normal);

            var v3PointOut;
            if (Math.abs(dotDirectionToNormals) >= 0.0001)
            {
                //Ray back towards the origin from the wall.
                //v3PointOut              =   md.v3Sub(collisionInfo.v3Location, md.v3ScalarMul(v3DirectionNormalize, -(distanceOut / dotDirectionToNormals)));

                //Ray out from wall collision.
                //v3PointOut              = md.v3Add(collisionInfo.v3Location, md.v3ScalarMul(collisionInfo.v3Normal, distanceOut));

                //Ray parallel to collision normal.
                v3PointOut = md.getRayPlaneIntersection(md.v3Add(collisionInfo.v3Location, md.v3ScalarMul(collisionInfo.v3Normal, distanceOut)), collisionInfo.v3Normal, v3Destination, collisionInfo.v3Normal);
                //v3PointOut              = md.v3Add(v3Destination, md.v3ScalarMul(collisionInfo.v3Normal, distanceOut + ));
            }
            else
            {
                v3PointOut              =   md.v3Copy(collisionInfo.v3Location);
            }

            collisionInfo.v3PointOut    =   v3PointOut;
        }

        return  collisionInfo;
    },

    drawDebug : function gameControllerDebugDrawFn()
    {
        var globals = this.globals;
        var dd      = globals.debugDraw;
        var md      = globals.mathDevice;

        var highHeroLocation          = this.getHighHeroLocation();
        var highv3WorldCursorLocation = md.v3Copy(this.v3WorldCursorLocation);
        highv3WorldCursorLocation[1]  = highHeroLocation[1];

        if (this.heroEntity !== undefined)
        {
            if (this.collisionInfo !== undefined)
            {
                dd.drawDebugLine(highHeroLocation, this.collisionInfo.v3Location, 1.0, 0.0, 0.0);
                //dd.drawDebugPoint(collisionInfo.v3Location, 1.0, 0.0, 0.0, 1.0);
                dd.drawDebugLine(this.collisionInfo.v3Location,
                                md.v3Add(this.collisionInfo.v3Location, this.collisionInfo.v3Normal),
                                1.0, 0.0, 0.0);
                dd.drawDebugLine(this.collisionInfo.v3Location,
                                this.collisionInfo.v3PointOut,
                                1.0, 0.0, 1.0);
            }
            else
            {
                dd.drawDebugLine(highHeroLocation, highv3WorldCursorLocation, 0.0, 1.0, 0.0);
                dd.drawDebugPoint(highv3WorldCursorLocation, 0.0, 1.0, 0.0, 1.0);
            }
        }
    },

    setHero : function gameControllerSetHeroFn(heroEntity)
    {
        this.heroEntity = heroEntity;
    },

    // Splash screen mode
    setModeSplashScreen : function gameControllersetModeSplashScreenFn()
    {
        this.drawFunction   = null;
        this.draw2DFunction = null;

        this.controllerActionA.setModeSplashScreen();
        this.controllerActionB.setModeSplashScreen();

        this.mode = 'splashScreen';
    },

    setModeCutsceneScreen : function gameControllersetModeCutsceneScreenFn()
    {
        this.drawFunction   = null;
        this.draw2DFunction = null;

        this.controllerActionA.setModeCutsceneScreen();
        this.controllerActionB.setModeCutsceneScreen();

        this.mode = 'cutsceneScreen';
    },

    setModeMissionEnd : function gameControllerSetModeMissionEndFn()
    {
        this.drawFunction = null;
        this.draw2DFunction = null;

        this.controllerActionA.setModeMissionEnd();
        this.controllerActionB.setModeMissionEnd();

        this.mode = "missionEnd";
    },

    setModeInactive : function gameControllerSetModeInactiveFn()
    {
        this.drawFunction   = null;
        this.draw2DFunction = null;

        this.controllerActionA.setModeInactive();
        this.controllerActionB.setModeInactive();

        this.mode = 'inactive';
    },

    // Start screen mode
    setModeMenuScreen : function gameControllersetModeMenuScreenFn()
    {
        this.drawFunction   = null;
        this.draw2DFunction = null; //this.draw2DCursorIfNeeded;

        this.controllerActionA.setModeMenuScreen();
        this.controllerActionB.setModeMenuScreen();

        this.mode = 'menuScreen';
    },


    // Command Mode
    setModeCommand : function gameControllerSetModeCommandFn()
    {
        this.setModeInactive();
        this.mode = 'menuScreen';
    },

    getMode : function gameControllerGetModeFn()
    {
        return this.mode;
    },

    //
    //Utils.
    //
    getHeroEntity : function gameControllerGetHeroEntityFn()
    {
        return  this.heroEntity;
    },

    getv3HeroLocation : function gameControllerGetv3HeroLocationFn(dst)
    {
        var md = this.globals.mathDevice;
        if (this.heroEntity)
        {
            return md.v3Add(this.heroEntity.getv3BottomLocation(), md.v3Build(0.0, 0.1, 0.0, dst), dst);
        }
        return md.v3BuildZero(dst);
    },

    getHighHeroLocation : function gameControllerGetHighHeroLocationFn()
    {
        var md = this.globals.mathDevice;
        if (this.heroEntity)
        {
            return  this.heroEntity.getCentreLocation();
        }
        return  md.v3BuildZero();
    },

    getv3WorldLocationFromCoord : function gameControllerGetv3WorldLocationFromCoordFn(x, y, dst)
    {
        //Draw my cross there...
        var camera  =   this.globals.camera;

        var v3WorldLocation = camera.screenToWorld(x, y, 2.0, dst);
        var v3Intersection = null;

        //Draw cursor in world on plane
        if (v3WorldLocation)
        {
            var md = this.globals.mathDevice;
            var scratchPad = this.scratchPad;

            var v3PlanePos      = this.getv3HeroLocation(scratchPad.v3Pos);
            var v3PlaneNormal   = md.v3BuildYAxis(scratchPad.v3Normal);
            var v3LinePos       = md.m43Pos(camera.matrix, scratchPad.v3LinePos);
            var v3LineNormal    = md.v3Sub(v3WorldLocation, v3LinePos, scratchPad.v3LineNormal);
            v3Intersection  = md.getRayPlaneIntersection(v3PlanePos, v3PlaneNormal, v3LinePos, v3LineNormal, dst);
        }

        return v3Intersection;
    },

    calculatev3WorldCursorLocation : function gameControllerCalculatev3WorldCursorLocationFn(dst)
    {
        return  this.getv3WorldLocationFromCoord(this.sx, this.sy, dst);
    },

    getv3WorldCursorLocation : function gameControllerGetv3WorldCursorLocationFn()
    {
        return this.v3WorldCursorLocation;
    },

    getv3LegitimateWorldCursorLocation : function gameControllerGetv3LegitimateWorldCursorLocationFn()
    {
        return this.v3LegitimateWorldCursorLocation;
    },

    //
    // Key movement.
    //
    updateMovementFromKeys : function gameControllerUpdateMovementFromKeysFn()
    {
        if (!this.heroEntity)
        {
            return;
        }

        var inputDevice    = this.inputDevice;
        var keyCodes       = inputDevice.keyCodes;

        var bank = 0;
        var lift = 0;
        var boost = 0;
        if (this.pressedKeys[keyCodes.A] || this.pressedKeys[keyCodes.LEFT])
        {
            bank -= 1;
        }
        if (this.pressedKeys[keyCodes.D] || this.pressedKeys[keyCodes.RIGHT])
        {
            bank += 1;
        }
        if (this.pressedKeys[keyCodes.W] || this.pressedKeys[keyCodes.UP])
        {
            lift += 1;
        }
        if (this.pressedKeys[keyCodes.S] || this.pressedKeys[keyCodes.DOWN])
        {
            lift -= 1;
        }
        if (this.pressedKeys[keyCodes.SPACE])
        {
            boost = 1;
        }

        var ecLocomotion = this.heroEntity.getEC('ECLocomotion');

        // camera/locomotion control switches
//        if (this.pressedKeys[keyCodes.C]) {
//            this.pressedKeys[keyCodes.C] = false;
//            this.globals.gameManager.gameCamera.toggleControlScheme();
//
//            if (ecLocomotion)
//            {
//                ecLocomotion.toggleControlScheme();
//            }
//        }

        if (ecLocomotion)
        {
            ecLocomotion.setControls(bank, lift, boost);
        }
    },

    //
    // Key handling
    //

    onKeyUp : function gameControllerOnKeyUpFn(keyCode)
    {
        this.pressedKeys[keyCode] = false;

        this.touchMode = false;
        this.padMode = false;
    },

    onKeyDown : function gameControllerOnKeyDownFn(keyCode)
    {
        var globals     =   this.globals;
        var inputDevice =   this.inputDevice;
        var keyCodes    =   inputDevice.keyCodes;
        var gameManager =   globals.gameManager;

        this.touchMode = false;
        this.padMode = false;

        if (keyCode === keyCodes.P)
        {
            var gameState = gameManager.getActiveGameState();
            if (!(gameState && gameState.name === "GamestateCutScene") ||
                !gameState.isLoading())
            {
                gameManager.togglePause();
            }
        }

        if (globals.allowCheats)
        {
            if (keyCode === keyCodes.L)
            {
                globals.releaseDebugUI = !globals.releaseDebugUI;
            }

            var playState = gameManager.getPlayState();
            if (playState)
            {
                if (keyCode === keyCodes.NUMBER_0)
                {
                    playState.endFlamboyantly(0);
                }
                if (keyCode === keyCodes.NUMBER_1)
                {
                    playState.endFlamboyantly(1);
                }
                if (keyCode === keyCodes.NUMBER_2)
                {
                    playState.endFlamboyantly(2);
                }
                if (keyCode === keyCodes.NUMBER_3)
                {
                    playState.endFlamboyantly(3);
                }
            }
        }

        // if ((keyCode === keyCodes.F) ||
        //     (keyCode === keyCodes.LEFT_ALT && this.pressedKeys[keyCodes.RETURN]) ||
        //     (keyCode === keyCodes.RETURN && this.pressedKeys[keyCodes.LEFT_ALT]))
        // {
        //     this.globals.graphicsDevice.fullscreen = !this.globals.graphicsDevice.fullscreen;
        // }

        if (this.globals.enableEditor)
        {
            if (keyCode === keyCodes.RETURN)
            {
                gameManager.toggleEditor();
            }
        }

        if (this.globals.profiling)
        {
            var profilingData = globals.profilingData;

            if (keyCode === keyCodes.HOME)
            {
                if (!profilingData.performanceProfiling)
                {
                    profilingData.performanceProfiling = true;
                    profilingData.performanceProfilingCount += 1;
                    profilingData.performanceProfileName = "Game Profile " + profilingData.performanceProfilingCount;
                    console.profile(profilingData.performanceProfileName);
                }
                else
                {
                    profilingData.performanceProfiling = false;
                    console.profileEnd(profilingData.performanceProfileName);
                }
            }
        }

        this.pressedKeys[keyCode] = true;
    },

    evaluateMouseOwnership : function gameControllerEvaluateMouseOwnershipFn()
    {
        var globals      = this.globals;
        var gd           = globals.graphicsDevice;
        var md           = globals.mathDevice;

        var screenWidth  = gd.width;
        var screenHeight = gd.height;

        if (!this.capturedMouse)
        {
            return;
        }

        this.sx +=  this.dx;
        this.sy +=  this.dy;

        this.dx =   0;
        this.dy =   0;

        this.sx =   md.clamp(this.sx, 0, screenWidth);
        this.sy =   md.clamp(this.sy, 0, screenHeight);

    },

    // Mouse handling
    onMouseUp : function gameControllerOnMouseUpFn(button /*x, y*/)
    {
        this.pressedButtons[button] = false;

        this.callUp(button);

        this.touchMode = false;
        this.padMode = false;
    },

    onMouseDown : function gameControllerOnMouseDownFn(button, x, y)
    {
        var inputDevice =   this.inputDevice;

        this.pressedButtons[button] = true;

        //Uncomment for mouse locking.
        if (this.mouseLockingEnabled && !inputDevice.isLocked())
        {
            inputDevice.lockMouse();

            this.sx = x;
            this.sy = y;

            this.dx = 0;
            this.dy = 0;

            this.capturedMouse = true;
        }
        else
        {
            this.callDown(button);
        }

        // if (this.wantsToFullscreen)
        // {
        //     this.globals.graphicsDevice.fullscreen  =   true;
        // }
        // this.wantsToFullscreen  =   false;
        // if (this.wantsToMinscreen)
        // {
        //     this.globals.graphicsDevice.fullscreen  =   false;
        // }
        // this.wantsToMinscreen  =   false;

        if (this.onMouseDownCallback)
        {
            this.onMouseDownCallback();
        }

        this.touchMode = false;
        this.padMode = false;
    },

    onMouseMove : function gameControllerOnMouseMoveFn(dx, dy)
    {
        var inputDevice =   this.inputDevice;

        //Uncomment for mouse locking.
        if (this.mouseLockingEnabled && inputDevice.isLocked())
        {
            this.dx += dx;
            this.dy += dy;
        }

        this.touchMode = false;
        this.padMode = false;
    },

    onMouseLockLost : function gameControllerOnMouseLockLostFn()
    {
        this.capturedMouse = false;

        this.touchMode = false;
        this.padMode = false;
    },

    onMouseOver : function gameControllerOnMouseOverFn(x, y)
    {
        var inputDevice =   this.inputDevice;
        //Comment out for mouse locking.
        if (!this.mouseLockingEnabled)
        {
            this.sx = x;
            this.sy = y;

            if (!inputDevice.isHidden())
            {
//                inputDevice.hideMouse();
                this.capturedMouse  =   true;
            }
        }

        this.touchMode = false;
        this.padMode = false;
    },

    onMouseLeave : function gameControllerOnMouseLeaveFn()
    {
        // this.inputDevice.showMouse();
        // this.capturedMouse  =   false;
        // this.callUp();
    },

    // Touch handling

    onTouchStart : function gameControllerOnTouchStartFn(touchEvent)
    {
        var changedTouches = touchEvent.changedTouches;
        var numberOfTouches = touchEvent.touches.length;

        var gd = this.globals.graphicsDevice;
        var padBorder = this.padBorder;
        var padX = this.padX;
        var padY = this.padY;
        var padRad = this.padRadius;
        var padBoostScale = this.padBoostScale;

        if (numberOfTouches === 0)
        {
            this.padDrag = null;
            this.touchBoost = null;
            if (this.touchId !== null)
            {
                this.touchId = null;
                this.callUp(this.inputDevice.mouseCodes.BUTTON_0);
            }
        }

        var gameState = this.globals.gameManager.getActiveGameState();
        var playing = gameState && gameState.name === GamestatePlaying.prototype.name;
        var remainingTouches = [];
        var touch;
        for (var i = 0; i < changedTouches.length; i += 1)
        {
            touch = changedTouches[i];
            var id = touch.identifier;

            var dx = touch.positionX - padX - padBorder;
            var dy = touch.positionY - padY;
            if (playing && dx * dx + dy * dy < padRad * padRad)
            {
                if (this.padDrag === null)
                {
                    this.padDrag = id;
                    this.padDragStartX = this.padShift ? touch.positionX : this.padX;
                    this.padDragStartY = this.padShift ? touch.positionY : this.padY;
                    this.padDragX = 0;
                    this.padDragY = 0;
                    continue;
                }
            }

            dx = touch.positionX - (gd.width - padX * padBoostScale - padBorder);
            if (playing && dx * dx + dy * dy < padRad * padRad * padBoostScale * padBoostScale)
            {
                if (this.touchBoost === null)
                {
                    this.touchBoost = id;
                    continue;
                }
            }

            remainingTouches.push(touch);
        }

        if (remainingTouches.length === 1)
        {
            touch = remainingTouches[0];
            this.touchId = touch.identifier;

            this.sx = touch.positionX;
            this.sy = touch.positionY;

            this.capturedMouse = true;

            this.callDown(this.inputDevice.mouseCodes.BUTTON_0);

            if (this.onMouseDownCallback)
            {
                this.onMouseDownCallback();
            }
        }

        this.touchMode = true;
        this.padMode = false;
        this.touches = touchEvent.touches;
    },

    onTouchEnd : function gameControllerOnTouchEndFn(touchEvent)
    {
        var changedTouches = touchEvent.changedTouches;

        var touchId = this.touchId;
        var touch;
        if (touchId !== null)
        {
            touch = changedTouches.filter(function (touch) {return touch.identifier === touchId; })[0];
            if (touch)
            {
                this.callUp(this.inputDevice.mouseCodes.BUTTON_0);
            }
        }

        var padDrag = this.padDrag;
        if (padDrag !== null)
        {
            touch = changedTouches.filter(function (touch) { return touch.identifier === padDrag; })[0];
            if (touch)
            {
                this.padDrag = null;
            }
        }

        var touchBoost = this.touchBoost;
        if (touchBoost !== null)
        {
            touch = changedTouches.filter(function (touch) { return touch.identifier === touchBoost; })[0];
            if (touch)
            {
                this.touchBoost = null;
            }
        }

        this.touches = touchEvent.touches;
    },

    onTouchMove : function gameControllerOnTouchMoveFn(touchEvent)
    {
        var changedTouches  =   touchEvent.changedTouches;

        var touch;
        var touchId = this.touchId;
        if (touchId !== null)
        {
            touch = changedTouches.filter(function (touch) { return touch.identifier === touchId; })[0];
            if (touch)
            {
                this.sx =   touch.positionX;
                this.sy =   touch.positionY;
            }
        }

        var padDrag = this.padDrag;
        if (padDrag !== null)
        {
            touch = changedTouches.filter(function (touch) { return touch.identifier === padDrag; })[0];
            if (touch)
            {
                this.padDragX = touch.positionX;
                this.padDragY = touch.positionY;

                var dx = touch.positionX - this.padDragStartX;
                var dy = touch.positionY - this.padDragStartY;
                var dl = Math.sqrt(dx * dx + dy * dy);
                if (dl <= this.padDeadZone)
                {
                    this.padDragX = 0;
                    this.padDragY = 0;
                }
                else
                {
                    var limit = Math.pow((dl - this.padDeadZone) / (this.padRadius - this.padDeadZone), this.padExponent);
                    var strength = VMath.clamp(limit, 0, 1);
                    this.padDragX = dx * strength / dl;
                    this.padDragY = dy * strength / dl;
                }
            }
        }

        this.touches = touchEvent.touches;
    },

    updateMovementFromTouch : function gameControllerUpdateMovementFromTouch()
    {
        if (!this.heroEntity)
        {
            return;
        }

        var ecLocomotion = this.heroEntity.getEC('ECLocomotion');
        if (ecLocomotion)
        {
            var x = this.padDrag !== null ? this.padDragX : 0;
            var y = this.padDrag !== null ? -this.padDragY : 0;
            ecLocomotion.setControls(x, y, this.touchBoost !== null ? 1 : 0);
        }
    },

    onPadDown : function crashmobControllerPadDown(padCode)
    {
        this.touchMode = false;
        this.padMode = true;

        var globals     =   this.globals;
        var gameManager =   globals.gameManager;

        if (padCode === this.inputDevice.padCodes.START)
        {
            gameManager.togglePause();
        }
        else if (padCode === this.inputDevice.padCodes.A)
        {
            // emulate mouse down
            this.callDown(this.inputDevice.mouseCodes.BUTTON_0);
        }
    },

    onPadUp : function crashmobControllerPadUp(padCode)
    {
        this.touchMode = false;
        this.padMode = true;

        if (padCode === this.inputDevice.padCodes.A)
        {
            // emulate mouse up
            this.callUp(this.inputDevice.mouseCodes.BUTTON_0);
        }
    },

    onPadMove : function crashmobControllerPadMove(lX, lY, lZ, rX, rY, rZ)
    {
        if (typeof lZ !== "number")
        {
            lZ = lZ.value;
            rZ = rZ.value;
        }
        if (!this.padMode && lX == 0 && lY == 0 && lZ == 0 && rX == 0 && rY == 0 && rZ == 0)
        {
            return;
        }

        this.touchMode = false;
        this.padMode = true;

        var ingame = !this.globals.gameManager.isPaused() && this.heroEntity && this.heroEntity.getEC('ECLocomotion');
        if (ingame)
        {
            var ecLocomotion = this.heroEntity.getEC('ECLocomotion');
            ecLocomotion.setControls(lX, lY, rZ);
        }
        else
        {
            this.sx += lX * 10;
            this.sy -= lY * 10;
        }
    },

    // Set input event handlers
    addEventHandlers : function gameControllerAddEventHandlersFn()
    {
        var inputDevice =   this.inputDevice;

        inputDevice.addEventListener('keyup',         this.onKeyUpBound);
        inputDevice.addEventListener('keydown',       this.onKeyDownBound);
        inputDevice.addEventListener('mouseup',       this.onMouseUpBound);
        inputDevice.addEventListener('mousedown',     this.onMouseDownBound);
        inputDevice.addEventListener('mousemove',     this.onMouseMoveBound);
        inputDevice.addEventListener('mouselocklost', this.onMouseLockLostBound);
        inputDevice.addEventListener('mouseover',     this.onMouseOverBound);
        inputDevice.addEventListener('mouseleave',    this.onMouseLeaveBound);
        inputDevice.addEventListener('touchstart',    this.onTouchStartBound);
        inputDevice.addEventListener('touchend',      this.onTouchEndBound);
        inputDevice.addEventListener('touchmove',     this.onTouchMoveBound);
        inputDevice.addEventListener('padup',         this.onPadUpBound);
        inputDevice.addEventListener('paddown',       this.onPadDownBound);
        inputDevice.addEventListener('padmove',       this.onPadMoveBound);
    },

    removeEventHandlers : function gameControllerRemoveEventListenerFn()
    {
        var inputDevice =   this.inputDevice;

        inputDevice.removeEventListener('keyup',         this.onKeyUpBound);
        inputDevice.removeEventListener('keydown',       this.onKeyDownBound);
        inputDevice.removeEventListener('mouseup',       this.onMouseUpBound);
        inputDevice.removeEventListener('mousedown',     this.onMouseDownBound);
        inputDevice.removeEventListener('mousemove',     this.onMouseMoveBound);
        inputDevice.removeEventListener('mouselocklost', this.onMouseLockLostBound);
        inputDevice.removeEventListener('mouseover',     this.onMouseOverBound);
        inputDevice.removeEventListener('mouseleave',    this.onMouseLeaveBound);
        inputDevice.removeEventListener('touchstart',    this.onTouchStartBound);
        inputDevice.removeEventListener('touchend',      this.onTouchEndBound);
        inputDevice.removeEventListener('touchmove',     this.onTouchMoveBound);
        inputDevice.removeEventListener('padup',         this.onPadUpBound);
        inputDevice.removeEventListener('paddown',       this.onPadDownBound);
        inputDevice.removeEventListener('padmove',       this.onPadMoveBound);
    },

    loadTexture : function gameControllerLoadTextureFn(propertyName, texturePath)
    {
        var that    =   this;
        var tm      =   this.globals.textureManager;

        var onTextureLoaded =   function onTextureLoadedFn(texture)
        {
            //debug.info('texture loaded: ' + propertyName + ', ' + texturePath);
            that[propertyName]  =   texture;
        };

        tm.load(texturePath, false, onTextureLoaded);
    },

    preload : function gameControllerPreloadFn()
    {
        // General cursor texture
        this.loadTexture('cursorTexture', this.cursorTexturePath);

        // Miscellaneous
        this.loadTexture('verticalTexture', this.verticalTexturePath);
        this.loadTexture('squareTexture', this.squareTexturePath);
    },

    reset : function gameControllerResetFn()
    {
        this.pressedKeys    =   {};
    },

    setMouseLockable : function gameControllerSetMouseLockableFn(isLockable)
    {
        this.mouseLockingEnabled = isLockable;
    },

    setOnMouseDownCallback : function gameControllerSetOnMouseDownCallbackFn(onMouseDownCallback)
    {
        this.onMouseDownCallback = onMouseDownCallback;
    },

    setCursorTexture : function gameControllerSetCursorTextureFn(texturePath)
    {
        debug.log(texturePath);

        if (this.cursorTexturePath === texturePath)
        {
            return;
        }

        this.cursorTexturePath = texturePath;
        if (texturePath)
        {
            var mappingTable       = this.globals.mappingTable;
            var mappedURL          = mappingTable.getURL(texturePath);
            var cursorStyle        = ('url(' + mappedURL + '), auto');

            if (TurbulenzEngine.canvas && this.enableCustomCursors)
            {
                TurbulenzEngine.canvas.style.cursor = cursorStyle;
            }
        }
        else
        {
            if (TurbulenzEngine.canvas && this.enableCustomCursors)
            {
                TurbulenzEngine.canvas.style.cursor = null;
            }
        }
    },

    isTouchMode : function gameControllerIsTouchModeFn()
    {
        return this.touchMode;
    },

    isPadMode : function crashmobcontrollerIsPadModeFn()
    {
        return this.padMode;
    },

    getCameraPanLocation : function gameControllerGetCameraPanLocationFn()
    {
        var v3CameraPanLocation;

        if (this.isTouchMode())
        {
            debug.assert(false);
        }
        else
        {
            v3CameraPanLocation = this.getv3WorldCursorLocation();
        }

        return v3CameraPanLocation;
    }
};

GameController.create = function gameControllerCreateFn(globals, gameManager)
{
    var controller = new GameController();

    controller.globals       = globals;
    controller.sx            = 0.0;
    controller.sy            = 0.0;
    controller.dx            = 0.0;
    controller.dy            = 0.0;
    controller.touchId = null;
    controller.touches = null;
    controller.capturedMouse = false;
    controller.gameManager   = gameManager;
    controller.inputDevice   = globals.inputDevice;

    controller.pressedKeys    = {};
    controller.pressedButtons = {};

    controller.padX = -1;
    controller.padY = -1;
    controller.padShift = true;
    controller.padRadius = -1;
    controller.padBorder = -1;
    controller.padBoostScale = -1;
    controller.padExponent = -1;
    controller.padDeadZone = -1;
    controller.padDrag = null;
    controller.touchBoost = null;

    // Textures and their paths

    controller.cursorTexture              = null;
    controller.cursorTexturePath          = 'textures/cursor.png';

    controller.verticalTexture            = null;
    controller.verticalTexturePath        = 'textures/vertical.dds';

    controller.squareTexture              = null;
    controller.squareTexturePath          = 'textures/simple_square.dds';

    controller.mouseLockingEnabled        = Config.lockMouseInMenus;
    controller.enableCustomCursors        = Config.enableCustomCursors;

    controller.controllerActionA          = ControllerAction.create(globals, gameManager, controller);
    controller.controllerActionB          = ControllerAction.create(globals, gameManager, controller);

    controller.controlOneButton           = Config.controlOneButton;
    controller.controlWasd                = Config.controlWasd;
    controller.controlPad                 = Config.controlPad;

    controller.onKeyUpBound = controller.onKeyUp.bind(controller);
    controller.onKeyDownBound = controller.onKeyDown.bind(controller);

    controller.onMouseUpBound = controller.onMouseUp.bind(controller);
    controller.onMouseDownBound = controller.onMouseDown.bind(controller);
    controller.onMouseMoveBound = controller.onMouseMove.bind(controller);
    controller.onMouseLockLostBound = controller.onMouseLockLost.bind(controller);
    controller.onMouseOverBound = controller.onMouseOver.bind(controller);
    controller.onMouseLeaveBound = controller.onMouseLeave.bind(controller);

    controller.onTouchStartBound = controller.onTouchStart.bind(controller);
    controller.onTouchEndBound   = controller.onTouchEnd.bind(controller);
    controller.onTouchMoveBound  = controller.onTouchMove.bind(controller);

    controller.onPadUpBound   = controller.onPadUp.bind(controller);
    controller.onPadDownBound = controller.onPadDown.bind(controller);
    controller.onPadMoveBound = controller.onPadMove.bind(controller);

    // Game can over-ride these for actions which need to be executed directly in event callbacks e.g. go fullscreen
    controller.onMouseDownCallback = null;

    // Must be done AFTER bound event handler members have been created
    controller.setActive(true);

    var mathDevice = globals.mathDevice;
    controller.scratchPad = {
        v3Pos        : mathDevice.v3BuildZero(),
        v3Normal     : mathDevice.v3BuildZero(),
        v3LinePos    : mathDevice.v3BuildZero(),
        v3LineNormal : mathDevice.v3BuildZero()
    };

    controller.touchMode = false;
    controller.padMode = false;

    controller.mode = '';

    return controller;
};
