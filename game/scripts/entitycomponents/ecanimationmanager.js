//
//  ECAnimationManager
//
/*global AnimationSet: false*/
/*global BlendController: false*/
/*global debug: false*/
/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/
/*global GPUSkinController: false*/
/*global InterpolatorController: false*/
/*global SceneNode: false*/
/*global TWEEN: false*/

var ECAnimationManager = EntityComponentBase.extend(
{
    entityComponentName : 'ECAnimationManager',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : true,
    shouldAlwaysUpdate : false, //If this is true, the entity will update even if it is far away from the hero.
    shouldDraw : false,

    //Networking info.
    shouldSerialize        : false,
    shouldDeltaSerialize   : false,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    storeGlobalList : false, // Setting this to true causes the game to store a global list of all active entities with
                             // this EC, which can be accessed with EntityComponentBase.getEntitiesWithEC(ECAnimationManager)

    parameters :
    {
        // Fully define parameters for full slider control and to provide better documentation
        animationSet : '',
        fullBodyAnimNode : 'overrideAnim',
        fullBodyBlendNode : 'overrideBlend',
        fullBodyBlendControl : 'overrideControl'
    },

    // Standard ctor - add class members here and initialise if possible
    // Only read/modify this ec here
    init : function ecAnimationManagerInitFn(globals, parameters)
    {
        this._super(globals, parameters); // IMPORTANT - MUST BE CALLED!

        this.animationNodes = {};

        this.fullBodyAnimBlendOutTime = 0.2;
    },

    // Optional - entity is about to be placed in game
    // Only read/modify this entity here - do not query external entities or external ecs.
    // Can carry out some side effects here e.g. register with game managers, add event listeners
    activate : function ecAnimationManagerActivateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        debug.assert((this.getEntityEC('ECMesh')),
                    'ECAnimationManager requires an ECMesh');

        this.initialiseTree();
    },

    getFullBodyAnimNodeName : function ecAnimationManagerGetFullBodyAnimNodeNameFn()
    {
        return this.archetype.fullBodyAnimNode;
    },

    getFullBodyBlendNodeName : function ecAnimationManagerGetFullBodyBlendNodeNameFn()
    {
        return this.archetype.fullBodyBlendNode;
    },

    getFullBodyBlendControlName : function ecAnimationManagerGetFullBodyBlendControlNameFn()
    {
        return this.archetype.fullBodyBlendControl;
    },

    getAnimationSetName : function ecAnimationManagerGetAnimationSetNameFn()
    {
        return this.archetype.animationSet;
    },

    //
    //Animation tree creation.
    //

    initialiseTree : function ecanimationmanagerInitialiseTreeFn()
    {
        //Initialise this for further
        this.calculateBaseHeirarchy();

        //Create the tree.
        var animationSet = this.getAnimationSet();
        this.headNode = this.createAnimationTree(animationSet);

        //Apply the head to the skin.
        this.createAndAttachSkinController(this.headNode);

        //this.setAnimation(animationSet.initialAnimation);
    },

    calculateBaseHeirarchy : function ecanimationmanagerCalculateBaseHeirarchyFn()
    {
        var animationSet    = AnimationSet.archetypes[this.getAnimationSetName()];
        var animation       = animationSet.animations[animationSet.initialAnimation];

        var animationManager = this.globals.animationManager;
        var sourceAnimation = animationManager.get(animation.path + animationSet.rootNode);

        this.baseHeirarchy = sourceAnimation.hierarchy;
    },

    getBaseHeirarchy : function ecanimationmanagerGetBaseHeirarchyFn()
    {
        return this.baseHeirarchy;
    },

    createAnimationTree : function ecanimationmanagerCreateAnimationTreeFn(animationSet)
    {
        //Go through each node in the tree.

        return this.createNode(animationSet.nodeTree.headNode);
    },

    createNode : function ecanimationmanagerCreateControllerFn(animationTreeNodeData)
    {
        var createdController = this.createNodeFunctions[animationTreeNodeData.type].apply(this, [animationTreeNodeData]);

        this.animationNodes[animationTreeNodeData.name] = createdController;
        return createdController;
    },

    createNodeFunctions :
    {
        animation : function createNodeFunctionsAnimation(animationTreeNodeData)
        {
            var globals   = this.globals;

            var animationNode = {};
            animationNode.controller = InterpolatorController.create(this.getBaseHeirarchy());
            animationNode.data       = animationTreeNodeData;

            var animationSet = this.getAnimationSet();

            animationNode.setAnimation = function (animationName)
            {
                if (animationNode.currentAnimationName === animationName)
                {
                    return;
                }

                var animationManager = globals.animationManager;
                var animationData = animationSet.animations[animationName];
                var sourceAnimation = animationManager.get(animationData.path + animationSet.rootNode);

                animationNode.controller.setAnimation(sourceAnimation, animationData.looping);

                if (animationData.randomStartTime)
                {
                    animationNode.controller.setTime(sourceAnimation.length * Math.random());
                }
                else
                {
                    animationNode.controller.setTime(0.0);
                }

                if (animationData.speedRange !== undefined)
                {
                    animationNode.controller.setRate(animationData.speedRange[0] + (animationData.speedRange[1] - animationData.speedRange[0]) * Math.random());
                }

                animationNode.currentAnimationName = animationName;
                animationNode.currentAnimationData = animationData;
            };

            animationNode.setAnimationPlaybackRate = function (rate, rateNameFilter)
            {
                if (rateNameFilter)
                {
                    var playbackRateModifier = animationNode.currentAnimationData.playbackRateModifier;
                    if (playbackRateModifier && playbackRateModifier.name === rateNameFilter)
                    {
                        animationNode.controller.setRate(rate * (playbackRateModifier.rateFactor ? playbackRateModifier.rateFactor : 1.0));
                    }
                }
                else
                {
                    animationNode.controller.setRate(rate);
                }
            };

            animationNode.setAnimation(animationTreeNodeData.animationName);
            if (!animationTreeNodeData.canSetAnimation)
            {
                animationNode.setAnimation = null;
            }

            return animationNode;
        },

        blend : function createNodeFunctionsBlend(animationTreeNodeData)
        {
            var animationTreeNodeControllerInputArray = [];
            var blendValueArray = [];

            var animationTreeNodeInputs       = animationTreeNodeData.inputs;
            var animationTreeNodeInputsLength = animationTreeNodeInputs.length;

            var newAnimationTreeNode;
            for (var animationTreeNodeInputsIndex = 0; animationTreeNodeInputsIndex < animationTreeNodeInputsLength; animationTreeNodeInputsIndex += 1)
            {
                newAnimationTreeNode = this.createNode(animationTreeNodeInputs[animationTreeNodeInputsIndex]);
                animationTreeNodeControllerInputArray.push(newAnimationTreeNode.controller);

                blendValueArray.push(newAnimationTreeNode.data.blendValue);
            }

            var blendNode = {};
            blendNode.controller = BlendController.create(animationTreeNodeControllerInputArray);
            blendNode.data       = animationTreeNodeData;
            blendNode.blendValueArray = blendValueArray;

            blendNode.currentDelta = 0;
            blendNode.desiredDelta = 0;

            blendNode.valueToDelta = function (value)
            {
                //Build up a mapping or something to get this to work.
                var blendValueArray       = blendNode.blendValueArray;
                var blendValueArrayLength = blendValueArray.length;

                var currentBlendValue, nextBlendValue;
                var indexToDelta = 1.0 / (blendValueArrayLength - 1);
                for (var blendValueArrayIndex = 0; blendValueArrayIndex < blendValueArrayLength; blendValueArrayIndex += 1)
                {
                    currentBlendValue = blendValueArray[blendValueArrayIndex];
                    nextBlendValue    = blendValueArray[blendValueArrayIndex + 1];

                    if (value <= currentBlendValue)
                    {
                        return blendValueArrayIndex * indexToDelta;
                    }
                    if (value < nextBlendValue)
                    {
                        return (blendValueArrayIndex + ((value - currentBlendValue) / (nextBlendValue - currentBlendValue))) * indexToDelta;
                    }
                }
                return 1;
            };

            blendNode.setBlendValue = function (desiredValue, controlName)
            {
                if (!controlName || controlName !== blendNode.data.controlName)
                {
                    return;
                }

                var desiredDelta = blendNode.valueToDelta(desiredValue);
                if (blendNode.desiredDelta === desiredDelta)
                {
                    return;
                }

                blendNode.desiredDelta = desiredDelta;

                if (!blendNode.data.blendDuration)
                {
                    blendNode.controller.setBlendDelta(desiredDelta);
                    blendNode.currentDelta = desiredDelta;
                    return;
                }

                if (blendNode.blendTween)
                {
                    blendNode.blendTween.stop();
                }

                var onUpdate = function onUpdateFn()
                {
                    blendNode.controller.setBlendDelta(this.weight);
                    blendNode.currentDelta = this.weight;
                };

                var onComplete = function onCompleteFn()
                {
                    blendNode.blendTween = undefined;
                };

                blendNode.blendTween = TWEEN.Create({weight : blendNode.currentDelta})
                    .to({weight : desiredDelta}, blendNode.data.blendDuration)
                    .onUpdate(onUpdate)
                    .onComplete(onComplete)
                    .start();
            };

            return blendNode;
        }
    },

    attachSceneNodeController : function ecAnimationManagerAttachSceneNodeControllerFn(node, controller)
    {
        var renderables = node.renderables;
        if (renderables)
        {
            var numRenderables = renderables.length;
            for (var i = 0; i < numRenderables; i += 1)
            {
                var renderable = renderables[i];
                if (renderable.isSkinned())
                {
                    renderable.skinController = controller;
                }
            }
        }

        var children = node.children;
        if (children)
        {
            var numChildren = children.length;
            for (var c = 0; c < numChildren; c += 1)
            {
                this.attachSceneNodeController(children[c], controller);
            }
        }
    },

    createAndAttachSkinController : function ecAnimationManagerCreateAndAttachSkinControllerFn(inputNode)
    {
        var globals   = this.globals;
        var ecMesh    = this.getEntityEC('ECMesh');
        var sceneNode = ecMesh.node;

        var animationManager = globals.animationManager;

        var skeleton = animationManager.nodeHasSkeleton(sceneNode);

        var skinController = GPUSkinController.create(globals.graphicsDevice,
                                                      globals.mathDevice);
        skinController.setInputController(inputNode.controller);
        skinController.setSkeleton(skeleton);
        this.attachSceneNodeController(sceneNode, skinController);

        sceneNode.skinController = skinController;
    },

    // Can query other entities here
    update : function ecAnimationManagerUpdateFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!

        this.updateController(this.globals.gameTimeStep);
        this.updateFullBodyAnim();
    },

    applyToAllNodes : function ecanimationmanagerApplyToAllNodesFn()
    {
        var nodes = this.animationNodes;
        var nodeName;

        var argumentsArray = Array.prototype.slice.call(arguments);
        var functionName = argumentsArray.shift();

        for (nodeName in nodes)
        {
            if (nodes.hasOwnProperty(nodeName) && nodes[nodeName][functionName])
            {
                nodes[nodeName][functionName].apply(nodes[nodeName], argumentsArray);
            }
        }
    },

    setAnimationPlaybackRate : function ecanimationmanagerSetAnimationPlaybackRateFn(rate, rateName)
    {
        this.applyToAllNodes('setAnimationPlaybackRate', rate, rateName);
    },

    setBlendValue : function ecanimationmanagerSetBlendValueFn(index, controlName)
    {
        this.applyToAllNodes('setBlendValue', index, controlName);
    },

    playFullBodyAnim : function ecAnimationManagerPlayFullBodyAnimFn(animationName, blendOutTime)
    {
        var fullBodyAnimNode = this.getFullBodyAnimNode();
        var fullBodyBlendControl = this.getFullBodyBlendControlName();

        if (fullBodyAnimNode && fullBodyBlendControl && animationName)
        {
            if (fullBodyAnimNode.controller)
            {
                fullBodyAnimNode.controller.setTime(0.0);
            }
            fullBodyAnimNode.setAnimation(animationName);
            this.setBlendValue(1.0, fullBodyBlendControl);

            if (blendOutTime === undefined)
            {
                blendOutTime  = 0.2;
            }

            this.fullBodyAnimBlendOutTime = blendOutTime;
        }
    },

    isPlayingFullBodyAnim : function ecAnimationManagerIsPlayingFullBodyAnimFn()
    {
        var playingAnim = false;

        var fullBodyBlendNode = this.getFullBodyBlendNode();

        if (fullBodyBlendNode && fullBodyBlendNode.desiredDelta > 0)
        {
            playingAnim = true;
        }

        return playingAnim;
    },

    stopFullBodyAnim : function ecAnimationManagerStopFullBodyAnimFn()
    {
        var fullBodyBlendControl = this.getFullBodyBlendControlName();

        if (fullBodyBlendControl)
        {
            this.setBlendValue(0.0, fullBodyBlendControl);
        }
    },

    getFullBodyAnimNode : function ecAnimationManagerGetFullBodyAnimNodeFn()
    {
        return this.animationNodes[this.getFullBodyAnimNodeName()];
    },

    getFullBodyBlendNode : function ecAnimationManagerGetFullBodyBlendNodeFn()
    {
        return this.animationNodes[this.getFullBodyBlendNodeName()];
    },

    draw : function ecAnimationManagerDrawFn()
    {
    },

    drawDebug : function ecAnimationManagerDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugPoint(this.entity.v3Location, 0, 0, 1);
    },

    // For recovering after the game goes to sleep
    manageLargeTimeStep : function ecAnimationManagerManageLargeTimeStepFn(timeDelta)
    {
        this._super(timeDelta);
    },

    serialize : function ecAnimationManagerSerializeFn(eCData)
    {
        this._super(eCData);
    },

    //Death (when health hits 0)
    onDeath : function ecAnimationManagerOnDeathFn()
    {
    },

    //Destruction.
    onToBeDestroyed : function ecAnimationManagerOnToBeDestroyedFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    destroy : function ecAnimationManagerDestroyFn()
    {
        this._super(); // IMPORTANT - MUST BE CALLED!
    },

    setAnimation : function ecAnimationManagerSetAnimationFn(nodeName, name)
    {
        this.animationNodes[nodeName].setAnimation(name);
    },

    getAnimationSet : function ecAnimationManagerGetAnimationSetFn()
    {
        return AnimationSet.archetypes[this.getAnimationSetName()];
    },

    updateController : function ecAnimationManagerUpdateControllerFn(deltaTime)
    {
        this.headNode.controller.addTime(deltaTime);
    },

    updateFullBodyAnim : function ecAnimationManagerUpdateFullBodyAnimFn()
    {
        var animFinished = true;

        if (this.isPlayingFullBodyAnim())
        {
            var animNode = this.getFullBodyAnimNode();
            if (animNode)
            {
                var animController = animNode.controller;
                if (animController && animController.currentAnim)
                {
                    if (animController.looping)
                    {
                        animFinished  = false;
                    }
                    else
                    {
                        var timeRemaining = animController.currentAnim.length - animController.currentTime;
                        var blendOutTime = this.fullBodyAnimBlendOutTime;
                        if (timeRemaining > blendOutTime)
                        {
                            animFinished = false;
                        }
                    }
                }

                if (animFinished)
                {
                    var fullBodyBlendControl = this.getFullBodyBlendControlName();

                    if (fullBodyBlendControl)
                    {
                        this.setBlendValue(0.0, fullBodyBlendControl);
                    }
                }
            }
        }
    }
});

ECAnimationManager.preloadComponent = function eCAnimationManagerPreloadComponentFn(globals, componentParameters)
{
    var simpleSceneLoader   =   globals.simpleSceneLoader;

    var animationSet = AnimationSet.archetypes[componentParameters.animationSet];

    var animations = animationSet.animations;
    var animation;

    for (animation in animations)
    {
        if (animations.hasOwnProperty(animation))
        {
            var path = animations[animation].path;
            if (!simpleSceneLoader.isLoadingMesh(path))
            {
                var tempNodeParameters =
                {
                    name        :   "temp",
                    dynamic     :   false,
                    disabled    :   true
                };

                var tempNode =   SceneNode.create(tempNodeParameters);
                simpleSceneLoader.load(path, undefined, undefined, tempNode);
            }
        }
    }
};

ECAnimationManager.create = function ecAnimationManagerCreateFn(globals, parameters)
{
    return new ECAnimationManager(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECAnimationManager.prototype.entityComponentName] = ECAnimationManager;
