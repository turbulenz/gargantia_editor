//
// ControllerAction - Manages actions that can be defined by a single input.
//  All states and behaviours are currently stored in this class.
//

/*global controller: false*/
/*global guiColors: false*/

function ControllerAction() {}

ControllerAction.prototype =
{
    update : function controlleractionUpdateFn(pressed, released, gobbleByGui)
    {
        this.determineDownOrUp(pressed, released, gobbleByGui);

        this.collisionInfo  =   this.controller.collisionInfo;

        if (!this.controller.capturedMouse && !this.controller.touchMode && !this.controller.padMode)
        {
            return null;
        }

        if (this.worldDown)
        {
            if (!this.prevDown)
            {
                this.storeDownInfo();
                if (this.pressFunction)
                {
                    this.pressFunction();
                }
            }
            if (this.downFunction)
            {
                this.downFunction();
            }
        }
        else if (this.prevDown)
        {
            if (this.liftFunction)
            {
                this.liftFunction();
            }
        }
        this.prevDown   =   this.worldDown;

        return  this.guiDown;
    },

    storeDownInfo : function controlleractionStoreDownInfoFn()
    {
        var md                 = this.globals.mathDevice;
        this.downv2ScreenCoord = md.v2Copy(this.controller.getv2ScreenCoord());
        this.downTime          = this.globals.appCurrentTime;
    },

    determineDownOrUp : function controlleractionDetermineDownOrUpFn(pressed, released, gobbleByGui)
    {
        var gameManager    = this.gameManager;
        var guiButtons     = gameManager.getGuiButtons();

        this.isGuiButtonsHot    = guiButtons.hasCapturedInput() && gobbleByGui;

        //Allows better control in low frame rate.
        if (pressed)
        {
            this.worldDown = !this.isGuiButtonsHot;
            this.guiDown   = true;
        }
        else if (released)
        {
            this.worldDown = false;
            this.guiDown   = false;
        }
    },

    draw : function controlleractionDrawFn()
    {
        if (this.drawFunction)
        {
            this.drawFunction();
        }
    },

    draw2D : function controlleractionDraw2DFn()
    {
        if (this.draw2DFunction)
        {
            this.draw2DFunction();
        }
    },

    //
    // Splash screen mode
    //
    setModeSplashScreen : function controlleractionsetModeSplashScreenFn()
    {
        this.updateFunction    = null;
        this.pressFunction     = this.skipCurrentSplashScreen;
        this.downFunction      = null;
        this.drawFunction      = null;
        this.draw2DFunction    = null;
        this.liftFunction      = null;
        this.useDirection      = false;
    },

    skipCurrentSplashScreen : function controlleractionSkipCurrentSplashScreenFn()
    {
        var gameManager = this.gameManager;

        if (gameManager)
        {
            gameManager.skipCurrentSplashScreen();
        }
    },

    //
    // cut scene mode
    //
    setModeCutsceneScreen : function controlleractionsetModeCutsceneScreenFn()
    {
        this.updateFunction    = null;
        this.pressFunction     = this.skipCurrentCutsceneScreen;
        this.downFunction      = null;
        this.drawFunction      = null;
        this.draw2DFunction    = null;
        this.liftFunction      = null;
        this.useDirection      = false;
    },

    setModeMissionEnd : function controlleractionActionSetModeMissionEndFn()
    {
        this.updateFunction    = null;
        this.pressFunction     = null;
        this.downFunction      = null;
        this.drawFunction      = null;
        this.draw2DFunction    = null;
        this.liftFunction      = null;
        this.useDirection      = false;
    },

    skipCurrentCutsceneScreen : function controlleractionSkipCurrentCutsceneScreenFn()
    {
        var gameManager = this.gameManager;

        if (gameManager)
        {
            gameManager.skipCurrentCutsceneScreen();
        }
    },

    //
    // Inactive
    //

    setModeInactive : function controlleractionSetModeInactiveFn()
    {
        this.updateFunction    = null;
        this.pressFunction     = null;
        this.downFunction      = null;
        this.drawFunction      = null;
        this.draw2DFunction    = null;
        this.liftFunction      = null;
        this.useDirection      = false;
    },

    //
    // Start screen mode
    //
    setModeMenuScreen : function controlleractionsetModeMenuScreenFn()
    {
        this.updateFunction    = null;
        this.pressFunction     = null;
        this.downFunction      = null;
        this.drawFunction      = null;
        this.draw2DFunction    = null;
        this.liftFunction      = null;
        this.useDirection      = false;
    }
};

ControllerAction.create = function controllerActionCreateFn(globals, gameManager, controller)
{
    var controllerAction = new ControllerAction();

    controllerAction.globals            = globals;
    controllerAction.gameManager        = gameManager;
    controllerAction.controller         = controller;

    return controllerAction;
};
