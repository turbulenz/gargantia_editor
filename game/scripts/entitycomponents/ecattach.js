//
//  ECAttach
//
//  Makes my my entity follow my parent.

/*global EntityComponentBase: false*/
/*global EntityComponentSortOrder: false*/

var ECAttach = EntityComponentBase.extend(
{
    entityComponentName : 'ECAttach',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.MOVE_LOCATION,
    shouldUpdate : true,
    shouldAlwaysUpdate : false,
    shouldDraw : false,

    //Networking info.
    shouldSerialize        : true,
    shouldDeltaSerialize   : false,

    //Persistence info.
    shouldSave : false,

    realTime : false,    //To honour this make sure you reference parameters through this.archetype

    scratchV3 : null,
    scratchM43 : null,

    init : function eCAttachInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        this.stationary = false;
        this.v3LocalOffset = null;

        if (!this.scratchV3)
        {
            ECAttach.prototype.scratchV3 = globals.mathDevice.v3BuildZero();
            ECAttach.prototype.scratchM43 = globals.mathDevice.m43BuildIdentity();
        }
    },

    activate : function ecattachActivateFn()
    {
        this._super();

        //Order agnostic (attach after parent set)
        if (this.parentEntity)
        {
            this.parentEntity.addChild(this.entity);
            if (this.isStationary())
            {
                this.updateTransform();
            }
        }

        // Always update once to make sure our parent is set. If we are stationary, we turn off
        // shouldAlwaysUpdate after our first update.
        this.setToAlwaysUpdate(true);
    },

    setParent : function eCAttachSetParentFn(gameEntity)
    {
        this.parentEntity   =   gameEntity;

        //Order agnostic (attach before parent set)
        if (this.entity)
        {
            this.parentEntity.addChild(this.entity);
            if (this.isStationary())
            {
                this.updateTransform();
            }
        }
    },

    getParent : function eCAttachGetparentFn()
    {
        return  this.parentEntity;
    },

    clearParent : function eCAttachClearParentFn()
    {
        if (this.parentEntity)
        {
            this.parentEntity.removeChild(this.entity);
            this.parentEntity   =   null;
        }
    },

    getBaseEntity : function eCAttachGetBaseEntityFn()
    {
        var baseEntity = this.entity;
        var parentEntity = this.getParent();
        var ecAttach;

        while (parentEntity)
        {
            baseEntity = parentEntity;
            ecAttach = baseEntity.getEC('ECAttach');
            if (ecAttach)
            {
                parentEntity = ecAttach.getParent();
            }
            else
            {
                parentEntity = null;
            }
        }

        return baseEntity;
    },

    clearTransform : function eCAttachClearTransformFn()
    {
        var myECMesh        =   this.getEntityEC('ECMesh');
        if (myECMesh)
        {
            if (myECMesh.m43BaseTransformMatrix)
            {
                myECMesh.clearm43BaseTransformMatrixOffset();
            }
        }
    },

    isStationary : function eCAttachIsStationaryFn()
    {
        return this.stationary;
    },

    setStationary : function eCAttachSetStationaryFn(stationary)
    {
        this.stationary = stationary;
        if (this.entity)
        {
            this.setToAlwaysUpdate(!stationary);
        }
    },

    getv3LocalOffset : function eCAttachGetv3LocalOffsetFn()
    {
        return this.v3LocalOffset;
    },

    setv3LocalOffset : function eCAttachSetv3LocalOffsetFn(v3LocalOffset)
    {
        this.v3LocalOffset = v3LocalOffset;
    },

    clearv3LocalOffset : function eCAttachClearv3LocalOffsetFn()
    {
        this.v3LocalOffset = null;
    },

    update : function eCAttachUpdateFn()
    {
        this._super();

        if (!this.isStationary())
        {
            this.updateTransform();
        }
        else
        {
            this.setToUpdate(false);
        }
    },

    updateTransform : function eCAttachUpdateTransformFn()
    {
        var globals = this.globals;
        var md = globals.mathDevice;

        var parentEntity = this.parentEntity;

        var v3LocalOffset = this.getv3LocalOffset();

        var offsettedm43Transform;
        var offsettedv3Location;

        if (md && parentEntity)
        {
            var parentECMesh = this.parentEntity.getEC('ECMesh');
            var myECMesh = this.getEntityEC('ECMesh');
            var parentTransform;

            if (v3LocalOffset &&
                (v3LocalOffset[0] !== 0.0 ||
                 v3LocalOffset[1] !== 0.0 ||
                 v3LocalOffset[2] !== 0.0))
            {
                if (parentECMesh)
                {
                    parentTransform = parentECMesh.getm43Transform();
                    offsettedv3Location = md.m43TransformPoint(parentTransform, v3LocalOffset, this.scratchV3);
                    offsettedm43Transform = md.m43Copy(parentTransform, this.scratchM43);
                    md.m43SetPos(offsettedm43Transform, offsettedv3Location);

                    this.entity.setv3Location(offsettedv3Location);

                    if (myECMesh)
                    {
                        myECMesh.setm43BaseTransformMatrix(offsettedm43Transform);
                    }
                }
                else
                {
                    offsettedv3Location = md.v3Add(this.parentEntity.getv3Location(), v3LocalOffset, this.scratchV3);

                    this.entity.setv3Location(offsettedv3Location);
                }
            }
            else
            {
                if (parentECMesh)
                {
                    parentTransform = parentECMesh.getm43Transform();

                    this.entity.setv3Location(md.m43Pos(parentTransform, this.scratchV3));

                    if (myECMesh)
                    {
                        myECMesh.setm43BaseTransformMatrix(parentTransform);
                    }
                }
                else
                {
                    this.entity.setv3Location(this.parentEntity.getv3Location());
                }
            }
        }
    },

    draw : function eCAttachDrawFn()
    {
        //var dd = this.globals.debugDraw;
        //
        //dd.drawDebugPoint(this.entity.v3Location, 0, 1, 1);
        //dd.drawDebugSphere(this.entity.v3Location, 2.0, 0, 1, 1);
    },

    drawDebug : function eCSuperPhysicsCubeDrawFn()
    {
        var dd = this.globals.debugDraw;

        var parentEntity = this.parentEntity;

        if (parentEntity)
        {
            var ecMesh  =   parentEntity.getEC('ECMesh');
            if (ecMesh)
            {
                dd.drawDebugMatrix(ecMesh.getm43Transform());
            }
        }
    },

    serialize : function eCAttachSerializeFn(eCData)
    {
        this._super(eCData);

        if (this.parentEntity)
        {
            eCData.parentEntity     =   this.packGameEntity(this.parentEntity);
        }
    },

    serializeDelta : function eCAttachSerializeDeltaFn(/*eCData*/)
    {

    },

    setGameSpace : function eCBaseSetGameSpaceFn(/*newSpace*/)
    {

    },

    onToBeDestroyed : function ecNameOnToBeDestroyedFn()
    {
        this._super();

        this.clearParent();
    },

    destroy : function entityComponentBaseDestroyFn()
    {
        this.clearParent();
    }
});

ECAttach.create = function eCAttachCreateFn(globals, parameters)
{
    return new ECAttach(globals, parameters);
};

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECAttach.prototype.entityComponentName] = ECAttach;
