//
//  GameSpace -
//      contains, updates, and networks:
//      - Entities
//      - Physics
//      - Doors
//

/*global AABBTree: false*/
/*global Array2D: false*/
/*global debug: false*/
/*global GameGrid: false*/
/*global Profile: false*/

function GameSpace() {}

GameSpace.prototype =
{
    activate : function gamespaceActivateFn()
    {
        this.finalizeIfNeeded();

        var entityList = this.getEntityList();
        entityList.map(function (entity) { entity.activate(); });
    },

    //
    //  Accessors.
    //
    getv3Location : function gameSpaceGetv3LocationFn()
    {
        return  this.v3Centre;
    },

    getV3RespawnLocation : function gameSpaceGetV3RespawnLocationFn()
    {
        return this.v3RespawnLocation;
    },

    getM43FullTransform : function gameSpaceGetM43FullTransformFn()
    {
        return  this.m43FullTransform;
    },

    getv3HalfExtents : function gameSpaceGetv3HalfExtentsFn()
    {
        return  this.v3HalfExtents;
    },

    getExtents : function gamespaceGetExtents()
    {
        return  this.extents;
    },

    calculateExtents : function calculateExtentsFn()
    {
        //Leave m43FullTransform alone

        var cubeTreeRootNode        = this.cubeTree.getRootNode();
        var cubeTreeDynamicRootNode = this.cubeTreeDynamic.getRootNode();

        var md = this.globals.mathDevice;

        var returnExtents;
        if (cubeTreeRootNode && cubeTreeDynamicRootNode)
        {
            returnExtents   = md.aabbUnion(cubeTreeRootNode.extents, cubeTreeDynamicRootNode.extents);
        }
        else if (cubeTreeRootNode)
        {
            returnExtents   = md.aabbCopy(cubeTreeRootNode.extents);
        }
        else if (cubeTreeDynamicRootNode)
        {
            returnExtents   = md.aabbCopy(cubeTreeDynamicRootNode.extents);
        }
        else
        {
            returnExtents   = md.aabbCopy(this.extents);
        }

        returnExtents[1]    -=  20;
        returnExtents[4]    +=  20;

        var currentExtents = this.getExtents();

        var extentsDifference;

        for (var extentsIndex = 0; extentsIndex < 6; extentsIndex += 1)
        {
            extentsDifference = (returnExtents[extentsIndex] - currentExtents[extentsIndex]);

            // All max extents get ceiled, min extents get floored
            if (extentsIndex >= 3)
            {
                extentsDifference = Math.ceil(extentsDifference);
            }
            else
            {
                extentsDifference = Math.floor(extentsDifference);
            }

            returnExtents[extentsIndex] = (currentExtents[extentsIndex] + extentsDifference);
        }

        return returnExtents;

        //this.extents    =   resultExtents;

        //md.aabbGetCenterAndHalf(this.extents, this.v3Centre, this.v3HalfExtents);
    },

    //
    //  Entity Management.
    //
    updateEntities : function gameSpaceUpdateEntitiesFn()
    {
        var gameGrid = this.getGameGrid();
        var gameCamera = this.gameManager.gameCamera;

        this.destroyDeadEntities();

        if (gameGrid && gameCamera)
        {
            this.updateActiveEntities(gameCamera.desiredV3Focus);
        }
        else
        {
            this.updateAllEntities();
        }
    },

    onEntityToBeDestroyed : function gameSpaceOnEntityToBeDestroyedFn(entity)
    {
        this.toBeDestroyedEntityList.push(entity);
    },

    destroyDeadEntities : function gameSpaceDestroyDeadEntitiesFn()
    {
        var toBeDestroyedEntityList = this.toBeDestroyedEntityList;
        var numEntities = toBeDestroyedEntityList.length;
        var entityIndex;
        var entity;

        for (entityIndex = 0; entityIndex < numEntities; entityIndex += 1)
        {
            entity = toBeDestroyedEntityList[entityIndex];
            if (entity)
            {
                entity.destroy();
            }
        }

        toBeDestroyedEntityList.length = 0;
    },

    updateActiveEntities : function gameSpaceUpdateActiveEntitiesFn(v3CameraLocation)
    {
        var radiusAroundCamera = 30.0;

        var appliedMap = {};

        Profile.start('Update - On Screen Entities');
        var updatingEntitiesOnScreenList = this.getUpdatingEntitiesNearPosition(v3CameraLocation, radiusAroundCamera);
        this.updateEntitiesInList(updatingEntitiesOnScreenList, true, appliedMap);
        Profile.stop('Update - On Screen Entities');

        Profile.start('Update - Off Screen Entities');
        this.updateEntitiesInList(this.entityAlwaysUpdateList, false, appliedMap);
        Profile.stop('Update - Off Screen Entities');
    },

    drawOnScreenEntities : function gamespaceDrawOnScreenEntitiesFn(v3CameraLocation)
    {
        var radiusAroundCamera = 30.0;

        var appliedMap = {};

        var updatingEntitiesOnScreenList = this.getDrawnEntitiesNearPosition(v3CameraLocation, radiusAroundCamera);
        this.drawEntitiesInList(updatingEntitiesOnScreenList, true, appliedMap);
    },

    getUpdatingEntitiesNearPosition : function gameSpaceUpdateEntitiesNearPositionFn(v3Location, radius)
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        scratchpad.aabbExtents = mathDevice.aabbBuildFromCentreRadius(v3Location, radius, scratchpad.aabbExtents);

        if (!scratchpad.updatingEntityList)
        {
            scratchpad.updatingEntityList = [];
        }

        var entityList = scratchpad.updatingEntityList;
        entityList.length = 0;

        var appliedMap = {};
        var addEntityToList = function addEntityToList(gameEntity)
        {
            if (gameEntity)
            {
                entityList.push(gameEntity);
            }
        };

        //this.debugDrawEntityScreenArea(v3Location, radius);
        this.applyToUpdatingEntitiesInGridCellsWithinExtents(scratchpad.aabbExtents, addEntityToList, appliedMap);

        return entityList;
    },

    getEntitiesNearPosition : function gamespaceGetEntitiesNearPositionFn(v3Location, radius)
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        scratchpad.aabbExtents = mathDevice.aabbBuildFromCentreRadius(v3Location, radius, scratchpad.aabbExtents);

        if (!scratchpad.entityList)
        {
            scratchpad.entityList = [];
        }

        var entityList = scratchpad.entityList;
        entityList.length = 0;

        var appliedMap = {};
        var addEntityToList = function addEntityToList(gameEntity)
        {
            if (gameEntity)
            {
                entityList.push(gameEntity);
            }
        };

        //this.debugDrawEntityScreenArea(v3Location, radius);
        this.applyToEntitiesInGridCellsWithinExtents(scratchpad.aabbExtents, addEntityToList, appliedMap);

        return entityList;
    },

    getDrawnEntitiesNearPosition : function gamespaceGetDrawnEntitiesNearPositionFn(v3Location, radius)
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        scratchpad.aabbExtents = mathDevice.aabbBuildFromCentreRadius(v3Location, radius, scratchpad.aabbExtents);

        if (!scratchpad.drawnEntityList)
        {
            scratchpad.drawnEntityList = [];
        }

        var entityList = scratchpad.drawnEntityList;
        entityList.length = 0;

        var appliedMap = {};
        var addEntityToList = function addEntityToList(gameEntity)
        {
            if (gameEntity)
            {
                entityList.push(gameEntity);
            }
        };

        //this.debugDrawEntityScreenArea(v3Location, radius);
        this.applyToDrawnEntitiesInGridCellsWithinExtents(scratchpad.aabbExtents, addEntityToList, appliedMap);

        return entityList;
    },

//    debugDrawEntityScreenArea : function gameSpaceDebugDrawEntityScreenAreaFn(v3Location, radius)
//    {
//        var debugDraw = this.globals.debugDraw;
//
//        if (debugDraw && v3Location && radius > 0)
//        {
//            debugDraw.drawDebugCube(v3Location, radius, 0.2, 0.2, 1.0);
//        }
//    },

    updateAllEntities : function gameSpaceUpdateAllEntitiesFn()
    {
        var gameCurrentTime =   this.globals.gameCurrentTime;

        var currentObject;
        var objectIndex;
        var entList     =   this.entityUpdateList;
        for (objectIndex = 0; objectIndex < entList.length; objectIndex += 1)
        {
            currentObject = entList[objectIndex];

            if (currentObject.isTimeToUpdate(gameCurrentTime))
            {
                if (!currentObject.shouldBeDestroyed())
                {
                    currentObject.update(true);
                }
            }
        }
    },

    updateEntitiesInList : function gameSpaceUpdateEntitiesInListFn(entList, onScreen, appliedMap)
    {
        var currentObject;
        var objectIndex;

        var gameCurrentTime =   this.globals.gameCurrentTime;

        if (entList)
        {
            for (objectIndex = 0; objectIndex < entList.length; objectIndex += 1)
            {
                currentObject = entList[objectIndex];

                if (currentObject && (!appliedMap || !appliedMap[currentObject.name]))
                {
                    if (appliedMap)
                    {
                        appliedMap[currentObject.name] = true;
                    }

                    if (currentObject.isTimeToUpdate(gameCurrentTime))
                    {
                        if (!currentObject.shouldBeDestroyed())
                        {
                            currentObject.update(onScreen);
                        }
                    }
                }
            }
        }

        return appliedMap;
    },

    clearEntities : function gameSpaceClearEntitiesFn()
    {
        var entityList = this.entityList;

        var objectIndex;

        while (entityList.length)
        {
            objectIndex = (entityList.length - 1);
            entityList[objectIndex].setToBeDestroyed();
            entityList[objectIndex].destroy(); // This also removes the entity from the list
        }

        this.toBeDestroyedEntityList.length = 0;

        this.entityUpdateList.length        = 0;
        this.entityAlwaysUpdateList.length  = 0;
        this.entityDrawList.length          = 0;
    },

    getEntityList : function gamespaceGetEntityListFn()
    {
        return this.entityList;
    },

    addEntities : function gamespaceAddEntities(entityList)
    {
        var entityListLength = entityList.length;

        var entityIndex;
        var entity;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            entity = entityList[entityIndex];

            this.addEntity(entity);
        }
    },

    addEntity : function gamespaceAddEntityFn(entity)
    {
        entity.insideGameSpace = true;
        entity.setGameSpace(this);
        entity.setGameSpaceDynamic(false);
    },

    getEntitiesInRadius : function gameSpaceGetEntitiesInRadiusFn(v3Location, radius /*, useEntitySize*/)
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        scratchpad.aabbExtents = mathDevice.aabbBuildFromCentreRadius(v3Location, radius, scratchpad.aabbExtents);
        var entityList = [];
        var appliedMap = {};

        var entityRadius;
        var distance;
        var withinRadius;
        var radiusSquared   =   radius * radius;

        var addEntityToListIfInRadius = function addEntityToList(gameEntity)
        {
            if (gameEntity)
            {
                entityRadius     = gameEntity.getRadius();

                if (entityRadius > 0.0)
                {
                    distance      =   gameEntity.getDistanceUsingSize(v3Location);
                    withinRadius  =   distance < radius;
                }
                else
                {
                    withinRadius      =   mathDevice.v3DistanceSq(v3Location, gameEntity.getv3Location()) < radiusSquared;
                }

                if (withinRadius)
                {
                    entityList.push(gameEntity);
                }
            }
        };

        this.applyToEntitiesInGridCellsWithinExtents(scratchpad.aabbExtents, addEntityToListIfInRadius, appliedMap);

        return entityList;
    },

    getEntitiesInRadius2D : function gameSpaceGetEntitiesInRadius2DFn(v3Location, radius /*, useEntitySize*/)
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        scratchpad.aabbExtents = mathDevice.aabbBuildFromCentreRadius(v3Location, radius, scratchpad.aabbExtents);
        var entityList = [];
        var appliedMap = {};

        var entityRadius;
        var distance;
        var withinRadius;
        var radiusSquared   =   radius * radius;

        var addEntityToListIfInRadius = function addEntityToList(gameEntity)
        {
            if (gameEntity)
            {
                entityRadius     = gameEntity.getRadius();

                if (entityRadius > 0.0)
                {
                    distance      =   gameEntity.get2DDistanceUsingSize(v3Location);
                    withinRadius  =   distance < radius;
                }
                else
                {
                    withinRadius      =   mathDevice.v3Distance2DSq(v3Location, gameEntity.getv3Location()) < radiusSquared;
                }

                if (withinRadius)
                {
                    entityList.push(gameEntity);
                }
            }
        };

        this.applyToEntitiesInGridCellsWithinExtents(scratchpad.aabbExtents, addEntityToListIfInRadius, appliedMap);

        return entityList;
    },

    getEntitiesWithEC : function gamespaceGetEntitiesWithECFn(ecName)
    {
        var entityList       = this.entityList;
        var entityListLength = entityList.length;
        var outputList       = [];

        var entity;
        var entityIndex;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            entity = entityList[entityIndex];

            if (entity.hasEC(ecName))
            {
                outputList.push(entity);
            }
        }

        return outputList;
    },

    getEntitiesWithArcheType : function gameSpaceGetEntitiesWithArcheTypeFn(archetypeName)
    {
        var entityList       = this.entityList;
        var entityListLength = entityList.length;
        var outputList       = [];

        var entity;
        var entityIndex;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            entity = entityList[entityIndex];

            if (entity.getArchetypeName() === archetypeName)
            {
                outputList.push(entity);
            }
        }

        return outputList;
    },


    getEntitiesWithFamilyName : function gameSpaceGetEntitiesWithFamilyNameFn(familyName)
    {
        var entityList       = this.entityList;
        var entityListLength = entityList.length;
        var outputList       = [];

        var entity;
        var entityIndex;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            entity = entityList[entityIndex];

            if (entity.getFamilyName() === familyName)
            {
                outputList.push(entity);
            }
        }

        return outputList;
    },

    getEntityWithUniqueId : function gameSpaceGetEntityWithUniqueIdFn(uniqueId)
    {
        var entityList       = this.entityList;
        var entityListLength = entityList.length;

        var entity;
        var entityIndex;

        var entityWithUniqueId = null;

        for (entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
        {
            entity = entityList[entityIndex];

            if (entity.uniqueId === uniqueId)
            {
                entityWithUniqueId = entity;
                break;
            }
        }

        return entityWithUniqueId;
    },

    getBlocksByArchetype : function gameSpaceGetBlocksByArcheTypeFn(archetypeName)
    {
        var blockList       = this.blockList;
        var blockListLength = blockList.length;
        var outputList      = [];

        var block;
        var blockIndex;

        for (blockIndex = 0; blockIndex < blockListLength; blockIndex += 1)
        {
            block = blockList[blockIndex];

            if (block.getArchetypeName() === archetypeName)
            {
                outputList.push(block);
            }
        }

        return outputList;
    },

    //
    //  GameGrid
    //
    getGameGrid : function gamespaceGetGameGridFn()
    {
        return  this.gameGrid;
    },

    //
    //  Entity lists.
    //
    refreshEntityLists : function gamespaceRefreshEntityListsFn(gameEntity)
    {
        if (gameEntity.shouldUpdate())
        {
            this.addEntityToUpdateList(gameEntity);
        }
        else
        {
            this.removeEntityFromUpdateList(gameEntity);
        }

        if (gameEntity.shouldAlwaysUpdate())
        {
            this.addEntityToAlwaysUpdateList(gameEntity);
        }
        else
        {
            this.removeEntityFromAlwaysUpdateList(gameEntity);
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

    addGameEntity : function gameSpaceAddGameEntityFn(gameEntity, created)
    {
        if (gameEntity)
        {
            this.entityList.push(gameEntity);

            if (created)
            {
                this.newEntityList.push(gameEntity);
            }

            this.refreshEntityLists(gameEntity);

            this.entityMap[gameEntity.name] = gameEntity;

            gameEntity.uniqueId = this.currentUniqueEntityId;
            this.currentUniqueEntityId += 1;
        }
    },

    removeGameEntity : function gameSpaceRemoveGameEntityFn(gameEntity, destroyed)
    {
        var index_to_splice = this.entityList.indexOf(gameEntity);

        debug.assert(index_to_splice >= 0,
              "Trying to remove a game entity, but no matching one in the list!");

        this.entityList.splice(index_to_splice, 1);

        this.entityMap[gameEntity.name] = undefined;

        //Update list is only refreshed during the entities update...
        this.removeEntityFromUpdateList(gameEntity);
        this.removeEntityFromAlwaysUpdateList(gameEntity);

        this.removeEntityFromDrawList(gameEntity);

        if (destroyed)
        {
            this.deadEntityList.push(gameEntity.name);
        }
    },

    addEntityToUpdateList : function gameSpaceAddEntityToUpdateListFn(gameEntity)
    {
        if (gameEntity && this.entityUpdateList.indexOf(gameEntity) === -1)
        {
            this.entityUpdateList.push(gameEntity);
        }
    },

    removeEntityFromUpdateList : function gameSpaceRemoveEntityFromUpdateListFn(gameEntity)
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

    addEntityToAlwaysUpdateList : function gameSpaceAddEntityToAlwaysUpdateListFn(gameEntity)
    {
        if (gameEntity && this.entityAlwaysUpdateList.indexOf(gameEntity) === -1)
        {
            this.entityAlwaysUpdateList.push(gameEntity);
        }
    },

    removeEntityFromAlwaysUpdateList : function gameSpaceRemoveEntityFromAlwaysUpdateListFn(gameEntity)
    {
        var indexToSplice;

        if (gameEntity)
        {
            indexToSplice = this.entityAlwaysUpdateList.indexOf(gameEntity);
            if (indexToSplice >= 0)
            {
                this.entityAlwaysUpdateList.splice(indexToSplice, 1);
            }
        }
    },

    addEntityToDrawList : function gameSpaceAddEntityToDrawListFn(gameEntity)
    {
        if (gameEntity && this.entityDrawList.indexOf(gameEntity) === -1)
        {
            this.entityDrawList.push(gameEntity);
        }
    },

    removeEntityFromDrawList : function gameSpaceRemoveEntityFromDrawListFn(gameEntity)
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

    shuffleGameEntityToEnd : function gameSpaceShuffleGameEntityToEndFn(gameEntity)
    {
        var index_to_splice = this.entityList.indexOf(gameEntity);

        //Entity list.
        debug.assert(index_to_splice >= 0,
                     "Trying to shuffle an entity, but no matching one in the list!");

        this.entityList.splice(index_to_splice, 1);
        this.entityList.push(gameEntity);

        //Update list.
        index_to_splice = this.entityUpdateList.indexOf(gameEntity);
        if (index_to_splice >= 0)
        {
            this.entityUpdateList.splice(index_to_splice, 1);
            this.entityUpdateList.push(gameEntity);
        }

        //Always update list.
        index_to_splice = this.entityAlwaysUpdateList.indexOf(gameEntity);
        if (index_to_splice >= 0)
        {
            this.entityAlwaysUpdateList.splice(index_to_splice, 1);
            this.entityAlwaysUpdateList.push(gameEntity);
        }

        //Draw list.
        index_to_splice = this.entityDrawList.indexOf(gameEntity);
        if (index_to_splice >= 0)
        {
            this.entityDrawList.splice(index_to_splice, 1);
            this.entityDrawList.push(gameEntity);
        }
    },

    applyToEntitiesInGridCellsWithinExtents : function gamespaceApplyToEntitiesInGridCellsWithinExtentsFn(aabbExtents, toApply, appliedMap)
    {
        this.gameGrid.applyToEntitiesWithinExtents(aabbExtents, toApply, appliedMap);

        return appliedMap;
    },

    applyToUpdatingEntitiesInGridCellsWithinExtents : function gamespaceApplyToUpdatingEntitiesInGridCellsWithinExtentsFn(aabbExtents, toApply, appliedMap)
    {
        this.gameGrid.applyToUpdatingEntitiesWithinExtents(aabbExtents, toApply, appliedMap);

        return appliedMap;
    },

    applyToDrawnEntitiesInGridCellsWithinExtents : function gamespaceApplyToDrawnEntitiesInGridCellsWithinExtentsFn(aabbExtents, toApply, appliedMap)
    {
        this.gameGrid.applyToDrawnEntitiesWithinExtents(aabbExtents, toApply, appliedMap);

        return appliedMap;
    },

    applyToEntities : function gameSpaceApplyToEntities(toApply)
    {
        var objectIndex;
        var entList = this.entityList;
        var entListLength = entList.length;
        for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
        {
            toApply(entList[objectIndex]);
        }
    },

    getGameEntityByName : function gameSpaceGetGameEntityByNameFn(entityName)
    {
        return  this.entityMap[entityName];
    },

    //
    //  Physics management.
    //

    addPhysicalCubeTreesToList : function gamespaceAddPhysicalCubeTreesToListFn(cubeTreeList)
    {
        cubeTreeList.push(this.cubeTree);
        cubeTreeList.push(this.cubeTreeDynamic);
    },

    addOpaqueCubeTreesToList : function gamespaceAddOpaqueCubeTreesToListFn(opaqueCubeTreeList)
    {
        opaqueCubeTreeList.push(this.opaqueCubeTree);
        opaqueCubeTreeList.push(this.opaqueCubeTreeDynamic);
    },

    createPhysicalCubeTreeListFromNeighbours : function gamespaceCreatePhysicalCubeTreeListFromNeighboursFn()
    {
        var gsIndex;
        var currentNeighbour;

        var allCubeTreeLists            =   [];
        this.addPhysicalCubeTreesToList(allCubeTreeLists);
        for (gsIndex = 0; gsIndex < this.gsNeighbourList.length; gsIndex += 1)
        {
            currentNeighbour = this.gsNeighbourList[gsIndex];
            if (currentNeighbour && currentNeighbour.roomID > this.roomID)  //TODO rename roomID to spaceID
            {
                currentNeighbour.addPhysicalCubeTreesToList(allCubeTreeLists);
            }
        }

        return allCubeTreeLists;
    },

    updatePhysics : function gameSpaceUpdatePhysicsFn()
    {
        //TODO:
        //Collide with neighboring spaces (with higher Index than I!).

        var md  =   this.globals.mathDevice;

        var currentSphere0;
        var sphereIndex0;

        var sphereList       = this.physSphereList;
        var sphereListLength = sphereList.length;

        var currentCube;
        var overlappingCubeIndex;
        var overlappingCubeListLength;

        var overlappingCubes;

        this.finalizeIfNeeded();

        var current_sphere_centre;

        var allCubeTreeLists = this.createPhysicalCubeTreeListFromNeighbours();

        var sortByClosestAABB = function (a, b)
        {
            return  md.aabbPointDistanceSq(a.cube.extents, current_sphere_centre) - md.aabbPointDistanceSq(b.cube.extents, current_sphere_centre);
        };

        this.getGameGrid().resolvePhysicsSphereCollisions();

        //Deal with Collisions!
        var d_t = this.globals.physTimeStep;

        var cubeTreeIndex;
        for (sphereIndex0 = 0; sphereIndex0 < sphereListLength; sphereIndex0 += 1)
        {
            currentSphere0 = sphereList[sphereIndex0];

            currentSphere0.prePhysicsClear();

            //Now that the sphere is loaded up with all it's accelerations, we'll deal with cubes.
            current_sphere_centre   =   currentSphere0.getv3Location();

            overlappingCubes = [];

            //All the cubes!
            for (cubeTreeIndex = 0; cubeTreeIndex < allCubeTreeLists.length; cubeTreeIndex += 1)
            {
                allCubeTreeLists[cubeTreeIndex].getSphereOverlappingNodes(current_sphere_centre, currentSphere0.getRadius(), overlappingCubes);
            }

            overlappingCubeListLength   =   overlappingCubes.length;

            //Sort them by closest first.
            overlappingCubes.sort(sortByClosestAABB);

            for (overlappingCubeIndex = 0; overlappingCubeIndex < overlappingCubeListLength; overlappingCubeIndex += 1)
            {
                currentCube = overlappingCubes[overlappingCubeIndex].cube;
                if (currentCube.collisionCheck(currentSphere0))
                {
                    currentCube.collisionResolve(currentSphere0, d_t);
                }
            }
        }
    },

    getCollisionInfoForSpheres : function gameSpaceGetCollisionInfoForSpheresFn(v3origin, v3destination, minDistance)
    {
        var md = this.globals.mathDevice;
        var scratchpad = this.scratchpad;
        var returnData = null;

        var callback = function getCollisionInfoForSpheresCallback(currentSphere)
        {
            var currentSpherev3Location =   currentSphere.getv3Location();

            var distanceToIntersect =   md.getLineIntersectSphereOrCapsule(v3origin,
                v3destination,
                currentSpherev3Location,
                currentSphere.getRadius(),
                currentSphere.getCapsuleHeight());

            if (distanceToIntersect && (distanceToIntersect < minDistance || minDistance === undefined))
            {
                minDistance =   distanceToIntersect;

                returnData =
                {
                    v3Location : md.v3Copy(currentSphere.getv3Location(), returnData ? returnData.v3Location : undefined),
                    v3Normal : md.v3Normalize(md.v3Sub(v3origin, currentSpherev3Location, returnData ? returnData.v3Normal : undefined), returnData ? returnData.v3Normal : undefined),
                    distance : distanceToIntersect,
                    collidedEntity : currentSphere.entity
                };
            }
        };

        var extents = scratchpad.aabbExtents = md.aabbBuild(
            Math.min(v3origin[0],  v3destination[0]),
            Math.min(v3origin[1],  v3destination[1]),
            Math.min(v3origin[2],  v3destination[2]),
            Math.max(v3origin[0],  v3destination[0]),
            Math.max(v3origin[1],  v3destination[1]),
            Math.max(v3origin[2],  v3destination[2]),
            scratchpad.aabbExtents);

        this.getGameGrid().applyToPhysicsSpheresWithinExtents(extents, callback);

        return returnData;
    },

    getOverlappingSpheres : function gameSpaceGetOverlappingSpheresFn(aabb, overlappingSpheres)
    {
        var md  =   this.globals.mathDevice;

        var currentSphere;
        var sphereIndex;
        var sphereList       = this.physSphereList;
        var sphereListLength = sphereList.length;

        if (overlappingSpheres === undefined)
        {
            overlappingSpheres = [];
        }

        if (aabb && md)
        {
            for (sphereIndex = 0; sphereIndex < sphereListLength; sphereIndex += 1)
            {
                currentSphere = sphereList[sphereIndex];

                if (currentSphere)
                {
                    if (md.aabbSphereOverlaps(aabb, currentSphere.getv3Location(), currentSphere.getRadius()))
                    {
                        overlappingSpheres.push(currentSphere);
                    }
                }

            }
        }

        return overlappingSpheres;
    },

    //
    //  Physics Spheres
    //
    addPhysicsSphere : function gameSpaceAddPhysicsSphereFn(physicsSphere)
    {
        this.physSphereList.push(physicsSphere);
    },

    removePhysicsSphere : function gameSpaceRemovePhysicsSphereFn(physicsSphere)
    {
        var index_to_splice = this.physSphereList.indexOf(physicsSphere);

        debug.assert(index_to_splice >= 0,
                     "Trying to remove a physics sphere, but no matching one in the list!");

        this.physSphereList.splice(index_to_splice, 1);
    },

    //
    //  Physics Cubes
    //
    addBlock : function gamespaceAddBlockFn(block)
    {
        this.blockList.push(block);
    },

    addCube : function gameSpaceAddCube(collisionCube)
    {
        this.cubeList.push(collisionCube);

        if (collisionCube.physical)
        {
            if (collisionCube.stationary)
            {
                this.cubeTree.add(collisionCube.physical, collisionCube.extents);
                this.cubeTreeDirty = true;
            }
            else
            {
                this.cubeTreeDynamic.add(collisionCube.physical, collisionCube.extents);
                this.cubeTreeDynamicDirty = true;
            }
        }

        if (collisionCube.opaque)
        {
            if (collisionCube.stationary)
            {
                this.opaqueCubeTree.add(collisionCube.opaque, collisionCube.extents);
                this.opaqueCubeTreeDirty = true;
            }
            else
            {
                this.opaqueCubeTreeDynamic.add(collisionCube.opaque, collisionCube.extents);
                this.opaqueCubeTreeDynamicDirty = true;
            }
        }

//        if (!collisionCube.ignoringCollision)
//        {
//            if (collisionCube.terrainType)
//            {
//                this.addCubeToNavGrids(collisionCube);
//            }
//
//            if (collisionCube.isBlock())
//            {
//                this.addCubeToHeightGrid(collisionCube);
//                this.heightGridDirty = true;
//            }
//        }
    },

    movedCube : function gameSpaceMovedCube(collisionCube)
    {
        if (collisionCube.physical)
        {
            this.cubeTreeDynamic.update(collisionCube.physical, collisionCube.extents);
            this.cubeTreeDynamicDirty = true;
        }
        if (collisionCube.opaque)
        {
            this.opaqueCubeTreeDynamic.update(collisionCube.opaque, collisionCube.extents);
            this.opaqueCubeTreeDynamicDirty = true;
        }
    },

    removeBlock : function gamespaceRemoveBlockFn(block)
    {
        var index_to_splice = this.blockList.indexOf(block);

        debug.assert(index_to_splice >= 0,
            "Trying to remove a block, but no matching one in the list.");

        this.blockList.splice(index_to_splice, 1);
    },

    removeCube : function gameSpaceRemoveCube(collisionCube)
    {
        var index_to_splice = this.cubeList.indexOf(collisionCube);

        debug.assert(index_to_splice >= 0,
            "Trying to remove a cube, but no matching one in the list.");

        this.cubeList.splice(index_to_splice, 1);

        if (collisionCube.physical)
        {
            if (collisionCube.stationary)
            {
                this.cubeTree.remove(collisionCube.physical);
                this.cubeTreeDirty = true;
            }
            else
            {
                this.cubeTreeDynamic.remove(collisionCube.physical);
                this.cubeTreeDynamicDirty = true;
            }
        }

        if (collisionCube.opaque)
        {
            if (collisionCube.stationary)
            {
                this.opaqueCubeTree.remove(collisionCube.opaque);
                this.opaqueCubeTreeDirty = true;
            }
            else
            {
                this.opaqueCubeTreeDynamic.remove(collisionCube.opaque);
                this.opaqueCubeTreeDynamicDirty = true;
            }
        }

//        if (!collisionCube.ignoringCollision)
//        {
//            if (collisionCube.terrainType)
//            {
//                this.removeCubeFromNavGrids(collisionCube);
//            }
//
//            if (collisionCube.isBlock())
//            {
//                this.removeCubeFromHeightGrid(collisionCube);
//                this.heightGridDirty = true;
//            }
//        }
    },

    finalizeIfNeeded : function gameSpaceFinalizeIfNeededFn()
    {
        if (this.navGridsDirty)
        {
            this.navGridEnemyWeighted.finalise();
            this.navGridHeroWeighted.finalise();
            this.navGridsDirty = false;
        }

        if (this.cubeTreeDirty)
        {
            this.cubeTree.finalize();
            this.cubeTreeDirty  =   false;
        }

        if (this.cubeTreeDynamicDirty)
        {
            this.cubeTreeDynamic.finalize();
            this.cubeTreeDynamicDirty   =   false;
        }

        if (this.opaqueCubeTreeDirty)
        {
            this.opaqueCubeTree.finalize();
            this.opaqueCubeTreeDirty  =   false;
        }

        if (this.opaqueCubeTreeDynamicDirty)
        {
            this.opaqueCubeTreeDynamic.finalize();
            this.opaqueCubeTreeDynamicDirty   =   false;
        }

        if (this.heightGridDirty)
        {
            this.heightGridDirty = false;

            var extentsList = this.heightGridExtentsRequiringRecalcList;
            this.heightGridExtentsRequiringRecalcList = [];

            var heightGrid = this.getHeightGrid();
            var mathDevice = this.globals.mathDevice;

            var extentsListLength = extentsList.length;

            var extentsIndex;

            for (extentsIndex = 0; extentsIndex < extentsListLength; extentsIndex += 1)
            {
                var extents = extentsList[extentsIndex];
                var v2GridLocationMin = mathDevice.v2Build(extents[0], extents[1]);
                var v2GridLocationMax = mathDevice.v2Build(extents[2], extents[3]);

                this.recalculateHeightGridArea(heightGrid, v2GridLocationMin, v2GridLocationMax);
            }
        }
    },

    clearBlocks : function gamespaceClearBlocksFn()
    {
        var blockList = this.blockList;

        var block;

        while (blockList.length)
        {
            block = blockList[0];
            block.removeFromGameSpace(this);
            block.destroy();
        }

        blockList.length = 0;
        this.blockList = null;
    },

    //
    //  Lights
    //
    addLight : function gameSpaceAddLight(light)
    {
        this.lightList.push(light);

        if (this.getActive())
        {
            light.triggerOn(true);
        }
    },

    removeLight : function gameSpaceAddLight(light)
    {
        var index_to_splice = this.lightList.indexOf(light);
        if (index_to_splice >= 0)
        {
            this.lightList.splice(index_to_splice, 1);
        }
    },

    fadeLights : function gameSpaceFadeLightsFn(onTarget, forceUpdate)
    {
        var lightIndex;
        var lightList = this.lightList;
        var lightListLength = lightList.length;
        var thisLight;

        //TODO, stop doing this when done.
        for (lightIndex = 0; lightIndex < lightListLength; lightIndex += 1)
        {
            thisLight   =   lightList[lightIndex];
            if (thisLight.getInstant())
            {
                thisLight.triggerOn(onTarget);
                if (forceUpdate)
                {
                    thisLight.update();
                }
            }
        }
    },

    //
    // NavGrids
    //
    getNavGrid : function gameSpaceGetNavGridFn(factionName)
    {
        if (factionName === this.enemyFactionName)
        {
            return this.navGridEnemyWeighted;
        }
        else
        {
            return this.navGridHeroWeighted;
        }
    },

    getNavGridHeroWeighted : function gamespaceGetNavGridHeroWeightedFn()
    {
        return this.navGridHeroWeighted;
    },

    getNavGridEnemyWeighted : function gamespaceGetNavGridEnemyWeightedFn()
    {
        return this.navGridEnemyWeighted;
    },

    getRefCountGrid : function gamespaceGetRefCountGridFn(factionName)
    {
        if (factionName === this.enemyFactionName)
        {
            return this.enemyRefCountGrid;
        }
        else
        {
            return this.heroRefCountGrid;
        }
    },

    getHeightGrid : function gamespaceGetHeightGridFn()
    {
        return this.heightGrid;
    },

    getHeroRefCountGrid : function gamespaceGetHeroRefCountGridFn()
    {
        return this.heroRefCountGrid;
    },

    getEnemyRefCountGrid : function gamespaceGetRefCountGridFn()
    {
        return this.enemyRefCountGrid;
    },

    getV3WorldLocationFromV2GridLocation : function gameSpaceGetV3WorldLocationFromV2GridLocationFn(v2GridLocation)
    {
        var md = this.globals.mathDevice;
        var v3GridToWorldOffset = this.v3GridToWorldOffset;
        var heightGrid = this.getHeightGrid();

        var v3WorldLocation = md.v3Build(v2GridLocation[0],
                                         0.0,
                                         v2GridLocation[1]);

        md.v3Add(v3GridToWorldOffset, v3WorldLocation, v3WorldLocation);

        v3WorldLocation[1] = heightGrid[v2GridLocation[0]][v2GridLocation[1]];

        return v3WorldLocation;
    },

    getV2GridLocationFromV3WorldLocation : function gameSpaceGetV2GridLocationFromV3WorldLocationFn(v3WorldLocation)
    {
        var md                  = this.globals.mathDevice;
        var v3WorldToGridOffset = this.v3WorldToGridOffset;

        return md.v2Build(Math.floor(v3WorldLocation[0] + v3WorldToGridOffset[0]),
                                        Math.floor(v3WorldLocation[2] + v3WorldToGridOffset[2]));
    },

    clampV2GridLocation : function gamespaceClampV2GridLocationFn(v2GridLocation)
    {
        var md = this.globals.mathDevice;

        var navGrid = this.getNavGridHeroWeighted();

        var maxX = Math.max(0, (navGrid.getGridSizeX() - 1));
        var maxY = Math.max(0, (navGrid.getGridSizeY() - 1));

        return md.v2Clamp(v2GridLocation, md.v2BuildZero(), md.v2Build(maxX, maxY));
    },

    v2GridLocationListToV3WorldLocationList : function gameSpaceV2GridLocationListToV3WorldLocationListFn(v2GridLocationList)
    {
        var listLength = v2GridLocationList.length;

        var mathDevice = this.globals.mathDevice;
        var v3GridToWorldOffset = this.v3GridToWorldOffset;
        var heightGrid = this.getHeightGrid();

        var v3List = [];

        var listIndex;
        var v2Location;
        var v3Location;

        for (listIndex = 0; listIndex < listLength; listIndex += 1)
        {
            v2Location = v2GridLocationList[listIndex];

            v3Location = mathDevice.v3Build(v2Location[0], 0.0, v2Location[1]);
            mathDevice.v3Add(v3GridToWorldOffset, v3Location, v3Location);
            v3Location[1] = heightGrid[v2Location[0]][v2Location[1]];

            v3List.push(v3Location);
        }

        return v3List;
    },

    addCubeToNavGrids : function gameSpaceAddCubeToNavGridsFn(collisionCube)
    {
        this.navGridsDirty = true;

        var md = this.globals.mathDevice;
        var cubeExtents = collisionCube.extents;

        // We add a delta to slightly reduce the x/z extents
        // This stops extents which lie on the grid boundary from being positioned in the next grid square
        var delta = 0.01;

        var v3MinExtent = md.v3Build(cubeExtents[0],
            cubeExtents[1],
            cubeExtents[2]);

        var v3MaxExtent = md.v3Build((cubeExtents[3] - delta),
            cubeExtents[4],
            (cubeExtents[5] - delta));

        var v2GridLocationMin = this.getV2GridLocationFromV3WorldLocation(v3MinExtent);
        var v2GridLocationMax = this.getV2GridLocationFromV3WorldLocation(v3MaxExtent);

        var terrainTypeName = collisionCube.terrainType;
        var heroTerrainCost = GameSpace.heroFactionTerrainTypes[terrainTypeName];
        var enemyTerrainCost = GameSpace.enemyFactionTerrainTypes[terrainTypeName];

        var navGridHeroWeighted = this.getNavGridHeroWeighted();
        var navGridEnemyWeighted = this.getNavGridEnemyWeighted();
        var heroRefCountGrid = this.getHeroRefCountGrid();
        var enemyRefCountGrid = this.getEnemyRefCountGrid();

        // Update hero navgrid
        if (heroTerrainCost !== GameSpace.terrainTypes.impass)
        {
            this.addTerrainCostToNavGridArea(navGridHeroWeighted, v2GridLocationMin, v2GridLocationMax, heroTerrainCost);
        }
        else
        {
            this.setNavGridArea(navGridHeroWeighted, v2GridLocationMin, v2GridLocationMax, GameSpace.terrainTypes.impass);
        }

        // Update enemy navgrid
        if (enemyTerrainCost !== GameSpace.terrainTypes.impass)
        {
            this.addTerrainCostToNavGridArea(navGridEnemyWeighted, v2GridLocationMin, v2GridLocationMax, enemyTerrainCost);
        }
        else
        {
            this.setNavGridArea(navGridEnemyWeighted, v2GridLocationMin, v2GridLocationMax, GameSpace.terrainTypes.impass);
        }

        // Update reference count grids
        heroRefCountGrid.addToArea(v2GridLocationMin, v2GridLocationMax, 1);
        enemyRefCountGrid.addToArea(v2GridLocationMin, v2GridLocationMax, 1);
    },

    addCubeToHeightGrid : function gamespaceAddCubeToHeightGridFn(collisionCube)
    {
        var md = this.globals.mathDevice;
        var cubeExtents = collisionCube.extents;

        // We shrink the extents by a delta so that only grid squares which are more than half covered get included
        // This matches the ray casting used to remove cubes from the height grid as they point sample in the middle
        // of grid squares
        var delta = 0.49;

        var minExtentsX = (cubeExtents[0] + delta);
        var maxExtentsX = (cubeExtents[3] - delta);
        var minExtentsZ = (cubeExtents[2] + delta);
        var maxExtentsZ = (cubeExtents[5] - delta);

        var sizeX = Math.abs(cubeExtents[3] - cubeExtents[0]);
        if (sizeX < delta * 2)
        {
            minExtentsX = maxExtentsX = ((cubeExtents[0] + cubeExtents[3]) / 2);
        }

        var sizeZ = Math.abs(cubeExtents[5] - cubeExtents[1]);
        if (sizeZ < delta * 2)
        {
            minExtentsZ = maxExtentsZ = ((cubeExtents[1] + cubeExtents[5]) / 2);
        }

        var v3MinExtent = md.v3Build(minExtentsX, cubeExtents[1], minExtentsZ);
        var v3MaxExtent = md.v3Build(maxExtentsX, cubeExtents[4], maxExtentsZ);

        var v2GridLocationMin = this.getV2GridLocationFromV3WorldLocation(v3MinExtent);
        var v2GridLocationMax = this.getV2GridLocationFromV3WorldLocation(v3MaxExtent);

        v2GridLocationMin = this.clampV2GridLocation(v2GridLocationMin);
        v2GridLocationMax = this.clampV2GridLocation(v2GridLocationMax);

        // Update height grid
        var heightGrid = this.getHeightGrid();
        Array2D.setAreaToValueIfGreater(heightGrid, v2GridLocationMin, v2GridLocationMax, v3MaxExtent[1]);
    },

    removeCubeFromNavGrids : function gameSpaceRemoveCubeFromNavGridsFn(collisionCube)
    {
        this.navGridsDirty = true;

        var md = this.globals.mathDevice;
        var cubeExtents = collisionCube.extents;

        // We add a delta to slightly reduce the extents
        // This stops extents which lie on the grid boundary from being positioned in the next grid square
        var delta = 0.01;

        var v3MinExtent = md.v3Build(cubeExtents[0],
                                     cubeExtents[1],
                                     cubeExtents[2]);

        var v3MaxExtent = md.v3Build((cubeExtents[3] - delta),
                                     (cubeExtents[4] - delta),
                                     (cubeExtents[5] - delta));

        var v2GridLocationMin = this.getV2GridLocationFromV3WorldLocation(v3MinExtent);
        var v2GridLocationMax = this.getV2GridLocationFromV3WorldLocation(v3MaxExtent);

        var terrainTypeName = collisionCube.terrainType;
        var heroTerrainCost = GameSpace.heroFactionTerrainTypes[terrainTypeName];
        var enemyTerrainCost = GameSpace.enemyFactionTerrainTypes[terrainTypeName];

        var navGridHeroWeighted = this.getNavGridHeroWeighted();
        var navGridEnemyWeighted = this.getNavGridEnemyWeighted();
        var heroRefCountGrid = this.getHeroRefCountGrid();
        var enemyRefCountGrid = this.getEnemyRefCountGrid();

        // Update terrain navgrids
        this.addTerrainCostToNavGridArea(navGridHeroWeighted, v2GridLocationMin, v2GridLocationMax, -heroTerrainCost);
        this.addTerrainCostToNavGridArea(navGridEnemyWeighted, v2GridLocationMin, v2GridLocationMax, -enemyTerrainCost);

        // Update reference count grids
        heroRefCountGrid.addToArea(v2GridLocationMin, v2GridLocationMax, -1);
        enemyRefCountGrid.addToArea(v2GridLocationMin, v2GridLocationMax, -1);

        // Update navgrids using reference count (set to pass only where reference count if 0)
        var heroRefCountGridArray = heroRefCountGrid.getGridArray();
        this.setNavGridAreaForReferenceCount(navGridHeroWeighted, heroRefCountGridArray, v2GridLocationMin, v2GridLocationMax, GameSpace.terrainTypes.pass, 0);
        var enemyRefCountGridArray = enemyRefCountGrid.getGridArray();
        this.setNavGridAreaForReferenceCount(navGridEnemyWeighted, enemyRefCountGridArray, v2GridLocationMin, v2GridLocationMax, GameSpace.terrainTypes.pass, 0);
    },

    removeCubeFromHeightGrid : function gamespaceRemoveCubeFromHeightGridFn(collisionCube)
    {
        var md = this.globals.mathDevice;
        var cubeExtents = collisionCube.extents;

        // We add a delta to slightly reduce the extents
        // This stops extents which lie on the grid boundary from being positioned in the next grid square
        var delta = 0.01;

        var v3MinExtent = md.v3Build(cubeExtents[0],
            cubeExtents[1],
            cubeExtents[2]);

        var v3MaxExtent = md.v3Build((cubeExtents[3] - delta),
            (cubeExtents[4] - delta),
            (cubeExtents[5] - delta));

        var v2GridLocationMin = this.getV2GridLocationFromV3WorldLocation(v3MinExtent);
        var v2GridLocationMax = this.getV2GridLocationFromV3WorldLocation(v3MaxExtent);

        // Set height grid as dirty and store extents which need to be updated
        this.heightGridDirty = true;
        var pendingExtents = md.v4Build(
            v2GridLocationMin[0], v2GridLocationMin[1], v2GridLocationMax[0], v2GridLocationMax[1]);
        this.heightGridExtentsRequiringRecalcList.push(pendingExtents);
    },

    recalculateHeightGridArea : function gamespaceRecalculateHeightGridAreaFn(heightGrid, v2GridLocationMin, v2GridLocationMax)
    {
        var mathDevice = this.globals.mathDevice;
        var gameManager = this.gameManager;

        var gameSpaceExtents = this.getExtents();
        var v3MinExtents = mathDevice.v3Build(gameSpaceExtents[1], gameSpaceExtents[1], gameSpaceExtents[2]);
        var v3MaxExtents = mathDevice.v3Build(gameSpaceExtents[3], gameSpaceExtents[4], gameSpaceExtents[5]);

        var gameSpaceMaxY = v3MaxExtents[1];
        var gameSpaceMinY = v3MinExtents[1];

        var v3GridToWorldOffset = this.v3GridToWorldOffset;

        var heightGridSizeX = heightGrid.length;
        var heightGridSizeY = heightGrid[0].length;

        var minIndexX = Math.min(v2GridLocationMin[0], v2GridLocationMax[0]);
        var maxIndexX = (Math.max(v2GridLocationMin[0], v2GridLocationMax[0]) + 1);
        var minIndexY = Math.min(v2GridLocationMin[1], v2GridLocationMax[1]);
        var maxIndexY = (Math.max(v2GridLocationMin[1], v2GridLocationMax[1]) + 1);

        minIndexX = mathDevice.clamp(minIndexX, 0, heightGridSizeX);
        maxIndexX = mathDevice.clamp(maxIndexX, 0, heightGridSizeX);
        minIndexY = mathDevice.clamp(minIndexY, 0, heightGridSizeY);
        maxIndexY = mathDevice.clamp(maxIndexY, 0, heightGridSizeY);

        var collisionHeight;
        var i;
        var j;

        for (i = minIndexX; i < maxIndexX; i += 1)
        {
            for (j = minIndexY; j < maxIndexY; j += 1)
            {
                var v3Origin = mathDevice.v3Add(v3GridToWorldOffset, mathDevice.v3Build(i, 0, j));
                v3Origin[1] = gameSpaceMaxY;

                var v3Destination = mathDevice.v3Copy(v3Origin);
                v3Destination[1] = gameSpaceMinY;

                var collisionInfo = gameManager.getCollisionInfo(v3Origin, v3Destination, false);

                if (collisionInfo)
                {
                    collisionHeight = collisionInfo.v3Location[1];
                }
                else
                {
                    collisionHeight = gameSpaceMinY;
                }

                heightGrid[i][j] = collisionHeight;
            }
        }
    },

    setNavGridArea : function gamespaceSetNavGridAreaFn(navGrid, v2GridLocationMin, v2GridLocationMax, elementValue)
    {
        var md = this.globals.mathDevice;

        var minIndexX = v2GridLocationMin[0];
        var minIndexY = v2GridLocationMin[1];

        var maxIndexX = v2GridLocationMax[0] + 1;
        var maxIndexY = v2GridLocationMax[1] + 1;

        var v2GridLocation = md.v2Build(0.0, 0.0);

        var indexX;
        var indexY;

        for (indexX = minIndexX; indexX < maxIndexX; indexX += 1)
        {
            for (indexY = minIndexY; indexY < maxIndexY; indexY += 1)
            {
                md.v2Build(indexX, indexY, v2GridLocation);

                navGrid.setElementValue(v2GridLocation, elementValue);
            }
        }
    },

    addTerrainCostToNavGridArea : function gamespaceAddTerrainCostToNavGridAreaFn(navGrid, v2GridLocationMin, v2GridLocationMax, elementValue)
    {
        var md = this.globals.mathDevice;

        var minIndexX = v2GridLocationMin[0];
        var minIndexY = v2GridLocationMin[1];

        var maxIndexX = v2GridLocationMax[0] + 1;
        var maxIndexY = v2GridLocationMax[1] + 1;

        var v2GridLocation = md.v2Build(0.0, 0.0);

        var indexX;
        var indexY;

        for (indexX = minIndexX; indexX < maxIndexX; indexX += 1)
        {
            for (indexY = minIndexY; indexY < maxIndexY; indexY += 1)
            {
                md.v2Build(indexX, indexY, v2GridLocation);

                navGrid.addElementValue(v2GridLocation, elementValue);
            }
        }
    },

    setNavGridAreaForReferenceCount : function gamespaceSetNavGridAreaForReferenceCountFn(navGrid, navReferenceCountArray, v2GridLocationMin, v2GridLocationMax, elementValue, referenceCount)
    {
        var md = this.globals.mathDevice;

        var minIndexX = v2GridLocationMin[0];
        var minIndexY = v2GridLocationMin[1];

        var maxIndexX = v2GridLocationMax[0] + 1;
        var maxIndexY = v2GridLocationMax[1] + 1;

        var gridSizeX = navGrid.getGridSizeX();
        var gridSizeY = navGrid.getGridSizeY();

        minIndexX = md.clamp(minIndexX, 0, gridSizeX);
        maxIndexX = md.clamp(maxIndexX, 0, gridSizeX);
        minIndexY = md.clamp(minIndexY, 0, gridSizeY);
        maxIndexY = md.clamp(maxIndexY, 0, gridSizeY);

        var v2GridLocation = md.v2Build(0.0, 0.0);

        var indexX;
        var indexY;

        for (indexX = minIndexX; indexX < maxIndexX; indexX += 1)
        {
            for (indexY = minIndexY; indexY < maxIndexY; indexY += 1)
            {
                if (navReferenceCountArray[indexX][indexY] === referenceCount)
                {
                    md.v2Build(indexX, indexY, v2GridLocation);

                    navGrid.setElementValue(v2GridLocation, elementValue);
                }
            }
        }
    },

    getTraversableLocationListInRadius : function gamespaceGetTraversableLocationListInRadiusFn(
        v3Location, radius, factionName)
    {
        var refCountGrid = this.getRefCountGrid(factionName);

        var v2GridLocation = this.getV2GridLocationFromV3WorldLocation(v3Location);
        var v2LocationList = refCountGrid.getV2TraversableLocationListWithinArea(v2GridLocation, radius);

        return this.v2GridLocationListToV3WorldLocationList(v2LocationList);
    },

    //
    //  General
    //

    // Gamespace is active if any player is nearby, or if the gamespace has never been updated
    getActive : function gameSpaceGetActiveFn()
    {
        return  this.getHeroCount() > 0;
    },

    update : function gameSpaceUpdateFn()
    {
        if (!this.getActive())
        {
            return;
        }

        this.updateFadeIn();

        //Update physics?
        Profile.start('Update - Physics');
        this.updatePhysics();
        Profile.stop('Update - Physics');

        Profile.start('Update - Entities');
        this.updateEntities();
        Profile.stop('Update - Entities');

        this.gameManager.activeSpaceCount   +=  1;
    },

    draw : function gameSpaceDrawFn()
    {
        Profile.start('Draw - Entities');
        this.drawEntities();
        Profile.stop('Draw - Entities');
    },

    drawEntities : function gamespaceDrawEntitiesFn()
    {
        this.drawAllDrawnEntities();
    },

    drawAllDrawnEntities : function gamespaceDrawAllDrawnEntitiesFn()
    {
        var objectIndex;
        var entList = this.entityDrawList;
        var entListLength = entList.length;

        for (objectIndex = entListLength - 1; objectIndex >= 0; objectIndex -= 1)
        {
            entList[objectIndex].draw();
        }
    },

    drawEntitiesInList : function gamespaceDrawEntitiesInListFn(entityList)
    {
        var entityListLength = entityList.length;
        var entityListIndex;

        for (entityListIndex = 0; entityListIndex < entityListLength; entityListIndex += 1)
        {
            entityList[entityListIndex].draw();
        }
    },

    drawDebug : function gameSpaceDrawDebugFn(ecMask)
    {
        var entList        = this.entityList;
        var entListLength  = entList.length;
        var globals        = this.globals;
        var dd             = globals.debugDraw;
        var debugDrawFlags = globals.debugDrawFlags;

        var objectIndex;

        var navGridHeroWeighted;
        var navGridEnemyWeighted;
        var heroRefCountGrid;
        var enemyRefCountGrid;
        var gameGrid;

        if (this.getActive())
        {
            dd.drawDebugExtents(this.extents, 1.0, 1.0, 1.0);

            for (objectIndex = 0; objectIndex < entListLength; objectIndex += 1)
            {
                entList[objectIndex].drawDebug(ecMask);
            }

            // Draw navGrid(s)

            if (debugDrawFlags.navGridHeroWeighted)
            {
                navGridHeroWeighted = this.getNavGridHeroWeighted();
                navGridHeroWeighted.debugDraw(this.navGridDebugDrawHeight);
            }

            if (debugDrawFlags.navGridEnemyWeighted)
            {
                navGridEnemyWeighted = this.getNavGridEnemyWeighted();
                navGridEnemyWeighted.debugDraw(this.navGridDebugDrawHeight);
            }

            if (debugDrawFlags.heroRefCountGrid)
            {
                heroRefCountGrid = this.getEnemyRefCountGrid();
                heroRefCountGrid.debugDraw(this.navGridDebugDrawHeight);
            }

            if (debugDrawFlags.enemyRefCountGrid)
            {
                enemyRefCountGrid = this.getEnemyRefCountGrid();
                enemyRefCountGrid.debugDraw(this.navGridDebugDrawHeight);
            }

            if (debugDrawFlags.gameGrid)
            {
                gameGrid    =   this.getGameGrid();
                gameGrid.debugDraw(this.navGridDebugDrawHeight);
            }

            if (debugDrawFlags.heightGrid)
            {
                var heightGrid = this.getHeightGrid();
                var simpleSpriteRenderer = globals.simpleSpriteRenderer;
                var mathDevice = globals.mathDevice;
                var v4NormalColour = this.v4HeightGridCellColourDefault;
                var v4AltColour = this.v4HeightGridCellColourAlt;
                var elementTexture = this.heightGridElementTexture;

                Array2D.debugDrawHeightArray2D(
                    heightGrid, this.v3GridToWorldOffset, 0.5, elementTexture,
                    mathDevice, simpleSpriteRenderer, v4NormalColour, v4AltColour);
            }
            if (debugDrawFlags.nonBuildZones)
            {
                var blockList = this.getBlockList();
                var noBuildBlocksList = blockList.filter(function (block) { return !block.isBuildZone(); });

                noBuildBlocksList.forEach(function (block) {block.drawDebug(); });
            }
        }
        else
        {
            dd.drawDebugExtents(this.extents, 0.5, 0.5, 0.5);
        }

    },

    drawDebugPhysics : function gameSpaceDrawDebugPhysicsFn()
    {
        var index;
        var sphereList      =   this.physSphereList;
        var sphereLength    =   sphereList.length;

        var cubeList        =   this.cubeList;
        var cubeListLength  =   cubeList.length;

        //Draw ecphysics spheres.
        for (index = 0; index < sphereLength; index += 1)
        {
            sphereList[index].drawDebug();
        }

        //Draw world cubes.
        for (index = 0; index < cubeListLength; index += 1)
        {
            cubeList[index].drawDebug();
        }
    },

    //
    //  Grid offset.
    //
    setGridOffset : function gameSpaceSetGridOffsetFn(v3GridOffset)
    {
        var md  =   this.globals.mathDevice;
        md.v3Copy(v3GridOffset, this.v3GridOffset);
    },

    getGridOffset : function gameSpaceGetGridOffsetFn()
    {
        return  this.v3GridOffset;
    },

    snapPositionToGridSquare : function gameSpaceSnapPositionToGridSquareFn(v3Position, shouldSnapVertical)
    {
        var globals = this.globals;
        var mathDevice = globals.mathDevice;
        var v3GridOffset = this.getGridOffset();
        var outputv3Position;

        if (mathDevice && v3Position)
        {
            outputv3Position    =   mathDevice.v3Copy(v3Position);

            if (v3GridOffset)
            {
                outputv3Position[0] = Math.round(outputv3Position[0] - v3GridOffset[0]) + v3GridOffset[0];
                if (shouldSnapVertical)
                {
                    outputv3Position[1] = Math.round(outputv3Position[1] - v3GridOffset[1]) + v3GridOffset[1];
                }
                outputv3Position[2] = Math.round(outputv3Position[2] - v3GridOffset[2]) + v3GridOffset[2];
            }
            else
            {
                outputv3Position[0] = Math.round(outputv3Position[0]);
                if (shouldSnapVertical)
                {
                    outputv3Position[1] = Math.round(outputv3Position[1]);
                }
                outputv3Position[2] = Math.round(outputv3Position[2]);
            }
        }

        return outputv3Position;
    },

    snapPositionToGridLine : function gameSpaceSnapPositionToGridSquareFn(v3Position, shouldSnapVertical, border)
    {
        var globals = this.globals;
        var mathDevice = globals.mathDevice;
        var v3GridOffset = this.getGridOffset();
        var outputv3Position;

        if (mathDevice && v3Position)
        {
            outputv3Position    =   mathDevice.v3Copy(v3Position);

            if (v3GridOffset)
            {
                outputv3Position[0] = Math.floor(outputv3Position[0] - v3GridOffset[0]) + v3GridOffset[0] + 0.5;
                if (shouldSnapVertical)
                {
                    outputv3Position[1] = Math.floor(outputv3Position[1] - v3GridOffset[1]) + v3GridOffset[1] + 0.5;
                }
                outputv3Position[2] = Math.floor(outputv3Position[2] - v3GridOffset[2]) + v3GridOffset[2] + 0.5;
            }
            else
            {
                outputv3Position[0] = Math.floor(outputv3Position[0]) + 0.5;
                if (shouldSnapVertical)
                {
                    outputv3Position[1] = Math.floor(outputv3Position[1]) + 0.5;
                }
                outputv3Position[2] = Math.floor(outputv3Position[2]) + 0.5;
            }
        }

        var aabb = this.extents;
        if (border)
        {
            outputv3Position[0]   =   Math.max(outputv3Position[0], aabb[0] + border);
            outputv3Position[1]   =   Math.max(outputv3Position[1], aabb[1] + border);
            outputv3Position[2]   =   Math.max(outputv3Position[2], aabb[2] + border);
            outputv3Position[0]   =   Math.min(outputv3Position[0], aabb[3] - border);
            outputv3Position[1]   =   Math.min(outputv3Position[1], aabb[4] - border);
            outputv3Position[2]   =   Math.min(outputv3Position[2], aabb[5] - border);
        }

        return outputv3Position;
    },

    addHero : function gameSpaceAddHeroFn()
    {
        this.playerCount +=  1;
    },

    removeHero : function gameSpaceRemoveHeroFn()
    {
        this.playerCount        -=  1;
    },

    updateFadeIn : function gameSpaceUpdateFadeInFn()
    {
        if (this.toFadeUpLights)
        {
            this.fadeLights(true, false);
            this.toFadeUpLights =   undefined;
        }
    },

    getHeroCount : function gameSpaceGetHeroCountFn()
    {
        return  this.playerCount;
    },

    //
    //  Room types.
    //
    getName : function gameSpaceGetNameFn()
    {
        return this.name;
    },

    getBlockList : function gamespaceGetBlockListFn()
    {
        return this.blockList;
    },

    //
    //  Death.
    //
    destroy : function gameSpaceDestroyFn()
    {
        this.clearEntities();

        //Clear cubes.
        this.clearBlocks();

        //Clear phys objects shouldn't be needed. They should have removed themselves from the scene already.
    }
};

// NB. These values are used as weightings by A*, 0 means untraversible terrain
GameSpace.terrainTypes =
{
    impass : 0,
    pass : 1
};

GameSpace.heroFactionTerrainTypes =
{
    pass : GameSpace.terrainTypes.pass,
    impass : GameSpace.terrainTypes.impass,
    wall : GameSpace.terrainTypes.impass,
    gate : GameSpace.terrainTypes.pass,
    building : GameSpace.terrainTypes.impass
};

GameSpace.enemyFactionTerrainTypes =
{
    pass : GameSpace.terrainTypes.pass,
    impass : GameSpace.terrainTypes.impass,
    wall : GameSpace.terrainTypes.impass,
    gate : GameSpace.terrainTypes.impass,
    building : 120
};

GameSpace.create = function gameSpaceCreateFn(name, globals, extents, m43Transform)
{
    var gameSpace = new GameSpace();

    var gameManager = globals.gameManager;
    var md  =   globals.mathDevice;
    if (GameSpace.prototype.globals === undefined)
    {
        GameSpace.prototype.globals = globals;
    }

    gameSpace.gsNeighbourList   =   [];

    //
    //  Entities.
    //
    gameSpace.entityList              = [];
    gameSpace.newEntityList           = [];
    gameSpace.deadEntityList          = [];
    gameSpace.entityMap               = {};
    gameSpace.entityUpdateList        = [];
    gameSpace.entityAlwaysUpdateList  = [];
    gameSpace.entityDrawList          = [];
    gameSpace.toBeDestroyedEntityList = [];
    gameSpace.currentUniqueEntityId   = 0;

    //
    //  Doorways.
    //
    gameSpace.doorways            =   [];
    gameSpace.removedDoors        =   [];
    gameSpace.removedDoorsDelta   =   [];

    gameSpace.doorID              =   0;

    //
    //  Cubes.
    //
    gameSpace.blockList           =   [];
    gameSpace.cubeList            =   [];

    gameSpace.cubeTree            =   AABBTree.create(true);
    gameSpace.cubeTreeDynamic     =   AABBTree.create(false);
    gameSpace.cubeTreeList        =   [
        gameSpace.cubeTree,
        gameSpace.cubeTreeDynamic
    ];

    gameSpace.opaqueCubeTree            =   AABBTree.create(true);
    gameSpace.opaqueCubeTreeDynamic     =   AABBTree.create(false);
    gameSpace.opaqueCubeTreeList        =   [
        gameSpace.opaqueCubeTree,
        gameSpace.opaqueCubeTreeDynamic
    ];

    gameSpace.enemyCount            =   0;
    gameSpace.pickupCount           =   0;
    gameSpace.playerCount           =   0;

    gameSpace.physSphereList        =   [];

    //
    //  Lights
    //
    gameSpace.lightList             =   [];

    gameSpace.gameManager       =   gameManager;

    var v3Centre = md.v3BuildZero();
    var v3HalfExtents = md.v3BuildZero();
    md.aabbGetCenterAndHalf(extents, v3Centre, v3HalfExtents);

    gameSpace.v3Centre          =   v3Centre;
    gameSpace.v3HalfExtents     =   v3HalfExtents;
    gameSpace.extents           =   md.aabbCopy(extents);
    gameSpace.m43FullTransform  =   md.m43Copy(m43Transform);

    // NavGrids - used for pathfinding

    var v3ExtentsMin        = md.v3Build(extents[0], extents[1], extents[2]);
    var v3WorldToGridOffset = md.v3ScalarMul(v3ExtentsMin, -1.0);
    var v3GridToWorldOffset = md.v3ScalarMul(v3WorldToGridOffset, -1.0);

    // We add as grid positions are stored as lower left, but world positions are the centre of the grid square
    v3GridToWorldOffset[0] += 0.5;
//        v3GridToWorldOffset[1] = 0.5;
    v3GridToWorldOffset[2] += 0.5;

    gameSpace.v3WorldToGridOffset = v3WorldToGridOffset;
    gameSpace.v3GridToWorldOffset = v3GridToWorldOffset;
/*
    var navGridSizeX = (2 * v3HalfExtents[0]);
    var navGridSizeY = (2 * v3HalfExtents[2]);

    // This allows pathfinding for enemies (including through destructible entities)
    gameSpace.navGridEnemyWeighted = NavGrid.create(
        globals, navGridSizeX, navGridSizeY, v3GridToWorldOffset, v3WorldToGridOffset);

    // Reference counted grid (stores the number of entities which can block enemies in a grid square)
    gameSpace.enemyRefCountGrid = RefCountGrid.create(
        globals, navGridSizeX, navGridSizeY, v3GridToWorldOffset, v3WorldToGridOffset);

    // This allows pathfinding for hero allies
    gameSpace.navGridHeroWeighted = NavGrid.create(
        globals, navGridSizeX, navGridSizeY, v3GridToWorldOffset, v3WorldToGridOffset);

    // Reference counted grid (stores the number of entities which can block hero allies in a grid square)
    gameSpace.heroRefCountGrid = RefCountGrid.create(
        globals, navGridSizeX, navGridSizeY, v3GridToWorldOffset, v3WorldToGridOffset);

    gameSpace.navGridsDirty = false;
    gameSpace.navGridDebugDrawHeight = v3Centre[1];

    // Height Grid
    gameSpace.heightGrid = Array2D.create(navGridSizeX, navGridSizeY, v3ExtentsMin[1]);
    gameSpace.heightGridExtentsRequiringRecalcList = [];
    gameSpace.v4HeightGridCellColourDefault = [1.0, 0.0, 0.0, 0.3];
    gameSpace.v4HeightGridCellColourAlt = [1.0, 0.0, 0.0, 0.1];
    gameSpace.heightGridElementTexture = 'textures/simple_square.dds';
    gameSpace.heightGridDirty = false;
*/
    //
    //  GameGrid.
    //
    gameSpace.gameGrid          =   GameGrid.create(globals, extents);

    gameSpace.v3GridOffset     = md.v3BuildZero();
    gameSpace.v3GridOffset[0] += Math.abs(v3GridToWorldOffset[0]) % 1;
    gameSpace.v3GridOffset[2] += Math.abs(v3GridToWorldOffset[2]) % 1;

    gameSpace.gridSquarePhysics = true;

    //Naming.
    gameSpace.name = name;

    //
    // Scratch pad var to prevent constant memory allocation
    //
    gameSpace.scratchpad = {};

    return gameSpace;
};
