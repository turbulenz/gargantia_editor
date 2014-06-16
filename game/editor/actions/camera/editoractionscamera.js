/*global Editor: false*/

Editor.Actions.actionMap.freeCamForward = function editoractionsFreeCamForwardFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveForward(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.freeCamBackward = function editoractionsFreeCamBackwardFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveBackward(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.freeCamLeft = function editoractionsFreeCamLeftFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveLeft(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.freeCamRight = function editoractionsFreeCamRightFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveRight(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.freeCamUp = function editoractionsFreeCamUpFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveUp(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.freeCamDown = function editoractionsFreeCamDownFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.moveDown(Editor.State.cameraMovementSpeed);
};

Editor.Actions.actionMap.enableFreeCamLook = function editoractionsEnableFreeCamLookFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.enableFreeCamLook();
};

Editor.Actions.actionMap.disableFreeCamLook = function editoractionsDisableFreeCamLookFn(globals, gameManager /*, params*/)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    cameraController.disableFreeCamLook();
};

Editor.Actions.actionMap.freeCamTurn = function editoractionsFreeCamTurnFn(globals, gameManager, params)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    var delta = (params.delta || 1.0);

    cameraController.look(delta * Editor.State.cameraLookSpeed, 0.0);
};

Editor.Actions.actionMap.freeCamPitch = function editoractionsFreeCamPitchFn(globals, gameManager, params)
{
    var gameCamera = gameManager.getGameCamera();
    var cameraController = gameCamera.cameraController;

    var delta = (params.delta || 1.0);

    cameraController.look(0.0, delta * Editor.State.cameraLookSpeed);
};