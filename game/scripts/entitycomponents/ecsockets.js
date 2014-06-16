//
//  EntityComponentSockets!
//

/*global EntityComponentBase: false*/
/*global TWEEN: false*/
/*global EntityComponentSortOrder: false*/

var ECSockets = EntityComponentBase.extend(
{
    entityComponentName : 'ECSockets',

    //Update info.
    updatePeriod : 0.0, //Period of update in seconds. 0.0 denotes every frame.
    sortPriority : EntityComponentSortOrder.SOCKETS,
    shouldUpdate : true,
    shouldAlwaysUpdate : true,
    shouldDraw : false,

    //Networking info.
    shouldSerialize        : false,
    shouldDeltaSerialize   : false,

    //Persistence info.
    shouldSave : false,

    realTime : false,

    parameters :
    {
        // Fully define parameters for full slider control and to provide better documentation

        stationary : true
        //sockets : (an array of stuff to create and attach).
        //[
        //  {
            // archetypeName : 'turret',
            // localOffset : [1.0, 0.0, 1.0]
        //  },
        //  {
            // archetypeName : 'cup_holder',
            // localOffset : [3.0, 0.0, 0.0]
        //  }
        //]
    },

    init : function ecSocketsInitFn(globals, parameters)
    {
        this._super(globals, parameters);

        this.socketedEntities = [];
    },

    update : function ecSocketsUpdateFn()
    {
        this._super();

        this.createSocketedEntities();

        this.setToUpdate(false);
    },

    createSocketedEntities : function ecSocketsCreateSocketedEntitiesFn()
    {
        var sockets = this.getSockets();
        var numSockets;
        var socketIndex;
        var socket;

        var stationary = this.isStationary();

        var createSocketedEntity = this.createSocketedEntity;

        if (sockets)
        {
            numSockets = sockets.length;
            for (socketIndex = 0; socketIndex < numSockets; socketIndex += 1)
            {
                socket = sockets[socketIndex];
                if (socket)
                {
                    createSocketedEntity.call(this, socket.archetypeName, socket.localOffset, stationary);
                }
            }
        }
    },

    beginAppearAnim : function ecSocketsBeginAppearAnimFn(ecMesh, ecAttach)
    {
        var globals = this.globals;
        var mathDevice = globals.mathDevice;

        var thatECSockets   =   this;

        if (ecMesh && mathDevice)
        {
            ecMesh.setScale(0.1);

            ecMesh.update();
            ecAttach.setStationary(false);

            TWEEN.Create({scale : 0.5})
                .to({scale : 1.0}, 0.7)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function ()
                    {
                        ecMesh.setScale(this.scale);
                    })
                .onComplete(function ()
                    {
                        ecAttach.setStationary(thatECSockets.isStationary());
                    })
                .delay(0.4)
                .start();
        }
    },

    createSocketedEntity : function ecSocketsCreateSocketedEntityFn(archetypeName, localOffset, stationary)
    {
        var globals = this.globals;
        var gameManager = this.gameManager;
        var mathDevice = globals.mathDevice;
        var entityFactory = gameManager.getEntityFactory();

        var v3LocalOffset;

        var v3SocketedEntityLocation;

        var thisEntity = this.entity;

        var socketedEntity;
        var ecMesh;

        var newECAttach;

        if (archetypeName && mathDevice && entityFactory)
        {
            v3SocketedEntityLocation = mathDevice.v3Copy(this.getv3Location());

            if (localOffset)
            {
                v3LocalOffset = mathDevice.v3Build(localOffset[0], localOffset[1], localOffset[2]);

                if (stationary)
                {
                    ecMesh = thisEntity.getEC('ECMesh');

                    if (ecMesh)
                    {
                        v3SocketedEntityLocation = mathDevice.m43TransformPoint(ecMesh.getm43Transform(), v3LocalOffset, v3SocketedEntityLocation);
                    }
                    else
                    {
                        v3SocketedEntityLocation = mathDevice.v3Add(v3SocketedEntityLocation, v3LocalOffset, v3SocketedEntityLocation);
                    }
                }
            }
            else
            {
                v3LocalOffset = mathDevice.v3BuildZero();
            }

            socketedEntity = entityFactory.createInactiveEntityInstance('SocketedEntity', archetypeName, v3SocketedEntityLocation);
            if (socketedEntity)
            {
                socketedEntity.setGameSpace(thisEntity.getGameSpace());

                newECAttach = EntityComponentBase.createFromName('ECAttach', globals);
                newECAttach.setParent(thisEntity);
                newECAttach.setStationary(stationary);
                newECAttach.setv3LocalOffset(v3LocalOffset);
                socketedEntity.addECToCustomEntity(newECAttach);

                socketedEntity.shouldLevelSave = false;
                socketedEntity.shouldPlayerSave = false;

                socketedEntity.activate();

                var socketedECMesh  =   socketedEntity.getEC('ECMesh');

                if (socketedECMesh)
                {
                    this.beginAppearAnim(socketedECMesh, newECAttach);
                }

                this.socketedEntities.push(socketedEntity);
            }
        }
    },

    getSocketedEntities : function ecSocketsGetSocketedEntitiesFn()
    {
        return this.socketedEntities;
    },

    applyToSocketedEntities : function ecSocketsPropagateToSocketedEntitiesFn(functionToApply)
    {
        var socketedEntities = this.getSocketedEntities();

        var socketedEntityIndex;
        var numSocketedEntities;

        var socketedEntity;
        if (socketedEntities && functionToApply)
        {
            numSocketedEntities = socketedEntities.length;
            for (socketedEntityIndex = 0; socketedEntityIndex < numSocketedEntities; socketedEntityIndex += 1)
            {
                socketedEntity = socketedEntities[socketedEntityIndex];
                if (socketedEntity)
                {
                    functionToApply(socketedEntity, Array.prototype.slice.call(arguments, 1));
                }
            }
        }
    },

    isStationary : function ecSocketsIsStationaryFn()
    {
        return this.archetype.stationary;
    },

    getSockets : function ecSocketsGetSocketsFn()
    {
        return this.archetype.sockets;
    },

    draw : function eCSocketsDrawFn()
    {

    },

    drawDebug : function ecSocketsDrawDebugFn()
    {

    },

    destroy : function ecSocketsDestroyFn()
    {
        this._super();
    }
});

// Build this into the Entity map.
EntityComponentBase.prototype.eCCreationMap[ECSockets.prototype.entityComponentName] = ECSockets;

ECSockets.create = function ecSocketsCreateFn(globals, parameters)
{
    return new ECSockets(globals, parameters);
};
