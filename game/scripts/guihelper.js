// game specific useful functions.

/*global TWEEN: false*/

function GuiHelper() {}

GuiHelper.prototype =
{
    doTitle : function guihelperDrawTitleFn(string)
    {
        var guiRenderer =   this.globals.guiRenderer;
        var titleArchetype = 'gameMessageTitle';
        this.doText(string, guiRenderer.getv2RenderLocation(0, -250), 1.0, titleArchetype);
    },

    doSubTitle : function guihelperDrawSubTitleFn(string, offsetIndex)
    {
        var guiRenderer =   this.globals.guiRenderer;
        var subTitleArchetype = 'gameMessageSubTitle';
        offsetIndex = offsetIndex ? offsetIndex : 0;
        this.doText(string, guiRenderer.getv2RenderLocation(0, -250 + 70 * (offsetIndex + 1)), 1.0, subTitleArchetype);
    },

    doText : function guihelperDoTextFn(text, v2ScreenLocation, scale, guiArchetype)
    {
        this.guiManager.addDrawGui(
            guiArchetype,
            {
                text1 : text,
                v2ScreenLocation : v2ScreenLocation,
                scale : scale,
                layer : 1
            },
            'idText' + text);
    },

    addBackground : function guihelperAddBackgroundFn()
    {
        var globals        = this.globals;
        var graphicsDevice = globals.graphicsDevice;
        var guiRenderer    = globals.guiRenderer;

        var width   =   graphicsDevice.width;
        var height  =   graphicsDevice.height;

        this.guiManager.addDrawGui('guiBlackBackground',
            {
                v2ScreenLocation : guiRenderer.getv2RenderLocation(0, 0),
                scaleX : 2.0 * ((width / 100) + 1),
                scaleY : 2.0 * ((height / 100) + 1)
            },
            'idBackground');

        this.guiButtons.gobbleCursor();
    },

    isBackgroundFull : function guihelperIsBackgroundFullFn()
    {
        return this.guiManager.queryFull('idBackground');
    },

    addFaintBackground : function guihelperAddFaintBackgroundFn(addedID)
    {
        var globals        = this.globals;
        var graphicsDevice = globals.graphicsDevice;
        var guiRenderer    = globals.guiRenderer;

        var width   =   graphicsDevice.width;
        var height  =   graphicsDevice.height;

        var spriteWidth = 100;
        var borderSize = 0;
        var maxBorderFraction = 0.1;
        var maxBorderWidth = (width * maxBorderFraction);
        var maxBorderHeight = (height * maxBorderFraction);
        var maxBorderSize = Math.min(maxBorderHeight, maxBorderWidth);
        borderSize = Math.min(maxBorderSize, borderSize);

        var scaleFactor = guiRenderer.getScaleFactor();
        var scaleX = (((width - borderSize) / spriteWidth) / scaleFactor);
        var scaleY = (((height - borderSize) / spriteWidth) / scaleFactor);

        this.guiManager.addDrawGui('guiDarkBackground',
            {
                v2ScreenLocation : guiRenderer.getv2RenderLocation(0, 0),
                scaleX : scaleX,
                scaleY : scaleY
            },
            'idDarkBackground' + (addedID ? addedID : '')
        );

        this.guiButtons.gobbleCursor();
    },

    addSnazzyBackground : function guihelperAddSnazzyFn(addedID, x, y)
    {
        var globals        = this.globals;
        var guiRenderer    = globals.guiRenderer;

        var xToUse = x !== undefined ? x : 0;
        var yToUse = x !== undefined ? y : 0;

        this.guiManager.addDrawGui('burstWidget',
            {
                v2ScreenLocation : guiRenderer.getv2RenderLocation(xToUse, yToUse),
                scaleX : 1,
                scaleY : 1
            },
            'idSnazzyBackground' + (addedID ? addedID : '')
        );
    },

    addScoreBubble : function guihelperAddScoreBubbleFn(v3Location, text /*,onComplete*/)
    {
        if (v3Location)
        {
            var globals = this.globals;
            var md = globals.mathDevice;

            var bubblev3Location = md.v3Copy(v3Location);
            bubblev3Location[1] += 1.0;

            var destv3Location = md.v3Copy(v3Location);
            destv3Location[1] += 3.0;

            var initialState =
            {
                lerp : 0,
                scale : 1.0
            };

            var finalState =
            {
                lerp : 1,
                scale : 1.0
            };

            var lifetime = 1.25;

            var id  =   'IDscoreBubble' + this.scoreBubbleid;
            this.scoreBubbleid +=  1;

            var gameManager         = globals.gameManager;
            var guiManager          = gameManager.getGuiManager();
            var gameCamera          = gameManager.getGameCamera();

            var guiArchetype = 'hudScoreBubble';

            var onUpdate = function onUpdateFn()
            {
                var v2ScreenLocation = gameCamera.getv2ScreenLocationFromWorld(md.v3Lerp(bubblev3Location, destv3Location, this.lerp), true);
                var drawInfo =
                {
                    v2ScreenLocation : v2ScreenLocation,
                    text : text,
                    scale : this.scale
                };

                guiManager.addDrawGui(guiArchetype, drawInfo, id);
            };

            //var easingType = TWEEN.Easing.Exponential.In;

            this.activeScoreEventTween = TWEEN.Create(initialState)
                .to(finalState, lifetime)
                //.easing(easingType)
                .onUpdate(onUpdate)
                //.onComplete(onComplete)
                .start();
        }
    },

    addGameMessage : function guihelperAddGameMessageFn(id, text1, text2, iDuration, guiArchetype, iDelay, v2ScreenLocation)
    {
        var duration     = iDuration !== undefined ? iDuration : 1.0;
        var endTime      = this.globals.appCurrentTime + duration;

        var delay        = iDelay !== undefined ? iDelay : 0.0;
        var startTime    = this.globals.appCurrentTime + delay;
        if (this.gameMessages[id])
        {
            this.gameMessages[id].text1            = text1;
            this.gameMessages[id].text2            = text2;
            this.gameMessages[id].endTime          = endTime;
            this.gameMessages[id].v2ScreenLocation = v2ScreenLocation;
        }
        else
        {
            this.gameMessages[id]   =   {
                text1 : text1,
                text2 : text2,
                endTime : endTime,
                guiArchetype : guiArchetype,
                startTime : startTime,
                v2ScreenLocation : v2ScreenLocation
            };
            this.numGameMessages += 1;
        }
    },

    removeGameMessage : function guihelperRemoveGameMessageFn(id)
    {
        if (this.gameMessages[id])
        {
            delete  this.gameMessages[id];
            this.numGameMessages -= 1;
        }
    },

    updateGameMessages : function guihelperUpdateGameMessageFn()
    {
        if (!this.numGameMessages)
        {
            return;
        }

        var gameMessages = this.gameMessages;
        var id;
        var currentMessageInfo;
        var globals     = this.globals;
        var md          = globals.mathDevice;
        var currentTime = globals.appCurrentTime;
        var guiRenderer = globals.guiRenderer;
        var guiManager  = this.guiManager;

        var v2ScreenLocation = guiRenderer.getv2RenderLocation(0, -50, 'centre');

        for (id in gameMessages)
        {
            if (gameMessages.hasOwnProperty(id))
            {
                currentMessageInfo  =   gameMessages[id];
                if (currentMessageInfo.endTime > currentTime || !currentMessageInfo.drawn)
                {
                    if (currentMessageInfo.startTime <= currentTime)
                    {
                        guiManager.addDrawGui(
                            currentMessageInfo.guiArchetype ? currentMessageInfo.guiArchetype : 'gameMessage',
                            {
                                text1 : currentMessageInfo.text1,
                                text2 : currentMessageInfo.text2,
                                v2ScreenLocation : currentMessageInfo.v2ScreenLocation ? currentMessageInfo.v2ScreenLocation : md.v2Copy(v2ScreenLocation),
                                layer : 1
                            },
                            id);
                    }

                    currentMessageInfo.drawn    =   true;

                    if (!currentMessageInfo.v2ScreenLocation)
                    {
                        v2ScreenLocation[1] +=  100.0;
                    }
                }
                else
                {
                    delete  gameMessages[id];
                    this.numGameMessages -= 1;
                }
            }
        }
    },

    update : function guihelperUpdateFn()
    {
        this.updateGameMessages();
    }
};

GuiHelper.create = function guiHelperCreateFn(globals, guiManager, guiButtons)
{
    var helper        = new GuiHelper();
    helper.globals    = globals;
    helper.guiManager = guiManager;
    helper.guiButtons      = guiButtons;

    helper.gameMessages    = {};
    helper.numGameMessages = 0;

    helper.scoreBubbleid = 0;

    return helper;
};
