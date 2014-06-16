/*global Editor: true*/

Editor.Math =
{
    roundToZero : function editormathRoundToZeroFn(value)
    {
        return ((value > 0.0) ? Math.floor(value) : Math.ceil(value));
    },

    roundAwayFromZero : function editormathRoundAwayFromZeroFn(value)
    {
        return ((value > 0.0) ? Math.ceil(value) : Math.floor(value));
    },

    isV3InExtents : function editormathIsInExtentsFn(extents, v3Location)
    {
        return (
            (v3Location[0] >= extents[0] && v3Location[0] <= extents[3]) &&
            (v3Location[1] >= extents[1] && v3Location[1] <= extents[4]) &&
            (v3Location[2] >= extents[2] && v3Location[2] <= extents[5]));
    },

    calculateFrustumPlanesForScreenArea : function editormathCalculateFrustumPlanesForScreenAreaFn(
        minScreenX, minScreenY, maxScreenX, maxScreenY, camera, mathDevice)
    {
        var nearPlaneDistance = camera.nearPlane;
        var farPlaneDistance = camera.farPlane;

        var v3NearBottomLeft = camera.screenToWorld(minScreenX, minScreenY, 0.0);
        var v3CameraLocation = mathDevice.m43Pos(camera.matrix);
        var nearPlaneHypotenuseLength = mathDevice.v3Distance(v3NearBottomLeft, v3CameraLocation);
        var farPlaneHypotenuseLength = ((nearPlaneHypotenuseLength / nearPlaneDistance) * farPlaneDistance);
        var reducedFarPlaneHypotenuseLength = (farPlaneHypotenuseLength - nearPlaneHypotenuseLength);

        var v3FarBottomLeft = camera.screenToWorld(minScreenX, minScreenY, reducedFarPlaneHypotenuseLength);
        var v3BottomLeftLine = mathDevice.v3Sub(v3FarBottomLeft, v3NearBottomLeft);

        var v3NearTopLeft = camera.screenToWorld(minScreenX, maxScreenY, 0.0);
        var v3FarTopLeft = camera.screenToWorld(minScreenX, maxScreenY, reducedFarPlaneHypotenuseLength);
        var v3TopLeftLine = mathDevice.v3Sub(v3FarTopLeft, v3NearTopLeft);

        var v3NearBottomRight = camera.screenToWorld(maxScreenX, minScreenY, 0.0);
        var v3FarBottomRight = camera.screenToWorld(maxScreenX, minScreenY, reducedFarPlaneHypotenuseLength);
        var v3BottomRightLine = mathDevice.v3Sub(v3FarBottomRight, v3NearBottomRight);

        var v3NearLeftLine = mathDevice.v3Sub(v3NearTopLeft, v3NearBottomLeft);
        var v3NearRightLine = mathDevice.v3Copy(v3NearLeftLine);
        var v3NearBottomLine = mathDevice.v3Sub(v3NearBottomRight, v3NearBottomLeft);
        var v3NearTopLine = mathDevice.v3Copy(v3NearBottomLine);

        var v3LeftPlaneNormal = mathDevice.v3Cross(v3NearLeftLine, v3BottomLeftLine);
        mathDevice.v3Normalize(v3LeftPlaneNormal, v3LeftPlaneNormal);
        var leftPlaneDistanceFromOrigin = mathDevice.v3Dot(v3NearBottomLeft, v3LeftPlaneNormal);

        var v3RightPlaneNormal = mathDevice.v3Cross(v3BottomRightLine, v3NearRightLine);
        mathDevice.v3Normalize(v3RightPlaneNormal, v3RightPlaneNormal);
        var rightPlaneDistanceFromOrigin = mathDevice.v3Dot(v3NearBottomRight, v3RightPlaneNormal);

        var v3BottomPlaneNormal = mathDevice.v3Cross(v3BottomLeftLine, v3NearBottomLine);
        mathDevice.v3Normalize(v3BottomPlaneNormal, v3BottomPlaneNormal);
        var bottomPlaneDistanceFromOrigin = mathDevice.v3Dot(v3NearBottomLeft, v3BottomPlaneNormal);

        var v3TopPlaneNormal = mathDevice.v3Cross(v3NearTopLine, v3TopLeftLine);
        mathDevice.v3Normalize(v3TopPlaneNormal, v3TopPlaneNormal);
        var topPlaneDistanceFromOrigin = mathDevice.v3Dot(v3NearTopLeft, v3TopPlaneNormal);

        var v3NearPlaneNormal = mathDevice.v3Cross(v3NearBottomLine, v3NearLeftLine);
        mathDevice.v3Normalize(v3NearPlaneNormal, v3NearPlaneNormal);
        var nearPlaneDistanceFromOrigin = mathDevice.v3Dot(v3NearBottomLeft, v3NearPlaneNormal);

        var v3FarPlaneNormal = mathDevice.v3ScalarMul(v3NearPlaneNormal, -1.0);
        mathDevice.v3Normalize(v3FarPlaneNormal, v3FarPlaneNormal);
        var farPlaneDistanceFromOrigin = mathDevice.v3Dot(v3FarBottomLeft, v3FarPlaneNormal);

        var leftPlane = mathDevice.v4Build(
            v3LeftPlaneNormal[0], v3LeftPlaneNormal[1], v3LeftPlaneNormal[2], leftPlaneDistanceFromOrigin);

        var rightPlane = mathDevice.v4Build(
            v3RightPlaneNormal[0], v3RightPlaneNormal[1], v3RightPlaneNormal[2], rightPlaneDistanceFromOrigin);

        var bottomPlane = mathDevice.v4Build(
            v3BottomPlaneNormal[0], v3BottomPlaneNormal[1], v3BottomPlaneNormal[2], bottomPlaneDistanceFromOrigin);

        var topPlane = mathDevice.v4Build(
            v3TopPlaneNormal[0], v3TopPlaneNormal[1], v3TopPlaneNormal[2], topPlaneDistanceFromOrigin);

        var nearPlane = mathDevice.v4Build(
            v3NearPlaneNormal[0], v3NearPlaneNormal[1], v3NearPlaneNormal[2], nearPlaneDistanceFromOrigin);

        var farPlane = mathDevice.v4Build(
            v3FarPlaneNormal[0], v3FarPlaneNormal[1], v3FarPlaneNormal[2], farPlaneDistanceFromOrigin);

        return [leftPlane, rightPlane, bottomPlane, topPlane, nearPlane, farPlane];
    }
};
