//
//  Gargantia editor actions
//
//
//
/*global PlayFlags: false*/
/*global Editor: false*/
/*global EntityComponentBase: false*/

Editor.Actions.actionMap.refreshSpawners = function editoractionsrefreshSpawnersFn(globals, gameManager/*, params*/)
{
    var entityList    =   gameManager.getEntitiesWithEC('ECEntitySpawner');
    var ecEntitySpawner;

    var entityListLength = entityList.length;
    var entityListIndex;

    var currentEntity;

    var playFlags = PlayFlags.playFlagsPrototype;
    for (entityListIndex = 0; entityListIndex < entityListLength; entityListIndex += 1)
    {
        currentEntity   =   entityList[entityListIndex];
        if (currentEntity)
        {
            ecEntitySpawner = currentEntity.getEC('ECEntitySpawner');
            if (ecEntitySpawner)
            {
                ecEntitySpawner.applySpawnBehaviourBasedOnFlags(playFlags);
            }
        }
    }
};

function notToBeDestroyed(entity)
{
    return !entity.toBeDestroyed;
}

Editor.Actions.actionMap.enterEditorGargantia = function edtiractionsEnterEditorFn(globals, gameManager/*, params*/)
{
    gameManager.birdManager.clear();
    gameManager.cloudManager.clear();

    var entities = gameManager.getEntitiesWithEC("ECHoopSpawner");
    for (var i = 0; i < entities.length; i += 1)
    {
        entities[i].showMesh(true);
    }

    var birds = EntityComponentBase.getEntitiesWithEC("ECBirdSpawner").filter(notToBeDestroyed);
    for (i = 0; i < birds.length; i += 1)
    {
        birds[i].showMesh(true);
    }

    var blocks = gameManager.getBlocksByArchetype("a_bl_physics_cube");
    for (i = 0; i < blocks.length; i += 1)
    {
        blocks[i].enableMeshNode();
    }
};

Editor.Actions.actionMap.exitEditorGargantia = function edtiractionsExitEditorFn(globals, gameManager/*, params*/)
{
    var entities = gameManager.getEntitiesWithEC("ECHoopSpawner");
    for (var i = 0; i < entities.length; i += 1)
    {
        entities[i].hideMesh(true);
    }

    var birds = EntityComponentBase.getEntitiesWithEC("ECBirdSpawner").filter(notToBeDestroyed);
    for (i = 0; i < birds.length; i += 1)
    {
        birds[i].hideMesh(true);
    }

    var blocks = gameManager.getBlocksByArchetype("a_bl_physics_cube");
    for (i = 0; i < blocks.length; i += 1)
    {
        blocks[i].disableMeshNode();
    }
};

Editor.Actions.actionMap.draw3dGrid = function editoractionsgargantiaDraw3dGridFn(globals, gameManager, params)
{
    var debugDraw = globals.debugDraw;
    var mathDevice = globals.mathDevice;

    var v3GridColour = Editor.State.majorGridColour;
    var gameSpaceList = gameManager.getGameSpaceList();

    var spacing = params.spacing;

    gameSpaceList.forEach(
        function (gameSpace)
        {
            var gameSpaceExtents = gameSpace.getExtents();
            Editor.Draw.draw3dGrid(
                gameSpaceExtents, spacing, v3GridColour, debugDraw, mathDevice);
        });
};
