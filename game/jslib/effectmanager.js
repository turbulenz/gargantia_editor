// Copyright (c) 2009-2014 Turbulenz Limited
/*global Utilities: false*/
"use strict";
;

//
// Effect
//
var Effect = (function () {
    function Effect() {
    }
    Effect.create = function (name) {
        var effect = new Effect();

        effect.name = name;
        effect.geometryType = {};
        effect.numMaterials = 0;
        effect.materialsMap = {};

        return effect;
    };

    Effect.prototype.hashMaterial = function (material) {
        var texturesNames = material.texturesNames;
        var hashArray = [];
        var numTextures = 0;
        for (var p in texturesNames) {
            if (texturesNames.hasOwnProperty(p)) {
                hashArray[numTextures] = texturesNames[p];
                numTextures += 1;
            }
        }
        if (1 < numTextures) {
            hashArray.sort();
            return hashArray.join(',');
        } else if (0 < numTextures) {
            return hashArray[0];
        } else {
            /* tslint:disable:no-string-literal */
            var materialColor = material.techniqueParameters['materialColor'];

            if (materialColor) {
                var length = materialColor.length;
                var n;
                for (n = 0; n < length; n += 1) {
                    hashArray[n] = materialColor[n].toFixed(3).replace('.000', '');
                }
                return hashArray.join(',');
            } else {
                return material.name;
            }
        }
    };

    Effect.prototype.prepareMaterial = function (material) {
        var hash = this.hashMaterial(material);
        var index = this.materialsMap[hash];
        if (index === undefined) {
            index = this.numMaterials;
            this.numMaterials += 1;
            this.materialsMap[hash] = index;
        }
        material.meta.materialIndex = index;
        material.effect = this;
    };

    Effect.prototype.add = function (geometryType, prepareObject) {
        this.geometryType[geometryType] = prepareObject;
    };

    Effect.prototype.remove = function (geometryType) {
        delete this.geometryType[geometryType];
    };

    Effect.prototype.get = function (geometryType) {
        return this.geometryType[geometryType];
    };

    Effect.prototype.prepare = function (renderable) {
        var prepareObject = this.geometryType[renderable.geometryType];
        if (prepareObject) {
            prepareObject.prepare(renderable);
        } else {
            debug.abort("Unsupported or missing geometryType");
        }
    };
    Effect.version = 1;
    return Effect;
})();

//
// EffectManager
//
var EffectManager = (function () {
    function EffectManager() {
    }
    EffectManager.create = function () {
        var effectManager = new EffectManager();
        effectManager.effects = {};
        return effectManager;
    };

    EffectManager.prototype.add = function (effect) {
        debug.assert(this.effects[effect.name] === undefined);
        this.effects[effect.name] = effect;
    };

    EffectManager.prototype.remove = function (name) {
        delete this.effects[name];
    };

    EffectManager.prototype.map = function (destination, source) {
        this.effects[destination] = this.effects[source];
    };

    EffectManager.prototype.get = function (name) {
        var effect = this.effects[name];
        if (!effect) {
            /* tslint:disable:no-string-literal */
            return this.effects["default"];
            /* tslint:enable:no-string-literal */
        }
        return effect;
    };
    EffectManager.version = 1;
    return EffectManager;
})();
