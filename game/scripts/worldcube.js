//
//  World Cube.
//
//  Has a location.
//      Collision check function (for a sphere and radius).
//      Collision resolve function (for an ecPhysicsSphere).

/*global ECPhysicsSphere: false*/
/*global EntityComponentBase: false*/

function WorldCube(v3Location, parameters)
{
    var globals = this.globals;
    var md      = globals.mathDevice;

    this.stationary = (parameters.stationary !== undefined ? parameters.stationary : true);

    this.physical = (parameters.physical !== undefined ? parameters.physical : true);
    this.opaque   = (parameters.opaque !== undefined ? parameters.opaque : true);

    if (this.physical)
    {
        this.physical = {
            cube : this
        };
    }
    if (this.opaque)
    {
        this.opaque = {
            cube : this
        };
    }

    this.bounce = parameters.bounce !== undefined ? parameters.bounce : 0.5;

    this.terrainType = parameters.terrainType;

    this.v3Scale = md.v3BuildOne();

    this.setv3Location(v3Location);

    if (parameters.v3Scale !== undefined)
    {
        this.setv3Scale(parameters.v3Scale);
    }

    this.randomSeed    = Math.random();
    this.buildTransformMatrix(this.randomSeed);

    this.buildZone = (parameters.isBuildZone ? true : false);

    this.scratchpad = {};
}

WorldCube.prototype =
{
    globals : undefined,
    fakeSphere : undefined,
    gameManager : undefined,

    stepHeight : 0.6,
    stepDetectAngle : Math.PI * 0.4,
    stepAngle : Math.PI * 0.45,

    debugExtentsColour : [0.0, 1.0, 1.0],

    drawDebug : function worldCubeDrawDebugFn()
    {
        var dd = this.globals.debugDraw;
        dd.drawDebugExtents(this.extents,
            this.debugExtentsColour[0], this.debugExtentsColour[1], this.debugExtentsColour[2]);
    },

    setECPhysSphereAdjustCallback : function worldCubeSetECPhysSphereAdjustCallbackFn(callback)
    {
        this.ecPhysSphereAdjustCallback =   callback;
    },

    teleport : function worldCubeTeleportFn(v3Destination)
    {
        var locationMatrix;
        var globals =   this.globals;
        var scene   =   globals.scene;
        var md      =   globals.mathDevice;

        if (this.rootNode)
        {
            locationMatrix  =   this.rootNode.getLocalTransform();

            scene.removeRootNode(this.rootNode);

            md.m43SetPos(locationMatrix, v3Destination);

            this.rootNode   =   globals.simpleSceneLoader.load(this.path, locationMatrix, true);
        }

        this.setv3Location(v3Destination);
    },

    collisionCheck : function worldCubeCollisionCheckFn(ecPhysicsSphere)
    {
        var md  =   this.globals.mathDevice;

        if (this.ignoringCollision)
        {
            return  false;
        }

        if (this.ignoreSpheresThatIgnoreSpheres && !ecPhysicsSphere.collidesWithSpheres)
        {
            return false;
        }

        return  md.aabbSphereOverlaps(this.extents, ecPhysicsSphere.getv3Location(), ecPhysicsSphere.getRadius());
    },

    stepifyFakeSphere : function worldCubeStepifyFakeSphereFn(spherev3Location, ecPhysicsSphere, ecFakePhysicsSphere)
    {
        var md  =   this.globals.mathDevice;

        if (!ecPhysicsSphere.getCanClimb())
        {
            return;
        }
        var scratchpad = this.scratchpad;

        var fake_sphere_v3_location =  ecFakePhysicsSphere.getv3Location();
        var v3offset    = scratchpad.v3offset =  md.v3Sub(fake_sphere_v3_location, spherev3Location, scratchpad.v3offset);
        var v3hoffset   = scratchpad.v3hoffset = md.v3Copy(v3offset, scratchpad.v3hoffset);
        md.v3SetY(0.0, v3hoffset);

        var verticalDistance    =   md.v3GetY(v3offset);
        var horizontalDistance  =   md.v3Length(v3hoffset);

        var angle   =   Math.atan2(verticalDistance, horizontalDistance);

        if (Math.abs(angle) > this.stepDetectAngle)
        {
            //Collision point is either above or below enough to be treated as such.
            return;
        }

        var maxY = this.extents[4];
        if (spherev3Location[1] - ecPhysicsSphere.getRadius() < maxY - this.stepHeight)
        {
            //Too low.
            return;
        }

        md.v3Normalize(v3hoffset, v3hoffset);

        var distance        =   md.v3Length(v3offset);

        verticalDistance    =   Math.sin(-this.stepAngle) * distance;
        horizontalDistance  =   Math.cos(this.stepAngle) * distance;

        md.v3ScalarMul(v3hoffset, horizontalDistance, v3offset);
        md.v3SetY(verticalDistance, v3offset);

        fake_sphere_v3_location    =   md.v3Add(spherev3Location, v3offset, fake_sphere_v3_location);

        ecFakePhysicsSphere.entity.setv3Location(fake_sphere_v3_location);

        ecFakePhysicsSphere.setFrictionType(ECPhysicsSphere.frictionType.GROUND);
        ecFakePhysicsSphere.setBounceType(ECPhysicsSphere.bounceType.GROUND);
    },

    collisionResolve : function worldCubeCollisionResolveFn(ecPhysicsSphere, d_t)
    {
        var md  =   this.globals.mathDevice;
        var spherev3Location;
        var fake_sphere_v3_location;
        var fake_phys_sphere;
        var ecFakePhysSphere;
        var scratchpad = this.scratchpad;

        if (this.ignoringCollision)
        {
            return;
        }

        spherev3Location           = ecPhysicsSphere.getv3Location();
        fake_sphere_v3_location    = scratchpad.fake_sphere_v3_location = md.aabbClampv3(this.extents, spherev3Location, scratchpad.fake_sphere_v3_location);

        var overlapAmount;
        if (md.v3DistanceSq(fake_sphere_v3_location, spherev3Location) === 0.0)
        {
            overlapAmount                      =   md.aabbSmallestPointOverlapDistance(this.extents, fake_sphere_v3_location);

            scratchpad.reducedExtents          =   md.aabbShrink(this.extents, overlapAmount + ecPhysicsSphere.getRadius() * 0.5, scratchpad.reducedExtents);

            scratchpad.fake_sphere_v3_location =   md.aabbClampv3(scratchpad.reducedExtents, spherev3Location, scratchpad.fake_sphere_v3_location);

            if (md.v3DistanceSq(fake_sphere_v3_location, spherev3Location) === 0.0)
            {
                fake_sphere_v3_location[1] -= ecPhysicsSphere.getRadius() * 0.5;
            }
        }

        fake_phys_sphere	=	this.getFakePhysSphere();
        ecFakePhysSphere	=	fake_phys_sphere.getEC('ECPhysicsSphere');

        ecFakePhysSphere.onImpactCallbackFn = this.onImpactCallbackFn;
        ecFakePhysSphere.impactEntity = this.entity;

        fake_phys_sphere.setv3Location(fake_sphere_v3_location);

        //If below top edge, use wall.
        if (spherev3Location[1] < this.extents[4])
        {
            ecFakePhysSphere.setFrictionType(ECPhysicsSphere.frictionType.WALL);
            ecFakePhysSphere.setBounceType(ECPhysicsSphere.bounceType.WALL);
        }
        else
        {
            ecFakePhysSphere.setFrictionType(ECPhysicsSphere.frictionType.GROUND);
            ecFakePhysSphere.setBounceType(ECPhysicsSphere.bounceType.GROUND);
        }

        ecFakePhysSphere.clearVelocity();
        ecFakePhysSphere.clearFrictionOverride();
        ecFakePhysSphere.clearBounceOverride();

        if (this.ecPhysSphereAdjustCallback)
        {
            this.ecPhysSphereAdjustCallback(ecFakePhysSphere);
        }

        this.stepifyFakeSphere(spherev3Location, ecPhysicsSphere, ecFakePhysSphere);

        ecPhysicsSphere.resolveCollision(ecFakePhysSphere, d_t);

        // var dd = this.globals.debugDraw;
        // dd.drawDebugPoint(fake_sphere_v3_location, 1,0,0,2);
        // dd.drawDebugPoint(spherev3Location, 0,1,0,2);
    },

    setOnImpactCallback : function worldCubeSetOnImpactCallbackFn(onImpactCallbackFn)
    {
        this.onImpactCallbackFn = onImpactCallbackFn;
    },

    makeFakePhysSphere : function worldCubeMakeFakePhysSphereFn()
    {
        var gameManager =   this.gameManager;
        var entityFactory = gameManager.getEntityFactory();
        var globals     =   this.globals;
        var md          =   globals.mathDevice;

        var fake_phys_sphere = entityFactory.createCustomEntityInstance(
            'FakePhysSphere', 'FakePhysSphere', md.v3BuildZero());

        var ecFakePhysSphere = EntityComponentBase.createFromName('ECPhysicsSphere', globals,
                                                         {radius : 0.0,
                                                         fixed : true,
                                                         frictionType : ECPhysicsSphere.frictionType.GROUND});

        fake_phys_sphere.addECToCustomEntity(ecFakePhysSphere);
        fake_phys_sphere.activate();
        fake_phys_sphere.setGameSpace(undefined);

        return  fake_phys_sphere;
    },

    getFakePhysSphere : function worldCubeGetFakePhysSphereFn()
    {
        var fake_phys_sphere    =   ECPhysicsSphere.prototype.fakeSphere;
        if (fake_phys_sphere === undefined)
        {
            fake_phys_sphere                        =   this.makeFakePhysSphere();
            ECPhysicsSphere.prototype.fakeSphere    =   fake_phys_sphere;
        }
        return	fake_phys_sphere;
    },

    updateExtents : function worldCubeUpdateExtents(v3Location, v3Scale)
    {
        var md          =   this.globals.mathDevice;
        this.v3Location =   md.v3Copy(v3Location, this.v3Location);
        this.v3Scale    =   md.v3Copy(v3Scale, this.v3Scale);

        this.extents    =   md.aabbBuildFromCentreHalfExtents(v3Location,
                                                              md.v3ScalarMul(v3Scale, 0.5),
                                                              this.extents);

        //I will not let cubes move unless they are owned by ECPhysics Cube.
        //This code is now redundant.
        //if (!this.stationary)
        //{
        //    this.gameManager.movedCube(this);
        //}
    },

    getNearestPointToPoint : function worldCubeGetNearestPointToPoint(v3Location, v3Destination)
    {
        var md  =   this.globals.mathDevice;

        return md.aabbClampv3(this.extents, v3Location, v3Destination);
    },

    setv3Location : function worldCubeSetV3Location(desiredv3Location)
    {
        var md  =   this.globals.mathDevice;

        if (this.v3Location === undefined || md.v3DistanceSq(this.v3Location, desiredv3Location) > 0.001)
        {
            this.updateExtents(desiredv3Location, this.v3Scale);
        }
    },

    getv3Location : function worldCubeGetv3Location()
    {
        return  this.v3Location;
    },

    getExtents : function worldcubeGetExtentsFn()
    {
        return this.extents;
    },

    setv3Scale : function worldCubeSetv3Scale(desiredv3Scale)
    {
        var md  =   this.globals.mathDevice;

        if (this.v3Scale === undefined || md.v3DistanceSq(this.v3Scale, desiredv3Scale) > 0.001)
        {
            this.updateExtents(this.v3Location, desiredv3Scale);
        }
    },

    getv3Scale : function worldCubeGetv3ScaleFn()
    {
        return this.v3Scale;
    },

    getPath : function worldcubeGetPathFn()
    {
        return this.path;
    },

    isBlock : function worldcubeIsBlockFn()
    {
        return (this.block ? true : false);
    },

    getTerrainType : function worldCubeGetTerrainTypeFn()
    {
        return this.terrainType;
    },

    buildTransformMatrix : function buildTransformMatrixFn(randomSeed, m43FullTransform)
    {
        var md = this.globals.mathDevice;
        var v3Scale = this.v3Scale;
        var v3Location = this.v3Location;

        var m43Location = md.m43BuildScaleTranslate(v3Scale, v3Location);

        if (m43FullTransform)
        {
            md.m43Mul(m43Location, m43FullTransform, m43Location);

            //Quick inside out check.
            //If forward cross up dot right <0.0 then it's flipped.
            if (md.v3Dot(md.v3Cross(md.m43At(m43Location), md.m43Up(m43Location)), md.m43Right(m43Location)) > 0.0)
            {
                //Scale it by -1(right)
                //Then rotate 180 clockwize.
                md.m43SetAt(m43Location, md.v3ScalarMul(md.m43At(m43Location), -1.0));

                md.m43Mul(m43Location, md.m43BuildRotationY(Math.PI), m43Location);
            }
        }

        md.m43SetPos(m43Location, v3Location);

        return  m43Location;
    },

    destroy : function worldCubeDestroyFn()
    {
        this.v3Scale    =   null;
        this.extents    =   null;
    }
};

WorldCube.create = function worldCubeCreateFn(v3Location, globals, gameManager, parameters)
{
    //Lazily assign the static globals
    if (WorldCube.prototype.globals === undefined)
    {
        WorldCube.prototype.globals = globals;
    }
    if (WorldCube.prototype.gameManager === undefined)
    {
        WorldCube.prototype.gameManager = gameManager;
    }

    var worldCube = new WorldCube(v3Location, parameters);
    return  worldCube;
};
