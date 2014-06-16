//
//  SimpleFonts
//  ===========
//
//  Helper class allowing you to render fonts, these will be batched rendered later on.
//
/*global debug: false*/

function SimpleFontRenderer() {}

SimpleFontRenderer.prototype =
{
    numberToCommaString : function simpleFontRendererNumberToCommaStringFn(number)
    {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    drawFontDouble : function simpleFontRendererDrawDoubleFontFn(string, inputParams)
    {
        var scratchPad = this.scratchPad;

        var pcolor = inputParams.color;
        var pr = inputParams.r;
        var pg = inputParams.g;
        var pb = inputParams.b;
        var pa = inputParams.a;

        inputParams.x += 1.0;
        inputParams.y += 1.0;

        inputParams.color   =   scratchPad.v4Black;

        if (string === undefined)
        {
            this.drawFont("Error: String is undefined", inputParams);
        }
        else
        {
            this.drawFont(string, inputParams);
        }

        inputParams.color   =   pcolor;
        inputParams.r = pr;
        inputParams.g = pg;
        inputParams.b = pb;
        inputParams.a = pa;

        inputParams.x -= 1.0;
        inputParams.y -= 1.0;

        if (string === undefined)
        {
            this.drawFont("Error: String is undefined", inputParams);
        }
        else
        {
            this.drawFont(string, inputParams);
        }
    },

    drawFont : function simpleFontRendererDrawFontFn(string, inputParams)
    {
        //Add some stuff to my list.
        var globals   = this.globals;
        var md        = globals.mathDevice;
        var params    = this.allocateParams();
        params.string = string;

        params.spacing    = (inputParams.spacing !== undefined) ? inputParams.spacing : 0;
        params.alignment  = (inputParams.alignment !== undefined) ? inputParams.alignment: 0;
        params.valignment = (inputParams.valignment !== undefined) ? inputParams.valignment: 1;

        if (inputParams.color !== undefined)
        {
            md.v4Copy(inputParams.color, params.color);
        }
        else
        {
            params.color[0]   =   (inputParams.r !== undefined) ? inputParams.r : 1.0;
            params.color[1]   =   (inputParams.g !== undefined) ? inputParams.g : 1.0;
            params.color[2]   =   (inputParams.b !== undefined) ? inputParams.b : 1.0;
            params.color[3]   =   (inputParams.a !== undefined) ? inputParams.a : 1.0;
        }

        this.calculateFontAndScaleFromInputParams(inputParams, params);

        if (!params.font)
        {
            return;
        }

        if (inputParams.rect === undefined)
        {
            this.calculateRectFromInputParams(params.font, params.string, params.scale, params.spacing, inputParams.x, inputParams.y, params.alignment, params.valignment, params.rect);
        }
        else
        {
            md.v4Copy(inputParams.rect, params.rect);
        }

        this.textToDraw.push(params);
    },

    getRectangleDimensions : function simplefontsGetRectangleWidthAndHeightFn(string, inputParams)
    {
        var params    = this.allocateParams();
        params.string = string;

        params.spacing    = (inputParams.spacing !== undefined) ? inputParams.spacing : 0;
        params.alignment  = (inputParams.alignment !== undefined) ? inputParams.alignment: 0;
        params.valignment = (inputParams.valignment !== undefined) ? inputParams.valignment: 1;

        this.calculateFontAndScaleFromInputParams(inputParams, params);

        if (!params.font)
        {
            return;
        }

        return params.font.calculateTextDimensions(params.string, params.scale, params.spacing);
    },

    calculateRectFromInputParams : function simplefontsCalculateRectFromInputParamsFn(font, string, scale, spacing, x, y, align, valign, rect)
    {
        var textDimensions = font.calculateTextDimensions(string, scale, spacing);

        // width: width,
        // height: height,
        // numGlyphs: numGlyphs,
        // linesWidth: linesWidth

        if (align === 0)
        {
            //Left edge should be on location
            rect[0] =   x;
            rect[2] =   textDimensions.width;
        }
        else if (align === 2)
        {
            //Right edge should be on location
            rect[0] =   x   -   textDimensions.width;
            rect[2] =   textDimensions.width;
        }
        else
        {
            //Mid x should be on location.
            rect[0] =   x   -   textDimensions.width * 0.5;
            rect[2] =   textDimensions.width;
        }

        if (valign === 0)
        {
            //Top edge should be on location.
            rect[1] =   y;
            rect[3] =   textDimensions.height;
        }
        else if (valign === 2)
        {
            rect[1] =   y   -   textDimensions.height;
            rect[3] =   textDimensions.height;
        }
        else
        {
            rect[1] =   y   -   textDimensions.height * 0.5;
            rect[3] =   textDimensions.height;
        }
        return  rect;
    },

    calculateScaleFromInputParams : function calculateScaleFromInputParamsFn(inputParams)
    {
        var scale = 1.0;

        if (inputParams.specialScale !== undefined)
        {
            scale    *=  inputParams.specialScale;
        }

        return scale;
    },

    isStandardPointSize : function simplefontsIsStandardPointSizeFn(pointSize)
    {
        switch (pointSize)
        {
        case 8 :
            return true;
        case 16 :
            return true;
        case 32 :
            return true;
        case 64 :
            return true;
        case 128 :
            return true;
        default :
            break;
        }
        return  false;
    },

    getFontFromPointSize : function getFontFromPointSizeFn(pointSize, fontType)
    {
        var font;

        if (!fontType || fontType === 'regular')
        {
            switch (pointSize)
            {
            case 8 :
                font =   this.fontRegular8;
                break;
            case 16 :
                font =   this.fontRegular16;
                break;
            case 32 :
                font =   this.fontRegular32;
                break;
            case 64 :
                font =   this.fontRegular64;
                break;
            case 128 :
                font =   this.fontRegular128;
                break;
            default :
                font =   this.fontRegular16;
                break;
            }
            return  font;
        }

        if (fontType === 'bold')
        {
            switch (pointSize)
            {
            case 8 :
                font =   this.fontBold8;
                break;
            case 16 :
                font =   this.fontBold16;
                break;
            case 32 :
                font =   this.fontBold32;
                break;
            case 64 :
                font =   this.fontBold64;
                break;
            case 128 :
                font =   this.fontBold128;
                break;
            default :
                font =   this.fontBold16;
                break;
            }
            return  font;
        }

        if (fontType === 'styled')
        {
            switch (pointSize)
            {
            case 8 :
                font =   this.fontBold8;
                break;
            case 16 :
                font =   this.fontB16;
                break;
            case 32 :
                font =   this.fontB32;
                break;
            case 64 :
                font =   this.fontB64;
                break;
            case 128 :
                font =   this.fontB128;
                break;
            default :
                font =   this.fontB16;
                break;
            }
            return  font;
        }

        return this.fontRegular16;
    },

    calculateFontAndScaleFromInputParams : function simplefontsCalculateFontAndScaleFromInputParamsFn(inputParams, outputParams)
    {
        var scale     = this.calculateScaleFromInputParams(inputParams);
        var pointSize = 16;

        if (inputParams.pointSize !== undefined)
        {
            pointSize = inputParams.pointSize;
        }

        outputParams.useFont8 = false;

        if (scale !== 1.0 || !this.isStandardPointSize(pointSize))
        {
            var sizeProduct       = scale * pointSize;
            var powerOf2          = Math.log(sizeProduct) / Math.LN2;
            pointSize             = Math.pow(2, Math.round(powerOf2));

            pointSize             = Math.max(pointSize, 8);
            pointSize             = Math.min(pointSize, 128);

            scale                 = sizeProduct / pointSize;
            inputParams.pointSize = pointSize;
        }

        outputParams.scale  =   scale;
        outputParams.font   =   this.getFontFromPointSize(pointSize, inputParams.fontStyle);
    },

    preload : function simplefontsPreloadFn()
    {
        //Relies on shader and font manager having their path remapping done.

        this.globals.fontManager.load('fonts/opensans-8.fnt');  //regular
        this.globals.fontManager.load('fonts/opensans-16.fnt');
        this.globals.fontManager.load('fonts/opensans-32.fnt');
        this.globals.fontManager.load('fonts/opensans-64.fnt');

        this.globals.shaderManager.load('shaders/font.cgfx');
    },

    hasLoaded : function simpleFontRendererHasLoadedFn()
    {
        var globals = this.globals;
        var fontManager = globals.fontManager;
        var shaderManager = globals.shaderManager;
        var md = globals.mathDevice;
        var gd = globals.graphicsDevice;

        if (fontManager.getNumPendingFonts() === 0 &&
            shaderManager.getNumPendingShaders() === 0)
        {
            if (!this.technique2D)
            {
                //var devices = this.devices;

                this.fontRegular8 = fontManager.load('fonts/opensans-8.fnt');
                this.fontRegular16 = fontManager.load('fonts/opensans-16.fnt');
                this.fontRegular32 = fontManager.load('fonts/opensans-32.fnt');
                this.fontRegular64 = fontManager.load('fonts/opensans-64.fnt');

                this.fontBold8 = fontManager.load('fonts/opensans-8.fnt');
                this.fontBold16 = fontManager.load('fonts/opensans-16.fnt');
                this.fontBold32 = fontManager.load('fonts/opensans-32.fnt');
                this.fontBold64 = fontManager.load('fonts/opensans-64.fnt');

                this.fontB8 = fontManager.load('fonts/opensans-8.fnt');
                this.fontB16 = fontManager.load('fonts/opensans-16.fnt');
                this.fontB32 = fontManager.load('fonts/opensans-32.fnt');
                this.fontB64 = fontManager.load('fonts/opensans-64.fnt');

                var shader = shaderManager.get('shaders/font.cgfx');
                this.technique2D = shader.getTechnique('font');
                this.technique2D8 = shader.getTechnique('font8');
                this.sharedTechnique2Dparameters = gd.createTechniqueParameters({
                    clipSpace: md.v4BuildZero(),
                    alphaRef: 0.01
                });
                this.technique2Dparameters = gd.createTechniqueParameters({
                    color: null
                });
                this.dummyColor = md.v4Build(-1, -1, -1, -1);

                debug.assert(this.technique2D8);
            }

            return true;
        }

        return false;
    },

    render : function simpleFontRendererRenderFn()
    {
        if (!this.hasLoaded())
        {
            return;
        }

        if (this.textToDraw.length === 0)
        {
            return;
        }

        var md = this.globals.mathDevice;
        var gd = this.globals.graphicsDevice;

        var width = gd.width;
        var height = gd.height;

        var sharedTechnique2Dparameters = this.sharedTechnique2Dparameters;
        var technique2Dparameters = this.technique2Dparameters;
        var technique2D = this.technique2D;
        var technique2D8 = this.technique2D8;
        var dummyColor = this.dummyColor;

        sharedTechnique2Dparameters.clipSpace = md.v4Build(2.0 / width, -2.0 / height, -1.0, 1.0,
                                                           sharedTechnique2Dparameters.clipSpace);

        gd.setTechnique(technique2D);
        gd.setTechniqueParameters(sharedTechnique2Dparameters);
        var usingFont8 = false;
        var lastColor = dummyColor;

        var currentText;
        var currentTextIndex  = 0;
        var useFont8;
        var currentColor;
        var textToDraw        = this.textToDraw;
        var textToDrawLength  = this.textToDraw.length;
        for (currentTextIndex = 0; currentTextIndex < textToDrawLength; currentTextIndex += 1)
        {
            currentText = textToDraw[currentTextIndex];
            if (!currentText.font)
            {
                continue;
            }

            // Nasty dynamic switching of techniques for now ... only
            // going to happen once ot twice per frame

            useFont8 = currentText.useFont8;
            if (useFont8)
            {
                if (!usingFont8)
                {
                    gd.setTechnique(technique2D8);
                    gd.setTechniqueParameters(sharedTechnique2Dparameters);
                    usingFont8 = true;
                    lastColor = dummyColor;
                }
            }
            else
            {
                if (usingFont8)
                {
                    gd.setTechnique(technique2D);
                    gd.setTechniqueParameters(sharedTechnique2Dparameters);
                    usingFont8 = false;
                    lastColor = dummyColor;
                }
            }

            currentColor = currentText.color;
            if (lastColor[0] !== currentColor[0] ||
                lastColor[1] !== currentColor[1] ||
                lastColor[2] !== currentColor[2] ||
                lastColor[3] !== currentColor[3])
            {
                lastColor = currentColor;
                technique2Dparameters.color = currentColor;
                gd.setTechniqueParameters(technique2Dparameters);
            }

            currentText.font.drawTextRect(currentText.string, currentText);
        }

        this.clearFontList();
    },

    clearFontList : function simplefontsClearFontListFn()
    {
        //Clear!
        this.textCacheIndex = 0;
        this.textToDraw.length  =   0;
    },

    allocateParams : function simplefontsAllocateParamsFn()
    {
        var params = this.textCache[this.textCacheIndex];
        if (!params)
        {
            var md = this.globals.mathDevice;
            params =
            {
                string : null,
                spacing : 0,
                alignment : 0,
                valignment : 0,
                color : md.v4BuildOne(),
                font : null,
                pointSize : undefined,
                scale : 0,
                rect : md.v4BuildOne()
            };
            this.textCache.push(params);
        }
        params.pointSize = undefined;
        this.textCacheIndex += 1;

        return params;
    }
};

SimpleFontRenderer.create = function simpleFontRendererCreateFn(globals)
{
    var simpleFontRenderer = new SimpleFontRenderer();

    simpleFontRenderer.globals = globals;

    simpleFontRenderer.textToDraw = [];
    simpleFontRenderer.textCache = [];
    simpleFontRenderer.textCacheIndex = 0;

    simpleFontRenderer.scratchPad = {
        v4Black : globals.mathDevice.v4Build(0.0, 0.0, 0.0, 1.0)
    };

    return simpleFontRenderer;
};
