/*global debug: false*/
/*global Editor: false*/

Editor.Conditions =
{
    conditionMap :
    {
        // Input conditions

        keyPress : function wasKeyPressedFn(
            control, newInputState, previousInputState, keyCodes /*, mouseCodes*/)
        {
            var keyName = control.key;
            var keyCode = keyCodes[keyName];

            debug.assert((keyCode !== undefined), 'Key code not recognised: \'' + keyName + '\'');

            return Editor.Input.wasKeyPressed(newInputState, previousInputState, keyCode);
        },

        keyRelease : function wasKeyReleasedFn(
            control, newInputState, previousInputState, keyCodes /*, mouseCodes*/)
        {
            var keyName = control.key;
            var keyCode = keyCodes[keyName];

            debug.assert((keyCode !== undefined), 'Key code not recognised: \'' + keyName + '\'');

            return Editor.Input.wasKeyReleased(newInputState, previousInputState, keyCode);
        },

        keyDown : function isKeyDownFn(
            control, newInputState, previousInputState, keyCodes /*, mouseCodes*/)
        {
            var keyName = control.key;
            var keyCode = keyCodes[keyName];

            debug.assert((keyCode !== undefined), 'Key code not recognised: \'' + keyName + '\'');

            return Editor.Input.isKeyDown(newInputState, keyCode);
        },

        keyUp : function isKeyUpFn(
            control, newInputState, previousInputState, keyCodes /*, mouseCodes*/)
        {
            var keyName = control.key;
            var keyCode = keyCodes[keyName];

            debug.assert((keyCode !== undefined), 'Key code not recognised: \'' + keyName + '\'');

            return !Editor.Input.isKeyDown(newInputState, keyCode);
        },

        doubleKeyPress : function isDoubleKeyPress(
            control, newInputState, previousInputState, keyCodes /*, mouseCodes*/)
        {
            var keyNameA = control.keyA;
            var keyNameB = control.keyB;
            var keyCodeA = keyCodes[keyNameA];
            var keyCodeB = keyCodes[keyNameB];

            debug.assert((keyCodeA !== undefined), 'Key code not recognised: \'' + keyNameA + '\'');
            debug.assert((keyCodeB !== undefined), 'Key code not recognised: \'' + keyNameB + '\'');

            var input = Editor.Input;

            return ((input.isKeyDown(newInputState, keyCodeA) && input.wasKeyPressed(newInputState, previousInputState, keyCodeB)) ||
                (input.isKeyDown(newInputState, keyCodeB) && input.wasKeyPressed(newInputState, previousInputState, keyCodeA)) ||
                (input.wasKeyPressed(newInputState, keyCodeA) && input.wasKeyPressed(newInputState, previousInputState, keyCodeB)));
        },

        mouseDown : function isMouseDownFn(
            control, newInputState, previousInputState, keyCodes, mouseCodes)
        {
            var buttonName = control.button;
            var mouseCode = mouseCodes[buttonName];

            debug.assert((mouseCode !== undefined), 'Mouse code not recognised: \'' + buttonName + '\'.');

            return Editor.Input.isMouseDown(newInputState, mouseCode);
        },

        mouseUp : function isMouseUpFn(
            control, newInputState, previousInputState, keyCodes, mouseCodes)
        {
            var buttonName = control.button;
            var mouseCode = mouseCodes[buttonName];

            debug.assert((mouseCode !== undefined), 'Mouse code not recognised: \'' + buttonName + '\'.');

            return !Editor.Input.isMouseDown(newInputState, mouseCode);
        },

        mousePress : function wasMousePressedFn(
            control, newInputState, previousInputState, keyCodes, mouseCodes)
        {
            var buttonName = control.button;
            var mouseCode = mouseCodes[buttonName];

            debug.assert((mouseCode !== undefined), 'Mouse code not recognised: \'' + buttonName + '\'.');

            return Editor.Input.wasMousePressed(newInputState, previousInputState, mouseCode);
        },

        mouseRelease : function wasMouseReleasedFn(
            control, newInputState, previousInputState, keyCodes, mouseCodes)
        {
            var buttonName = control.button;
            var mouseCode = mouseCodes[buttonName];

            debug.assert((mouseCode !== undefined), 'Mouse code not recognised: \'' + buttonName + '\'.');

            return Editor.Input.wasMouseReleased(newInputState, previousInputState, mouseCode);
        },

        mouseEnter : function wasMouseEnteredFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            return Editor.Input.wasMouseEntered(newInputState);
        },

        mouseLeave : function wasMouseLeaveFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            return Editor.Input.wasMouseLeft(newInputState);
        },

        blur : function wasBlurredFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            return Editor.Input.wasBlurred(newInputState);
        },

        mouseMoveX : function wasMouseMovedXFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            var mouseDeltaX = Editor.Input.getMouseDeltaX(newInputState);

            if (mouseDeltaX)
            {
                return {
                    delta : mouseDeltaX
                };
            }
            else
            {
                return false;
            }
        },

        mouseMoveY : function wasMouseMovedYFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            var mouseDeltaY = Editor.Input.getMouseDeltaY(newInputState);

            if (mouseDeltaY)
            {
                return {
                    delta : mouseDeltaY
                };
            }
            else
            {
                return false;
            }
        },

        mouseOver : function wasMouseOverFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            var mouseX = Editor.Input.getMouseX(newInputState);
            var mouseY = Editor.Input.getMouseY(newInputState);

            if (mouseX || mouseY)
            {
                return {
                    x : mouseX,
                    y : mouseY
                };
            }
            else
            {
                return false;
            }
        },

        mouseMove : function wasMouseMovedFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            var mouseDeltaX = Editor.Input.getMouseDeltaX(newInputState);
            var mouseDeltaY = Editor.Input.getMouseDeltaY(newInputState);

            if (mouseDeltaX || mouseDeltaY)
            {
                return {
                    deltaX : mouseDeltaX,
                    deltaY : mouseDeltaY
                };
            }
            else
            {
                return false;
            }
        },

        mouseWheel : function isMouseWheelMovedFn(
            control, newInputState /*, previousInputState, keyCodes, mouseCodes*/)
        {
            var mouseWheelDelta = Editor.Input.getMouseWheelDelta(newInputState);

            if (mouseWheelDelta)
            {
                return {
                    delta : mouseWheelDelta
                };
            }
            else
            {
                return false;
            }
        },

        // Misc conditions

        hasSelectedObjects : function hasSelectedObjectsFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            return Editor.State.selectedObjectGroup;
        },

        hasNoSelectedObjects : function hasNoSelectedObjectsFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            return !Editor.State.selectedObjectGroup;
        },

        isObjectAtCursorSelected : function isObjectAtCursorSelectedFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;
            var objectAtCursor = Editor.State.objectAtCursor;

            return Editor.ObjectGroup.isInObjectGroup(selectedObjectGroup, objectAtCursor);
        },

        isObjectAtCursorUnselected : function isObjectAtCursorUnselectedFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var selectedObjectGroup = Editor.State.selectedObjectGroup;
            var objectAtCursor = Editor.State.objectAtCursor;

            return !Editor.ObjectGroup.isInObjectGroup(selectedObjectGroup, objectAtCursor);
        },

        isWidgetAtCursor : function isWidgetAtCursorFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap*/)
        {
            return (Editor.State.widgetAtCursor !== null);
        },

        hasNoWidgetAtCursor : function hasNoWidgetAtCursorFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap*/)
        {
            return (Editor.State.widgetAtCursor === null);
        },

        isWidgetXAtCursor : function isWidgetXAtCursorFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap*/)
        {
            var widgetAtCursor = Editor.State.widgetAtCursor;

            return (widgetAtCursor && (widgetAtCursor.axis === 0));
        },

        isWidgetYAtCursor : function isWidgetYAtCursorFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap*/)
        {
            var widgetAtCursor = Editor.State.widgetAtCursor;

            return (widgetAtCursor && (widgetAtCursor.axis === 1));
        },

        isWidgetZAtCursor : function isWidgetZAtCursorFn(
            /*control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap*/)
        {
            var widgetAtCursor = Editor.State.widgetAtCursor;

            return (widgetAtCursor && (widgetAtCursor.axis === 2));
        },

        isDragging : function isDraggingFn(/*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            return (Editor.State.v2CursorStartDragScreenLocation !== null);
        },

        isNotDragging : function isNotDraggingFn(/*control, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            return (Editor.State.v2CursorStartDragScreenLocation === null);
        },

        isDragDistanceGreaterThan : function isDragDistanceGreaterThanFn(
            control /*, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var v2StartDragLocation = Editor.State.v2CursorStartDragScreenLocation;
            var v2CurrentDragLocation = Editor.State.v2CursorScreenLocation;
            var deltaX = (v2CurrentDragLocation[0] - v2StartDragLocation[0]);
            var deltaY = (v2CurrentDragLocation[1] - v2StartDragLocation[1]);
            var dragDistanceSq = ((deltaX * deltaX) + (deltaY * deltaY));
            var minDistanceSq = (control.distance * control.distance);

            return (dragDistanceSq > minDistanceSq);
        },

        isFlagOn : function isFlagOnFn(control /*, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var flagName = control.name;

            debug.assert(flagName, 'Cannot test flag condition without valid flag name: ' + flagName);

            return (Editor.State.flags[flagName] ? true : false);
        },

        isFlagOff : function isFlagOffFn(control /*, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var flagName = control.name;

            debug.assert(flagName, 'Cannot test flag condition without valid flag name: ' + flagName);

            return (Editor.State.flags[flagName] ? false : true);
        },

        isSet : function isSetFn(control /*, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var varName = control.name;

            debug.assert(varName, 'Cannot test editor state condition without valid var name: ' + varName);

            return (Editor.getEditorStateFromName(varName) !== null);
        },

        isNotSet : function isNotSetFn(control /*, newInputState, previousInputState, keyCodes, mouseCodes*/)
        {
            var varName = control.name;

            debug.assert(varName, 'Cannot test editor state condition without valid var name: ' + varName);

            return (Editor.getEditorStateFromName(varName) === null);
        },

        uiElementInteract : function uiElementInteractFn(
            control, newInputState, previousInputState, keyCodes, mouseCodes, uiElementStateMap)
        {
            var elementId = control.id;

            debug.assert((elementId !== undefined), '\'uiElementInteract\' condition has no \'id\' param.');

            return uiElementStateMap[elementId];
        }
    }
};