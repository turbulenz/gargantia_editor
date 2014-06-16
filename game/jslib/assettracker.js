// Copyright (c) 2009-2013 Turbulenz Limited
/*global Utilities: false*/
var AssetTracker = (function () {
    function AssetTracker() {
    }
    AssetTracker.prototype.getLoadedCount = function () {
        return this.assetsLoadedCount;
    };

    AssetTracker.prototype.getLoadingProgress = function () {
        return this.loadingProgress;
    };

    AssetTracker.prototype.getNumberAssetsToLoad = function () {
        return this.numberAssetsToLoad;
    };

    AssetTracker.prototype.eventOnAssetLoadedCallback = function (event) {
        var numberAssetsToLoad = this.numberAssetsToLoad;

        this.assetsLoadedCount += 1;

        if (numberAssetsToLoad) {
            var progress = this.assetsLoadedCount / numberAssetsToLoad;

            this.loadingProgress = Math.max(this.loadingProgress, Math.min(progress, 1.0));
        }

        if (this.displayLog) {
            Utilities.log(event.name + " (Asset Number " + this.assetsLoadedCount + ") Progress : " + this.loadingProgress);
        }

        if (this.callback) {
            this.callback();
        }
    };

    AssetTracker.prototype.setCallback = function (callback) {
        this.callback = callback;
    };

    AssetTracker.prototype.setNumberAssetsToLoad = function (numberAssetsToLoad) {
        if ((numberAssetsToLoad) && (this.numberAssetsToLoad !== numberAssetsToLoad)) {
            this.numberAssetsToLoad = numberAssetsToLoad;

            var progress = this.assetsLoadedCount / numberAssetsToLoad;

            this.loadingProgress = Math.max(this.loadingProgress, Math.min(progress, 1.0));
        }

        if (this.callback) {
            this.callback();
        }
    };

    AssetTracker.create = // Constructor function
    function (numberAssetsToLoad, displayLog) {
        var f = new AssetTracker();

        f.assetsLoadedCount = 0;
        f.loadingProgress = 0;
        f.numberAssetsToLoad = 0;
        f.callback = null;
        f.displayLog = displayLog;

        if (numberAssetsToLoad) {
            f.numberAssetsToLoad = numberAssetsToLoad;
        }

        f.eventOnLoadHandler = function assetTrackerEventOnLoadHandlerFn(event) {
            f.eventOnAssetLoadedCallback(event);
        };

        return f;
    };
    AssetTracker.version = 1;
    return AssetTracker;
})();
