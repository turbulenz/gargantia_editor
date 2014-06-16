/*global debug: false*/
/*global Editor: false*/

Editor.Actions.actionMap.translateSelectedObjectsInAxis =
    function editoractionsTranslateSelectedObjectsInAxisFn(globals, gameManager, params)
{
    debug.assert((params.axis !== undefined), 'Must provide an axis in params for this action.');
    debug.assert((params.value !== undefined), 'Must provide a translation delta for this action.');

    var selectedObjectGroup = Editor.State.selectedObjectGroup;
    var enableGridSnap = false;
    var axis = params.axis;
    var translationDelta = params.value;

    Editor.ObjectGroup.translateObjectGroupInAxis(
        globals, gameManager, selectedObjectGroup, translationDelta, axis, enableGridSnap);
};

Editor.Actions.actionMap.positionSelectedObjectsFromDragInAxis =
    function editoractionsPositionSelectedObjectsFromDragInAxisFn(globals, gameManager, params)
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
    dragDistance = (dragDistance * camDistanceFactor * Editor.State.dragFactor * Editor.State.positionFactor);

    var startDragLocationInAxis = startDragState.v3Location[axis];
    var newLocationInAxis = (startDragLocationInAxis + dragDistance);

    var selectedObjectsGroup = Editor.State.selectedObjectGroup;
    var enableGridSnap = Editor.State.flags.enableGridSnap;

    Editor.ObjectGroup.setObjectGroupLocationInAxis(
        globals, gameManager, selectedObjectsGroup, newLocationInAxis, axis, enableGridSnap);
};

Editor.Actions.actionMap.setSelectedObjectsLocationInAxis = function editoractionsSetSelectedObjectsLocationInAxisFn(
    globals, gameManager, params)
{
    debug.assert((params.axis !== undefined),
        'Must provide an axis in params the action: setSelectedObjectsLocationInAxis');

    var selectedObjectsGroup = Editor.State.selectedObjectGroup;
    var locationValue = params.value;
    var axis = params.axis;
    var enableGridSnap = false;

    Editor.ObjectGroup.setObjectGroupLocationInAxis(
        globals, gameManager, selectedObjectsGroup, locationValue, axis, enableGridSnap);
};