/*global Light: false*/

function GameLighting() {}

GameLighting.prototype =
{
    blendRate : 0.05,

    init : function gameLightingInitFn(globals, gameManager)
    {
        this.globals        =   globals;
        this.gameManager    =   gameManager;

        var md  =   globals.mathDevice;

        this.v3AmbientCurrent               = md.v3BuildZero();
        this.v3AmbientDesired               = md.v3Build(0.25, 0.25, 0.25);

        this.v3WorldLight1Current           = md.v3BuildZero();
        this.worldLight1PitchCurrent        = Math.PI * 0.5;
        this.worldLight1YawCurrent          = 0;

        this.v3WorldLight1Desired           = md.v3Build(0.25, 0.25, 0.25);
        this.worldLight1PitchDesired        = -Math.PI * 0.25;
        this.worldLight1YawDesired          = 0;

        this.fogColor = md.v3Build(0.95, 0.95, 1.05);
        this.skyColor = md.v3Build(0.0, 0.584, 0.858);

        this.foregroundAlbedoScale = md.v3Build(1.0, 0.7, 0.6);

        this.worldLight1ShadowStrengthCurrent = 0.5;
        this.worldLight1ShadowStrengthDesired = 0.5;
        this.blendFactor                    = 0.0;
        this.scratchpad                     = {};

        this.lightingGroup = null;

        this.initializeGlobalLights();
        this.applyToGlobalLights();

        this.initUI();
    },

    initUI : function gameLightingInitUIFn()
    {
        var globals         =   this.globals;
        var ui              =   globals.dynamicUI;
        if (!ui)
        {
            return;
        }

        if (!this.lightingGroup)
        {
            var lightingGroup   =   ui.addGroup("Lighting", globals.uiGroups.graphics, function () {}, {collapsable: true});

            var keyframe;
            var keyframeGroup;
            var keyframeName = 'normal';
            var keyframes = GameLighting.keyframes;
            keyframe = keyframes[keyframeName];
            this.addAmbientLightSliders(keyframe, ui.addGroup('Ambient', lightingGroup));
            this.addDirectionLightSliders(keyframe, "worldLight1", ui.addGroup('Directional', lightingGroup), true);
            this.addFogSliders(keyframe, "fogColor", ui.addGroup('Fog', lightingGroup));
            this.addSkySliders(keyframe, "skyColor", ui.addGroup('Sky', lightingGroup));

            this.lightingGroup = lightingGroup;
        }
    },

    setKeyFrames : function gamelightingSetKeyFramesFn(blendFactor, lowerKeyframe, upperKeyframe)
    {
        this.blendFactor   = blendFactor;
        this.lowerKeyframe = GameLighting.keyframes[lowerKeyframe];
        this.upperKeyframe = GameLighting.keyframes[upperKeyframe];
    },

    snap : function gamelightingSnapFn()
    {
        this.shouldSnap = true;
    },

    addAmbientLightSliders : function  gameLightingAddAmbientLightSlidersFn(settingObject, group)
    {
        this.addColourSliders(settingObject.ambient, 'ambient', group);
    },

    addDirectionLightSliders : function  gameLightingAddDirectionLightSlidersFn(settingObject, name, group, shadows)
    {
        this.addColourSliders(settingObject[name], name, group);
        if (shadows)
        {
            this.addShadowSliders(settingObject[name], name, group);
        }
        this.addAngleSliders(settingObject[name], name, group);
    },

    addAngleSliders : function gameLightingAddAngleSliders(settingObject, name, lightingGroup)
    {
        var globals         =   this.globals;
        var ui              =   globals.dynamicUI;

        var angleBound =
        {
            min : -3.14, // -Math.PI,
            max : 3.14, // Math.PI,
            step : 0.02
        };

        ui.watchVariable('Pitch', settingObject, 'pitch', 'slider', lightingGroup, angleBound);
        ui.watchVariable('Yaw', settingObject, 'yaw', 'slider', lightingGroup, angleBound);
    },

    addShadowSliders : function gameLightingAddShadowSliders(settingObject, name, lightingGroup)
    {
        var globals         =   this.globals;
        var ui              =   globals.dynamicUI;

        var oneBound =
        {
            min : 0,
            max : 1.0,
            step : 0.05
        };

        ui.watchVariable('Shadow Strength', settingObject, 'shadowStrength', 'slider', lightingGroup, oneBound);
    },

    addColourSliders : function gameLightingAddColorSliders(settingObject, name, group)
    {
        var globals         =   this.globals;
        var ui              =   globals.dynamicUI;

        var intensityBound =
        {
            min : 0.0,
            max : 2.0,
            step : 0.05
        };

        ui.addColorPicker('Color', function () {
            return [settingObject.r / 255, settingObject.g / 255, settingObject.b / 255];
        }, function (value) {
            settingObject.r = value[0] * 255;
            settingObject.g = value[1] * 255;
            settingObject.b = value[2] * 255;
        }, group);
        ui.watchVariable('Intensity',   settingObject, 'intensity', 'slider', group, intensityBound);
    },

    addFogSliders : function  gameLightingFogSlidersFn(settingObject, name, group)
    {
        this.addColourSliders(settingObject[name], name, group);
    },

    addSkySliders : function  gameLightingSkySlidersFn(settingObject, name, group)
    {
        this.addColourSliders(settingObject[name], name, group);
    },

    addForegroundAlbedoScaleSliders : function  gameLightingAddForegroundAlbedoScaleSliderssFn(settingObject, name, group)
    {
        var globals = this.globals;
        var ui = globals.dynamicUI;

        var bound =
        {
            min : 0.0,
            max : 1.0,
            step : 0.01
        };

        ui.watchVariable(name + ' 0', settingObject[name], '0', 'slider', group, bound);
        ui.watchVariable(name + ' 1', settingObject[name], '1', 'slider', group, bound);
        ui.watchVariable(name + ' 2', settingObject[name], '2', 'slider', group, bound);
    },

    updateDesiredSetting : function gameLightingUpdateDesiredSetting()
    {
        var desiredSetting  =   this.getDesiredSetting();

        this.setTargetSetting(desiredSetting);
    },

    tendCurrentValues : function gameLightingTendCurrentValues()
    {
        var md          = this.globals.mathDevice;
        var blendFactor = this.shouldSnap ? 1.0 : 0.05;
        this.shouldSnap = false;

        this.v3AmbientCurrent                 = md.v3Lerp(this.v3AmbientCurrent, this.v3AmbientDesired,  blendFactor, this.v3AmbientCurrent);

        this.v3WorldLight1Current             = md.v3Lerp(this.v3WorldLight1Current, this.v3WorldLight1Desired, blendFactor, this.v3WorldLight1Current);
        this.worldLight1PitchCurrent          = md.lerpAngle(this.worldLight1PitchCurrent, this.worldLight1PitchDesired, blendFactor);
        this.worldLight1YawCurrent            = md.lerpAngle(this.worldLight1YawCurrent, this.worldLight1YawDesired, blendFactor);
        this.worldLight1ShadowStrengthCurrent = md.lerp(this.worldLight1ShadowStrengthCurrent, this.worldLight1ShadowStrengthDesired, blendFactor);

    },

    getBlendedSetting : function gameLightGetBlendedSetting(settingA, settingB, lerpValue, dst)
    {
        if (!dst)
        {
            dst =   { ambient : {}, worldLight1 : {}, fogColor : {}, skyColor : {}};
        }

        this.getBlendedSettingLocation(settingA, settingB, lerpValue, dst);
        this.getBlendedSettingColour(settingA, settingB, lerpValue, dst);

        dst.foregroundAlbedoScale = settingA.foregroundAlbedoScale;

        return  dst;
    },

    getBlendedSettingLocation : function gameLightGetBlendedSettingLocation(settingA, settingB, lerpValue, dst)
    {
        var md  =   this.globals.mathDevice;
        if (!dst)
        {
            dst =   {ambient : {}, worldLight1 : {}, fogColor : {}, skyColor : {}};
        }
        dst.worldLight1.pitch =   md.lerp(settingA.worldLight1.pitch, settingB.worldLight1.pitch, lerpValue);
        dst.worldLight1.yaw   =   md.lerp(settingA.worldLight1.yaw, settingB.worldLight1.yaw, lerpValue);

        return  dst;
    },

    getBlendedSettingColour : function gameLightGetBlendedSettingColour(settingA, settingB, lerpValue, dst)
    {
        var md  =   this.globals.mathDevice;
        if (!dst)
        {
            dst =   {ambient : {}, worldLight1 : {}, fogColor : {}, skyColor : {}};
        }

        var lightA, lightB;

        lightA = settingA.ambient;
        lightB = settingB.ambient;

        dst.ambient.r             =   md.lerp(lightA.r * lightA.intensity, lightB.r * lightB.intensity, lerpValue);
        dst.ambient.g             =   md.lerp(lightA.g * lightA.intensity, lightB.g * lightB.intensity, lerpValue);
        dst.ambient.b             =   md.lerp(lightA.b * lightA.intensity, lightB.b * lightB.intensity, lerpValue);
        dst.ambient.intensity     =   1;

        lightA = settingA.worldLight1;
        lightB = settingB.worldLight1;

        dst.worldLight1.r             =   md.lerp(lightA.r * lightA.intensity, lightB.r * lightB.intensity, lerpValue);
        dst.worldLight1.g             =   md.lerp(lightA.g * lightA.intensity, lightB.g * lightB.intensity, lerpValue);
        dst.worldLight1.b             =   md.lerp(lightA.b * lightA.intensity, lightB.b * lightB.intensity, lerpValue);
        dst.worldLight1.intensity     =   1;

        dst.worldLight1.shadowStrength = md.lerp(lightA.shadowStrength, lightB.shadowStrength, lerpValue);

        var fogColorA = settingA.fogColor;
        var fogColorB = settingB.fogColor;

        dst.fogColor.r             =   md.lerp(fogColorA.r * fogColorA.intensity, fogColorB.r * fogColorB.intensity, lerpValue);
        dst.fogColor.g             =   md.lerp(fogColorA.g * fogColorA.intensity, fogColorB.g * fogColorB.intensity, lerpValue);
        dst.fogColor.b             =   md.lerp(fogColorA.b * fogColorA.intensity, fogColorB.b * fogColorB.intensity, lerpValue);
        dst.fogColor.intensity     =   1;

        var skyColorA = settingA.skyColor;
        var skyColorB = settingB.skyColor;

        dst.skyColor.r             =   md.lerp(skyColorA.r * skyColorA.intensity, skyColorB.r * skyColorB.intensity, lerpValue);
        dst.skyColor.g             =   md.lerp(skyColorA.g * skyColorA.intensity, skyColorB.g * skyColorB.intensity, lerpValue);
        dst.skyColor.b             =   md.lerp(skyColorA.b * skyColorA.intensity, skyColorB.b * skyColorB.intensity, lerpValue);
        dst.skyColor.intensity     =   1;

        return  dst;
    },

    getDesiredSetting : function gameLightingGetDesiredSettingFn()
    {
        this.blended    =   this.getBlendedSetting(this.lowerKeyframe, this.upperKeyframe, this.blendFactor, this.blended);

        return  this.blended;
    },

    setTargetSetting : function gameLightingSetTargetSetting(settingObject)
    {
        var multiplier  =   1.0 / 255;

        this.v3AmbientDesired[0]              = settingObject.ambient.r * multiplier * settingObject.ambient.intensity;
        this.v3AmbientDesired[1]              = settingObject.ambient.g * multiplier * settingObject.ambient.intensity;
        this.v3AmbientDesired[2]              = settingObject.ambient.b * multiplier * settingObject.ambient.intensity;

        this.v3WorldLight1Desired[0]          = settingObject.worldLight1.r * multiplier * settingObject.worldLight1.intensity;
        this.v3WorldLight1Desired[1]          = settingObject.worldLight1.g * multiplier * settingObject.worldLight1.intensity;
        this.v3WorldLight1Desired[2]          = settingObject.worldLight1.b * multiplier * settingObject.worldLight1.intensity;
        this.worldLight1PitchDesired          = settingObject.worldLight1.pitch;
        this.worldLight1YawDesired            = settingObject.worldLight1.yaw;
        this.worldLight1ShadowStrengthDesired = settingObject.worldLight1.shadowStrength;

        this.fogColor[0] = settingObject.fogColor.r * multiplier * settingObject.fogColor.intensity;
        this.fogColor[1] = settingObject.fogColor.g * multiplier * settingObject.fogColor.intensity;
        this.fogColor[2] = settingObject.fogColor.b * multiplier * settingObject.fogColor.intensity;


        this.skyColor[0] = settingObject.skyColor.r * multiplier * settingObject.skyColor.intensity;
        this.skyColor[1] = settingObject.skyColor.g * multiplier * settingObject.skyColor.intensity;
        this.skyColor[2] = settingObject.skyColor.b * multiplier * settingObject.skyColor.intensity;

        this.foregroundAlbedoScale[0] = settingObject.foregroundAlbedoScale[0];
        this.foregroundAlbedoScale[1] = settingObject.foregroundAlbedoScale[1];
        this.foregroundAlbedoScale[2] = settingObject.foregroundAlbedoScale[2];

    },

    update : function gameLightingUpdateFn()
    {
        this.updateDesiredSetting();
        this.tendCurrentValues();
        this.applyToGlobalLights();
    },

    initializeGlobalLights : function gameLightingInitializeGlobalLightsFn()
    {
        var globals =   this.globals;
        var md      =   globals.mathDevice;

        var ambientLight  = Light.create(
            {
                name : "ambient1",
                ambient : true,
                global : true,
                color : md.v3BuildZero(),
                disabled : false
            });

        var lightMaterialData = {
            effect: "lambert",
            parameters : {
                lightfalloff: "textures/global_light.dds",
                lightprojection: "textures/global_light.dds",
                shadowSize_depthTweak_blurSize_fadeScale : md.v4Build(0, 0.005, 1.5, 0.5) //1.0
            }
        };

        globals.scene.loadMaterial(globals.graphicsDevice, globals.textureManager, globals.effectManager, "worldLightMaterial", lightMaterialData);
        var light1Material =   globals.scene.getMaterial("worldLightMaterial");

        var worldDirectionLight = Light.create(
            {
                name : "world1Directional",
                directional : true,
                global : false,
                color : md.v3BuildZero(),
                shadows : true,
                halfExtents : md.v3Build(1, 1, 1),
                direction : md.v3Build(0, 0, 1),
                material : light1Material,
                dynamic : true,
                disabled : false
            });

        this.ambientLight        = ambientLight;
        this.worldDirectionLight = worldDirectionLight;

        this.lowerKeyframe = GameLighting.keyframes.midday;
        this.upperKeyframe = GameLighting.keyframes.midday;
    },

    applyToGlobalLights : function gameLightingApplyFn()
    {
        var globals     =   this.globals;
        var renderer    =   globals.renderer;
        var md          =   globals.mathDevice;

        renderer.setAmbientColor(this.v3AmbientCurrent);
        renderer.setGlobalLightColor(this.v3WorldLight1Current);

        var v3Direction = this.scratchpad.v3Direction = md.v3Build(this.worldLight1PitchCurrent, this.worldLight1YawCurrent, 0, this.scratchpad.v3Direction);
        var m33Transform = this.scratchpad.m33Transform = md.m33BuildRotationXZY(v3Direction, this.scratchpad.m33Transform);
        v3Direction[0] = m33Transform[6];
        v3Direction[1] = m33Transform[7];
        v3Direction[2] = m33Transform[8];
        renderer.setGlobalLightDirection(v3Direction);

        renderer.setFogColor(this.fogColor);
        renderer.setSkyColor(this.skyColor);
        renderer.setForegroundAlbedoScale(this.foregroundAlbedoScale);

    },

    getShadowsEnabled : function gameLightingGetShadowsEnabledFn()
    {
        return this.globals.settings.shadows;
    },

    setShadowsEnabled : function gameLightingSetShadowsEnabledFn(on)
    {
        this.globals.settings.shadows = on;
        this.worldDirectionLight.shadows = this.globals.settings.shadows;
    },

    drawShadowMap : function gameLightingDrawShadowMapFn()
    {
        var globals = this.globals;
        globals.renderer.drawShadowMap(globals.graphicsDevice);
    },

    drawSilhouetteBuffer : function gameLightingDrawSilhouetteBufferFn()
    {
        var globals = this.globals;
        globals.renderer.drawSilhouetteBuffer(globals.graphicsDevice);
    },

    drawColorBuffer : function gameLightingDrawColorBufferFn()
    {
        var globals = this.globals;
        globals.renderer.drawColorBuffer(globals.graphicsDevice);
    },

    drawFinalBuffer : function gameLightingDrawFinalBufferFn()
    {
        var globals = this.globals;
        globals.renderer.drawFinalBuffer(globals.graphicsDevice);
    }
};

GameLighting.create = function gameLightingCreateFn(globals, gameManager)
{
    var newGameLighting    =   new GameLighting();

    newGameLighting.init(globals, gameManager);

    return  newGameLighting;
};
