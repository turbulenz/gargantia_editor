//
// PlayStateBase - from which play states are built.
//

/*global tzBaseObject: false*/
/*global PlayFlags: false*/
/*global debug: false*/
/*global Draw2DSprite: false*/
/*global ECScore: false*/
/*global GamestatePlaying: false*/
/*global GamestateLoading: false*/
/*global GamestateMissionEnd: false*/
/*global guiColors: false*/
/*global GuiRenderer: false*/
/*global VMath: false*/


var PlayStateBase = tzBaseObject.extend({

    playStateName : 'No Play State',
    playStateCreationMap : [],
    playFlagName : 'playFlagsPrototype',

    init : function playStatebaseInitFn(gameStatePlayingOwner, globals/*, parameters*/)
    {
        //Called on construction.
        this.gameStatePlayingOwner =   gameStatePlayingOwner;

        this.gameManager    =   gameStatePlayingOwner.getGameManager();
        this.globals        =   globals;

        this.applyFlags(PlayFlags[this.playFlagName]);

        this.gameManager.setPlayState(this);

        this.gameManager.cloudManager.build();

        var mathDevice = globals.mathDevice;

        this.wispVelocityThreshold = 15.0;
        this.wispAlphaRamp = 30;
        this.wispScale = 8;
        this.wispColor = mathDevice.v3Build(1, 1, 1);
        this.wispGenerateRamp = 0.5;
        this.wispRadiusMin = 0.5;
        this.wispRadiusMax = 1.0;
        this.wispAcceleration = 0.6;

        this.vignettes = [];
        this.numVignettes = 0;
        this.lastVignette = -1;
        var vignettes = this.vignettes;
        var vignetteTexture = globals.textureManager.get(GamestatePlaying.vignette);
        var i, sprite;
        for (i = 0; i < 100; i += 1)
        {
            vignettes.push(sprite = Draw2DSprite.create({
                texture: vignetteTexture
            }));
        }

        this.contrailVelocityThreshold = 20;
        this.contrailAlphaRamp = 20;

        this.contrailRibbons = [[], [], [], [], []];
        this.contrailLeft = mathDevice.v3BuildZero();
        this.contrailRight = mathDevice.v3BuildZero();
        this.contrailBottom = mathDevice.v3BuildZero();
        this.contrailLeftRing = mathDevice.v3BuildZero();
        this.contrailRightRing = mathDevice.v3BuildZero();
        this.ribbonStart = 0;
        this.ribbonLength = 60;
        var buffer = new Float32Array(this.ribbonLength * 5 * 4);
        var bufferOffset = 0;
        for (i = 0; i < this.ribbonLength; i += 1)
        {
            this.contrailRibbons[0].push(mathDevice.v4BuildZero(buffer.subarray(bufferOffset, (bufferOffset + 4))));
            bufferOffset += 4;
            this.contrailRibbons[1].push(mathDevice.v4BuildZero(buffer.subarray(bufferOffset, (bufferOffset + 4))));
            bufferOffset += 4;
            this.contrailRibbons[2].push(mathDevice.v4BuildZero(buffer.subarray(bufferOffset, (bufferOffset + 4))));
            bufferOffset += 4;
            this.contrailRibbons[3].push(mathDevice.v4BuildZero(buffer.subarray(bufferOffset, (bufferOffset + 4))));
            bufferOffset += 4;
            this.contrailRibbons[4].push(mathDevice.v4BuildZero(buffer.subarray(bufferOffset, (bufferOffset + 4))));
            bufferOffset += 4;
        }

        this.scratchV3X = mathDevice.v3BuildZero();
        this.scratchV3Y = mathDevice.v3BuildZero();
        this.scratchV3Z = mathDevice.v3BuildZero();
        this.scratchV2  = mathDevice.v2BuildZero();
        this.scratchScale = mathDevice.v2BuildZero();

        // v3 pos, scale, v2 uv, alpha, 2 * (1 + length) pairs of verts for tri-strip, 5 ribbons
        this.ribbonVertexData = new Float32Array((3 + 1 + 2 + 1) * 2 * (1 + this.ribbonLength) * 5);
        this.ribbonStride = (3 + 1 + 2 + 1) * 2 * (1 + this.ribbonLength);
        this.ribbonVertexBuffer = globals.graphicsDevice.createVertexBuffer({
            numVertices : 2 * (1 + this.ribbonLength) * 5,
            attributes: ["FLOAT4", "FLOAT3"], // xyza uv
            dynamic: true
        });
        this.ribbonSemantics = this.globals.graphicsDevice.createSemantics(['POSITION', 'TEXCOORD0']);

        this.ribbonTechniqueParameters = globals.graphicsDevice.createTechniqueParameters({
            viewProjection: null,
            diffuse: null,
            uvAnimationTime: 0,
            uvAnimationScale: 1,
            lightColor: new Float32Array(3)
        });
        this.ribbonAnimationStep = 1;
        this.ribbonScaleRamp = 0.35;

        this.v3LightColor = new Float32Array(3);

        var ui = this.globals.dynamicUI;
        if (ui)
        {
            if (!PlayStateBase.uiGroupID)
            {
                PlayStateBase.uiGroupID = ui.addGroup("Trail Effects", globals.uiGroups.graphics, function () {}, {collapsable: true});
            }
            var group = PlayStateBase.uiGroupID;
            var contrail = ui.addGroup("Contrail", group);
            ui.watchVariable(
                "Animation scale",
                this.ribbonTechniqueParameters,
                'uvAnimationScale',
                'slider',
                contrail,
                {
                    min : 0.1,
                    max : 2.0,
                    step : 0.1
                });
            ui.watchVariable(
                "Animation advance",
                this,
                'ribbonAnimationStep',
                'slider',
                contrail,
                {
                    min : 0.1,
                    max : 2.0,
                    step : 0.1
                });
            ui.watchVariable(
                "Scale ramp",
                this,
                'ribbonScaleRamp',
                'slider',
                contrail,
                {
                    min : 0.1,
                    max : 2.0,
                    step : 0.1
                });
            ui.watchVariable(
                "Velocity Threshold",
                this,
                'contrailVelocityThreshold',
                'slider',
                contrail,
                {
                    min : 0,
                    max : 200,
                    step : 10
                });
            ui.watchVariable(
                'Alpha ramp',
                this,
                'contrailAlphaRamp',
                'slider',
                contrail,
                {
                    min : 1,
                    max : 50,
                    step : 1
                });

            var vignette = ui.addGroup("Wisp Vignette", group);
            ui.watchVariable(
                "Velocity Threshold",
                this,
                'wispVelocityThreshold',
                'slider',
                vignette,
                {
                    min : 0,
                    max : 200,
                    step : 10
                });

            ui.watchVariable(
                'Alpha ramp',
                this,
                'wispAlphaRamp',
                'slider',
                vignette,
                {
                    min : 1,
                    max : 50,
                    step : 1
                });

            ui.watchVariable(
                'Scale',
                this,
                'wispScale',
                'slider',
                vignette,
                {
                    min : 2,
                    max : 10,
                    step : 0.5
                });

            ui.watchVariable(
                'Generate Ramp',
                this,
                'wispGenerateRamp',
                'slider',
                vignette,
                {
                    min : 0.25,
                    max : 20,
                    step : 0.25
                });

            ui.watchVariable(
                'Radius Min',
                this,
                'wispRadiusMin',
                'slider',
                vignette,
                {
                    min : 0.0,
                    max : 1.0,
                    step : 0.05,
                    display : {
                        scale : 100,
                        postFix : "%"
                    }
                });

            ui.watchVariable(
                'Radius Max',
                this,
                'wispRadiusMax',
                'slider',
                vignette,
                {
                    min : 0.0,
                    max : 1.0,
                    step : 0.05,
                    display : {
                        scale : 100,
                        postFix : "%"
                    }
                });

            ui.watchVariable('Color', this, 'wispColor', 'colorpicker', vignette);

            ui.watchVariable(
                'Acceleration',
                this,
                'wispAcceleration',
                'slider',
                vignette,
                {
                    min : 0.05,
                    max : 2.0,
                    step : 0.05
                });
        }
    },

    missionEnd: function playStateBaseMissionEnd(time)
    {
        var gameManager = this.globals.gameManager;
        if (!this.level.scoring)
        {
            var gameStateLoading = GamestateLoading.create(gameManager, this.globals);
            gameStateLoading.setLevelToLoad(this.level);
            var playState = gameManager.getPlayState();
            if (playState)
            {
                playState.deInit();
                gameManager.setPlayState(null);
            }
            gameManager.setGameState(gameStateLoading);
        }
        else
        {
            if (time === undefined)
            {
                time = this.level.scoring.timer;
            }

            var gameStateMissionEnd =
                GamestateMissionEnd.create(gameManager, this.globals);
            gameStateMissionEnd.setLevelInfo(this.level, time);
            // gameStateMissionEnd.setLevelToLoad(LevelArchetypes[this.level.path]);

            gameManager.setGameState(gameStateMissionEnd);
        }
    },

    endFlamboyantly: function playStateEndFlamboyantlyFn(rating)
    {
        var hero = this.gameManager.heroEntity;
        var score = hero.getEC("ECScore");
        this.missionEnd(score.forceRating(this.level.scoring, rating));
    },

    setLevel: function setLevelFn(level)
    {
        this.level = level;
        this.gameManager.refreshLighting(this.level.lighting);
    },

    setTime : function setTimeFn(time)
    {
        this.remainingTime = time;
    },

    deInit : function playStateMyNameDeInitFn()
    {
        this.gameManager.getGameParticleManager().stopAllParticles();
        this.gameManager.getGameSoundManager().stopAllSounds();

        // This is called when the state is destroyed.
        this.gameStatePlayingOwner.onExitMission();

        this.ribbonVertexBuffer.destroy();

        var ui = this.globals.dynamicUI;
        if (ui)
        {
            ui.removeAllFromGroup(PlayStateBase.uiGroupID, [], true);
        }
    },

    applyFlags : function playStateApplyFlagsFn(flagObject)
    {
        this.gameManager.setPlayFlags(flagObject);
    },

    updateUI : function playeStateBaseUpdateUIFn()
    {
        var gameManager = this.gameManager;
        var globals = this.globals;
        var graphicsDevice = globals.graphicsDevice;
        var md = globals.mathDevice;

        var ecloc = gameManager.heroEntity.getEC("ECLocomotion");
        var guiManager = gameManager.getGuiManager();

        var speedFactor = md.v3Length(ecloc.getVelocity()) / (ecloc.parameters.maxSpeed * 0.5);
        speedFactor = Math.min(1, speedFactor);
        var hudDial = GuiRenderer.dialRenderArc;
        hudDial.overrideArcMin = 0.566;
        hudDial.overrideArcMax = VMath.lerp(0.566, 1.433, speedFactor);
        hudDial = GuiRenderer.dialRenderArcInner;
        hudDial.overrideArcMin = 0.566;
        hudDial.overrideArcMax = VMath.lerp(0.566, 1.433, speedFactor);

        var notch = GuiRenderer.dialNotch;
        notch.angleOffset = hudDial.overrideArcMax * Math.PI * 2;

        var boostFactor = ecloc.chargedBoost;
        var boostBar = GuiRenderer.boostRenderBar;
        boostBar.x1 = boostBar.x3 = VMath.lerp(-60, 60, boostFactor);
        boostBar.y1 = VMath.lerp(5, -9, boostFactor);

        guiManager.addDrawGui('hud', {}, 'hud');

        if (ecloc.stallScale < 0.75)
        {
            guiManager.addDrawGui('hudStall', {}, 'hudStall');
        }
        if ((ecloc.currentBoost > 0.5 || ecloc.targetBoost !== 0) && ecloc.chargedBoost !== 0)
        {
            guiManager.addDrawGui('hudBoost', {}, 'hudBoost');
        }

        if (gameManager.getPlayState())
        {
            var displayScoreText = GuiRenderer.scoreValueText;
            var ecscore = gameManager.heroEntity.getEC("ECScore");
            var score = ecscore.computeScore(this.level.scoring, null, true);
            var displayScore = this.currentDisplayScore;
            if (displayScore === undefined)
            {
                displayScore = this.currentDisplayScore = score;
            }
            else
            {
                var delta = (score - displayScore) * 0.05;
                if (Math.abs(delta) < 5)
                {
                    delta = (delta < 0) ? -5 : 5;
                }
                displayScore = Math.round(displayScore + delta);
                if (delta > 0 && displayScore > score)
                {
                    displayScore = score;
                }
                else if (delta < 0 && displayScore < score)
                {
                    displayScore = score;
                }
                this.currentDisplayScore = displayScore;
            }
            displayScoreText.text = ECScore.scoreify(displayScore);
            if (displayScore < 0)
            {
                displayScoreText.color = guiColors.red;
            }
            else
            {
                displayScoreText.color = guiColors.white;
            }

            guiManager.addDrawGui('hudScore', {}, 'hudScore');

            var states = this.collectionStates;
            if (states)
            {
                var tan60 = Math.tan(60 * Math.PI / 180);
                var count = states.length;
                var offset = 9;
                var startX = graphicsDevice.width - 18 - count * offset;
                var startY = graphicsDevice.height - 40;
                /*jshint bitwise: false*/
                var iOffset = (count & 1);
                for (var i = 0; i < count; i += 1)
                {
                    var archetype = states[i];
                    var x = startX + i * offset;
                    var y = startY + ((i + iOffset) & 1) * offset * tan60;
                    guiManager.addDrawGui(archetype, { x : x, y : y }, 'hudIcon' + i);
                }
                /*jshint bitwise: true*/
            }

            var time = this.remainingTime;
            if (time !== null)
            {
                var displayTimeText = GuiRenderer.timeValueText;
                displayTimeText.text = ECScore.timeify(time);
                displayTimeText.color = time < 30 ? guiColors.red : guiColors.white;

                guiManager.addDrawGui('hudTime', {}, 'hudTime');
            }
        }

        // flight HUD
        var controller = this.globals.gameManager.gameController;
        if (controller.isTouchMode())
        {
            this._drawTouchControls(controller);
        }
    },

    update : function playStateMyNameUpdateFn()
    {
        this.updateUI();
    },

    drawExtraTransparent : function playstatebaseDrawExtraTransparentFn(paused)
    {
        var globals = this.globals;
        var gd = globals.graphicsDevice;
        var md = globals.mathDevice;
        var hero = globals.gameManager.heroEntity;
        var mesh = hero.getEC("ECMesh");

        var ribbon0 = this.contrailRibbons[0];
        var ribbon1 = this.contrailRibbons[1];
        var ribbon2 = this.contrailRibbons[2];
        var ribbon3 = this.contrailRibbons[3];
        var ribbon4 = this.contrailRibbons[4];
        var length = this.ribbonLength;
        var fadeOutCount = this.ribbonFadeOutCount;

        var vlen;
        if (!paused)
        {
            vlen = md.v3Length(hero.getEC("ECLocomotion").getVelocity());
            var offset, rb0, rb1, rb2, rb3, rb4;
            var mx = mesh.getX(this.scratchV3X);
            var my = mesh.getY(this.scratchV3Y);
            if (vlen > this.contrailVelocityThreshold)
            {
                fadeOutCount = 0;
                offset = (this.ribbonStart - 1 + length) % length;
                rb0 = ribbon0[offset];
                rb1 = ribbon1[offset];
                rb2 = ribbon2[offset];
                rb3 = ribbon3[offset];
                rb4 = ribbon4[offset];
                this.ribbonStart = offset;

                var mz = mesh.getZ(this.scratchV3Z);
                var loc = mesh.getv3Location();
                var alpha;
                rb0[0] = rb1[0] = loc[0] - (my[0] * -1.328833 + mz[0] * 0.53598);
                rb0[1] = rb1[1] = loc[1] - (my[1] * -1.328833 + mz[1] * 0.53598);
                rb0[2] = rb1[2] = loc[2] - (my[2] * -1.328833 + mz[2] * 0.53598);
                rb0[0] -= mx[0] * 3.84525;
                rb0[1] -= mx[1] * 3.84525;
                rb0[2] -= mx[2] * 3.84525;
                rb1[0] += mx[0] * 3.84525;
                rb1[1] += mx[1] * 3.84525;
                rb1[2] += mx[2] * 3.84525;
                rb2[0] = loc[0] - (my[0] * 0.942) - (mz[0] * 0.1479);
                rb2[1] = loc[1] - (my[1] * 0.942) - (mz[1] * 0.1479);
                rb2[2] = loc[2] - (my[2] * 0.942) - (mz[2] * 0.1479);
                rb3[0] = rb4[0] = loc[0] - (my[0] * -1.2433 + mz[0] * 0.663598);
                rb3[1] = rb4[1] = loc[1] - (my[1] * -1.2433 + mz[1] * 0.663598);
                rb3[2] = rb4[2] = loc[2] - (my[2] * -1.2433 + mz[2] * 0.663598);
                rb3[0] -= mx[0] * 1.53525;
                rb3[1] -= mx[1] * 1.53525;
                rb3[2] -= mx[2] * 1.53525;
                rb4[0] += mx[0] * 1.53525;
                rb4[1] += mx[1] * 1.53525;
                rb4[2] += mx[2] * 1.53525;
                rb0[3] = rb1[3] = alpha = Math.min(1, 0.4 * (vlen - this.contrailVelocityThreshold) / this.contrailAlphaRamp);
                rb2[3] = alpha * 0.75;
                rb3[3] = rb4[3] = alpha * 0.5;
            }
            else
            {
                fadeOutCount += 1;
                offset = this.ribbonStart;
                rb0 = ribbon0[offset];
                rb1 = ribbon1[offset];
                rb2 = ribbon2[offset];
                rb3 = ribbon3[offset];
                rb4 = ribbon4[offset];
            }

            var data = this.ribbonVertexData;
            for (var i = 0; i < length; i += 1)
            {
                var j = (i + offset) % length;

                rb0 = ribbon0[j];
                rb1 = ribbon1[j];
                rb2 = ribbon2[j];
                rb3 = ribbon3[j];
                rb4 = ribbon4[j];

                var scale = i * 0.035 * this.ribbonScaleRamp;
                var dx0 = (mx[0] * scale);
                var dx1 = (mx[1] * scale);
                var dx2 = (mx[2] * scale);
                var dy0 = (my[0] * scale);
                var dy1 = (my[1] * scale);
                var dy2 = (my[2] * scale);
                var ind0 = i * 14;
                var ind1 = i * 14 + this.ribbonStride;
                var ind2 = i * 14 + this.ribbonStride * 2;
                var ind3 = i * 14 + this.ribbonStride * 3;
                var ind4 = i * 14 + this.ribbonStride * 4;
                var u = i / (length - 1);

                var fade = VMath.clamp((length - i - fadeOutCount) / length, 0, 1);

                data[ind0]     = rb0[0] + dy0;
                data[ind0 + 1] = rb0[1] + dy1;
                data[ind0 + 2] = rb0[2] + dy2;
                data[ind0 + 3] = scale;
                data[ind0 + 4] = u;
                data[ind0 + 5] = 0;
                data[ind0 + 6] = rb0[3] * fade;

                data[ind0 + 7]  = rb0[0] - dy0;
                data[ind0 + 8]  = rb0[1] - dy1;
                data[ind0 + 9]  = rb0[2] - dy2;
                data[ind0 + 10] = scale;
                data[ind0 + 11]  = u;
                data[ind0 + 12] = 1;
                data[ind0 + 13] = rb0[3] * fade;

                data[ind1]     = rb1[0] + dy0;
                data[ind1 + 1] = rb1[1] + dy1;
                data[ind1 + 2] = rb1[2] + dy2;
                data[ind1 + 3] = scale;
                data[ind1 + 4] = u;
                data[ind1 + 5] = 0;
                data[ind1 + 6] = rb1[3] * fade;

                data[ind1 + 7]  = rb1[0] - dy0;
                data[ind1 + 8]  = rb1[1] - dy1;
                data[ind1 + 9]  = rb1[2] - dy2;
                data[ind1 + 10] = scale;
                data[ind1 + 11]  = u;
                data[ind1 + 12] = 1;
                data[ind1 + 13] = rb1[3] * fade;

                data[ind3]     = rb3[0] + dy0;
                data[ind3 + 1] = rb3[1] + dy1;
                data[ind3 + 2] = rb3[2] + dy2;
                data[ind3 + 3] = scale;
                data[ind3 + 4] = u;
                data[ind3 + 5] = 0;
                data[ind3 + 6] = rb3[3] * fade;

                data[ind3 + 7]  = rb3[0] - dy0;
                data[ind3 + 8]  = rb3[1] - dy1;
                data[ind3 + 9]  = rb3[2] - dy2;
                data[ind3 + 10] = scale;
                data[ind3 + 11]  = u;
                data[ind3 + 12] = 1;
                data[ind3 + 13] = rb3[3] * fade;

                data[ind4]     = rb4[0] + dy0;
                data[ind4 + 1] = rb4[1] + dy1;
                data[ind4 + 2] = rb4[2] + dy2;
                data[ind4 + 3] = scale;
                data[ind4 + 4] = u;
                data[ind4 + 5] = 0;
                data[ind4 + 6] = rb4[3] * fade;

                data[ind4 + 7]  = rb4[0] - dy0;
                data[ind4 + 8]  = rb4[1] - dy1;
                data[ind4 + 9]  = rb4[2] - dy2;
                data[ind4 + 10] = scale;
                data[ind4 + 11]  = u;
                data[ind4 + 12] = 1;
                data[ind4 + 13] = rb4[3] * fade;

                data[ind2]     = rb2[0] + dx0;
                data[ind2 + 1] = rb2[1] + dx1;
                data[ind2 + 2] = rb2[2] + dx2;
                data[ind2 + 3] = scale;
                data[ind2 + 4] = u;
                data[ind2 + 5] = 0;
                data[ind2 + 6] = rb2[3] * fade;

                data[ind2 + 7]  = rb2[0] - dx0;
                data[ind2 + 8]  = rb2[1] - dx1;
                data[ind2 + 9]  = rb2[2] - dx2;
                data[ind2 + 10] = scale;
                data[ind2 + 11]  = u;
                data[ind2 + 12] = 1;
                data[ind2 + 13] = rb1[3] * fade;
            }
            this.ribbonVertexBuffer.setData(this.ribbonVertexData);
        }

        this.ribbonFadeOutCount = fadeOutCount;

        gd.setTechnique(globals.shaderManager.load("shaders/contrails.cgfx").getTechnique("contrail"));
        var parameters = this.ribbonTechniqueParameters;
        parameters.diffuse = globals.textureManager.load("textures/contrails.dds");
        if (!paused)
        {
            parameters.uvAnimationTime -= vlen / 2048 * this.ribbonAnimationStep;
        }

        parameters.viewProjection = globals.gameManager.gameCamera.camera.viewProjectionMatrix;

        var renderer = globals.renderer;
        md.v3Add(renderer.getGlobalLightColor(), renderer.getAmbientColor(), parameters.lightColor);
        VMath.v3Saturate(parameters.lightColor, parameters.lightColor);

        gd.setTechniqueParameters(parameters);
        gd.setStream(this.ribbonVertexBuffer, this.ribbonSemantics);
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 2 * length, 0);
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 2 * length, 2 * (1 + length));
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 2 * length, 4 * (1 + length));
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 2 * length, 6 * (1 + length));
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 2 * length, 8 * (1 + length));
    },

    _drawVignettes : function playstatebaseDrawVignettes(draw2D, paused)
    {
        var renderer = this.globals.renderer;
        var gd = this.globals.graphicsDevice;
        var md = this.globals.mathDevice;

        var vignettes = this.vignettes;
        var numVignettes = this.numVignettes;
        var scratchScale = this.scratchScale;

        var radiusBase = Math.min(gd.width, gd.height) / 2;
        var ecloc = this.globals.gameManager.heroEntity.getEC("ECLocomotion");
        var vlen = md.v3Length(ecloc.getVelocity());
        var i, v;
        if (vlen > this.wispVelocityThreshold && !paused)
        {
            this.lastVignette -= 1 / 60;
            if (this.lastVignette < 0)
            {
                this.lastVignette = this.wispGenerateRamp / vlen;

                var angle = Math.random() * Math.PI * 2;
                var r = (this.wispRadiusMin + Math.random() * (this.wispRadiusMax - this.wispRadiusMin)) * radiusBase;
                var sprite;
                var vx = r * Math.cos(angle);
                var vy = r * Math.sin(angle);
                md.v3Add(renderer.getGlobalLightColor(), renderer.getAmbientColor(), this.v3LightColor);
                VMath.v3Saturate(this.v3LightColor, this.v3LightColor);

                if (numVignettes < vignettes.length)
                {
                    sprite = vignettes[numVignettes];
                }
                else
                {
                    vignettes.push(sprite = Draw2DSprite.create({
                        texture: this.globals.textureManager.get(GamestatePlaying.vignette)
                    }));
                }

                scratchScale[0] = this.wispScale;
                scratchScale[1] = this.wispScale;
                sprite.setScale(scratchScale);

                sprite.x = gd.width / 2  + vx;
                sprite.y = gd.height / 2 + vy;
                sprite.rotation = angle;
                sprite.setWidth(20);
                sprite.setHeight(20);
                sprite.setColorRGB(this.wispColor[0] * this.v3LightColor[0],
                                   this.wispColor[1] * this.v3LightColor[1],
                                   this.wispColor[2] * this.v3LightColor[2]);
                sprite.setAlpha(0.2 * (vlen - this.wispVelocityThreshold) / this.wispAlphaRamp);

                sprite.vx = vx;
                sprite.vy = vy;
                sprite.growth = 1 / 4;
                // cache as we never change width/height afterwards.
                sprite.baseWidth = sprite.getWidth();
                sprite.baseHeight = sprite.getHeight();
                sprite.width = sprite.getWidth();
                sprite.height = sprite.getHeight();
                sprite.baseScaleX = this.wispScale;
                sprite.baseScaleY = this.wispScale;
                sprite.baseAlpha = sprite.getAlpha();

                numVignettes += 1;
            }
        }

        if (!paused)
        {
            vlen = Math.max(vlen, this.wispVelocityThreshold);
            for (i = 0; i < numVignettes; i += 1)
            {
                v = vignettes[i];
                v.growth = Math.min(5, v.growth * (1.0 + vlen / 850));
                var growth = v.growth * radiusBase / 600;
                v.width = v.baseWidth * growth * 2;
                v.height = v.baseHeight * growth * 2;
                scratchScale[0] = v.baseScaleX * growth;
                scratchScale[1] = v.baseScaleY * growth;
                v.setScale(scratchScale);
                v.setAlpha(v.growth * v.baseAlpha);
                v.x += v.vx / 700;
                v.y += v.vy / 700;
                v.vx *= 1 + this.wispAcceleration / 10;
                v.vy *= 1 + this.wispAcceleration / 10;
                if (v.x < -v.width || v.x > gd.width + v.width || v.y < -v.height || v.y > gd.height + v.height)
                {
                    numVignettes -= 1;
                    vignettes[i] = vignettes[numVignettes];
                    vignettes[numVignettes] = v;
                    i -= 1;
                    continue;
                }
                if (v.getAlpha() > 0.01)
                {
                    draw2D.drawSprite(v);
                }
            }
        }
        else
        {
            for (i = 0; i < numVignettes; i += 1)
            {
                v = vignettes[i];
                if (v.getAlpha() > 0.01)
                {
                    draw2D.drawSprite(v);
                }
            }
        }

        this.numVignettes = numVignettes;
    },

    _drawTouchControls : function playstatebaseDrawTouchControlsFn(controller)
    {
        var gd = this.globals.graphicsDevice;

        var scale = Math.max(gd.width / 1280, gd.height / 600);
        var border = controller.padBorder = (150 - 128) * scale;
        controller.padX = 128 * scale;
        controller.padY = gd.height - 320;
        controller.padRadius = 128 * scale;
        controller.padExponent = 1.0; // higher value = control is less sensitive in middle of pad, but more sensitive on outside of pad
        controller.padDeadZone = 2 * scale; // should be < radius, less than this distance from centre of pad, 0 control input is given.
        controller.padShift = false; // if true, d-pad will move to be centered at first touch.
        controller.padBoostScale = 0.5; // boost is 0.5 size of d-pad

        var x = gd.width - controller.padX;
        var y = controller.padY;
        var alpha;
        var padRadius = controller.padRadius;

        var guiManager = this.globals.gameManager.getGuiManager();
        x = controller.padDrag !== null ? controller.padDragStartX : controller.padX;
        y = controller.padDrag !== null ? controller.padDragStartY : controller.padY;
        alpha = controller.padDrag !== null ? 1.0 : 0.75;
        x += border;
        GuiRenderer.archetypes.touchDPad.instructions[0].color[3] = alpha;
        var tm = this.globals.textureManager;
        var tp = GuiRenderer.archetypes.touchDPad.instructions[0].texturePath = controller.padDrag !== null ? "textures/touch_dpad_pressed.dds" : "textures/touch_dpad_default.dds";
        guiManager.addDrawGui('touchDPad', { x : x, y : y, scale : padRadius / tm.load(tp).width * 2 }, 'touchDPad');

        if (controller.padDrag !== null)
        {
            var dx = controller.padDragX * padRadius;
            var dy = controller.padDragY * padRadius;
            guiManager.addDrawGui('touchFinger', { x : x + dx, y : y + dy }, 'touchFinger');
        }

        x = gd.width - controller.padX * controller.padBoostScale - border;
        y = controller.padY;
        alpha = controller.touchBoost !== null ? 1.0 : 0.75;
        GuiRenderer.archetypes.touchBoost.instructions[0].color[3] = alpha;
        tp = GuiRenderer.archetypes.touchBoost.instructions[0].texturePath = controller.touchBoost !== null ? "textures/touch_boost_pressed.dds" : "textures/touch_boost_default.dds";
        guiManager.addDrawGui('touchBoost', { x : x, y : y, scale : padRadius * controller.padBoostScale / tm.load(tp).width * 2 }, 'touchBoost');
    },

    draw2D : function playstatebaseDraw2DFn(paused)
    {
        var draw2D = this.globals.draw2D;
        draw2D.begin("alpha", "deferred");

        // wisp vignette
        this._drawVignettes(draw2D, paused);

        draw2D.end();

        var cloudManager = this.gameManager.cloudManager;
        cloudManager.draw2D();
    }
});

PlayStateBase.create = function playStateBaseCreateFn(gameStatePlayingOwner, globals, parameters)
{
    return new PlayStateBase(gameStatePlayingOwner, globals, parameters);
};

PlayStateBase.getFlagsFromPlayStateName = function playStateGetFlagsFromPlayStateName(playStateName)
{
    var playStateClass = PlayStateBase.prototype.playStateCreationMap[playStateName];
    return playStateClass.prototype.playFlagName;
};

PlayStateBase.createFromName = function playStateBaseCreateFromNameFn(playStateName, gameStatePlayingOwner, globals, parameters)
{
    var playStateClassToCreate = PlayStateBase.prototype.playStateCreationMap[playStateName];

    var playState;

    debug.assert(playStateClassToCreate !== undefined,
                        'Trying to create an unknown Play State : ' + playStateName);

    playState   =   playStateClassToCreate.create(gameStatePlayingOwner, globals, parameters);

    return playState;
};
