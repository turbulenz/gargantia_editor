/*global debug: false*/
/*global EntityComponentBase: false*/
/*global WorldCube: false*/
/*global EntityComponentSortOrder: false*/

//
//  EntityComponentPhysicsCube!
//  Has a link to it's own physics cube.
//

var ECPhysicsCube = EntityComponentBase.extend(
{
    entityComponentName : 'ECPhysicsCube',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.NORMAL,
    shouldUpdate : false,
    shouldDraw : false,

    //Persistence info.
    shouldSave : false,

    realTime : true,    //To honour this make sure you reference parameters through this.archetype

    //NOTE: Always make sure that these parameters are duplicated in ECSuperPhysicsCube
    parameters :
    {
        stationary : false,
        physics : true,
        opaque : true,
        offsetY : 0.0,
        v3Scale :
        {
            description     :   'The Scale of the Physics Cube',
            defaultValue    :   [1.0, 1.0, 1.0],
            minValue        :   0.0,
            maxValue        :   10.0,
            step            :   0.1
        },
        scaleMesh : true,
        ignoreSpheresThatIgnoreSpheres : false
    },

    init : function eCPhysicsCubeInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        this.setOffsetY(parameters.offsetY);
        this.setV3Scale(parameters.v3Scale);

        this.scratchpad = {};
    },

    activate : function ecphysicscubeActivateFn()
    {
        this._super();

        var globals         = this.globals;
        var entity          = this.entity;
        var gameManager     = entity.gameManager;
        var mesh            = entity.getEC('ECMesh');
        var md              = globals.mathDevice;

        //Create the collision cube, and add it to the game.

        var archetype   = this.archetype;
        var v3Scale     = this.v3Scale;
        var offsetY     = this.offsetY;

        var v3Location = md.v3Add(this.entity.getv3Location(), md.v3Build(0.0, offsetY, 0.0));

        var parameters =
        {
            stationary : archetype.stationary,
            terrainType : archetype.terrainType,
            v3Scale    : md.v3Copy(v3Scale),
            physical : archetype.physics,
            opaque : archetype.opaque
        };

        var m43Rotation = md.m43BuildRotationXZY(this.entity.getV3Rotation());

        md.m43TransformVector(m43Rotation, parameters.v3Scale, parameters.v3Scale);

        this.worldCube                                = WorldCube.create(v3Location, globals, gameManager, parameters);
        this.worldCube.entity                         = this.entity;
        this.worldCube.ignoreSpheresThatIgnoreSpheres = this.archetype.ignoreSpheresThatIgnoreSpheres;

        this.randomSeed =   Math.random();

        if (mesh && this.shouldScaleMesh())
        {
            mesh.setm33TransformMatrix(this.worldCube.buildTransformMatrix(this.randomSeed,
                                                                           this.entity.getGameSpace().getM43FullTransform()));
        }

        if (!archetype.stationary)
        {
            this.setInterestedInMovement(true);
        }

        //Yuck.
        if (this.ignoringCollision)
        {
            this.ignoringCollision  =   false;
            this.setIgnoringCollision(true);
        }
        else
        {
            this.ignoringCollision = false;
        }
    },

    update : function eCPhysicsCubeUpdateFn()
    {
        this._super();
    },

    setV3Scale : function ecphysicscubeSetV3ScaleFn(v3Scale)
    {
        var md = this.globals.mathDevice;

        if (this.entity && this.entity.active)
        {
            if (!md.v3Equal(this.v3Scale, v3Scale))
            {
                this.v3Scale = md.v3Copy(v3Scale, this.v3Scale);
                this.worldCube.updateExtents(this.getv3LocationWithOffset(), this.v3Scale);
                this.refreshCube();
            }
        }
        else
        {
            this.v3Scale = md.v3Copy(v3Scale);
        }
    },

    onMoved : function eCPhysicsCubeOnMovedFn()
    {
        this.worldCube.setv3Location(this.getv3LocationWithOffset());
        this.refreshCube();
    },

    refreshCube : function ecphysicscubeRefreshCubeFn()
    {
        if (this.currentGameSpace !== undefined)
        {
            this.currentGameSpace.movedCube(this.worldCube);
        }
    },

    getv3LocationWithOffset : function ecphysicscubeGetv3LocationWithOffsetFn()
    {
        var md;
        var v3Location;
        if (this.additionOffsetY !== undefined || this.offsetY !== 0.0)
        {
            md  =   this.globals.mathDevice;

            v3Location     = md.v3Copy(this.getv3Location());
            if (this.additionOffsetY)
            {
                v3Location[1] += this.additionOffsetY;
            }
            if (this.offsetY)
            {
                v3Location[1] += this.offsetY;
            }

            return  v3Location;
        }
        return  this.getv3Location();
    },

    setAdditionalOffsetY : function ecphysicscubeSetAdditionalOffsetYFn(yOffset)
    {
        if (yOffset !== this.additionOffsetY)
        {
            this.additionOffsetY    =   yOffset;
            this.onMoved();
        }
    },

    setOffsetY : function ecphysicscubeSetOffsetYFn(offsetY)
    {
        debug.assert((!this.entity || !this.entity.active), 'Cannot set ecPhysicsCube offsetY after activation.');

        this.offsetY = offsetY;
    },

    shouldScaleMesh : function eCPhysicsCubeShouldScaleMeshFn()
    {
        return this.archetype.scaleMesh;
    },

    setTerrainType : function ecphysicscubeSetTerrainTypeFn(terrainType)
    {
        var worldCube = this.worldCube;
        if (worldCube.terrainType !== terrainType)
        {
            if (this.currentGameSpace !== undefined)
            {
                if (worldCube.terrainType)
                {
                    this.currentGameSpace.removeCubeFromNavGrids(worldCube);
                }

                worldCube.terrainType = terrainType;

                if (worldCube.terrainType)
                {
                    this.currentGameSpace.addCubeToNavGrids(worldCube);
                }
            }
        }
    },

    setIgnoringCollision : function eCPhysicsCubeSetIgnoringCollisionFn(ignoringCollision)
    {
        var worldCube = this.worldCube;

        if (ignoringCollision !== this.ignoringCollision)
        {
            this.ignoringCollision  =   ignoringCollision;
            if (worldCube)
            {
                worldCube.ignoringCollision = ignoringCollision;
            }

            if (this.currentGameSpace !== undefined)
            {
                if (ignoringCollision && worldCube.terrainType)
                {
                    this.currentGameSpace.removeCubeFromNavGrids(worldCube);
                }
                else
                {
                    this.currentGameSpace.addCubeToNavGrids(worldCube);
                }
            }
        }
    },

    setOnImpactCallback : function eCPhysicsCubeSetOnImpactCallbackFn(onImpactCallback)
    {
        this.worldCube.setOnImpactCallback(onImpactCallback);
    },

    draw : function eCPhysicsCubeDrawFn()
    {
        //Nothing!
    },

    drawDebug : function eCPhysicsCubeDrawDebugFn()
    {
        var dd = this.globals.debugDraw;
        dd.drawDebugHalfCube(this.entity.v3Location, 1.0, 0.5, 0.5, 0.5);
    },

    getv3Scale : function ecPhysicsCubeGetv3ScaleFn()
    {
        return this.v3Scale;
    },

    getRadius : function ecPhysicsCubeGetRadiusFn()
    {
        var md;
        if (this.radius === undefined)
        {
            md  =   this.globals.mathDevice;
            this.radius = md.v3Length(this.getv3Scale()) * 0.5;
        }

        return this.radius;
    },

    getMinRadius : function ecPhysicsCubeGetMinRadiusFn()
    {
        var v3Scale, minRadius;
        if (this.minRadius === undefined)
        {
            v3Scale        = this.getv3Scale();
            minRadius      = v3Scale[0];
            minRadius      = Math.min(minRadius, v3Scale[1]);
            minRadius      = Math.min(minRadius, v3Scale[2]);
            this.minRadius = minRadius * 0.5;
        }

        return this.minRadius;
    },

    getExtents : function ecPhysicsCubeGetExtentsFn()
    {
        return this.worldCube.extents;
    },

    getv3BottomLocation : function ecPhysicsCubeGetv3BottomLocationFn()
    {
        var worldCube = this.worldCube;
        var mathDevice = this.globals.mathDevice;

        var scratchpad = this.scratchpad;

        scratchpad.v3BottomLocation = mathDevice.v3Copy(worldCube.getv3Location(), scratchpad.v3BottomLocation);
        scratchpad.v3BottomLocation[1] = worldCube.extents[1];

        return scratchpad.v3BottomLocation;
    },

    serialize : function ecphysicscubeserializeFn()
    {
        return {
            offsetY : this.offsetY,
            v3Scale : this.getv3Scale(),
            shouldserialize : this.getShouldserialize()
        };
    },

    deserialize : function eCPhysicsDeserializeFn(ecData)
    {
        if (ecData.shouldserialize)
        {
            this.setShouldserialize(true);
        }

        this._super(ecData);
    },

    setGameSpace : function eCPhysicsSetGameSpaceFn(newSpace)
    {
        if (newSpace === this.currentGameSpace)
        {
            return;
        }

        if (this.currentGameSpace !== undefined)
        {
            this.currentGameSpace.removeCube(this.worldCube);
        }
        this.currentGameSpace   =   newSpace;
        if (this.currentGameSpace !== undefined)
        {
            this.currentGameSpace.addCube(this.worldCube);
        }
    },

    destroy : function eCPhysicsCubeDestroyFn()
    {
        this._super();

        this.worldCube.destroy();

        this.setGameSpace(undefined);
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECPhysicsCube.prototype.entityComponentName] = ECPhysicsCube;

ECPhysicsCube.create = function eCPhysicsCubeCreateFn(globals, parameters)
{
    return new ECPhysicsCube(globals, parameters);
};
