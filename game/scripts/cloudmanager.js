/*global CartoonRendering: false*/
/*global debug: false*/
/*global Config: false*/
/*global Material: false*/
/*global EntityComponentBase: false*/
/*global SceneNode: false*/
/*global VertexBufferManager: false*/
/*global VMath: false*/
/*jshint bitwise: false*/

"use strict";

function CloudManager(globals)
{
    this.globals = globals;
    this.rootNodeID = 0;

    this.clouds = [];

    this.maxCloudSprites = 1024;

    this.vertexData = new Float32Array(this.maxCloudSprites * 4 * 8);
    this.vertexBufferManager = VertexBufferManager.create(globals.graphicsDevice, true);

    var numIndices = 7 * (this.maxCloudSprites * 6); // We allocate 7 times more than needed to reuse offset 0
    var indexData = new Uint16Array(numIndices);
    for (var j = 0, k = 0; j < numIndices; j += 6, k += 4)
    {
        indexData[j]     = k;
        indexData[j + 1] = k + 1;
        indexData[j + 2] = k + 2;
        indexData[j + 3] = k;
        indexData[j + 4] = k + 2;
        indexData[j + 5] = k + 3;
    }
    this.indexBuffer = globals.graphicsDevice.createIndexBuffer({
        numIndices: numIndices,
        format: globals.graphicsDevice.INDEXFORMAT_USHORT,
        data: indexData
    });

    var gd = this.globals.graphicsDevice;
    this.semantics = gd.createSemantics(['POSITION', 'COLOR', 'TEXCOORD0']);
    this.imposterSemantics = gd.createSemantics(['POSITION', 'TEXCOORD0']);
    this.primitive = gd.PRIMITIVE_TRIANGLES;
    this.imposterPrimitive = gd.PRIMITIVE_TRIANGLE_STRIP;

    this.imposterVertexData = new Float32Array([
        0, 0, 0,  0, 0,
        0, 0, 0,  0, 1,
        0, 0, 0,  1, 0,
        0, 0, 0,  1, 1
    ]);

    this.viewProjection = globals.mathDevice.m44BuildIdentity();

    this.sharedCloudContext = SharedCloudContext.create(globals);

    var cloudTypes = this.cloudTypes = {};
    var baseAlpha = 1.0;
    var baseScale = 2.0;
    cloudTypes.nimbus = {
        texture: "textures/cloudatlas.dds",
        gradient: "textures/cloudgradient.dds",
        distantGradient: "textures/cloudgradient_distant.dds",
        dusk_gradient: "textures/cloudgradient_dusk.dds",
        dusk_distantGradient: "textures/cloudgradient_distant_dusk.dds",
        minRotation: -Math.PI,
        maxRotation:  Math.PI,
        elements: [{
            uvRectangle: [0.5, 0.5, 0.75, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0.5, 1.0, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.0, 0.75, 0.25, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.25, 0.75, 0.5, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.5, 0.75, 0.75, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0.75, 1.0, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }]
    };

    cloudTypes.distant_nimbus = {
        texture: "textures/cloudatlas.dds",
        gradient: "textures/cloudgradient.dds",
        distantGradient: "textures/cloudgradient_distant.dds",
        dusk_gradient: "textures/cloudgradient_dusk.dds",
        dusk_distantGradient: "textures/cloudgradient_distant_dusk.dds",
        minRotation: 0,
        maxRotation: 0,
        elements: [{
            uvRectangle: [0.5, 0.5, 0.75, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0.5, 1.0, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.0, 0.75, 0.25, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.25, 0.75, 0.5, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.5, 0.75, 0.75, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0.75, 1.0, 1.0],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }]
    };

    baseAlpha = 1;
    baseScale = 2.0;
    cloudTypes.cumulus = {
        texture: "textures/cloudatlas.dds",
        gradient: "textures/cloudgradient.dds",
        dusk_gradient: "textures/cloudgradient_dusk.dds",
        minRotation: -Math.PI * 0,
        maxRotation:  Math.PI * 0,
        elements: [{
            uvRectangle: [0, 0.25, 0.25, 0.5],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0, 0.5, 0.25, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.25, 0.25, 0.5, 0.5],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0.25, 1, 0.5],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }]
    };

    baseAlpha = 0.5;
    baseScale = 2.0;
    cloudTypes.stratus = {
        texture: "textures/cloudatlas.dds",
        gradient: "textures/cloudgradient.dds",
        dusk_gradient: "textures/cloudgradient_dusk.dds",
        minRotation: -Math.PI * 0,
        maxRotation:  Math.PI * 0,
        elements: [{
            uvRectangle: [0.25, 0.5, 0.5, 0.75],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.5, 0.25, 0.75, 0.5],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }, {
            uvRectangle: [0.75, 0, 1, 0.25],
            weight: 1,
            baseScale: baseScale,
            baseAlpha: baseAlpha
        }]
    };

    for (var type in cloudTypes)
    {
        if (!cloudTypes.hasOwnProperty(type))
        {
            continue;
        }
        var cloudType = cloudTypes[type];

        // normalize element weights so that their sum is 1
        // and make the distrubition cumulative (0 < weight0 < weight1 < ... < weightN = 1)
        var weightSum = 0;
        var elements = cloudType.elements;
        var numElements = elements.length;
        var i;
        for (i = 0; i < numElements; i += 1)
        {
            elements[i].id = i;
            weightSum += elements[i].weight;
        }
        weightSum = 1 / weightSum;
        var accumulateSum = 0;
        for (i = 0; i < numElements; i += 1)
        {
            var w = elements[i].weight * weightSum + accumulateSum;
            accumulateSum = elements[i].weight = w;
        }
    }
}

CloudManager.prototype.preload = function cloudManagerPreload()
{
    var tm = this.globals.textureManager;
    var cloudTypes = this.cloudTypes;
    for (var type in cloudTypes)
    {
        if (!cloudTypes.hasOwnProperty(type))
        {
            continue;
        }
        var cloudType = cloudTypes[type];
        tm.load(cloudType.texture);
        tm.load(cloudType.gradient);
        tm.load(cloudType.dusk_gradient);
        if (cloudType.distantGradient)
        {
            tm.load(cloudType.distantGradient);
        }
        if (cloudType.dusk_distantGradient)
        {
            tm.load(cloudType.dusk_distantGradient);
        }
    }

    var sm = this.globals.shaderManager;
    sm.load("shaders/clouds.cgfx");
};

// post loading.
CloudManager.prototype.init = function cloudManagerInit()
{
    var gd = this.globals.graphicsDevice;
    var sm = this.globals.shaderManager;
    var tm = this.globals.textureManager;

    var shader = sm.load("shaders/clouds.cgfx");
    this.technique = shader.getTechnique("clouds");
    this.farTechnique = shader.getTechnique("clouds_far");
    this.imposterTechnique = shader.getTechnique("clouds_imposter");
    this.farImposterTechnique = shader.getTechnique("clouds_far_imposter");

    var cloudTypes = this.cloudTypes;
    var cloudTypesArray = [];
    var i;
    for (var type in cloudTypes)
    {
        if (!cloudTypes.hasOwnProperty(type))
        {
            continue;
        }
        var cloudType = cloudTypes[type];
        var elements = cloudType.elements;
        var numElements = elements.length;
        cloudType.techniqueParameters = gd.createTechniqueParameters({
            diffuse                  : tm.load(cloudType.texture),
            gradientDiffuse          : tm.load(cloudType.gradient),
            distantGradientDiffuse   : tm.load(cloudType.distantGradient || cloudType.gradient),
            elementUVRectangle       : new Float32Array(numElements * 4),
            elementBaseAlpha         : new Float32Array(numElements)
        });
        var elementUVRectangle = cloudType.techniqueParameters.elementUVRectangle;
        var elementBaseAlpha   = cloudType.techniqueParameters.elementBaseAlpha;
        for (i = 0; i < numElements; i += 1)
        {
            var element = elements[i];

            elementUVRectangle[i * 4]     = element.uvRectangle[0];
            elementUVRectangle[i * 4 + 1] = element.uvRectangle[1];
            elementUVRectangle[i * 4 + 2] = element.uvRectangle[2];
            elementUVRectangle[i * 4 + 3] = element.uvRectangle[3];

            elementBaseAlpha[i] = element.baseAlpha;
        }
        cloudTypesArray.push(cloudType);
    }

    // remove duplicated technique parameters
    function areEqual(a, b)
    {
        var length = a.length;
        if (length !== b.length)
        {
            return false;
        }
        var n = 0;
        do
        {
            if (a[n] !== b[n])
            {
                return false;
            }
            n += 1;
        }
        while (n < length);
        return true;
    }

    var numCloudTypes = cloudTypesArray.length;
    var j;
    for (i = 0; i < numCloudTypes; i += 1)
    {
        var techniqueParameters = cloudTypesArray[i].techniqueParameters;
        for (j = 0; j < i; j += 1)
        {
            var otherTechniqueParameters = cloudTypesArray[j].techniqueParameters;
            if (areEqual(techniqueParameters.elementUVRectangle,
                         otherTechniqueParameters.elementUVRectangle))
            {
                techniqueParameters.elementUVRectangle = otherTechniqueParameters.elementUVRectangle;
            }
            if (areEqual(techniqueParameters.elementBaseAlpha,
                         otherTechniqueParameters.elementBaseAlpha))
            {
                techniqueParameters.elementBaseAlpha = otherTechniqueParameters.elementBaseAlpha;
            }
        }
    }
};

CloudManager.prototype.setDusk = function cloudManagerSetDuskFn(dusk)
{
    var tm = this.globals.textureManager;
    var cloudTypes = this.cloudTypes;
    for (var type in cloudTypes)
    {
        if (!cloudTypes.hasOwnProperty(type))
        {
            continue;
        }
        var cloudType = cloudTypes[type];
        var parameters = cloudType.techniqueParameters;
        parameters.gradientDiffuse = tm.load(dusk ? cloudType.dusk_gradient : cloudType.gradient);
        parameters.distantGradientDiffuse = tm.load(dusk ? (cloudType.dusk_distantGradient || cloudType.dusk_gradient) :
                                                           (cloudType.distantGradient || cloudType.gradient));
    }
};

// Modified version (just based upon really) OnlineTexturePacker
// specifically, regions are allocated in power-2 sizes from power-2 texture
// via a quad-tree so that free regions can be more easily merged.
var CloudTexturePacker = (function ()
{
    function CloudTexturePacker(pageSize)
    {
        this.pageSize = pageSize;
        this.free = [];
        this.bins = [];
    }
    CloudTexturePacker.prototype.release = function (bin)
    {
        debug.assert(bin.leaf);
        var parent = bin.parent;
        var free = this.free;
        bin.space = 4;
        while (parent)
        {
            parent.space += 1;
            if (parent.space === 4)
            {
                var child0 = parent.child0;
                var child1 = parent.child1;
                var child2 = parent.child2;
                var child3 = parent.child3;
                if (child0 !== bin)
                {
                    free.splice(free.indexOf(child0), 1);
                }
                if (child1 !== bin)
                {
                    free.splice(free.indexOf(child1), 1);
                }
                if (child2 !== bin)
                {
                    free.splice(free.indexOf(child2), 1);
                }
                if (child3 !== bin)
                {
                    free.splice(free.indexOf(child3), 1);
                }
                bin = parent;
                bin.leaf = true;
                bin.child0 = bin.child1 = bin.child2 = bin.child3 = null;
                parent = bin.parent;
            }
            else
            {
                break;
            }
        }
        var numFree = free.length;
        var i;
        while (i < numFree && free[i].dim < bin.dim)
        {
            i += 1;
        }
        free.splice(i, 0, bin);
    };
    CloudTexturePacker.prototype.pack = function (dim)
    {
        var free = this.free;
        var numFree = free.length;
        var i, bin;
        for (i = 0; i < numFree; i += 1)
        {
            bin = free[i];
            if (bin.space === 0)
            {
                free.splice(i, 1);
                numFree -= 1;
                i -= 1;
                continue;
            }
            if (bin.dim >= dim)
            {
                free.splice(i, 1);
                return this.allocate(bin, dim);
            }
        }

        // no free space, allocate a new bin
        bin = {
            x     : 0,
            y     : 0,
            dim   : this.pageSize,
            space : 4,
            leaf  : true,
            bin   : this.bins.length,
            parent: null
        };
        this.bins.push(bin);

        return this.allocate(bin, dim);
    };

    CloudTexturePacker.prototype.allocate = function (bin, dim)
    {
        debug.assert(bin.dim >= dim);
        debug.assert(bin.leaf);
        debug.assert(bin.space !== 0);
        while (bin.dim !== dim)
        {
            // split leaf into 4 bins.
            bin.leaf = false;
            var dim2 = bin.dim >>> 1;
            bin.child0 = {
                parent: bin,
                x: bin.x,
                y: bin.y,
                dim: dim2,
                leaf: true,
                space: 4,
                bin: bin.bin
            };
            bin.child1 = {
                parent: bin,
                x: bin.x + dim2,
                y: bin.y,
                dim: dim2,
                leaf: true,
                space: 4,
                bin: bin.bin
            };
            bin.child2 = {
                parent: bin,
                x: bin.x,
                y: bin.y + dim2,
                dim: dim2,
                leaf: true,
                space: 4,
                bin: bin.bin
            };
            bin.child3 = {
                parent: bin,
                x: bin.x + dim2,
                y: bin.y + dim2,
                dim: dim2,
                leaf: true,
                space: 4,
                bin: bin.bin
            };

            var free = this.free;
            var numFree = free.length;
            var i;
            while (i < numFree && free[i].dim < dim)
            {
                i += 1;
            }
            free.splice(i, 0, bin.child1, bin.child2, bin.child3);

            bin = bin.child0;
        }

        // bin is now full.
        // reduce parent spaces by 1
        bin.space = 0;
        var parent = bin.parent;
        while (parent)
        {
            parent.space -= 1;
            if (parent.space !== 3)
            {
                break;
            }
            parent = parent.parent;
        }
        return bin;
    };

    return CloudTexturePacker;
})();

// Modified version of ParticleSystem SharedCloudContext
// Also handles imposter shared vertex buffer.
var SharedCloudContext = (function ()
{
    function SharedCloudContext(params)
    {
        this.graphicsDevice = params.graphicsDevice;
        this.pageSize = Math.min(this.graphicsDevice.maxSupported("TEXTURE_SIZE"), Config.imposterPageSize);
        this.packer = new CloudTexturePacker(this.pageSize);
        this.contexts = [];

        this.free = [];
        this.maxImposters = 256;

        var buffer = new Float32Array(this.maxImposters * 4);
        for (var i = 0; i < this.maxImposters; i += 1)
        {
            var offset = ((this.maxImposters - i - 1) * 4);
            this.free.push({
                texture: null,
                scissorRectangle: [0, 0, 0, 0],
                viewportRectangle: [0, 0, 0, 0],
                uvRectangle: buffer.subarray(offset, offset + 4),
                bin: 0,
                vertexIndex: offset
            });
        }

        this.vertexBuffer = this.graphicsDevice.createVertexBuffer({
            numVertices : 4 * this.maxImposters,
            attributes: ["FLOAT3", "FLOAT2"],
            dynamic: true
        });

        this.renderTarget = null;
    }

    SharedCloudContext.create = function (params)
    {
        return new SharedCloudContext(params);
    };

    SharedCloudContext.prototype.destroy = function ()
    {
        if (this.renderTarget)
        {
            this.renderTarget.destroy();
            this.renderTarget = null;
        }
        var contexts = this.contexts;
        var count = contexts.length;
        while (count > 0)
        {
            count -= 1;
            var ctx = contexts[count];
            ctx.texture.destroy();
        }
        this.graphicsDevice = null;
        this.packer = null;
        this.contexts = null;
    };

    SharedCloudContext.prototype.release = function (ctx)
    {
        var context = this.contexts[ctx.bin];
        var store = context.store;
        var count = store.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var elt = store[i];
            if (elt.ctx === ctx)
            {
                store[i] = store[count - 1];
                store.pop();
                this.packer.release(elt.fit);
                break;
            }
        }
        ctx.texture = null;
        this.free.push(ctx);
    };

    SharedCloudContext.prototype.canAllocate = function ()
    {
        return (0 !== this.free.length);
    };

    // dim should be power 2
    SharedCloudContext.prototype.allocate = function (dim)
    {
        var fit = this.packer.pack(dim);
        if (!fit)
        {
            return null;
        }

        var bin = fit.bin;
        if (bin >= this.contexts.length)
        {
            this.contexts[bin] = this.createContext();
        }

        var ctx = this.contexts[bin];
        var inv = 1 / this.pageSize;

        var free = this.free;
        debug.assert(free.length !== 0);
        var ret = free.pop();

        ret.texture = ctx.texture;
        ret.scissorRectangle[0] = fit.x;
        ret.scissorRectangle[1] = fit.y;
        ret.scissorRectangle[2] = fit.dim;
        ret.scissorRectangle[3] = fit.dim;
        ret.viewportRectangle[0] = (fit.x + 1);
        ret.viewportRectangle[1] = (fit.y + 1);
        ret.viewportRectangle[2] = (fit.dim - 2);
        ret.viewportRectangle[3] = (fit.dim - 2);
        ret.uvRectangle[0] = (fit.x + 1) * inv;
        ret.uvRectangle[1] = (fit.y + 1) * inv;
        ret.uvRectangle[2] = (fit.dim - 2) * inv;
        ret.uvRectangle[3] = (fit.dim - 2) * inv;
        ret.bin = fit.bin;

        ctx.store.push({
            fit: fit,
            ctx: ret
        });

        return ret;
    };

    SharedCloudContext.prototype.createContext = function ()
    {
        var gd = this.graphicsDevice;
        var texture = gd.createTexture({
            name: "SharedCloudContext Texture",
            width: this.pageSize,
            height: this.pageSize,
            depth: 1,
            format: gd.PIXELFORMAT_R8G8B8A8,
            mipmaps: false,
            cubemap: false,
            dynamic: true,
            renderable: true
        });

        if (!this.renderTarget)
        {
            this.renderTarget = gd.createRenderTarget({ colorTexture0: texture });
        }

        return {
            texture: texture,
            store: []
        };
    };
    return SharedCloudContext;
})();

CloudManager.prototype.union = function cloudManagerUnionFn(x, y)
{
    var stack, next;
    // x = find(x)
    while (x !== x.islandRoot)
    {
        next = x.islandRoot;
        x.islandRoot = stack;
        stack = x;
        x = next;
    }
    while (stack)
    {
        next = stack.islandRoot;
        stack.islandRoot = x;
        stack = next;
    }

    // y = find(y)
    while (y !== y.islandRoot)
    {
        next = y.islandRoot;
        y.islandRoot = stack;
        stack = y;
        y = next;
    }
    while (stack)
    {
        next = stack.islandRoot;
        stack.islandRoot = y;
        stack = next;
    }

    if (x !== y)
    {
        if (x.islandRank < y.islandRank)
        {
            x.islandRoot = y;
        }
        else if (y.islandRank < x.islandRank)
        {
            y.islandRoot = x;
        }
        else
        {
            y.islandRoot = x;
            x.islandRank += 1;
        }
    }
};

CloudManager.prototype.find = function cloudManagerFind(x)
{
    if (x === x.islandRoot)
    {
        return x;
    }

    var stack = null;
    var next;
    while (x !== x.islandRoot)
    {
        next = x.islandRoot;
        x.islandRoot = stack;
        stack = x;
        x = next;
    }
    while (stack)
    {
        next = stack.islandRoot;
        stack.islandRoot = x;
        stack = next;
    }
    return x;
};

CloudManager.prototype.isValidCloudType = function cloudManagerIsValidCloudType(type)
{
    return this.cloudTypes.hasOwnProperty(type);
};

function CloudRenderable(globals, cloudManager, cloud)
{
    this.disabled = false;
    this.geometryType = "Nimbus3000";
    this.drawParameters = null;
    this.diffuseDrawParameters = null;
    this.shadowDrawParameters = null;
    this.sharedMaterial = null;
    this.worldExtents = null;
    this.distance = 0;
    this.frameVisible = 0;
    this.rendererInfo = null;
    this.halfExtents = null;
    this.center = null;
    this.queryCounter = 0;
    this.diffuseShadowDrawParameters = null;
    this.shadowMappingDrawParameters = null;
    this.geometry = null;
    this.surface = null;
    this.techniqueParameters = null;
    this.skinController = null;
    this.isNormal = false;
    this.node = null;
    this.normalInfos = null;
    this.globals = globals;
    this.invalidated = false;
    this.worldExtentsUpdate = 0;
    this.material = null;

    if (!CloudRenderable.material)
    {
        var material = CloudRenderable.material = Material.create(globals.graphicsDevice);
        material.meta.far = false;
        material.meta.transparent = true;
        material.meta.decal = false;
        material.meta.noshadows = true;
    }

    this.sharedMaterial = CloudRenderable.material;
    this.rendererInfo = {};
    this.worldExtents = globals.mathDevice.aabbBuildEmpty();

    if (!this.scratchWorld)
    {
        CloudRenderable.prototype.scratchWorld = globals.mathDevice.m43BuildIdentity();
    }

    this.techniqueParameters = globals.graphicsDevice.createTechniqueParameters({
        // set in cloud construction.
        cloudCenterOffset  : globals.mathDevice.v3BuildZero(),
        cloudHalfExtents   : globals.mathDevice.v3BuildZero(),
        clusterCenterOffset: null,
        clusterHalfExtents : null,
        // updated by updateCloud.
        cloudPosition      : globals.mathDevice.v3BuildZero(),
        cameraPosition     : globals.mathDevice.v3BuildZero(),
        billboardDirection : globals.mathDevice.v3BuildZero(),
        // updated by renderUpdate.
        viewProjection     : null,
        cloudDistance      : 0.0
    });

    this.imposterTechniqueParameters = globals.graphicsDevice.createTechniqueParameters({
        // set by updateImposter on first render.
        imposterUVRect     : globals.mathDevice.v4BuildZero(),
        imposter           : null,
        // updated by updateImposter(Light).
        imposterOffset     : globals.mathDevice.v3BuildZero(),
        // updated by renderUpdate.
        viewProjection     : null
    });

    var passIndex = CartoonRendering.passIndex.transparent;

    /*jshint white: false*/
    var parameters = globals.graphicsDevice.createDrawParameters();
    parameters.setVertexBuffer(0, cloud.vertexBufferAllocation.vertexBuffer);
    var baseIndex = cloud.vertexBufferAllocation.baseIndex;
    var startIndex = ((baseIndex / 4) * 6);
    if ((baseIndex & 3) === 0 &&
        (startIndex + cloud.numIndices) <= cloudManager.indexBuffer.numIndices)
    {
        parameters.setOffset(0, 0);
        parameters.firstIndex = startIndex;
    }
    else
    {
        parameters.setOffset(0, baseIndex);
        parameters.firstIndex = 0;
    }
    parameters.setSemantics(0, cloudManager.semantics);
    parameters.technique   = cloudManager.technique;
    parameters.primitive   = cloudManager.primitive;
    parameters.count       = cloud.numIndices;
    parameters.indexBuffer = cloudManager.indexBuffer;
    parameters.userData    = { passIndex: passIndex };
    parameters.sortKey     = 0;
    parameters.setTechniqueParameters(0, null); // per-renderable parameters.
    parameters.setTechniqueParameters(1, cloud.cloudType.techniqueParameters);
    this.nonImposteredDrawParameters = [parameters];
    /*jshint white: true*/

    var imposterParameters = globals.graphicsDevice.createDrawParameters();
    imposterParameters.setVertexBuffer(0, cloudManager.sharedCloudContext.vertexBuffer);
    imposterParameters.setSemantics(0, cloudManager.imposterSemantics);
    imposterParameters.technique   = cloudManager.imposterTechnique;
    imposterParameters.primitive   = cloudManager.imposterPrimitive;
    imposterParameters.count       = 4;
    imposterParameters.userData    = { passIndex: passIndex };
    imposterParameters.sortKey     = 0;
    imposterParameters.setTechniqueParameters(0, null); // per-renderable imposterParameters.
    this.imposteredDrawParameters = [imposterParameters];

    this.cloudManager = cloudManager;
    this.cloud = cloud;
}

CloudRenderable.prototype = {

    scratchWorld: null,

    addCustomWorldExtents: function (/*extents*/)
    {
    },
    clone: function ()
    {
        return null;
    },
    getCustomWorldExtents: function ()
    {
        return this.getWorldExtents();
    },
    getMaterial: function ()
    {
        return this.sharedMaterial;
    },
    getWorldExtents: function ()
    {
        var node = this.node;
        if (node.worldUpdate > this.worldExtentsUpdate || this.invalidated)
        {
            this.invalidated = false;
            this.updateWorldExtents();
            this.worldExtentsUpdate = node.worldUpdate;
        }
        return this.worldExtents;
    },
    hasCustomWorldExtents: function ()
    {
        return true;
    },
    removeCustomWorldExtents: function ()
    {
    },
    setMaterial: function (/*material*/)
    {
    },
    getNode: function ()
    {
        return this.node;
    },

    setNode: function (node)
    {
        if (this.node)
        {
            this.node.renderableWorldExtentsRemoved();
        }

        this.node = node;

        if (this.node)
        {
            this.node.renderableWorldExtentsUpdated(false);
        }

        this.worldExtentsUpdate = -1;
    },
    isSkinned: function ()
    {
        return false;
    },

    setLocalTransform: function ()
    {
        this.invalidated = true;
        if (this.node)
        {
            this.node.renderableWorldExtentsUpdated(true);
        }
    },

    updateWorldExtents: function (view, dst)
    {
        var center = this.center;
        var halfExtents = this.halfExtents;
        var worldExtents = dst === undefined ? this.worldExtents : dst;
        var node = this.node;
        var nodeWorld = node.world;

        var world;
        if (view)
        {
            if (!node.local && !node.parent)
            {
                world = view;
            }
            else
            {
                world = this.globals.mathDevice.m43Mul(nodeWorld, view, this.scratchWorld);
            }
        }
        else
        {
            world = nodeWorld;
        }

        var m0  = world[0];
        var m1  = world[1];
        var m2  = world[2];
        var m3  = world[3];
        var m4  = world[4];
        var m5  = world[5];
        var m6  = world[6];
        var m7  = world[7];
        var m8  = world[8];
        var m9  = world[9];
        var m10 = world[10];
        var m11 = world[11];

        var c0  = center[0];
        var c1  = center[1];
        var c2  = center[2];
        var ct0 = m9  + (m0 * c0 + m3 * c1 + m6 * c2);
        var ct1 = m10 + (m1 * c0 + m4 * c1 + m7 * c2);
        var ct2 = m11 + (m2 * c0 + m5 * c1 + m8 * c2);

        var h0  = halfExtents[0];
        var h1  = halfExtents[1];
        var h2  = halfExtents[2];
        var ht0 = ((m0 < 0 ? -m0 : m0) * h0 + (m3 < 0 ? -m3 : m3) * h1 + (m6 < 0 ? -m6 : m6) * h2);
        var ht1 = ((m1 < 0 ? -m1 : m1) * h0 + (m4 < 0 ? -m4 : m4) * h1 + (m7 < 0 ? -m7 : m7) * h2);
        var ht2 = ((m2 < 0 ? -m2 : m2) * h0 + (m5 < 0 ? -m5 : m5) * h1 + (m8 < 0 ? -m8 : m8) * h2);

        worldExtents[0] = (ct0 - ht0);
        worldExtents[1] = (ct1 - ht1);
        worldExtents[2] = (ct2 - ht2);
        worldExtents[3] = (ct0 + ht0);
        worldExtents[4] = (ct1 + ht1);
        worldExtents[5] = (ct2 + ht2);
    },

    destroy: function ()
    {
    },

    // This is a copy of the same method on CartoonRendering
    buildSortKey: function (techniqueId, materialId, distance, index)
    {
        return (((techniqueId % 1024) * (1024 * 1024 * 1024)) +
                ((materialId % 1024) * (1024 * 1024)) +
                ((distance % 1024) * (1024)) +
                (index % 1024));
    },

    renderUpdate: function (camera)
    {
        var parameters = this.techniqueParameters;
        var cloudManager = this.cloudManager;
        var cloud = this.cloud;
        var position = cloud.position;
        var dx = camera.matrix[9]  - position[0];
        var dy = camera.matrix[10] - position[1];
        var dz = camera.matrix[11] - position[2];
        var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var cloudDistance = VMath.clamp(1.0 - distance / 7000.0, 0, 1);
        parameters.cloudDistance = cloudDistance;

        if (!this.globals.debugDrawFlags.disableImposters &&
            cloudManager.shouldUseImposter(cloud, camera) &&
            (cloud.hasImposter || cloudManager.sharedCloudContext.canAllocate()))
        {
            if (cloudManager.shouldUpdateImposter(cloud, camera))
            {
                cloudManager.updateCloud(cloud, camera, parameters);
                cloudManager.updateImposter(cloud, camera, this);
            }
            else
            {
                cloudManager.updateImposterLight(cloud, camera);
            }
            parameters = this.imposterTechniqueParameters;
            parameters.viewProjection = camera.viewProjectionMatrix;
            this.drawParameters = this.imposteredDrawParameters;
            var drawParameters = this.drawParameters[0];
            drawParameters.firstIndex = cloud.imposterCtx.vertexIndex;
            if (cloud.distant)
            {
                drawParameters.userData.passIndex = CartoonRendering.passIndex.decal;
                drawParameters.sortKey = this.buildSortKey(cloudManager.farImposterTechnique.id,
                                                           parameters.imposter.id,
                                                           Math.floor(cloudDistance * 1023),
                                                           (cloud.imposterCtx.vertexIndex >> 2));
                drawParameters.technique = cloudManager.farImposterTechnique;
            }
            else
            {
                drawParameters.userData.passIndex = CartoonRendering.passIndex.transparent;
                drawParameters.sortKey = 0;
                drawParameters.technique = cloudManager.imposterTechnique;
            }
            drawParameters.setTechniqueParameters(0, parameters);
        }
        else
        {
            if (cloud.hasImposter)
            {
                cloudManager.sharedCloudContext.release(cloud.imposterCtx);
                cloud.imposterCtx = null;
                cloud.hasImposter = false;
            }
            cloudManager.updateCloud(cloud, camera, parameters);
            parameters.viewProjection = camera.viewProjectionMatrix;
            this.drawParameters = this.nonImposteredDrawParameters;
            this.drawParameters[0].technique = cloud.distant ? cloudManager.farTechnique : cloudManager.technique;
            this.drawParameters[0].setTechniqueParameters(0, parameters);
        }
        this.shadowDrawParameters = this.drawParameters;
    }
};

function notToBeDestroyed(entity)
{
    return !entity.toBeDestroyed;
}

CloudManager.prototype.build = function cloudManagerBuild()
{
    var spawners = EntityComponentBase.getEntitiesWithEC("ECCloudSpawner").filter(notToBeDestroyed);
    var numSpawners = spawners.length;
    var i, spawner, ec, j = 0;
    for (i = 0; i < numSpawners; i += 1)
    {
        spawner = spawners[i];
        ec = spawner.getEC("ECCloudSpawner");
        if (!this.isValidCloudType(ec.type))
        {
            spawner.setToBeDestroyed();
            continue;
        }

        // prepare for DSF
        spawner.islandRoot = spawner;
        spawner.islandRank = 0;
        spawners[j] = spawner;
        j += 1;
    }
    numSpawners = j;

    // build DSF
    //
    // unify spawners if they intersect
    var loc, scale;
    for (i = 0; i < numSpawners; i += 1)
    {
        var s1 = spawners[i];
        loc = s1.getv3Location();
        scale = s1.getV3Scale();
        var ex0 = loc[0];
        var ex1 = loc[1] + scale[1] / 2;
        var ex2 = loc[2];
        var es0 = scale[0] / 2;
        var es1 = scale[1] / 2;
        var es2 = scale[2] / 2;
        for (j = i + 1; j < numSpawners; j += 1)
        {
            var s2 = spawners[j];
            loc = s2.getv3Location();
            scale = s2.getV3Scale();
            var fx0 = ex0 - loc[0];
            var fx1 = ex1 - (loc[1] + scale[1] / 2);
            var fx2 = ex2 - loc[2];
            var fs0 = es0 + (scale[0] / 2);
            var fs1 = es1 + (scale[1] / 2);
            var fs2 = es2 + (scale[2] / 2);

            if ((fx0 * fx0 < fs0 * fs0) &&
                (fx1 * fx1 < fs1 * fs1) &&
                (fx2 * fx2 < fs2 * fs2))
            {
                this.union(s1, s2);
            }
        }
    }

    // build clouds
    var cloudGroups = [];
    var group;
    for (i = 0; i < numSpawners; i += 1)
    {
        spawner = spawners[i];
        var root = this.find(spawner);
        group = root.group;
        if (!group)
        {
            group = root.group = [];
            cloudGroups.push(root.group);
        }
        group.push(spawner.getEC("ECCloudSpawner"));
    }

    function clusterCompare(a, b)
    {
        return a.cluster < b.cluster ? -1 :
               a.cluster > b.cluster ?  1 :
               0;
    }

    // segment cloud into defined cluster groups and build cloud entities.
    var md = this.globals.mathDevice;
    var cloudTypes = this.cloudTypes;
    var numClouds = cloudGroups.length;
    var clouds = this.clouds;
    var extents = new Float32Array([1e30, 1e30, 1e30, -1e30, -1e30, -1e30]);
    var clusterExtents = new Float32Array([1e30, 1e30, 1e30, -1e30, -1e30, -1e30]);
    for (var ci = 0; ci < numClouds; ci += 1)
    {
        group = cloudGroups[ci];
        group.sort(clusterCompare);

        var cloudSize = group.length;
        var currentCluster = [group[0]];
        var clusters = [currentCluster];
        var type = null;
        for (j = 0; j < cloudSize; j += 1)
        {
            ec = group[j];
            if (!type && ec.type)
            {
                type = ec.type;
            }
            debug.assert(!type || !ec.type || type === ec.type,
                         "Cloud has inconsistent types: " + type + " <> " + ec.type);
            if (ec.cluster !== currentCluster[0].cluster)
            {
                currentCluster = [ec];
                clusters.push(currentCluster);
            }
            else
            {
                currentCluster.push(ec);
            }
        }

        debug.assert(cloudTypes.hasOwnProperty(type), "Cloud type does not exist: " + type);

        var cloud = {
            distant: group[0].archetype.distant || false
        };
        clouds.push(cloud);
        var cloudType = cloudTypes[type];

        extents[0] = 1e30;
        extents[1] = 1e30;
        extents[2] = 1e30;
        extents[3] = -1e30;
        extents[4] = -1e30;
        extents[5] = -1e30;

        // create cloud sprites, compute weighted centres and extents all in world space.
        var cloudClusters = cloud.clusters = [];
        var numClusters = clusters.length;
        var sprites = cloud.sprites = [];
        var position, cluster, cc, he;
        var center = cloud.localCenter = md.v3BuildZero();
        var weight = 0;
        var cloudWeight, halfExtents;
        for (i = 0; i < numClusters; i += 1)
        {
            var componentCluster = clusters[i];
            var clusterSize = componentCluster.length;
            cluster = {
                id : i,
                localCenter : new Float32Array(3),
                halfExtents : new Float32Array(3),
                radius: 0.0
            };
            cloudClusters.push(cluster);

            clusterExtents[0] = 1e30;
            clusterExtents[1] = 1e30;
            clusterExtents[2] = 1e30;
            clusterExtents[3] = -1e30;
            clusterExtents[4] = -1e30;
            clusterExtents[5] = -1e30;

            var clusterCenter = cluster.localCenter;
            var clusterWeight = 0;

            for (j = 0; j < clusterSize; j += 1)
            {
                var component = componentCluster[j];
                cc = component.entity.getv3Location();
                he = component.entity.getV3Scale();

                cloudWeight = he[0] * he[1] * he[2];
                clusterCenter[0] += cc[0] * cloudWeight;
                clusterCenter[1] += cc[1] * cloudWeight;
                clusterCenter[2] += cc[2] * cloudWeight;
                clusterWeight += cloudWeight;

                var scaleLength = Math.min(he[0], he[1], he[2]);
                var spriteCount = 4 * Math.min(4, Math.ceil(cloudWeight / (8 * Math.pow(scaleLength, 3))));
                var buffer = new Float32Array(spriteCount * 3);
                var bufferOffset = 0;
                for (var k = 0; k < spriteCount; k += 1)
                {
                    var uv = Math.random();
                    var element = null;
                    for (var elementIndex = 0; elementIndex < cloudType.elements.length; elementIndex += 1)
                    {
                        if (uv < cloudType.elements[elementIndex].weight)
                        {
                            element = cloudType.elements[elementIndex];
                            break;
                        }
                    }
                    var spriteScale = scaleLength * (1 + Math.random()) / 1.5 * element.baseScale;
                    position = buffer.subarray(bufferOffset, (bufferOffset + 3));
                    bufferOffset += 3;
                    position[0] = cc[0] + (Math.random() - 0.5) * he[0];
                    position[1] = cc[1] + (Math.random() - 0.5) * he[1];
                    position[2] = cc[2] + (Math.random() - 0.5) * he[2];
                    var halfScale = spriteScale / 2;
                    var x0 = position[0] - halfScale;
                    var x1 = position[0] + halfScale;
                    var y0 = position[1] - halfScale;
                    var y1 = position[1] + halfScale;
                    var z0 = position[2] - halfScale;
                    var z1 = position[2] + halfScale;
                    clusterExtents[0] = (x0 < clusterExtents[0]) ? x0 : clusterExtents[0];
                    clusterExtents[1] = (y0 < clusterExtents[1]) ? y0 : clusterExtents[1];
                    clusterExtents[2] = (z0 < clusterExtents[2]) ? z0 : clusterExtents[2];
                    clusterExtents[3] = (x1 > clusterExtents[3]) ? x1 : clusterExtents[3];
                    clusterExtents[4] = (y1 > clusterExtents[4]) ? y1 : clusterExtents[4];
                    clusterExtents[5] = (z1 > clusterExtents[5]) ? z1 : clusterExtents[5];

                    sprites.push({
                        position: position,
                        scale: spriteScale,
                        element: element,
                        rotation: Math.random() * (cloudType.maxRotation - cloudType.minRotation) + cloudType.minRotation,
                        cluster: cluster
                    });
                }
            }

            center[0] += clusterCenter[0];
            center[1] += clusterCenter[1];
            center[2] += clusterCenter[2];
            weight += clusterWeight;

            clusterWeight = 1 / clusterWeight;
            clusterCenter[0] *= clusterWeight;
            clusterCenter[1] *= clusterWeight;
            clusterCenter[2] *= clusterWeight;

            extents[0] = clusterExtents[0] < extents[0] ? clusterExtents[0] : extents[0];
            extents[1] = clusterExtents[1] < extents[1] ? clusterExtents[1] : extents[1];
            extents[2] = clusterExtents[2] < extents[2] ? clusterExtents[2] : extents[2];
            extents[3] = clusterExtents[3] > extents[3] ? clusterExtents[3] : extents[3];
            extents[4] = clusterExtents[4] > extents[4] ? clusterExtents[4] : extents[4];
            extents[5] = clusterExtents[5] > extents[5] ? clusterExtents[5] : extents[5];

            halfExtents = cluster.halfExtents;
            halfExtents[0] = (clusterExtents[3] - clusterExtents[0]) * 0.5;
            halfExtents[1] = (clusterExtents[4] - clusterExtents[1]) * 0.5;
            halfExtents[2] = (clusterExtents[5] - clusterExtents[2]) * 0.5;

            cluster.radius = md.v3Length(halfExtents);
        }

        weight = 1 / weight;
        center[0] *= weight;
        center[1] *= weight;
        center[2] *= weight;

        position = cloud.position = new Float32Array(3);
        position[0] = (extents[0] + extents[3]) * 0.5;
        position[1] = (extents[1] + extents[4]) * 0.5;
        position[2] = (extents[2] + extents[5]) * 0.5;

        halfExtents = cloud.halfExtents = new Float32Array(3);
        halfExtents[0] = (extents[3] - extents[0]) * 0.5;
        halfExtents[1] = (extents[4] - extents[1]) * 0.5;
        halfExtents[2] = (extents[5] - extents[2]) * 0.5;

        cloud.radius = md.v3Length(halfExtents);

        // Take to local coordinates
        center[0] -= position[0];
        center[1] -= position[1];
        center[2] -= position[2];
        for (i = 0; i < numClusters; i += 1)
        {
            cluster = cloudClusters[i];
            cluster.localCenter[0] -= position[0];
            cluster.localCenter[1] -= position[1];
            cluster.localCenter[2] -= position[2];
        }
        var numSprites = sprites.length;
        for (i = 0; i < numSprites; i += 1)
        {
            var sprite = sprites[i];
            sprite.position[0] -= position[0];
            sprite.position[1] -= position[1];
            sprite.position[2] -= position[2];
        }

        debug.assert(sprites.length < this.maxCloudSprites);
        cloud.vertexBufferAllocation = this.vertexBufferManager.allocate(sprites.length * 4,
                                                                         ['FLOAT4', 'FLOAT1', 'FLOAT3']);

        cloud.numIndices = sprites.length * 6;
        cloud.cloudType = cloudType;

        cloud.hasImposter = false;
        cloud.imposterDirection = md.v3BuildZero();
        cloud.imposterOrigin = md.v3BuildZero();
        cloud.imposterCtx = null;
        cloud.ctxSize = -1;

        var renderable = cloud.renderable = new CloudRenderable(this.globals, this, cloud);
        var node = cloud.node = SceneNode.create({
            name: "nimbus" + this.rootNodeID,
            dynamic: false
        });
        node.addRenderable(renderable);
        renderable.center = cloud.position;
        renderable.halfExtents = md.v3Copy(cloud.halfExtents);

        cloud.imposterCtx = null;

        this.rootNodeID += 1;
        this.globals.scene.addRootNode(node);

        var parameters = renderable.techniqueParameters;
        md.v3Copy(cloud.localCenter, parameters.cloudCenterOffset);
        md.v3Copy(cloud.halfExtents, parameters.cloudHalfExtents);
        var clusterCenterOffset = parameters.clusterCenterOffset = new Float32Array(numClusters * 3);
        var clusterHalfExtents  = parameters.clusterHalfExtents = new Float32Array(numClusters * 3);
        for (j = 0; j < numClusters; j += 1)
        {
            cluster = cloudClusters[j];
            clusterCenterOffset[j * 3]     = cluster.localCenter[0];
            clusterCenterOffset[j * 3 + 1] = cluster.localCenter[1];
            clusterCenterOffset[j * 3 + 2] = cluster.localCenter[2];
            clusterHalfExtents[j * 3]      = cluster.halfExtents[0];
            clusterHalfExtents[j * 3 + 1]  = cluster.halfExtents[1];
            clusterHalfExtents[j * 3 + 2]  = cluster.halfExtents[2];
        }
    }

    // destroy cloud spawners
    for (i = 0; i < numSpawners; i += 1)
    {
        spawners[i].setToBeDestroyed();
    }
};

CloudManager.prototype.shouldUseImposter = function cloudManagerShouldUseImposter(cloud, camera)
{
    var m = camera.matrix;

    var position = cloud.position;
    var dx = m[9]  - position[0];
    var dy = m[10] - position[1];
    var dz = m[11] - position[2];
    var dl = (dx * dx) + (dy * dy) + (dz * dz);

    var proj = m[6] * dx + m[7] * dy + m[8] * dz;
    var radius = cloud.radius;
    if (cloud.hasImposter)
    {
        return dl > ((200 + radius) * (200 + radius)) && proj > (radius + 100);
    }
    else
    {
        return dl > ((300 + radius) * (300 + radius)) && proj > (radius + 200);
    }
};

CloudManager.prototype.updateImposterLight = function cloudManagerUpdateImposterLight(cloud, camera)
{
    // rotate/scale imposter to geometrically smooth transitions between imposter updates.
    var parameters = cloud.renderable.imposterTechniqueParameters;
    var offset = parameters.imposterOffset;
    var direction = cloud.imposterDirection;
    var d = cloud.imposterDistance;
    var origin = cloud.imposterOrigin;
    offset[0] = 0.18 * (camera.matrix[9]  - direction[0] * d - origin[0]);
    offset[1] = 0.18 * (camera.matrix[10] - direction[1] * d - origin[1]);
    offset[2] = 0.18 * (camera.matrix[11] - direction[2] * d - origin[2]);
};

CloudManager.prototype.shouldUpdateImposter = function cloudManagerShouldUpdateImposter(cloud, camera)
{
    if (!cloud.hasImposter)
    {
        return true;
    }

    var m = camera.matrix;
    var d = cloud.imposterDirection;
    var o = cloud.imposterOrigin;
    var dx = m[9]  - o[0];
    var dy = m[10] - o[1];
    var dz = m[11] - o[2];
    var dl = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
    var dot = (d[0] * dx) + (d[1] * dy) + (d[2] * dz);

    return dot < (0.999991342 * dl) || // approximately 0.35 degrees parallax
           (dl / cloud.imposterDistance) > 1.15 || // allow +-quarter distance before re-render.
           (dl / cloud.imposterDistance) < 0.85;
};

CloudManager.prototype.imposterExtents = new Float32Array(6);
CloudManager.prototype.imposterProjection = new Float32Array(4 * 4);
CloudManager.prototype.imposterClearColor = new Float32Array(4);
CloudManager.prototype.updateImposter = function cloudManagerUpdateImposterFn(cloud, camera, renderable)
{
    var md = this.globals.mathDevice;

    // compute cloud extents in camera view space.
    var extents = this.imposterExtents;
    extents[0] = 1e10;
    extents[1] = 1e10;
    extents[2] = 1e10;
    extents[3] = -1e10;
    extents[4] = -1e10;
    extents[5] = -1e10;

    //renderable.updateWorldExtents(camera.viewMatrix, extents);
    var sprites = cloud.sprites;
    var spriteCount = sprites.length;

    var m = camera.viewMatrix;
    var m0  = m[0];
    var m1  = m[1];
    var m2  = m[2];
    var m3  = m[3];
    var m4  = m[4];
    var m5  = m[5];
    var m6  = m[6];
    var m7  = m[7];
    var m8  = m[8];
    var m9  = m[9];
    var m10 = m[10];
    var m11 = m[11];

    var m036 = Math.abs(m0) + Math.abs(m3) + Math.abs(m6);
    var m147 = Math.abs(m1) + Math.abs(m4) + Math.abs(m7);
    var m258 = Math.abs(m2) + Math.abs(m5) + Math.abs(m8);

    var position, p0, p1, p2;
    for (var i = 0; i < spriteCount; i += 1)
    {
        var sprite = sprites[i];
        position = sprite.position;
        p0 = position[0];
        p1 = position[1];
        p2 = position[2];
        var v0 = (m0 * p0 + m3 * p1 + m6 * p2);
        var v1 = (m1 * p0 + m4 * p1 + m7 * p2);
        var v2 = (m2 * p0 + m5 * p1 + m8 * p2);

        var scale = sprite.scale * 0.5;
        var s0 = m036 * scale;
        var s1 = m147 * scale;
        var s2 = m258 * scale;

        var x0 = v0 - s0;
        var y0 = v1 - s1;
        var z0 = v2 - s2;
        var x1 = v0 + s0;
        var y1 = v1 + s1;
        var z1 = v2 + s2;
        if (x0 < extents[0])
        {
            extents[0] = x0;
        }
        if (y0 < extents[1])
        {
            extents[1] = y0;
        }
        if (z0 < extents[2])
        {
            extents[2] = z0;
        }
        if (x1 > extents[3])
        {
            extents[3] = x1;
        }
        if (y1 > extents[4])
        {
            extents[4] = y1;
        }
        if (z1 > extents[5])
        {
            extents[5] = z1;
        }
    }

    position = cloud.position;
    p0 = position[0];
    p1 = position[1];
    p2 = position[2];
    var v00 = m9  + (m0 * p0 + m3 * p1 + m6 * p2);
    var v01 = m10 + (m1 * p0 + m4 * p1 + m7 * p2);
    var v02 = m11 + (m2 * p0 + m5 * p1 + m8 * p2);
    extents[0] += v00;
    extents[1] += v01;
    extents[2] += v02;
    extents[3] += v00;
    extents[4] += v01;
    extents[5] += v02;

    // set up projection matrix to map extents to entire buffer.
    var n = -extents[5];
    var f = -extents[2];
    var n_f = n / f;
    var l = extents[0] * (extents[0] > 0 ? n_f : 1);
    var r = extents[3] * (extents[3] < 0 ? n_f : 1);
    var b = extents[1] * (extents[1] > 0 ? n_f : 1);
    var t = extents[4] * (extents[4] < 0 ? n_f : 1);

    var projection = this.imposterProjection;
    var _rl = 1 / (r - l);
    var _tb = 1 / (t - b);
    var _fn = 1 / (f - n);
    projection[0]  = 2 * n * _rl;
    projection[5]  = 2 * n * _tb;
    projection[8]  = (r + l) * _rl;
    projection[9]  = (t + b) * _tb;
    projection[10] = (f + n) * _fn;
    projection[11] = -1;
    projection[14] = 2 * f * n * _fn;

    // set up imposter quad.
    m = camera.matrix;
    m0  = m[0];
    m1  = m[1];
    m2  = m[2];
    m3  = m[3];
    m4  = m[4];
    m5  = m[5];
    m6  = m[6];
    m7  = m[7];
    m8  = m[8];
    m9  = m[9];
    m10 = m[10];
    m11 = m[11];

    var m0l = m0 * l;
    var m1l = m1 * l;
    var m2l = m2 * l;
    var m0r = m0 * r;
    var m1r = m1 * r;
    var m2r = m2 * r;
    var m3t = m3 * t;
    var m4t = m4 * t;
    var m5t = m5 * t;
    var m3b = m3 * b;
    var m4b = m4 * b;
    var m5b = m5 * b;

    var z0 = m9  - (n * m6);
    var z1 = m10 - (n * m7);
    var z2 = m11 - (n * m8);

    var data = this.imposterVertexData;
    data[0]  = m0l + m3b + z0;
    data[1]  = m1l + m4b + z1;
    data[2]  = m2l + m5b + z2;
    data[5]  = m0l + m3t + z0;
    data[6]  = m1l + m4t + z1;
    data[7]  = m2l + m5t + z2;
    data[10] = m0r + m3b + z0;
    data[11] = m1r + m4b + z1;
    data[12] = m2r + m5b + z2;
    data[15] = m0r + m3t + z0;
    data[16] = m1r + m4t + z1;
    data[17] = m2r + m5t + z2;

    // Set parameters for imposter invalidation.
    var originX = (data[0] + data[15]) * 0.5;
    var originY = (data[1] + data[16]) * 0.5;
    var originZ = (data[2] + data[17]) * 0.5;
    var origin = cloud.imposterOrigin;
    origin[0] = originX;
    origin[1] = originY;
    origin[2] = originZ;

    var dx = m9  - originX;
    var dy = m10 - originY;
    var dz = m11 - originZ;
    var dl = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
    cloud.imposterDistance = dl;

    var direction = cloud.imposterDirection;
    dl = 1 / dl;
    direction[0] = dx * dl;
    direction[1] = dy * dl;
    direction[2] = dz * dl;

    var parameters = renderable.imposterTechniqueParameters;
    var offset = parameters.imposterOffset;
    offset[0] = offset[1] = offset[2] = 0;

    // Allocate new context if necessary
    // use square power 2 sizes to prevent fragmentation of shared texture.
    var scale = 0.0025 * n;
    var ctxSize = (1 << Math.round(Math.log(Math.max(r - l, t - b) / scale) / Math.log(2)));
    var maxCtxSize = Math.min(512, this.sharedCloudContext.pageSize);
    if (ctxSize > maxCtxSize)
    {
        ctxSize = maxCtxSize;
    }
    if (ctxSize < 32)
    {
        ctxSize = 32;
    }
    var ctx = cloud.imposterCtx;
    if (!cloud.hasImposter || cloud.ctxSize !== ctxSize)
    {
        cloud.ctxSize = ctxSize;
        if (cloud.hasImposter)
        {
            this.sharedCloudContext.release(ctx);
        }
        ctx = cloud.imposterCtx = this.sharedCloudContext.allocate(ctxSize);

        parameters.imposter       = ctx.texture;
        parameters.imposterUVRect = ctx.uvRectangle;
    }
    this.sharedCloudContext.vertexBuffer.setData(data, ctx.vertexIndex, 4);

    // Render imposter!
    parameters = renderable.techniqueParameters;
    parameters.viewProjection = md.m43MulM44(camera.viewMatrix, projection, this.viewProjection);

    var gd = this.globals.graphicsDevice;

    var renderTarget = this.sharedCloudContext.renderTarget;
    if (renderTarget.colorTexture0 !== ctx.texture)
    {
        renderTarget.setColorTexture0(ctx.texture);
    }

    gd.beginRenderTarget(renderTarget);

    gd.setTechnique(this.technique);
    gd.setScissor(
        ctx.scissorRectangle[0],
        ctx.scissorRectangle[1],
        ctx.scissorRectangle[2],
        ctx.scissorRectangle[3]
    );
    gd.clear(this.imposterClearColor);

    gd.setViewport(
        ctx.viewportRectangle[0],
        ctx.viewportRectangle[1],
        ctx.viewportRectangle[2],
        ctx.viewportRectangle[3]
    );
    gd.setTechniqueParameters(parameters);
    gd.setTechniqueParameters(cloud.cloudType.techniqueParameters);

    var vb = cloud.vertexBufferAllocation;
    var drawParameters = renderable.nonImposteredDrawParameters[0];

    gd.setStream(vb.vertexBuffer, this.semantics, drawParameters.getOffset(0));
    gd.setIndexBuffer(this.indexBuffer);

    gd.drawIndexed(this.primitive, cloud.numIndices, drawParameters.firstIndex);

    gd.endRenderTarget();
    cloud.hasImposter = true;
};

CloudManager.prototype.draw2D = function cloudManagerDraw2D()
{
//    var contexts = this.sharedCloudContext.contexts;
//    var numContexts = contexts.length;
//    var draw2D = this.globals.draw2D;
//    draw2D.begin('alpha', 'deferred');
//    var x = 0;
//    var y = 0;
//    for (var i = 0; i < numContexts; i += 1)
//    {
//        var texture = contexts[i].texture;
//        draw2D.draw({
//            destinationRectangle: [x, y, x + texture.width / 16, y + texture.height / 16],
//            texture: texture
//        });
//        x += texture.width / 16;
//    }
//    var free = this.sharedCloudContext.packer.free;
//    var numFree = free.length;
//    for (i = 0; i < free.length; i += 1)
//    {
//        var x = (this.sharedCloudContext.pageSize * free[i].bin + free[i].x) / 16;
//        var y = free[i].y / 16;
//        draw2D.draw({
//            destinationRectangle: [x, y, x + free[i].dim / 16, y + free[i].dim / 16],
//            color: [1, 0, 0, 0.5]
//        });
//    }
//    draw2D.end();
};

CloudManager.prototype.updateCloud = function cloudManagerUpdateCloudFn(cloud, camera, parameters)
{
    // cloud position
    var position = cloud.position;
    var pos0 = position[0];
    var pos1 = position[1];
    var pos2 = position[2];
    position = parameters.cloudPosition;
    position[0] = pos0;
    position[1] = pos1;
    position[2] = pos2;

    // camera position
    var matrix = camera.matrix;
    var cpos0 = matrix[9];
    var cpos1 = matrix[10];
    var cpos2 = matrix[11];
    var cat0 = matrix[6];
    var cat1 = matrix[7];
    var cat2 = matrix[8];
    position = parameters.cameraPosition;
    position[0] = cpos0;
    position[1] = cpos1;
    position[2] = cpos2;

    // focus position for billboarding.
    // set back from camera to avoid 'red-sea' effect when flying through a cloud.
    var focus0 = cpos0 + cat0 * 10000;
    var focus1 = cpos1 + cat1 * 10000;
    var focus2 = cpos2 + cat2 * 10000;

    // set a consistent billboard direction based on weighted centre of cloud
    // avoid cloud sprites clipping against eachother and have a well defined ordering.
    var at0 = pos0 - focus0;
    var at1 = (pos1 - focus1) * 0.25;
    var at2 = pos2 - focus2;
    var dir = parameters.billboardDirection;
    var atl = 1 / Math.sqrt(at0 * at0 + at1 * at1 + at2 * at2);
    dir[0] = at0 * atl;
    dir[1] = at1 * atl;
    dir[2] = at2 * atl;

    // sort sprites by distance.
    var sprites = cloud.sprites;
    var numSprites = sprites.length;
    var unstableMin = numSprites;
    var unstableMax = 0;
    var i, sprite, distance;
    for (i = 0; i < numSprites; i += 1)
    {
        sprite = sprites[i];
        position = sprite.position;
        distance = at0 * position[0] +
                   at1 * position[1] +
                   at2 * position[2];
        sprite.distance = distance;

        // insertion sort as temporally speaking, the sprite order is stable.
        var j = i;
        while (j > 0 && sprites[j - 1].distance > distance)
        {
            sprites[j] = sprites[j - 1];
            j -= 1;
        }
        if (j !== i)
        {
            sprites[j] = sprite;
            if (j < unstableMin)
            {
                unstableMin = j;
            }
            if (i >= unstableMax)
            {
                unstableMax = i + 1;
            }
        }
    }

    if (!cloud.dataSet)
    {
        cloud.dataSet = true;
        unstableMin = 0;
        unstableMax = numSprites;
    }

    if (unstableMin < unstableMax)
    {
        // Rebuild cloud vertex data after sorting for effected sprites.
        var vb = cloud.vertexBufferAllocation;
        var fdata = this.vertexData;
        var dataPtr = 0;
        var rot, scale;
        for (i = unstableMin; i < unstableMax; i += 1)
        {
            sprite = sprites[i];
            var clusterId = sprite.cluster.id;
            var elementId = sprite.element.id;

            position = sprite.position;
            pos0 = position[0];
            pos1 = position[1];
            pos2 = position[2];
            rot = sprite.rotation;
            scale = sprite.scale;

            fdata[dataPtr]      = pos0;
            fdata[dataPtr + 1]  = pos1;
            fdata[dataPtr + 2]  = pos2;
            fdata[dataPtr + 3]  = rot;
            fdata[dataPtr + 4]  = scale;
            fdata[dataPtr + 5]  = 0;
            fdata[dataPtr + 6]  = clusterId;
            fdata[dataPtr + 7]  = elementId;

            fdata[dataPtr + 8]  = pos0;
            fdata[dataPtr + 9]  = pos1;
            fdata[dataPtr + 10]  = pos2;
            fdata[dataPtr + 11]  = rot;
            fdata[dataPtr + 12] = scale;
            fdata[dataPtr + 13] = 1;
            fdata[dataPtr + 14]  = clusterId;
            fdata[dataPtr + 15]  = elementId;

            fdata[dataPtr + 16] = pos0;
            fdata[dataPtr + 17] = pos1;
            fdata[dataPtr + 18] = pos2;
            fdata[dataPtr + 19] = rot;
            fdata[dataPtr + 20] = scale;
            fdata[dataPtr + 21] = 2;
            fdata[dataPtr + 22]  = clusterId;
            fdata[dataPtr + 23]  = elementId;

            fdata[dataPtr + 24] = pos0;
            fdata[dataPtr + 25] = pos1;
            fdata[dataPtr + 26] = pos2;
            fdata[dataPtr + 27] = rot;
            fdata[dataPtr + 28] = scale;
            fdata[dataPtr + 29] = 3;
            fdata[dataPtr + 30]  = clusterId;
            fdata[dataPtr + 31]  = elementId;

            dataPtr += 32;
        }
        vb.vertexBuffer.setData(fdata, (vb.baseIndex + (unstableMin * 4)), ((unstableMax - unstableMin) * 4));
    }
};

CloudManager.prototype.update = function cloudManagerUpdate(/*deltaTime*/)
{
    var md = this.globals.mathDevice;
    var dd = this.globals.debugDrawFlags.clouds ? this.globals.debugDraw : null;

    var camera = this.globals.gameManager.gameCamera;
    var cameraForward = camera.currentV3Direction;

    var clouds = this.clouds;
    var numClouds = clouds.length;
    var i, cloud;
    for (i = 0; i < numClouds; i += 1)
    {
        cloud = clouds[i];
        if (dd)
        {
            dd.drawDebugPoint(cloud.position, 1, 1, 1);
            dd.drawDebugPoint(md.v3Add(cloud.position, cloud.localCenter), 1, 0, 0);
            var extents = [
                cloud.position[0] - cloud.halfExtents[0],
                cloud.position[1] - cloud.halfExtents[1],
                cloud.position[2] - cloud.halfExtents[2],
                cloud.position[0] + cloud.halfExtents[0],
                cloud.position[1] + cloud.halfExtents[1],
                cloud.position[2] + cloud.halfExtents[2]
            ];
            dd.drawDebugExtents(extents, 1, 0, 0);

            var clusters = cloud.clusters;
            var numClusters = clusters.length;
            var j, cluster;
            for (j = 0; j < numClusters; j += 1)
            {
                cluster = clusters[j];
                var pos = md.v3Add(cloud.position, cluster.localCenter);
                dd.drawDebugPoint(pos, 0, 1, 0);
                extents = [
                    pos[0] - cluster.halfExtents[0],
                    pos[1] - cluster.halfExtents[1],
                    pos[2] - cluster.halfExtents[2],
                    pos[0] + cluster.halfExtents[0],
                    pos[1] + cluster.halfExtents[1],
                    pos[2] + cluster.halfExtents[2]
                ];
                dd.drawDebugExtents(extents, 0, 1, 0);
            }

            var sprites = cloud.sprites;
            var numSprites = sprites.length;
            var sprite;
            for (j = 0; j < numSprites; j += 1)
            {
                sprite = sprites[j];
                dd.drawDebugCircle(md.v3Add(cloud.position, sprite.position), cameraForward, sprite.scale / 2, 0, 0, 1);
            }
        }
    }
};

CloudManager.prototype.clear = function cloudManagerClear()
{
    var clouds = this.clouds;
    var numClouds = clouds.length;
    var i, cloud;
    for (i = 0; i < numClouds; i += 1)
    {
        cloud = clouds[i];
        this.vertexBufferManager.free(cloud.vertexBufferAllocation);
        cloud.vertexBufferAllocation = null;
        if (cloud.imposterCtx)
        {
            this.sharedCloudContext.release(cloud.imposterCtx);
        }
        this.globals.scene.removeRootNode(cloud.node);
    }
    this.clouds.length = 0;
};

