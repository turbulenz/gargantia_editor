// Copyright (c) 2012-2014 Turbulenz Limited
/*jshint nomen: false*/
/*global TurbulenzBridge: false*/
/**
* The DynamicUI manager sends events to the DynamicUI server to create instances of UI elements on the host website. It
* then manages updates to the UI either responding to requests for the value for a specific UI element, or pushing
* values to elements referenced by id.
*/
var DynamicUIManager = (function () {
    function DynamicUIManager() {
        this.typedArrayTypes = [
            "[object Float64Array]",
            "[object Float32Array]",
            "[object Int32Array]",
            "[object Int16Array]",
            "[object Int8Array]",
            "[object Uint32Array]",
            "[object Uint16Array]",
            "[object Uint8Array]"
        ];
    }
    /**
    * Generates a new id for use in the dynamicUI system
    *
    * @return A new unique id to use
    */
    DynamicUIManager.prototype.newId = function () {
        DynamicUIManager.lastId += 1;
        return DynamicUIManager.lastId;
    };

    /**
    * Helper function to add a new UI element. Sends an event to the dynamicUI server and sets up listeners to
    * handle requests to get and set the value that come form the UI.
    *
    * @param {String} type The type of the UI element used
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addUI = function (type, title, getValue, setValue, groupId, options) {
        if (typeof getValue === "undefined") { getValue = function () {
        }; }
        if (typeof setValue === "undefined") { setValue = function () {
        }; }
        if (typeof groupId === "undefined") { groupId = null; }
        if (typeof options === "undefined") { options = {}; }
        var id = this.newId();
        TurbulenzBridge.emit('dynamicui.add-item', JSON.stringify({
            id: id,
            type: type,
            title: title,
            groupId: groupId,
            value: getValue(),
            options: options
        }));

        this.setters[id] = setValue;
        this.getters[id] = getValue;
        return id;
    };

    /**
    * Utility function to handle "watch stashed object" events.
    *
    * @param paramstring The JSONified request
    */
    DynamicUIManager.prototype.watchStashedObject = function (paramstring) {
        var params = JSON.parse(paramstring);
        var id = params.id;
        var property = params.property;
        var title = params.title || id;
        var ui = (params.ui);
        var options = params.options || {};
        var groupId = params.groupId || this.watchGroup;
        this.watchVariable(title, this.objects[id], property, ui, groupId, options);
    };

    DynamicUIManager.prototype.addTitle = function (title, getValue, setValue, groupId, options) {
        return this.addUI('title', title, getValue, setValue, groupId, options);
    };

    DynamicUIManager.prototype.addDescription = function (title, getValue, setValue, groupId, options) {
        return this.addUI('description', title, getValue, setValue, groupId, options);
    };

    DynamicUIManager.prototype.addSeparator = function (title, groupId, options) {
        return this.addUI('separator', title, undefined, undefined, groupId, options);
    };

    DynamicUIManager.prototype.addVectorSlider = function (title, getValue, setValue, groupId, options) {
        return this.addUI('vector-slider', title, getValue, setValue, groupId, options);
    };

    DynamicUIManager.prototype.addVectorText = function (title, getValue, setValue, groupId, options) {
        return this.addUI('vector-text', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds a slider to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addSlider = function (title, getValue, setValue, groupId, options) {
        return this.addUI('slider', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds a checkbox to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addCheckbox = function (title, getValue, setValue, groupId, options) {
        return this.addUI('checkbox', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds a button to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} onClick A callback that is called when the button is pressed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addButton = function (title, onClick, groupId, options) {
        return this.addUI('button', title, function () {
        }, onClick, groupId, options);
    };

    DynamicUIManager.prototype.addButtons = function (title, onClick, groupId, options) {
        return this.addUI('buttons', title, function () {
        }, onClick, groupId, options);
    };

    /**
    * Adds a tree to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getSelected A callback that gets a list of currently selected nodes
    * @param {Function} setSelected A callback that is called when the currently selected nodes on the tree is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addTree = function (title, getSelected, setSelected, groupId) {
        return this.addUI('tree', title, getSelected, setSelected, groupId, {});
    };

    /**
    * Adds a node to the specified tree.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} onExpanded A callback that is called if the node is expanded
    * @param [treeId] The id of the parent tree.
    * @param {boolean} [expanded] Whether the node is expanded.
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addTreeNode = function (title, onExpanded, treeId, expanded) {
        return this.addUI('treeNode', title, function () {
        }, onExpanded, treeId, { expanded: expanded });
    };

    /**
    * Adds a node to the specified tree.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [treeId] The id of the parent tree. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addTreeLeafNode = function (title, getValue, setValue, treeId, options) {
        return this.addUI('treeLeaf', title, getValue, setValue, treeId, options);
    };

    /**
    * Adds a drop-down selector to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addSelect = function (title, getValue, setValue, groupId, options) {
        return this.addUI('select', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds an icon grid to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addIconGrid = function (title, onSelectionChanged, groupId, options) {
        return this.addUI('iconGrid', title, undefined, onSelectionChanged, groupId, options);
    };

    /**
    * Adds an updatable label to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addWatch = function (title, getValue, groupId, options) {
        return this.addUI('watch', title, getValue, undefined, groupId, options);
    };

    /**
    * Adds an editable text box to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addTextBox = function (title, getValue, setValue, groupId, options) {
        return this.addUI('text', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds a set of radio buttons to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addRadioButton = function (title, getValue, setValue, groupId, options) {
        return this.addUI('radio', title, getValue, setValue, groupId, options);
    };

    /**
    * Adds a color picker to the specified group.
    *
    * @param {String} title The title to use for the UI element
    * @param {Function} getValue A callback that gets the value for the UI element
    * @param {Function} setValue A callback that is called when the value in the UI is changed
    * @param [groupId] The group id of the parent group. If not defined then the default group is used
    * @param [options] An object containing UI specific options. The details of this will depend on the implementation
    * of the DynamicUI server
    * @returns {number} The id of the new element to use to push values to this UI element
    */
    DynamicUIManager.prototype.addColorPicker = function (title, getValue, setValue, groupId, options) {
        return this.addUI('colorpicker', title, getValue, setValue, groupId, options);
    };

    /**
    * Destroys the specified UI element.
    *
    * @param id The Id of the element to destroy. If the element is a group, the group and all its children are
    * destroyed
    */
    DynamicUIManager.prototype.destroy = function (id) {
        TurbulenzBridge.emit('dynamicui.destroy', JSON.stringify({
            id: id
        }));
    };

    /**
    * Updates the specified UI element with a new value.
    *
    * @param id The Id of the element to update
    * @param value The value to send to the UI
    */
    DynamicUIManager.prototype.pushValue = function (id, value) {
        TurbulenzBridge.emit('dynamicui.pushvalue', JSON.stringify({
            id: id,
            value: value
        }));
    };

    /**
    * Updates the specified UI element with new options. Not all options can be set, this depends on the UI control
    *
    * @param id The Id of the element to update
    * @param options The options to send to the UI
    */
    DynamicUIManager.prototype.pushOptions = function (id, options) {
        TurbulenzBridge.emit('dynamicui.pushoptions', JSON.stringify({
            id: id,
            options: options
        }));
    };

    /**
    * Adds a group to the dynamid UI.
    *
    * @param {String} title The title of the group
    * @param {number} groupId The parent group to add this new group to
    * @param options An object containing an 'onChange' callback accepting argument of whether group was collapsed or not, and a boolean 'expanded' of whether group should be already expanded or not.
    * @returns {number} The id of the newly created group.
    */
    DynamicUIManager.prototype.addGroup = function (title, groupId, onChange, options) {
        var id = this.newId();
        if (onChange) {
            this.setters[id] = onChange;
        }

        TurbulenzBridge.emit('dynamicui.group-create', JSON.stringify({
            id: id,
            title: title,
            groupId: groupId || null,
            options: options || {}
        }));
        return id;
    };

    /**
    * Displays a modal to the user. The modal should be used as a group in the dynamic UI and controls added as normal
    *
    * @param {String} title The title of the modal
    * @param {Function} onClose A function called if the modal is closed by clicking away from the modal
    * @param [options] display options
    * @returns {number} the ID of the modal to use as a group for adding more controls
    */
    DynamicUIManager.prototype.showModal = function (title, onClose, options) {
        var id = this.newId();
        TurbulenzBridge.emit('dynamicui.modal-show', JSON.stringify({
            id: id,
            title: title,
            onClose: onClose,
            options: options
        }));
        return id;
    };

    /**
    * Adds a UI element to an existing group. The element is moved, so if it is already a member of a group it
    * will be removed from that group and added to the group specified in the function call.
    *
    * @param {number} id The id of the element to move
    * @param {number} groupId The parent group to add this new group to
    * @param [options] display options
    */
    DynamicUIManager.prototype.addToGroup = function (id, groupId, options) {
        TurbulenzBridge.emit('dynamicui.group-add', JSON.stringify({
            id: id,
            groupId: groupId,
            options: options || {}
        }));
    };

    /**
    * Removes a UI element from a group. This does not destroy the UI element so it can be used to temporarily hide
    * a UI element which can then be re-shown by calling addToGroup
    *
    * @param {number} id The id of the UI element to remove
    * @param {number} groupId The id of the group to remove it from
    */
    DynamicUIManager.prototype.removeFromGroup = function (id, groupId) {
        TurbulenzBridge.emit('dynamicui.group-remove', JSON.stringify({
            id: id,
            groupId: groupId
        }));
    };

    /**
    * Removes all UI elements from a group. This does not destroy the UI elements unless asked.
    *
    * @param groupId The id of the group to remove all elements from
    * @param except List of id's for the group elements to be excluded from call
    * @param destroy Whether to destroy the elements rather than just removing them
    */
    DynamicUIManager.prototype.removeAllFromGroup = function (groupId, except, destroy) {
        TurbulenzBridge.emit('dynamicui.group-remove-all', JSON.stringify({
            groupId: groupId,
            except: except || [],
            destroy: destroy || false
        }));
    };

    /**
    * Helper function to watch the specified property of an object. This automatically sets up the getter and setter
    * callbacks on the property to tie it to the state of the UI.
    *
    * @param {String} title The title of the UI element to create
    * @param {Object} object The object whose property will be watched
    * @param {String} property The name of the property to watch
    * @param {String} [ui = "watch"] The UI to use to show the variable
    * @param [group] The group to add this watch element to
    * @param [options] The UI creation options to use
    * @returns {number} The id of the newly created element
    */
    DynamicUIManager.prototype.watchVariable = function (title, object, property, ui, group, options) {
        var uiType = ui || 'watch';
        var groupId = group || null;
        var id = -1;

        var getVal = function getValFn() {
            if (property) {
                return object[property];
            } else {
                return object;
            }
        };

        var setVal = function setValFn(value) {
            object[property] = value;
        };

        if (object && property && object.hasOwnProperty(property) && this.typedArrayTypes.indexOf(Object.prototype.toString.call(object[property])) !== -1) {
            getVal = function getTypedArrayValFn() {
                var vals = [];
                var array = object[property];
                for (var i = 0; i < array.length; i += 1) {
                    vals[i] = array[i];
                }
                return vals;
            };
            setVal = function setTypedArrayValFn(value) {
                var array = object[property];
                for (var i = 0; i < array.length; i += 1) {
                    array[i] = value[i];
                }
            };
        }

        if (options) {
            if (options.getValue) {
                console.log("WHY ARE YOU USING A WATCH! (overriding getVal) " + ui + " " + title);
                getVal = options.getValue;
            }

            if (options.setValue) {
                console.log("WHY ARE YOU USING A WATCH! (overriding setVal) " + ui + " " + title);
                setVal = options.setValue;
            }
        }

        switch (uiType) {
            case 'slider':
                id = this.addSlider(title, getVal, setVal, groupId, options);
                break;
            case 'title':
                id = this.addTitle(title, getVal, setVal, groupId, options);
                break;
            case 'description':
                id = this.addDescription(title, getVal, setVal, groupId, options);
                break;
            case 'vector-slider':
                id = this.addVectorSlider(title, getVal, setVal, groupId, options);
                break;
            case 'vector-text':
                id = this.addVectorText(title, getVal, setVal, groupId, options);
                break;
            case 'checkbox':
                id = this.addCheckbox(title, getVal, setVal, groupId, options);
                break;
            case 'radio':
                id = this.addRadioButton(title, getVal, setVal, groupId, options);
                break;
            case 'select':
                id = this.addSelect(title, getVal, setVal, groupId, options);
                break;
            case 'button':
                id = this.addButton(title, setVal, groupId, options);
                break;
            case 'buttons':
                id = this.addButtons(title, setVal, groupId, options);
                break;
            case 'text':
                id = this.addTextBox(title, getVal, setVal, groupId, options);
                break;
            case 'colorpicker':
                id = this.addColorPicker(title, getVal, setVal, groupId, options);
                break;
            case 'watch':
                id = this.addWatch(title, getVal, groupId, options);
                break;
        }

        return id;
    };

    DynamicUIManager.prototype.showObject = function (title, object, editable, group) {
        var objectGroup = this.addGroup(title, group);
        var propertyName, property;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                property = object[propertyName];
                if (typeof property === "object") {
                    this.showObject(propertyName, property, editable, objectGroup);
                } else {
                    if (editable) {
                        // TODO: parse type and provide appropriate UI
                        this.watchVariable(propertyName, object, propertyName, 'watch', objectGroup);
                    } else {
                        this.watchVariable(propertyName, object, propertyName, 'watch', objectGroup);
                    }
                }
            }
        }
        return objectGroup;
    };

    /**
    * Registers a named path to an object so that the object can be referenced from another context for the creation of
    * watch UI
    *
    * @param {Object} object The object to stash
    * @param {String} path The path to use to access the object in the form "folder/folder/folder/item", for example
    * "actors/npcs/enemies/bots/ed209"
    * @returns {number} The id of the stashed object - currently for internal use only
    */
    DynamicUIManager.prototype.stashObject = function (object, path) {
        var id = this.newId();
        this.objects[id] = object;
        TurbulenzBridge.emit('dynamicui.stash-add', id + ':' + path);
        return id;
    };

    DynamicUIManager.create = /**
    * Creates a DynamicUI manager and initialises it, registering against events.
    *
    * @param title
    * @returns {DynamicUIManager} The UI Manager
    */
    function (/* title */ ) {
        var uiMan = new DynamicUIManager();
        uiMan.objects = {};
        uiMan.setters = {};
        uiMan.getters = {};

        uiMan.watchGroup = uiMan.addGroup('watches');

        // Watch for calls from the console to watch stashed objects
        TurbulenzBridge.setListener('dynamicui.stash-watch', function (paramstring) {
            uiMan.watchStashedObject(paramstring);
        });

        TurbulenzBridge.setListener('dynamicui.changevalue', function (jsonstring) {
            var options = JSON.parse(jsonstring);
            var setter = uiMan.setters[options.id];
            if (setter) {
                setter(options.value);
            }
        });

        TurbulenzBridge.setListener('dynamicui.requestvalue', function (jsonstring) {
            var options = JSON.parse(jsonstring);
            var getter = uiMan.getters[options.id];
            if (getter) {
                TurbulenzBridge.emit('dynamicui.pushvalue', JSON.stringify({
                    id: options.id,
                    value: getter()
                }));
            }
        });

        TurbulenzBridge.setListener('dynamicui.togglegroup', function (jsonstring) {
            var options = JSON.parse(jsonstring);
            var setter = uiMan.setters[options.id];
            if (setter) {
                setter(options.collapsed);
            }
        });

        return uiMan;
    };
    DynamicUIManager.lastId = 0;
    return DynamicUIManager;
})();
