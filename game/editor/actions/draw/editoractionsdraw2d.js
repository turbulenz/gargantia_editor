/*global Editor: false*/

Editor.Actions.actionMap.drawSelectionArea = function editoractions2dDrawSelectionAreaFn(
    globals /*, gameManager, params*/)
{
    var v2StartDragLocation = Editor.State.v2CursorStartDragScreenLocation;
    var v2CurrentLocation = Editor.State.v2CursorScreenLocation;

    var minX = Math.min(v2StartDragLocation[0], v2CurrentLocation[0]);
    var maxX = Math.max(v2StartDragLocation[0], v2CurrentLocation[0]);
    var minY = Math.min(v2StartDragLocation[1], v2CurrentLocation[1]);
    var maxY = Math.max(v2StartDragLocation[1], v2CurrentLocation[1]);

    var mathDevice = globals.mathDevice;
    var v4Colour = mathDevice.v4Build(0.8, 0.8, 1.0, 0.5);

    Editor.Draw.draw2dBox(minX, minY, maxX, maxY, v4Colour, globals.draw2D, globals.textureManager);
};