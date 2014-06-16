//
//  VisualEffect - updates and draws itself
//
//

/*global TWEEN: false*/

function VisualEffect() {}

VisualEffect.prototype =
{
    initialise : function visualEffectInitialiseFn(parameters)
    {
        var keyframeList = this.buildKeyframeList(parameters);
        this.buildTweens(parameters, keyframeList);
    },

    buildKeyframeList : function visualeffectBuildKeyframListFn(parameters)
    {
        var lifetime    =   parameters.lifetime;

        if (this.timeDilation !== undefined)
        {
            lifetime    /=  this.timeDilation;
        }

        var randomAddedScale = 0.0;
        var scaleFactor = this.scale !== undefined ? this.scale : 1.0;
        if (parameters.randomAddedScale !== undefined)
        {
            randomAddedScale = Math.random() * parameters.randomAddedScale;
        }

        var keyframeList = [];

        if (parameters.keyFrames)
        {
            var inputkeyFrames = parameters.keyFrames;
            var inputkeyFrameLength = inputkeyFrames.length;
            var inputkeyFrameIndex;
            var thisinputkeyFrame;

            for (inputkeyFrameIndex = 0; inputkeyFrameIndex < inputkeyFrameLength; inputkeyFrameIndex += 1)
            {
                thisinputkeyFrame = inputkeyFrames[inputkeyFrameIndex];
                keyframeList.push(
                {
                    scale   : thisinputkeyFrame.scale * scaleFactor + randomAddedScale,
                    r       : thisinputkeyFrame.colour[0],
                    g       : thisinputkeyFrame.colour[1],
                    b       : thisinputkeyFrame.colour[2],
                    a       : thisinputkeyFrame.colour[3],
                    life    : thisinputkeyFrame.life / this.timeDilation
                });
            }
        }
        else
        {
            keyframeList.push(
            {
                scale   :   parameters.startScale * scaleFactor + randomAddedScale,
                r       :   parameters.startColour[0],
                g       :   parameters.startColour[1],
                b       :   parameters.startColour[2],
                a       :   parameters.startColour[3],
                life    :   0.0
            });

            keyframeList.push(
            {
                scale   :   parameters.endScale * scaleFactor + randomAddedScale,
                r       :   parameters.endColour[0],
                g       :   parameters.endColour[1],
                b       :   parameters.endColour[2],
                a       :   parameters.endColour[3],
                life    :   lifetime
            });
        }

        return keyframeList;
    },

    buildTweens : function visualeffectBuildTweensFn(parameters, keyframeList)
    {
        var that    =   this;
        var globals =   this.globals;
        var sr      =   globals.simpleSpriteRenderer;
        var md      =   globals.mathDevice;
        var camera  =   globals.camera;

        var angle;
        if (parameters.randomRotate)
        {
            angle = Math.PI * 2.0 * Math.random();
        }

        var parentEntity;

        if (parameters.follow)
        {
            parentEntity    =   this.parentEntity;
        }

        var v3Velocity;
        if (parameters.v3Velocity)
        {
            v3Velocity  =   parameters.v3Velocity;
        }

        var v2ScreenLocation = this.v2ScreenLocation;

        var onUpdate    =   function visualEffectOnUpdateFn()
        {
            var v3Location;
            if (v2ScreenLocation)
            {
                v3Location  =   camera.screenToWorld(v2ScreenLocation[0], v2ScreenLocation[1], 1.0);
            }
            else if (parentEntity && !parentEntity.shouldBeDestroyed())
            {
                v3Location  =   parentEntity.getv3Location();
            }
            else
            {
                v3Location  =   that.v3Location;
            }

            if (v3Velocity)
            {
                v3Location = md.v3AddScalarMul(v3Location, v3Velocity, this.life);
            }

            var spriteParametes  =
            {
                v3Location  : v3Location,
                size        : this.scale,
                blendStyle  : parameters.blendStyle,
                texture     : that.texturePath,
                v4color     : md.v4Build(this.r, this.g, this.b, this.a),
                alignment   : parameters.alignment,
                v3Direction : this.v3Direction,
                angle       : angle
            };

            sr.addSprite(spriteParametes);
        };

        var startEase  =   TWEEN.Easing.Linear.None;
        var normalEase   =   TWEEN.Easing.Quadratic.InOut;

        var delay    =    parameters.delay !== undefined ? parameters.delay : 0.0;

        var createdTween, prevTween, firstTween;

        var keyframeListLength = keyframeList.length;
        var keyframeListIndex;

        var currentKeyframe, prevKeyframe;

        for (keyframeListIndex = 1; keyframeListIndex < keyframeListLength; keyframeListIndex += 1)
        {
            currentKeyframe = keyframeList[keyframeListIndex];
            prevKeyframe    = keyframeList[keyframeListIndex - 1];

            createdTween = TWEEN.Create(prevKeyframe)
                .to(currentKeyframe, currentKeyframe.life - prevKeyframe.life)
                .easing((keyframeListIndex === 1) ? startEase : normalEase)
                .onUpdate(onUpdate)
                .delay(delay);

            if (v2ScreenLocation)
            {
                //createdTween.drawUpdate();
                createdTween.setAppTimeBased();
            }

            if (keyframeListIndex === 1)
            {
                firstTween = createdTween;
            }

            if (prevTween)
            {
                prevTween.chain(createdTween);
            }

            prevTween = createdTween;
        }

        firstTween.start();
    }
};

VisualEffect.archetypes = {};

VisualEffect.create = function visualEffectCreateFn(globals, parameters, v3Location, v3Direction, parentEntity, v2ScreenLocation, scale, timeDilation)
{
    var visualEffect    =   new VisualEffect();

    visualEffect.globals          = globals;
    visualEffect.v3Location       = v3Location;
    visualEffect.v3Direction      = v3Direction;
    visualEffect.texturePath      = parameters.texturePath;
    visualEffect.parentEntity     = parentEntity;
    visualEffect.v2ScreenLocation = v2ScreenLocation;
    visualEffect.scale            = scale !== undefined ? scale : 1.0;
    visualEffect.timeDilation     = timeDilation !== undefined ? timeDilation : 1.0;

    visualEffect.initialise(parameters);

    return visualEffect;
};
