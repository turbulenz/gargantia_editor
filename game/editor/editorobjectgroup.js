/*global debug: false*/
/*global ECUIHelpers: false*/
/*global Editor: false*/

Editor.ObjectGroup =
{
    createNewObjectGroup : function editorobjectgroupCreateNewObjectGroupFn()
    {
        return {
            v3Location : null,
            v3Rotation : null,
            v3Scale : null,
            objectList : []
        };
    },

    addObjectToObjectGroup : function editorobjectgroupAddObjectToObjectGroupFn(
        objectGroup, objectToAdd, mathDevice)
    {
        debug.assert(!Editor.ObjectGroup.isInObjectGroup(objectGroup, objectToAdd),
            'Trying to add object to group which it is already in.');

        objectGroup.objectList.push(objectToAdd);

        objectGroup = Editor.ObjectGroup.updateObjectGroupValues(objectGroup, mathDevice);

        return objectGroup;
    },

    removeObjectFromObjectGroup : function editorobjectgroupRemoveObjectFromObjectGroupFn(
        objectGroup, objectToRemove, mathDevice)
    {
        debug.assert(Editor.ObjectGroup.isInObjectGroup(objectGroup, objectToRemove),
            'Trying to remove object from group which it is not in.');

        var objectList = objectGroup.objectList;

        objectGroup.objectList = objectList.filter(
            function (object) { return (object !== objectToRemove); });

        objectGroup = Editor.ObjectGroup.updateObjectGroupValues(objectGroup, mathDevice);

        if (objectGroup.objectList.length === 0)
        {
            return null;
        }
        else
        {
            return objectGroup;
        }
    },

    updateObjectGroupValues : function editorobjectgroupUpdateObjectGroupValuesFn(objectGroup, mathDevice)
    {
        objectGroup.v3Location = Editor.ObjectGroup.getV3ObjectGroupCentre(objectGroup, mathDevice);

        if (objectGroup.objectList.length === 1)
        {
            var object = objectGroup.objectList[0];

            objectGroup.v3Rotation = mathDevice.v3Copy(object.getV3Rotation());
            objectGroup.v3Scale = mathDevice.v3Copy(object.getV3Scale());
        }
        else
        {
            objectGroup.v3Rotation = mathDevice.v3BuildZero();
            objectGroup.v3Scale = mathDevice.v3BuildOne();
        }

        return objectGroup;
    },

    isInObjectGroup : function editorobjectgroupIsInObjectGroupFn(objectGroup, objectToMatch)
    {
        var objectList = objectGroup.objectList;

        var matchingObjectList = objectList.filter(
            function (object) { return (object === objectToMatch); });

        return (matchingObjectList.length > 0);
    },

    getV3ObjectGroupCentre : function editorobjectgroupGetV3ObjectGroupCentreFn(objectGroup, mathDevice)
    {
        var objectList = objectGroup.objectList;

        if (objectList.length === 1)
        {
            return mathDevice.v3Copy(objectList[0].getv3Location());
        }

        var aabbTotalExtents = mathDevice.aabbBuildEmpty();

        function unionAABBExtentsFn(aabbExtents, object)
        {
            var entityExtents = Editor.getEditorEntityExtents(object, mathDevice);

            mathDevice.aabbUnion(aabbTotalExtents, entityExtents, aabbTotalExtents);

            return aabbExtents;
        }

        aabbTotalExtents = objectList.reduce(unionAABBExtentsFn, aabbTotalExtents);

        var v3Centre  =   mathDevice.v3BuildZero();
        var v3Half    =   mathDevice.v3BuildZero();

        mathDevice.aabbGetCenterAndHalf(aabbTotalExtents, v3Centre, v3Half);

        return v3Centre;
    },

    selectObjects : function editorobjectgroupSelectObjectsFn(globals, gameManager, objectList)
    {
        var objectGroup = Editor.ObjectGroup.createNewObjectGroup();
        var mathDevice = globals.mathDevice;

        return objectList.reduce(
            function (objectGroup, object)
            {
                var selectedObject = Editor.ObjectGroup.selectObject(globals, gameManager, object);
                return Editor.ObjectGroup.addObjectToObjectGroup(objectGroup, selectedObject, mathDevice);

            }, objectGroup);
    },

    selectObject : function editorobjectgroupSelectObjectFn(globals, gameManager, object)
    {
        if (object.isBlock)
        {
            return Editor.ObjectGroup.selectBlock(gameManager, globals, object);
        }
        else
        {
            return Editor.ObjectGroup.selectEntity(gameManager, globals, object);
        }
    },

    selectBlock : function editorobjectgroupSelectBlockFn(gameManager, globals, block)
    {
        var entityFactory = gameManager.getEntityFactory();
        var blockFactory = gameManager.getBlockFactory();
        var archetypeName = block.archetypeName;
        var v3BlockLocation = block.getv3Location();
        var v3Scale = block.getV3Scale();
        var v3Rotation = block.getV3Rotation();

        debug.assert(archetypeName, 'Cannot select a block without a valid archetype name.');

        var gameSpace = gameManager.getGameSpace(block.getv3Location());
        block.removeFromGameSpace(gameSpace);
        block.destroy();

        gameSpace.finalizeIfNeeded();

        var newSelectedObject = Editor.ObjectGroup.createObjectGroupEntityFromBlock(
            archetypeName, v3BlockLocation, v3Scale, v3Rotation, globals, blockFactory, entityFactory);

        Editor.removeBlock(block);

        return newSelectedObject;
    },

    selectEntity : function editorobjectgroupSelectEntityFn(gameManager, globals, entity)
    {
        var entityFactory = gameManager.getEntityFactory();
        var archetypeName = entity.archetypeName;
        var v3EntityLocation = entity.getv3Location();
        var mathDevice = globals.mathDevice;

        if (!archetypeName)
        {
            return null;
        }

        var ecNameList = entityFactory.getArchetypeECList(entity.archetypeName);
        var editablePropertiesObject = ECUIHelpers.getEditableEntityProperties(entity, ecNameList);

        var objectAtCursorECMesh = entity.getEC('ECMesh');

        var v3NewEntityScaleFactor = entity.getV3Scale();
        if (objectAtCursorECMesh)
        {
            var v3ScaleMul = objectAtCursorECMesh.getV3ScaleToManipulate();
            mathDevice.v3Mul(v3ScaleMul, v3NewEntityScaleFactor, v3NewEntityScaleFactor);
        }

        var v3NewEntityRotation = entity.getV3Rotation();

        entity.setToBeDestroyed();

        var gameSpace = gameManager.getGameSpace(v3EntityLocation);
        gameSpace.destroyDeadEntities();
        gameSpace.finalizeIfNeeded();

        var newSelectedObject = Editor.ObjectGroup.createObjectGroupEntityFromEntity(
            archetypeName, v3EntityLocation, v3NewEntityScaleFactor,
            v3NewEntityRotation, editablePropertiesObject, globals, entityFactory);

        Editor.removeEntity(entity);

        return newSelectedObject;
    },

    createObjectGroupEntityFromEntity : function editorobjectgroupCreateObjectGroupEntityFromEntityFn(
        archetypeName, v3Location, v3Scale, v3Rotation, editableProperties, globals, entityFactory)
    {
        var newSelectedObject = Editor.createEditorObjectFromEntityArchetype(
            globals, v3Location, v3Scale, v3Rotation, archetypeName, entityFactory);

        newSelectedObject.editableProperties = editableProperties;
        Editor.addEntity(newSelectedObject, globals.mathDevice);

        return newSelectedObject;
    },

    createObjectGroupEntityFromBlock : function editorobjectgroupCreateObjectGroupEntityFromBlockFn(
        archetypeName, v3Location, v3Scale, v3Rotation, globals, blockFactory, entityFactory)
    {
        var newSelectedObject = Editor.createEditorObjectFromBlockArchetype(
            globals, v3Location, v3Scale, v3Rotation, archetypeName, blockFactory, entityFactory);

        var mathDevice = globals.mathDevice;
        Editor.addEntity(newSelectedObject, mathDevice);

        return newSelectedObject;
    },

    parseObjectGroupObject : function editorobjectgroupParseObjectGroupObjectFn(
        serializedEntityData, globals, blockFactory, entityFactory)
    {
        var archetypeName = serializedEntityData.archetypeName;
        var v3Location = serializedEntityData.v3Location;
        var v3Scale = serializedEntityData.v3Scale;
        var v3Rotation = serializedEntityData.v3Rotation;
        var editableProperties = serializedEntityData.editableProperties;
        var isFromBlock = serializedEntityData.isFromBlock;

        if (isFromBlock)
        {
            return Editor.ObjectGroup.createObjectGroupEntityFromBlock(
                archetypeName, v3Location, v3Scale, v3Rotation, globals, blockFactory, entityFactory);
        }
        else
        {
            return Editor.ObjectGroup.createObjectGroupEntityFromEntity(
                archetypeName, v3Location, v3Scale, v3Rotation, editableProperties, globals, entityFactory);
        }
    },

    serializeObjectGroupEntity : function editorobjectgroupSerializeObjectGroupEntityFn(entity, mathDevice)
    {
        return {
            archetypeName : entity.archetypeName,
            v3Location : mathDevice.v3Copy(entity.getv3Location()),
            v3Rotation : mathDevice.v3Copy(entity.getV3Rotation()),
            v3Scale : mathDevice.v3Copy(entity.getV3Scale()),
            editableProperties : (entity.editableProperties || null),
            isFromBlock : entity.isFromBlock
        };
    },

    placeObjectGroup : function editorobjectgroupPlaceObjectGroupFn(objectGroup, gameManager, mathDevice)
    {
        var objectList = objectGroup.objectList;
        var placedObjectList = [];

        objectList.forEach(
            function (object)
            {
                placedObjectList.push(Editor.ObjectGroup.placeObject(gameManager, mathDevice, object));
            });

        return placedObjectList;
    },

    placeObject : function editorobjectgroupPlaceObjectFn(gameManager, mathDevice, object)
    {
        if (object.isFromBlock)
        {
            return Editor.ObjectGroup.placeBlock(gameManager, mathDevice, object);
        }
        else
        {
            return Editor.ObjectGroup.placeEntity(gameManager, mathDevice, object);
        }
    },

    placeBlock : function editorobjectgroupPlaceBlockFn(gameManager, mathDevice, object)
    {
        var blockFactory = gameManager.getBlockFactory();

        debug.assert(object, 'Cannot place selected block when there is no selected block.');

        var v3Location = object.getv3Location();
        var gameSpace = gameManager.getGameSpace(v3Location);

        var placedBlock = null;

        if (gameSpace)
        {
            var archetypeName = object.archetypeName;

            var v3Scale = object.getV3Scale();
            var v3Rotation = object.getV3Rotation();

            placedBlock = blockFactory.createBlockInstance(archetypeName, v3Location, v3Scale, v3Rotation);

            placedBlock.addToGameSpace(gameSpace);
            gameSpace.finalizeIfNeeded();

            Editor.addBlock(placedBlock);
        }

        return placedBlock;
    },

    placeEntity : function editorobjectgroupPlaceEntityFn(gameManager, mathDevice, object)
    {
        var entityFactory = gameManager.getEntityFactory();

        debug.assert(object, 'Cannot place selected entity when there is no selected entity.');

        var v3Location = object.getv3Location();
        var gameSpace = gameManager.getGameSpace(v3Location);

        var placedEntity = null;

        if (gameSpace)
        {
            var archetypeName = object.archetypeName;
            var entityName = gameManager.uniquifyLevelEntityName(archetypeName);
            placedEntity = entityFactory.createInactiveEntityInstance(entityName, archetypeName, v3Location);
            ECUIHelpers.applyStoredECState(placedEntity, object.editableProperties);

            var v3Scale = object.getV3Scale();
            placedEntity.setV3Scale(v3Scale);

            var v3Rotation = object.getV3Rotation();
            placedEntity.setV3Rotation(v3Rotation);

            placedEntity.activate();
            //placedEntity.update(undefined, true);
            placedEntity.refreshMesh();

            gameSpace.finalizeIfNeeded();

            Editor.addEntity(placedEntity, mathDevice);
        }

        return placedEntity;
    },

    discardObjectGroup : function editorobjectgroupDiscardObjectGroupFn(objectGroup)
    {
        var objectList = objectGroup.objectList;

        objectList.forEach(Editor.ObjectGroup.discardObject);
    },

    discardObjectIfNotLevelSave : function editorobjectgroupDiscardObjectIfNotLevelSaveFn(object)
    {
        if (!object.shouldLevelSave)
        {
            Editor.ObjectGroup.discardObject(object);
        }
    },

    discardObject : function editorobjectgroupDiscardObjectFn(object)
    {
        object.setToBeDestroyed();

        var objectGameSpace = object.getGameSpace();

        if (objectGameSpace)
        {
            objectGameSpace.destroyDeadEntities();
        }
        else
        {
            object.destroy();
        }

        Editor.removeEntity(object);
    },

    translateObjectGroupInAxis : function editorobjectgroupTranslateObjectGroupInAxisFn(
        globals, gameManager, objectGroup, positionDelta, axis, shouldSnapLocation)
    {
        var v3Location = objectGroup.v3Location;
        var newLocationInAxis = (v3Location[axis] + positionDelta);

        Editor.ObjectGroup.setObjectGroupLocationInAxis(
            globals, gameManager, objectGroup, newLocationInAxis, axis, shouldSnapLocation);
    },

    setObjectGroupLocationInAxis : function editorobjectgroupSetObjectGroupLocationInAxisFn(
        globals, gameManager, objectGroup, positionInAxis, axis, shouldSnapLocation)
    {
        var mathDevice = globals.mathDevice;

        var positionSelectedObjectInAxis = function positionSelectedObjectInAxisFn(
            globals, gameManager, selectedObject, positionDelta, axis)
        {
            var v3EntityLocation = mathDevice.v3Copy(selectedObject.getv3Location());
            v3EntityLocation[axis] += positionDelta;

            selectedObject.setv3Location(v3EntityLocation);
            selectedObject.update(undefined, true);

            Editor.updateEntity(selectedObject, mathDevice);
        };

        var objectList = objectGroup.objectList;
        var v3GroupLocation = objectGroup.v3Location;

        var positionDelta;

        if (shouldSnapLocation)
        {
            if (objectList.length === 1)
            {
                var selectedObject = objectList[0];
                var v3EntityLocation = mathDevice.v3Copy(selectedObject.getv3Location());
                v3EntityLocation[axis] = positionInAxis;

                v3EntityLocation =
                    Editor.getSnappedEntityLocation(globals, gameManager, selectedObject, v3EntityLocation, axis);

                positionInAxis = v3EntityLocation[axis];
            }
            else
            {
                positionDelta = (positionInAxis - v3GroupLocation[axis]);
                positionDelta = Math.round(positionDelta);
                positionInAxis = (v3GroupLocation[axis] + positionDelta);
            }
        }

        positionDelta = (positionInAxis - v3GroupLocation[axis]);
        v3GroupLocation[axis] = positionInAxis;

        objectList.forEach(
            function (object)
            {
                positionSelectedObjectInAxis(globals, gameManager, object, positionDelta, axis);
            });
    },

    rotateObjectGroupInAxis : function editorobjectgroupRotateObjectGroupInAxisFn(
        globals, objectGroup, axis, rotationDelta, shouldRoundRotation)
    {
        var v3Rotation = objectGroup.v3Rotation;
        var newRotationInAxis = (v3Rotation[axis] + rotationDelta);

        Editor.ObjectGroup.setObjectGroupRotationInAxis(
            globals, objectGroup, axis, newRotationInAxis, shouldRoundRotation);
    },

    setObjectGroupRotationInAxis : function editorobjectgroupSetObjectGroupRotationInAxisFn(
        globals, objectGroup, axis, rotationValue, shouldRoundRotation)
    {
        var mathDevice = globals.mathDevice;

        var snapRotationFactor = (Math.PI / 4);
        if (shouldRoundRotation)
        {
            rotationValue = (Math.round(rotationValue / snapRotationFactor) * snapRotationFactor);
        }

        var m43RotationTransform;

        var rotateSelectedObjectInAxis = function rotateSelectedObjectInAxisFn(
            selectedObject, rotationDelta)
        {
            var v3EntityRotation = selectedObject.getV3Rotation();
            var v3EntityOffset = mathDevice.v3Sub(selectedObject.getv3Location(), objectGroup.v3Location);

            mathDevice.m43TransformVector(m43RotationTransform, v3EntityOffset, v3EntityOffset);

            v3EntityRotation[axis] += rotationDelta;

            if (shouldRoundRotation)
            {
                v3EntityRotation[axis] = (Math.round(v3EntityRotation[axis] / snapRotationFactor) * snapRotationFactor);
            }

            selectedObject.setV3Rotation(v3EntityRotation);
            selectedObject.setv3Location(mathDevice.v3Add(objectGroup.v3Location, v3EntityOffset));
            selectedObject.update(undefined, true);

            Editor.updateEntity(selectedObject, mathDevice);
        };

        var v3GroupRotation = objectGroup.v3Rotation;
        var rotationDelta = (rotationValue - v3GroupRotation[axis]);

        var v3Axis = mathDevice.v3BuildZero();
        v3Axis[axis] = 1.0;
        m43RotationTransform = mathDevice.m43FromAxisRotation(v3Axis, rotationDelta);

        objectGroup.v3Rotation[axis] = rotationValue;

        var objectList = objectGroup.objectList;

        objectList.forEach(
            function (object)
            {
                rotateSelectedObjectInAxis(object, rotationDelta);
            });
    },

    scaleObjectGroupInAxis : function editorobjectgroupScaleObjectGroupInAxisFn(
        globals, gameManager, objectGroup, axis, scaleDelta, shouldRoundScale, snapScaleFactor)
    {
        var v3Scale = objectGroup.v3Scale;
        var newScaleInAxis = (v3Scale[axis] + scaleDelta);

        Editor.ObjectGroup.setObjectGroupScaleInAxis(
            globals, gameManager, objectGroup, axis, newScaleInAxis, shouldRoundScale, snapScaleFactor);
    },

    setObjectGroupScaleInAxis : function editorobjectgroupSetObjectGroupScaleInAxisFn(
        globals, gameManager, objectGroup, axis, scaleInAxis, shouldRoundScale, snapScaleFactor)
    {
        var mathDevice = globals.mathDevice;

        debug.assert((axis === 0 || axis === 1 || axis === 2), 'Cannot scale object in invalid axis: ' + axis);

        var scaleSelectedObjectInAxis = function scaleSelectedObjectInAxisFn(
            selectedObject, scaleDelta, axis)
        {
            var v3EntityScale = mathDevice.v3Copy(selectedObject.getV3Scale());
            v3EntityScale[axis] += scaleDelta;

            selectedObject.setV3Scale(v3EntityScale);
            selectedObject.update(undefined, true);

            Editor.updateEntity(selectedObject, mathDevice);
        };

        if (shouldRoundScale)
        {
            scaleInAxis = (Math.round(scaleInAxis / snapScaleFactor) * snapScaleFactor);
        }
        scaleInAxis = Math.max(scaleInAxis, 0.5);

        var v3GroupScale = objectGroup.v3Scale;
        var scaleDelta = (scaleInAxis - v3GroupScale[axis]);

        v3GroupScale[axis] = scaleInAxis;

        var objectList = objectGroup.objectList;

        objectList.forEach(
            function (object)
            {
                scaleSelectedObjectInAxis(object, scaleDelta, axis);
            });
    },

    replaceObjectsWithArchetype : function editorobjectgroupReplaceObjectsWithBlockArchetypeFn(
        objectGroup, archetypeName, isBlockArchetype, globals, gameManager)
    {
        var mathDevice = globals.mathDevice;
        var entityFactory = gameManager.getEntityFactory();
        var blockFactory = gameManager.getBlockFactory();
        var objectList = objectGroup.objectList;

        var newObjectGroup = Editor.ObjectGroup.createNewObjectGroup();

        var replaceWithBlock = function (newObjectGroup, object)
        {
            var v3Scale = object.getV3Scale();
            var v3Location = object.getv3Location();
            var v3Rotation = object.getV3Rotation();
            var replacementObject = Editor.createEditorObjectFromBlockArchetype(
                globals, v3Location, v3Scale, v3Rotation, archetypeName, blockFactory, entityFactory);

            return Editor.ObjectGroup.addObjectToObjectGroup(newObjectGroup, replacementObject, mathDevice);
        };

        var replaceWithEntity = function (newObjectGroup, object)
        {
            var v3Scale = object.getV3Scale();
            var v3Location = object.getv3Location();
            var v3Rotation = object.getV3Rotation();
            var replacementObject = Editor.createEditorObjectFromEntityArchetype(
                globals, v3Location, v3Scale, v3Rotation, archetypeName, entityFactory);

            return Editor.ObjectGroup.addObjectToObjectGroup(newObjectGroup, replacementObject, mathDevice);
        };

        if (isBlockArchetype)
        {
            objectList.reduce(replaceWithBlock, newObjectGroup);
        }
        else
        {
            objectList.reduce(replaceWithEntity, newObjectGroup);
        }

        return newObjectGroup;
    },

    copyObjectGroup : function editorobjectgroupCopyObjectGroupFn(objectGroup, globals, gameManager)
    {
        var placedObjectList = Editor.ObjectGroup.placeObjectGroup(objectGroup, gameManager, globals.mathDevice);
        return Editor.ObjectGroup.selectObjects(globals, gameManager, placedObjectList);
    },

    serializeObjectGroup : function editorobjectgroupSerializeObjectGroupFn(objectGroup, mathDevice)
    {
        var objectList = objectGroup.objectList;
        return objectList.map(
            function (object)
            {
                return Editor.ObjectGroup.serializeObjectGroupEntity(object, mathDevice);
            });
    },

    parseObjectGroup : function editorobjectgroupParseObjectGroupFn(serializedObjectList, globals, gameManager)
    {
        var blockFactory = gameManager.getBlockFactory();
        var entityFactory = gameManager.getEntityFactory();
        var parsedObjectList = serializedObjectList.map(
            function (serializedEntity)
            {
                return Editor.ObjectGroup.parseObjectGroupObject(serializedEntity, globals, blockFactory, entityFactory);
            });

        var newObjectGroup = Editor.ObjectGroup.createNewObjectGroup();
        newObjectGroup.objectList = parsedObjectList;
        Editor.ObjectGroup.updateObjectGroupValues(newObjectGroup, globals.mathDevice);

        return newObjectGroup;
    },

    mergeObjectGroup : function editorobjectgroupMergeObjectGroupFn(objectGroupA, objectGroupB, mathDevice)
    {
        var combinedObjectGroup = Editor.ObjectGroup.createNewObjectGroup();
        combinedObjectGroup.objectList = objectGroupA.objectList.concat(objectGroupB.objectList);
        Editor.ObjectGroup.updateObjectGroupValues(combinedObjectGroup, mathDevice);

        return combinedObjectGroup;
    },

    isWithinGameSpace : function editorobjectgroupIsWithinGameSpaceFn(objectGroup, gameManager)
    {
        var objectList = objectGroup.objectList;

        var gameSpace = gameManager.getGameSpace(objectGroup.v3Location);
        if (gameSpace)
        {
            var objectListLength = objectList.length;
            for (var objectIndex = 0; objectIndex < objectListLength; objectIndex += 1)
            {
                var object = objectList[objectIndex];
                gameSpace = gameManager.getGameSpace(object.getv3Location());
                if (!gameSpace)
                {
                    return false;
                }
            }

            return true;
        }
        else
        {
            return false;
        }
    }
};
