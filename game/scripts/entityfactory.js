//  EntityFactory
//  Entities on demand!
//

/*global Config: false*/
/*global debug: false*/
/*global DUIArrayValue: false*/
/*global EntityComponentBase: false*/
/*global GameEntity: false*/

function EntityFactory() {}

EntityFactory.prototype =
{
    createActiveEntityInstance : function entityfactoryCreateActiveEntityInstanceFn(
        name, archetypeName, v3Location, v3Rotation)
    {
        var newEntity = this.createInactiveEntityInstance(name, archetypeName, v3Location, v3Rotation);

        newEntity.activate();

        return newEntity;
    },

    createInactiveEntityInstance : function entityfactorycreateEntityInstanceFn(
        name, archetypeName, v3Location, v3Rotation)
    {
        var archetype = this.archetypes[archetypeName];

        // ASSERT
        debug.assert(archetype,
            'entity archetype \'' + archetypeName + '\' not found. Failed to create entity.');

        var newEntity = this.createEntity(name, archetype.familyName, archetype, v3Location, v3Rotation);

        newEntity.archetypeName = archetypeName;

        return newEntity;
    },

    createCustomEntityInstance : function entityfactoryCreateCustomEntityInstanceFn(
        name, customEntityFamilyName, v3Location, v3Rotation)
    {
        debug.assert(customEntityFamilyName, 'Custom entities must have a family name.');

        return this.createEntity(name, customEntityFamilyName, null, v3Location, v3Rotation);
    },

    createInactiveEditorObjectInstance : function entityfactoryCreateInactiveEditorObjectInstanceFn(
        name, ecMeshParams, v3Location, v3Rotation)
    {
        var editorEntity = this.createCustomEntityInstance(name, name, v3Location, v3Rotation);

        var ecMesh = EntityComponentBase.createFromName('ECMesh', this.globals, ecMeshParams);
        editorEntity.addECToCustomEntity(ecMesh);

//        editorEntity.removeECFromCustomEntity('ECGameGridEntity');

        return editorEntity;
    },

    createEntity : function entityfactoryCreateEntityFn(
        name, familyName, archetype, v3Location, v3Rotation)
    {
        var globals = this.globals;
        archetype = archetype || {};

        var component;
        var newEntity;
        var componentParameters;

        var newComponent;

        // Create the entity

        newEntity = GameEntity.create(
            name, familyName, globals, v3Location, archetype.shouldLevelSave, archetype.shouldPlayerSave, v3Rotation);

        // Add the components
        for (component in archetype)
        {
            if (archetype.hasOwnProperty(component) && this.isValidECName(component))
            {
                componentParameters = archetype[component];

                if (!componentParameters)
                {
                    componentParameters = {};
                }

                newComponent = EntityComponentBase.createFromName(component,
                    globals,
                    componentParameters);

                newEntity.addEC(newComponent);
            }
        }

//        if (!newEntity.getEC('ECGameGridEntity'))
//        {
//            newEntity.addEC(EntityComponentBase.createFromName('ECGameGridEntity', globals, undefined));
//        }

        return newEntity;
    },

    getCurrentArchetype : function entityfactoryGetCurrentArchetypeFn()
    {
        return this.currentArchetype;
    },

    getEntityArchetype : function entityfactoryGetEntityArchetypeFn(archetypeName)
    {
        return  this.archetypes[archetypeName];
    },

    getECArchetype : function entityfactoryGetECArchetypeFn(archetypeName, ecName)
    {
        var entityArchetype   =   this.getEntityArchetype(archetypeName);
        if (!entityArchetype)
        {
            return  undefined;
        }
        return  entityArchetype[ecName];
    },

    getArchetypeECList : function entityfactoryGetArchetypeECListFn(archetypeName)
    {
        var ecList = [];

        var archetype = this.getEntityArchetype(archetypeName);
        for (var archetypeProperty in archetype)
        {
            if (archetype.hasOwnProperty(archetypeProperty))
            {
                if (this.isValidECName(archetypeProperty))
                {
                    ecList.push(archetypeProperty);
                }
            }
        }

        return ecList;
    },

    getv3ObjectExtents : function entityfactoryGetv3ObjectExtentsFn(archetypeName)
    {
        var globals     = this.globals;
        var gameManager = this.gameManager;
        var mathDevice  = globals.mathDevice;

        var archetype;
        var physicsCubeParameters;
        var physicsSphereParameters;

        var v3CubeScale;
        var sphereDiameter;
        var defaultDiameter = 1.0;

        var v3ObjectExtents;
        var objectExtentsDefined = false;

        if (gameManager && mathDevice)
        {
            archetype     = this.getEntityArchetype(archetypeName);

            if (archetype)
            {
                physicsCubeParameters = this.getArchetypeComponentParameters(archetype, 'ECPhysicsCube');
                if (!objectExtentsDefined && physicsCubeParameters)
                {
                    v3CubeScale = physicsCubeParameters.v3Scale;
                    if (v3CubeScale)
                    {
                        v3ObjectExtents = mathDevice.v3Copy(v3CubeScale);
                        objectExtentsDefined = true;
                    }
                }

                physicsSphereParameters = this.getArchetypeComponentParameters(archetype, 'ECPhysicsSphere');
                if (!objectExtentsDefined && physicsSphereParameters)
                {
                    sphereDiameter = physicsSphereParameters.radius;
                    if (sphereDiameter !== undefined)
                    {
                        sphereDiameter *= 2.0;
                        v3ObjectExtents = mathDevice.v3Build(sphereDiameter, sphereDiameter, sphereDiameter);
                        objectExtentsDefined = true;
                    }
                }
            }

            if (!objectExtentsDefined)
            {
                v3ObjectExtents = mathDevice.v3Build(defaultDiameter, defaultDiameter, defaultDiameter);
            }
        }

        return v3ObjectExtents;
    },

    getArchetypeComponentParameters : function entityFactoryGetArchetypeComponentParametersFn(archetype, componentType)
    {
        return archetype[componentType];
    },

    initArchetypes : function entityFactoryInitArchetypesFn()
    {
        var archetypeDescs     = EntityFactory.archetypes;
        var fullArchetypeDescs = {};
        var archetypes         = this.archetypes;

        var archetype;
        var archetypeName;
        var archetypeDesc;
        var fullArchetypeDesc;

        // Inject missing parameters to archetype components (including name)
        for (archetypeName in archetypeDescs)
        {
            if (archetypeDescs.hasOwnProperty(archetypeName))
            {
                archetypeDesc = archetypeDescs[archetypeName];

                // Add name
                archetypeDesc.name = archetypeName;

                // Add missing default values (if root archetype)
                if (!archetypeDesc.parent)
                {
                    fullArchetypeDesc = this.completeArchetypeDescription(archetypeDesc);
                }
                else
                {
                    fullArchetypeDesc = archetypeDesc;
                }

                fullArchetypeDescs[archetypeName] = fullArchetypeDesc;
            }
        }

        // Create the final archetypes (uses the inherited values)

        for (archetypeName in fullArchetypeDescs)
        {
            if (fullArchetypeDescs.hasOwnProperty(archetypeName))
            {
                if (!archetypes[archetypeName])
                {
                    archetypeDesc = fullArchetypeDescs[archetypeName];
                    archetype     = this.createAndStoreArchetypeFromDescription(archetypeDesc, fullArchetypeDescs, archetypes);
                }
            }
        }

        archetypes = this.completeEntitySpawnerArchetypes(archetypes);

        this.archetypeList = this.createAlphabeticalArchetypeArray(archetypes);
    },

    getArchetypesWithEC : function entityfactoryGetArchetypesWithECFn(archetypes, ecName)
    {
        var archetypeList = [];

        var archetype;

        for (var archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetype = archetypes[archetypeName];

                if (archetype[ecName])
                {
                    archetypeList.push(archetypeName);
                }
            }
        }

        return archetypeList;
    },

    completeEntitySpawnerArchetypes : function entityfactoryCompleteEntitySpawnerArchetypesFn(archetypes)
    {
        var archetypeList = this.getArchetypesWithEC(archetypes, 'ECEntitySpawner');
        var archetypeListLength = archetypeList.length;

        for (var archetypeIndex = 0; archetypeIndex < archetypeListLength; archetypeIndex += 1)
        {
            var archetypeName = archetypeList[archetypeIndex];
            var archetype = archetypes[archetypeName];
            var ecEntitySpawnerParams = archetype.ECEntitySpawner;
            var archetypeToSpawnName = ecEntitySpawnerParams.archetypeToSpawn;
            if (ecEntitySpawnerParams && !archetypeToSpawnName)
            {
                if (ecEntitySpawnerParams.randomArchetypesToSpawn)
                {
                    archetypeToSpawnName = ecEntitySpawnerParams.randomArchetypesToSpawn[0];
                }
                else if (ecEntitySpawnerParams.archetypesToSpawn)
                {
                    archetypeToSpawnName = ecEntitySpawnerParams.archetypesToSpawn[0].archetype;

                    if (!archetypeToSpawnName)
                    {
                        archetypeToSpawnName = ecEntitySpawnerParams.archetypesToSpawn[0];
                    }
                }
            }
            var archetypeToSpawn = archetypes[archetypeToSpawnName];
            if (archetypeToSpawn.ECMesh)
            {
                archetype.ECMesh = archetypeToSpawn.ECMesh;
            }
        }

        return archetypes;
    },

    createAndStoreArchetypeFromDescription : function entityFactoryCreateAndStoreArchetypeFromDescriptionFn(archetypeDesc, archetypeDescs, outputArchetypes)
    {
        var archetype   = {};

        var parentArchetypeName;
        var parentArchetypeDesc;
        var parentArchetype;

        parentArchetypeName = archetypeDesc.parent;

        // Create parent archetypes recursively
        if (parentArchetypeName &&
            !outputArchetypes[parentArchetypeName])
        {
            parentArchetypeDesc = archetypeDescs[parentArchetypeName];

            this.createAndStoreArchetypeFromDescription(parentArchetypeDesc, archetypeDescs, outputArchetypes);
        }

        // Copy archetypeDesc and parent properties into archetype object

        // Go through parent components
        if (parentArchetypeName)
        {
            parentArchetype = outputArchetypes[parentArchetypeName];
            this.copyArchetypeProperties(parentArchetype, archetype);
        }

        // These overwrite parent properties
        this.copyArchetypeProperties(archetypeDesc, archetype);

        outputArchetypes[archetypeDesc.name] = archetype;
    },

    // Copies all source component properties to destination - overwriting existing properties, and creating any missing components
    copyArchetypeProperties : function entityFactoryCopyArchetypePropertiesFn(source, destination)
    {
        var EC_DEFAULT = EntityFactory.EC_DEFAULT;
        var EC_REMOVE = EntityFactory.EC_REMOVE;

        var componentName;
        var sourceComponent;
        var destinationComponent;
        var propertyName;

        var removedECs = [];
        var numRemovedECs;
        var removedECIndex;
        var removedEC;

        for (componentName in source)
        {
            if (source.hasOwnProperty(componentName))
            {
                if (componentName === 'parent')
                {
                    continue;
                }
                else if (this.isValidECName(componentName))
                {
                    sourceComponent = source[componentName];

                    if (sourceComponent === EC_REMOVE)
                    {
                        removedECs.push(componentName);
                    }
                    else
                    {
                        // Add component to destination if missing
                        if (!destination.hasOwnProperty(componentName))
                        {
                            destination[componentName] = {};
                        }

                        destinationComponent = destination[componentName];

                        if (sourceComponent !== EC_DEFAULT)
                        {
                            // Copy properties
                            for (propertyName in sourceComponent)
                            {
                                if (sourceComponent.hasOwnProperty(propertyName))
                                {
                                    destinationComponent[propertyName] = sourceComponent[propertyName];
                                }
                            }
                        }
                    }
                }
                else
                {
                    destination[componentName] = source[componentName];
                }
            }
        }

        numRemovedECs = removedECs.length;
        for (removedECIndex = 0; removedECIndex < numRemovedECs; removedECIndex += 1)
        {
            removedEC = removedECs[removedECIndex];
            if (removedEC)
            {
                delete destination[removedEC];
            }
        }
    },

    completeArchetypeDescription : function entityFactoryCompleteArchetypeDescriptionFn(archetype)
    {
        var componentName;
        var component;

        for (componentName in archetype)
        {
            if (archetype.hasOwnProperty(componentName) && this.isValidECName(componentName))
            {
                component   =   archetype[componentName];

                if (!component)
                {
                    component                   =   {};
                    archetype[componentName]    =   component;
                }

                component   =   EntityComponentBase.completeParameters(componentName, component);
            }
        }

        return archetype;
    },

    initUI : function entityFactoryInitUIFn()
    {
        var globals =   this.globals;
        var ui      =   globals.dynamicUI;
        if (!ui)
        {
            return;
        }

        if (Config.addArchetypeSliders)
        {
            var archetypesAlphabetical = this.getArchetypeList();
            this.addArchetypesUI(ui, archetypesAlphabetical);
        }
    },

    createAlphabeticalArchetypeArray : function entityFactoryCreateAlphabeticalArchetypeArrayFn(archetypes)
    {
        var archetypeArray  =   [];

        var archetypeName;

        for (archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetypeArray.push(archetypeName);
            }
        }

        archetypeArray.sort();

        return archetypeArray;
    },

    isValidECName : function entityFactoryIsValidECNameFn(componentName)
    {
        return  (componentName !== 'name') &&
            (componentName !== 'parent') &&
            (componentName !== 'shouldLevelSave') &&
            (componentName !== 'shouldPlayerSave') &&
            (componentName !== 'familyName' &&
            (componentName !== 'editorIconPath'));
    },

    // Archetype sliders

    addArchetypesUI : function entityFactoryAddArchetypesUIFn(parentGroup, archetypeNames)
    {
        var ui                      =   this.globals.dynamicUI;
        var archetypesGroup         =   ui.addGroup('Archetypes', null, function () {}, {collapsable: true});
        var archetypeNamesLength    =   archetypeNames.length;

        var i;

        for (i = 0; i < archetypeNamesLength; i += 1)
        {
            this.addArchetypeUI(archetypeNames[i], archetypesGroup);
        }
    },

    addArchetypeUI : function entityFactoryAddArchetypeUIFn(archetypeName, parentGroup)
    {
        var ui              =   this.globals.dynamicUI;
        var archetypeGroup  =   ui.addGroup(archetypeName, parentGroup, function () {}, {collapsable: true});
        var archetype       =   this.archetypes[archetypeName];

        var componentName;

        for (componentName in archetype)
        {
            if (archetype.hasOwnProperty(componentName) && this.isValidECName(componentName))
            {
                this.addComponentUI(archetype, componentName, archetypeGroup);
            }
        }
    },

    addComponentUI : function entityFactoryAddComponentUIFn(archetype, componentName, parentGroup)
    {
        var ui                  =   this.globals.dynamicUI;
        var realTime            =   EntityComponentBase.getECPrototype(componentName).realTime;
        var componentGroup      =   ui.addGroup(componentName + (realTime ? ' (Real Time)' : ''), parentGroup, function () {}, {collapsable: true});
        var componentParameters =   EntityComponentBase.getECParameters(componentName);

        var componentParameterName;
        var componentParameter;
        var archetypeParameters;

        if (componentParameters)
        {
            for (componentParameterName in componentParameters)
            {
                if (componentParameters.hasOwnProperty(componentParameterName))
                {
                    componentParameter  =   componentParameters[componentParameterName];
                    archetypeParameters =   archetype[componentName];

                    this.addComponentParameterUI(componentName,
                                                 componentParameterName,
                                                 componentParameter,
                                                 archetypeParameters,
                                                 componentGroup);
                }
            }
        }
    },

    addComponentParameterUI : function entityFactoryAddComponentParameterUIFn(componentName,
                                                                              parameterName,
                                                                              parameter,
                                                                              archetypeParameters,
                                                                              parentGroup)
    {
        if (archetypeParameters === null || parameter === undefined)
        {
            return;
        }

        var defaultValue    =   parameter.defaultValue;

        if (typeof parameter !== 'object')
        {
            defaultValue    =   parameter;
        }
        else
        {
            defaultValue    =   parameter.defaultValue;
        }

        // We only create sliders for optional parameters (i.e. those withou defaultValue) if
        // they already exist on the archetype
        if (defaultValue === undefined)
        {
            defaultValue    =   archetypeParameters[parameterName];

            if (defaultValue === undefined)
            {
                return;
            }
        }

        var defaultValueType    =   typeof defaultValue;

        if (defaultValueType === 'number')
        {
            this.watchFloat(parameter,
                            parameterName,
                            archetypeParameters,
                            parentGroup);
        }
        else if (defaultValueType === 'boolean')
        {
            this.watchBool(parameter,
                           parameterName,
                           archetypeParameters,
                           parentGroup);
        }
        else if (defaultValueType === 'object' &&
                 defaultValue.length)
        {
            this.watchArray(defaultValue,
                parameter,
                parameterName,
                archetypeParameters,
                parentGroup);
        }
    },

    watchFloat : function entityFactoryWatchFloatFn(parameter,
                                                    parameterName,
                                                    archetypeParameters,
                                                    parentGroup)
    {
        var ui      =   this.globals.dynamicUI;
        var options =   this.getFloatSliderOptions(parameter);

        ui.watchVariable(
            parameterName,
            archetypeParameters,
            parameterName,
            'slider',
            parentGroup,
            options);
    },

    watchBool : function entityFactoryWatchBoolFn(parameter,
                                                  parameterName,
                                                  archetypeParameters,
                                                  parentGroup)
    {
        var ui      =   this.globals.dynamicUI;

        ui.watchVariable(
            parameterName,
            archetypeParameters,
            parameterName,
            'checkbox',
            parentGroup);
    },

    watchArray : function entityFactoryWatchArrayFn(array,
                                                    parameter,
                                                    parameterName,
                                                    archetypeParameters,
                                                    parentGroup)
    {
        var ui      =   this.globals.dynamicUI;
        var group =   ui.addGroup(parameterName, parentGroup, function () {}, {collapsable: true});
        var index;
        var value;
        var options;
        var widgetType;
        var dataType  = typeof array[0]; // Assumes all elements are of the same type

        if (dataType === 'number')
        {
            options = this.getV3SliderOptions(parameter);
            widgetType = 'slider';
        }
        else if (dataType === 'boolean')
        {
            options = {};
            widgetType = 'checkbox';
        }
        else
        {
            return; // objects or strings not supported
        }

        for (index = 0; index < array.length; index += 1)
        {
            value = DUIArrayValue.create(archetypeParameters, parameterName, index);

            options.getValue    =   value.get;
            options.setValue    =   value.set;

            ui.watchVariable(
                parameterName + '[' +  index + ']',
                archetypeParameters,
                parameterName,
                widgetType,
                group,
                options);
        }
    },

    getFloatSliderOptions : function entityFactoryGetFloatSliderOptionsFn(parameter)
    {
        var options =   {};

        var defaultValue;
        var absDefaultValue;

        if (typeof parameter === 'object')
        {
            options.min     =   parameter.minValue;
            options.max     =   parameter.maxValue;
            options.step    =   parameter.step;

            defaultValue    =   parameter.defaultValue;
        }
        else
        {
            defaultValue    =   parameter;
        }

        if (options.min === undefined)
        {
            options.min    =   0;
        }

        if (options.max === undefined)
        {
            absDefaultValue =   Math.abs(defaultValue);

            if (absDefaultValue < 10)
            {
                options.max =   10.0;
            }
            else if (absDefaultValue < 100)
            {
                options.max =   100.0;
            }
            else
            {
                options.max =   1000.0;
            }

            if (defaultValue < 0.0)
            {
                options.max *=  -1.0;
            }
        }

        if (options.step === undefined)
        {
            options.step    =   ((options.max - options.min) * 0.01);
        }

        return options;
    },

    getV3SliderOptions : function entityFactoryGetV3SliderOptionsFn(parameter)
    {
        var v3ComponentParameter;

        if (parameter instanceof Array)
        {
            return this.getFloatSliderOptions(parameter[0]);
        }
        else
        {
            // TODO: add support for different defaults per component
            v3ComponentParameter =
            {
                minValue        :   parameter.minValue,
                maxValue        :   parameter.maxValue,
                step            :   parameter.step,
                defaultValue    :   parameter.defaultValue[0]
            };

            return this.getFloatSliderOptions(v3ComponentParameter);
        }
    },

    // Load archetype assets
    preload : function entityfactoryPreloadFn()
    {
        var archetypes = this.archetypes;
        var archetypeName;
        var archetype;

        for (archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetype   =   archetypes[archetypeName];

                this.loadArchetypeAssets(archetype);
            }
        }

        this.loadGameEntityAssets();
    },

    loadArchetypeAssets : function entityFactoryLoadArchetypeAssetsFn(archetype)
    {
        var globals             =   this.globals;
        var ecClass;
        var componentName;

        for (componentName in archetype)
        {
            if (archetype.hasOwnProperty(componentName) && this.isValidECName(componentName))
            {
                ecClass = EntityComponentBase.getECClass(componentName);
                if (ecClass.preloadComponent)
                {
                    ecClass.preloadComponent(globals, archetype[componentName]);
                }
            }
        }
    },

    loadGameEntityAssets : function entityFactoryLoadGameEntityAssetsFn()
    {

        var globals = this.globals;
        var tm = globals.textureManager;

        EntityComponentBase.forEachECClass(function (ecClass)
        {
            if (ecClass.preload)
            {
                ecClass.preload(globals);
            }
        });

        var progressBarTexturePath = GameEntity.progressBarTexturePath;

        if (tm)
        {
            if (progressBarTexturePath)
            {
                tm.load(progressBarTexturePath);
            }
        }
    },

    getArchetypeList : function entityfactoryGetArchetypeListFn()
    {
        return this.archetypeList;
    }
};

EntityFactory.archetypes = {};

EntityFactory.EC_DEFAULT = 0;
EntityFactory.EC_REMOVE = 1;

EntityFactory.create = function entityFactoryCreateFn(globals, gameManager)
{
    var entityFactory    =   new EntityFactory();

    entityFactory.globals           = globals;
    entityFactory.gameManager       = gameManager;

    entityFactory.archetypes = {};
    entityFactory.archetypeList = [];

    entityFactory.initArchetypes();
    entityFactory.initUI();

    return entityFactory;
};
