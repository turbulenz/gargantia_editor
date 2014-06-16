//
//  GameEntity
//
//  A holder entity for a collection of entity components.
//  Holds base, shared info (for example, location).
//

/*global debug: false*/
/*global EntityComponentBase: false*/
/*global guiColors: false*/
/*global Profile: false*/
/*global SimpleBlendStyle: false*/
/*global TWEEN: false*/

function GameEntity() {}

GameEntity.prototype =
{
    activate : function gameentityActivateFn()
    {
        var ecMap = this.eCMap;

        var v3Location = this.getv3Location();
        var gameSpace = this.gameManager.getGameSpace(v3Location);
        this.setGameSpace(gameSpace);

        var ecName;
        var ec;

        for (ecName in ecMap)
        {
            if (ecMap.hasOwnProperty(ecName))
            {
                ec = ecMap[ecName];

                ec.activate();
                ec.setGameSpace(gameSpace);
            }
        }

        this.active             =   true;

        this.addUpdateLists();
        this.sortECUpdateList();

        this.safeToManipulate   =   true;
        this.nextTimeToUpdate   =   0.0;

        this.activateTime       = this.globals.gameCurrentTime;
    },

    getTimeAlive : function gameentityGetTimeAliveFn()
    {
        return this.globals.gameCurrentTime - this.activateTime;
    },

    addECToCustomEntity : function gameentityAddECToCustomEntityFn(entityComponent)
    {
        this.archetypeName = null;
        this.custom        = true;

        this.addEC(entityComponent);
    },

    addEC : function gameEntityAddECFn(entityComponent)
    {
        debug.assert(!this.eCMap[entityComponent.entityComponentName], "Double Adding an EC!");
        debug.assert(!this.active, 'Cannot call addEC on an activated entity.');

        this.eCMap[entityComponent.entityComponentName] = entityComponent;

        entityComponent.attach(this);

        //Done in their attach now.
        //this.eCUpdateList.push(entityComponent);

        this.sortECUpdateList();

        return this;
    },

    removeECFromCustomEntity : function gameEntityRemoveFromCustomEntityEC(entityComponentName)
    {
        debug.assert(this.eCMap[entityComponentName], "Removing an EC that isn't Owned!");

        var entityComponent = this.eCMap[entityComponentName];

        this.archetypeName = null;
        this.custom        = true;

        this.eCMap[entityComponent.entityComponentName] = null;
        delete this.eCMap[entityComponent.entityComponentName];

        var eCIndex =   this.eCUpdateList.indexOf(entityComponent);

        if (eCIndex !== -1)
        {
            this.eCUpdateList.splice(eCIndex, 1);
        }

        this.removeECFromMoveInterest(entityComponent);
        this.removeECFromAlwaysUpdate(entityComponent);
        this.removeECFromDraw(entityComponent);
    },

    addECToMoveInterest : function gameEntityAddECToMoveInterestFn(entityComponent)
    {
        var eCMoveInterestList  =   this.eCMoveInterestList;
        if (eCMoveInterestList.indexOf(entityComponent) === -1)
        {
            eCMoveInterestList.push(entityComponent);
        }
    },

    removeECFromMoveInterest : function gameEntityRemoveECFromMoveInterestFn(entityComponent)
    {
        var eCMoveInterestList  =   this.eCMoveInterestList;
        var ecIndex   =   eCMoveInterestList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            eCMoveInterestList.splice(ecIndex, 1);
        }
    },

    addECToRotateInterest : function gameEntityAddECToRotateInterestFn(entityComponent)
    {
        var eCRotateInterestList  =   this.eCRotateInterestList;
        if (eCRotateInterestList.indexOf(entityComponent) === -1)
        {
            eCRotateInterestList.push(entityComponent);
        }
    },

    removeECFromRotateInterest : function gameEntityRemoveECFromRotateInterestFn(entityComponent)
    {
        var eCRotateInterestList  =   this.eCRotateInterestList;
        var ecIndex   =   eCRotateInterestList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            eCRotateInterestList.splice(ecIndex, 1);
        }
    },

    addECToScaleInterest : function gameEntityAddECToScaleInterestFn(entityComponent)
    {
        var eCScaleInterestList = this.eCScaleInterestList;
        if (eCScaleInterestList.indexOf(entityComponent) === -1)
        {
            eCScaleInterestList.push(entityComponent);
        }
    },

    removeECFromScaleInterest : function gameEntityRemoveECFromScaleInterestFn(entityComponent)
    {
        var eCScaleInterestList = this.eCScaleInterestList;
        var ecIndex = eCScaleInterestList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            eCScaleInterestList.splice(ecIndex, 1);
        }
    },

    addECToUpdate : function gameEntityAddECToUpdateFn(entityComponent)
    {
        var ecIndex   =   this.eCRemoveFromUpdateList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            this.eCRemoveFromUpdateList.splice(ecIndex, 1);
        }

        if (this.safeToManipulate)
        {
            this.addECToUpdateInstant(entityComponent);
        }
        else
        {
            this.addECToUpdateDelayed(entityComponent);
        }
    },

    addECToUpdateInstant : function gameentityAddECToUpdateInstantFn(entityComponent)
    {
        var eCUpdateList  =   this.eCUpdateList;
        if (eCUpdateList.indexOf(entityComponent) === -1)
        {
            eCUpdateList.push(entityComponent);

            if (eCUpdateList.length === 1)
            {
                this.refreshEntityLists();
            }

            this.eCUpdateListDirty  =   true;
        }

        this.refreshNextTimeToUpdate(entityComponent);
    },

    addECToUpdateDelayed : function gameentityAddECToUpdateDelayedFn(entityComponent)
    {
        var eCAddToUpdateList  =   this.eCAddToUpdateList;
        if (eCAddToUpdateList.indexOf(entityComponent) === -1)
        {
            this.eCAddToUpdateList.push(entityComponent);
        }
    },

    removeECFromUpdate : function gameEntityRemoveECFromUpdateFn(entityComponent)
    {
        var ecIndex   =   this.eCAddToUpdateList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            this.eCAddToUpdateList.splice(ecIndex, 1);
        }

        if (this.safeToManipulate)
        {
            this.removeECFromUpdateInstant(entityComponent);
        }
        else
        {
            this.removeECFromUpdateDelayed(entityComponent);
        }
    },

    removeECFromUpdateInstant : function gameentityremoveECFromUpdateInstantFn(entityComponent)
    {
        var eCUpdateList  =   this.eCUpdateList;
        var ecIndex =   eCUpdateList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            eCUpdateList.splice(ecIndex, 1);

            if (eCUpdateList.length === 0)
            {
                this.refreshEntityLists();
            }
        }
    },

    removeECFromUpdateDelayed : function gameentityremoveECFromUpdateDelayedFn(entityComponent)
    {
        var eCRemoveFromUpdateList  =   this.eCRemoveFromUpdateList;
        if (eCRemoveFromUpdateList.indexOf(entityComponent) === -1)
        {
            this.eCRemoveFromUpdateList.push(entityComponent);
        }
    },

    addECToAlwaysUpdate : function gameEntityAddECToAlwaysUpdateFn(entityComponent)
    {
        if (this.eCAlwaysUpdateList.indexOf(entityComponent) === -1)
        {
            this.eCAlwaysUpdateList.push(entityComponent);
            if (this.eCAlwaysUpdateList.length === 1)
            {
                this.refreshEntityLists();
            }
        }
    },

    removeECFromAlwaysUpdate : function gameEntityRemoveECFromAlwaysUpdateFn(entityComponent)
    {
        var ecIndex   =   this.eCAlwaysUpdateList.indexOf(entityComponent);
        if (ecIndex !== -1)
        {
            this.eCAlwaysUpdateList.splice(ecIndex, 1);
            if (this.eCAlwaysUpdateList.length === 0)
            {
                this.refreshEntityLists();
            }
        }
    },

    shouldUpdate : function gameentityShouldUpdateFn()
    {
        return this.eCUpdateList.length > 0;
    },

    shouldAlwaysUpdate : function gameEntityShouldAlwaysUpdateFn()
    {
        return this.eCAlwaysUpdateList.length > 0;
    },

    shouldDraw : function gameEntityShouldDrawFn()
    {
        return this.eCDrawList.length > 0;
    },

    addECToDraw : function gameEntityAddECToDrawFn(entityComponent)
    {
        var eCDrawList  =   this.eCDrawList;
        if (eCDrawList.indexOf(entityComponent) === -1)
        {
            eCDrawList.push(entityComponent);
            if (this.eCDrawList.length === 1)
            {
                this.refreshEntityLists();
            }
        }
    },

    removeECFromDraw : function gameEntityRemoveECFromDrawFn(entityComponent)
    {
        var eCDrawList  =   this.eCDrawList;
        var eCIndex = eCDrawList.indexOf(entityComponent);
        if (eCIndex !== -1)
        {
            eCDrawList.splice(eCIndex, 1);
            if (this.eCDrawList.length === 0)
            {
                this.refreshEntityLists();
            }
        }
    },

    getEC : function gameEntityGetEC(entityComponentName)
    {
        return this.eCMap[entityComponentName];
    },

    hasEC : function gameEntityHasECFn(entityComponentName)
    {
        var hasComponent = false;

        if (this.eCMap[entityComponentName])
        {
            hasComponent = true;
        }

        return hasComponent;
    },

    sortECUpdateList : function gameEntitySortECUpdateListFn()
    {
        var sortBySortPriority = function (a, b)
        {
            return  a.sortPriority - b.sortPriority;
        };

        this.eCUpdateList.sort(sortBySortPriority);
    },

    refreshEntityLists : function gameentityRefreshEntityListsFn()
    {
        var currentGameSpace = this.currentGameSpace;
        if (currentGameSpace)
        {
            currentGameSpace.refreshEntityLists(this);
        }

        var ecGameGridEntity = this.getEC('ECGameGridEntity');
        if (ecGameGridEntity)
        {
            ecGameGridEntity.refresh();
        }
    },

    addUpdateLists : function gameEntityAddUpdateListsFn()
    {
        if (this.eCAddToUpdateList.length === 0)
        {
            return;
        }

        var wasEmpty    =   (this.eCUpdateList.length === 0);

        //Refresh the next time from these new added update lists.
        this.refreshNextTimeToUpdateFromList(this.eCAddToUpdateList);

        this.eCUpdateList.push.apply(this.eCUpdateList, this.eCAddToUpdateList);

        this.eCUpdateListDirty  =   true;

        this.eCAddToUpdateList.length   =   0;

        if (wasEmpty)
        {
            this.refreshEntityLists();
        }
    },

    removeUpdateLists : function gameEntityRemoveUpdateListsFn()
    {
        if (this.eCRemoveFromUpdateList.length === 0)
        {
            return;
        }

        var eCIndex, thisEC;
        var eCRemoveFromUpdateList          =   this.eCRemoveFromUpdateList;
        var eCRemoveFromUpdateListLength    =   eCRemoveFromUpdateList.length;
        var foundIndex;

        var eCUpdateList                    =   this.eCUpdateList;

        for (eCIndex = 0; eCIndex < eCRemoveFromUpdateListLength; eCIndex += 1)
        {
            thisEC  =   eCRemoveFromUpdateList[eCIndex];

            foundIndex   =   eCUpdateList.indexOf(thisEC);
            if (foundIndex !== -1)
            {
                eCUpdateList.splice(foundIndex, 1);
            }
        }

        this.eCRemoveFromUpdateList.length   =   0;

        if (this.eCUpdateList.length === 0)
        {
            this.refreshEntityLists();
        }
    },

    isTimeToUpdate : function gameentityIsTimeToUpdateFn(gameCurrentTime)
    {
        return gameCurrentTime > this.nextTimeToUpdate;
    },

    refreshNextTimeToUpdate : function gameentityRefreshNextTimeToUpdateFn(entityComponent)
    {
        var nextTime    =    entityComponent.getTimeForNextUpdate();
        if (this.nextTimeToUpdate < 0.0)
        {
            this.nextTimeToUpdate   =   nextTime;
        }
        else
        {
            this.nextTimeToUpdate   =   Math.min(this.nextTimeToUpdate, nextTime);
        }
    },

    refreshNextTimeToUpdateFromList : function gameentityRefreshNextTimeToUpdateFromListFn(eCUpdateList)
    {
        var eCIndex;
        var eCUpdateListLength    =   eCUpdateList.length;

        for (eCIndex = 0; eCIndex < eCUpdateListLength; eCIndex += 1)
        {
            this.refreshNextTimeToUpdate(eCUpdateList[eCIndex]);
        }
    },

    manageLargeTimeStep : function gameentitymanageLargeTimeStepFn(timeDelta)
    {
        var eCMap          =   this.eCMap;
        var currentEC;
        var thisECName;

        for (thisECName in eCMap)
        {
            if (eCMap.hasOwnProperty(thisECName))
            {
                currentEC   =   eCMap[thisECName];
                currentEC.manageLargeTimeStep(timeDelta);
            }
        }
    },

    refreshMesh : function gameentityRefreshMeshFn()
    {
        this.flagMovedThisFrame();
        this.flagRotatedThisFrame();
        this.flagScaledThisFrame();

        if (this.getEC('ECMesh'))
        {
            this.getEC('ECMesh').update();
        }
    },

    update : function gameEntityUpdateFn(onScreen, forceUpdate)
    {
        this.flagMovedThisFrame();
        this.flagRotatedThisFrame();
        this.flagScaledThisFrame();

        this.updateCurrentGameSpace();

        var profileECs  =   this.gameManager.profileECs;

        var eCIndex, thisEC;
        var eCUpdateList          =   this.eCUpdateList;
        var eCUpdateListLength    =   eCUpdateList.length;

        this.safeToManipulate   =   false;

        var gameCurrentTime =   this.globals.gameCurrentTime;

        this.nextTimeToUpdate   =   -1.0;

        for (eCIndex = 0; eCIndex < eCUpdateListLength; eCIndex += 1)
        {
            thisEC  =   eCUpdateList[eCIndex];

            if (!thisEC.isTimeToUpdate(gameCurrentTime) && !forceUpdate)
            {
                continue;
            }

            if (profileECs)
            {
                Profile.start('Update - ' + thisEC.entityComponentName);
            }

            thisEC.preUpdate(gameCurrentTime);

            if (onScreen)
            {
                thisEC.update();
            }
            else
            {
                thisEC.updateOffScreen();
            }

            thisEC.postUpdate(gameCurrentTime);

            this.refreshNextTimeToUpdate(thisEC);

            if (profileECs)
            {
                Profile.stop('Update - ' + thisEC.entityComponentName);
            }
        }

        this.safeToManipulate   =   true;

        this.addUpdateLists();
        this.removeUpdateLists();

        if (this.eCUpdateListDirty)
        {
            this.sortECUpdateList();
            this.eCUpdateListDirty  =   false;
        }

        this.gameManager.activeEntityCount   +=  1;

        return this.toBeDestroyed;
    },

    getRadius : function gameEntityGetRadiusFn()
    {
        var radius =   0.0;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
        }
        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            radius =  ecPhysCube.getRadius();
        }

        return  radius;
    },

    getMinRadius : function gameEntityGetMinRadiusFn()
    {
        var radius =   0.0;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
        }
        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            radius =  ecPhysCube.getMinRadius();
        }

        return  radius;
    },

    getDistanceUsingSize : function gameentityGetDistanceUsingSizeFn(v3Location)
    {
        var radius =   0.0;
        var md  =   this.globals.mathDevice;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
            return  md.v3Distance(v3Location, this.getv3Location()) - radius;
        }

        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            return  md.aabbPointDistance(ecPhysCube.getExtents(), v3Location);
        }

        return  md.v3Distance(v3Location, this.getv3Location());
    },

    getDistanceSqUsingSize : function gameentityGetDistanceSqUsingSizeFn(v3Location)
    {
        var radius =   0.0;
        var md  =   this.globals.mathDevice;
        var dist;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
            dist = md.v3Distance(v3Location, this.getv3Location()) - radius;
            return dist * dist;
        }

        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            return  md.aabbPointDistanceSq(ecPhysCube.getExtents(), v3Location);
        }

        return  md.v3DistanceSq(v3Location, this.getv3Location());
    },

    get2DDistanceUsingSize : function gameentityGet2DDistanceUsingSizeFn(v3Location)
    {
        var radius =   0.0;
        var md  =   this.globals.mathDevice;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
            return  md.v3Distance2D(v3Location, this.getv3Location()) - radius;
        }

        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            return  md.aabbPointDistance2D(ecPhysCube.getExtents(), v3Location);
        }

        return  md.v3Distance(v3Location, this.getv3Location());
    },

    get2DDistanceSqUsingSize : function gameentityGet2DDistanceSqUsingSizeFn(v3Location)
    {
        var radius =   0.0;
        var md  =   this.globals.mathDevice;
        var dist;

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
            dist = md.v3Distance2D(v3Location, this.getv3Location()) - radius;
            return dist * dist;
        }

        var ecPhysCube      =   this.getEC('ECPhysicsCube');
        if (ecPhysCube)
        {
            return  md.aabbPointDistance2DSq(ecPhysCube.getExtents(), v3Location);
        }

        return  md.v3DistanceSq(v3Location, this.getv3Location());
    },

    getAabbExtents : function gameentityGetAabbExtentsFn(aabbExtents)
    {
        var radius =   0.0;
        var md  =   this.globals.mathDevice;

        if (!aabbExtents)
        {
            aabbExtents = md.aabbBuildEmpty();
        }

        var ecPhysSphere    =   this.getEC('ECPhysicsSphere');
        if (ecPhysSphere)
        {
            radius =   ecPhysSphere.getRadius();
            aabbExtents = md.aabbBuildFromCentreRadius(this.getv3Location(), radius, aabbExtents);
        }
        else
        {
            var ecPhysCube      =   this.getEC('ECPhysicsCube');
            if (ecPhysCube)
            {
                aabbExtents = md.aabbCopy(ecPhysCube.getExtents(), aabbExtents);
            }
        }

        return  aabbExtents;
    },

    shouldBeDestroyed : function gameEntityShouldBeDestroyedFn()
    {
        return  this.toBeDestroyed;
    },

    draw : function gameEntityDrawFn()
    {
        var eCDrawList          =   this.eCDrawList;
        var eCDrawListLength    =   eCDrawList.length;
        var eCIndex, thisEC;

        for (eCIndex = eCDrawListLength - 1; eCIndex >= 0; eCIndex -= 1)
        {
            thisEC  =   eCDrawList[eCIndex];

            thisEC.draw();
        }

        if (eCDrawList.length === 0)
        {
            this.refreshEntityLists();
        }
    },

    drawDebug : function gameEntityDrawDebugFn(ecMask)
    {
        var ecMap          = this.eCMap;
        var debugDrawFlags = this.globals.debugDrawFlags;

        var ec;
        var ecName;

        if (ecMask)
        {
            for (ecName in ecMap)
            {
                if (ecMap.hasOwnProperty(ecName))
                {
                    // We only drawDebug the EC if specified in the mask
                    if (ecMask[ecName])
                    {
                        ec = ecMap[ecName];
                        ec.drawDebug();
                    }
                }
            }
        }
        else
        {
            for (ecName in ecMap)
            {
                if (ecMap.hasOwnProperty(ecName))
                {
                    ec = ecMap[ecName];
                    ec.drawDebug();
                }
            }
        }

        if (debugDrawFlags.entityNames && this.name)
        {
            this.drawWorldText(this.name);
        }

        if (debugDrawFlags.entitySmartPointers && this.smartPointer)
        {
            this.drawWorldText('' + this.smartPointer.smartPointerIndex, 1);
        }
    },

    appendToName : function gameEntityAppendToNameFn(appendString)
    {
        this.name   =   this.name + appendString;
    },

    getv3Location : function gameEntityGetV3Location()
    {
        return  this.v3Location;
    },

    getv3Velocity : function gameentityGetv3VelocityFn()
    {
        var ecPhysicsSphere =   this.getEC('ECPhysicsSphere');
        if (ecPhysicsSphere)
        {
            return  ecPhysicsSphere.getv3Velocity();
        }

        var ecProjectile    =   this.getEC('ECProjectile');
        if (ecProjectile)
        {
            return  ecProjectile.getv3Velocity();
        }
        return  undefined;
    },

    getCentreLocation : function gameEntityGetCentreLocationFn()
    {
        var md = this.globals.mathDevice;

        var offset  =   0.25;
        this.scratchpad.v3CenterLocation = md.v3Copy(this.getv3Location(), this.scratchpad.v3CenterLocation);
        this.scratchpad.v3CenterLocation[1] += offset;

        return this.scratchpad.v3CenterLocation;
    },

    getv3BottomLocation : function gameEntityGetv3BottomLocationFn()
    {
        var ecPhysicsCube;
        var ecPhysicsSphere;

        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;

        ecPhysicsCube = this.getEC('ECPhysicsCube');
        if (ecPhysicsCube)
        {
            scratchpad.v3BottomLocation = mathDevice.v3Copy(ecPhysicsCube.getv3BottomLocation(), scratchpad.v3BottomLocation);
        }
        else
        {
            ecPhysicsSphere = this.getEC('ECPhysicsSphere');
            if (ecPhysicsSphere)
            {
                scratchpad.v3BottomLocation = mathDevice.v3Copy(this.getv3Location(), scratchpad.v3BottomLocation);
                scratchpad.v3BottomLocation[1] -= ecPhysicsSphere.getRadius();
            }
            else
            {
                scratchpad.v3BottomLocation = mathDevice.v3Copy(this.getv3Location(), scratchpad.v3BottomLocation);
            }
        }

        return scratchpad.v3BottomLocation;
    },

    getv3Forward : function gameEntityGetv3ForwardFn()
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;

        var m33Rotation = scratchpad.m33Rotation = mathDevice.m33BuildRotationXZY(this.getV3Rotation(), scratchpad.m33Rotation);
        scratchpad.v3Forward = mathDevice.m33At(m33Rotation, scratchpad.v3Forward);

        return scratchpad.v3Forward;
    },

    getv3Right : function gameEntityGetv3RightFn()
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;

        var m33Rotation = scratchpad.m33Rotation = mathDevice.m33BuildRotationXZY(this.getV3Rotation(), scratchpad.m33Rotation);
        scratchpad.v3Right = mathDevice.m33Right(m33Rotation, scratchpad.v3Right);

        return scratchpad.v3Right;
    },

    getv3Up : function gameEntityGetv3UpFn()
    {
        var mathDevice = this.globals.mathDevice;
        var scratchpad = this.scratchpad;

        var m33Rotation = scratchpad.m33Rotation = mathDevice.m33BuildRotationXZY(this.getV3Rotation(), scratchpad.m33Rotation);
        scratchpad.v3Up = mathDevice.m33Up(m33Rotation, scratchpad.v3Up);

        return scratchpad.v3Up;
    },

    setToBeDestroyed : function gameEntitySetToBeDestroyedFn()
    {
        var eCMap          =   this.eCMap;
        var currentEC;
        var thisECName;
        var gameSpace;

        if (!this.toBeDestroyed)
        {
            this.toBeDestroyed = true;

            for (thisECName in eCMap)
            {
                if (eCMap.hasOwnProperty(thisECName))
                {
                    currentEC   =   eCMap[thisECName];
                    currentEC.onToBeDestroyed();
                }
            }

            gameSpace = this.getGameSpace();
            if (gameSpace)
            {
                gameSpace.onEntityToBeDestroyed(this);
            }

            this.setChildrenToBeDestroyed();

            this.clearSmartPointer();
        }
    },

    setDead : function gameEntitySetDeadFn()
    {
        var eCMap          =   this.eCMap;
        var currentEC;
        var thisECName;

        if (!this.dead)
        {
            this.dead = true;

            for (thisECName in eCMap)
            {
                if (eCMap.hasOwnProperty(thisECName))
                {
                    currentEC   =   eCMap[thisECName];
                    currentEC.onDeath();
                }
            }
        }
    },

    isDead : function gameentityIsDeadFn()
    {
        return this.dead;
    },

    flagMovedThisFrame : function gameEntityFlagMovement()
    {
        var md              =   this.globals.mathDevice;

        this.movedThisFrame =   !md.v3SafeEqual(this.v3Location, this.v3LocationPrev);

        if (this.movedThisFrame)
        {
            this.v3LocationPrev =   md.v3Copy(this.v3Location, this.v3LocationPrev);
            this.onMoved();
        }
    },

    flagRotatedThisFrame : function gameEntityFlagRotation()
    {
        this.rotatedThisFrame = (this.prevV3Rotation[0] !== this.v3Rotation[0] ||
                                 this.prevV3Rotation[1] !== this.v3Rotation[1] ||
                                 this.prevV3Rotation[2] !== this.v3Rotation[2]);
        if (this.rotatedThisFrame)
        {
            this.prevV3Rotation[0] = this.v3Rotation[0];
            this.prevV3Rotation[1] = this.v3Rotation[1];
            this.prevV3Rotation[2] = this.v3Rotation[2];
            this.onRotated();
        }
    },

    flagScaledThisFrame : function gameentityFlagScaledThisFrameFn()
    {
        this.scaledThisFrame = this.scaleAdjusted;
        if (this.scaledThisFrame)
        {
            this.scaleAdjusted  =   false;
            this.onScaled();
        }
    },

    onMoved : function gameEntityOnMovedFn()
    {
        var eCIndex, thisEC;
        var eCMoveInterestList          =   this.eCMoveInterestList;

        //Backwards to allow removal.
        for (eCIndex = eCMoveInterestList.length - 1; eCIndex >= 0; eCIndex -= 1)
        {
            thisEC  =   eCMoveInterestList[eCIndex];

            thisEC.onMoved();
        }
    },

    onRotated : function gameentityOnRotatedFn()
    {
        var eCIndex, thisEC;
        var eCRotateInterestList          =   this.eCRotateInterestList;

        //Backwards to allow removal.
        for (eCIndex = eCRotateInterestList.length - 1; eCIndex >= 0; eCIndex -= 1)
        {
            thisEC  =   eCRotateInterestList[eCIndex];

            thisEC.onRotated();
        }
    },

    onScaled : function gameentityOnScaledFn()
    {
        var eCScaleInterestList = this.eCScaleInterestList;

        var eCIndex;
        var thisEC;

        //Backwards to allow removal.
        for (eCIndex = eCScaleInterestList.length - 1; eCIndex >= 0; eCIndex -= 1)
        {
            thisEC = eCScaleInterestList[eCIndex];

            thisEC.onScaled();
        }
    },

    updateCurrentGameSpace : function gameEntityUpdateCurrentGameSpace()
    {
        if (!this.movedThisFrame)
        {
            return;
        }

        if (this.ignoreGameSpace)
        {
            return;
        }

        //TODO - insist on big enough movement before checking.
        var newGameSpace =   this.gameManager.getGameSpace(this.v3Location);
        if (newGameSpace)
        {
            this.insideGameSpace = true;
            this.gameManager.requestNewGameSpace(this, newGameSpace);
        }
        else
        {
            this.insideGameSpace = false;
        }
    },

    isInLimbo : function gameEntityIsInLimboFn()
    {
        return !this.insideGameSpace;
    },

    getGameSpace : function gameEntityGetGameSpaceFn()
    {
        return  this.currentGameSpace ? this.currentGameSpace : this.gameSpaceOnDestroy;
    },

    setGameSpace : function gameEntitySetGameSpace(newGameSpace, destroyed)
    {
        var hadPrevSpace;

        var eCMap          =   this.eCMap;
        var currentEC;
        var thisECName;

        if (newGameSpace)
        {
            this.insideGameSpace = true;
        }

        if (newGameSpace !== this.currentGameSpace)
        {
            if (this.currentGameSpace !== undefined)
            {
                this.currentGameSpace.removeGameEntity(this, destroyed);
                hadPrevSpace    =   true;
            }
            this.currentGameSpace   =   newGameSpace;
            if (this.currentGameSpace !== undefined)
            {
                this.currentGameSpace.addGameEntity(this, !hadPrevSpace);
            }

            if (this.active)
            {
                for (thisECName in eCMap)
                {
                    if (eCMap.hasOwnProperty(thisECName))
                    {
                        currentEC   =   eCMap[thisECName];
                        currentEC.setGameSpace(newGameSpace);
                    }
                }
            }

            this.propagateGameSpaceToChildren();
        }
    },

    setGameSpaceDynamic: function gameEntitySetGameSpaceDynamicFn(dynamic)
    {
        this.ignoreGameSpace    =   !dynamic;
    },

    getCustomArchetype : function gameentityGetCustomArchetypeFn()
    {
        var customArchetype = {};

        var ecMap = this.eCMap;

        var ecName;
        var ec;
        var ecParameters;

        for (ecName in ecMap)
        {
            if (ecMap.hasOwnProperty(ecName))
            {
                ec = ecMap[ecName];
                ecParameters = ec.getECParameters();
                customArchetype[ecName] = ecParameters;
            }
        }

        customArchetype.shouldPlayerSave = this.shouldPlayerSave;
        customArchetype.shouldLevelSave = this.shouldLevelSave;

        return customArchetype;
    },

    getECSaveData : function gameentityGetECSaveDataFn(isEditorSave)
    {
        var ecMap = this.eCMap;
        var ecSaveData = {};

        var ec;
        var ecName;

        for (ecName in ecMap)
        {
            if (ecMap.hasOwnProperty(ecName))
            {
                ec = ecMap[ecName];

                if ((isEditorSave && ec.getShouldLevelserialize()) ||
                    ec.getShouldserialize())
                {
                    ecSaveData[ecName] = ec.serialize(isEditorSave);
                }
            }
        }

        return ecSaveData;
    },

    deserializeECSaveData : function gameentityDeserializeECSaveDataFn(ecSaveData)
    {
        var ecMap = this.eCMap;

        var ec;
        var ecData;
        var ecName;

        for (ecName in ecSaveData)
        {
            if (ecSaveData.hasOwnProperty(ecName))
            {
                ec = ecMap[ecName];

                ecData = ecSaveData[ecName];

                debug.assert(ecData, 'Loaded blank ecData.');

                if (ec)
                {
                    ec.deserialize(ecData);
                }
                else
                {
                    debug.warn('Loaded ecData for an ec which does not exist.');
                }
            }
        }
    },

    shrinkDisappear : function gameentityShrinkDisappearFn(duration)
    {
        if (this.shouldBeDestroyed())
        {
            return;
        }

        this.shouldLevelSave = false;
        this.shouldPlayerSave = false;

        var that = this;
        var thatecMesh = this.getEC('ECMesh');
        if (!thatecMesh)
        {
            return;
        }

        var startScale = thatecMesh.getScale();

        TWEEN.Create({scale : startScale})
            .to({scale : 0.0}, duration)
            .onUpdate(function ()
                {
                    if (!that.shouldBeDestroyed())
                    {
                        thatecMesh.setScale(this.scale);
                    }
                })
            .onComplete(function ()
                {
                    that.setToBeDestroyed();
                })
            .start();
    },

    shudder : function gameEntityShudder(strength, duration, delay)
    {
        if (this.shouldBeDestroyed())
        {
            return;
        }

        var that = this;
        var thatecMesh = this.getEC('ECMesh');
        var thatecSockets = this.getEC('ECSockets');
        var scratchpad = this.scratchpad;
        if (!thatecMesh && !thatecSockets)
        {
            return;
        }

        if (!this.isShuddering)
        {
            var md = this.globals.mathDevice;
            this.isShuddering = true;

            var startLocalOffset = scratchpad.startLocalOffset = md.v3BuildZero(scratchpad.startLocalOffset);
            if (thatecMesh)
            {
                startLocalOffset = md.v3Copy(thatecMesh.getLocalOffset(), startLocalOffset);
            }
            else
            {
                startLocalOffset = md.v3BuildZero(startLocalOffset);
            }
            var offset = scratchpad.offset = md.v3BuildZero(scratchpad.offset);
            TWEEN.Create({scale : strength * 0.2})
                .to({scale : 0.0}, duration)
                .onUpdate(function ()
                    {
                        if (!that.shouldBeDestroyed())
                        {
                            md.v3BuildRandom(this.scale, offset);
                            offset[1] = Math.max(offset[1], 0.0);
                            offset = md.v3Add(startLocalOffset, offset, offset);
                            if (thatecSockets)
                            {
                                thatecSockets.applyToSocketedEntities(function (gameEntity) {
                                    var socketedECMesh = gameEntity.getEC('ECMesh');
                                    if (socketedECMesh)
                                    {
                                        socketedECMesh.setLocalOffset(offset);
                                    }
                                });
                            }
                            else if (thatecMesh)
                            {
                                thatecMesh.setLocalOffset(offset);
                            }
                        }
                    })
                .onComplete(function ()
                    {
                        if (!that.shouldBeDestroyed())
                        {
                            if (thatecSockets)
                            {
                                thatecSockets.applyToSocketedEntities(function (gameEntity) {
                                    var socketedECMesh = gameEntity.getEC('ECMesh');
                                    if (socketedECMesh)
                                    {
                                        socketedECMesh.setLocalOffset(offset);
                                    }
                                });
                            }
                            else if (thatecMesh)
                            {
                                thatecMesh.setLocalOffset(startLocalOffset);
                            }
                            that.isShuddering = false;
                        }
                    })
                .delay(delay)
                .start();
        }
    },

    setv3Location : function gameEntitySetV3Location(desiredv3Location)
    {
        var md  =   this.globals.mathDevice;
        md.v3Copy(desiredv3Location, this.v3Location);
    },

    scaleByV3 : function gameentityScaleByV3Fn(v3ScaleFactor)
    {
        var mathDevice = this.globals.mathDevice;
        var ecMesh = this.getEC('ECMesh');
        var ecPhysicsCube = this.getEC('ECPhysicsCube');

        if (ecMesh)
        {
            var v3ECMeshScale = ecMesh.getV3Scale();
            var v3NewECMeshScale = mathDevice.v3Mul(v3ECMeshScale, v3ScaleFactor);
            ecMesh.setV3Scale(v3NewECMeshScale);
        }

        if (ecPhysicsCube)
        {
            var v3PhysicsCubeScale = ecPhysicsCube.getv3Scale();
            var newV3PhysicsCubeScale = mathDevice.v3Mul(v3PhysicsCubeScale, v3ScaleFactor);
            ecPhysicsCube.setV3Scale(newV3PhysicsCubeScale);
        }

        debug.assert(!this.getEC('ECPhysicsSphere'), 'Cannot scale a sphere by a vector.');
    },

    setRotationFromDirection : function gameEntitySetRotationFromDirection(direction, roll)
    {
        this.v3Rotation[1] = -Math.atan2(direction[0], direction[2]);
        this.v3Rotation[0] = Math.atan2(direction[1], Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2]));
        this.v3Rotation[2] = roll;
    },

    setV3Rotation : function gameEntitySetV3Rotation(v3Rotation)
    {
        this.v3Rotation[0] = v3Rotation[0];
        this.v3Rotation[1] = v3Rotation[1];
        this.v3Rotation[2] = v3Rotation[2];
    },

    setM33Rotation : function gameEntitySetM33Rotation(matrix)
    {
        this.globals.mathDevice.xzyAngles(matrix, this.v3Rotation);
    },

    getRotationX : function gameEntityGetXAngle()
    {
        return this.v3Rotation[0];
    },

    setRotationX : function gameentitxSetXAngleFn(rotationX)
    {
        this.v3Rotation[0] = rotationX;
    },

    getRotationY : function gameEntityGetYAngle()
    {
        return this.v3Rotation[1];
    },

    setRotationY : function gameentitySetYAngleFn(rotationY)
    {
        this.v3Rotation[1] = rotationY;
    },

    getRotationZ : function gameEntityGetZAngle()
    {
        return this.v3Rotation[2];
    },

    setRotationZ : function gameentitzSetZAngleFn(rotationZ)
    {
        this.v3Rotation[2] = rotationZ;
    },

    getV3Rotation : function gameentityGetV3Rotation()
    {
        return this.v3Rotation;
    },

    getV3Scale : function gameentityGetV3ScaleFn()
    {
        return this.v3Scale;
    },

    setV3Scale : function gameentityGetV3ScaleFn(v3Scale)
    {
        var mathDevice = this.globals.mathDevice;

        if (!mathDevice.v3Equal(this.v3ScaleCopy, v3Scale))
        {
            this.scaleAdjusted  =   true;
            this.v3ScaleCopy    =   mathDevice.v3Copy(v3Scale, this.v3ScaleCopy);
            this.v3Scale        =   mathDevice.v3Copy(v3Scale, this.v3Scale);
        }
    },

    setv3EditorExtents : function gameEntitySetHalfExtentsFn(v3Scale)
    {
        var md = this.globals.mathDevice;
        this.v3HalfEditorExtents = md.v3ScalarMul(v3Scale, 0.5);
    },

    getEditorExtents : function gameentityGetExtentsFn()
    {
        if (!this.v3HalfEditorExtents)
        {
            return undefined;
        }
        var md        = this.globals.mathDevice;

        var scratchPad = this.scratchPad;

        //Calculate rotation vector.
        var m43Dest = md.m43BuildScaleTranslate(this.getV3Scale(), md.v3BuildZero());

        var v3TotalRotation   =   md.v3Build(0, this.getRotationY(), 0);
        var m33Rotation = scratchPad.m33Rotation = md.m33BuildRotationXZY(v3TotalRotation, scratchPad.m33Rotation);

        md.m43MulM33(m43Dest, m33Rotation, m43Dest);

        var v3TransformedHalfExtents = md.m43TransformPoint(m43Dest, this.v3HalfEditorExtents);

        return md.aabbBuildFromCentreHalfExtents(this.getv3Location(), v3TransformedHalfExtents);
    },

    // getRotationY : function gameentityGetRotationYFn()
    // {
    //     var ecMesh  =   this.getEntityEC('ECMesh');
    //     if (ecMesh)
    //     {
    //         return  ecMesh.getRotationY();
    //     }
    //     return 0.0;
    // },

    // setRotationY : function gameentitySetRotationYFn(yRotation)
    // {
    //     var ecMesh = this.getEC('ECMesh');

    //     if (ecMesh)
    //     {
    //         ecMesh.setRotationY(yRotation);
    //     }
    // },

    //Handy functions
    playSound : function gameEntityPlaySoundFn(soundName)
    {
        //Done directly through the sound manager (will not be propagated over the network)
        if (!soundName)
        {
            return;
        }

        //Game Sound Manager deals with network and event stuff gracefully.
        var gameSoundManager = this.gameManager.getGameSoundManager();
        if (gameSoundManager)
        {
            gameSoundManager.play(soundName, this.getv3Location(), this);
        }
    },

    stopSound : function gameEntityStopSoundFn(soundName, fadeTime)
    {
        if (!soundName)
        {
            return;
        }

        //Game Sound Manager deals with network and event stuff gracefully.
        var gameSoundManager = this.gameManager.getGameSoundManager();
        if (gameSoundManager)
        {
            gameSoundManager.stop(soundName, this, fadeTime);
        }
    },

    //Special effects.
    playEffect : function gameentityPlayEffectFn(effectName, v3Velocity, scale, timeDilation, offset, rotation)
    {
        if (!effectName)
        {
            return;
        }

        //Effect factory deals with network and event stuff gracefully.
        var effectFactory = this.gameManager.getEffectFactory();
        if (effectFactory)
        {
            effectFactory.play(effectName, this.getv3Location(), this, v3Velocity ? v3Velocity : this.getv3Velocity(), undefined, scale, timeDilation, offset, rotation);
        }
    },

    stopEffect : function gameentityStopEffectFn(effectName, fadeTime)
    {
        if (!effectName)
        {
            return;
        }

        //Effect factory deals with network and event stuff gracefully.
        var effectFactory = this.gameManager.getEffectFactory();
        if (effectFactory)
        {
            effectFactory.stop(effectName, this, fadeTime);
        }
    },

    playPersistentEffect : function gameentityPlayPersistentEffectFn(effectArchetypeName)
    {
        var effectFactory = this.gameManager.getEffectFactory();

        return effectFactory.playPersistentEffect(effectArchetypeName, null, this);
    },

    stopPersistentEffect : function gameentityStopPersistentEffectFn(effectEntityName)
    {
        var effectFactory = this.gameManager.getEffectFactory();

        effectFactory.stopPersistentEffect(effectEntityName);
    },

    drawWorldText : function gameEntityDrawWorldTextFn(text, inRow, r, g, b)
    {
        var globals             =   this.globals;
        var md                  =   globals.mathDevice;
        var camera              =   globals.camera;
        var simpleFontRenderer  =   globals.simpleFontRenderer;

        var v2ScreenLocation      =   camera.worldToScreen(md.v3Add(this.getv3Location(), md.v3Build(0.0, 1.5, 0.0)));
        var textInfo;

        var row =   inRow !== undefined ? inRow : 0;

        if (v2ScreenLocation !== undefined)
        {
            textInfo    =
            {
                x : v2ScreenLocation[0],
                y : v2ScreenLocation[1] + 35 * row,
                pointSize : 32,
                alignment : 1,
                r : r !== undefined ? r : 1.0,
                g : g !== undefined ? g : 1.0,
                b : b !== undefined ? b : 1.0
            };
            simpleFontRenderer.drawFontDouble(text, textInfo);
        }
    },

    drawProgressBar : function gameEntityDrawProgressBarFn(currentValue, maxValue, row, scale, completeR, completeG, completeB, incompleteR, incompleteG, incompleteB)
    {
        if (maxValue < 0.0 || currentValue >= maxValue)
        {
            this.drawProgressBarFromFraction(1.0, row, scale, scale, completeR, completeG, completeB);
        }
        else
        {
            this.drawProgressBarFromFraction(currentValue / maxValue, row, scale, scale, incompleteR, incompleteG, incompleteB);
        }
    },

    drawProgressBarFromFraction : function gameEntityDrawProgressBarFromFractionFn(progressFraction, row, scaleX, scaleY, r, g, b)
    {
        var globals = this.globals;
        var md = globals.mathDevice;
        var sr = globals.simpleSpriteRenderer;

        var worldLocation = this.getv3Location();

        scaleX *= 0.5;
        scaleY *= 0.5;
        var barHeight = 0.08;
        var barOutlineSize = 0.03;

        var xOffset = 0.0;
        var yOffset = scaleY * (1.0 - (2.0 * row * (barHeight + barOutlineSize)));

        var progressBarTexturePath = GameEntity.progressBarTexturePath;

        if (md && sr)
        {
            sr.addSprite(
            {
                v3Location  : worldLocation,
                sizeX       : scaleX * (1.0 + barOutlineSize),
                sizeY       : scaleY * (barHeight + barOutlineSize),
                offsetY     : yOffset,
                blendStyle  : SimpleBlendStyle.prototype.blendStyle.NORMAL_NO_Z,
                texture     : progressBarTexturePath,
                v4color     : guiColors.outline
            });

            if (progressFraction > 0.0)
            {
                xOffset = -1.0 * scaleX * (1.0 - progressFraction);

                sr.addSprite(
                {
                    v3Location  : worldLocation,
                    sizeX       : scaleX * progressFraction,
                    sizeY       : scaleY * barHeight,
                    offsetX     : xOffset,
                    offsetY     : yOffset,
                    blendStyle  : SimpleBlendStyle.prototype.blendStyle.NORMAL_NO_Z,
                    texture     : progressBarTexturePath,
                    v4color     : md.v4Build(r, g, b, 1.0)
                });
            }
        }
    },

    isManagedByThisMachine : function gameEntityIsManagedByThisMachine()
    {
        return true;
        // if (this.isOwnedByAPlayer())
        // {
        //     return  this.ownedByThisPlayer;
        // }
        // var isHostToUse =   isHost;
        // if (isHostToUse === undefined)
        // {
        //     isHostToUse =   this.globals.isHost;
        // }
        // return  isHostToUse;
    },

    setOwnedByThisPlayer : function gameEntitySetOwnedByThisPlayer(owned)
    {
        this.ownedByThisPlayer =   owned;

        this.ownedByAPlayer = owned;
    },

    isOwnedByThisPlayer : function gameEntityIsOwnedByThisPlayer()
    {
        return  this.ownedByThisPlayer;
    },

    isOwnedByAPlayer : function gameEntityIsOwnedByAMachine()
    {
        return  this.ownedByAPlayer;
    },

    getName : function gameEntityGetNameFn()
    {
        return this.name;
    },

    getArchetypeName : function entityComponentBaseGetArchetypeNameFn()
    {
        return this.archetypeName;
    },

    getFamilyName : function entityComponentBaseGetFamilyNameFn()
    {
        return this.familyName;
    },

    destroy : function gameEntityDestroyFn()
    {
        this.gameSpaceOnDestroy  =   this.currentGameSpace;

        this.setGameSpace(undefined, true);

        var eCMap          =   this.eCMap;
        var currentEC;
        var thisECName;
        for (thisECName in eCMap)
        {
            if (eCMap.hasOwnProperty(thisECName))
            {
                currentEC   =   eCMap[thisECName];
                currentEC.destroy();
            }
        }

        this.eCMap = null;

        if (this.eCUpdateList)
        {
            this.eCUpdateList.length = 0;
            this.eCUpdateList        = null;
        }

        this.eCAddToUpdateList.length      = 0;
        this.eCRemoveFromUpdateList.length = 0;

        this.eCAlwaysUpdateList.length     = 0;

        this.eCDrawList.length             = 0;

        this.toBeDestroyed                     = true;
    },

    getAge : function gameEntityGetAgeFn()
    {
        return  this.globals.gameCurrentTime    -   this.creationTime;
    },

    hideMesh : function gameEntityHideMeshFn(forceUpdate)
    {
        var eCMesh = this.getEC('ECMesh');

        if (eCMesh)
        {
            eCMesh.setScale(0.0);
            if (forceUpdate)
            {
                eCMesh.update();
            }
        }
    },

    showMesh : function gameentityShowMeshFn(forceUpdate)
    {
        var eCMesh = this.getEC('ECMesh');

        if (eCMesh)
        {
            eCMesh.setScale(1.0);
            if (forceUpdate)
            {
                eCMesh.update();
            }
        }
    },

    flashDeath : function gameEntityFlashDeathFn(timeToDie)
    {
        if (timeToDie > 3.0)
        {
            return;
        }

        var eCMesh      =   this.getEC('ECMesh');

        if (eCMesh)
        {
            eCMesh.setScale(this.getFlashFactor(timeToDie));
        }
    },

    getFlashFactor : function gameEntityGetFlashFactorFn(timeToDie)
    {
        if (timeToDie > 3.0)
        {
            return  1.0;
        }
        var flashSpeed  =   (timeToDie > 1.0) ? 0.25 : 0.1;

        return  Math.floor((timeToDie / flashSpeed)) % 2;
    },

    //
    //  Carried objects.
    //
    createHeldEntity : function gameentityCreateHeldEntityFn(meshPath, v3Offset, scale, newName)
    {
        var globals       = this.globals;
        var md            = globals.mathDevice;
        var gameManager   = this.gameManager;
        var entityFactory = gameManager.getEntityFactory();

        var newEntity;
        var newEntityECAttach;
        var newECMesh;

        var ecMesh    =   this.getEC('ECMesh');
        var v3entityScale     =   md.v3BuildOne();
        if (ecMesh)
        {
            v3entityScale =   md.v3Copy(ecMesh.getv3BaseScale(), v3entityScale);

            if (md.v3LengthSq(v3entityScale) < 0.01)
            {
                v3entityScale =   md.v3BuildOne(v3entityScale);
            }
        }

        //Build a held object mesh!
        newEntity = entityFactory.createCustomEntityInstance(
            newName, 'custom_heldentity_' + newName, this.getv3Location(), this.isOwnedByThisPlayer());

        newECMesh = EntityComponentBase.createFromName('ECMesh', globals,
            {
                path : meshPath,
                scaleX : scale / v3entityScale[0],
                scaleY : scale / v3entityScale[1],
                scaleZ : scale / v3entityScale[2],
                localOffset : md.v3Build(v3Offset[0] / (v3entityScale[0] * scale),
                                         v3Offset[1] / (v3entityScale[1] * scale),
                                         v3Offset[2] / (v3entityScale[2] * scale))
            });
        newEntity.addECToCustomEntity(newECMesh);

        newEntityECAttach   =   EntityComponentBase.createFromName('ECAttach', globals);
        newEntityECAttach.setParent(this);

        newEntity.addECToCustomEntity(newEntityECAttach);

        newEntity.activate();

        return  newEntity;
    },

    //
    //  Children.
    //

    addChild : function gameEntityAddChildFn(childEntity)
    {
        if (!this.childEntities)
        {
            this.childEntities  =   [];
        }

        debug.assert(this.childEntities.indexOf(childEntity) === -1,
                     "Double Adding a Child!");

        this.childEntities.push(childEntity);

        this.propagateGameSpaceToChildren(this.childEntities.length - 1);
    },

    removeChild : function gameEntityRemoveChildFn(childEntity)
    {
        if (!this.childEntities)
        {
            return;
        }

        var childIndex   =   this.childEntities.indexOf(childEntity);

        debug.assert(childIndex !== -1, "Removing a child that isn't owned?");

        this.childEntities.splice(childIndex, 1);
    },

    setChildrenToBeDestroyed : function gameentitySetChildrenToBeDestroyedFn()
    {
        if (!this.childEntities)
        {
            return;
        }

        var childEntities = this.childEntities;

        while (childEntities.length)
        {
            childEntities[(childEntities.length - 1)].setToBeDestroyed();
        }
    },

    applyToChildren : function gameEntityApplyToChildrenFn(toApply)
    {
        var childIndex;
        var childEntities = this.childEntities;
        var numChildEntities;
        if (childEntities)
        {
            numChildEntities = childEntities.length;
            for (childIndex = 0; childIndex < numChildEntities; childIndex += 1)
            {
                toApply(childEntities[childIndex]);
            }
        }
    },

    propagateGameSpaceToChildren : function gameEntityPropagateGameSpaceToChildren(inputtedStartIndex)
    {
        if (!this.childEntities)
        {
            return;
        }

        var childIndex;
        var childList       =   this.childEntities;
        var childListLength =   childList.length;
        var thisChild;

        var startIndex      =   inputtedStartIndex !== undefined ? inputtedStartIndex : 0;

        var myGameSpace     =   this.getGameSpace();

        for (childIndex = startIndex; childIndex < childListLength; childIndex += 1)
        {
            thisChild   =   childList[childIndex];

            if (thisChild.getGameSpace() !== myGameSpace)
            {
                //Added to end.
                thisChild.setGameSpace(myGameSpace);
            }
            else
            {
                //Ensure on end (and children too).
                myGameSpace.shuffleGameEntityToEnd(thisChild);
                thisChild.propagateGameSpaceToChildren();
            }
        }
    },

    isFriendlyWith : function gameentityIsFriendlyWithFn(entity)
    {
        var factionManager = this.gameManager.getFactionManager();

        return factionManager.areFriendly(this, entity);
    },

    getSmartPointer : function gameEntityGetSmartPointerFn()
    {
        if (!this.smartPointer)
        {
            this.smartPointer = this.createSmartPointer();
        }
        return this.smartPointer;
    },

    createSmartPointer : function gameentityCreateSmartPointerFn()
    {
        if (GameEntity.prototype.smartPointerIndex === undefined)
        {
            GameEntity.prototype.smartPointerIndex = 0;
        }
        else
        {
            GameEntity.prototype.smartPointerIndex += 1;
        }

        return {
            entity : this,
            smartPointerIndex : GameEntity.prototype.smartPointerIndex,
            get : function ()
            {
                return this.entity;
            }
        };
    },

    clearSmartPointer : function gameentityClearSmartPointerFn()
    {
        if (this.smartPointer)
        {
            this.smartPointer.entity = undefined;
        }
        this.smartPointer   =   undefined;
    },

    transferIdentity : function gameentitytransferIdentityFn(fromGameEntity)
    {
        if (!fromGameEntity)
        {
            return;
        }

        debug.assert(!this.smartPointer, 'Double Setting smart pointer for entity');

        this.smartPointer   =   fromGameEntity.smartPointer;
        fromGameEntity.clearSmartPointer();

        if (this.smartPointer)
        {
            this.smartPointer.entity    =   this;
        }
    },

    setLevelEntityNameMap : function gameEntitySetLevelEntityNameMapFn(levelEntityNameMap)
    {
        this.levelEntityNameMap = levelEntityNameMap;
    },

    clearLevelEntityNameMap : function gameEntityClearLevelEntityNameMapFn()
    {
        this.levelEntityNameMap = undefined;
    }
};

GameEntity.progressBarTexturePath = "textures/simple_square.dds";

GameEntity.create = function gameentityCreateFn(
    name, familyName, globals, v3Location, shouldLevelSave, shouldPlayerSave, v3Rotation)
{
    var gameManager = globals.gameManager;

    //Lazily assign the static globals
    if (GameEntity.prototype.globals === undefined)
    {
        GameEntity.prototype.globals = globals;
    }
    if (GameEntity.prototype.gameManager === undefined)
    {
        GameEntity.prototype.gameManager = gameManager;
    }

    var gameEntity = new GameEntity();
    var md = globals.mathDevice;

    gameEntity.toBeDestroyed          = false;
    gameEntity.active                 = false;
    gameEntity.eCMap                  = {};
    gameEntity.eCUpdateList           = [];
    gameEntity.eCAddToUpdateList      = [];
    gameEntity.eCRemoveFromUpdateList = [];
    gameEntity.eCAlwaysUpdateList     = [];
    gameEntity.eCDrawList             = [];
    gameEntity.eCMoveInterestList     = [];
    gameEntity.eCRotateInterestList   = [];
    gameEntity.eCScaleInterestList    = [];
    gameEntity.v3Location             = ((v3Location !== undefined) ? md.v3Copy(v3Location) : md.v3Build(0.0, 0.0, 0.0));
    gameEntity.v3Rotation             = ((v3Rotation !== undefined) ? md.v3Copy(v3Rotation) : md.v3BuildZero());
    gameEntity.prevV3Rotation         = md.v3Build(0.0 / 0.0, 0.0 / 0.0, 0.0 / 0.0); // ensure never equals anything initially.
    gameEntity.v3Scale                = md.v3Build(1.0, 1.0, 1.0);
    gameEntity.v3ScaleCopy            = md.v3Build(1.0, 1.0, 1.0);
    gameEntity.insideGameSpace        = false;
    gameEntity.uniqueId               = -1;
    gameEntity.spawnerId              = -1;
    gameEntity.isGameEntity           = true;
    gameEntity.creationTime           = globals.gameCurrentTime;
    gameEntity.shouldPlayerSave       = (shouldPlayerSave ? true : false);
    gameEntity.shouldLevelSave        = (shouldLevelSave ? true : false);
    gameEntity.familyName             = ((familyName !== undefined) ? familyName : 'no family');
    gameEntity.archetypeName          = null;
    gameEntity.custom                 = false;
    gameEntity.safeToManipulate       = false;
    gameEntity.scratchpad             = {};

    gameEntity.name = gameManager.uniqueifyString(name);

    gameEntity.setGameSpaceDynamic(false);

    return gameEntity;
};
