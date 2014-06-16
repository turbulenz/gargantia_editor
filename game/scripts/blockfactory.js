//
//  BlockFactory
//
//  Used to create level blocks
//

/*global Block: false*/
/*global debug: false*/

function BlockFactory() {}

BlockFactory.prototype =
{
    createBlockInstance : function blockfactoryCreateBlockInstanceFn(archetypeName, v3Location, v3Scale, v3Rotation)
    {
        var blockArchetypes = BlockFactory.archetypes;
        var globals = this.globals;
        var mathDevice = globals.mathDevice;

        debug.assert(archetypeName, 'Cannot create block without archetype name.');

        var archetype = blockArchetypes[archetypeName];

        debug.assert(archetype, 'Block archetype not found: ' + archetypeName);

        if (!v3Scale)
        {
            v3Scale = (archetype.v3CreationScale || mathDevice.v3BuildOne());
        }

        if (!v3Rotation)
        {
            v3Rotation = mathDevice.v3BuildZero();
        }

        return Block.create(archetypeName, archetype, v3Location, v3Scale, v3Rotation, globals);
    },

    getArchetype : function blockfactoryGetArchetypeFn(archetypeName)
    {
        return BlockFactory.archetypes[archetypeName];
    },

    // Load archetype assets
    preload : function blockfactoryPreloadFn()
    {
        var archetypes = BlockFactory.archetypes;

        var archetypeName;
        var archetype;

        for (archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetype = archetypes[archetypeName];

                this.loadArchetypeAssets(archetype);
            }
        }
    },

    loadArchetypeAssets : function blockfactoryLoadArchetypeAssetsFn(archetype)
    {
        var globals = this.globals;
        var simpleSceneLoader = globals.simpleSceneLoader;
        var path = archetype.path;

        if (path)
        {
            if (!simpleSceneLoader.isLoadingMesh(path))
            {
                simpleSceneLoader.preload(path,
                                          archetype.stationary,
                                          archetype.numInstances,
                                          archetype.loadOptions);
            }
        }
    },

    getArchetypeList : function blockfactoryGetArchetypeListFn()
    {
        return this.archetypeList;
    },

    createAlphabeticalArchetypeList : function blockfactoryCreateAlphabeticalArchetypeListFn(archetypes)
    {
        var archetypeList = [];

        var archetypeName;

        for (archetypeName in archetypes)
        {
            if (archetypes.hasOwnProperty(archetypeName))
            {
                archetypeList.push(archetypeName);
            }
        }

        archetypeList.sort();

        return archetypeList;
    }
};

BlockFactory.archetypes = {};

BlockFactory.create = function blockfactoryCreateFn(globals, gameManager)
{
    var blockFactory = new BlockFactory();

    blockFactory.globals = globals;
    blockFactory.gameManager = gameManager;

    blockFactory.archetypeList = blockFactory.createAlphabeticalArchetypeList(BlockFactory.archetypes);

    return blockFactory;
};
