//
// EntityHelpers - Namespace for entity list helper functions
//

var EntityHelpers = {};

EntityHelpers.filterByFamilyName = function entityhelpersFilterByFamilyNameFn(entityList, familyName)
{
    var entityListLength = entityList.length;
    var outputList = [];

    for (var entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
    {
        var entity = entityList[entityIndex];
        if (entity.familyName === familyName)
        {
            outputList.push(entity);
        }
    }

    return outputList;
};

EntityHelpers.filterWithinDistance = function entityhelpersFilterWithinDistanceFn(
    entityList, v3Location, maxDistance, mathDevice)
{
    var entityListLength = entityList.length;
    var maxDistanceSq = (maxDistance * maxDistance);
    var outputList = [];

    for (var entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
    {
        var entity = entityList[entityIndex];
        var v3EntityLocation = entity.getv3Location();
        var separationDistanceSq = mathDevice.v3DistanceSq(v3Location, v3EntityLocation);

        if (separationDistanceSq <= maxDistanceSq)
        {
            outputList.push(entity);
        }
    }

    return outputList;
};

EntityHelpers.getNearest = function entityhelpersGetNearestFn(entityList, v3Location, mathDevice)
{
    var entityListLength = entityList.length;

    var closestEntity = null;
    var closestDistanceSq = Number.MAX_VALUE;

    for (var entityIndex = 0; entityIndex < entityListLength; entityIndex += 1)
    {
        var entity = entityList[entityIndex];
        var v3EntityLocation = entity.getv3Location();
        var separationDistanceSq = mathDevice.v3DistanceSq(v3Location, v3EntityLocation);

        if (separationDistanceSq < closestDistanceSq)
        {
            closestEntity = entity;
        }
    }

    return closestEntity;
};

