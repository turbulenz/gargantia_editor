/*global debug: false*/
/*global Editor: false*/

Editor.Input =
{
    // State!!!
    state :
    {
        pressedKeys : {},
        pressedButtons : {},
        mouseDeltaX : 0.0,
        mouseDeltaY : 0.0,
        mouseX : 0.0,
        mouseY : 0.0,
        mouseWheelDelta : 0.0,
        mouseEnter : false,
        mouseLeave : false,
        blur : false
    },

    previousState :
    {
        pressedKeys : {},
        pressedButtons : {},
        mouseDeltaX : 0.0,
        mouseDeltaY : 0.0,
        mouseX : 0.0,
        mouseY : 0.0,
        mouseWheelDelta : 0.0,
        mouseEnter : false,
        mouseLeave : false,
        blur : false
    },

    eventHandlersActive : false,

    getCurrentState : function editorinputstateGetCurrentStateFn()
    {
        return Editor.Input.state;
    },

    getPreviousState : function editorinputstateGetPreviousStateFn()
    {
        return Editor.Input.previousState;
    },

    clearState : function editorinputClearStateFn()
    {
        var state = Editor.Input.state;

        state.pressedKeys = {};
        state.pressedButtons = {};
    },

    updateState : function editorinputstateUpdateStateFn()
    {
        Editor.Input.previousState = Editor.Input.state;

        var previousKeyState = Editor.Input.previousState.pressedKeys;
        var previousButtonState = Editor.Input.previousState.pressedButtons;

        var newKeyState = {};
        var newMouseState = {};

        var keyName;
        var buttonName;

        for (keyName in previousKeyState)
        {
            if (previousKeyState.hasOwnProperty(keyName))
            {
                newKeyState[keyName] = previousKeyState[keyName];
            }
        }

        for (buttonName in previousButtonState)
        {
            if (previousButtonState.hasOwnProperty(buttonName))
            {
                newMouseState[buttonName] = previousButtonState[buttonName];
            }
        }

        Editor.Input.state =
        {
            pressedKeys : newKeyState,
            pressedButtons : newMouseState,
            mouseDeltaX : 0.0,
            mouseDeltaY : 0.0,
            mouseX : 0,
            mouseY : 0,
            mouseWheelDelta : 0.0,
            mouseEnter : false,
            mouseLeave : false,
            blur : false
        };
    },

    // State query methods

    isMouseDown : function editorinputstateIsMouseDownFn(inputState, mouseCode)
    {
        return (inputState.pressedButtons[mouseCode] ? true : false);
    },

    wasMousePressed : function editorinputWasMousePressedFn(inputState, previousInputState, mouseCode)
    {
        return (inputState.pressedButtons[mouseCode] && !previousInputState.pressedButtons[mouseCode]);
    },

    wasMouseReleased : function editorinputWasMouseReleasedFn(inputState, previousInputState, mouseCode)
    {
        return (!inputState.pressedButtons[mouseCode] && previousInputState.pressedButtons[mouseCode]);
    },

    isKeyDown : function editorinputIsKeyDownFn(inputState, keyCode)
    {
        return (inputState.pressedKeys[keyCode] ? true : false);
    },

    wasKeyPressed : function editorinputstateWasPressedFn(inputState, previousInputState, keyCode)
    {
        return (inputState.pressedKeys[keyCode] && !previousInputState.pressedKeys[keyCode]);
    },

    wasKeyReleased : function editorinputstateWasReleasedFn(inputState, previousInputState, keyCode)
    {
        return (!inputState.pressedKeys[keyCode] && previousInputState.pressedKeys[keyCode]);
    },

    wasMouseEntered : function editorinputWasMouseEnteredFn(inputState)
    {
        return inputState.mouseEnter;
    },

    wasMouseLeft : function editorinputWasMouseLeftFn(inputState)
    {
        return inputState.mouseLeave;
    },

    wasBlurred : function editorinputWasBlurredFn(inputState)
    {
        return inputState.wasBlurred;
    },

    getMouseDeltaX : function editorinputGetMouseDeltaXFn(inputState)
    {
        return inputState.mouseDeltaX;
    },

    getMouseX : function editorinputGetMouseXFn(inputState)
    {
        return inputState.mouseX;
    },

    getMouseY : function editorinputGetMouseYFn(inputState)
    {
        return inputState.mouseY;
    },

    getMouseDeltaY : function editorinputGetMouseDeltaYFn(inputState)
    {
        return inputState.mouseDeltaY;
    },

    getMouseWheelDelta : function editorinputGetMouseWheelDelta(inputState)
    {
        return inputState.mouseWheelDelta;
    },

    // Event handlers

    onKeyDown : function editorinputstateOnKeyDownFn(keyCode)
    {
        this.state.pressedKeys[keyCode] = true;
    },

    onKeyUp : function editorinputstateOnKeyUpFn(keyCode)
    {
        this.state.pressedKeys[keyCode] = false;
    },

    onMouseDown : function editorinputstateOnMouseDownFn(buttonCode /*, x, y*/)
    {
        this.state.pressedButtons[buttonCode] = true;

        if (buttonCode === this.inputDevice.mouseCodes.BUTTON_1)
        {
            this.inputDevice.lockMouse();
            this.inputDevice.hideMouse();
        }
    },

    onMouseUp : function editorinputstateOnMouseUpFn(buttonCode /*, x, y*/)
    {
        this.state.pressedButtons[buttonCode] = false;

        if (buttonCode === this.inputDevice.mouseCodes.BUTTON_1)
        {
            this.inputDevice.unlockMouse();
            this.inputDevice.showMouse();
        }
    },

    onMouseMove : function editorinputOnMouseMoveFn(deltaX, deltaY)
    {
        this.state.mouseDeltaX += deltaX;
        this.state.mouseDeltaY += deltaY;
    },

    onMouseOver : function editorinputOnMouseOverFn(x, y)
    {
        this.state.mouseX = x;
        this.state.mouseY = y;
    },

    onMouseWheel : function editorinputOnMouseWheelFn(delta)
    {
        this.state.mouseWheelDelta += delta;
    },

    onMouseEnter : function editorinputOnMouseEnterFn()
    {
        this.state.mouseEnter = true;
    },

    onMouseLeave : function editorinputOnMouseLeaveFn()
    {
        this.state.mouseLeave = true;
    },

    onBlur : function editorinputOnBlurFn()
    {
        this.clearState();

        this.state.blur = true;
    },

    addEventHandlers : function editorinputstateAddEventHandlersFn(inputDevice)
    {
        debug.assert(!Editor.Input.eventHandlersActive, 'Trying to re-add editor input event handlers.');

        Editor.Input.eventHandlersActive = true;

        if (!this.onKeyUpBound)
        {
            this.onKeyUpBound = this.onKeyUp.bind(this);
            this.onKeyDownBound = this.onKeyDown.bind(this);
            this.onMouseUpBound = this.onMouseUp.bind(this);
            this.onMouseDownBound = this.onMouseDown.bind(this);
            this.onMouseMoveBound = this.onMouseMove.bind(this);
            this.onMouseWheelBound = this.onMouseWheel.bind(this);
            this.onMouseOverBound = this.onMouseOver.bind(this);
            this.onMouseEnterBound = this.onMouseEnter.bind(this);
            this.onMouseLeaveBound = this.onMouseLeave.bind(this);
            this.onBlurBound = this.onBlur.bind(this);
        }

        inputDevice.addEventListener('keyup', this.onKeyUpBound);
        inputDevice.addEventListener('keydown', this.onKeyDownBound);
        inputDevice.addEventListener('mouseup', this.onMouseUpBound);
        inputDevice.addEventListener('mousedown', this.onMouseDownBound);
        inputDevice.addEventListener('mousemove', this.onMouseMoveBound);
        inputDevice.addEventListener('mousewheel', this.onMouseWheelBound);
        inputDevice.addEventListener('mouseover', this.onMouseOverBound);
        inputDevice.addEventListener('mouseenter', this.onMouseEnterBound);
        inputDevice.addEventListener('mouseleave', this.onMouseLeaveBound);
        inputDevice.addEventListener('blur', this.onBlurBound);

        this.inputDevice = inputDevice;
    },

    removeEventHandlers : function editorinputstateRemoveEventHandlersFn(inputDevice)
    {
        debug.assert(Editor.Input.eventHandlersActive, 'Trying to remove editor input event handlers which were never added.');

        Editor.Input.eventHandlersActive = false;

        inputDevice.removeEventListener('keyup', this.onKeyUpBound);
        inputDevice.removeEventListener('keydown', this.onKeyDownBound);
        inputDevice.removeEventListener('mouseup', this.onMouseUpBound);
        inputDevice.removeEventListener('mousedown', this.onMouseDownBound);
        inputDevice.removeEventListener('mousemove', this.onMouseMoveBound);
        inputDevice.removeEventListener('mousewheel', this.onMouseWheelBound);
        inputDevice.removeEventListener('mouseover', this.onMouseOverBound);
        inputDevice.removeEventListener('mouseenter', this.onMouseEnterBound);
        inputDevice.removeEventListener('mouseleave', this.onMouseLeaveBound);
        inputDevice.removeEventListener('blur', this.onBlurBound);

        delete this.inputDevice;
    }
};