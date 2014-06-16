/*global debug: false*/
/*global Editor: false*/

Editor.Actions.actionMap.scaleSelectedObjectsInAxis = function editoractionsScaleSelectedObjectsInAxisFn(
    globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), 'Must provide an axis in params for this action.');
    debug.assert((params.value !== undefined), 'Must provide a scale delta for this action.');

    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var shouldRoundScaling = Editor.State.flags.enableGridSnap;
    var snapScaleFactor =
        (Editor.State.flags.enableMinorGridSnap ? Editor.State.minorGridSize : Editor.State.majorGridSize);
    var axis = params.axis;
    var scaleDelta = params.value;

    Editor.ObjectGroup.scaleObjectGroupInAxis(
        globals, gameManager, selectedObjectGroup, axis, scaleDelta, shouldRoundScaling, snapScaleFactor);
};

Editor.Actions.actionMap.scaleSelectedObjectsFromDragInAxis =
    function editoractionsScaleSelectedObjectsFromDragInAxisFn(globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), 'Must provide an axis in params for this action.');

    var startDragState = Editor.State.startDragState;

    if (!startDragState)
    {
        return;
    }

    var axis = params.axis;

    var mathDevice = globals.mathDevice;
    var v2DragEndScreenLocation = Editor.State.v2CursorScreenLocation;
    var v2DragStartScreenLocation = Editor.State.v2CursorStartDragScreenLocation;
    var v3AxisStartWorldLocation = startDragState.v3Location;

    var v3Axis = mathDevice.v3BuildZero();
    v3Axis[axis] = 1.0;

    var v3AxisEndWorldLocation = mathDevice.v3Add(v3AxisStartWorldLocation, v3Axis);

    var camera = globals.camera;

    var dragDistance = Editor.getScreenSpaceDragDistanceAlongWorldVector(
        v2DragStartScreenLocation, v2DragEndScreenLocation,
        v3AxisStartWorldLocation, v3AxisEndWorldLocation,
        camera, mathDevice);

    var v3CameraLocation = mathDevice.m43Pos(camera.matrix);
    var camDistanceFactor = mathDevice.v3Distance(v3AxisStartWorldLocation, v3CameraLocation);
    dragDistance = (dragDistance * camDistanceFactor * Editor.State.dragFactor * Editor.State.scaleFactor);

    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    // widgets don't rotate, choose best axis to rotate around given current object group rotation.
    // do this by finding the closest (rotated) axis to the (unrotated) selected axis.
    var m43Rotation = mathDevice.m43BuildRotationXZY(selectedObjectGroup.v3Rotation);
    v3Axis = mathDevice.v3BuildZero();
    v3Axis[axis] = 1;
    var weight0 = Math.abs(mathDevice.v3Dot(v3Axis, mathDevice.m43Right(m43Rotation)));
    var weight1 = Math.abs(mathDevice.v3Dot(v3Axis, mathDevice.m43Up(m43Rotation)));
    var weight2 = Math.abs(mathDevice.v3Dot(v3Axis, mathDevice.m43At(m43Rotation)));
    axis = weight0 >= weight1 ? (weight0 >= weight2 ? 0 : 2) : (weight1 >= weight2 ? 1 : 2);

    var startDragScaleInAxis = startDragState.v3Scale[axis];
    var newScaleInAxis = (startDragScaleInAxis + dragDistance);

    var shouldRoundScale = Editor.State.flags.enableGridSnap;
    var snapScaleFactor =
        (Editor.State.flags.enableMinorGridSnap ? Editor.State.minorGridSize : Editor.State.majorGridSize);

    Editor.ObjectGroup.setObjectGroupScaleInAxis(
        globals, gameManager, selectedObjectGroup, axis, newScaleInAxis, shouldRoundScale, snapScaleFactor);
};

Editor.Actions.actionMap.setSelectedObjectsScaleInAxis = function editoractionsSetSelectedObjectsScaleInAxisFn(
    globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), 'Must provide an axis in params for this action.');

    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var newScaleInAxis = params.value;
    var axis = params.axis;
    var shouldRoundScale = false;
    var snapScaleFactor = 1.0;

    Editor.ObjectGroup.setObjectGroupScaleInAxis(
        globals, gameManager, selectedObjectGroup, axis, newScaleInAxis, shouldRoundScale, snapScaleFactor);
};
