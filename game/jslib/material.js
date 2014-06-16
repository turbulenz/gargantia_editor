// Copyright (c) 2010-2014 Turbulenz Limited
/*global Reference: false */
//
// Material
//
var Material = (function () {
    function Material() {
    }
    Material.create = function (graphicsDevice) {
        var newMaterial = new Material();
        newMaterial.reference = Reference.create(newMaterial);
        newMaterial.techniqueParameters = graphicsDevice.createTechniqueParameters();
        newMaterial.meta = {};

        newMaterial.onTextureChanged = function materialOnTextureChangedFn(textureInstance) {
            var textureInstanceTexture = textureInstance.texture;
            var material = newMaterial;
            var materialTechniqueParameters = material.techniqueParameters;
            var materialTextureInstances = material.textureInstances;

            for (var p in materialTextureInstances) {
                if (materialTextureInstances.hasOwnProperty(p)) {
                    if (materialTextureInstances[p] === textureInstance) {
                        materialTechniqueParameters[p] = textureInstanceTexture;
                    }
                }
            }
        };

        return newMaterial;
    };

    Material.prototype.getName = function () {
        return this.name;
    };

    Material.prototype.setName = function (name) {
        this.name = name;
    };

    Material.prototype.clone = function (graphicsDevice) {
        var newMaterial = Material.create(graphicsDevice);

        if (this.effect) {
            newMaterial.effect = this.effect;
        }

        if (this.effectName) {
            newMaterial.effectName = this.effectName;
        }

        // Copy meta
        var oldMeta = this.meta;
        var newMeta = newMaterial.meta;
        var p;
        for (p in oldMeta) {
            if (oldMeta.hasOwnProperty(p)) {
                newMeta[p] = oldMeta[p];
            }
        }

        // Copy technique parameters
        var oldTechniqueParameters = this.techniqueParameters;
        var newTechniqueParameters = newMaterial.techniqueParameters;
        for (p in oldTechniqueParameters) {
            if (oldTechniqueParameters.hasOwnProperty(p)) {
                newTechniqueParameters[p] = oldTechniqueParameters[p];
            }
        }

        // Copy texture names
        var oldTextureNames = this.texturesNames;
        if (oldTextureNames) {
            var newTextureNames = newMaterial.texturesNames;
            if (!newTextureNames) {
                newMaterial.texturesNames = newTextureNames = {};
            }

            for (p in oldTextureNames) {
                if (oldTextureNames.hasOwnProperty(p)) {
                    newTextureNames[p] = oldTextureNames[p];
                }
            }
        }

        // Copy texture instances
        var oldTextureInstances = this.textureInstances;
        if (oldTextureInstances) {
            var newTextureInstances = newMaterial.textureInstances;
            if (!newTextureInstances) {
                newMaterial.textureInstances = newTextureInstances = {};
            }

            for (p in oldTextureInstances) {
                if (oldTextureInstances.hasOwnProperty(p)) {
                    var textureInstance = oldTextureInstances[p];
                    newTextureInstances[p] = textureInstance;
                    textureInstance.subscribeTextureChanged(newMaterial.onTextureChanged);
                    textureInstance.reference.add();
                }
            }
        }

        return newMaterial;
    };

    Material.prototype.loadTextures = function (textureManager) {
        var materialTextureNames = this.texturesNames;
        for (var p in materialTextureNames) {
            if (materialTextureNames.hasOwnProperty(p)) {
                var textureName = materialTextureNames[p];
                textureManager.load(textureName);
                this.setTextureInstance(p, textureManager.getInstance(textureName));
            }
        }
    };

    Material.prototype.setTextureInstance = function (propertryName, textureInstance) {
        if (!this.textureInstances) {
            this.textureInstances = {};
        }
        var oldInstance = this.textureInstances[propertryName];
        if (oldInstance !== textureInstance) {
            if (oldInstance && oldInstance.unsubscribeTextureChanged) {
                oldInstance.unsubscribeTextureChanged(this.onTextureChanged);
            }
            this.textureInstances[propertryName] = textureInstance;
            this.techniqueParameters[propertryName] = textureInstance.texture;
            textureInstance.subscribeTextureChanged(this.onTextureChanged);
            textureInstance.reference.add();
        }
    };

    Material.prototype.isSimilar = function (other) {
        if (this.effect !== other.effect) {
            return false;
        }

        if (this.effectName !== other.effectName) {
            return false;
        }

        function similarObjects(a, b) {
            var p;
            for (p in a) {
                if (a.hasOwnProperty(p)) {
                    if (b.hasOwnProperty(p)) {
                        if (a[p] !== b[p]) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
            for (p in b) {
                if (b.hasOwnProperty(p)) {
                    if (!a.hasOwnProperty(p)) {
                        return false;
                    }
                }
            }

            return true;
        }

        function similarArrays(a, b) {
            var length = a.length;
            var n;
            for (n = 0; n < length; n += 1) {
                if (a[n] !== b[n]) {
                    return false;
                }
            }
            return true;
        }

        if (this.meta.materialIndex !== other.meta.materialIndex) {
            var atn = this.texturesNames;
            var btn = other.texturesNames;
            if (atn || btn) {
                if (!atn || !btn) {
                    return false;
                }
                if (!similarObjects(atn, btn)) {
                    return false;
                }
            }
        }

        var atp = this.techniqueParameters;
        var btp = other.techniqueParameters;
        var p, av, bv;
        for (p in atp) {
            if (atp.hasOwnProperty(p)) {
                if (btp.hasOwnProperty(p)) {
                    av = atp[p];
                    bv = btp[p];
                    if (av !== bv) {
                        if (av && typeof av !== "number" && bv && typeof bv !== "number" && av.length === bv.length && av.length) {
                            if (!similarArrays(av, bv)) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }
        }
        for (p in btp) {
            if (btp.hasOwnProperty(p)) {
                if (!atp.hasOwnProperty(p)) {
                    return false;
                }
            }
        }

        return true;
    };

    Material.prototype.destroy = function () {
        delete this.techniqueParameters;

        var textureInstance;
        var textureInstances = this.textureInstances;
        for (var p in textureInstances) {
            if (textureInstances.hasOwnProperty(p)) {
                textureInstance = textureInstances[p];
                textureInstance.unsubscribeTextureChanged(this.onTextureChanged);
                textureInstance.reference.remove();
            }
        }
        delete this.textureInstances;
        delete this.texturesNames;
    };
    Material.version = 1;
    return Material;
})();
