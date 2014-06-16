//
// GameGridSquare - class description
//

function GameGridSquare() {}

GameGridSquare.prototype =
{
    addGameEntity : function gamegridsquareAddGameEntityFn(gameEntity)
    {
        this.entityList.push(gameEntity);

        this.refreshGameEntityLists(gameEntity);

        var ecPhysSphere    =   gameEntity.getEC('ECPhysicsSphere');
        var md;

        //PHYSICS
        if (ecPhysSphere)
        {
            md  =   this.globals.mathDevice;

            this.physSphereList.push(ecPhysSphere);

            if (md.aabbEnclosesPoint(this.extents, gameEntity.getv3Location()))
            {
                this.physPointList.push(ecPhysSphere);
                if (!this.physics)
                {
                    this.gameGrid.addGridSquareToPhysics(this);
                }
                this.physics = true;
            }
        }
    },

    removeGameEntity : function gamegridsquareRemoveGameEntityFn(gameEntity)
    {
        var index_to_splice = this.entityList.indexOf(gameEntity);
        if (index_to_splice >= 0)
        {
            this.entityList.splice(index_to_splice, 1);
        }

        this.removeEntityFromUpdateList(gameEntity);

        //PHYSICS
        var ecPhysSphere    =   gameEntity.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            index_to_splice = this.physSphereList.indexOf(ecPhysSphere);
            if (index_to_splice >= 0)
            {
                this.physSphereList.splice(index_to_splice, 1);
            }
            index_to_splice = this.physPointList.indexOf(ecPhysSphere);
            if (index_to_splice >= 0)
            {
                this.physPointList.splice(index_to_splice, 1);

                this.physics = this.physPointList.length > 0;
                if (!this.physics)
                {
                    this.gameGrid.removeGridSquareFromPhysics(this);
                }
            }
        }
    },

    refreshGameEntityLists : function gamegridsquareRefreshGameEntityListsFn(gameEntity)
    {
        if (gameEntity.shouldUpdate())
        {
            this.addEntityToUpdateList(gameEntity);
        }
        else
        {
            this.removeEntityFromUpdateList(gameEntity);
        }

        if (gameEntity.shouldDraw())
        {
            this.addEntityToDrawList(gameEntity);
        }
        else
        {
            this.removeEntityFromDrawList(gameEntity);
        }
    },

    addEntityToUpdateList : function gamegridsquareAddEntityToUpdateList(gameEntity)
    {
        if (gameEntity && this.entityUpdateList.indexOf(gameEntity) === -1)
        {
            this.entityUpdateList.push(gameEntity);
        }
    },

    removeEntityFromUpdateList : function gamegridsquareRemoveEntityFromUpdateList(gameEntity)
    {
        var indexToSplice;

        if (gameEntity)
        {
            indexToSplice = this.entityUpdateList.indexOf(gameEntity);
            if (indexToSplice >= 0)
            {
                this.entityUpdateList.splice(indexToSplice, 1);
            }
        }
    },

    addEntityToDrawList : function gamegridsquareAddEntityToDrawList(gameEntity)
    {
        if (gameEntity && this.entityDrawList.indexOf(gameEntity) === -1)
        {
            this.entityDrawList.push(gameEntity);
        }
    },

    removeEntityFromDrawList : function gamegridsquareRemoveEntityFromDrawList(gameEntity)
    {
        var indexToSplice;

        if (gameEntity)
        {
            indexToSplice = this.entityDrawList.indexOf(gameEntity);
            if (indexToSplice >= 0)
            {
                this.entityDrawList.splice(indexToSplice, 1);
            }
        }
    },

    hasEntities : function gamegridsquareHasEntitiesFn()
    {
        return  (this.entityList.length > 0);
    },

    applyToGameEntities : function gamegridsquareApplyToGameEntitiesFn(toApply, appliedMap)
    {
        var objectIndex;
        var entList       = this.entityList;
        var entListLength = entList.length;
        var thisEntity;
        for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
        {
            thisEntity  =   entList[objectIndex];
            if (!appliedMap[thisEntity.name])
            {
                toApply(thisEntity);
                appliedMap[thisEntity.name]  =   true;
            }
        }
    },

    hasUpdatingEntities : function gamegridsquareHasUpdatingEntitiesFn()
    {
        return  (this.entityList.length > 0);
    },

    applyToUpdatingGameEntities : function gamegridsquareApplyToUpdatingGameEntitiesFn(toApply, appliedMap)
    {
        var objectIndex;
        var entList       = this.entityUpdateList;
        var entListLength = entList.length;
        var thisEntity;
        for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
        {
            thisEntity  =   entList[objectIndex];
            if (!appliedMap[thisEntity.name])
            {
                toApply(thisEntity);
                appliedMap[thisEntity.name]  =   true;
            }
        }
    },

    applyToDrawnGameEntities : function gamegridsquareApplyToUpdatingGameEntitiesFn(toApply, appliedMap)
    {
        var objectIndex;
        var entList       = this.entityDrawList;
        var entListLength = entList.length;
        var thisEntity;
        for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
        {
            thisEntity  =   entList[objectIndex];
            if (!appliedMap[thisEntity.name])
            {
                toApply(thisEntity);
                appliedMap[thisEntity.name]  =   true;
            }
        }
    },

    applyToPhysicsSpheres : function gamegridsquareApplyToPhysicsSpheresFn(toApply, appliedMap)
    {
        var physIndex;
        var physSphereList       = this.physSphereList;
        var physSphereListLength = physSphereList.length;
        var thisPhysSphere;
        for (physIndex = 0; physIndex < physSphereListLength; physIndex += 1)
        {
            thisPhysSphere  =   physSphereList[physIndex];
            if (!appliedMap[thisPhysSphere.entity.name])
            {
                toApply(thisPhysSphere);
                appliedMap[thisPhysSphere.entity.name]  =   true;
            }
        }
    },

    debugDraw : function gamegridsquareDrawDebug()
    {
        var globals    = this.globals;
        var dd         = globals.debugDraw;
        var md         = globals.mathDevice;
        var v3Location = md.v3Copy(this.v3Location);

        var appliedMap  =   {};

        var drawActiveLineToOrigin = function (gameEntity)
        {
            var v3EntityLocation    =    md.v3Copy(gameEntity.getv3Location());
            v3EntityLocation[1]    +=    1.0;
            v3Location[1]    =    v3EntityLocation[1];
            dd.drawDebugLine(v3Location, v3EntityLocation, 1.0, 0.25, 0.25);
        };

        this.applyToUpdatingGameEntities(drawActiveLineToOrigin, appliedMap);

        var drawLineToOrigin = function (gameEntity)
        {
            var v3EntityLocation    =    md.v3Copy(gameEntity.getv3Location());
            v3EntityLocation[1]    +=    1.0;
            v3Location[1]    =    v3EntityLocation[1];
            dd.drawDebugLine(v3Location, v3EntityLocation, 0.25, 0.25, 1.0);
        };

        this.applyToGameEntities(drawLineToOrigin, appliedMap);
    },

    //Physics management.
    resolvePhysicsSphereCollision : function gamegridsquareResolvePhysicsSphereCollisionFn()
    {
        var physPointList        = this.physPointList;
        var physPointListLength  = physPointList.length;
        var physPointListIndex;
        var thisPhysPointSphere;

        var physSphereList       = this.physSphereList;
        var physSphereListLength = physSphereList.length;
        var physSphereListIndex;
        var thisPhysSphere;

        var d_t = this.globals.physTimeStep;

        for (physPointListIndex = 0; physPointListIndex < physPointListLength; physPointListIndex += 1)
        {
            thisPhysPointSphere =   physPointList[physPointListIndex];

            for (physSphereListIndex = 0; physSphereListIndex < physSphereListLength; physSphereListIndex += 1)
            {
                thisPhysSphere  =   physSphereList[physSphereListIndex];

                if (thisPhysSphere.uniqueCollisionIndex > thisPhysPointSphere.uniqueCollisionIndex)
                {
                    if (thisPhysSphere.detectsCollision(thisPhysPointSphere))
                    {
                        thisPhysSphere.resolveCollision(thisPhysPointSphere, d_t);
                    }
                }
            }
        }
    }
};

GameGridSquare.create = function gameGridSquareCreateFn(globals, gameGrid, v3Lower, v3Upper)
{
    var gameGridSquare = new GameGridSquare();

    gameGridSquare.entityList       = [];
    gameGridSquare.entityUpdateList = [];
    gameGridSquare.entityDrawList   = [];
    gameGridSquare.physPointList    = [];
    gameGridSquare.physSphereList   = [];
    gameGridSquare.globals          = globals;
    gameGridSquare.gameGrid         = gameGrid;

    var md  =   globals.mathDevice;
    gameGridSquare.extents    = md.aabbBuildFromMinAndMax(v3Lower, v3Upper);
    gameGridSquare.v3Location = md.v3Copy(v3Lower);

    return gameGridSquare;
};
