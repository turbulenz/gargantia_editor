// Copyright (c) 2014 Turbulenz Limited
;

;

var CartoonRendering = (function () {
    function CartoonRendering() {
        this.waterWaveFrequency = 311.0;
        this.waterWaveScale = 2.2;
        this.waterLayer1OffsetX = 0.1;
        this.waterLayer1OffsetZ = 0.2;
        this.waterLayer2OffsetX = 0.3;
        this.waterLayer2OffsetZ = 0.4;
        this.waterLayer0SpeedScaleX = 0.015;
        this.waterLayer1SpeedScaleX = 0.015;
        this.waterLayer1SpeedScaleZ = 0.002;
        this.waterLayer2SpeedScaleX = 0.005;
        this.waterLayer2SpeedScaleZ = 0.028;
        this.waterSpeedScale = 1.0;
        this.waterPlane = new Float32Array([0.0, 1.0, 0.0, 0.0]);
    }
    CartoonRendering.prototype.updateShader = function (shaderManager) {
        var shader = shaderManager.get("shaders/silhouette.cgfx");
        if (shader !== this.silhouetteShader) {
            this.silhouetteShader = shader;
            this.silhouetteRigidTechnique = shader.getTechnique("rigid");
            this.silhouetteSkinnedTechnique = shader.getTechnique("skinned");
            this.silhouetteRigidNoCullTechnique = shader.getTechnique("rigid_nocull");
            this.silhouetteSkinnedNoCullTechnique = shader.getTechnique("skinned_nocull");
            this.silhouetteBirdTechnique = shader.getTechnique("bird");

            this.mixTechnique = shader.getTechnique("mix");
        }

        shader = shaderManager.get("shaders/water.cgfx");
        if (shader !== this.waterShader) {
            this.waterShader = shader;
            this.waterTechnique = shader.getTechnique("water");
        }

        shader = shaderManager.get("shaders/sky.cgfx");
        if (shader !== this.skyShader) {
            this.skyShader = shader;
            this.skyTechnique = shader.getTechnique("sky");
        }

        shader = shaderManager.get("shaders/cartoonrendering.cgfx");
        if (shader !== this.postEffectsShader) {
            this.postEffectsShader = shader;
            this.copyTechnique = shader.getTechnique("copy");
        }

        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            shadowMaps.updateShader(shaderManager);
        }
    };

    CartoonRendering.prototype._initializeNodeForRenderer = function (node) {
        var md = this.md;

        var worldNode = node;
        while (!worldNode.local && worldNode.parent) {
            worldNode = worldNode.parent;
        }

        var rendererInfo = worldNode.rendererInfo;
        if (!rendererInfo) {
            rendererInfo = {
                id: CartoonRendering.nextRenderinfoID,
                frameUpdated: -1,
                worldView: md.m43BuildIdentity(),
                worldViewInverseTranspose: md.m33BuildIdentity(),
                techniqueParameters: null,
                shadowTechniqueParameters: null
            };

            CartoonRendering.nextRenderinfoID += 1;

            if (node !== worldNode) {
                worldNode.rendererInfo = rendererInfo;
            }
        }

        node.rendererInfo = rendererInfo;

        var renderables = node.renderables;
        debug.assert(!!renderables);

        var numRenderables = renderables.length;
        var r;
        for (r = 0; r < numRenderables; r += 1) {
            var renderable = renderables[r];
            if (!renderable.renderUpdate) {
                var sharedMaterial = renderable.sharedMaterial;
                var renderableRenderInfo = {
                    far: sharedMaterial.meta.far || false,
                    shadowMappingFullyVisible: -1,
                    shadowMappingUpdate: null
                };
                renderable.rendererInfo = renderableRenderInfo;

                var effect = sharedMaterial.effect;
                debug.assert(effect.prepare);
                effect.prepare(renderable);

                // Force extents to be calculated
                renderable.getWorldExtents();
            }
        }

        return rendererInfo;
    };

    CartoonRendering.prototype._updateAllNodes = function (nodes, viewMatrix, frameIndex) {
        var numNodes = nodes.length;
        var md = this.md;
        var n;
        for (n = 0; n < numNodes; n += 1) {
            var node = nodes[n];

            if (node.renderables) {
                var rendererInfo = node.rendererInfo;
                if (!rendererInfo) {
                    rendererInfo = this._initializeNodeForRenderer(node);
                }

                if (node.frameVisible === frameIndex) {
                    if (rendererInfo.frameUpdated !== frameIndex) {
                        rendererInfo.frameUpdated = frameIndex;
                        var worldView = md.m43Mul(node.world, viewMatrix, rendererInfo.worldView);

                        md.m33InverseTranspose(worldView, rendererInfo.worldViewInverseTranspose);
                    }
                }
            }

            if (node.children) {
                this._updateAllNodes(node.children, viewMatrix, frameIndex);
            }
        }
    };

    CartoonRendering.prototype._updateVisibleNodes = function (nodes, viewMatrix, frameIndex) {
        var numNodes = nodes.length;
        var md = this.md;
        var n;
        for (n = 0; n < numNodes; n += 1) {
            var node = nodes[n];
            if (node.renderables) {
                var rendererInfo = node.rendererInfo;
                if (!rendererInfo) {
                    rendererInfo = this._initializeNodeForRenderer(node);
                }

                if (rendererInfo.frameUpdated !== frameIndex) {
                    rendererInfo.frameUpdated = frameIndex;
                    var worldView = md.m43Mul(node.world, viewMatrix, rendererInfo.worldView);

                    md.m33InverseTranspose(worldView, rendererInfo.worldViewInverseTranspose);
                }
            }
        }
    };

    CartoonRendering.prototype.updateRenderables = function (camera, scene) {
        var passesIndex = CartoonRendering.passIndex;
        var silhouette = passesIndex.silhouette;
        var background = passesIndex.background;
        var foreground = passesIndex.foreground;
        var decal = passesIndex.decal;
        var transparent = passesIndex.transparent;

        var defaultUpdateFn = this.defaultUpdateFn;

        var passes = this.passes;
        var silhouettePass = passes[silhouette];
        var backPass = passes[background];
        var forePass = passes[foreground];
        var decalPass = passes[decal];
        var transparentPass = passes[transparent];

        var numSilhouette = 0;
        var numBack = 0;
        var numFore = 0;
        var numDecal = 0;
        var numTransparent = 0;

        var drawParametersArray;
        var numDrawParameters;
        var drawParameters;
        var drawParametersIndex;

        var visibleRenderables = scene.getCurrentVisibleRenderables();
        var numVisibleRenderables = visibleRenderables.length;
        if (numVisibleRenderables > 0) {
            var renderable, pass, passIndex;
            var n = 0;
            do {
                renderable = visibleRenderables[n];

                if (defaultUpdateFn !== renderable.renderUpdate) {
                    renderable.renderUpdate(camera);
                }

                drawParametersArray = renderable.drawParameters;
                numDrawParameters = drawParametersArray.length;
                for (drawParametersIndex = 0; drawParametersIndex < numDrawParameters; drawParametersIndex += 1) {
                    drawParameters = drawParametersArray[drawParametersIndex];
                    passIndex = drawParameters.userData.passIndex;
                    if (passIndex === background) {
                        backPass[numBack] = drawParameters;
                        numBack += 1;
                    } else if (passIndex === foreground) {
                        forePass[numFore] = drawParameters;
                        numFore += 1;
                    } else if (passIndex === silhouette) {
                        silhouettePass[numSilhouette] = drawParameters;
                        numSilhouette += 1;
                    } else if (passIndex === transparent) {
                        if (renderable.sharedMaterial.meta.far) {
                            drawParameters.sortKey = 1.e38;
                        } else {
                            drawParameters.sortKey = renderable.distance;
                        }

                        transparentPass[numTransparent] = drawParameters;
                        numTransparent += 1;
                    } else if (passIndex === decal) {
                        decalPass[numDecal] = drawParameters;
                        numDecal += 1;
                    }
                }

                // this renderer does not care about lights
                n += 1;
            } while(n < numVisibleRenderables);
        }

        silhouettePass.length = numSilhouette;
        backPass.length = numBack;
        forePass.length = numFore;
        decalPass.length = numDecal;
        transparentPass.length = numTransparent;
    };

    CartoonRendering.prototype._setWaterVertex = function (x, z, time, data, n) {
        data[n] = x;
        data[n + 1] = z;
        data[n + 2] = (x * (1.0 / (4.0 * this.waterWaveFrequency))) + (time * this.waterLayer0SpeedScaleX * this.waterSpeedScale);
        data[n + 3] = (z * (1.0 / (4.0 * this.waterWaveFrequency * this.waterWaveScale)));
        data[n + 4] = this.waterLayer1OffsetX + (z * (1.0 / (2.0 * this.waterWaveFrequency)) + (time * this.waterLayer1SpeedScaleX * this.waterSpeedScale));
        data[n + 5] = this.waterLayer1OffsetZ + (x * (1.0 / (2.0 * this.waterWaveFrequency)) + (time * this.waterLayer1SpeedScaleZ * this.waterSpeedScale));
        data[n + 6] = this.waterLayer2OffsetX + (z * (1.0 / this.waterWaveFrequency) + (time * this.waterLayer2SpeedScaleX * this.waterSpeedScale));
        data[n + 7] = this.waterLayer2OffsetZ + (x * (1.0 / this.waterWaveFrequency) + (time * this.waterLayer2SpeedScaleZ * this.waterSpeedScale));
    };

    CartoonRendering.prototype._updateSkyWaterBuffer = function (camera, currentTime) {
        var frustumPoints = camera.getFrustumPoints(camera.farPlane, camera.nearPlane, this.frustumPoints);

        // Bounding box for the water quad
        var frustumPoint = frustumPoints[0];
        var frustumMinX = Math.floor(frustumPoint[0]);
        var frustumMinY = Math.floor(frustumPoint[1]);
        var frustumMinZ = Math.floor(frustumPoint[2]);
        var frustumMaxX = Math.ceil(frustumPoint[0]);
        var frustumMaxZ = Math.ceil(frustumPoint[2]);
        var i;
        for (i = 1; i < 8; i += 1) {
            frustumPoint = frustumPoints[i];
            var p0 = frustumPoint[0];
            var p1 = frustumPoint[1];
            var p2 = frustumPoint[2];
            if (frustumMinX > p0) {
                frustumMinX = Math.floor(p0);
            } else if (frustumMaxX < p0) {
                frustumMaxX = Math.ceil(p0);
            }
            if (frustumMinY > p1) {
                frustumMinY = Math.floor(p1);
            }
            if (frustumMinZ > p2) {
                frustumMinZ = Math.floor(p2);
            } else if (frustumMaxZ < p2) {
                frustumMaxZ = Math.ceil(p2);
            }
        }

        var data;
        if (frustumMinY < 0.0) {
            this.doRenderWater = true;

            data = this.waterVertexData;

            var time = (currentTime % 1000);
            this._setWaterVertex(frustumMinX, frustumMinZ, time, data, 0);
            this._setWaterVertex(frustumMaxX, frustumMinZ, time, data, 8);
            this._setWaterVertex(frustumMinX, frustumMaxZ, time, data, 2 * 8);
            this._setWaterVertex(frustumMaxX, frustumMaxZ, time, data, 3 * 8);

            this.waterVertexBuffer.setData(data, 0, 4);
        } else {
            this.doRenderWater = false;
        }

        // Bounding box for the sky quad
        var minX = 1;
        var minY = 1;
        var maxX = -1;
        var maxY = -1;

        function addPoint(x, y) {
            if (minX > x) {
                minX = x;
            }
            if (maxX < x) {
                maxX = x;
            }
            if (minY > y) {
                minY = y;
            }
            if (maxY < y) {
                maxY = y;
            }
        }

        if (this.doRenderWater) {
            var m = camera.viewProjectionMatrix;
            var farPlane = camera.farPlane;
            var frustumPointsCoords = CartoonRendering.frustumPointsCoords;
            for (i = 0; i < 4; i += 1) {
                var is = i;
                var ie = ((i + 1) % 4);
                var s = frustumPoints[is + 4];
                var e = frustumPoints[ie + 4];
                if (0 <= s[1]) {
                    var cs = frustumPointsCoords[is];
                    addPoint(cs[0], cs[1]);
                }
                if (0 <= e[1]) {
                    var ce = frustumPointsCoords[ie];
                    addPoint(ce[0], ce[1]);
                }
                if ((s[1] * e[1]) < 0) {
                    var d0 = (e[0] - s[0]);
                    var d1 = (e[1] - s[1]);
                    var d2 = (e[2] - s[2]);
                    var t = (-s[1] / d1);
                    var i0 = s[0] + (t * d0);
                    var i1 = s[1] + (t * d1);
                    var i2 = s[2] + (t * d2);
                    var scr0 = ((m[0] * i0) + (m[4] * i1) + (m[8] * i2) + m[12]);
                    var scr1 = ((m[1] * i0) + (m[5] * i1) + (m[9] * i2) + m[13]);
                    addPoint(scr0 / farPlane, scr1 / farPlane);
                }
            }
        } else {
            minX = -1;
            minY = -1;
            maxX = 1;
            maxY = 1;
        }

        if (minX < maxX && minY < maxY) {
            this.doRenderSky = true;

            data = this.skyVertexData;
            data[0] = minX;
            data[1] = maxY;
            data[2] = maxX;
            data[3] = maxY;
            data[4] = minX;
            data[5] = minY;
            data[6] = maxX;
            data[7] = minY;
            this.skyVertexBuffer.setData(data, 0, 4);
        } else {
            this.doRenderSky = false;
        }
    };

    CartoonRendering.prototype._updateShadows = function (camera, scene) {
        // find far plane collision with water (assumed water is at height 0.0)
        var maxShadowDistance = 0;
        var cameraMatrix = camera.matrix;
        var ax = -cameraMatrix[6];
        var ay = -cameraMatrix[7];
        var az = -cameraMatrix[8];
        var sx = cameraMatrix[9];
        var sy = cameraMatrix[10];
        var sz = cameraMatrix[11];
        var maxFarPlane = Math.min(3000, camera.farPlane);
        if (0.0 < sy) {
            var frustumFarPoints = camera.getFrustumFarPoints(maxFarPlane, this.frustumPoints);
            var n;
            for (n = 0; n < 4; n += 1) {
                var e = frustumFarPoints[n];
                var ey = e[1];
                if (ey < 0.0) {
                    var t = (-sy / (ey - sy));
                    var dx = t * (e[0] - sx);
                    var dz = t * (e[2] - sz);
                    maxShadowDistance = Math.max(maxShadowDistance, ((dx * ax) + (-sy * ay) + (dz * az)));
                } else {
                    maxShadowDistance = maxFarPlane;
                    break;
                }
            }
        } else {
            maxShadowDistance = maxFarPlane;
        }

        this.shadowMaps.updateShadowMap(this.lightDirection, camera, scene, Math.ceil(maxShadowDistance), this.waterPlane);
    };

    CartoonRendering.prototype.update = function (gd, camera, scene, currentTime) {
        scene.updateVisibleNodes(camera);

        var viewMatrix = camera.viewMatrix;

        if (this.doUpdateAllNodes) {
            this.doUpdateAllNodes = false;
            this._updateAllNodes(scene.rootNodes, viewMatrix, (scene.frameIndex - 1));
        } else {
            this._updateVisibleNodes(scene.visibleNodes, viewMatrix, (scene.frameIndex - 1));
        }

        this.updateRenderables(camera, scene);
        this.sortPassArrays();

        this._updateSkyWaterBuffer(camera, currentTime);

        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            this._updateShadows(camera, scene);
        }

        var projection = camera.projectionMatrix;
        var invCameraFar = (1.0 / camera.farPlane);

        var md = this.md;
        var globalTechniqueParameters = this.globalTechniqueParameters;
        globalTechniqueParameters['time'] = currentTime;
        globalTechniqueParameters['projection'] = projection;
        md.m43Transpose(camera.matrix, globalTechniqueParameters['viewInverseTranspose']);
        md.m43TransformVector(viewMatrix, this.lightDirection, globalTechniqueParameters['lightDirection']);
        globalTechniqueParameters['fogColor'] = this.fogColor;
        globalTechniqueParameters['invCameraFar'] = invCameraFar;

        var silhouetteTechniqueParameters = this.silhouetteTechniqueParameters;
        silhouetteTechniqueParameters['projection'] = projection;

        var viewDepth = silhouetteTechniqueParameters['viewDepth'];
        var invMaxDistance = 1.0 / Math.min(scene.maxDistance, camera.farPlane);
        viewDepth[0] = -invMaxDistance;
        viewDepth[1] = -(camera.nearPlane * invMaxDistance);

        silhouetteTechniqueParameters['time'] = currentTime;

        var waterTechniqueParameters = this.waterTechniqueParameters;
        waterTechniqueParameters['projection'] = projection;
        waterTechniqueParameters['worldView'] = viewMatrix;
        waterTechniqueParameters['worldViewInverseTranspose'] = viewMatrix;
        waterTechniqueParameters['lightDirection'] = globalTechniqueParameters['lightDirection'];
        waterTechniqueParameters['fogColor'] = this.fogColor;
        waterTechniqueParameters['invCameraFar'] = invCameraFar;

        var skyTechniqueParameters = this.skyTechniqueParameters;
        skyTechniqueParameters['fogColor'] = this.fogColor;
        skyTechniqueParameters['skyColor'] = this.skyColor;

        var viewOffsetX = camera.viewOffsetX;
        var viewOffsetY = camera.viewOffsetY;
        var viewWindowX = 1.0 / camera.recipViewWindowX;
        var viewWindowY = 1.0 / (camera.recipViewWindowY * camera.aspectRatio);
        var cameraMatrix = camera.matrix;
        var co0 = ((cameraMatrix[0] * viewOffsetX) + (cameraMatrix[3] * viewOffsetY));
        var co1 = ((cameraMatrix[1] * viewOffsetX) + (cameraMatrix[4] * viewOffsetY));
        var co2 = ((cameraMatrix[2] * viewOffsetX) + (cameraMatrix[5] * viewOffsetY));
        md.v3Build((cameraMatrix[0] * viewWindowX), (cameraMatrix[1] * viewWindowX), (cameraMatrix[2] * viewWindowX), skyTechniqueParameters['cameraRight']);
        md.v3Build((cameraMatrix[3] * viewWindowY), (cameraMatrix[4] * viewWindowY), (cameraMatrix[5] * viewWindowY), skyTechniqueParameters['cameraUp']);
        md.v3Build((co0 - cameraMatrix[6]), (co1 - cameraMatrix[7]), (co2 - cameraMatrix[8]), skyTechniqueParameters['cameraAt']);
        md.v3Build((cameraMatrix[9] + co0), (cameraMatrix[10] + co1), (cameraMatrix[11] + co2), skyTechniqueParameters['cameraPos']);
        skyTechniqueParameters['time'] = currentTime;

        this.camera = camera;
        this.scene = scene;
    };

    CartoonRendering.prototype.updateBuffers = function (gd, deviceWidth, deviceHeight) {
        if (this.bufferWidth === deviceWidth && this.bufferHeight === deviceHeight) {
            return true;
        }

        this.destroyBuffers();

        this.silhouetteTexture = gd.createTexture({
            name: "silhouette",
            width: deviceWidth,
            height: deviceHeight,
            format: "R8G8B8A8",
            mipmaps: false,
            renderable: true
        });

        this.colorTexture = gd.createTexture({
            name: "color",
            width: deviceWidth,
            height: deviceHeight,
            format: "R8G8B8A8",
            mipmaps: false,
            renderable: true
        });

        this.finalTexture = gd.createTexture({
            name: "final",
            width: deviceWidth,
            height: deviceHeight,
            format: "R8G8B8A8",
            mipmaps: false,
            renderable: true
        });

        this.depthBuffer = gd.createRenderBuffer({
            width: deviceWidth,
            height: deviceHeight,
            format: "D24S8"
        });

        if (this.colorTexture && this.silhouetteTexture && this.depthBuffer) {
            this.silhouetteRenderTarget = gd.createRenderTarget({
                colorTexture0: this.silhouetteTexture,
                depthBuffer: this.depthBuffer
            });

            this.colorRenderTarget = gd.createRenderTarget({
                colorTexture0: this.colorTexture,
                depthBuffer: this.depthBuffer
            });

            this.transparentRenderTarget = gd.createRenderTarget({
                colorTexture0: this.finalTexture,
                depthBuffer: this.depthBuffer
            });

            if (this.colorRenderTarget && this.silhouetteRenderTarget && this.transparentRenderTarget) {
                this.bufferWidth = deviceWidth;
                this.bufferHeight = deviceHeight;
                this.mixTechniqueParameters['colorTexture'] = this.colorTexture;
                this.mixTechniqueParameters['silhouetteTexture'] = this.silhouetteTexture;
                this.mixTechniqueParameters['pixelOffset'] = new Float32Array([
                    1 / this.colorTexture.width,
                    1 / this.colorTexture.height
                ]);
                this.copyTechniqueParameters['colorTexture'] = this.finalTexture;

                if (!this.noiseTexture) {
                    this.noiseTexture = this.createNoiseTexture(gd, this.md, 1024);
                    this.waterTechniqueParameters['noiseTexture'] = this.noiseTexture;
                }

                return true;
            }
        }

        this.bufferWidth = 0;
        this.bufferHeight = 0;
        this.destroyBuffers();
        return false;
    };

    CartoonRendering.prototype._updateShadowMaps = function () {
        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            shadowMaps.drawShadowMap();
            //shadowMaps.blurShadowMap();
        }
    };

    CartoonRendering.prototype.encodeNormal = function (normal, dest) {
        var p = Math.sqrt((normal[2]) * 8.0 + 8.0);
        dest[0] = (((normal[0]) / p) + 0.5);
        dest[1] = (((normal[1]) / p) + 0.5);
    };

    CartoonRendering.prototype.filterSceneData = function (sceneData) {
        var p, r;

        if (this.mainShader) {
            var validParameterNames = this.mainShaderParameterNames;
            var parameters;

            var effects = sceneData.effects;
            if (effects) {
                for (p in effects) {
                    if (effects.hasOwnProperty(p)) {
                        parameters = effects[p].parameters;
                        if (parameters) {
                            for (r in parameters) {
                                if (parameters.hasOwnProperty(r)) {
                                    if (!validParameterNames[r]) {
                                        delete parameters[r];
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var materials = sceneData.materials;
            if (materials) {
                for (p in materials) {
                    if (materials.hasOwnProperty(p)) {
                        parameters = materials[p].parameters;
                        if (parameters) {
                            for (r in parameters) {
                                if (parameters.hasOwnProperty(r)) {
                                    if (!validParameterNames[r]) {
                                        delete parameters[r];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            this.doPurgeTechniqueParameters = true;
        }

        // Remove useless geometry semantics
        var validSemantics = CartoonRendering.validSemantics;
        var geometries = sceneData.geometries;
        if (geometries) {
            var input, offset, s, source;
            for (p in geometries) {
                if (geometries.hasOwnProperty(p)) {
                    var geometry = geometries[p];
                    var inputs = geometry.inputs;
                    var sources = geometry.sources;
                    var surfaces = geometry.surfaces;

                    var sourcesToKeep = {};
                    var offsetsToKeep = {};
                    var inputsToRemove = {};
                    var indicesPerVertex = 0;
                    for (s in inputs) {
                        if (inputs.hasOwnProperty(s)) {
                            input = inputs[s];
                            offset = input.offset;
                            source = input.source;

                            if (indicesPerVertex <= offset) {
                                indicesPerVertex = (offset + 1);
                            }

                            if (validSemantics[s]) {
                                sourcesToKeep[source] = true;
                                offsetsToKeep[offset] = true;
                            } else {
                                inputsToRemove[s] = true;
                            }
                        }
                    }

                    for (s in inputsToRemove) {
                        if (inputsToRemove.hasOwnProperty(s)) {
                            input = inputs[s];
                            offset = input.offset;
                            source = input.source;

                            delete inputs[s];

                            if (!sourcesToKeep.hasOwnProperty(source)) {
                                delete sources[source];
                            }

                            if (!offsetsToKeep.hasOwnProperty(offset)) {
                                for (r in inputs) {
                                    if (inputs.hasOwnProperty(r)) {
                                        if (inputs[r].offset > offset) {
                                            inputs[r].offset -= 1;
                                        }
                                    }
                                }

                                var newOffsetsToKeep = {};
                                for (r in offsetsToKeep) {
                                    if (offsetsToKeep.hasOwnProperty(r)) {
                                        var ir = parseInt(r, 10);
                                        if (ir > offset) {
                                            newOffsetsToKeep[ir - 1] = true;
                                        } else {
                                            newOffsetsToKeep[ir] = true;
                                        }
                                    }
                                }
                                offsetsToKeep = newOffsetsToKeep;

                                for (r in surfaces) {
                                    if (surfaces.hasOwnProperty(r)) {
                                        var surface = surfaces[r];
                                        var indices = surface.triangles;
                                        if (!indices) {
                                            indices = surface.lines;
                                            if (!indices) {
                                                continue;
                                            }
                                        }

                                        var numVertices = Math.floor(indices.length / indicesPerVertex);
                                        var src = 0;
                                        var dst = 0;
                                        var i, j;
                                        for (i = 0; i < numVertices; i += 1) {
                                            for (j = 0; j < indicesPerVertex; j += 1) {
                                                if (j !== offset) {
                                                    indices[dst] = indices[src];
                                                    dst += 1;
                                                }
                                                src += 1;
                                            }
                                        }
                                        indices.length = dst;
                                    }
                                }

                                indicesPerVertex -= 1;
                            }
                        }
                    }
                }
            }
        }

        this.doUpdateAllNodes = true;
    };

    CartoonRendering.prototype.purgeTechniqueParameters = function (techniqueParameters) {
        var validParameterNames = this.mainShaderParameterNames;
        var doDelete = (TurbulenzEngine.canvas ? true : false);
        var p;
        for (p in techniqueParameters) {
            if (techniqueParameters.hasOwnProperty(p)) {
                if (!validParameterNames[p]) {
                    if (doDelete) {
                        delete techniqueParameters[p];
                    } else {
                        techniqueParameters[p] = undefined;
                    }
                }
            }
        }
    };

    CartoonRendering.prototype.buildSortKey = function (techniqueIndex, materialIndex, vertexBufferId, nodeIndex) {
        return (((techniqueIndex % 1024) * (1024 * 1024 * 1024)) + ((materialIndex % 1024) * (1024 * 1024)) + ((vertexBufferId % 1024) * (1024)) + (nodeIndex % 1024));
    };

    CartoonRendering.prototype.sortPositive = function (a, b) {
        return (b.sortKey - a.sortKey) || (b.indexBuffer.id - a.indexBuffer.id);
    };

    CartoonRendering.prototype.sortPositiveSimple = function (a, b) {
        return (b.sortKey - a.sortKey);
    };

    CartoonRendering.prototype.sortNegative = function (a, b) {
        return (a.sortKey - b.sortKey) || (a.indexBuffer.id - b.indexBuffer.id);
    };

    CartoonRendering.prototype.sortNegativeSimple = function (a, b) {
        return (a.sortKey - b.sortKey);
    };

    CartoonRendering.prototype.sortPass = function (pass, compareFn) {
        if (2 < pass.length) {
            pass.sort(compareFn);
        }
    };

    CartoonRendering.prototype.sortPassArrays = function () {
        var passesIndex = CartoonRendering.passIndex;
        var passes = this.passes;

        this.sortPass(passes[passesIndex.silhouette], this.sortNegativeSimple);

        this.sortPass(passes[passesIndex.background], this.sortNegative);

        this.sortPass(passes[passesIndex.decal], this.sortNegative);

        this.sortPass(passes[passesIndex.foreground], this.sortNegative);

        // Transparent pass needs to sort even for 2 elements and
        // it would be rare to have the same sort key
        var pass = passes[passesIndex.transparent];
        if (1 < pass.length) {
            pass.sort(this.sortPositiveSimple);
        }
    };

    CartoonRendering.prototype.draw = function (gd, clearColor, drawDecalsFn, drawTransparentFn, drawDebugFn) {
        var passesIndex = CartoonRendering.passIndex;
        var passes = this.passes;

        // update shadowmaps
        this._updateShadowMaps();

        // Prepare silhouette buffer
        gd.beginRenderTarget(this.silhouetteRenderTarget);

        gd.clear(CartoonRendering.silhouetteClear, 1.0, 0);

        gd.drawArray(passes[passesIndex.silhouette], this.silhouetteTechniqueParametersArray, 0);

        gd.endRenderTarget();

        // Prepare background
        var globalTechniqueParametersArray = this.globalTechniqueParametersArray;

        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            globalTechniqueParametersArray[1] = shadowMaps.techniqueParameters;
        }

        var globalTechniqueParameters = this.globalTechniqueParameters;

        gd.beginRenderTarget(this.colorRenderTarget);

        if (this.doRenderSky) {
            gd.setTechnique(this.skyTechnique);
            gd.setTechniqueParameters(this.skyTechniqueParameters);
            gd.setStream(this.skyVertexBuffer, this.skySemantics);
            gd.draw(this.quadPrimitive, 4);
        }

        if (this.doRenderWater) {
            gd.setTechnique(this.waterTechnique);
            gd.setTechniqueParameters(this.waterTechniqueParameters);
            if (shadowMaps) {
                gd.setTechniqueParameters(shadowMaps.techniqueParameters);
            }
            gd.setStream(this.waterVertexBuffer, this.waterSemantics);
            gd.draw(this.quadPrimitive, 4);
        }

        // Render foreground
        globalTechniqueParameters['foreground'] = true;
        gd.drawArray(passes[passesIndex.foreground], globalTechniqueParametersArray, 0);

        // Render background
        globalTechniqueParameters['foreground'] = false;
        gd.drawArray(passes[passesIndex.background], globalTechniqueParametersArray, 0);

        gd.drawArray(passes[passesIndex.decal], globalTechniqueParametersArray, 0);

        if (drawDecalsFn) {
            drawDecalsFn();
        }

        gd.endRenderTarget();

        gd.beginRenderTarget(this.transparentRenderTarget);

        // Mix everything together
        gd.setTechnique(this.mixTechnique);
        gd.setTechniqueParameters(this.mixTechniqueParameters);
        gd.setStream(this.quadVertexBuffer, this.quadSemantics);
        gd.draw(this.quadPrimitive, 4);

        // Render transparents.
        gd.drawArray(passes[passesIndex.transparent], globalTechniqueParametersArray, 0);

        if (drawTransparentFn) {
            drawTransparentFn();
        }

        if (drawDebugFn) {
            drawDebugFn();
        }

        gd.endRenderTarget();

        // Copy to screen
        gd.setTechnique(this.copyTechnique);
        gd.setTechniqueParameters(this.copyTechniqueParameters);
        gd.setStream(this.quadVertexBuffer, this.quadSemantics);
        gd.draw(this.quadPrimitive, 4);
    };

    CartoonRendering.prototype._drawInternalTexture = function (gd, texture) {
        gd.setTechnique(this.copyTechnique);
        this.copyTechnique['colorTexture'] = texture;
        gd.setStream(this.quadVertexBuffer, this.quadSemantics);
        gd.draw(this.quadPrimitive, 4);
    };

    CartoonRendering.prototype.drawShadowMap = function (gd) {
        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            this._drawInternalTexture(gd, shadowMaps.techniqueParameters['shadowMapTexture']);
        }
    };

    CartoonRendering.prototype.drawSilhouetteBuffer = function (gd) {
        this._drawInternalTexture(gd, this.silhouetteTexture);
    };

    CartoonRendering.prototype.drawColorBuffer = function (gd) {
        this._drawInternalTexture(gd, this.colorTexture);
    };

    CartoonRendering.prototype.drawFinalBuffer = function (gd) {
        this._drawInternalTexture(gd, this.finalTexture);
    };

    CartoonRendering.prototype.setGlobalLightDirection = function (dir) {
        var lightDirection = this.lightDirection;
        lightDirection[0] = dir[0];
        lightDirection[1] = dir[1];
        lightDirection[2] = dir[2];
    };

    CartoonRendering.prototype.setGlobalLightColor = function (color) {
        this.globalTechniqueParameters['lightColor'] = color;
    };

    CartoonRendering.prototype.getGlobalLightColor = function () {
        return this.globalTechniqueParameters['lightColor'];
    };

    CartoonRendering.prototype.setAmbientColor = function (color) {
        this.globalTechniqueParameters['ambientColor'] = color;
    };

    CartoonRendering.prototype.getAmbientColor = function () {
        return this.globalTechniqueParameters['ambientColor'];
    };

    CartoonRendering.prototype.setFogColor = function (color) {
        this.fogColor = color;
    };

    CartoonRendering.prototype.setSkyColor = function (color) {
        this.skyColor = color;
    };

    CartoonRendering.prototype.setForegroundAlbedoScale = function (data) {
        var params = this.globalTechniqueParameters['foregroundAlbedoScale'];
        params[0] = data[0];
        params[1] = data[1];
        params[2] = data[2];
    };

    CartoonRendering.prototype.setDefaultTexture = function (tex) {
        this.globalTechniqueParameters['diffuse'] = tex;
    };

    CartoonRendering.prototype.setWireframe = function (wireframeEnabled, wireframeInfo) {
        this.wireframeInfo = wireframeInfo;
        this.wireframe = wireframeEnabled;
    };

    CartoonRendering.prototype.getDefaultSkinBufferSize = function () {
        return this.defaultSkinBufferSize;
    };

    CartoonRendering.prototype.destroyBuffers = function () {
        if (this.silhouetteRenderTarget) {
            this.silhouetteRenderTarget.destroy();
            this.silhouetteRenderTarget = null;
        }
        if (this.colorRenderTarget) {
            this.colorRenderTarget.destroy();
            this.colorRenderTarget = null;
        }
        if (this.silhouetteTexture) {
            this.silhouetteTexture.destroy();
            this.silhouetteTexture = null;
            this.mixTechniqueParameters['silhouetteTexture'] = null;
        }
        if (this.colorTexture) {
            this.colorTexture.destroy();
            this.colorTexture = null;
            this.mixTechniqueParameters['colorTexture'] = null;
        }
        if (this.finalTexture) {
            this.finalTexture.destroy();
            this.finalTexture = null;
            this.copyTechniqueParameters['colorTexture'] = null;
        }
        if (this.depthBuffer) {
            this.depthBuffer.destroy();
            this.depthBuffer = null;
        }
    };

    CartoonRendering.prototype.destroy = function () {
        var shadowMaps = this.shadowMaps;
        if (shadowMaps) {
            shadowMaps.destroy();
            delete this.shadowMaps;
        }

        delete this.mainShader;

        if (this.skyShader) {
            delete this.skyShader;
            delete this.skyTechnique;
        }

        if (this.waterShader) {
            delete this.waterShader;
            delete this.waterTechnique;
        }

        if (this.silhouetteShader) {
            delete this.silhouetteShader;
            delete this.silhouetteRigidTechnique;
            delete this.silhouetteSkinnedTechnique;
            delete this.silhouetteRigidNoCullTechnique;
            delete this.silhouetteSkinnedNoCullTechnique;
            delete this.silhouetteBirdTechnique;
            delete this.mixTechnique;
        }

        this.destroyBuffers();

        if (this.noiseTexture) {
            this.noiseTexture.destroy();
            delete this.noiseTexture;
        }

        if (this.skyVertexBuffer) {
            this.skyVertexBuffer.destroy();
            delete this.skyVertexBuffer;
        }

        if (this.waterVertexBuffer) {
            this.waterVertexBuffer.destroy();
            delete this.waterVertexBuffer;
        }

        if (this.quadVertexBuffer) {
            this.quadVertexBuffer.destroy();
            delete this.quadVertexBuffer;
        }

        delete this.globalTechniqueParametersArray;
        delete this.globalTechniqueParameters;
        delete this.lightDirection;
        delete this.passes;
    };

    CartoonRendering.defaultPrepareFn = //
    // defaultPrepareFn
    //
    function (geometryInstance, cr, gd) {
        var drawParameters = gd.createDrawParameters();
        geometryInstance.drawParameters = [drawParameters];
        geometryInstance.prepareDrawParameters(drawParameters);

        var sharedMaterial = geometryInstance.sharedMaterial;
        var techniqueParameters = geometryInstance.techniqueParameters;
        var meta = sharedMaterial.meta;
        var sharedMaterialTechniqueParameters = sharedMaterial.techniqueParameters;

        if (!sharedMaterialTechniqueParameters.materialColor && !techniqueParameters.materialColor) {
            sharedMaterialTechniqueParameters.materialColor = CartoonRendering.v4One;
        }
        var materialColor = techniqueParameters.materialColor || sharedMaterialTechniqueParameters.materialColor;

        if (!sharedMaterialTechniqueParameters.uvTransform && !techniqueParameters.uvTransform) {
            sharedMaterialTechniqueParameters.uvTransform = CartoonRendering.identityUVTransform;
        }

        if (cr.doPurgeTechniqueParameters) {
            cr.purgeTechniqueParameters(sharedMaterialTechniqueParameters);
        }

        // NOTE: the way this functions is called, 'this' is an
        // EffectPrepareObject.
        drawParameters.technique = (this).technique;

        drawParameters.setTechniqueParameters(0, sharedMaterialTechniqueParameters);
        drawParameters.setTechniqueParameters(1, techniqueParameters);

        var node = geometryInstance.node;
        var foreground = node.getRoot().foreground;

        if (meta.decal) {
            drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.decal];
        } else if (meta.transparent) {
            drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.transparent];
        } else if (foreground) {
            drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.foreground];
        } else {
            drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.background];
        }

        // do this once instead of for every update
        var rendererInfo = node.rendererInfo;
        techniqueParameters.worldView = rendererInfo.worldView;
        techniqueParameters.worldViewInverseTranspose = rendererInfo.worldViewInverseTranspose;

        var technique = (this).technique;
        var techniqueName = technique.name;
        var techniqueIndex = technique.id;

        var geometry = geometryInstance.geometry;
        var vertexBufferIndex = geometry.vertexBuffer.id;
        var indexBufferIndex = (geometryInstance.surface.indexBuffer ? geometryInstance.surface.indexBuffer.id : 0x3ff);

        var skinController = geometryInstance.skinController;
        if (skinController) {
            techniqueParameters.skinBones = skinController.output;
            if (skinController.index === undefined) {
                skinController.index = CartoonRendering.nextSkinID;
                CartoonRendering.nextSkinID += 1;
            }
            drawParameters.sortKey = -cr.buildSortKey(techniqueIndex, skinController.index, meta.materialIndex, vertexBufferIndex);
        } else {
            drawParameters.sortKey = cr.buildSortKey(techniqueIndex, meta.materialIndex, vertexBufferIndex, rendererInfo.id);
        }

        geometryInstance.renderUpdate = (this).update;

        if (!meta.transparent && !meta.decal && !meta.far) {
            drawParameters = gd.createDrawParameters();
            geometryInstance.prepareDrawParameters(drawParameters);
            drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.silhouette];
            geometryInstance.drawParameters.push(drawParameters);

            var nocull = -1 !== techniqueName.indexOf("_nocull");
            var sortOffset = 0;
            var backgroundSortOffset = 0x100;

            if (skinController) {
                if (nocull) {
                    technique = cr.silhouetteSkinnedNoCullTechnique;
                } else {
                    technique = cr.silhouetteSkinnedTechnique;
                }
            } else {
                if (-1 !== techniqueName.indexOf("bird")) {
                    technique = cr.silhouetteBirdTechnique;
                } else if (nocull) {
                    technique = cr.silhouetteRigidNoCullTechnique;
                } else {
                    technique = cr.silhouetteRigidTechnique;
                }
            }
            drawParameters.technique = technique;

            if (!foreground) {
                sortOffset |= backgroundSortOffset;
            }

            techniqueIndex = technique.id;
            drawParameters.sortKey = cr.buildSortKey(sortOffset | techniqueIndex, vertexBufferIndex, indexBufferIndex, rendererInfo.id);

            drawParameters.setTechniqueParameters(0, geometryInstance.techniqueParameters);

            if (cr.shadowMaps) {
                if ((this).shadowMappingUpdate && !meta.noshadows) {
                    drawParameters = gd.createDrawParameters();
                    geometryInstance.prepareDrawParameters(drawParameters);
                    geometryInstance.shadowMappingDrawParameters = [drawParameters];

                    drawParameters.userData = cr.sharedUserData[CartoonRendering.passIndex.shadow];

                    drawParameters.technique = (this).shadowMappingTechnique;

                    drawParameters.sortKey = cr.buildSortKey((this).shadowMappingTechniqueIndex, vertexBufferIndex, indexBufferIndex, rendererInfo.id);

                    var shadowTechniqueParameters;
                    if (skinController) {
                        shadowTechniqueParameters = gd.createTechniqueParameters({
                            world: node.world,
                            skinBones: skinController.output
                        });
                    } else {
                        shadowTechniqueParameters = rendererInfo.shadowTechniqueParameters;
                        if (!shadowTechniqueParameters) {
                            shadowTechniqueParameters = gd.createTechniqueParameters({
                                world: node.world
                            });
                            rendererInfo.shadowTechniqueParameters = shadowTechniqueParameters;
                        }
                    }

                    drawParameters.setTechniqueParameters(0, shadowTechniqueParameters);

                    geometryInstance.shadowTechniqueParameters = shadowTechniqueParameters;

                    var renderableRenderInfo = geometryInstance.rendererInfo;
                    if (!renderableRenderInfo) {
                        renderableRenderInfo = renderingCommonCreateRendererInfoFn(geometryInstance);
                        geometryInstance.rendererInfo = renderableRenderInfo;
                    }

                    renderableRenderInfo.shadowMappingUpdate = (this).shadowMappingUpdate;
                } else {
                    meta.noshadows = true;
                }
            }
        }
    };

    CartoonRendering.prototype.createNoiseTexture = function (gd, md, size) {
        var simplex = new SimplexNoise();
        var pi2 = 2.0 * Math.PI;
        var cos = Math.cos;
        var sin = Math.sin;
        var noiseScale = (40.0 / pi2);
        var gridScale = (pi2 / size);
        var x, y, i;

        var noiseArray = new Uint8Array(size * size);

        i = 0;
        for (y = 0; y < size; y += 1) {
            var t = y * gridScale;
            var ny = cos(t) * noiseScale;
            var nw = sin(t) * noiseScale;

            for (x = 0; x < size; x += 1) {
                var s = x * gridScale;
                var nx = cos(s) * noiseScale;
                var nz = sin(s) * noiseScale;

                noiseArray[i] = (((0.5 * simplex.noise4D(nx, ny, nz, nw)) + 0.5) * 255);
                i += 1;
            }
        }

        return gd.createTexture({
            name: "noise",
            width: size,
            height: size,
            format: gd.PIXELFORMAT_L8,
            mipmaps: true,
            data: noiseArray
        });
    };

    CartoonRendering.create = //
    // Constructor function
    //
    function (gd, md, shaderManager, effectsManager, textureManager) {
        var cr = new CartoonRendering();

        cr.md = md;

        cr.lightDirection = md.v3Build(0.0, -1.0, 0.0);
        cr.fogColor = md.v3BuildZero();
        cr.skyColor = md.v3Build(0.0, 0.584, 0.858);

        cr.globalTechniqueParameters = gd.createTechniqueParameters({
            projection: null,
            viewInverseTranspose: md.m34BuildIdentity(),
            lightColor: md.v3BuildOne(),
            ambientColor: md.v3BuildZero(),
            lightDirection: md.v3BuildZero(),
            foregroundAlbedoScale: md.v3Build(1.0, 0.7, 0.6),
            fogColor: null,
            invCameraFar: 0.0,
            foreground: false,
            time: 0.0
        });
        cr.globalTechniqueParametersArray = [cr.globalTechniqueParameters];

        cr.passes = [];
        cr.sharedUserData = [];
        var n;
        for (n = 0; n < CartoonRendering.numPasses; n += 1) {
            cr.sharedUserData[n] = { passIndex: n };
            cr.passes[n] = [];
        }

        cr.frustumPoints = [];

        cr.silhouetteTechniqueParameters = gd.createTechniqueParameters({
            projection: null,
            viewDepth: new Float32Array([0, 0]),
            time: 0
        });
        cr.silhouetteTechniqueParametersArray = [cr.silhouetteTechniqueParameters];

        cr.waterTechniqueParameters = gd.createTechniqueParameters({
            projection: null,
            worldView: null,
            worldViewInverseTranspose: null,
            fogColor: null,
            invCameraFar: 0.0,
            lightDirection: null,
            noiseTexture: null,
            energytrailTexture: null,
            waterColorBright: md.v3Build(64.0 / 255.0, 223.0 / 255.0, 125.0 / 255.0),
            waterColorDark: md.v3Build(25.0 / 255.0, 76.0 / 255.0, 114.0 / 255.0),
            waterGain: 0.525,
            waterSpecularPower: 2.0,
            waterSpecularScale: 0.8,
            glowColor: md.v3Build(0.0, 1.0, 1.0),
            trailColor: md.v3Build(0.0, 0.0, 0.0)
        });

        cr.skyTechniqueParameters = gd.createTechniqueParameters({
            cameraRight: md.v3BuildZero(),
            cameraUp: md.v3BuildZero(),
            cameraAt: md.v3BuildZero(),
            cameraPos: md.v3BuildZero(),
            fogColor: null,
            skyColor: null,
            time: 0.0
        });

        cr.mixTechniqueParameters = gd.createTechniqueParameters({
            pixelOffset: null,
            colorTexture: null,
            silhouetteTexture: null
        });

        cr.copyTechniqueParameters = gd.createTechniqueParameters({
            colorTexture: null
        });

        cr.quadPrimitive = gd.PRIMITIVE_TRIANGLE_STRIP;
        cr.quadSemantics = gd.createSemantics(['POSITION', 'TEXCOORD0']);

        cr.quadVertexBuffer = gd.createVertexBuffer({
            numVertices: 4,
            attributes: ['FLOAT2', 'FLOAT2'],
            dynamic: false,
            data: [
                -1.0,
                1.0,
                0.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                -1.0,
                -1.0,
                0.0,
                0.0,
                1.0,
                -1.0,
                1.0,
                0.0
            ]
        });

        cr.doRenderWater = true;
        cr.waterSemantics = gd.createSemantics(['POSITION', 'TEXCOORD0', 'TEXCOORD1', 'TEXCOORD2']);
        cr.waterVertexBuffer = gd.createVertexBuffer({
            numVertices: 4,
            attributes: ['FLOAT2', 'FLOAT2', 'FLOAT2', 'FLOAT2'],
            dynamic: true,
            transient: true
        });
        cr.waterVertexData = new Float32Array(4 * 8);

        cr.doRenderSky = true;
        cr.skySemantics = gd.createSemantics(['POSITION']);
        cr.skyVertexBuffer = gd.createVertexBuffer({
            numVertices: 4,
            attributes: ['FLOAT2'],
            dynamic: true,
            transient: true
        });
        cr.skyVertexData = new Float32Array(4 * 2);

        cr.mainShader = null;
        cr.mainShaderParameterNames = null;
        cr.doPurgeTechniqueParameters = false;

        cr.doUpdateAllNodes = true;

        cr.waterShader = null;
        cr.waterTechnique = null;

        cr.skyShader = null;
        cr.skyTechnique = null;

        cr.silhouetteShader = null;
        cr.silhouetteRigidTechnique = null;
        cr.silhouetteSkinnedTechnique = null;
        cr.silhouetteRigidNoCullTechnique = null;
        cr.silhouetteSkinnedNoCullTechnique = null;
        cr.mixTechnique = null;

        function onShaderLoaded(shader) {
            cr.mainShader = shader;

            var parameterNames = {};
            var numParameters = shader.numParameters;
            var n;
            for (n = 0; n < numParameters; n += 1) {
                parameterNames[shader.getParameter(n).name] = true;
            }

            cr.mainShaderParameterNames = parameterNames;

            var skinBones = shader.getParameter("skinBones");
            cr.defaultSkinBufferSize = skinBones.rows * skinBones.columns;
        }

        function onTextureLoaded(texture) {
            cr.waterTechniqueParameters['energytrailTexture'] = texture;
        }

        textureManager.load("textures/energytrail.dds", false, onTextureLoaded);

        shaderManager.load("shaders/cartoonrendering.cgfx", onShaderLoaded);
        shaderManager.load("shaders/silhouette.cgfx");
        shaderManager.load("shaders/water.cgfx");
        shaderManager.load("shaders/sky.cgfx");
        shaderManager.load("shaders/cascadedshadows.cgfx");

        //CascadedShadowMapping.splitDistances = [1.0 / 100.0, 4.0 / 100.0, 20.0 / 100.0, 1.0];
        CascadedShadowMapping.splitDistances = [0.01, 0.04, 0.2, 1.0];
        var shadowMaps = CascadedShadowMapping.create(gd, md, shaderManager, 2048, true);
        var shadowMappingUpdateFn = shadowMaps.update;
        var shadowMappingSkinnedUpdateFn = shadowMaps.skinnedUpdate;
        cr.shadowMaps = shadowMaps;
        cr.defaultShadowMappingUpdateFn = shadowMappingUpdateFn;
        cr.defaultShadowMappingSkinnedUpdateFn = shadowMappingSkinnedUpdateFn;

        cr.noiseTexture = null;

        // Update effects
        var defaultUpdate = function defaultUpdateFn(camera) {
        };

        var defaultSkinnedUpdate = function defaultSkinnedUpdateFn(camera) {
            var skinController = this.skinController;
            if (skinController) {
                skinController.update();
            }
        };

        // Prepare
        var defaultPrepare = function defaultPrepareFn(geometryInstance) {
            CartoonRendering.defaultPrepareFn.call(this, geometryInstance, cr, gd);

            //For untextured objects we need to choose a technique that uses materialColor instead.
            var techniqueParameters = geometryInstance.sharedMaterial.techniqueParameters;
            var diffuse = techniqueParameters.diffuse;
            if (diffuse === undefined) {
                if (!techniqueParameters.materialColor) {
                    techniqueParameters.materialColor = md.v4BuildOne();
                }
            } else if (diffuse.length === 4) {
                techniqueParameters.materialColor = md.v4Build.apply(md, diffuse);
                diffuse = techniqueParameters.diffuse_map;
                techniqueParameters.diffuse = diffuse;
            }
            if (!diffuse) {
                var nocull = (-1 !== geometryInstance.drawParameters[0].technique.name.indexOf("_nocull"));
                var shader = shaderManager.get("shaders/cartoonrendering.cgfx");
                if (geometryInstance.geometryType === "skinned") {
                    if (nocull) {
                        geometryInstance.drawParameters[0].technique = shader.getTechnique("flat_skinned_nocull");
                    } else {
                        geometryInstance.drawParameters[0].technique = shader.getTechnique("flat_skinned");
                    }
                } else {
                    if (nocull) {
                        geometryInstance.drawParameters[0].technique = shader.getTechnique("flat_nocull");
                    } else {
                        geometryInstance.drawParameters[0].technique = shader.getTechnique("flat");
                    }
                }
            }
        };

        var noDiffusePrepare = function noDiffusePrepareFn(geometryInstance) {
            CartoonRendering.defaultPrepareFn.call(this, geometryInstance, cr, gd);

            //For untextured objects we need to choose a technique that uses materialColor instead.
            var techniqueParameters = geometryInstance.sharedMaterial.techniqueParameters;
            var diffuse = techniqueParameters.diffuse;
            if (diffuse === undefined) {
                if (!techniqueParameters.materialColor) {
                    techniqueParameters.materialColor = md.v4BuildOne();
                }
            } else if (diffuse.length === 4) {
                techniqueParameters.materialColor = md.v4Build.apply(md, diffuse);
                techniqueParameters.diffuse = undefined;
            }
        };

        var thermalPrepare = function thermalPrepareFn(geometryInstance) {
            CartoonRendering.defaultPrepareFn.call(this, geometryInstance, cr, gd);
            var extents = geometryInstance.node.getWorldExtents();
            geometryInstance.drawParameters[0].getTechniqueParameters(1).worldMinMaxY = new Float32Array([extents[1], extents[4]]);
        };

        var thermalUpdate = function thermalUpdateFn(camera) {
            var extents = this.node.getWorldExtents();
            var worldMinMaxY = this.drawParameters[0].getTechniqueParameters(1).worldMinMaxY;
            worldMinMaxY[0] = extents[1];
            worldMinMaxY[1] = extents[4];
        };

        var loadTechniques = function loadTechniquesFn(shaderManager) {
            var that = this;

            var callback = function shaderLoadedCallbackFn(shader) {
                that.shader = shader;
                that.technique = shader.getTechnique(that.techniqueName);
                that.techniqueIndex = that.technique.id;
            };
            shaderManager.load(this.shaderName, callback);

            if (cr.shadowMaps) {
                if (this.shadowMappingTechniqueName) {
                    var shadowMappingCallback = function shaderLoadedShadowMappingCallbackFn(shader) {
                        that.shadowMappingShader = shader;
                        that.shadowMappingTechnique = shader.getTechnique(that.shadowMappingTechniqueName);
                        that.shadowMappingTechniqueIndex = that.shadowMappingTechnique.id;
                    };
                    shaderManager.load(this.shadowMappingShaderName, shadowMappingCallback);
                }

                if (this.shadowTechniqueName) {
                    var shadowCallback = function shaderLoadedShadowCallbackFn(shader) {
                        that.shadowShader = shader;
                        that.shadowTechnique = shader.getTechnique(that.shadowTechniqueName);
                        that.shadowTechniqueIndex = that.shadowTechnique.id;
                    };
                    shaderManager.load(this.shadowShaderName, shadowCallback);
                }
            }
        };

        cr.defaultPrepareFn = defaultPrepare;
        cr.defaultUpdateFn = defaultUpdate;
        cr.defaultSkinnedUpdateFn = defaultSkinnedUpdate;
        cr.loadTechniquesFn = loadTechniques;

        var effect;
        var effectTypeData;
        var skinned = "skinned";
        var rigid = "rigid";

        // Register the effects
        //
        // constant
        //
        effect = Effect.create("constant");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat_skinned",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat_skinned",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // constant_nocull
        //
        effect = Effect.create("constant_nocull");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat_nocull",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid_nocull",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat_nocull",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat_skinned_nocull",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned_nocull",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat_skinned_nocull",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // constant_nolight
        //
        effect = Effect.create("constant_nolight");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat_nolight",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat_nolight",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: noDiffusePrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "flat_nolight_skinned",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "flat_nolight_skinned",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // lambert
        //
        effect = Effect.create("lambert");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "lambert",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "lambert",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "lambert_skinned",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "lambert_skinned",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // blinn
        //
        effect = Effect.create("blinn");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blinn",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "blinn",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blinn_skinned",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "blinn_skinned",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // blinn_nocull
        //
        effect = Effect.create("blinn_nocull");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blinn_nocull",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid_nocull",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "blinn_nocull",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blinn_skinned_nocull",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned_nocull",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "blinn_skinned_nocull",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // phong
        //
        effect = Effect.create("phong");
        effectsManager.add(effect);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "phong",
            update: defaultUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "rigid",
            shadowMappingUpdate: shadowMappingUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "phong",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "phong_skinned",
            update: defaultSkinnedUpdate,
            shadowMappingShaderName: "shaders/cascadedshadows.cgfx",
            shadowMappingTechniqueName: "skinned",
            shadowMappingUpdate: shadowMappingSkinnedUpdateFn,
            shadowShaderName: "shaders/cartoonrendering.cgfx",
            shadowTechniqueName: "phong_skinned",
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // add
        //
        effect = Effect.create("add");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "add",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "add_skinned",
            update: defaultSkinnedUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // blend
        //
        effect = Effect.create("blend");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blend",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blend_skinned",
            update: defaultSkinnedUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(skinned, effectTypeData);

        //
        // blend_nocull
        //
        effect = Effect.create("blend_nocull");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "blend_nocull",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        //
        // thermal
        //
        effect = Effect.create("thermal");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: thermalPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "thermal",
            update: thermalUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        //
        // watertank
        //
        effect = Effect.create("watertank");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "watertank",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        //
        // wake
        //
        effect = Effect.create("wake");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "wake",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        //
        // bird
        //
        effect = Effect.create("bird");
        effectsManager.add(effect);
        effectTypeData = {
            prepare: defaultPrepare,
            shaderName: "shaders/cartoonrendering.cgfx",
            techniqueName: "bird",
            update: defaultUpdate,
            loadTechniques: loadTechniques
        };
        effectTypeData.loadTechniques(shaderManager);
        effect.add(rigid, effectTypeData);

        // Default
        effectsManager.map("default", "blinn");

        return cr;
    };
    CartoonRendering.version = 1;

    CartoonRendering.numPasses = 6;
    CartoonRendering.passIndex = {
        silhouette: 0,
        background: 1,
        foreground: 2,
        decal: 3,
        transparent: 4,
        shadow: 5
    };

    CartoonRendering.validSemantics = {
        POSITION: true,
        POSITION0: true,
        BLENDWEIGHT: true,
        BLENDWEIGHT0: true,
        NORMAL: true,
        NORMAL0: true,
        BLENDINDICES: true,
        BLENDINDICES0: true,
        TEXCOORD: true,
        TEXCOORD0: true,
        TEXCOORD1: true,
        ATTR0: true,
        ATTR1: true,
        ATTR2: true,
        ATTR7: true,
        ATTR8: true
    };

    CartoonRendering.nextRenderinfoID = 0;
    CartoonRendering.nextSkinID = 0;

    CartoonRendering.v4One = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    CartoonRendering.v4Zero = new Float32Array([0.0, 0.0, 0.0, 0.0]);
    CartoonRendering.identityUVTransform = new Float32Array([1, 0, 0, 1, 0, 0]);
    CartoonRendering.silhouetteClear = new Float32Array([0.0, 0.0, 1.0, 1.0]);
    CartoonRendering.frustumPointsCoords = [
        [1.0, 1.0],
        [-1.0, 1.0],
        [-1.0, -1.0],
        [1.0, -1.0]
    ];
    return CartoonRendering;
})();
