//
// SimpleBlendStyle
//

function SimpleBlendStyle(globals)
{
    this.globals = globals;
    var gd = globals.graphicsDevice;

    // Dynamic vertexBuffer created for changing position and vertex color
    this.globalTechniqueParameters = gd.createTechniqueParameters(
        {
            worldViewProjection: null
        });
    this.localTechniqueParameters = gd.createTechniqueParameters(
        {
            diffuse: null
        });
}

SimpleBlendStyle.prototype =
{
    blendStyle :
    {
        NORMAL : 0,
        ADD : 1,
        NORMAL_NO_Z : 2,
        ADD_NO_Z : 3,
        INVERT : 4,
        ADD_MOD : 5,
        ADD_MOD_NO_Z : 6,
        BACKBUFFER : 7,
        BACKBUFFER_NO_Z : 8,
        TEST : 9
    },

    blendData :
    [
        {techniqueName : 'blend_particle'},
        {techniqueName : 'add_particle'},
        {techniqueName : 'blend_particle_no_z'},
        {techniqueName : 'add_particle_no_z'},
        {techniqueName : 'invfilter_particle'},
        {techniqueName : 'add_particle_mod_colour'},
        {techniqueName : 'add_particle_mod_colour_no_z'},
        {techniqueName : 'add_particle',        renderTargetName : 'renderTarget'},
        {techniqueName : 'add_particle_no_z',   renderTargetName : 'renderTarget'},
        {techniqueName : 'test_particle'}
    ],

    prime : function SimpleBlendStylePrimeFn(gd, camera)
    {
        this.globalTechniqueParameters.worldViewProjection = camera.viewProjectionMatrix;

        this.currentBlendStyle       = undefined;
        this.currentTexturePath      = undefined;
        this.currentTechniqueName    = undefined;
        this.currentRenderTargetName = undefined;

        this.primedRenderTarget = gd.activeRenderTarget;
    },

    isNewStyleOrTexture : function IsNewStyleOrTextureFn(blendStyle, texture)
    {
        return (blendStyle !== this.currentBlendStyle || texture !== this.currentTexturePath);
    },

    setStyleAndTexture : function simpleBlendStyleSetStyleAndTextureFn(tm, sm, gd, gpfx, blendStyle, texturePath)
    {
        if (this.isNewStyleOrTexture(blendStyle, texturePath))
        {
            //var previousBlendData = this.blendData[this.currentBlendStyle];
            var currentBlendData  = this.blendData[blendStyle];

            this.setRenderTarget(gd, gpfx, currentBlendData.renderTargetName);
            this.setTechnique(gd, sm, currentBlendData.techniqueName);
            this.setTexture(gd, tm, texturePath);

            this.currentBlendStyle    =   blendStyle;
        }
    },

    end : function simpleblendstyleEndFn(gd)
    {
        if (this.currentRenderTargetName)
        {
            gd.endRenderTarget();

            if (this.primedRenderTarget)
            {
                gd.beginRenderTarget(this.primedRenderTarget);
            }
        }
    },

    setRenderTarget : function simpleblendstyleSetRenderTargetFn(gd, gpfx, renderTargetName)
    {
        if (renderTargetName === this.currentRenderTargetName)
        {
            return;
        }

        //End last one.
        var activeRenderTarget = gd.activeRenderTarget;
        if (activeRenderTarget)
        {
            gd.endRenderTarget();
        }

        //Begin new one.
        gd.beginRenderTarget(gpfx.getRenderTarget(renderTargetName));   //N.B. renderTargetName does nothing, but may in the future.

        this.currentRenderTargetName = renderTargetName;
    },

    setTechnique : function simpleblendstyleSetTechniqueFn(gd, sm, techniqueName)
    {
        if (techniqueName === this.currentTechniqueName)
        {
            return;
        }

        var shader  = sm.load("shaders/simplesprite.cgfx");
        var technique   = shader.getTechnique(techniqueName);

        if (!technique)
        {
            return;
        }

        this.currentTechniqueName = techniqueName;

        gd.setTechnique(technique);
        gd.setTechniqueParameters(this.globalTechniqueParameters);
    },

    setTexture : function simpleblendstyleSetTextureFn(gd, tm, texturePath)
    {
        var textureThatIveLoaded = tm.load(texturePath);
        this.localTechniqueParameters.diffuse = textureThatIveLoaded;
        gd.setTechniqueParameters(this.localTechniqueParameters);

        this.currentTexturePath       =   texturePath;
    },

    preload : function simplespritPreloadFn()
    {
        this.globals.shaderManager.load("shaders/simplesprite.cgfx");
    }
};

SimpleBlendStyle.create = function simpleblendstyleCreateFn(globals)
{
    return new SimpleBlendStyle(globals);
};
