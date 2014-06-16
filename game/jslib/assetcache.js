// Copyright (c) 2012-2014 Turbulenz Limited
/*global Observer: false*/
/*global debug: false*/
/*global TurbulenzEngine: false*/
;

;

;

;

;

//
// AssetCache
//
var AssetCache = (function () {
    function AssetCache() {
    }
    AssetCache.prototype.exists = function (key) {
        return this.cache.hasOwnProperty(key);
    };

    AssetCache.prototype.isLoading = function (key) {
        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            return cachedAsset.isLoading;
        }
        return false;
    };

    AssetCache.prototype.get = function (key) {
        debug.assert(key, "Key is invalid");

        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            cachedAsset.cacheHit = this.hitCounter;
            this.hitCounter += 1;
            return cachedAsset.asset;
        }
        return null;
    };

    AssetCache.prototype.request = function (key, params, callback) {
        debug.assert(key, "Key is invalid");

        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            cachedAsset.cacheHit = this.hitCounter;
            this.hitCounter += 1;
            if (!callback) {
                return;
            }
            if (cachedAsset.isLoading) {
                cachedAsset.observer.subscribe(callback);
            } else {
                TurbulenzEngine.setTimeout(function requestCallbackFn() {
                    callback(key, cachedAsset.asset, params);
                }, 0);
            }
            return;
        }

        var cacheArray = this.cacheArray;
        var cacheArrayLength = cacheArray.length;

        if (cacheArrayLength >= this.maxCacheSize) {
            var cache = this.cache;
            var oldestCacheHit = this.hitCounter;
            var oldestKey = null;
            var oldestIndex;
            var i;

            for (i = 0; i < cacheArrayLength; i += 1) {
                if (cacheArray[i].cacheHit < oldestCacheHit) {
                    oldestCacheHit = cacheArray[i].cacheHit;
                    oldestIndex = i;
                }
            }

            cachedAsset = cacheArray[oldestIndex];
            oldestKey = cachedAsset.key;

            if (this.onDestroy && !cachedAsset.isLoading) {
                this.onDestroy(oldestKey, cachedAsset.asset);
            }
            delete cache[oldestKey];
            cachedAsset.cacheHit = this.hitCounter;
            cachedAsset.asset = null;
            cachedAsset.isLoading = true;
            cachedAsset.key = key;
            cachedAsset.observer = Observer.create();
            this.cache[key] = cachedAsset;
        } else {
            cachedAsset = this.cache[key] = cacheArray[cacheArrayLength] = {
                cacheHit: this.hitCounter,
                asset: null,
                isLoading: true,
                key: key,
                observer: Observer.create()
            };
        }
        this.hitCounter += 1;

        var that = this;
        var observer = cachedAsset.observer;
        if (callback) {
            observer.subscribe(callback);
        }
        this.onLoad(key, params, function onLoadedAssetFn(asset) {
            if (cachedAsset.key === key) {
                cachedAsset.cacheHit = that.hitCounter;
                cachedAsset.asset = asset;
                cachedAsset.isLoading = false;
                that.hitCounter += 1;

                cachedAsset.observer.notify(key, asset, params);
            } else {
                if (that.onDestroy) {
                    that.onDestroy(key, asset);
                }
                observer.notify(key, null, params);
            }
        });
    };

    AssetCache.create = // Constructor function
    function (cacheParams) {
        if (!cacheParams.onLoad) {
            return null;
        }

        var assetCache = new AssetCache();

        assetCache.maxCacheSize = cacheParams.size || 64;
        assetCache.onLoad = cacheParams.onLoad;
        assetCache.onDestroy = cacheParams.onDestroy;

        assetCache.hitCounter = 0;
        assetCache.cache = {};
        assetCache.cacheArray = [];

        return assetCache;
    };
    AssetCache.version = 2;
    return AssetCache;
})();
