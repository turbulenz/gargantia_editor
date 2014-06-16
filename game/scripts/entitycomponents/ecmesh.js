/*global EntityComponentBase: false*/
/*global debug: false*/
/*global EntityComponentSortOrder: false*/
/*global VMath: false*/

//
//  ECMesh!
//
var ECMesh = EntityComponentBase.extend(
{
    entityComponentName : 'ECMesh',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.DRAW,
    shouldUpdate : true,
    shouldDraw : false,

    //Networking info.
    shouldSerialize        : true,
    shouldDeltaSerialize   : true,

    //Persistence info.
    shouldSave : true,
    shouldLevelSave : true,

    realTime : true,    //To honour this make sure you reference parameters through this.archetype

    parameters :
    {
        path : 'models/prototype_cube04.dae',
        pathBackup : "models/axes.dae",

        rotationX :
        {
            description     :   'Rotation (radians) around x-axis',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   -Math.PI,
            maxValue        :   Math.PI
        },
        rotationY :
        {
            description     :   'Rotation (radians) around y-axis',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   -Math.PI,
            maxValue        :   Math.PI
        },
        rotationZ :
        {
            description     :   'Rotation (radians) around z-axis',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   -Math.PI,
            maxValue        :   Math.PI
        },
        randomRotationY :
        {
            description     :   'Random Rotation (radians) around y-axis',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   0.0,
            maxValue        :   Math.PI
        },
        scale :
        {
            description     :   'Overall scale factor',
            type            :   'slider',
            defaultValue    :   1.0,
            minValue        :   0.0,
            maxValue        :   5.0
        },
        scaleX :
        {
            description     :   'X-axis scale factor',
            type            :   'slider',
            defaultValue    :   1.0,
            minValue        :   0.0,
            maxValue        :   5.0
        },
        scaleY :
        {
            description     :   'Y-axis scale factor',
            type            :   'slider',
            defaultValue    :   1.0,
            minValue        :   0.0,
            maxValue        :   5.0
        },
        scaleZ :
        {
            description     :   'Z-axis scale factor',
            type            :   'slider',
            defaultValue    :   1.0,
            minValue        :   0.0,
            maxValue        :   5.0
        },
        randomScale :
        {
            description     :   'Scale Variation',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   0.0,
            maxValue        :   0.9
        },
        localOffset : [0.0, 0.0, 0.0],
        offsetY :
        {
            description     :   'Y-local offset',
            type            :   'slider',
            defaultValue    :   0.0,
            minValue        :   -2.0,
            maxValue        :   2.0
        },

        debugOnly : false
    },

    scale : 1.0,

    timeOutCounter : 3,
    timeOutCounterStart : 3,

    init : function eCMeshInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        var md = this.globals.mathDevice;

        this.localOffset    = md.v3BuildZero();
        this.dirtyOffset    = true;

        this.v3Rotation          = md.v3BuildZero();
        this.dirtySelfRotation   = true; // set to true if v3Rotation is changed.
        this.dirtyEntityRotation = true; // set to true if entity.v3Rotation is changed.

        this.scale           = 1.0;
        this.v3Scale         = md.v3BuildOne();
        this.randomScale     = md.randomInRange(1.0 - parameters.randomScale, 1.0 + parameters.randomScale);
        this.dirtyScale      = true;

        this.m43Transform    = md.m43BuildIdentity();

        var rotationX = parameters.rotationX;
        var rotationY = parameters.rotationY + md.randomInRange(-parameters.randomRotationY, parameters.randomRotationY);
        var rotationZ = parameters.rotationZ;
        var shouldRotate = rotationX !== 0 ||
                           rotationY !== 0 ||
                           rotationZ !== 0;
        if (shouldRotate)
        {
            this.m33ArchetypeRotation = md.m33BuildRotationXZY(md.v3Build(rotationX, rotationY, rotationZ));
        }

        this.timeOutCounter  = 0;

        this.node = null;
        this.disabledNode = false;

        this.scratchPad      = {};
    },

    activate : function ecmeshActivateFn()
    {
        this._super();
        this.updateMatrix();
        this.loadMesh(this.getPath());
    },

    setPath : function ecmeshSetPathFn(path)
    {
        debug.assert((!this.entity || !this.entity.active), 'Cannot set ecmesh path after entity activation.');

        this.path = path;
    },

    getPath : function eCMeshGetPathFn()
    {
        return (this.path || this.archetype.path);
    },

    updateMatrixOld : function ecMeshUpdateMatrixOld()
    {
        var md = this.globals.mathDevice;
        this.buildDirection(this.m43Transform);
        this.m43Unscaled    =   md.m43Copy(this.m43Transform, this.m43Unscaled);
        this.buildScale(this.m43Transform);
        this.buildRotation(this.m43Unscaled, this.m43Transform);
        this.buildLocation(this.m43Unscaled, this.m43Transform);
    },

    updateMatrix : function ecMeshUpdateMatrix()
    {
        this.buildLocalOffsetScaleRotationLocation(this.m43Transform);
    },

    setDisabled : function ecmeshSetDisabledFn(disabled)
    {
        if (this.disabledNode !== disabled)
        {
            this.disabledNode = disabled;
            this.node.enableHierarchy(!this.disabledNode);
        }
    },

    buildLocalOffsetScaleRotationLocation : function ecmeshBuildLocalOffsetScaleRotationLocationbFn(m43Dest)
    {
        var md        = this.globals.mathDevice;
        var archetype = this.archetype;

        //Calculate scale vector.
        var scale;

        if (this.dirtyScale)
        {
            scale = this.scale * archetype.scale * this.randomScale;
            this.v3TotalScale    =   md.v3Build(scale * this.v3Scale[0] * archetype.scaleX,
                                                scale * this.v3Scale[1] * archetype.scaleY,
                                                scale * this.v3Scale[2] * archetype.scaleZ, this.v3TotalScale);

            var v3EntityScale = this.entity.getV3Scale();
            md.v3Mul(v3EntityScale, this.v3TotalScale, this.v3TotalScale);

            this.dirtyScale =   false;

            this.setDisabled(md.v3LengthSq(this.v3TotalScale) <= 0);
        }

        // Validate rotation matrix.
        var dirtyRotation = false;
        if (this.dirtySelfRotation)
        {
            // our v3Rotation changed, recompute our m33SelfRotation matrix.
            this.shouldSelfRotate = !md.v3IsZero(this.v3Rotation);
            if (this.shouldSelfRotate)
            {
                this.m33SelfRotation = md.m33BuildRotationXZY(this.v3Rotation, this.m33SelfRotation);
                if (this.m33ArchetypeRotation)
                {
                    // If we have an archetype rotation, pre-multiply it.
                    md.m33Mul(this.m33ArchetypeRotation, this.m33SelfRotation, this.m33SelfRotation);
                }
            }
            else if (this.m33ArchetypeRotation)
            {
                // Our v3Rotation is zero, but we have archetype rotation, so copy it over and set we should self rotate.
                this.m33SelfRotation = md.m33Copy(this.m33ArchetypeRotation, this.m33SelfRotation);
                this.shouldSelfRotate = true;
            }
            this.dirtySelfRotation = false;
            dirtyRotation = true;
        }
        if (this.dirtyEntityRotation)
        {
            // entity v3Rotation has changed, recompute our m33TotalRotation amtrix.
            var v3EntityRotation = this.entity.getV3Rotation();
            this.shouldEntityRotate = !md.v3IsZero(v3EntityRotation);
            if (this.shouldEntityRotate)
            {
                this.m33EntityRotation = md.m33BuildRotationXZY(v3EntityRotation, this.m33EntityRotation);
            }
            this.dirtyEntityRotation = false;
            dirtyRotation = true;
        }
        if (dirtyRotation)
        {
            if (this.shouldSelfRotate && this.shouldEntityRotate)
            {
                this.m33Rotation = this.m33TotalRotation = md.m33Mul(this.m33SelfRotation, this.m33EntityRotation, this.m33TotalRotation);
            }
            else if (this.shouldSelfRotate)
            {
                this.m33Rotation = this.m33SelfRotation;
            }
            else if (this.shouldEntityRotate)
            {
                this.m33Rotation = this.m33EntityRotation;
            }
            else
            {
                this.m33Rotation = null;
            }
        }

        if (this.dirtyOffset)
        {
            this.totalOffset = md.v3Add(this.localOffset, archetype.localOffset, this.totalOffset);
            this.totalOffset[1] += archetype.offsetY;
            this.dirtyOffset = false;
        }

        md.m43BuildScaleTranslate(this.v3TotalScale, this.totalOffset, m43Dest);

        //Rotate.
        if (this.m33Rotation)
        {
            md.m43MulM33(m43Dest, this.m33Rotation, m43Dest);
        }

        //Set location or
        //Set to be based on parent if needed.
        if (this.m43BaseTransformMatrix)
        {
            md.m43Mul(m43Dest,     this.m43BaseTransformMatrix,  m43Dest);

            if (this.baseTransformNoLocation)
            {
                md.m43Translate(m43Dest, this.getv3Location());
            }
        }
        else
        {
            md.m43Translate(m43Dest, this.getv3Location());
        }
    },

    removeNode : function eCMeshRemoveNodeFn()
    {
        if (!this.node)
        {
            return;
        }

        var scene   =   this.globals.scene;
        scene.removeRootNode(this.node);
        this.node   =   null;
        this.disabledNode = false;
    },

    loadMesh : function eCMeshLoadMeshFn(path)
    {
        this.removeNode();

        this.node = this.globals.simpleSceneLoader.load(path, this.m43Transform, this.archetype.stationary, undefined, undefined, this.archetype.loadOptions);
        this.disabledNode = this.node.disabled;
        this.setDirtyMatrix(true);
        this.node.foreground = this.archetype.foreground;
    },

    teleport : function eCMeshTeleportFn()
    {
        this.update();
    },

    onRotated : function ecmeshOnRotatedFn()
    {
        this.dirtyEntityRotation = true;
        this.setDirtyMatrix(true);
    },

    onMoved : function eCMeshOnMovedFn()
    {
        this.setDirtyMatrix(true);
    },

    onScaled : function ecmeshOnScaledFn()
    {
        this.dirtyScale = true;
        this.setDirtyMatrix(true);
    },

    update : function eCMeshUpdateFn()
    {
        this._super();

        var entity = this.entity;

        if (entity.movedThisFrame ||
            entity.rotatedThisFrame ||
            entity.scaledThisFrame)
        {
            this.dirtyEntityRotation = (entity.rotatedThisFrame || this.dirtyEntityRotation);
            this.dirtyScale = (entity.scaledThisFrame || this.dirtyScale);
            this.setDirtyMatrix(true);
        }

        if (this.dirtyMatrix)
        {
            //Remove me from movement interest.
            this.timeOutCounter = this.timeOutCounterStart;

            this.updateMatrix();
            this.node.setLocalTransform(this.m43Transform);

            this.dirtyMatrix    = false;
            this.dirtySerialize = true;
        }
        //IDLE OPTIMIZE
        else
        {
            this.timeOutCounter -=  1;
            if (this.timeOutCounter <=  0)
            {
                this.setInterestedInMovement(true);
                this.setInterestedInRotation(true);
                this.setInterestedInScaling(true);
                this.setToUpdate(false);
            }
        }
    },

    _isVisibleNode : function eCMeshIsVisibleNode(node, frameIndex)
    {
        if (node.frameVisible === frameIndex)
        {
            return true;
        }

        var children = node.children;
        if (children)
        {
            var numChildren = children.length;
            var n;
            for (n = 0; n < numChildren; n += 1)
            {
                if (this._isVisibleNode(children[n], frameIndex))
                {
                    return true;
                }
            }
        }

        return false;
    },

    isVisible : function eCMeshIsVisible()
    {
        return (this.node ?
                this._isVisibleNode(this.node, (this.globals.scene.frameIndex - 1)) :
                false);
    },

    setDirtyMatrix : function eCMeshSetDirtyMatrixFn(dirty)
    {
        if (this.dirtyMatrix !== dirty)
        {
            this.dirtyMatrix = dirty;

            // IDLE OPTIMIZE
            if (dirty)
            {
                this.setInterestedInMovement(false);
                this.setInterestedInRotation(false);
                this.setInterestedInScaling(false);
                this.setToUpdate(true);
            }
        }
    },

    setm33TransformMatrix : function eCMeshSetm33TransformMatrix(m33TransformMatrix)
    {
        var md                  =   this.globals.mathDevice;
        if (!this.m33TransformMatrix || !md.m33Equal(m33TransformMatrix, this.m33TransformMatrix))
        {
            this.m33TransformMatrix    =   md.m33Copy(m33TransformMatrix, this.m33TransformMatrix);
            this.setDirtyMatrix(true);
        }
    },

    getm43BaseTransformMatrix : function ecmeshGetm43BaseTransformMatrixFn()
    {
        return  this.m43BaseTransformMatrix;
    },

    clearm43BaseTransformMatrix : function eCMeshClearm43BaseTransformMatrixFn()
    {
        if (this.m43BaseTransformMatrix)
        {
            this.m43BaseTransformMatrix =   undefined;
        }
    },

    clearm43BaseTransformMatrixOffset : function eCMeshClearm43BaseTransformMatrixOffsetFn()
    {
        var md                  =   this.globals.mathDevice;
        if (this.m43BaseTransformMatrix)
        {
            md.m43SetPos(this.m43BaseTransformMatrix, md.v3BuildZero());
            this.baseTransformNoLocation    =   true;
            this.setDirtyMatrix(true);
        }
    },

    setm43BaseTransformMatrix : function eCMeshSetm43BaseTransformMatrixFn(m43BaseTransformMatrix)
    {
        var md                  =   this.globals.mathDevice;
        if (!this.m43BaseTransformMatrix || !md.m43Equal(m43BaseTransformMatrix, this.m43BaseTransformMatrix))
        {
            this.m43BaseTransformMatrix    =   md.m43Copy(m43BaseTransformMatrix, this.m43BaseTransformMatrix);
            this.baseTransformNoLocation    =   false;
            this.setDirtyMatrix(true);
        }
    },

    setUp : function eCMeshSetUpFn(up)
    {
        var md = this.globals.mathDevice;

        this.setRotationY(md.v3ToAngle(up));
        this.setRotationX(-Math.atan2(md.v3Length2D(up), up[1]));
    },

    setv3Rotation : function ecmeshSetv3RotationFn(v3Rotation)
    {
        var md = this.globals.mathDevice;

        if (!md.v3Equal(v3Rotation, this.v3Rotation))
        {
            md.v3Copy(v3Rotation, this.v3Rotation);
            this.dirtySelfRotation = true;
            this.setDirtyMatrix(true);
        }
    },

    addRotationX : function eCMeshAddRotationYFn(deltaRotation)
    {
        var newAngle = VMath.boundAngle(this.v3Rotation[0] + deltaRotation);
        this.setRotationX(newAngle);
    },

    setRotationX : function eCMeshSetRotationXFn(rotation)
    {
        if (!VMath.equal(rotation, this.v3Rotation[0]))
        {
            this.v3Rotation[0] = rotation;
            this.dirtySelfRotation = true;
            this.setDirtyMatrix(true);
        }
    },

    addRotationY : function eCMeshAddRotationYFn(deltaRotation)
    {
        var newAngle = VMath.boundAngle(this.v3Rotation[1] + deltaRotation);
        this.setRotationY(newAngle);
    },

    setRotationY : function eCMeshSetRotationYFn(rotation)
    {
        if (!VMath.equal(rotation, this.v3Rotation[1]))
        {
            this.v3Rotation[1] = rotation;
            this.dirtySelfRotation = true;
            this.setDirtyMatrix(true);
        }
    },

    getRotationY : function eCMeshGetRotationYFn()
    {
        return  this.v3Rotation[1];
    },

    getBaseRotationX : function eCMeshGetBaseRotationX()
    {
        return  this.archetype.rotationX;
    },

    getBaseRotationY : function eCMeshGetBaseRotationY()
    {
        return  this.archetype.rotationY;
    },

    getBaseRotationZ : function eCMeshGetBaseRotationZ()
    {
        return  this.archetype.rotationZ;
    },

    addRotationZ : function eCMeshAddRotationZFn(deltaRotation)
    {
        var newAngle = VMath.boundAngle(this.v3Rotation[2] + deltaRotation);
        this.setRotationZ(newAngle);
    },

    setRotationZ : function eCMeshSetRotationZFn(rotation)
    {
        if (!VMath.equal(rotation, this.v3Rotation[2]))
        {
            this.v3Rotation[2] = rotation;
            this.dirtySelfRotation = true;
            this.setDirtyMatrix(true);
        }
    },

    setScale : function eCMeshSetScaleFn(scale)
    {
        if (!VMath.equal(scale, this.scale))
        {
            this.scale = scale;
            this.dirtyScale =   true;
            this.setDirtyMatrix(true);
        }
    },

    getScale : function eCMeshGetScaleFn()
    {
        return this.scale;
    },

    getV3Scale : function ecmeshGetV3ScaleFn()
    {
        return this.v3Scale;
    },

    getScaleY : function eCMeshGetScaleYFn()
    {
        return this.v3Scale[1];
    },

    getv3ManipulatedScale : function ecmeshGetv3ManipulatedScaleFn()
    {
        var md = this.globals.mathDevice;
        return md.v3ScalarMul(this.v3Scale, this.scale);
    },

    getV3TotalScale : function ecmeshGetV3ScaleFn()
    {
        return this.v3TotalScale;
    },

    getv3BaseScale : function ecmeshGetv3BaseScaleFn()
    {
        var md = this.globals.mathDevice;
        return md.v3Build(this.archetype.scaleX, this.archetype.scaleY, this.archetype.scaleZ);
    },

    getV3ScaleToManipulate : function ecmeshGetV3ScaleToManipulateFn()
    {
        var mathDevice = this.globals.mathDevice;
        return mathDevice.v3ScalarMul(this.v3Scale, this.scale);
    },

    getSummedScale : function eCMeshGetSummedScaleFn()
    {
        return this.scale * this.archetype.scale;
    },

    getBaseScale : function ecmeshGetBaseScaleFn()
    {
        return  this.archetype.scale;
    },

    setV3Scale : function ecmeshSetV3ScaleFn(v3Scale)
    {
        if (!VMath.v3Equal(v3Scale, this.v3Scale))
        {
            this.v3Scale = this.globals.mathDevice.v3Copy(v3Scale);
            this.dirtyScale =   true;
            this.setDirtyMatrix(true);
        }
    },

    setScaleX : function eCMeshSetScaleXFn(scaleX)
    {
        if (!VMath.equal(scaleX, this.v3Scale[0]))
        {
            this.v3Scale[0] = scaleX;
            this.dirtyScale =   true;
            this.setDirtyMatrix(true);
        }
    },

    setScaleY : function eCMeshSetScaleYFn(scaleY)
    {
        if (!VMath.equal(scaleY, this.v3Scale[1]))
        {
            this.v3Scale[1] = scaleY;
            this.dirtyScale =   true;
            this.setDirtyMatrix(true);
        }
    },

    setScaleZ : function eCMeshSetScaleZFn(scaleZ)
    {
        if (!VMath.equal(scaleZ, this.v3Scale[2]))
        {
            this.v3Scale[2] = scaleZ;
            this.dirtyScale =   true;
            this.setDirtyMatrix(true);
        }
    },

    setLocalOffset : function eCMeshSetLocalOffsetFn(localOffset)
    {
        debug.isVec3(localOffset);
        var md      = this.globals.mathDevice;

        if (!this.localOffset || !md.v3Equal(localOffset, this.localOffset, 0)) // Need equality to avoid drifting
        {
            this.localOffset =   md.v3Copy(localOffset, this.localOffset);
            this.dirtyOffset = true;
            this.setDirtyMatrix(true);
        }
    },

    getBaseLocalOffset : function ecmeshGetBaseLocalOffsetFn()
    {
        return this.archetype.localOffset;
    },

    getLocalOffset : function eCMeshGetLocalOffsetFn()
    {
        return this.localOffset;
    },

    buildDirection : function eCMeshBuildDirectionFn(m43Dest)
    {
        var md = this.globals.mathDevice;

        if (this.m33TransformMatrix)
        {
            md.m43FromM33V3(this.m33TransformMatrix, md.v3BuildZero(), m43Dest);
            return;
        }

        if (!this.up && !this.at && !this.right)
        {
            md.m43BuildIdentity(m43Dest);
            return;
        }

        var up = this.up || md.v3BuildYAxis();
        var at = this.at || md.v3BuildZAxis();
        var right = this.right || md.v3BuildXAxis();

        if (this.up && !this.right)
        {
            if (md.v3DistanceSq(up, at) < 0.01)
            {
                md.v3BuildXAxis(at);
            }
            md.v3Cross(up, at, right);
            md.v3Normalize(right, right);
            md.v3Cross(right, up, at);
        }

        md.m43SetRight(m43Dest, right);
        md.m43SetUp(m43Dest, up);
        md.m43SetAt(m43Dest, at);

        md.m43Orthonormalize(m43Dest, m43Dest);
    },

    buildRotation : function eCMeshBuildRotationFn(m43Dest, m43DestB)
    {
        var md          = this.globals.mathDevice;
        var archetype   = this.archetype;

        var rotationX   =   this.v3Rotation[0] + archetype.rotationX;
        var rotationY   =   this.v3Rotation[1] + archetype.rotationY + this.randomRotationY; //+ this.entity.getRotationY();
        var rotationZ   =   this.v3Rotation[2] + archetype.rotationZ;

        if (!rotationY && !rotationZ)
        {
            return;
        }

        var m33RotationMatrix = md.m33BuildIdentity();

        if (rotationX !== 0.0)
        {
            md.m33RotateX(m33RotationMatrix, rotationX, m33RotationMatrix);
        }
        if (rotationZ !== 0.0)
        {
            md.m33RotateZ(m33RotationMatrix, rotationZ, m33RotationMatrix);
        }
        if (rotationY !== 0.0)
        {
            md.m33RotateY(m33RotationMatrix, rotationY, m33RotationMatrix);
        }

        md.m43MulM33(m43Dest, m33RotationMatrix, m43Dest);
        md.m43MulM33(m43DestB, m33RotationMatrix, m43DestB);
    },

    buildScale : function eCMeshBuildScaleFn(m43Dest)
    {
        var md          = this.globals.mathDevice;
        var archetype   = this.archetype;

        var scale = this.scale * archetype.scale * this.randomScale;
        var scaleX = scale * this.v3Scale[0] * archetype.scaleX;
        var scaleY = scale * this.v3Scale[1] * archetype.scaleY;
        var scaleZ = scale * this.v3Scale[2] * archetype.scaleZ;
        md.m43Scale(m43Dest, md.v3Build(scaleX, scaleY, scaleZ), m43Dest);
    },

    buildLocation : function eCMeshBuildLocationFn(m43Unscaled, m43Dest)
    {
        var md = this.globals.mathDevice;
        var v3Location  =   this.getv3Location();

        if (this.m43BaseTransformMatrix)
        {
            md.m43Mul(m43Dest,     this.m43BaseTransformMatrix,  m43Dest);
            md.m43Mul(m43Unscaled, this.m43BaseTransformMatrix,  m43Unscaled);
        }
        else
        {
            md.m43SetPos(m43Dest, v3Location);
            md.m43SetPos(m43Unscaled, v3Location);
        }

        if (this.localOffset !== undefined)
        {
            md.m43SetPos(m43Dest, md.m43TransformPoint(m43Unscaled, this.localOffset));
        }
    },

    draw : function eCMeshDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //dd.drawDebugSphere(this.entity.v3Location, 1.0, 1.0, 1.0, 1.0);
    },

    getm43Transform : function eCMeshGetM43TransformFn()
    {
        return  this.m43Transform;
    },

    getX : function ecmeshGetXFn(dst)
    {
        var md  =   this.globals.mathDevice;

        return  md.m43Right(this.m43Transform, dst);
    },

    getY : function ecmeshGetYFn(dst)
    {
        var md  =   this.globals.mathDevice;

        return  md.m43Up(this.m43Transform, dst);
    },

    getZ : function ecmeshGetZFn(dst)
    {
        var md  =   this.globals.mathDevice;

        return  md.m43At(this.m43Transform, dst);
    },

    transformPoint : function ecmeshTransformPointFn(v3Position, v3Dest)
    {
        var md  =   this.globals.mathDevice;

        return  md.m43TransformPoint(this.m43Transform, v3Position, v3Dest);
    },

    getTransformedv3Location : function ecmeshGetTransformedv3LocationFn(dst)
    {
        var md  =   this.globals.mathDevice;

        return  md.m43Pos(this.m43Transform, dst);
    },

    setOnlySaveRotation : function ecmeshSetOnlySaveRotationFn(onlySaveRotation)
    {
        this.onlySaveRotation   =   onlySaveRotation;
    },

    getWorldExtents : function ecmeshGetWorldExtents(dst)
    {
        return this.node.calculateHierarchyWorldExtents(dst);
    },

    serialize : function ecmeshSaveSerializeFn()
    {
        var ecData = {};

        ecData.rotationY = this.getRotationY();
        ecData.scale = this.scale;
        ecData.v3Scale = this.v3Scale;

        if (this.path)
        {
            ecData.path = this.path;
        }

        return ecData;
    },

    deserialize : function eCBaseDeserializeFn(eCData)
    {
        if (eCData.rotationY !== undefined)
        {
            this.setRotationY(eCData.rotationY);
        }

        this._super(eCData);

        if (this.entity)
        {
            // We update the matrix so it can be used by child entities, even before our next update()
            this.updateMatrix();
            this.setDirtyMatrix(true);
        }
    },

    destroy : function eCMeshDestroyFn()
    {
        this._super();

        this.removeNode();
    }
});

ECMesh.preloadComponent = function eCMeshPreloadComponentFn(globals, componentParameters)
{
    var debugBuild = false;
    if (debug)
    {
        debugBuild = true;
    }

    if (debugBuild || componentParameters.debugOnly === false)
    {
        var simpleSceneLoader   =   globals.simpleSceneLoader;
        if (!simpleSceneLoader.isLoadingMesh(componentParameters.path))
        {
            simpleSceneLoader.preload(componentParameters.path,
                                      componentParameters.stationary,
                                      componentParameters.numInstances,
                                      componentParameters.loadOptions);
        }
    }
};

ECMesh.create = function eCMeshCreateFn(globals, parameters)
{
    return new ECMesh(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECMesh.prototype.entityComponentName] = ECMesh;
