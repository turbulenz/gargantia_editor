//
// GuiRenderer - coordinates rendering of sprites and text.
//

/*global guiColors: false*/
/*global debug: false*/
/*global StringUtils: false*/
/*global TurbulenzEngine: false*/
/*global TWEEN: false*/

function GuiRenderer() {}

GuiRenderer.prototype =
{
    init : function guirendererInitFn(globals)
    {
        this.globals    =   globals;

        this.guiMap     =   {};

        this.calculateScaleFactor();

        var md          = globals.mathDevice;
        this.scratchPad =   {
            renderLocation : md.v2BuildZero(),
            spriteParams : {
                texture : null,
                destinationRectangle : md.v4BuildZero(),
                rotation : 0,
                color : md.v4BuildZero()
            }
        };
        this.scratchpadRectangleSizes = {};

        this.textInfoPool = [];

        this.openRefCount       = 0;

        var systemInfo         = TurbulenzEngine.getSystemInfo();
        var platformProfile    = systemInfo.platformProfile;
        this.isOnTabletOrPhone = (platformProfile === 'tablet' || platformProfile === 'smartphone');
        debug.info('Is on pc = ' + !this.isOnTabletOrPhone);
    },

    destroy : function guirendererDestroyFn()
    {
        this.guiMap            = null;
        GuiRenderer.archetypes = null;
    },

    initArchetype : function guirendererInitArchetypeFn(guiName, archetypeInfo, textureManager)
    {
        this.guiMap[guiName]   =   archetypeInfo;

        var instructions       = archetypeInfo.instructions;
        var instructionsLength = instructions.length;
        var instructionIndex;

        archetypeInfo.textInstructionMap = {};

        for (instructionIndex = 0; instructionIndex < instructionsLength; instructionIndex += 1)
        {
            this.preLoadInstruction(archetypeInfo, instructions[instructionIndex], textureManager);
        }
    },

    SAFE_WIDTH : 850,
    SAFE_HEIGHT : 650,

    preRender : function guirendererPreRenderFn()
    {
        this.calculateScaleFactor();
    },

    calculateScaleFactor : function guirendererCalculateScaleFactorFn()
    {
        var globals        = this.globals;
        var graphicsDevice = globals.graphicsDevice;
        var md             = globals.mathDevice;

        var width          = graphicsDevice.width;
        var height         = graphicsDevice.height;

        this.width  =   width;
        this.height =   height;

        var widthFactor    =   Math.floor(width * 4.0 / this.SAFE_WIDTH) / 4.0;
        var heightFactor   =   Math.floor(height * 4.0 / this.SAFE_HEIGHT) / 4.0;

        //var widthFactor    =   (width  / this.SAFE_WIDTH);
        //var heightFactor   =   (height  / this.SAFE_HEIGHT);

        this.scaleFactor    =   Math.min(widthFactor, heightFactor);
        this.scaleFactor = 1; // GOD DAMNIT!

        this.scaleFactor    =   Math.max(this.scaleFactor, 0.25);
        this.scaleFactor    =   Math.min(this.scaleFactor, 2.0);

        this.v2ScreenCentre = md.v2Build(width / 2, height / 2, this.v2ScreenCentre);
        this.v2ScreenTL     = md.v2Build(0,         0,          this.v2ScreenTL);
        this.v2ScreenTR     = md.v2Build(width,     0,          this.v2ScreenTR);
        this.v2ScreenBL     = md.v2Build(0,         height,     this.v2ScreenBL);
        this.v2ScreenBR     = md.v2Build(width,     height,     this.v2ScreenBR);

        this.v2ScreenT     = md.v2Build(width / 2,  0,          this.v2ScreenT);
        this.v2ScreenB     = md.v2Build(width / 2,  height,     this.v2ScreenB);
        this.v2ScreenL     = md.v2Build(0,          height / 2, this.v2ScreenL);
        this.v2ScreenR     = md.v2Build(width,      height / 2, this.v2ScreenR);
    },

    getScaleFactor : function guirendererGetScaleFactorFn()
    {
        return  this.scaleFactor;
    },

    getv2RenderLocation : function guirendererGetv2RenderLocationFn(x, y, locationDescription, result)
    {
        var globals             = this.globals;
        var md                  = globals.mathDevice;

        var centreToUse =   this.v2ScreenCentre;

        switch (locationDescription)
        {
        case 'centre' :
            centreToUse =   this.v2ScreenCentre;
            break;
        case 'topLeft' :
            centreToUse =   this.v2ScreenTL;
            break;
        case 'topRight' :
            centreToUse =   this.v2ScreenTR;
            break;
        case 'bottomLeft' :
            centreToUse =   this.v2ScreenBL;
            break;
        case 'bottomRight' :
            centreToUse =   this.v2ScreenBR;
            break;
        case 'top' :
            centreToUse =   this.v2ScreenT;
            break;
        case 'bottom' :
            centreToUse =   this.v2ScreenB;
            break;
        case 'left' :
            centreToUse =   this.v2ScreenL;
            break;
        case 'right' :
            centreToUse =   this.v2ScreenR;
            break;
        default :
            debug.assert(locationDescription === undefined, 'Bad Location Description: ' + locationDescription);
            break;
        }
        result = md.v2Build(x, y, result);
        return  md.v2AddScalarMul(centreToUse, result, this.scaleFactor, result);
    },

    preload : function guirendererPreLoadFn()
    {
        var textureManager = this.globals.textureManager;

        var guiArchetypes   =   GuiRenderer.archetypes;
        var guiArchetype;

        for (guiArchetype in guiArchetypes)
        {
            if (guiArchetypes.hasOwnProperty(guiArchetype))
            {
                this.initArchetype(guiArchetype, guiArchetypes[guiArchetype], textureManager);
            }
        }
    },

    getGuiInfo : function guirendererGetGuiInfoFn(guiName)
    {
        var thisGui =   this.guiMap[guiName];

        return  thisGui;
    },

    //RenderInfo
    // {
    //     scale : 1.0,
    //     scaleX : 1.0,
    //     scaleY : 1.0,
    //     v3WorldLocation :
    //     v2ScreenLocation :
    //     angle : 0.0,
    //     randomAngle : 0.0,
    //     scale1 :
    //     scale2 :
    // }

    render : function guirendererRenderFn(guiName, renderInfo)
    {
        var thisGui =   this.getGuiInfo(guiName);

        debug.assert(thisGui, 'Gui archetype not recognised: ' + guiName);

        if (!thisGui)
        {
            return;
        }

        this.renderAllInstructions(thisGui.instructions, renderInfo, thisGui);
    },

    border : 30,

    getScaleFactorFromV2 : function guirendererGetScaleFactorFromV2Fn(v2ScreenLocation, allowOffscreen)
    {
        if (!v2ScreenLocation)
        {
            return  0.0;
        }

        if (allowOffscreen)
        {
            return 1.0;
        }

        var globals        = this.globals;
        var graphicsDevice = globals.graphicsDevice;

        var width   =   graphicsDevice.width;
        var height  =   graphicsDevice.height;

        var border  =   this.border * this.getScaleFactor();

        var md      =   globals.mathDevice;
        var x       =   md.clamp(v2ScreenLocation[0], 0, width);
        var y       =   md.clamp(v2ScreenLocation[1], 0, height);

        var outputScale =   1.0;
        if (x < border)
        {
            outputScale =  Math.min(x / border, outputScale);
        }
        if (y < border)
        {
            outputScale =  Math.min(y / border, outputScale);
        }
        if (x > width - border)
        {
            outputScale *=  Math.min((width - x) / border, outputScale);
        }
        if (y > height - border)
        {
            outputScale *=  Math.min((height - y) / border, outputScale);
        }

        return  outputScale;
    },

    renderAllInstructions : function guirendererRenderAllInstructionsFn(instructions, renderInfo, guiInfo)
    {
        var instructionsLength = instructions.length;
        var instructionIndex;

        //Scale.
        renderInfo._scaleX = 1.0;
        renderInfo._scaleY = 1.0;

        if (renderInfo.scale !== undefined)
        {
            renderInfo._scaleX *= renderInfo.scale;
            renderInfo._scaleY *= renderInfo.scale;
        }

        renderInfo._scaleX *= (renderInfo.scaleX !== undefined ? renderInfo.scaleX : 1.0);
        renderInfo._scaleY *= (renderInfo.scaleY !== undefined ? renderInfo.scaleY : 1.0);

        renderInfo._scaleX *=  this.scaleFactor;
        renderInfo._scaleY *=  this.scaleFactor;

        //Location.
        var gameManager, gameCamera;
        var v2CentreLocation;
        var borderScale;
        var globals        = this.globals;
        var md             = globals.mathDevice;
        var graphicsDevice = globals.graphicsDevice;

        var width, height, border;
        if (renderInfo.v3WorldLocation)
        {
            gameManager      = this.globals.gameManager;
            gameCamera       = gameManager.getGameCamera();
            v2CentreLocation = gameCamera.getv2ScreenLocationFromWorld(renderInfo.v3WorldLocation, renderInfo.allowOffscreen);

            if (!v2CentreLocation)
            {
                return;
            }

            renderInfo._x    = v2CentreLocation[0];
            renderInfo._y    = v2CentreLocation[1];

            borderScale         = this.getScaleFactorFromV2(v2CentreLocation, renderInfo.allowOffscreen);
            if (borderScale <= 0.0)
            {
                return;
            }

            renderInfo._scaleX *= borderScale;
            renderInfo._scaleY *= borderScale;

            border  =   this.border * this.getScaleFactor();
            width   =   graphicsDevice.width;
            height  =   graphicsDevice.height;
            renderInfo._x =   md.clamp(renderInfo._x, border, width - border);
            renderInfo._y =   md.clamp(renderInfo._y, border, height - border);
        }
        else if (renderInfo.v2ScreenLocation)
        {
            renderInfo._x           =   renderInfo.v2ScreenLocation[0];
            renderInfo._y           =   renderInfo.v2ScreenLocation[1];
        }
        else
        {
            renderInfo._x           =   renderInfo.x !== undefined ? renderInfo.x : 0.0;
            renderInfo._y           =   renderInfo.y !== undefined ? renderInfo.y : 0.0;
        }

        renderInfo._alpha = 1;
        if (renderInfo.fade !== undefined)
        {
            if (guiInfo.fadeType === "scale" || !guiInfo.fadeType)
            {
                renderInfo._scaleX *=  renderInfo.fade;
                renderInfo._scaleY *=  renderInfo.fade;
            }
            else if (guiInfo.fadeType === "alpha")
            {
                renderInfo._alpha *= renderInfo.fade;
            }
        }

        //Angle.
        renderInfo._angle       =   renderInfo.angle !== undefined ? renderInfo.angle : 0.0;
        renderInfo._randomAngle =   renderInfo.randomAngle !== undefined ? renderInfo.randomAngle : 0.0;

        if (renderInfo.scale1 !== undefined)
        {
            renderInfo._scale1 = renderInfo.scale1; // * this.scaleFactor;
        }

        if (renderInfo.scale2 !== undefined)
        {
            renderInfo._scale2 = renderInfo.scale2; // * this.scaleFactor;
        }

        var appCurrentTime = this.globals.appCurrentTime;

        var gameCurrentTime =   this.globals.gameCurrentTime;
        var gameTimeStep    =   this.globals.gameTimeStep;
        if (this.shakeAmount > 0.0 && gameTimeStep > 0.0)
        {
            renderInfo._shakeSinX = Math.sin((renderInfo._x / this.width) * Math.PI * 6.0 + gameCurrentTime * 16.0);
            renderInfo._shakeSinY = Math.sin((renderInfo._y / this.height)  * Math.PI * 6.0 + gameCurrentTime * 16.0);

            this.applyShake({amount : this.shakeAmount}, renderInfo);
        }

        renderInfo._appCurrentTime = appCurrentTime;

        for (instructionIndex = 0; instructionIndex < instructionsLength; instructionIndex += 1)
        {
            this.renderInstruction(instructions[instructionIndex], renderInfo, guiInfo);
        }
    },

    applyShake : function guirendererApplyShakeFn(instructionInfo, renderInfo)
    {
        var amount  =   instructionInfo.amount || 1.0;

        amount *= this.scaleFactor;

        renderInfo._x += 5.0 * amount * renderInfo._shakeSinX;
        renderInfo._y += 5.0 * amount * renderInfo._shakeSinY;

        renderInfo._angle += 0.025 * renderInfo._shakeSinX * renderInfo._shakeSinY;
        //renderInfo._scaleX += 0.001 * sinX * sinY;
        //renderInfo._scaleY += 0.001 * sinX * sinY;
    },

    applyPulseScale : function guirendererApplyPulseScaleFn(instructionInfo, renderInfo)
    {
        var frequency = instructionInfo.frequency;
        var amplitudeDiff = (instructionInfo.amplitudeDiff * this.scaleFactor);

        var currentAppTime = renderInfo._appCurrentTime;
        var sinCurrentTime = Math.sin(currentAppTime * (Math.PI * 2 * frequency));

        renderInfo._scaleX *= (1 + (amplitudeDiff * sinCurrentTime));
        renderInfo._scaleY *= (1 + (amplitudeDiff * sinCurrentTime));
    },

    preLoadInstruction : function guirendererPreLoadInstructionFn(archetypeInfo, instructionInfo, textureManager)
    {
        var that = this;
        if (instructionInfo.texturePath)
        {
            textureManager.load(instructionInfo.texturePath, instructionInfo.textureNoMipmaps);
        }
        if (instructionInfo.command === 'setRenderLocation')
        {
            archetypeInfo.getRenderLocationFn =
            function ()
            {
                return that.getv2RenderLocation(instructionInfo.x, instructionInfo.y, instructionInfo.locationName);
            };
        }
        if (instructionInfo.text)
        {
            archetypeInfo.textInstructionMap[instructionInfo.text] = instructionInfo;
        }
    },

    renderInstruction : function guirendererRenderInstructionFn(instructionInfo, renderInfo, guiInfo)
    {
        this[instructionInfo.command](instructionInfo, renderInfo, guiInfo);
    },

    renderWidget : function guirendererRrenderWidgetFn(instructionInfo, renderInfo)
    {
        var widget = GuiRenderer.archetypes[instructionInfo.name];
        debug.assert(widget, "GuiRenderer archetypes not found " + instructionInfo.name);
        var instructionIndex;
        var instructions = widget.instructions;
        for (instructionIndex = 0; instructionIndex < instructions.length; instructionIndex += 1)
        {
            this.renderInstruction(instructions[instructionIndex], renderInfo, widget);
        }
    },

    renderQuad : function guirendererRenderQuadFn(instructionInfo, renderInfo)
    {
        var globals = this.globals;

        //Texture.
        var texture = this.getTexture(instructionInfo, renderInfo);

        var x = renderInfo._x;
        var y = renderInfo._y;

        var rawVertexArray           = this.rawVertexArray;
        var c = instructionInfo.color !== undefined ? instructionInfo.color : guiColors.white;

        rawVertexArray[0]  = x + instructionInfo.x0;
        rawVertexArray[1]  = y + instructionInfo.y0;
        rawVertexArray[2]  = x + instructionInfo.x1;
        rawVertexArray[3]  = y + instructionInfo.y1;
        rawVertexArray[4]  = x + instructionInfo.x2;
        rawVertexArray[5]  = y + instructionInfo.y2;
        rawVertexArray[6]  = x + instructionInfo.x3;
        rawVertexArray[7]  = y + instructionInfo.y3;
        rawVertexArray[8]  = c[0];
        rawVertexArray[9]  = c[1];
        rawVertexArray[10] = c[2];
        rawVertexArray[11] = c[3] * renderInfo._alpha;
        rawVertexArray[12] = 0;
        rawVertexArray[13] = 0;
        rawVertexArray[14] = 1;
        rawVertexArray[15] = 1;

        var draw2D = globals.draw2D;
        draw2D.drawRaw(
            texture,
            rawVertexArray,
            1);
    },

    renderSprite : function guirendererRenderSpriteFn(instructionInfo, renderInfo)
    {
        var globals = this.globals;

        var texture = this.getTexture(instructionInfo, renderInfo);

        if (!texture && !instructionInfo.width && !instructionInfo.height)
        {
            debug.assert(false, "no texture, and no width + height specified");
            return;
        }

        var width = instructionInfo.width || texture.width;
        var height = instructionInfo.height || texture.height;

        var scaleX = 1.0;
        var scaleY = 1.0;

        switch (instructionInfo.scaleX)
        {
        case 'scale1':
            scaleX = renderInfo._scale1;
            break;
        case 'scale2':
            scaleX = renderInfo._scale2;
            break;
        default:
            scaleX = renderInfo._scaleX;
            break;
        }

        switch (instructionInfo.scaleY)
        {
        case 'scale1':
            scaleY = renderInfo._scale1;
            break;
        case 'scale2':
            scaleY = renderInfo._scale2;
            break;
        default:
            scaleY = renderInfo._scaleY;
            break;
        }

        if (instructionInfo.scale !== undefined)
        {
            scaleX *= instructionInfo.scale;
            scaleY *= instructionInfo.scale;
        }
        if (typeof instructionInfo.scaleX === 'number')
        {
            scaleX *= instructionInfo.scaleX;
        }
        if (typeof instructionInfo.scaleY === 'number')
        {
            scaleY *= instructionInfo.scaleY;
        }

        var xOffset = 0;
        var yOffset = 0;

        if (instructionInfo.alignX !== undefined && renderInfo._scaleX)
        {
            var originalWidth = width;
            var fullWidth = (originalWidth * renderInfo._scaleX);
            var currentWidth = (fullWidth * (scaleX / this.scaleFactor));

            scaleX *= (renderInfo._scaleX / this.scaleFactor);

            if (instructionInfo.alignX === 0)
            {
                xOffset = +((currentWidth - fullWidth) * 0.5);
            }
            else if (instructionInfo.alignX === 2)
            {
                xOffset = -((currentWidth - fullWidth) * 0.5);
            }
        }

        if (instructionInfo.alignY !== undefined && renderInfo._scaleY)
        {
            var originalHeight = height;
            var fullHeight = (originalHeight * renderInfo._scaleY);
            var currentHeight = (fullHeight * (scaleY / this.scaleFactor));

            scaleY *= (renderInfo._scaleY / this.scaleFactor);

            if (instructionInfo.alignY === 0)
            {
                yOffset = -((currentHeight - fullHeight) * 0.5);
            }
            else if (instructionInfo.alignY === 2)
            {
                yOffset = +((currentHeight - fullHeight) * 0.5);
            }
        }

        var scaledWidth = width * scaleX;
        var scaledHeight = height * scaleY;

        var halfTextureWidth = scaledWidth / 2;
        var halfTextureHeight = scaledHeight / 2;

        var borderX = instructionInfo.borderX !== undefined ? instructionInfo.borderX : (instructionInfo.border !== undefined ? instructionInfo.border : 0);
        var borderY = instructionInfo.borderY !== undefined ? instructionInfo.borderY : (instructionInfo.border !== undefined ? instructionInfo.border : 0);
        halfTextureWidth += borderX;
        halfTextureHeight += borderY;

        var x = renderInfo._x + xOffset;
        var y = renderInfo._y + yOffset;

        var spriteParams = this.scratchPad.spriteParams;

        var destinationRectangle = spriteParams.destinationRectangle;
        destinationRectangle[0] = (x - halfTextureWidth);
        destinationRectangle[1] = (y - halfTextureHeight);
        destinationRectangle[2] = (x + halfTextureWidth);
        destinationRectangle[3] = (y + halfTextureHeight);

        var draw2D = globals.draw2D;

        //draw2D.begin('alpha', 'deferred');
        //
        var c = instructionInfo.color !== undefined ? instructionInfo.color : guiColors.white;
        var cn = globals.mathDevice.v4Copy(c, spriteParams.color);
        cn[3] *= renderInfo._alpha;

        if (texture && !texture.mipmaps)
        {
            draw2D.begin('alpha', 'deferred', true);
        }

        spriteParams.texture = texture;
        spriteParams.rotation = renderInfo._angle + (instructionInfo.angleOffset || 0);

        draw2D.draw(spriteParams);

        if (texture && !texture.mipmaps)
        {
            draw2D.end();
        }
    },

    getTextInfo :
    function guirendererGetTextInfoFn(instructionInfo, renderInfo)
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var lang = globals.gameManager.getLanguage();

        var pointSize       =   instructionInfo.pointSize !== undefined ? instructionInfo.pointSize : 16;
        var specialScale    =   renderInfo._scaleX;

        // If renderInfo has text defined, use that.
        var text    =   renderInfo.text;
        var font;

        if ("ja" === lang && instructionInfo.text_ja)
        {
            text = instructionInfo.text_ja;
            font = instructionInfo.font_ja || "ja";
        }
        else if (instructionInfo.text)
        {
            text    =   renderInfo[instructionInfo.text];
            if (!text)
            {
                text    =   instructionInfo.text;
            }
            font = instructionInfo.font;
        }

        if (!text)
        {
            return;
        }

        if (instructionInfo.upperCase)
        {
            text    =   text.toUpperCase();
        }

        var alignment = instructionInfo.align !== undefined ? instructionInfo.align : 1;
        var valignment = instructionInfo.valign !== undefined ? instructionInfo.valign : 1;

        var fitInfo;
        if (instructionInfo.boxWidth && instructionInfo.boxHeight)
        {
            fitInfo =
            {
                width : instructionInfo.boxWidth * specialScale,
                height : instructionInfo.boxHeight * specialScale,
                pointSize : pointSize,
                specialScale : specialScale,
                fontStyle : instructionInfo.font
            };

            text = StringUtils.prototype.fitTextToRegion(simpleFontRenderer, text, fitInfo);
        }

        var textInfo, info;
        if (0 < this.textInfoPool.length)
        {
            textInfo = this.textInfoPool.pop();
        }
        else
        {
            textInfo = {
                text : "",
                info : {
                    x : 0,
                    y : 0,
                    alignment : 0,
                    valignment : 0,
                    pointSize : 0,
                    spacing : 0,
                    specialScale : 0,
                    scaleY : 0,
                    color : globals.mathDevice.v4BuildZero(),
                    fontStyle : ""
                }
            };
        }

        textInfo.text = text;

        info = textInfo.info;
        info.x = renderInfo._x;
        info.y = renderInfo._y;
        info.alignment = alignment;
        info.valignment = valignment;
        info.pointSize = pointSize;
        info.spacing = instructionInfo.spacing || 0;
        info.specialScale = specialScale;
        info.scaleY = instructionInfo.scaleY;
        info.fontStyle = font;

        var c = instructionInfo.color !== undefined ? instructionInfo.color : guiColors.white;
        var cn = globals.mathDevice.v4Copy(c, info.color);
        cn[3] *= renderInfo._alpha;

        return textInfo;
    },

    renderText : function guirendererRenderTextFn(instructionInfo, renderInfo)
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;

        var textInfo = this.getTextInfo(instructionInfo, renderInfo);

        simpleFontRenderer.drawFont(textInfo.text, textInfo.info);

        this.textInfoPool.push(textInfo);
    },

    applyTextScale : function guirendererApplyTextScaleFn(instructionInfo, renderInfo, guiInfo)
    {
        var textInstructionInfo = guiInfo.textInstructionMap[instructionInfo.text];
        if (!textInstructionInfo)
        {
            return;
        }

        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;

        var textInfo = this.getTextInfo(textInstructionInfo, renderInfo);

        var rectangleDimensions = this.scratchpadRectangleSizes[instructionInfo.text] = simpleFontRenderer.getRectangleDimensions(textInfo.text, textInfo.info);

        if (rectangleDimensions.width > 0 && instructionInfo.textBoxWidth)
        {
            var factorX = rectangleDimensions.width / (instructionInfo.textBoxWidth * this.scaleFactor);
            if (instructionInfo.min)
            {
                factorX = Math.max(instructionInfo.min, factorX);
            }
            renderInfo._scaleX *= factorX;
        }

        if (rectangleDimensions.height > 0 && instructionInfo.textBoxHeight)
        {
            var factorY = rectangleDimensions.height / (instructionInfo.textBoxHeight * this.scaleFactor);
            if (instructionInfo.min)
            {
                factorY = Math.max(instructionInfo.min, factorY);
            }
            renderInfo._scaleY *= factorY;
        }

        this.textInfoPool.push(textInfo);
    },

    unApplyTextScale : function guirendererUnApplyTextScaleFn(instructionInfo, renderInfo /*, guiInfo*/)
    {
        var rectangleDimensions = this.scratchpadRectangleSizes[instructionInfo.text];
        if (!rectangleDimensions)
        {
            return;
        }

        if (rectangleDimensions.width > 0 && instructionInfo.textBoxWidth)
        {
            var factorX = rectangleDimensions.width / (instructionInfo.textBoxWidth * this.scaleFactor);
            if (instructionInfo.min)
            {
                factorX = Math.max(instructionInfo.min, factorX);
            }
            renderInfo._scaleX /= factorX;
        }

        if (rectangleDimensions.height > 0 && instructionInfo.textBoxHeight)
        {
            var factorY = rectangleDimensions.height / (instructionInfo.textBoxHeight * this.scaleFactor);
            if (instructionInfo.min)
            {
                factorY = Math.max(instructionInfo.min, factorY);
            }
            renderInfo._scaleY /= factorY;
        }
    },

    applyScaleIfTablet : function guirendererApplyScaleIfTabletFn(instructionInfo, renderInfo)
    {
        if (this.isOnTabletOrPhone)
        {
            renderInfo._scaleX    *=  instructionInfo.scaleX !== undefined ? instructionInfo.scaleX : instructionInfo.scale;
            renderInfo._scaleY    *=  instructionInfo.scaleY !== undefined ? instructionInfo.scaleY : instructionInfo.scale;
        }
    },

    applyScale : function guirendererApplySpinRotateFn(instructionInfo, renderInfo)
    {
        renderInfo._scaleX    *=  instructionInfo.scaleX !== undefined ? instructionInfo.scaleX : instructionInfo.scale;
        renderInfo._scaleY    *=  instructionInfo.scaleY !== undefined ? instructionInfo.scaleY : instructionInfo.scale;
    },

    applySpinRotate : function guirendererApplySpinRotateFn(instructionInfo, renderInfo)
    {
        renderInfo._angle    +=  instructionInfo.angle * renderInfo._appCurrentTime;
    },

    applyRandomRotate : function guirendererApplyRandomRotateFn(instructionInfo, renderInfo)
    {
        var randomAngle =   renderInfo._randomAngle !== undefined ? renderInfo._randomAngle : 1.0;
        var factor      =   instructionInfo.factor !== undefined ? instructionInfo.factor : 1.0;
        renderInfo._angle    +=  factor * randomAngle;
    },

    applyRotate : function guirendererApplyRotateFn(instructionInfo, renderInfo)
    {
        renderInfo._angle    +=  instructionInfo.angle;
    },

    applyCompleteRotate : function guirendererApplyCompleteRotateFn(instructionInfo, renderInfo)
    {
        renderInfo._angle    +=  renderInfo.scale1 * instructionInfo.angle;
    },

    offsetCentre : function guirendererOffsetCentreFn(instructionInfo, renderInfo)
    {
        if (instructionInfo.x)
        {
            renderInfo._x    +=  instructionInfo.x * renderInfo._scaleX;
        }

        if (instructionInfo.y)
        {
            renderInfo._y    +=  instructionInfo.y * renderInfo._scaleY;
        }
    },

    getTexture : function guirendererGetTextureFn(instructionInfo, renderInfo)
    {
        var globals = this.globals;
        var tm      = globals.textureManager;

        var texturePath;
        if (instructionInfo.texturePathVar)
        {
            texturePath = renderInfo[instructionInfo.texturePathVar];
        }
        else
        {
            texturePath = instructionInfo.texturePath;
        }
        var texture = texturePath ? tm.get(texturePath) : null;

        return texture;
    },

    renderArc : function guirendererRenderArcFn(instructionInfo, renderInfo)
    {
        var globals = this.globals;

        //Texture.
        var texture = this.getTexture(instructionInfo, renderInfo);

        var x = renderInfo._x;
        var y = renderInfo._y;

        var innerRadius = instructionInfo.innerRadius !== undefined ? instructionInfo.innerRadius : 40;
        var outerRadius = instructionInfo.outerRadius !== undefined ? instructionInfo.outerRadius : 50;

        innerRadius *= renderInfo._scaleX;
        outerRadius *= renderInfo._scaleX;

        var border = instructionInfo.border !== undefined ? instructionInfo.border : 0;

        innerRadius -= border;
        outerRadius += border;

        var steps = 64;
        if (!this.rawNormalisedPointArrayX)
        {
            var anglePerStep = Math.PI * 2.0 / steps;

            this.rawNormalisedPointArrayX = [];
            this.rawNormalisedPointArrayY = [];

            var stepLength = steps;

            for (var stepIndex = 0; stepIndex < stepLength + 1; stepIndex += 1)
            {
                this.rawNormalisedPointArrayX[stepIndex] = Math.sin(stepIndex * anglePerStep);
                this.rawNormalisedPointArrayY[stepIndex] = -Math.cos(stepIndex * anglePerStep);
            }

            this.rawVertexArray = [];
        }

        var rawVertexArray           = this.rawVertexArray;
        var rawNormalisedPointArrayX = this.rawNormalisedPointArrayX;
        var rawNormalisedPointArrayY = this.rawNormalisedPointArrayY;

        var c = instructionInfo.color !== undefined ? instructionInfo.color : guiColors.white;

        var startFactor, endFactor;
        switch (instructionInfo.arcStartFactor)
        {
        case 'scale1':
            startFactor = renderInfo._scale1;
            break;
        case 'scale2':
            startFactor = renderInfo._scale2;
            break;
        default:
            startFactor = 0;
            break;
        }

        switch (instructionInfo.arcFactor)
        {
        case 'scale1':
            endFactor = renderInfo._scale1;
            break;
        case 'scale2':
            endFactor = renderInfo._scale2;
            break;
        default:
            endFactor = 1;
            break;
        }

        if (instructionInfo.arcMin !== undefined)
        {
            startFactor = Math.max(startFactor, instructionInfo.arcMin);
            endFactor = Math.max(endFactor, instructionInfo.arcMin);
        }
        if (instructionInfo.arcMax !== undefined)
        {
            startFactor = Math.min(startFactor, instructionInfo.arcMax);
            endFactor = Math.min(endFactor, instructionInfo.arcMax);
        }
        if (instructionInfo.overrideArcMin !== undefined)
        {
            startFactor = instructionInfo.overrideArcMin;
        }
        if (instructionInfo.overrideArcMax !== undefined)
        {
            endFactor = instructionInfo.overrideArcMax;
        }

        var startStepFactor = steps * startFactor;
        var endStepFactor   = steps * endFactor;

        var startStep = Math.floor(startStepFactor);
        var endStep   = Math.ceil(endStepFactor);

        var startStepLerpFactor = startStepFactor - startStep;
        var endStepLerpFactor   = endStepFactor - (endStep - 1);

        var i = 0;
        var x0, x1, y0, y1;
        for (var arcIndex = startStep; arcIndex < endStep; arcIndex += 1)
        {
            x0 = rawNormalisedPointArrayX[(arcIndex + 0) % steps];
            x1 = rawNormalisedPointArrayX[(arcIndex + 1) % steps];

            y0 = rawNormalisedPointArrayY[(arcIndex + 0) % steps];
            y1 = rawNormalisedPointArrayY[(arcIndex + 1) % steps];

            if (arcIndex === startStep)
            {
                x0  = x0 + (startStepLerpFactor * (x1 - x0));
                y0  = y0 + (startStepLerpFactor * (y1 - y0));
            }

            if (arcIndex === endStep - 1)
            {
                x1  = x0 + (endStepLerpFactor * (x1 - x0));
                y1  = y0 + (endStepLerpFactor * (y1 - y0));
            }

            rawVertexArray[i + 0]  = x + x0 * outerRadius;
            rawVertexArray[i + 1]  = y + y0 * outerRadius;
            rawVertexArray[i + 2]  = x + x1 * outerRadius;
            rawVertexArray[i + 3]  = y + y1 * outerRadius;
            rawVertexArray[i + 4]  = x + x0 * innerRadius;
            rawVertexArray[i + 5]  = y + y0 * innerRadius;
            rawVertexArray[i + 6]  = x + x1 * innerRadius;
            rawVertexArray[i + 7]  = y + y1 * innerRadius;
            rawVertexArray[i + 8]  = c[0];
            rawVertexArray[i + 9]  = c[1];
            rawVertexArray[i + 10] = c[2];
            rawVertexArray[i + 11] = c[3];
            rawVertexArray[i + 12] = 0;
            rawVertexArray[i + 13] = 0;
            rawVertexArray[i + 14] = 1;
            rawVertexArray[i + 15] = 1;
            i += 16;
        }

        var draw2D = globals.draw2D;
        draw2D.drawRaw(
            texture,
            rawVertexArray,
            endStep - startStep);
    },

    renderDiamondArc : function guirendererRenderArcFn(instructionInfo, renderInfo)
    {
        var globals = this.globals;

        //Texture.
        var texture = this.getTexture(instructionInfo, renderInfo);

        var x = renderInfo._x;
        var y = renderInfo._y;

        var innerRadius = instructionInfo.innerRadius !== undefined ? instructionInfo.innerRadius : 40;
        var outerRadius = instructionInfo.outerRadius !== undefined ? instructionInfo.outerRadius : 50;

        innerRadius *= renderInfo._scaleX;
        outerRadius *= renderInfo._scaleX;

        var border = instructionInfo.border !== undefined ? instructionInfo.border : 0;

        innerRadius -= border;
        outerRadius += border;

        var steps = 4;
        if (!this.rawDiamondNormalisedPointArrayX)
        {
            var anglePerStep = Math.PI * 2.0 / steps;

            this.rawDiamondNormalisedPointArrayX = [];
            this.rawDiamondNormalisedPointArrayY = [];

            var stepLength = steps;

            for (var stepIndex = 0; stepIndex < stepLength + 1; stepIndex += 1)
            {
                this.rawDiamondNormalisedPointArrayX[stepIndex] = Math.sin(stepIndex * anglePerStep);
                this.rawDiamondNormalisedPointArrayY[stepIndex] = -Math.cos(stepIndex * anglePerStep);
            }

            this.rawVertexArray = [];
        }

        var rawVertexArray           = this.rawVertexArray;
        var rawDiamondNormalisedPointArrayX = this.rawDiamondNormalisedPointArrayX;
        var rawDiamondNormalisedPointArrayY = this.rawDiamondNormalisedPointArrayY;

        var c = instructionInfo.color !== undefined ? instructionInfo.color : guiColors.white;

        var startFactor, endFactor;
        switch (instructionInfo.arcStartFactor)
        {
        case 'scale1':
            startFactor = renderInfo._scale1;
            break;
        case 'scale2':
            startFactor = renderInfo._scale2;
            break;
        default:
            startFactor = 0;
            break;
        }

        switch (instructionInfo.arcFactor)
        {
        case 'scale1':
            endFactor = renderInfo._scale1;
            break;
        case 'scale2':
            endFactor = renderInfo._scale2;
            break;
        default:
            endFactor = 1;
            break;
        }

        if (instructionInfo.arcMin !== undefined)
        {
            startFactor = Math.max(startFactor, instructionInfo.arcMin);
            endFactor = Math.max(endFactor, instructionInfo.arcMin);
        }
        if (instructionInfo.arcMax !== undefined)
        {
            startFactor = Math.min(startFactor, instructionInfo.arcMax);
            endFactor = Math.min(endFactor, instructionInfo.arcMax);
        }

        var startStepFactor = steps * startFactor;
        var endStepFactor   = steps * endFactor;

        var startStep = Math.floor(startStepFactor);
        var endStep   = Math.ceil(endStepFactor);

        var startStepLerpFactor = startStepFactor - startStep;
        var endStepLerpFactor   = endStepFactor - (endStep - 1);

        var i = 0;
        var x0, x1, y0, y1;
        for (var arcIndex = startStep; arcIndex < endStep; arcIndex += 1)
        {
            x0 = rawDiamondNormalisedPointArrayX[arcIndex + 0];
            x1 = rawDiamondNormalisedPointArrayX[arcIndex + 1];

            y0 = rawDiamondNormalisedPointArrayY[arcIndex + 0];
            y1 = rawDiamondNormalisedPointArrayY[arcIndex + 1];

            if (arcIndex === startStep)
            {
                x0  = x0 + (startStepLerpFactor * (x1 - x0));
                y0  = y0 + (startStepLerpFactor * (y1 - y0));
            }

            if (arcIndex === endStep - 1)
            {
                x1  = x0 + (endStepLerpFactor * (x1 - x0));
                y1  = y0 + (endStepLerpFactor * (y1 - y0));
            }

            rawVertexArray[i + 0]  = x + x0 * outerRadius;
            rawVertexArray[i + 1]  = y + y0 * outerRadius;
            rawVertexArray[i + 2]  = x + x1 * outerRadius;
            rawVertexArray[i + 3]  = y + y1 * outerRadius;
            rawVertexArray[i + 4]  = x + x0 * innerRadius;
            rawVertexArray[i + 5]  = y + y0 * innerRadius;
            rawVertexArray[i + 6]  = x + x1 * innerRadius;
            rawVertexArray[i + 7]  = y + y1 * innerRadius;
            rawVertexArray[i + 8]  = c[0];
            rawVertexArray[i + 9]  = c[1];
            rawVertexArray[i + 10] = c[2];
            rawVertexArray[i + 11] = c[3];
            rawVertexArray[i + 12] = 0;
            rawVertexArray[i + 13] = 0;
            rawVertexArray[i + 14] = 1;
            rawVertexArray[i + 15] = 1;
            i += 16;
        }

        var draw2D = globals.draw2D;
        draw2D.drawRaw(
            texture,
            rawVertexArray,
            endStep - startStep);
    },

    setRenderLocation : function guirendererRenderLocation(instructionInfo, renderInfo)
    {
        var scratchPad  =   this.scratchPad;
        scratchPad.renderLocation   =   this.getv2RenderLocation(instructionInfo.x || 0, instructionInfo.y || 0, instructionInfo.locationName, scratchPad.renderLocation);
        if (instructionInfo.x !== undefined)
        {
            renderInfo._x    =   scratchPad.renderLocation[0];
        }
        if (instructionInfo.y !== undefined)
        {
            renderInfo._y    =   scratchPad.renderLocation[1];
        }
    },

    flush : function guirendererFlushFn()
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var draw2D             = globals.draw2D;
        draw2D.end();
        simpleFontRenderer.render();
        draw2D.begin('alpha', 'deferred');
    },

    begin : function guirendererBeginFn()
    {
        if (this.openRefCount === 0)
        {
            var globals = this.globals;
            var draw2D  = globals.draw2D;
            draw2D.begin('alpha', 'deferred');
        }
        this.openRefCount  +=  1;
    },

    end : function guirendererEndFn()
    {
        if (this.openRefCount === 1)
        {
            var globals            = this.globals;
            var simpleFontRenderer = globals.simpleFontRenderer;
            var draw2D             = globals.draw2D;
            var currentTime = TurbulenzEngine.getTime();

            draw2D.end();
            simpleFontRenderer.render();
        }
        this.openRefCount  -=  1;

        debug.assert(this.openRefCount >= 0, 'Too many GuiRenderer.end() calls.');
    },

    addShake : function guirendererAddShakeFn(amount, duration)
    {
        var that    =   this;

        TWEEN.Create({shake : amount})
        .to({shake : 0.0}, duration)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function ()
            {
                that.shakeAmount    =   Math.max(this.shake, that.shakeAmount);
            })
        .start();
    },

    clearShakeAmount : function guirendererClearShakeAmountFn()
    {
        this.shakeAmount    =   0.0;
    }
};

GuiRenderer.archetypes = {};

GuiRenderer.create = function guiRendererCreateFn(globals)
{
    var guiRenderer = new GuiRenderer();

    guiRenderer.init(globals);

    return guiRenderer;
};
