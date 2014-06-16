// Copyright (c) 2011-2014 Turbulenz Limited

/*global AnimationManager: false*/
/*global AssetTracker: false*/
/*global Camera: false*/
/*global CartoonRendering: false*/
/*global Config: false*/
/*global debug: false*/
/*global DebugDraw: false*/
/*global Draw2D: false*/
/*global DynamicUIManager: false*/
/*global EffectManager: false*/
/*global EntityComponentBase: false*/
/*global FontManager: false*/
/*global GameManager: false*/
/*global GamestatePlaying: false*/
/*global GamestateMissionEnd: false*/
/*global GamestateEditor: false*/
/*global GuiRenderer: false*/
/*global Profile: false*/
/*global Globals: false*/
/*global GuiRenderer: false*/
/*global GamestateEditor: false*/
/*global IndexBufferManager: false*/
/*global Materials: false*/
/*global ParticleManager: false*/
/*global Profile: false*/
/*global RequestHandler: false*/
/*global SaveData: false*/
/*global EventBroadcast: false*/
/*global Scene: false*/
/*global SceneLoader: false*/
/*global ShaderManager: false*/
/*global SimpleFontRenderer: false*/
/*global SimpleSceneLoader: false*/
/*global SimpleBlendStyle: false*/
/*global SimpleSprite: false*/
/*global TextureManager: false*/
/*global SoundManager: false*/
/*global TurbulenzEngine: false*/
/*global TurbulenzServices: false*/
/*global TWEEN: false*/
/*global VertexBufferManager: false*/
/*global VMath: false*/
/*global WebGLDebugUtils: false*/
/*global PlayStateRings: false*/
/*global window: false*/
/*global Water: false*/

//
// Application: The global for the whole application (singleton)
//
function Application() {}
Application.prototype =
{
    // Error callback - uses window alert
    errorCallback : function errorCallbackFn(msg)
    {
        debug.error(msg);
    },

    // Simply create the gamesession
    init : function initFn()
    {
        var requestHandlerParameters = {};
        this.requestHandler = RequestHandler.create(requestHandlerParameters);

        this.createGameSession(this.initWithGameSession.bind(this), this.errorCallback.bind(this));
    },

    // Create game session
    createGameSession : function createGameSessionFn(successCallback, errorCallback)
    {
        this.gameSession = TurbulenzServices.createGameSession(this.requestHandler, successCallback, errorCallback);
        this.globals.gameSession = this.gameSession;
    },

    initWithGameSession : function initWithGameSessionFn()
    {
        // Create the asset tracker before any requests have been made

        // We deliberately overestimate the number of requests and then reduce the
        // number dynamically later when the figure is known
        this.assetTracker = AssetTracker.create(1000, false);

        var requestHandler = this.requestHandler;

        //Patch requestHandler.request
        requestHandler.handlers.eventOnRequestMade = [];
        var oldRequest = requestHandler.request;

        requestHandler.request = function (callContext)
        {
            oldRequest.call(requestHandler, callContext);
            requestHandler.sendEventToHandlers(requestHandler.handlers.eventOnRequestMade, {eventType: "eventOnRequestMade", name: callContext.src});
        };
        //End patch

        requestHandler.addEventListener('eventOnRequestMade', this.onAssetRequestBound);
        requestHandler.addEventListener('eventOnload', this.assetTracker.eventOnLoadHandler);

        // Test for minimum engine version, device creation, and shader support
        if (!this.createGlobals() || !this.hasShaderSupport())
        {
            return;
        }

        var creationFunctions =
        [
            {func : this.createMappingTable, isDependent : false},
            {func : this.assignMappingTable, isDependent : true, noCallback : true},
            {func : this.createRenderer, isDependent : true, noCallback : true},
            {func : this.createGlobalEditorSliders, isDependent : true, noCallback : true},
            {func : this.createGlobalSettingSliders, isDependent : true, noCallback : true},
            {func : this.createRendererSliders, isDependent : true, noCallback : true},
            {func : this.createWaterSliders, isDependent : true, noCallback : true},
            {func : this.createGame, isDependent : true, noCallback : true},
            {func : this.enterLoadingLoop, isDependent : true}
        ];
        this.enterCallbackChain(this, creationFunctions);
    },

    // Update function called in main loop
    update : function updateFn()
    {
        var globals            =   this.globals;
        var graphicsDevice     =   globals.graphicsDevice;
        var camera             =   globals.camera;
        var scene              =   globals.scene;

        globals.appCurrentTime = TurbulenzEngine.time;

        //Manage aspect ratio for dynamic windows.
        var aspectRatio = (graphicsDevice.width / graphicsDevice.height);
        if (aspectRatio !== camera.aspectRatio)
        {
            camera.aspectRatio = aspectRatio;
            camera.updateProjectionMatrix();
        }

        globals.inputDevice.update();

        this.updateGame();

        scene.update();
        if (globals.soundDevice)
        {
            globals.soundDevice.update();
        }
    },

    // Update game state
    updateGame : function updateGameFn()
    {
        this.gameManager.update();
    },

    drawExtraDecals : function drawExtraDecalsFn()
    {
    },

    drawExtraTransparent : function drawExtraTransparentFn()
    {
        if (this.globals.debugDrawFlags.simpleSprites)
        {
            this.globals.simpleSpriteRenderer.drawSprites();
        }

        var gameManager = this.globals.gameManager;
        if (gameManager)
        {
            gameManager.drawExtraTransparent();
        }
    },

    drawDebug : function drawDebugFn()
    {
        var globals         =   this.globals;
        var camera         = globals.camera;
        var debugDrawFlags = globals.debugDrawFlags;
        var graphicsDevice  =   globals.graphicsDevice;
        var scene           =   globals.scene;

        if (debugDrawFlags.sceneTransforms)
        {
            scene.drawTransforms(graphicsDevice, globals.shaderManager, camera, 2.0);
        }

        if (debugDrawFlags.sceneNodeHierarchy)
        {
            scene.drawSceneNodeHierarchy(graphicsDevice, globals.shaderManager, camera);
        }

        if (debugDrawFlags.sceneRenderableExtents)
        {
            scene.drawVisibleRenderablesExtents(graphicsDevice, globals.shaderManager, camera);
        }

        if (debugDrawFlags.sceneWireframe)
        {
            if (!scene.debugWireFrameInfo)
            {
                scene.debugWireFrameInfo = { wireColor : [1, 0, 0, 1], fillColor : [0, 0, 0, 0], alphaRef : 0.5};
            }
            scene.drawWireframe(graphicsDevice, globals.shaderManager, camera, scene.debugWireFrameInfo);
        }

        var level;
        if (debugDrawFlags.sceneDynamicNodesAABB)
        {
            for (level = 0; level < 8; level += 1)
            {
                scene.drawDynamicNodesTree(graphicsDevice, globals.shaderManager, camera, level);
            }
        }

        if (debugDrawFlags.sceneStaticNodesAABB)
        {
            for (level = 0; level < 8; level += 1)
            {
                scene.drawStaticNodesTree(graphicsDevice, globals.shaderManager, camera, level);
            }
        }

        if (debugDrawFlags.sceneLights)
        {
            scene.drawLights(graphicsDevice, globals.shaderManager, camera);
        }

        if (debugDrawFlags.sceneLightExtents)
        {
            scene.drawLightsExtents(graphicsDevice, globals.shaderManager, camera);
        }

        if (debugDrawFlags.hoopOrders || (globals.gameManager && globals.gameManager.getActiveGameState().name === GamestateEditor.prototype.name))
        {
            PlayStateRings.drawHoopOrders(globals);
        }

        globals.debugDraw.drawDebugLines();
    },

    // Render function called in main loop
    render : function renderFn()
    {
        var globals         =   this.globals;
        var graphicsDevice  =   globals.graphicsDevice;
        var camera          =   globals.camera;
        var renderer        =   globals.renderer;
        var scene           =   globals.scene;
        var debugDrawFlags  =   globals.debugDrawFlags;

        var clearColor = globals.clearColor;

        if (graphicsDevice.beginFrame())
        {
            globals.guiRenderer.preRender();

            this.gameManager.draw();

            var frameBufferWidth;
            var frameBufferHeight;

            if (this.useRenderBuffer)
            {
                if (!this.renderBufferWidth)
                {
                    frameBufferWidth = graphicsDevice.width;
                }
                else
                {
                    frameBufferWidth = this.renderBufferWidth;
                }

                if (!this.renderBufferHeight)
                {
                    frameBufferHeight = graphicsDevice.height;
                }
                else
                {
                    frameBufferHeight = this.renderBufferHeight;
                }
            }
            else
            {
                frameBufferWidth = graphicsDevice.width;
                frameBufferHeight = graphicsDevice.height;
            }

            var gameState = this.gameManager.getActiveGameState();
            if (renderer &&
                renderer.updateBuffers(graphicsDevice, frameBufferWidth, frameBufferHeight) &&
                (gameState.name === GamestatePlaying.prototype.name ||
                 gameState.name === GamestateMissionEnd.prototype.name ||
                 gameState.name === GamestateEditor.prototype.name))
            {
                this.updateMaterials();

                if (debugDrawFlags.scene)
                {
                    Profile.start('Render - update scene');
                    renderer.update(graphicsDevice, camera, scene, globals.gameCurrentTime);
                    Profile.stop('Render - update scene');

                    Profile.start('Render - draw scene');
                    renderer.draw(graphicsDevice,
                                  clearColor,
                                  this.drawExtraDecalsCallback,
                                  this.drawExtraTransparentCallback,
                                  this.drawDebugCallback,
                                  this.useRenderBuffer);
                    Profile.stop('Render - draw scene');
                }
                else
                {
                    graphicsDevice.clear(clearColor);
                    this.drawExtraDecalsCallback();
                    this.drawExtraTransparentCallback();
                    this.drawDebugCallback();
                }
            }
            else
            {
                graphicsDevice.clear(clearColor);
            }

            // debug.evaluate(this.drawDebugText());

            // if (this.globals.allowCheats)
            // {
            //     this.drawCheatText();
            // }

            //Done before menu stuff.
            if (debugDrawFlags.ui)
            {
                // This is the real game UI
                Profile.start('Render - UI');
                globals.simpleFontRenderer.render();
                this.gameManager.draw2D();
                Profile.stop('Render - UI');
            }

            // These are the debug game UI
            this.drawUI();
            globals.simpleFontRenderer.render();

            if (debugDrawFlags.shadowMap)
            {
                this.gameManager.gameLighting.drawShadowMap();
            }
            else if (debugDrawFlags.silhouetteBuffer)
            {
                this.gameManager.gameLighting.drawSilhouetteBuffer();
            }
            else if (debugDrawFlags.colorBuffer)
            {
                this.gameManager.gameLighting.drawColorBuffer();
            }
            else if (debugDrawFlags.finalBuffer)
            {
                this.gameManager.gameLighting.drawFinalBuffer();
            }

            this.drawPadCursor();

            graphicsDevice.endFrame();
        }

        this.updateGPUTiming();
    },

    drawPadCursor : function drawPadCursorFn()
    {
        var controller = this.gameManager.gameController;
        var ingame = !this.gameManager.isPaused() && this.gameManager.heroEntity && this.gameManager.heroEntity.getEC('ECLocomotion');
        if (controller.padMode && !ingame)
        {
            var draw2D = this.globals.draw2D;
            if (!this.cursorSprite)
            {
                this.cursorSprite = Draw2DSprite.create({
                    origin: this.globals.mathDevice.v2BuildZero(),
                    texture: this.globals.textureManager.get("textures/cursors/cursormid.dds")
                });
            }
            this.cursorSprite.x = controller.getv2ScreenCoordX();
            this.cursorSprite.y = controller.getv2ScreenCoordY();
            draw2D.begin('alpha');
            draw2D.drawSprite(this.cursorSprite);
            draw2D.end();
        }
    },

    hasUILoaded : function hasUILoadedFn()
    {
        var globals = this.globals;
        return globals.simpleFontRenderer.hasLoaded();
    },

    updateGPUTiming : function updateGPUTimingFn()
    {
        var globals         =   this.globals;
        var graphicsDevice  =   globals.graphicsDevice;
        var gl              =   graphicsDevice.gl;

        if (gl &&
            globals.debugDrawFlags.timeGPURendering)
        {
            var start = TurbulenzEngine.time;
            gl.flush();
            gl.finish();
            var end = TurbulenzEngine.time;
            this.GPURenderingDuration = end - start;
        }
    },

    drawDebugText : function drawDebugTextFn()
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        var step               = this.lineStep;
        var height             = graphicsDevice.height;

        var bottom_left_info = { x : 10, y : height - step * 1.5, pointSize : 16, alignment : 0, color: undefined };

        simpleFontRenderer.drawFont('DEBUG MODE ON', bottom_left_info);
    },

    drawCheatText : function drawCheatTextFn()
    {
        var globals            = this.globals;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        var step               = this.lineStep;
        var height             = graphicsDevice.height;

        var bottom_left_info = { x : 10, y : height - step * 2.5, pointSize : 16, alignment : 0, color: undefined };

        simpleFontRenderer.drawFont('CHEATS ENABLED', bottom_left_info);
    },

    drawUI : function drawUIFn()
    {
        var globals            = this.globals;

        if (!this.debugMessages && !globals.releaseDebugUI)
        {
            return;
        }

        var md                 = globals.mathDevice;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        //var height             = graphicsDevice.height;
        //var width              = graphicsDevice.width;
        var logIndex           = 0;

        if (!this.color)
        {
            this.color = md.v4BuildOne();
            this.white = md.v4BuildOne();
            this.red = md.v4Build(1.0, 0.0, 0.0, 1.0);
        }

        var white = this.white;
        var red   = this.red;

        var step               = this.lineStep;
        var bottom_left_info  = { x : 10, y : step * 2.5, pointSize : 16, alignment : 0, color: this.color };

        var logs               = this.logs;
        var this_log, scale_to_apply, this_log_life;

        var this_time          = TurbulenzEngine.time;

        // if (!globals.inputDevice.isFocused())
        // {
        //     var corner_info    = { x : width / 2, y : 100, pointSize : 16, alignment : 1 };
        //     simpleFontRenderer.drawFont('Click To Focus!', corner_info);
        // }

        // Draw fps
        var renderDuration        = Profile.getStoredAverageTime('Render - Main');
        var renderDurationText    = (renderDuration * 1000).toFixed(2);

        var updateDuration        = Profile.getStoredAverageTime('Update - Main');
        var updateDurationText    = (updateDuration * 1000).toFixed(2);

        var performanceText = ((graphicsDevice.fps).toFixed(0) + ' FPS');
        var msPerFrame      = (1000 / (graphicsDevice.fps));
        performanceText     += ' / ' + msPerFrame.toFixed(2) + 'ms';

        bottom_left_info.color =   md.v4Lerp(white, red, md.saturate(md.getFactor(this.fps, this.fps - 5, graphicsDevice.fps)),
                                             bottom_left_info.color);
        simpleFontRenderer.drawFont(performanceText, bottom_left_info);
        md.v4BuildOne(bottom_left_info.color);
        bottom_left_info.y -=  step;

        // Render duration
        var renderPerformanceText = renderDurationText + ' R';

        bottom_left_info.color =   md.v4Lerp(white, red, md.saturate(md.getFactor(this.goodRenderUpdateTime, this.badRenderUpdateTime, renderDuration)),
                                             bottom_left_info.color);
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        md.v4BuildOne(bottom_left_info.color);
        bottom_left_info.y -=  step;

        // Update duration
        var updatePerformanceText = updateDurationText + ' U';

        bottom_left_info.color =   md.v4Lerp(white, red, md.saturate(md.getFactor(this.goodRenderUpdateTime, this.badRenderUpdateTime, updateDuration)),
                                             bottom_left_info.color);
        simpleFontRenderer.drawFont(updatePerformanceText, bottom_left_info);
        md.v4BuildOne(bottom_left_info.color);
        bottom_left_info.y -=  step;

        // Draw version number
        // simpleFontRenderer.drawFont(('Version ' + this.version), bottom_left_info);
        // bottom_left_info.y     -=  step;

        //logs.
        if (this.logs !== undefined)
        {
            for (logIndex = this.logs.length - 1; logIndex >= 0; logIndex -= 1)
            {
                this_log = logs[logIndex];
                this_log_life = this_time - this_log.time;

                if (this_log_life > 10)
                {
                    logs.splice(logIndex, 1);
                }
                else
                {
                    scale_to_apply = Math.min(this_log_life * 2.0, 1.0);
                    scale_to_apply = Math.min(scale_to_apply, Math.min((10 - this_log_life) * 2.0, 1.0));
                    scale_to_apply = Math.max(scale_to_apply, 0.01);
                    bottom_left_info.scale = 0.5 * scale_to_apply;
                    bottom_left_info.y -= step * scale_to_apply;

                    simpleFontRenderer.drawFont(this_log.string, bottom_left_info);
                }
            }
        }

        var leftEdge   =   bottom_left_info.x;

        if (this.debugUpdate)
        {
            leftEdge   +=  300;
            this.drawUIUpdate(leftEdge);
        }
        if (this.debugRender)
        {
            leftEdge   +=  300;
            this.drawUIRender(leftEdge);
        }
    },

    drawUIUpdate : function drawUIUpdateFn(leftEdge)
    {
        var globals            = this.globals;
        var md                 = globals.mathDevice;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        //var width            = graphicsDevice.width;
        var height             = graphicsDevice.height;
        var step               = this.lineStep;

        if (!this.color)
        {
            this.color = md.v4BuildOne();
            this.white = md.v4BuildOne();
            this.red = md.v4Build(1.0, 0.0, 0.0, 1.0);
        }

        var white = this.white;
        var red   = this.red;

        var bottom_left_info  = { x : leftEdge + 10, y : height - step * 1.5, pointSize : 16, alignment : 0, color: this.color };


        // Update duration
        var updateDuration        = Profile.getStoredAverageTime('Update - Game') * 1000;
        var updatePerformanceText = updateDuration.toFixed(2) + 'ms (update)';

        bottom_left_info.color =   md.v4Lerp(white, red, md.saturate(md.getFactor(this.goodRenderUpdateTime, this.badRenderUpdateTime, updateDuration)),
                                             bottom_left_info.color);
        simpleFontRenderer.drawFont(updatePerformanceText, bottom_left_info);
        md.v4BuildOne(bottom_left_info.color);
        bottom_left_info.y -=  step;

        // Steps
        var eCTotalFrames = Profile.getStoredCallCount('Update - Game');
        var numberOfFrames = Profile.getStoredCallCount('Update - Main');
        var stepsPerFrame = Math.round(eCTotalFrames / numberOfFrames);
        var stepsUpdateText = stepsPerFrame + ' update(s) per frame';

        md.v4BuildOne(bottom_left_info.color);
        simpleFontRenderer.drawFont(stepsUpdateText, bottom_left_info);
        bottom_left_info.y -=  (2 * step);

        //
        //  Draw EC profile info.
        //
        // Profile.getStoredCallCount('Update  -' + )
        // bottom_left_info

        var eCCreationMap   =   EntityComponentBase.prototype.eCCreationMap;
        var eCName;
        var eCCount;
        var eCTotal;
        var queryName;
        for (eCName in eCCreationMap)
        {
            if (eCCreationMap.hasOwnProperty(eCName))
            {
                queryName   =   'Update - ' + eCName;
                eCCount =   Math.floor(Profile.getStoredCallCount(queryName) / eCTotalFrames);
                eCTotal =   Profile.getStoredDuration(queryName) * 1000 / eCTotalFrames;

                if (eCCount > 0)
                {
                    bottom_left_info.color = md.v4Lerp(white, red, md.saturate(md.getFactor(0.0, 1.0, eCTotal)),
                                                       bottom_left_info.color);
                }
                else
                {
                    md.v4Build(0.25, 0.25, 0.25, 1.0, bottom_left_info.color);
                }
                simpleFontRenderer.drawFont(eCName + ' (' + eCCount + ') ' + eCTotal.toFixed(2) + ' ms', bottom_left_info);
                md.v4BuildOne(bottom_left_info.color);

                if (eCCount > 0)
                {
                    bottom_left_info.y -=  step;
                }
                else
                {
                    bottom_left_info.y -=  step * 0.7;
                }
            }
        }

        //
        //  Draw entity update info.
        //
        simpleFontRenderer.drawFont('Off Screen Entities - ' + (Profile.getStoredAverageTime('Update - Off Screen Entities') * 1000).toFixed(2) + 'ms', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont('On Screen Entities - ' + (Profile.getStoredAverageTime('Update - On Screen Entities') * 1000).toFixed(2) + 'ms', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont('Entities - ' + (Profile.getStoredAverageTime('Update - Entities') * 1000).toFixed(2) + 'ms', bottom_left_info);
        bottom_left_info.y -=  step;

        //
        //  Draw physics update info.
        //
        simpleFontRenderer.drawFont('Physics - ' + (Profile.getStoredAverageTime('Update - Physics') * 1000).toFixed(2) + 'ms', bottom_left_info);
        bottom_left_info.y -=  step;

        if (this.activeEntityCount === 1)
        {
            simpleFontRenderer.drawFont("" + this.gameManager.activeEntityCount + " Entity Processed Per Frame.", bottom_left_info);
        }
        else
        {
            simpleFontRenderer.drawFont("" + this.gameManager.activeEntityCount + " Entities Processed Per Frame.", bottom_left_info);
        }
        bottom_left_info.y -=  step;

        if (this.gameManager.activeSpaceCount === 1)
        {
            simpleFontRenderer.drawFont("" + this.gameManager.activeSpaceCount + " Space Processed Per Frame.", bottom_left_info);
        }
        else
        {
            simpleFontRenderer.drawFont("" + this.gameManager.activeSpaceCount + " Spaces Processed Per Frame.", bottom_left_info);
        }
        bottom_left_info.y -=  step;
    },

    drawUIRender : function drawUIRenderFn(leftEdge)
    {
        var globals            = this.globals;
        var md                 = globals.mathDevice;
        var simpleFontRenderer = globals.simpleFontRenderer;
        var graphicsDevice     = globals.graphicsDevice;

        //var width            = graphicsDevice.width;
        var height             = graphicsDevice.height;
        var step               = this.lineStep;

        if (!this.color)
        {
            this.color = md.v4BuildOne();
            this.white = md.v4BuildOne();
            this.red = md.v4Build(1.0, 0.0, 0.0, 1.0);
        }

        var white = this.white;
        var red   = this.red;

        var bottom_left_info  = { x : leftEdge + 10, y : height - step * 1.5, pointSize : 16, alignment : 0, color : this.color };

        // Render duration
        var renderDuration        = Profile.getStoredAverageTime('Render - Main') * 1000;
        var renderPerformanceText = renderDuration.toFixed(2) + 'ms (render)';

        bottom_left_info.color =   md.v4Lerp(white, red, md.saturate(md.getFactor(this.goodRenderUpdateTime, this.badRenderUpdateTime, renderDuration)),
                                             bottom_left_info.color);
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        md.v4BuildOne(bottom_left_info.color);
        bottom_left_info.y -=  step;

        renderDuration        = Profile.getStoredAverageTime('Render - update scene') * 1000;
        renderPerformanceText = renderDuration.toFixed(2) + 'ms (update scene)';
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        bottom_left_info.y -=  step;

        renderDuration        = Profile.getStoredAverageTime('Render - draw scene') * 1000;
        renderPerformanceText = renderDuration.toFixed(2) + 'ms (draw scene)';
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        bottom_left_info.y -=  step;

        renderDuration        = Profile.getStoredAverageTime('Render - UI') * 1000;
        renderPerformanceText = renderDuration.toFixed(2) + 'ms (UI)';
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        bottom_left_info.y -=  step;

        renderDuration        = Profile.getStoredAverageTime('Render - render vision cones') * 1000;
        renderPerformanceText = renderDuration.toFixed(2) + 'ms (render vision cones)';
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        bottom_left_info.y -=  step;

        renderDuration        = Profile.getStoredAverageTime('Render - calculate vision cones') * 1000;
        renderPerformanceText = renderDuration.toFixed(2) + 'ms (calculate vision cones)';
        simpleFontRenderer.drawFont(renderPerformanceText, bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont('Draw Entities - ' + (Profile.getStoredAverageTime('Draw - Entities') * 1000).toFixed(2) + 'ms', bottom_left_info);
        bottom_left_info.y -=  step;

        // Scene
        var uniqueMeshes        =   globals.simpleSceneLoader.getNumberOfUniqueMeshes();
        var createdNodes        =   globals.simpleSceneLoader.getNumberOfNodes();
        var visibleNodes        =   globals.scene.visibleNodes.length;
        var visibleRenderables  =   globals.scene.visibleRenderables.length;
        var visibleLights       =   globals.scene.visibleLights.length;

        simpleFontRenderer.drawFont(uniqueMeshes + ' unique meshes', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont(createdNodes + ' created nodes', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont(visibleLights + ' visible lights', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont(visibleRenderables + ' visible renderables', bottom_left_info);
        bottom_left_info.y -=  step;

        simpleFontRenderer.drawFont(visibleNodes + ' visible nodes', bottom_left_info);
        bottom_left_info.y -=  step;

        var visibilityMetrics = globals.scene.getVisibilityMetrics();
        simpleFontRenderer.drawFont(visibilityMetrics.numOccluders + ' occulders', bottom_left_info);
        bottom_left_info.y -=  step;

        var metrics = graphicsDevice.metrics;
        if (metrics)
        {
            simpleFontRenderer.drawFontDouble(metrics.renderTargetChanges + ' renderTargetChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.textureChanges + ' textureChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.renderStateChanges + ' renderStateChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.vertexBufferChanges + ' vertexBufferChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.indexBufferChanges + ' indexBufferChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.techniqueChanges + ' techniqueChanges', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.drawCalls + ' drawCalls', bottom_left_info);
            bottom_left_info.y -=  step;

            simpleFontRenderer.drawFontDouble(metrics.primitives + ' primitives', bottom_left_info);
            bottom_left_info.y -=  step;
        }

        if (globals.debugDrawFlags.timeGPURendering &&
            this.GPURenderingDuration !== undefined)
        {
            simpleFontRenderer.drawFont((this.GPURenderingDuration * 1000).toFixed(2) + ' (ms) gl.finish', bottom_left_info);
            bottom_left_info.y -=  step;
        }
    },

    log : function logFn(string)
    {
        if (this.logs === undefined)
        {
            this.logs = [];
        }

        this.logs.push({string : string, time : TurbulenzEngine.time});
    },

    // Checks for shading language support
    hasShaderSupport : function hasShaderSupportFn()
    {
        var graphicsDevice = this.globals.graphicsDevice;

        if (!graphicsDevice.shadingLanguageVersion)
        {
            this.errorCallback("No shading language support detected.\nPlease check your graphics drivers are up to date.");
            graphicsDevice = null;
            return false;
        }
        return true;
    },

    initalizeDebugWebGL : function initalizeDebugWebGL(graphicsDevice)
    {
        var onWebGLError = function throwOnGLError(err, funcName/*, args*/)
        {
            throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
        };

        graphicsDevice.gl = WebGLDebugUtils.makeDebugContext(graphicsDevice.gl, onWebGLError);

    },

    loadMaterials : function loadMaterials()
    {
        var scene = this.globals.scene;
        var graphicsDevice = this.globals.graphicsDevice;
        var textureManager = this.globals.textureManager;
        var effectManager = this.globals.effectManager;
        var materialName;
        var materialArchetype;

        for (materialName in Materials)
        {
            if (Materials.hasOwnProperty(materialName))
            {
                materialArchetype = Materials[materialName];

                scene.loadMaterial(graphicsDevice, textureManager, effectManager, materialName, materialArchetype);
            }
        }

        this.finizliseMaterials();
    },

    finizliseMaterials : function finizliseMaterials()
    {
        var scene = this.globals.scene;
        var materials = scene.materials;
        var materialName;
        var material;
        var meta;

        for (materialName in materials)
        {
            if (materials.hasOwnProperty(materialName))
            {
                material = materials[materialName];
                meta = material.meta;
                if (meta)
                {
                    if (meta.uvTranslate || meta.uvRotate)
                    {
                        material.techniqueParameters.uvTransform = new Float32Array([1, 0, 0, 1, 0, 0]);
                    }
                }
            }
        }
    },

    _setUVRotation : function _setUVRotation(angle, uvTransform)
    {
        // Transform the uvs by translating them -0.5, rotate that and the translate back.
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var offset = 0.5;

        uvTransform[0] = cos;
        uvTransform[1] = sin;
        uvTransform[2] = -sin;
        uvTransform[3] = cos;
        uvTransform[4] = -offset * (cos - sin) + offset;
        uvTransform[5] = -offset * (sin + cos) + offset;
    },

    updateMaterials : function updateMaterials()
    {
        var scene = this.globals.scene;
        var materials = scene.materials;
        var materialName;
        var material;
        var meta, uvTransform;

        var dt = this.globals.gameTimeStep;
        var time = this.globals.gameCurrentTime;
        var angle;
        var alphaFlicker;

        for (materialName in materials)
        {
            if (materials.hasOwnProperty(materialName))
            {
                material = materials[materialName];
                meta = material.meta;
                if (meta)
                {
                    if (meta.uvTranslate)
                    {
                        uvTransform = material.techniqueParameters.uvTransform;
                        if (uvTransform)
                        {
                            uvTransform[4] += meta.uvTranslate[0] * dt;
                            uvTransform[4] = uvTransform[4] - Math.floor(uvTransform[4]);
                            uvTransform[5] += meta.uvTranslate[1] * dt;
                            uvTransform[5] = uvTransform[5] - Math.floor(uvTransform[5]);
                        }
                    }

                    if (meta.uvRotate)
                    {
                        angle = meta.uvRotate * Math.PI * 2.0 * time;
                        this._setUVRotation(angle, material.techniqueParameters.uvTransform);
                    }

                    alphaFlicker = meta.alphaFlicker;
                    if (alphaFlicker)
                    {
                        var t = ((alphaFlicker.speed * time) % 1) + ((alphaFlicker.speed * time * 3) % 1) + ((alphaFlicker.speed * time * 7) % 1);
                        t = t % 1;
                        material.techniqueParameters.materialColor[3] = alphaFlicker.min + (alphaFlicker.max - alphaFlicker.min) * t;
                    }
                }
            }
        }
    },

    // Create the device interfaces required
    createGlobals : function createGlobalsFn()
    {
        var globals                  = this.globals;
        var errorCallback            = this.errorCallback;

        var graphicsDeviceParameters = {
            depth   : false,
            stencil : false,
            vsync   : true
        };
        var graphicsDevice           = TurbulenzEngine.createGraphicsDevice(graphicsDeviceParameters);

        if (Config.debugWebGL)
        {
            this.initalizeDebugWebGL(graphicsDevice);
        }

        var mathDeviceParameters     = {};
        var mathDevice               = TurbulenzEngine.createMathDevice(mathDeviceParameters);
        VMath.applyPatches(mathDevice);

        if (VMath !== mathDevice)
        {
            debug.log("VMath !== mathDevice. Copying methods ...");

            // Transplant any extra functions we added to VMath onto
            // MathDevice, since much of the code looks them up from
            // MathDevice.  (On Mobile, VMath !== MathDevice).

            for (var m in VMath)
            {
                if (VMath.hasOwnProperty(m))
                {
                    var p = VMath[m];
                    if ((("number" === typeof p) || ("function" === typeof p)) &&
                        (!mathDevice[m]))
                    {
                        window.console.log("- '" + m + "'");
                        mathDevice[m] = p;
                    }
                }
            }
        }

        var soundDeviceParameters    = {};
        var soundDevice              = Config.disableSound ? null : TurbulenzEngine.createSoundDevice(soundDeviceParameters);

        var inputDeviceParameters    = {};
        var inputDevice              = TurbulenzEngine.createInputDevice(inputDeviceParameters);

        var requestHandler           =   this.requestHandler;

        globals.graphicsDevice       = graphicsDevice;
        globals.mathDevice           = mathDevice;
        globals.soundDevice          = soundDevice;
        globals.inputDevice          = inputDevice;

        globals.requestHandler       = requestHandler;

        globals.textureManager       = TextureManager.create(graphicsDevice, requestHandler, null, errorCallback);
        globals.soundManager         = soundDevice ? SoundManager.create(soundDevice, requestHandler, null, errorCallback) : null;
        globals.shaderManager        = ShaderManager.create(graphicsDevice, requestHandler, null, errorCallback);
        globals.effectManager        = EffectManager.create(graphicsDevice, mathDevice, globals.shaderManager, null, errorCallback);
        globals.fontManager          = FontManager.create(graphicsDevice, requestHandler, null, errorCallback);
        globals.animationManager     = AnimationManager.create();
        globals.particleManager      = ParticleManager.create(graphicsDevice, globals.textureManager, globals.shaderManager);

        var scene                    = Scene.create(mathDevice);

        scene.indexBufferManager = IndexBufferManager.create(graphicsDevice, true);
        scene.indexBufferManager.maxIndicesPerIndexBuffer *= 4;
        scene.vertexBufferManager = VertexBufferManager.create(graphicsDevice, true);
        scene.vertexBufferManager.maxVerticesPerVertexBuffer *= 4;

        var sceneLoader              = SceneLoader.create();

        globals.scene                = scene;
        globals.sceneLoader          = sceneLoader;

        var camera                   = Camera.create(mathDevice);
        camera.nearPlane             = Config.cameraNearPlane;
        camera.farPlane              = Config.cameraFarPlane;
        globals.camera               = camera;
        camera.setGlobals(globals); //Supercharge the camera!

        //Utils
        var debugDraw                = DebugDraw.createFromGlobals(globals);
        var simpleSceneLoader        = SimpleSceneLoader.create(globals);
        var simpleFontRenderer       = SimpleFontRenderer.create(globals);
        var simpleBlendStyle         = SimpleBlendStyle.create(globals);
        var simpleSpriteRenderer     = SimpleSprite.create(globals);
        var guiRenderer              = GuiRenderer.create(globals);

        globals.debugDraw              = debugDraw;
        globals.simpleSceneLoader      = simpleSceneLoader;
        globals.simpleFontRenderer     = simpleFontRenderer;
        globals.simpleBlendStyle       = simpleBlendStyle;
        globals.simpleSpriteRenderer   = simpleSpriteRenderer;
        globals.guiRenderer            = guiRenderer;

        //Dynamic UI
        globals.dynamicUI            = Config.enableDynamicUI ? DynamicUIManager.create("Debug Sliders", this.debugSliders) : null;

        // Draw2D
        globals.draw2D               = Draw2D.create({graphicsDevice : graphicsDevice});

        // SaveData
        globals.saveData             = SaveData.create();

        globals.eventBroadcast       = EventBroadcast.create();

        TWEEN.setGlobals(globals);

        return true;
    },

    // Calls functions in order
    enterCallbackChain : function enterCallbackChainFn(context, functions)
    {
        var length = functions.length;
        var localCallback;
        var callNextFunction;

        // Invariant: currentFunction always refers to the last uncalled function
        var currentFunction = -1;

        // Invariant: activeCallbacks refers to the number of functions whose callbacks have not yet been received
        var activeCallbacks = 0;

        callNextFunction = function callNextFunctionFn()
        {
            currentFunction += 1;

            if (!functions[currentFunction].noCallback)
            {
                activeCallbacks += 1;
            }

            functions[currentFunction].func.call(context, localCallback, arguments);
        };

        localCallback = function localCallbackFn()
        {
            activeCallbacks -= 1;

            // If no callbacks are left then call functions consecutively until dependent (or blocker) function is seen
            if (activeCallbacks === 0 &&
                currentFunction < (length - 1))
            {
                // No active callbacks so immediately call next function
                callNextFunction();

                // Call functions until we hit a dependent (blocking) function
                while (currentFunction < (length - 1) &&
                       ((0 === activeCallbacks) || (!functions[currentFunction].isDependent)))
                {
                    callNextFunction();
                }
            }
        };

        // Start the async callback chain
        callNextFunction();
    },

    createRenderer : function createRendererFn()
    {
        var globals = this.globals;

        globals.renderer = CartoonRendering.create(globals.graphicsDevice,
                                                   globals.mathDevice,
                                                   globals.shaderManager,
                                                   globals.effectManager,
                                                   globals.textureManager);

        globals.particleManager.initialize(globals.scene, CartoonRendering.passIndex.transparent);

        this.loadMaterials();
    },

    createRendererSliders : function createRendererSliders()
    {
        var globals = this.globals;
        var ui = globals.dynamicUI;

        if (!ui)
        {
            return;
        }

        var settingsUIGroup =   ui.addGroup('Surf-Kite', globals.uiGroups.graphics, function () {}, {collapsable: true});

        var alphaFlicker = Materials.propeller_scroll.meta.alphaFlicker;
        ui.watchVariable(
            'Propeller Scroll speed',
            alphaFlicker,
            'speed',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 60,
                step : 0.1
            });

        ui.watchVariable(
            'Propeller Scroll min',
            alphaFlicker,
            'min',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 1,
                step : 0.025
            });

        ui.watchVariable(
            'Propeller Scroll max',
            alphaFlicker,
            'max',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 1,
                step : 0.025
            });

    },

    createWaterSliders : function createWaterSliders()
    {
        var globals = this.globals;
        var ui = globals.dynamicUI;

        if (!ui)
        {
            return;
        }
        var settingsUIGroup =   ui.addGroup('Water', globals.uiGroups.graphics, function () {}, {collapsable: true});
        this.createWaterSlidersGroup(settingsUIGroup, 'normal');

        ui.addSlider('wakeScrollSpeed', function ()
            {
                return Materials.gargantia_Fleet_wake.meta.uvTranslate[1];
            }, function (v)
            {
                Materials.gargantia_Fleet_wake.meta.uvTranslate[1] = v;
            }, settingsUIGroup, {
                min : -0.5,
                max : 0,
                step : 0.01
            });
    },

    createWaterSlidersGroup : function createWaterSlidersGroup(settingsUIGroup, name)
    {
        var globals = this.globals;
        var ui = globals.dynamicUI;

        var parameteres = Water[name];

        ui.watchVariable(
            'gain',
            parameteres,
            'gain',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 2,
                step : 0.025
            });

        ui.addColorPicker('Bright', function () {
            return parameteres.colorBright;
        }, function (value) {
            parameteres.colorBright = value;
        }, settingsUIGroup);

        ui.addColorPicker('Dark', function () {
            return parameteres.colorDark;
        }, function (value) {
            parameteres.colorDark = value;
        }, settingsUIGroup);

        ui.watchVariable(
            'waveFrequency',
            parameteres,
            'waveFrequency',
            'slider',
            settingsUIGroup,
            {
                min : 1,
                max : 1000,
                step : 10
            });

        ui.watchVariable(
            'waveScale',
            parameteres,
            'waveScale',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 5,
                step : 0.1
            });

        ui.watchVariable(
            'speedScale',
            parameteres,
            'speedScale',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 3,
                step : 0.05
            });

        ui.watchVariable(
            'specularPower',
            parameteres,
            'specularPower',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 30,
                step : 0.1
            });

        ui.watchVariable(
            'specularScale',
            parameteres,
            'specularScale',
            'slider',
            settingsUIGroup,
            {
                min : 0,
                max : 5,
                step : 0.05
            });

        ui.addColorPicker('trailColor', function () {
            return parameteres.trailColor;
        }, function (v) {
            parameteres.trailColor = v;
        },
        settingsUIGroup);
    },


    // Creates the game with the settings provided
    createGame : function createGameFn()
    {
        var globals = this.globals;
        var gameParameters =
        {
            globals : globals,
            useSplashScreens : this.useSplashScreens,
            startUpLevelPath : this.startUpLevelPath,
            versionNumber : this.version
        };

        var gameManager = GameManager.create(gameParameters);

        this.globals.gameManager    =   gameManager;

        this.gameManager = gameManager;
    },

    createGlobalEditorSliders : function createGlobalEditorSlidersFn()
    {
        var globals = this.globals;
        var ui = globals.dynamicUI;

        if (ui)
        {
            globals.editorUIGroupId = ui.addGroup('Editor Mode Active');
        }
    },

    createGlobalSettingSliders : function createGlobalsSettingSlidersFn()
    {
        var globals         =   this.globals;
        var ui              =   globals.dynamicUI;
        if (!ui)
        {
            return;
        }

        globals.uiGroups = {};
        globals.uiGroups.settings = ui.addGroup('Game Settings');
        globals.uiGroups.graphics = ui.addGroup('Graphics');
        globals.uiGroups.debug = ui.addGroup('Debug', null, function () {}, {collapsable: true});

        var settingsUIGroup = globals.uiGroups.debug;
        var settings        =   this.globals.settings;

        ui.watchVariable(
            'Show Update Info',
            this,
            'debugUpdate',
            'checkbox',
            settingsUIGroup);

        ui.watchVariable(
            'Show Render Info',
            this,
            'debugRender',
            'checkbox',
            settingsUIGroup);

        ui.watchVariable(
            'Perform Game Updates',
            this,
            'debugDoUpdate',
            'checkbox',
            settingsUIGroup);

        this.initDebugDrawFlagsUI();
    },

    initDebugDrawFlagsUI : function initDebugDrawFlagsUIFn()
    {
        var globals               = this.globals;
        var ui                    = globals.dynamicUI;
        var debugDrawFlagsUIGroup = ui.addGroup('Scene Debugging', globals.uiGroups.debug);
        var debugRenderBufferUIGroup = ui.addGroup('Render Buffer', globals.uiGroups.debug);
        var debugDrawFlags        = this.globals.debugDrawFlags;

        var flagName;

        globals.debugDrawFlagsUIGroup = debugDrawFlagsUIGroup;

        for (flagName in debugDrawFlags)
        {
            if (debugDrawFlags.hasOwnProperty(flagName))
            {
                ui.watchVariable(flagName,
                                 debugDrawFlags,
                                 flagName,
                                 'checkbox',
                                 debugDrawFlagsUIGroup);
            }
        }

        ui.watchVariable(
            'Use Render buffer',
            this,
            'useRenderBuffer',
            'checkbox',
            debugRenderBufferUIGroup);

        var bufferSliderParams =
        {
            min : 16,
            max : 2000,
            step : 16
        };

        ui.watchVariable(
            'Width',
            this,
            'renderBufferWidth',
            'slider',
            debugRenderBufferUIGroup,
            bufferSliderParams);

        ui.watchVariable(
            'Height',
            this,
            'renderBufferHeight',
            'slider',
            debugRenderBufferUIGroup,
            bufferSliderParams);
    },

    initSinglePlayerGame : function initSinglePlayerGameFn()
    {
        this.gameManager.initialise(0);
    },

    // Create mapping table
    createMappingTable : function createMappingTableFn(callback)
    {
        this.mappingTable = TurbulenzServices.createMappingTable(this.requestHandler, this.gameSession, callback);
    },

    assignMappingTable : function assignMappingTableFn()
    {
        var globals      = this.globals;
        var mappingTable = this.mappingTable;
        var urlMapping   = mappingTable.urlMapping;
        var assetPrefix  = mappingTable.assetPrefix;

        globals.textureManager.setPathRemapping(urlMapping, assetPrefix);
        if (globals.soundManager)
        {
            globals.soundManager.setPathRemapping(urlMapping, assetPrefix);
        }
        globals.shaderManager.setPathRemapping(urlMapping, assetPrefix);
        globals.fontManager.setPathRemapping(urlMapping, assetPrefix);

        globals.sceneLoader.setPathRemapping(urlMapping, assetPrefix);
        globals.simpleSceneLoader.setPathRemapping(urlMapping, assetPrefix);
//        globals.languageManager.setPathRemapping(urlMapping, assetPrefix);

        globals.simpleFontRenderer.preload();
        GargLoadingScreen.preload(globals);
        globals.simpleBlendStyle.preload();

        globals.textureManager.load("textures/contrails.dds");
        globals.shaderManager.load("shaders/contrails.cgfx");

        globals.mappingTable = mappingTable;
    },

    onAssetRequest : function onAssetRequestFn()
    {
        this.numberOfAssetRequests += 1;
    },

    getNumberOfAssetRequests : function getNumberOfAssetRequestsFn()
    {
        return this.numberOfAssetRequests;
    },

    // Starts loading scene and creates an interval to check loading progress
    enterLoadingLoop : function enterLoadingLoopFn()
    {
        var globals =   this.globals;

        // Start loading game assets
        this.gameManager.preload();

        if (this.useLoadingBar)
        {
            // Now set the asset tracker to have the correct total and remove the associated event listener
            this.assetTracker.setNumberAssetsToLoad(this.getNumberOfAssetRequests());

            this.loadingScreen = new GargLoadingScreen(globals, this.assetTracker);

            this.drawLoadingScreen();
        }

        this.intervalID = TurbulenzEngine.setInterval(this.loadingStateLoop.bind(this), 100);
        this.intervalID2 = TurbulenzEngine.setInterval(this.loadingStateInputLoop.bind(this), 1000 / this.fps);
    },

    loadingStateInputLoop : function loadingStateInputLoopFn()
    {
        // for game pad 'mouse' movement
        this.globals.inputDevice.update();
        this.gameManager.gameController.update();
        this.drawLoadingScreen();
    },

    // Called until assets have been loaded at which point the connecting loop is entered
    loadingStateLoop : function loadingStateLoopFn()
    {
        var loadingProgressAchieved =   false;
        // Update request total due to secondary requests (e.g. model load causes a texture to be loaded etc.)
        this.assetTracker.setNumberAssetsToLoad(this.getNumberOfAssetRequests() +
                                                this.globals.simpleSceneLoader.loadingAssetCounter);
        loadingProgressAchieved = this.assetTracker.getLoadingProgress() >= 1.0;

        var eventBroadcast = this.globals.eventBroadcast;
        if (eventBroadcast)
        {
            var assetTracker = this.assetTracker;
            if (assetTracker)
            {
                var progress = assetTracker.getLoadedCount() / assetTracker.getNumberAssetsToLoad();

                eventBroadcast.loadingProgress(progress);
            }
        }

        // debug.info('Loaded: ' +
        //                   this.assetTracker.getLoadedCount() + '/' + this.assetTracker.getNumberAssetsToLoad());

        // We need two consecutive frames of load complete (as there can be 0 timeouts which load secondary assets after this interval)
        if (loadingProgressAchieved)
        {
            this.numberOfFramesWithNoAssetRequests += 1;
        }
        else
        {
            this.numberOfFramesWithNoAssetRequests = 0;
        }

        var logosFinished = this.drawLoadingScreen();

        // If everything has finished loading/initialising
        if (logosFinished &&
            this.globals.shaderManager.getNumPendingShaders() === 0 &&
            this.numberOfFramesWithNoAssetRequests > 2 &&
            this.hasUILoaded() &&
            this.globals.simpleSceneLoader.isLoading() === false)
        {
            if (this.useLoadingBar)
            {
                this.useLoadingBar = false;
                this.loadingScreen = null;
            }


            this.globals.requestHandler.removeEventListener('eventOnRequestMade', this.onAssetRequestBound);

            this.globals.renderer.updateShader(this.globals.shaderManager);
            this.globals.gameManager.cloudManager.init();

            TurbulenzEngine.clearInterval(this.intervalID);
            TurbulenzEngine.clearInterval(this.intervalID2);

            this.log("Beginning Session...");

            this.initSinglePlayerGame();

            this.intervalID = TurbulenzEngine.setInterval(this.mainStateLoop.bind(this), 1000 / this.fps);

            this.globals.appFPS = this.fps;
            this.globals.appTimeStep = 1 / this.fps;
            this.globals.appMaxTimeSteps = 5;
            this.gameManager.postload();
        }
    },

    // Return true if loading screen has presented everything is need
    // to.
    drawLoadingScreen : function drawLoadingScreenFn()
    {
        var globals = this.globals;
        var graphicsDevice = globals.graphicsDevice;
        var finished = false;

        if (graphicsDevice.beginFrame())
        {
            graphicsDevice.clear(globals.clearColor);

            finished = this.loadingScreen.render();

            this.drawPadCursor();

            graphicsDevice.endFrame();
        }

        return finished;
    },

    mainStateLoop : function mainStateLoopFn()
    {
        Profile.start('mainLoop');

        // Update
        Profile.start('Update - Main');
        var gameState = this.gameManager.getActiveGameState();
        if (this.debugDoUpdate || gameState.name === GamestateEditor.prototype.name)
        {
            this.update();
        }
        Profile.stop('Update - Main');

        // Render
        Profile.start('Render - Main');
        this.render();
        Profile.stop('Render - Main');

        Profile.stop('mainLoop');

        //Every second, reset the profile.
        if (TurbulenzEngine.time > this.profilerTime + 1.0)
        {
            Profile.resetAndStore();
            this.profilerTime   =   TurbulenzEngine.time;
        }
    },

    // Attempts to free memory - called from onbeforeunload and/or TurbulenzEngine.onUnload
    shutdown : function shutdownFn()
    {
        if (!this.hasShutdown)
        {
            this.hasShutdown            = true;

            TurbulenzEngine.clearInterval(this.intervalID);

            this.gameManager.destroy();
            this.globals.gameManager    = null;
            this.gameManager            = null;

            // Tell the Turbulenz Services that the game session is over
            this.gameSession.destroy();
            this.gameSession            = null;

            // Destroy vars in reverse order from creation
            this.technique2Dparameters  = null;
            this.technique2D            = null;
            this.font                   = null;

            // Clear native engine references
            this.globals.destroy();
            this.globals                = null;

            this.requestHandler.destroy();
            this.requestHandler = null;

            // Attempt to force clearing of the garbage collector
            TurbulenzEngine.flush();
        }
    }
};

// Application constructor function
Application.create = function applicationCreateFn()
{
    var application = new Application();

    if ('undefined' !== typeof debug)
    {
        debug.reportAssert = function debugReportAssertFn(msg)
        {
            if (window.console)
            {
                window.console.log(msg);

                if ('undefined' !== typeof Error)
                {
                    var getStackTrace = function debugReportAssertGetStackTraceFn()
                    {
                        var obj = {};
                        Error.captureStackTrace(obj, getStackTrace);

                        return obj.stack;
                    };

                    if (Error.captureStackTrace)
                    {
                        window.console.log(getStackTrace());
                    }
                }
            }
            /*jslint debug: true*/
            debugger;
            /*jslint debug: false*/
        };
    }

    // Ensures shutdown function is only called once
    application.hasShutDown                         = false;

    application.gameSession                         = {};

    application.gameManager                         = {};
    application.globals                             = Globals.create();

    application.globals.allowCheats                 = Config.cheats || Config.profiling;
    if (!application.globals.allowCheats && "undefined" !== typeof window)
    {
        var checkCheats = function checkCheatsFn(windowObj)
        {
            if (windowObj)
            {
                var loc = windowObj.location;
                if (loc)
                {
                    var href = loc.href;
                    if (href)
                    {
                        var idx = href.indexOf("?code=");
                        if (-1 !== idx)
                        {
                            return ("godmode" ===
                                    href.substring(idx + 6, idx + 6 + 7));
                        }
                        idx = href.indexOf("?cheatkey=");
                        if (-1 !== idx)
                        {
                            return ("gam3chang3r" ===
                                    href.substring(idx + 10, idx + 10 + 11));
                        }
                    }
                }
            }
            return false;
        };

        var w = window;
        if (checkCheats(w) || checkCheats(w.parent))
        {
            application.globals.allowCheats = true;
        }
    }

    application.globals.enableEditor                = Config.enableEditor;

    // UI
    application.font                                = null;
    application.technique2D                         = null;
    application.technique2Dparameters               = null;

    application.fps                                 = Config.targetFPS;
    application.profilerTime                        = 0;

    application.goodRenderUpdateTime                = (1000 / application.fps) * 0.25;
    application.badRenderUpdateTime                 = application.goodRenderUpdateTime * 1.5;

    application.useLoadingBar                       = Config.useLoadingBar;

    application.debugMessages                       = Config.debugText;
    application.debugUpdate                         = Config.debugUpdate;
    application.debugRender                         = Config.debugRender;
    application.debugSliders                        = Config.debugSliders;

    application.debugDoUpdate                       = true;

    application.useSplashScreens                    = Config.useSplashScreens;

    application.version                             = Config.version;
    application.saveVersion                         = Config.saveVersion;

    application.startUpLevelPath                    = Config.startUpLevelPath;

    application.lineStep                            = 15;

    // Used by the loading bar and asset tracker
    application.numberOfAssetRequests               = 0;
    application.onAssetRequestBound                 = application.onAssetRequest.bind(application);
    application.numberOfFramesWithNoAssetRequests   = 0;

    application.useRenderBuffer                     = Config.useRenderBuffer;
    application.renderBufferCopyOperationOverride   = undefined;  // work around for not being able to initalize it
    application.renderBufferWidth               = Config.renderBufferWidth;
    application.renderBufferHeight              = Config.renderBufferHeight;

    application.drawDebugCallback = function drawDebugFn()
    {
        application.drawDebug();
    };

    application.drawExtraDecalsCallback = function drawExtraDecalsFn()
    {
        application.drawExtraDecals();
    };

    application.drawExtraTransparentCallback = function drawExtraDecalsFn()
    {
        application.drawExtraTransparent();
    };

    return application;
};
