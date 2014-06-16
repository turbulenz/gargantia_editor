//
// Block - contains either both, or one of, a mesh and a worldcube
//

/*global debug: false*/
/*global WorldCube: false*/

function Block() {}

Block.prototype =
{
    isBlock : true,

    getV3Scale : function blockGetV3ScaleFn()
    {
        return this.v3Scale;
    },

    getv3Location : function blockGetv3LocationFn()
    {
        return this.v3Location;
    },

    hasEditorExtents : function blockHasEditorExtentsFn()
    {
        var hasExtents = false;

        if (this.editorExtents)
        {
            hasExtents = true;
        }

        return hasExtents;
    },

    getEditorExtents : function blockGetEditorExtentsFn()
    {
        var extents = this.editorExtents;

        if (!extents)
        {
            extents = this.extents;
        }

        return extents;
    },

    getExtents : function blockGetExtentsFn()
    {
        return this.extents;
    },

    getRotationX : function blockGetRotationXFn()
    {
        return this.v3Rotation[0];
    },

    getRotationY : function blockGetRotationYFn()
    {
        return this.v3Rotation[1];
    },

    getRotationZ : function blockGetRotationZFn()
    {
        return this.v3Rotation[2];
    },

    getV3Rotation : function blockGetV3RotationFn()
    {
        return this.v3Rotation;
    },

    getWorldCube : function blockGetWorldCubeFn()
    {
        return this.worldCube;
    },

    getArchetypeName : function blockGetArchetypeNameFn()
    {
        return this.archetypeName;
    },

    isBuildZone : function blockIsBuildZoneFn()
    {
        return (this.worldCube && this.worldCube.buildZone);
    },

    addToGameSpace : function blockAddToGameSpaceFn(gameSpace)
    {
        gameSpace.addBlock(this);

        if (this.worldCube)
        {
            gameSpace.addCube(this.worldCube);
        }
    },

    removeFromGameSpace : function blockRemoveFromGameSpaceFn(gameSpace)
    {
        gameSpace.removeBlock(this);

        if (this.worldCube)
        {
            gameSpace.removeCube(this.worldCube);
        }
    },

    disableMeshNode : function blockDisableMeshNode()
    {
        if (this.meshNode && this.meshNode.isInScene())
        {
            var scene = this.globals.scene;
            scene.removeRootNode(this.meshNode);
        }
    },

    enableMeshNode : function blockEnableMeshNode()
    {
        if (this.meshNode)
        {
            var scene = this.globals.scene;
            var oldNode = this.meshNode;
            this.meshNode = oldNode.clone();
            this.meshNode.setStatic();
            oldNode.destroy();
            scene.addRootNode(this.meshNode);
        }
    },

    destroyMeshNode : function blockDestroyMeshNode()
    {
        if (this.meshNode)
        {
            var scene = this.globals.scene;
            if (this.meshNode.isInScene())
            {
                scene.removeRootNode(this.meshNode);
            }
            this.meshNode.destroy();
            this.meshNode = null;
        }
    },

    drawDebug : function blockDrawDebugFn()
    {
        if (this.worldCube)
        {
            this.worldCube.drawDebug();
        }
    },

    destroy : function blockDestroyFn()
    {
        if (this.worldCube)
        {
            this.worldCube.destroy();
            this.worldCube = null;
        }

        this.destroyMeshNode();
    }
};

Block.create = function blockCreateFn(archetypeName, archetype, v3Location, v3Scale, v3Rotation, globals)
{
    var block = new Block();

    debug.assert(archetypeName, 'Cannot create block without archetype name.');
    debug.assert(archetype, 'Cannot create block without archetype.');
    debug.assert(v3Location, 'Cannot create block without v3Location.');
    debug.assert(v3Scale, 'Cannot create block without v3Scale.');
    debug.assert(v3Rotation, 'Cannot create block without v3Rotation.');
    debug.assert(globals, 'Cannot create block without globals.');

    var md = globals.mathDevice;

    var m33Rotation;

    var snapRotationFactor = (Math.PI / 4);

    if (v3Rotation)
    {
        var rotationX = (Math.round(v3Rotation[0] / snapRotationFactor) * snapRotationFactor);
        var rotationY = (Math.round(v3Rotation[1] / snapRotationFactor) * snapRotationFactor);
        var rotationZ = (Math.round(v3Rotation[2] / snapRotationFactor) * snapRotationFactor);
        m33Rotation = md.m33BuildRotationXZY(md.v3Build(rotationX, rotationY, rotationZ));
    }

    var worldCube;
    var meshNode;
    var meshNodeExtents;

    var editorExtents;

    var v3MeshLocation, v3MeshOffset;

    if (archetype.path)
    {
        var m43Transform = md.m43BuildScale(v3Scale);

        if (m33Rotation)
        {
            md.m43MulM33(m43Transform, m33Rotation, m43Transform);
        }

        v3MeshLocation = md.v3Copy(v3Location);
        v3MeshOffset   = archetype.v3MeshOffset;
        if (v3MeshOffset)
        {
            if (m33Rotation)
            {
                v3MeshOffset = md.m33Transform(m33Rotation, archetype.v3MeshOffset);
            }
            md.v3Add(v3MeshLocation, v3MeshOffset, v3MeshLocation);
        }

        md.m43Translate(m43Transform, v3MeshLocation);

        meshNode = globals.simpleSceneLoader.load(archetype.path, m43Transform, true, undefined);
        meshNode.update();
    }

    if (archetype.physical)
    {
        var v3WorldCubeScale;
        var v3WorldCubeLocation = md.v3Copy(v3Location);

        if (archetype.v3PhysicsScale || !meshNode)
        {
            var v3PhysicsScale = archetype.v3PhysicsScale || md.v3BuildOne();
            v3WorldCubeScale = md.v3Mul(v3Scale, v3PhysicsScale);

            if (m33Rotation)
            {
                md.m33Transform(m33Rotation, v3WorldCubeScale, v3WorldCubeScale);
            }
            md.v3Abs(v3WorldCubeScale, v3WorldCubeScale);
        }
        else
        {
            //debug.warn('Block has physics but does not specify a \'v3PhysicsScale\': ' + archetypeName);

            meshNodeExtents = meshNode.calculateHierarchyWorldExtents();
            var v3MeshCentre = md.v3BuildZero();
            v3WorldCubeScale = md.v3BuildZero();
            md.aabbGetCenterAndHalf(meshNodeExtents, v3MeshCentre, v3WorldCubeScale);
            md.v3ScalarMul(v3WorldCubeScale, 2.0, v3WorldCubeScale);

            v3WorldCubeScale[0] = 0.25 * Math.round(v3WorldCubeScale[0] * 4.0);
            v3WorldCubeScale[1] = 0.25 * Math.round(v3WorldCubeScale[1] * 4.0);
            v3WorldCubeScale[2] = 0.25 * Math.round(v3WorldCubeScale[2] * 4.0);

            // NB. All block meshes have origins at their bottom centre
            v3WorldCubeLocation = md.v3Copy(v3Location);
            v3WorldCubeLocation[1] += v3WorldCubeScale[1] * 0.5;
        }

        if (archetype.v3PhysicsOffset)
        {
            md.v3Add(v3WorldCubeLocation, md.v3Mul(archetype.v3PhysicsOffset, v3Scale), v3WorldCubeLocation);
        }

        var worldCubeParameters =
        {
            isBuildZone : (archetype.isBuildZone ? true : false),
            terrainType : archetype.terrainType,
            stationary : true,
            v3Scale : v3WorldCubeScale,
            physical : archetype.physical,
            opaque : archetype.opaque
        };

        worldCube = WorldCube.create(v3WorldCubeLocation, globals, globals.gameManager, worldCubeParameters);
        worldCube.block = block;
    }

    if (archetype.v3EditorPhysicsScale)
    {
        var v3EditorHalfExtents = md.v3Build(archetype.v3EditorPhysicsScale[0], archetype.v3EditorPhysicsScale[1], archetype.v3EditorPhysicsScale[2]);
        v3EditorHalfExtents = md.v3Mul(v3EditorHalfExtents, v3Scale, v3EditorHalfExtents);
        v3EditorHalfExtents = md.v3ScalarMul(v3EditorHalfExtents, 0.5, v3EditorHalfExtents);

        if (m33Rotation)
        {
            // compute extents after rotation.
            var h = v3EditorHalfExtents;
            var M = m33Rotation;
            var abs = Math.abs;
            md.v3Build(
                abs(M[0]) * h[0] + abs(M[3]) * h[1] + abs(M[6]) * h[2],
                abs(M[1]) * h[0] + abs(M[4]) * h[1] + abs(M[7]) * h[2],
                abs(M[2]) * h[0] + abs(M[5]) * h[1] + abs(M[8]) * h[2],
                v3EditorHalfExtents);
        }

        editorExtents = md.aabbBuildFromCentreHalfExtents(v3Location, v3EditorHalfExtents);
    }

    block.archetypeName = archetypeName;
    block.v3Location = md.v3Copy(v3Location);
    block.v3Scale = md.v3Copy(v3Scale);
    block.v3Rotation = md.v3Copy(v3Rotation);
    block.worldCube = (worldCube || null);
    block.meshNode = (meshNode || null);
    block.editorExtents = (editorExtents || null);
    block.globals = globals;

    if (meshNodeExtents)
    {
        block.extents = meshNodeExtents;
    }
    else if (worldCube)
    {
        block.extents = worldCube.getExtents();
    }
    else
    {
        meshNode.update();
        block.extents = meshNode.calculateHierarchyWorldExtents();
    }

    if (meshNode)
    {
        meshNode.setStatic();
    }

    return block;
};
