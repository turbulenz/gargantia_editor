//
//Immediate-Mode Graphical User Interfaces
//

function GuiButtons() {}

/*global guiColors: false*/

GuiButtons.prototype =
{
    init : function guiButtonsInitFn()
    {
        this.drawList         = [];
        this.drawBoxThickness = 2;
    },

    preload : function guiButtonsPreloadFn()
    {
        var globals = this.globals;
        var tm      = globals.textureManager;

        tm.load('textures/simple_square.dds');
    },

    isActive : function guiButtonsIsActiveFn(id)
    {
        return  (this.activeID === id);
    },

    isHot : function guiButtonsIsHotFn(id)
    {
        return  (this.hotID === id);
    },

    mouseWentUp : function guiButtonsMouseWentUpFn()
    {
        return   !this.controller.getGuiDown() && this.prevDown;
    },

    mouseWentDown : function guiButtonsMouseWentDownFn()
    {
        return   this.controller.getGuiDown() && !this.prevDown;
    },

    isMouseDown : function guiButtonsMouseWentDownFn()
    {
        return   this.controller.getGuiDown();
    },

    setNotActive : function guiButtonsSetNotActiveFn(id)
    {
        if (this.activeID === id)
        {
            this.activeID   =   undefined;
        }
    },

    setActive : function guiButtonsSetActiveFn(id)
    {
        this.activeID   =   id;
    },

    setHot : function guiButtonsSetHotFn(id)
    {
        this.hotID  =   id;
    },

    setNotHot : function guiButtonsSetNotHotFn(id)
    {
        if (this.hotID === id)
        {
            this.hotID  =   undefined;
        }
    },

    validateHot : function guiButtonsValidateHot(id)
    {
        if (this.hotID === id)
        {
            this.hotValidated   =   true;
        }
    },

    validateActive : function guiButtonsValidateActive(id)
    {
        if (this.activeID === id)
        {
            this.activeValidated   =   true;
        }
    },

    gobbleCursor : function guiButtonsGobbleCursorFn()
    {
        this.gobbled    =   true;
    },

    gobbleCursorInRadius : function guiButtonsGobbleCursorInRadiusFn(v2ScreenLocation, radius)
    {
        var md              =   this.globals.mathDevice;

        var v2MousePosition =   this.controller.getv2ScreenCoord();

        if (md.v2DistanceSq(v2ScreenLocation, v2MousePosition) < radius * radius)
        {
            this.gobbled    =   true;
        }
    },

    isMouseCursorFarFromRadius : function guiButtonsIsMouseCursorFarFromRadiusFn(v2ScreenLocation, radius)
    {
        var md              =   this.globals.mathDevice;

        var v2MousePosition =   this.controller.getv2ScreenCoord();

        if (md.v2DistanceSq(v2ScreenLocation, v2MousePosition) < radius * radius)
        {
            return false;
        }
        return true;
    },

    isMouseInside : function guiButtonsIsMouseInsideFn(v2ScreenLocation, width, height)
    {
        var md         =   this.globals.mathDevice;

        var padding =   0;

        var v2Diagonal =   md.v2Build(width * 0.5 + padding, height * 0.5 + padding);
        var v2TopLeft  =   md.v2Sub(v2ScreenLocation, v2Diagonal);
        var v2BotRight =   md.v2Add(v2ScreenLocation, v2Diagonal);

        var v2MousePosition =   this.controller.getv2ScreenCoord();

        if (v2TopLeft[0] > v2MousePosition[0] ||
            v2TopLeft[1] > v2MousePosition[1] ||
            v2BotRight[0] < v2MousePosition[0] ||
            v2BotRight[1] < v2MousePosition[1])
        {
            return  false;
        }

        return  true;
    },

    isMouseInsideRadius : function guiButtonsIsMouseInsideFn(v2ScreenLocation, radius)
    {
        var controller = this.controller;
        var deltaX = (controller.getv2ScreenCoordX() - v2ScreenLocation[0]);
        var deltaY = (controller.getv2ScreenCoordY() - v2ScreenLocation[1]);
        return ((deltaX * deltaX) + (deltaY * deltaY)) <= (radius * radius);
    },

    getRadialScaleFactor : function guiButtonsGetRadialScaleFactorFn(numberOfButtons)
    {
        if (numberOfButtons <= 6)
        {
            return 1.0;
        }
        return 1.5;
    },

    getRadialSize : function guiButtonsGetRadialSizeFn(radialScaleFactor)
    {
        var scaleFactor = this.globals.guiRenderer.getScaleFactor();
        var radius      = 150.0 * scaleFactor * radialScaleFactor;

        return  radius;
    },

    getRadialCentre : function guiButtonsGetRadialCentreFn(v2ScreenLocation, radialScaleFactor)
    {
        var globals        = this.globals;
        var md             = globals.mathDevice;
        var graphicsDevice = globals.graphicsDevice;

        var width          = graphicsDevice.width;
        var height         = graphicsDevice.height;

        var scaleFactor    = globals.guiRenderer.getScaleFactor();

        v2ScreenLocation[1] -= 180 * scaleFactor;

        var radius          = this.getRadialSize(radialScaleFactor);

        v2ScreenLocation[0] = md.clamp(v2ScreenLocation[0], radius * 1.5, width - radius * 1.5);
        v2ScreenLocation[1] = md.clamp(v2ScreenLocation[1], radius * 1.5, height - radius * 1.5);

        return  v2ScreenLocation;
    },

    addRadialOffset : function guiButtonsAddRadialOffsetFn(v2ScreenLocation, index, total, radialScaleFactor)
    {
        var globals              = this.globals;
        var md                   = globals.mathDevice;

        var radius               = this.getRadialSize(radialScaleFactor);

        var step                 = 0.0;
        if (total && total > 1)
        {
            step                 = Math.PI * 2.0 / total;
        }

        var indexToUse           = index ? index : 0;
        var offsetFraction       = step * indexToUse;

        var v2ScreenDirection    = md.angleToV2(- offsetFraction);
        v2ScreenDirection        = md.v2ScalarMul(v2ScreenDirection, radius, v2ScreenDirection);

        return md.v2Add(v2ScreenLocation, v2ScreenDirection);
    },

    doGuiButton : function guiButtonsDoGuiButtonFn(archetypeName, renderInfo, id, buttonParams)
    {
        var guiRenderer = this.globals.guiRenderer;
        var guiInfo     = guiRenderer.getGuiInfo(archetypeName);

        var buttonSize = guiInfo.buttonSize;

        var scaleFactor = guiRenderer.getScaleFactor();

        var scaleX   = (renderInfo.scaleX || renderInfo.scale || 1.0);
        var scaleY   = (renderInfo.scaleY || renderInfo.scale || 1.0);
        var inWidth  = buttonSize ? (buttonSize[0] * scaleFactor * scaleX) : 0;
        var inHeight = buttonSize ? (buttonSize[1] * scaleFactor * scaleY) : 0;
        var inRadius = guiInfo.buttonRadius || 0;

        var result        = false;
        var passiveResult = false;

        var md  = this.globals.mathDevice;
        var v2ScreenLocation;

        if (!buttonParams || !buttonParams.inactive)
        {
            if  (this.isActive(id))
            {
                if (this.mouseWentUp())
                {
                    this.gameManager.gameSoundManager.play('aud_guiButtonsUp');
                    {
                        result    =    true;
                    }
                    this.setNotActive(id);
                }

                passiveResult = true;
            }
            else if (this.isHot(id))
            {
                if (this.mouseWentDown())
                {
                    this.gameManager.gameSoundManager.play('aud_guiButtonsDown');
                    this.setActive(id);
                }

                passiveResult = true;
            }

            var mathDevice   = this.globals.mathDevice;
            v2ScreenLocation = (renderInfo.v2ScreenLocation || mathDevice.v2Build(renderInfo.x, renderInfo.y));

            if ((inWidth && inHeight && this.isMouseInside(v2ScreenLocation, inWidth, inHeight)) ||
                (inRadius && this.isMouseInsideRadius(v2ScreenLocation, inRadius)))
            {
                if (!this.isMouseDown())
                {
                    if (!this.isHot(id))
                    {
                        this.gameManager.gameSoundManager.play('aud_guiButtonsSelect');
                    }
                    this.setHot(id);
                }
                else
                {
                    if (this.mouseWentDown())
                    {
                        if (!this.isHot(id) && !this.isActive(id))
                        {
                            this.gameManager.gameSoundManager.play('aud_guiButtonsDown');
                        }
                        this.setHot(id);
                        this.setActive(id);
                    }
                }
            }
            else
            {
                if (this.isActive(id) || this.isHot(id))
                {
                    this.gameManager.gameSoundManager.play('aud_guiButtonsDeselect');
                }
                this.setNotHot(id);
                this.setNotActive(id);
            }

        }

        this.validateHot(id);
        this.validateActive(id);

        var guiManager  =   this.gameManager.getGuiManager();
        var drawInfo;

        renderInfo.scale = (renderInfo.scale !== undefined ? renderInfo.scale : 1.0);

        if (this.isActive(id))
        {
            renderInfo.scale -= 0.075;
        }
        else if (this.isHot(id) && !guiInfo.dontScaleOnOver)
        {
            renderInfo.scale += 0.075;
        }
        if (this.isHot(id) && guiInfo.overArchetype)
        {
            guiManager.addDrawGui(guiInfo.overArchetype, renderInfo, id + "over");
        }

        guiManager.addDrawGui(archetypeName, renderInfo, id);

        if (this.globals.debugDrawFlags.gui)
        {
            drawInfo =
            {
                id : id,
                width : inWidth,
                height : inHeight,
                v2ScreenLocation : md.v2Copy(v2ScreenLocation)
            };

            this.addDebugButtonToDraw(drawInfo);
        }

        return    (buttonParams && buttonParams.passive) ? passiveResult : result;
    },

    addDebugButtonToDraw : function guiButtonsAddDebugButtonToDrawFn(buttonInfo)
    {
        buttonInfo.drawFunction = this.debugDrawButton.bind(this);

        this.drawList.push(buttonInfo);
    },

    debugDrawButton : function guiButtonsdebugDrawButton(drawInfo)
    {
        if (this.globals.debugDrawFlags.gui)
        {
            this.drawDebugBox(drawInfo.v2ScreenLocation, drawInfo.width, drawInfo.height, guiColors.darkBack);
        }
    },

    drawDebugBox : function guiButtonsDrawDebugBoxFn(v2Location, width, height, v4Color)
    {
        var globals        = this.globals;
        var draw2D         = globals.draw2D;
        var tm             = globals.textureManager;
        var blockTexture   = tm.load('textures/simple_square.dds');
        if (!blockTexture)
        {
            return;
        }

        draw2D.begin('alpha', 'texture');

        draw2D.draw({
            texture : blockTexture,
            //sourceRectangle : [u1, v1, u2, v2],
            destinationRectangle : [v2Location[0] - width * 0.5,
                                    v2Location[1] - height * 0.5,
                                    v2Location[0] + width * 0.5,
                                    v2Location[1] + height * 0.5],
            //rotation : 0.0,
            //origin : [x, y],
            color : v4Color
        });

        draw2D.end();
    },

    draw2D : function guiButtonsDraw2DFn()
    {
        var drawListIndex;
        var drawList        = this.deadDrawList;
        var drawListLength  = drawList.length;
        var thisDrawObject;

        var globals         = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;

        if (globals.debugDrawFlags.gui)
        {
            this.debugDrawSmallScreen();
        }

        var guiRenderer     = globals.guiRenderer;
        guiRenderer.begin();

        //Draw the dead list.
        for (drawListIndex = 0; drawListIndex < drawListLength; drawListIndex += 1)
        {
            thisDrawObject  =   drawList[drawListIndex];

            thisDrawObject.drawFunction(thisDrawObject);
        }

        drawList       = this.drawList;
        drawListLength = drawList.length;

        //Draw the new list.
        for (drawListIndex = 0; drawListIndex < drawListLength; drawListIndex += 1)
        {
            thisDrawObject  =   drawList[drawListIndex];

            thisDrawObject.drawFunction(thisDrawObject);
            simpleFontRenderer.render();
        }

        guiRenderer.end();
    },

    debugDrawSmallScreen : function guiButtonsdebugDrawSmallScreenFn()
    {
        var guiRenderer =   this.globals.guiRenderer;
        var scaleFactor =   guiRenderer.getScaleFactor();
        this.drawDebugBox(guiRenderer.v2ScreenCentre, guiRenderer.SAFE_WIDTH * scaleFactor, guiRenderer.SAFE_HEIGHT * scaleFactor, guiColors.darkBack);
    },

    clearDrawList : function guiButtonsClearDrawListFn()
    {
        this.drawList.length =   0;
    },

    clearValidation : function guiButtonsClearValidationFn()
    {
        if (!this.hotValidated)
        {
            this.hotID       =   undefined;
        }
        if (!this.activeValidated)
        {
            this.activeID    =   undefined;
        }
        this.hotValidated    =   false;
        this.activeValidated =   false;

        this.prevGobbled = this.gobbled;
        this.gobbled     = false;

        this.prevDown            = this.isMouseDown();
    },

    hasCapturedInput : function guiButtonsHasCapturedInputFn()
    {
        if (this.hotID || this.activeID)
        {
            return  true;
        }
        if (this.prevGobbled)
        {
            return  true;
        }
        return  false;
    }
};

GuiButtons.create = function guiButtonsCreateFn(globals, gameManager, guiManager, controller)
{
    var guiButtons = new GuiButtons();

    guiButtons.globals     = globals;
    guiButtons.gameManager = gameManager;
    guiButtons.guiManager  = guiManager;
    guiButtons.controller  = controller;
    guiButtons.deadDrawList     = [];
    guiButtons.deadDrawList     = [];
    guiButtons.drawList         = [];
    guiButtons.drawBoxThickness = 2;
    guiButtons.drawMap     = {};
    guiButtons.drawMap     = {};
    guiButtons.prevDrawMap = {};

    return guiButtons;
};
