// Copyright (c) 2014 Turbulenz Limited

function GargLoadingScreen(globals, assetTracker)
{
    this.globals = globals;
    this.loadingRingPath = GargLoadingScreen.loadingRingPath;
    this.assetTracker = assetTracker;
    this.defaultTexture = globals.textureManager.get("");
}

GargLoadingScreen.preload = function gargLoadingScreenPreloadAssets(globals)
{
    GargLoadingScreen.loadingRingPath = "textures/gui_loading_ring.dds";
    globals.textureManager.load(GargLoadingScreen.loadingRingPath);
};

GargLoadingScreen.prototype.get = function gargLoadingScreenGet(path)
{
    var asset = this.globals.textureManager.get(path);
    return asset === this.defaultTexture ? null : asset;
};

// Return true if all the logos have been played for the appropriate
// amount of time.
GargLoadingScreen.prototype.render = function gargLoadingScreenRender()
{
    var gd = this.globals.graphicsDevice;
    var draw2D = this.globals.draw2D;

    var width = gd.width;
    var height = gd.height;

    draw2D.begin("alpha", "deferred", true);

    // Render (clear doesn't work properly on IE11 for some machines),
    // so always render a quad.

    draw2D.draw({
        color: [1, 1, 1, 1],
        destinationRectangle: [0, 0, width, height]
    });
    draw2D.end();

    var loadingX = width - 75;
    var loadingY = height - 59;

    var lrR = 96 / 255;
    var lrG = 148 / 255;
    var lrB = 154 / 255;
    var lrA = 1;

    var loadingProgress = this.assetTracker.getLoadingProgress();
    var loadingRing = this.loadingRing || this.get(this.loadingRingPath);
    if (loadingRing && lrA)
    {
        draw2D.begin("alpha", "deferred");
        draw2D.draw({
            texture: loadingRing,
            destinationRectangle: [loadingX - loadingRing.width  / 1.83,
                                   loadingY - loadingRing.height / 1.83,
                                   loadingX + loadingRing.width  / 1.83,
                                   loadingY + loadingRing.height / 1.83],
            color: [lrR, lrG, lrB, 0.25 * lrA]
        });

        this.globals.guiRenderer.renderArc({
            innerRadius: 28,
            outerRadius: 34,
            overrideArcMin: 0,
            overrideArcMax: loadingProgress,
            color: [lrR, lrG, lrB, 0.075 * lrA]
        }, {
            _x: loadingX,
            _y: loadingY,
            _scaleX: 1.0
        });
        this.globals.guiRenderer.renderArc({
            innerRadius: 29,
            outerRadius: 33,
            overrideArcMin: 0,
            overrideArcMax: loadingProgress,
            color: [lrR, lrG, lrB, 0.075 * lrA]
        }, {
            _x: loadingX,
            _y: loadingY,
            _scaleX: 1.0
        });
        this.globals.guiRenderer.renderArc({
            innerRadius: 30,
            outerRadius: 32,
            overrideArcMin: 0,
            overrideArcMax: loadingProgress,
            color: [lrR, lrG, lrB, 0.125 * lrA]
        }, {
            _x: loadingX,
            _y: loadingY,
            _scaleX: 1.0
        });

        draw2D.end();
    }

    var simpleFontRenderer = this.globals.simpleFontRenderer;
    if (simpleFontRenderer.hasLoaded() && lrA)
    {
        var percentage = Math.round(loadingProgress * 100);
        simpleFontRenderer.drawFont(percentage + "%", {
            x: loadingX,
            y: loadingY,
            spacing: 1.5,
            pointSize: 20,
            alignment: 1,
            color: [lrR, lrG, lrB, lrA]
        });
        simpleFontRenderer.drawFont("LOADING", {
            x: loadingX,
            y: loadingY - 50,
            pointSize: 22,
            spacing: 1.5,
            alignment: 1,
            color: [lrR, lrG, lrB, lrA]
        });
        simpleFontRenderer.render();
    }
    return loadingProgress >= 1.0;
};

GargLoadingScreen.prototype.destroy = function gargLoadingScreenDestroy()
{
    var textureManager = this.globals.textureManager;
    textureManager.remove(GargLoadingScreen.loadingRingPath);
};
