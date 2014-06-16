//
// Level Editor State - be creative!
//

/*global GameManager: false*/
/*global Editor: false*/

function GamestateEditor() {}

GamestateEditor.prototype =
{
    name : 'GamestateEditor',

    enterState : function gamestateeditorEnterStateFn()
    {
        var gameManager = this.gameManager;
        var entityFactory = gameManager.getEntityFactory();
        var blockFactory = gameManager.getBlockFactory();
        var gameController = gameManager.getGameController();
        var gameCamera = gameManager.getGameCamera();

        gameController.setActive(false);
        Editor.Input.addEventHandlers(this.globals.inputDevice);

        gameCamera.setModeEditor();

        gameManager.startPaused();

        var entityArchetypeList = entityFactory.getArchetypeList();
        var blockArchetypeList = blockFactory.getArchetypeList();
        var globals = this.globals;
        var v2CursorScreenLocation = gameController.getv2ScreenCoord();

        Editor.initState(
            Editor.Settings,
            entityArchetypeList,
            blockArchetypeList,
            v2CursorScreenLocation,
            globals,
            gameManager);

        var actionMap = Editor.Actions.actionMap;
        var actionNameList = Editor.State.actionListOnEnterEditorMode;

        var actionList = Editor.Actions.createActionList(actionNameList, actionMap, {});

        Editor.Actions.executeActionList(actionList, this.globals, gameManager);

        Editor.initUI(Editor.Settings, globals, gameManager);
    },

    exitState : function gamestateeditorExitStateFn()
    {
        var globals = this.globals;
        var gameManager = this.gameManager;
        var gameController = gameManager.getGameController();
        var gameCamera = gameManager.getGameCamera();

        gameManager.exitPaused();

        Editor.Input.removeEventHandlers(this.globals.inputDevice);
        gameController.setActive(true);

        gameCamera.exitModeEditor();

        var actionMap = Editor.Actions.actionMap;
        var actionNameList = Editor.State.actionListOnExitEditorMode;

        var actionList = Editor.Actions.createActionList(actionNameList, actionMap, {});

        Editor.Actions.executeActionList(actionList, globals, gameManager);
        Editor.removeUI(globals);
    },

    update : function gamestateeditorUpdateFn()
    {
        var globals = this.globals;
        var inputDevice = this.globals.inputDevice;
        var gameManager = this.gameManager;

        gameManager.gameLighting.update();

        gameManager.updateGame();

        var newInputState = Editor.Input.getCurrentState();
        var previousInputState = Editor.Input.getPreviousState();
        var controlLists = Editor.State.controlLists;
        var conditionMap = Editor.Conditions.conditionMap;
        var actionMap = Editor.Actions.actionMap;

        var uiElementStateMap = Editor.UI.getUIState();
        var actionList = Editor.Controller.convertControlsIntoActions(
            controlLists, conditionMap, actionMap, newInputState, previousInputState, uiElementStateMap, inputDevice);

        Editor.Actions.executeActionList(actionList, globals, gameManager);

        Editor.UI.clearState();
        Editor.Input.updateState();
    },

    draw : function gamestateeditorDrawFn()
    {
        var globals = this.globals;
        var gameManager = this.gameManager;

        var drawControlLists = Editor.State.drawControlLists;
        var conditionMap = Editor.Conditions.conditionMap;
        var actionMap = Editor.Actions.actionMap;

        var actionList = Editor.Controller.convertControlsIntoActions(drawControlLists, conditionMap, actionMap);

        Editor.Actions.executeActionList(actionList, globals, gameManager);
    },

    draw2D : function gamestateeditorDraw2DFn()
    {
        var globals = this.globals;
        var gameManager = this.gameManager;

        var draw2dControlLists = Editor.State.draw2dControlLists;
        var conditionMap = Editor.Conditions.conditionMap;
        var actionMap = Editor.Actions.actionMap;

        var actionList = Editor.Controller.convertControlsIntoActions(draw2dControlLists, conditionMap, actionMap);

        Editor.Actions.executeActionList(actionList, globals, gameManager);
    }
};

GamestateEditor.create = function gamestateeditorCreateFn(gameManager, globals)
{
    var state = new GamestateEditor();

    state.gameManager = gameManager;
    state.globals = globals;

    return state;
};

GameManager.gameStateCreationMap.GamestateEditor = GamestateEditor;
