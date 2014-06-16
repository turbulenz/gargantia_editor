// provides a persistent layer on top of the GuiRenderer

/*global GuiRenderer: false*/
/*global TWEEN: false*/

function GuiManager() {}

GuiManager.prototype =
{
    queryFull : function guimanagerQueryFullFn(id)
    {
        return (this.prevDrawGuiMap[id] && !this.prevDrawGuiMap[id].tweener);
    },

    addDrawGui : function guiManagerAddDrawGuiFn(archetypeName, argumentObject, id)
    {
        var drawObject = {id : id, archetypeName : archetypeName, argumentObject : argumentObject, sortKey : 0};
        // We need a stable sort so to preserve insert order so we use the length as part of the sort key
        drawObject.sortKey = this.getLayer(drawObject) * 4096 + this.drawList.length;
        this.drawList.push(drawObject);
    },

    clearDrawList : function guimanagerClearDrawListFn()
    {
        this.drawList.length = 0;
    },

    //Drawing gui with STATE.
    drawGui : function guiManagerDrawGuiFn(archetypeName, argumentObject, id)
    {
        var prevDrawGuiMap = this.prevDrawGuiMap;
        var drawGuiMap     = this.drawGuiMap;

        var drawGuiObject;

        var guiRenderer =   this.globals.guiRenderer;

        if (id)
        {
            if (prevDrawGuiMap[id])
            {
                drawGuiObject   =   prevDrawGuiMap[id];

                argumentObject.fade         = drawGuiObject.fade;
                drawGuiObject.argumentObject = argumentObject;

                prevDrawGuiMap[id]  =   undefined;

                guiRenderer.begin();
                guiRenderer.render(archetypeName, argumentObject);
                guiRenderer.end();

                drawGuiMap[id]  =   drawGuiObject;
            }
            else
            {
                drawGuiObject  =
                {
                    archetypeName : archetypeName,
                    argumentObject : argumentObject,
                    fade : 0.0,
                    tweener : undefined
                };

                drawGuiMap[id]   =   drawGuiObject;

                this.playStartSFX(drawGuiObject);

                this.fadeInTween(drawGuiObject);
            }
        }
        else
        {
            guiRenderer.begin();
            guiRenderer.render(archetypeName, argumentObject);
            guiRenderer.end();
        }
    },

    playStartSFX : function guimanagerPlayStartSFXFn(drawGuiObject)
    {
        var guiRenderer      = this.globals.guiRenderer;
        var guiInfo          = guiRenderer.getGuiInfo(drawGuiObject.archetypeName);

        var globals          = this.globals;
        var gameManager      = globals.gameManager;
        var effectFactory    = gameManager.getEffectFactory();

        var argumentObject  =   drawGuiObject.argumentObject;
        var v2ScreenLocation;

        var beginSFX = guiInfo.beginSFX;
        //beginSFX     = 'dfx_dth_e_generic';

        var sfxOffsetX;
        var sfxOffsetY;
        if (beginSFX)
        {
            sfxOffsetX = (beginSFX.offsetX !== undefined) ? beginSFX.offsetX * guiRenderer.getScaleFactor() : 0.0;
            sfxOffsetY = (beginSFX.offsetY !== undefined) ? beginSFX.offsetY * guiRenderer.getScaleFactor() : 0.0;

            if (argumentObject.v2ScreenLocation)
            {
                v2ScreenLocation    =   argumentObject.v2ScreenLocation;
            }
            else if (argumentObject.v3WorldLocation)
            {
                v2ScreenLocation    =   globals.camera.worldToScreen(argumentObject.v3WorldLocation);
            }
            if (guiInfo.getRenderLocationFn)
            {
                v2ScreenLocation    =   guiInfo.getRenderLocationFn();
            }

            if (v2ScreenLocation)
            {
                v2ScreenLocation[0] += sfxOffsetX;
                v2ScreenLocation[1] += sfxOffsetY;
            }

            effectFactory.play(beginSFX.name, drawGuiObject.argumentObject.v3WorldLocation, undefined, undefined, v2ScreenLocation);
        }
    },

    fadeInTween : function guimanagerFadeInTweenFn(drawGuiObject)
    {
        var guiRenderer = this.globals.guiRenderer;
        var guiMap = guiRenderer.getGuiInfo(drawGuiObject.archetypeName);
        drawGuiObject.tweener =   TWEEN.Create({fade : drawGuiObject.fade})
            .to({fade : 1.0}, (guiMap && guiMap.fadeInTime !== undefined) ? guiMap.fadeInTime : 0.1)
            //.easing(TWEEN.Easing.Circular.Out)
            .onUpdate(function ()
                {
                    drawGuiObject.fade = this.fade;
                })
            .onComplete(function ()
                {
                    drawGuiObject.tweener = undefined;
                })
            .setAppTimeBased()
            .drawUpdate()
            .start();
    },

    fadeOutTween : function guimanagerFadeOutTweenFn(drawGuiObject)
    {
        if (drawGuiObject.tweener)
        {
            drawGuiObject.tweener.stop();
            drawGuiObject.tweener   =   undefined;
        }

        var guiRenderer = this.globals.guiRenderer;
        var guiMap = guiRenderer.getGuiInfo(drawGuiObject.archetypeName);
        TWEEN.Create({fade : drawGuiObject.fade})
            .to({fade : 0.0}, (guiMap && guiMap.fadeOutTime !== undefined) ? guiMap.fadeOutTime : 0.1)
            //.easing(TWEEN.Easing.Circular.In)
            .onUpdate(function ()
                {
                    drawGuiObject.fade                = this.fade;
                    drawGuiObject.argumentObject.fade = drawGuiObject.fade;

                    guiRenderer.begin();
                    guiRenderer.render(drawGuiObject.archetypeName, drawGuiObject.argumentObject);
                    guiRenderer.end();
                })
            .setAppTimeBased()
            .drawUpdate()
            .start();
    },

    getLayer : function guiManagerGetLayerFn(drawObject)
    {
        var layer = drawObject.argumentObject.layer;

        if (layer !== undefined)
        {
            return layer;
        }
        layer = GuiRenderer.archetypes[drawObject.archetypeName].layer;

        if (layer !== undefined)
        {
            return layer;
        }

        return 0;
    },

    sortCompare : function guiManagersSortCompareFn(left, right)
    {
        return left.sortKey - right.sortKey;
    },

    completeDraw : function guiManagerCompleteDrawFn()
    {
        var prevDrawGuiMap =   this.prevDrawGuiMap;
        var drawInfo;

        var drawGuiObject;

        var guiRenderer =   this.globals.guiRenderer;
        guiRenderer.begin();

        var drawList       = this.drawList;
        var drawListLength = drawList.length;
        var drawListIndex;
        var drawObject;
        var currentLayer   = 0;
        var layer          = 0;

        drawList.sort(this.sortCompare);

        for (drawListIndex = 0; drawListIndex < drawListLength; drawListIndex += 1)
        {
            drawObject  =   drawList[drawListIndex];
            layer       =   this.getLayer(drawObject);
            if (layer !== currentLayer)
            {
                currentLayer = layer;
                guiRenderer.flush();
            }

            this.drawGui(drawObject.archetypeName, drawObject.argumentObject, drawObject.id);
        }

        for (drawInfo in prevDrawGuiMap)
        {
            if (prevDrawGuiMap.hasOwnProperty(drawInfo))
            {
                if (prevDrawGuiMap[drawInfo] !== undefined)
                {
                    drawGuiObject    =   prevDrawGuiMap[drawInfo];

                    guiRenderer.render(drawGuiObject.archetypeName, drawGuiObject.argumentObject);

                    this.fadeOutTween(drawGuiObject);
                }
            }
        }

        guiRenderer.end();

        this.prevDrawGuiMap = this.drawGuiMap;
        this.drawGuiMap     = {};
    }
};

GuiManager.create = function guiManagerCreateFn(globals)
{
	var manager = new GuiManager();
	manager.globals = globals;

    manager.gameMessages    = {};

    manager.drawList       = [];
    manager.prevDrawGuiMap = {};
    manager.drawGuiMap     = {};

	return manager;
};
