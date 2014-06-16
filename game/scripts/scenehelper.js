/*global Material: false*/
/*global Scene: true*/
/*global SceneNode: true*/
/*global Utilities: false*/

//
// Material clone
//
Material.prototype.clone = function materialCloneFn(graphicsDevice)
{
    var newMaterial = Material.create(graphicsDevice);

    var p, value;

    var textureInstances = this.textureInstances;
    for (p in textureInstances)
    {
        if (textureInstances.hasOwnProperty(p))
        {
            newMaterial.setTextureInstance(p, textureInstances[p]);
        }
    }

    var techniqueParameters = this.techniqueParameters;
    for (p in techniqueParameters)
    {
        if (techniqueParameters.hasOwnProperty(p))
        {
            value = techniqueParameters[p];

            if (typeof value === "object")
            {
                if ("slice" in value)
                {
                    value = value.slice();
                }
            }

            newMaterial.techniqueParameters[p] = value;
        }
    }

    var meta = this.meta;
    for (p in meta)
    {
        if (meta.hasOwnProperty(p))
        {
            newMaterial.meta[p] = meta[p];
        }
    }

    newMaterial.effect = this.effect;

    return newMaterial;
};

SceneNode.prototype.forAll = function sceneNodeforAll(functor)
{
    functor(this);

    if (this.children)
    {
        for (var index = 0; index < this.children.length; index += 1)
        {
            this.children[index].forAll(functor);
        }
    }
};

Scene.prototype.renameRootNode = function sceneRenameRootNodeFn(rootNode, newName)
{
    Utilities.assert(newName, "Root nodes must be named");
    Utilities.assert(rootNode.scene, "Root node not already in a scene");
    Utilities.assert(!this.rootNodesMap[newName], "Root node with the same new name exits in the scene");

    delete this.rootNodesMap[rootNode.name];
    rootNode.name               =   newName;
    this.rootNodesMap[newName]  =   rootNode;
};
