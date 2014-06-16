//
//  SimpleSceneLoader
//  ===========
//
//  Helper class to load into a scene with a single line call and an instant return scene node.
//  also deals with multiple calls to the same asset and clones appropriately.
//

/*global Config: false*/
/*global SceneLoader: false*/
/*global SceneNode: false*/

function SimpleSceneLoader() {}

SimpleSceneLoader.prototype =
{
    isLoadingMesh : function isLoadingMeshFn(inputAssetPath)
    {
        return this.assetCache[inputAssetPath] !== undefined;
    },

    isLoading : function isLoadingFn()
    {
        return this.loadingAssetCounter > 0;
    },

    preload : function preloadFn(inputAssetPath, stationary, numInstances, loadOptions)
    {
        if (this.assetCache[inputAssetPath] === undefined)
        {
            var parameters =
            {
                name: inputAssetPath + this.loadAssetCounter.toString(),
                local: undefined,
                dynamic: (stationary !== undefined ? !stationary : true),
                disabled: false,
                keepVertexData : (Config.debugEnableWireframe)
            };

            this._loadAsset(inputAssetPath, parameters, stationary, numInstances, loadOptions);

            this.loadAssetCounter += 1;
        }
    },

    load : function loadFn(inputAssetPath, locationMatrix, stationary, parentNode, numInstances, loadOptions)
    {
        var thisLocationMatrix = (locationMatrix ? locationMatrix : this.globals.mathDevice.m43BuildIdentity());

        var parameters =
        {
            name: inputAssetPath + this.loadAssetCounter.toString(),
            local: thisLocationMatrix,
            dynamic: (stationary !== undefined ? !stationary : true),
            disabled: false,
            keepVertexData : (Config.debugEnableWireframe)
        };

        var toReturn    = parentNode;
        if (!toReturn)
        {
            toReturn    = SceneNode.create(parameters);
            this.globals.scene.addRootNode(toReturn);
            this.createdNodes +=  1;
        }

        var thisAssetCache = this.assetCache[inputAssetPath];
        if (thisAssetCache === undefined)
        {
            thisAssetCache = this._loadAsset(inputAssetPath, parameters, stationary, numInstances, loadOptions);
        }

        if (!thisAssetCache.loadedNode)
        {
            thisAssetCache.queue.push({
                node        : toReturn,
                localMatrix : (parentNode ? this.globals.mathDevice.m43Copy(thisLocationMatrix) : undefined)
            });
        }
        else
        {
            this._loadAssetInstance(thisAssetCache,
                                    toReturn,
                                    (parentNode ? thisLocationMatrix : undefined));
        }

        this.loadAssetCounter += 1;

        return toReturn;
    },

    _loadAssetInstance : function _loadAssetInstanceFn(assetCache, node, localMatrix)
    {
        this.createdNodes      += 1;
        this.cloneAssetCounter += 1;

        var rootNode        = assetCache.rootNode;
        var new_child_name  = rootNode.name + '_copy' + this.cloneAssetCounter.toString();

        // We only have a local matrix when we have an external parent, which forces us to clone the dummy root node
        if (localMatrix)
        {
            var new_child = rootNode.clone(new_child_name);
            new_child.setLocalTransform(localMatrix);
            node.addChild(new_child);
        }
        else
        {
            var children = rootNode.children;
            var numChildren = children.length;
            var n;
            for (n = 0; n < numChildren; n += 1)
            {
                node.addChild(children[n].clone());
            }
        }
    },

    _loadAsset : function _loadAssetFn(inputAssetPath, parameters, stationary, numInstances, loadOptions)
    {
        this.uniqueMeshes +=  1;

        var thisAssetCache =
        {
            rootNode    : SceneNode.create(parameters),
            loadedNode  : null,
            queue       : []
        };

        this.assetCache[inputAssetPath] = thisAssetCache;

        var that = this;

        function loadAssetFinished()
        {
            var rootNode = thisAssetCache.rootNode;

            // The model is loaded under the root, if the loaded model only has one top node then that is the one we use
            var loadedNode;
            if (rootNode.children && rootNode.children.length === 1)
            {
                loadedNode = rootNode.children[0];
            }
            else
            {
                loadedNode = rootNode;
            }
            thisAssetCache.loadedNode = loadedNode;

            var index;
            var assetInstance;
            var thisAssetCacheNodeQueue = thisAssetCache.queue;
            for (index = 0; index < thisAssetCacheNodeQueue.length; index += 1)
            {
                assetInstance = thisAssetCacheNodeQueue[index];

                that._loadAssetInstance(thisAssetCache,
                                        assetInstance.node,
                                        assetInstance.localMatrix);
            }

            thisAssetCacheNodeQueue.length = 0;

            that.loadingAssetCounter -= 1;
        }

        var globals           = this.globals;
        var loadingParameters =
        {
            scene            : globals.scene,
            append           : true,
            assetPath        : inputAssetPath,
            keepLights       : false,
            graphicsDevice   : globals.graphicsDevice,
            mathDevice       : globals.mathDevice,
            textureManager   : globals.textureManager,
            shaderManager    : globals.shaderManager,
            effectManager    : globals.effectManager,
            requestHandler   : globals.requestHandler,
            animationManager : globals.animationManager,
            shapesNamePrefix : inputAssetPath,
            animNamePrefix   : inputAssetPath,
            dynamic          : !stationary,
            preSceneLoadFn   : globals.renderer.filterSceneData.bind(globals.renderer),
            postSceneLoadFn  : loadAssetFinished,
            parentNode       : thisAssetCache.rootNode,
            name             : inputAssetPath + this.loadAssetCounter.toString() + "_child",
            keepVertexData   : (Config.debugEnableWireframe)
        };

        var option;
        for (option in loadOptions)
        {
            if (loadOptions.hasOwnProperty(option))
            {
                loadingParameters[option] = loadOptions[option];
            }
        }

        var scratchSceneLoader = SceneLoader.create();
        scratchSceneLoader.setPathRemapping(this.pathRemapping, this.pathPrefix);
        scratchSceneLoader.load(loadingParameters);
        scratchSceneLoader = null;

        this.loadingAssetCounter += 1;

        return thisAssetCache;
    },

    setPathRemapping : function setPathRemappingFn(prm, assetUrl)
    {
        this.pathRemapping = prm;
        this.pathPrefix = assetUrl;
    },

    getNumberOfUniqueMeshes : function simpleSceneLoaderGetNumberOfUniqueMeshesFn()
    {
        return  this.uniqueMeshes;
    },

    getNumberOfNodes : function simpleSceneLoaderGetNumberOfNodesFn()
    {
        return  this.createdNodes;
    }
};

SimpleSceneLoader.create = function simpleSceneLoaderCreateFn(globals)
{
    var simpleSceneLoader               = new SimpleSceneLoader();

    simpleSceneLoader.globals           = globals;

    simpleSceneLoader.loadAssetCounter  = 0;
    simpleSceneLoader.cloneAssetCounter = 0;
    simpleSceneLoader.loadingAssetCounter = 0;
    simpleSceneLoader.assetCache        = {};

    simpleSceneLoader.createdNodes      = 0;
    simpleSceneLoader.uniqueMeshes      = 0;

    simpleSceneLoader.dontChildPreLoaded    =   true;

    return simpleSceneLoader;
};
