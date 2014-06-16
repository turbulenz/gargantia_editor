/*global debug: false*/
/*global Editor: false*/

Editor.Actions.actionMap.rotateSelectedObjectsInAxis = function editoractionsRotateSelectedObjectsFn(
    globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), "Must provide an axis in params for this action.");
    debug.assert((params.value !== undefined), 'Must provide a rotation amount in params for this action.');

    var shouldRoundRotation = Editor.State.flags.enableGridSnap;
    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var axis = params.axis;
    var rotationDelta = params.value;

    Editor.ObjectGroup.rotateObjectGroupInAxis(globals, selectedObjectGroup, axis, rotationDelta, shouldRoundRotation);
};

Editor.Actions.actionMap.rotateSelectedObjectsFromDragInAxis =
    function editoractionsRotateSelectedObjectsFromDragInAxisFn(globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), "Must provide an axis in params for this action.");
    var axis = params.axis;
    var startDragState = Editor.State.startDragState;

    if (!startDragState)
    {
        return;
    }

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

    var dragScaleFactor = Editor.State.rotationFactor;
    var startDragRotation = startDragState.v3Rotation[axis];
    var newRotation = (startDragRotation + (dragDistance * dragScaleFactor));

    var shouldRoundRotation = Editor.State.flags.enableGridSnap;
    var selectedObjectGroup = Editor.State.selectedObjectGroup;

    Editor.ObjectGroup.setObjectGroupRotationInAxis(globals, selectedObjectGroup, axis, newRotation, shouldRoundRotation);
};

Editor.Actions.actionMap.setSelectedObjectsRotationAxisInDegrees =
    function editoractionsSetSelectedObjectsRotationAxisInDegreesFn(globals, gameManager, params)
{
    debug.assert((params.axis !== undefined),
        'Must provide an axis in params the action: setSelectedObjectsRotationAxisInDegrees');

    var rotationInDegrees = params.value;
    params.value = (rotationInDegrees * ((2 * Math.PI) / 360));

    Editor.Actions.actionMap.setSelectedObjectsRotationInAxis(globals, gameManager, params);
};

Editor.Actions.actionMap.setSelectedObjectsRotationInAxis = function editoractionsSetSelectedObjectsRotationInAxisFn(
    globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), "Must provide an axis in params for this action.");
    debug.assert((params.value !== undefined), 'Must provide a rotation amount in params for this action.');

    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var axis = params.axis;
    var rotation = params.value;
    var shouldRoundRotation = false;

    Editor.ObjectGroup.setObjectGroupRotationInAxis(globals, selectedObjectGroup, axis, rotation, shouldRoundRotation);
};
