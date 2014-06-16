// Copyright (c) 2012-2014 Turbulenz Limited

/*jshint nomen: false*/
/*global Turbulenz: false*/
/*global $*/
/*global kendo*/
/*global window*/

// requires jQuery

/**
 * This closure is loaded after the page is ready using jQuery and then registers all the handlers that create and
 * manage the dynamic UI.
 */
(function ()
{
    "use strict";

    var bridge = window.top.Turbulenz && window.top.Turbulenz.Services && window.top.Turbulenz.Services.bridge;
    var groups = {};
    var items = {};
    var valueCache = {};
    var optionsCache = {};
    var active = {};
    var interval = null;
    var uiFactory = {};
    var duiElement = '#dynamicui';

    function createItem(params, empty)
    {
        // Parse the options
        var id = params.id;
        var groupId = params.groupId;
        var title = ((params.title !== undefined) ? params.title : id);
        var updateValues;

        var contents;
        if (empty)
        {
            contents = '<div id="dui-control-' + id + '"></div>';
        }
        else
        {
            contents = '' +
            '<div id="dui-control-' + id + '" class="dui-control">' +
                '<div class="dui-control-title">' + title + '</div>' +
                '<div class="dui-control-widget" ></div>' +
            '</div>';
        }

        // Create an item which is a collection of useful information for the UI object
        var item = {
            id: id,
            element: $(contents),
            params: params,
            setValue: function (value)
            {
                valueCache[id] = value;
                bridge.emit('dynamicui.changevalue', JSON.stringify({id: id, value: value}));
            },
            setOptions: function (options)
            {
                item.params.options = options;
                var element = $(item.element);
                if (options)
                {
                    if (options.tooltip)
                    {
                        element.find('.dui-control-title').attr('title', options.tooltip).tipTip();
                    }

                    if (options.hidden)
                    {
                        element.hide();
                    }
                    else
                    {
                        element.show();
                    }

                    element.toggleClass('disabled', options.disabled);
                }
            }
        };
        items[id] = item;
        item.pushOptions = item.setOptions;

        // Add the item to the list of active UI elements, and add it to the requested group
        addToGroup(id, groupId, params.options);


        // This is here so that in the future we can disable the polling interval if no objects are shown
        // and it will automatically start up again if a new item is added
        if (!interval)
        {
            updateValues = function updateValuesFn()
            {
                var id;
                for (id in active)
                {
                    if (active.hasOwnProperty(id))
                    {
                        bridge.emit('dynamicui.requestvalue', JSON.stringify({id: id}));
                    }
                }
            };
            interval = window.setInterval(updateValues, 1000);
        }

        return item;
    }

    function finishItem(item)
    {
        if (item.pushOptions)
        {
            item.pushOptions(item.params.options);
        }
        if (item.pushValue)
        {
            item.pushValue(item.params.value);
        }
    }

    function destroyItem(id)
    {
        var item = items[id];
        var group = groups[id];
        var children;
        var i;

        if (item || group)
        {
            var parent = groups[(item || group).parent];
            if (parent)
            {
                var index = $.inArray(id, parent.children);
                if (index !== -1)
                {
                    parent.children.splice(index, 1);
                }
            }
        }

        if (item)
        {
            delete active[id];
            // Remove the HTML element from the document and finally remove our handle on the object
            $(item.element).remove();
            delete items[id];
            delete valueCache[id];
            delete optionsCache[id];
        }
        if (group)
        {
            if (group.isModal)
            {
                $('#modal-container').removeClass('show');
            }
            // This just stops us recursing for ever if we somehow end up with a loop in the hierarchy
            children = group.children;
            group.children = [];
            // Recursively destroy all children
            for (i = 0; i < children.length; i += 1)
            {
                destroyItem(children[i]);
            }
            // Remove the HTML element from the document and finally remove our handle on the object
            $(group.element).remove();
            delete groups[id];
        }
    }

    function addToGroup(id, groupId, options)
    {
        var uiItem = items[id];
        var item = uiItem || groups[id];
        var parent = groups[groupId];

        // Remove item from active list
        delete active[id];

        if (item)
        {
            item.parent = groupId;
        }

        // Create a pseudo-group referencing an existing element specified by id.
        if (!parent && typeof groupId === 'string' && groupId[0] === '#')
        {
            parent = {
                id: groupId,
                title: "",
                children: [],
                element: $(groupId),
                contents: $(groupId)
            };
            groups[groupId] = parent;
        }
        if (parent && item)
        {
            var parentElement = $(parent.element);
            var itemElement = $(item.element);
            var contentsElement = $(parent.contents);
            if ($.inArray(id, parent.children) === -1)
            {
                if (options && options.after !== undefined)
                {
                    if (options.after === null)
                    {
                        contentsElement.prepend(itemElement);
                        parent.children.unshift(id);
                    }
                    else
                    {
                        var index = $.inArray(options.after, parent.children);
                        contentsElement.children().eq(index).after(itemElement);
                        parent.children.splice(index + 1, 0, id);
                    }
                }
                else
                {
                    contentsElement.append(itemElement);
                    parent.children.push(id);
                }
            }
            parentElement.removeClass('hidden');
            if (uiItem && !parentElement.collapsed)
            {
                active[id] = true;
            }
            return true;
        }
        return false;
    }

    function addSeparatorHandler(params)
    {
        var item = createItem(params);
        item.element.addClass('separator');
        return item;
    }

    function addTitleHandler(params)
    {
        var item = createItem(params, true);
        item.element.html(params.title).class('title-ui');
        item.pushValue = function (value) {
            if (value)
            {
                item.element.html(value);
            }
        };
        return item;
    }

    function addDescriptionHandler(params)
    {
        var item = createItem(params, true);
        item.element.html(params.title).class('description');
        item.pushValue = function (value) {
            if (value)
            {
                item.element.html(value);
            }
        };
        return item;
    }

    function addVectorTextHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var textOptions = params.options || {};
        var textElement = item.element.find('.dui-control-widget').first();
        var dimension = textOptions.dimension || 1;
        var inputElements;
        var valueElements;


        // Create the HTML for a text input box
        var htmlString = '';
        var i;
        for (i = 0; i < dimension; i += 1)
        {
            if (i !== 0)
            {
                htmlString += '<br/>';
            }
            htmlString += '<span class="dui-control-value"></span><input/>';
        }
        textElement.append(htmlString);
        inputElements = textElement.find('input');
        valueElements = item.element.find('.dui-control-value');
        if (textOptions.display && textOptions.display.labels)
        {
            valueElements.each(function (i, elem) {
                $(elem).html(textOptions.display.labels[i]);
            });
        }

        var focused = false;
        inputElements.focus(function ()
        {
            focused = true;
        });
        inputElements.blur(function ()
        {
            focused = false;
        });

        item.pushValue = function (value, options)
        {
            if (!focused || options.force)
            {
                inputElements.each(function (i,elem) {
                    $(elem).removeClass('dui-control-invalidated');
                    elem.value = value[i];
                });
            }
        };

        if (textOptions.setOnEnter)
        {
            inputElements.keyup(function (event)
            {
                var index = ($.inArray(this, this.parentElement.children) - 1) / 3;
                if (event.keyCode === 13)
                {
                    var value = item.getValue();
                    value[index] = Number(this.value);
                    item.setValue(value);
                }

                $(this).toggleClass('dui-control-invalidated', Number(this.value) !== valueCache[item.id][index]);
            });
        }
        else
        {
            inputElements.keyup(function ()
            {
                var index = ($.inArray(this, this.parentElement.children) - 1) / 3;
                var value = item.getValue();
                value[index] = Number(this.value);
                item.setValue(value);
            });
        }
        return item;
    }

    function displayValue(options, value, index) {
        var display = (options || {}).display || {};
        var logarithmic = display.logarithmic;
        var precision   = display.precision;
        var scale       = display.scale   || 1.0;
        var preFix      = display.preFix  || "";
        var postFix     = display.postFix || "";
        var labels      = display.labels;

        var valuestr;
        if (logarithmic !== undefined)
        {
            value = Math.pow(logarithmic, value);
        }

        value *= scale;

        if (precision === undefined)
        {
            valuestr = "" + value;
        }
        else
        {
            value = (value * Math.pow(10, precision));
            valuestr = "" + value;
            var i;
            if (precision > 0)
            {
                for (i = 0; i <= (precision - valuestr.length); i += 1)
                {
                    valuestr = "0" + valuestr;
                }
                valuestr = valuestr.substr(0, valuestr.length - precision) + "." +
                    valuestr.substr(valuestr.length - precision);
                valuestr = valuestr.replace(/^\./, '0.');
            }
            else
            {
                for (i = 0; i < (-precision); i += 1)
                {
                    valuestr += "0";
                }
            }
        }

        valuestr = preFix + valuestr + postFix;

        if (labels && index !== undefined)
        {
            valuestr += labels[index];
        }

        return valuestr;
    }

    function addVectorSliderHandler(params)
    {
        var i;
        var item = createItem(params);
        var options = params.options || {};
        var widgetElements = item.element.find('.dui-control-widget').first();
        var dimension = options.dimension || 1;
        var labels = options.labels;
        var inputElements;
        var valueElements;

        if (dimension < 2)
        {
            return addSliderHandler(params);
        }

        // Create an HTML object, pass through options in the "options" object. We are creating a slider
        // and a span to show the numerical value.
        var htmlString = '';
        for (i = 0; i < dimension; i += 1)
        {
            htmlString += '<div class="dui-control-widget-row">';
            if (labels)
            {
                htmlString += '<div class="dui-control-label">' + labels[i] + '</div>';
            }
            htmlString += '    <div class="dui-control-slider" data-index="' + i + '"/>' +
                          '    <div class="dui-control-value"/>' +
                          '</div>';
        }
        widgetElements.addClass('multi').append(htmlString);

        // Respond to changes from the slider and set the value of the slider and the value element when requested
        inputElements = widgetElements.find('.dui-control-slider');
        valueElements = widgetElements.find('.dui-control-value');
        inputElements.slider(options);
        inputElements.on('slide', function (event, eventData)
        {
            var values = [];
            var index = Number($(eventData.handle.parentElement).attr('data-index'));
            for (var i = 0; i < dimension; i += 1)
            {
                values.push(Number(inputElements.eq(i).slider('value')));
            }

            valueElements.eq(index).html(displayValue(options, eventData.value, index));
            values[index] = Number(eventData.value);
            item.setValue(values);
        });
        item.pushValue = function (value)
        {
            for (i = 0; i < dimension; i += 1)
            {
                inputElements.eq(i).slider('value', value[i]);
                valueElements.eq(i).html(displayValue(options, value[i], i));
            }
        };
        return item;
    }

    function addSliderHandler(params)
    {
        var item = createItem(params);
        var options = params.options || {};
        var widgetElement = item.element.find('.dui-control-widget').first();
        var inputElement;
        var valueElement;

        widgetElement.append('<div class="dui-control-slider"/><div class="dui-control-value">');
        inputElement = widgetElement.find('.dui-control-slider').first();
        valueElement = widgetElement.find('.dui-control-value').first();

        inputElement.slider(options);
        inputElement.on('slide', function (event, eventData)
        {
            item.setValue(Number(eventData.value));
            valueElement.html(displayValue(options, eventData.value));
        });
        item.pushValue = function (value)
        {
            inputElement.slider('value', value);
            valueElement.html(displayValue(options, value));
        };
        return item;
    }

    function addCheckboxHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var checkoptions = params.options || {};
        var checkElement = item.element.find('.dui-control-widget').first();
        var opt;
        var inputElement;

        // Create the HTML for a checkbox
        item.element.addClass('short-widget');

        var htmlString = '<input type="checkbox"';
        for (opt in checkoptions)
        {
            // Pass through any options from the options object
            if (checkoptions.hasOwnProperty(opt))
            {
                htmlString += opt + '="' + checkoptions[opt] + '"';
            }
        }
        htmlString += '"/>';
        checkElement.append(htmlString);

        // Respond to change events from the UI and from game code
        inputElement = checkElement.find('input').first();
        inputElement.change(function ()
        {
            item.setValue(this.checked);
        });
        item.pushValue = function (value)
        {
            inputElement.attr('checked', !!value);
        };
        return item;
    }

    function addColorpickerHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var options = params.options || {};
        var element = item.element.find('.dui-control-widget').first();

        element.addClass('dui-control-colorpicker');
        options.change = function (color)
        {
            var c = color.toRgb();
            if (options.showAlpha)
            {
                item.setValue([c.r / 255, c.g / 255, c.b / 255, c.a]);
                element.css({backgroundColor: 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'});
            }
            else
            {
                item.setValue([c.r / 255, c.g / 255, c.b / 255]);
                element.css({backgroundColor: 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')'});
            }
        };
        options.clickoutFiresChange = true;
        element.spectrum(options);

        item.pushValue = function (value)
        {
            var red = value[0] * 255;
            var green = value[1] * 255;
            var blue = value[2] * 255;
            var stringVal;
            if (options.showAlpha)
            {
                var alpha = ((value[3] === undefined && 1) || value[3]);
                stringVal = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
            }
            else
            {
                stringVal = 'rgb(' + red + ',' + green + ',' + blue + ')';
            }

            element.spectrum('set', stringVal);
            element.css({'background-color': stringVal});
        };

        return item;
    }

    function addSelectHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var selectoptions = params.options || {};
        var selectElement = item.element.find('.dui-control-widget').first();
        var inputElement;

        // Create the HTML for a selector
        var htmlString = '<select ';
        for (var opt in selectoptions)
        {
            if (selectoptions.hasOwnProperty(opt) && opt !== "hidden")
            {
                htmlString += opt + '="' + selectoptions[opt] + '"';
            }
        }
        htmlString += ' class="dui-control-select"></select>';

        // Respond to change events from the UI and from game code
        selectElement.append(htmlString);
        inputElement = selectElement.find('select').first();

        var setSelectOptions = function (element, valueArray)
        {
            element.empty();
            for (var i = 0; i < valueArray.length; i += 1)
            {
                element.append('<option value="' + valueArray[i] + '">' + valueArray[i] + '</option>');
            }
        };

        item.pushOptions = function(newOptions)
        {
            item.setOptions(newOptions);
            if (newOptions.values)
            {
                setSelectOptions(inputElement, newOptions.values);
            }
        };

        var setValue;
        if (selectoptions.stringValues)
        {
            item.pushValue = function (value)
            {
                inputElement.val(value);
            };
            setValue = function ()
            {
                item.setValue(inputElement.val());
            };
        }
        else
        {
            item.pushValue = function (value)
            {
                inputElement.prop("selectedIndex", value);
            };
            setValue = function ()
            {
                item.setValue(inputElement.prop("selectedIndex"));
            };
        }

        if (selectoptions.buttonText)
        {
            selectElement.append('<button type="button" class="dui-control-button">' + selectoptions.buttonText + '</button>');
            selectElement.find('button').first().click(setValue);
        }
        else
        {
            inputElement.change(setValue);
        }
        return item;
    }

    function addTextHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var textOptions = params.options || {};
        var textElement = item.element.find('.dui-control-widget').first();
        var inputElement;
        var inputButtonElement;
        var isNumber = !!textOptions.number;

        // Create the HTML for a text input box
        var textHtmlString = '<input />';

        // Respond to change events from the UI and from game code
        textElement.append(textHtmlString);
        inputElement = textElement.find('input').first();
        if (!textOptions.display || !textOptions.display.restricted)
        {
            inputElement.addClass('dui-extended-input');
        }

        var buttonText = textOptions.buttonText || textOptions.value;
        if (textOptions.value)
        {
            console.log("textOptions.value is deprecated. Use textOptions.buttonText: " + item.title + " : " + buttonText);
        }
        if (buttonText)
        {
            // Create the HTML for a submit button
            var buttonHtmlString = '<button type="button" class="dui-control-button">';
            buttonHtmlString += buttonText;
            buttonHtmlString += '</button>';

            // Respond to change events from the UI and from game code
            textElement.append(buttonHtmlString);
            inputButtonElement = textElement.find('button').first();
            inputButtonElement[0].onclick = function ()
            {
                item.setValue(inputElement[0].value);
            };
        }
        else if (textOptions.setOnEnter)
        {
            inputElement.keyup(function (event)
            {
                var value = inputElement[0].value;
                if (isNumber)
                {
                    value = Number(value);
                }

                if (event.keyCode === 13)
                {
                    item.setValue(value);
                }

                inputElement.toggleClass('dui-control-invalidated', value !== valueCache[item.id]);
            });
        }
        else
        {
            inputElement.keyup(function ()
            {
                var value = inputElement[0].value;
                if (isNumber)
                {
                    value = Number(value);
                }
                item.setValue(value);
            });
        }

        var isFocused = false;
        inputElement.focus = function ()
        {
            isFocused = true;
        };
        inputElement.blur(function ()
        {
            isFocused = false;
            if (!buttonText)
            {
                item.setValue(inputElement[0].value);
                inputElement.removeClass('dui-control-invalidated');
            }
        });
        item.pushValue = function (value)
        {
            if (!isFocused)
            {
                inputElement[0].value = value;
                inputElement.removeClass('dui-control-invalidated');
            }
        };
        return item;
    }

    function addButtonHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var buttonoptions = params.options || {};
        var buttonElement = item.element.find('.dui-control-widget').first();
        var inputElement;

        item.element.addClass('short-widget');

        // Create the HTML for a button
        var htmlString = '<button type="button" class="dui-control-button">';
        htmlString += buttonoptions.value;
        htmlString += '</button>';

        // Respond to change events from the UI and from game code
        buttonElement.append(htmlString);
        inputElement = buttonElement.find('button').first();
        inputElement.click(function ()
        {
            item.setValue(buttonoptions.value);
        });
        item.pushOptions = function (options)
        {
            buttonoptions.value = options.value;
            item.setOptions(options);
        };
        return item;
    }

    function addButtonsHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var buttonoptions = params.options || {};
        var buttonElement = item.element.find('.dui-control-widget').first();
        var inputElements;

        // Create the HTML for a button
        var htmlString = '';
        var count = buttonoptions.values.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            htmlString += '<button type="button" class="dui-control-button">';
            htmlString += buttonoptions.values[i];
            htmlString += '</button>';
        }

        // Respond to change events from the UI and from game code
        buttonElement.append(htmlString);
        inputElements = buttonElement.find('button');
        inputElements.click(function ()
        {
            var index = $.inArray(this, this.parentElement.children);
            item.setValue(buttonoptions.values[index]);
        });
        return item;
    }


    /**
     * Creates an icon group
     *
     * @param {String} paramstring A JSON stringified option containing the request of the object to create
     */
    function addIconGridHandler(params)
    {
        var title = params.title;
        var elementString = '<div class="dui-control"><div class="dui-control-title">' + title + '</div><div class="dui-control-widget" ></div></div>';
        params.element = $(elementString);

        var item = createItem(params);

        var parentElement = item.element.find('.dui-control-widget').first();
        var listElement = $('<div id="listView"></div>');

        var iconGridOptions = params.options;
        var dataArray = iconGridOptions.dataArray;

        var gridDataSource = new kendo.data.DataSource({
            data: dataArray
        });

        var template = kendo.template('<div class="dui-grid-icon" ><img src="${imageUrl}" /></div>');

        listElement.kendoListView({
            dataSource: gridDataSource,
            template: template,
            selectable : true
        });

        var listView = listElement.data('kendoListView');

        function onGridIconSelected()
        {
            var data = listView.dataSource.view();
            var selectedIconList = $.map(listView.select(), function(item) {
                return data[$(item).index()].name;
            });

            var selectedIcon = (selectedIconList.length ? selectedIconList[0] : null);

            if (selectedIcon)
            {
                item.setValue(selectedIconList);
            }
        }

        listView.bind('change', onGridIconSelected);

        parentElement.append(listElement);

        return item;
    }


    function addWatchHandler(params)
    {
        // Create a label that automatically updates when requested
        var item = createItem(params);
        var watchElement = item.element.find('.dui-control-widget').first();
        item.pushValue = function (value)
        {
            watchElement.html(value);
        };
        return item;
    }

    function addRadioButtonHandler(params)
    {
        // Parse options
        var item = createItem(params);
        var radioOptions = params.options || {};
        var checkElement = item.element.find('.dui-control-widget');
        var i;
        var inputElements;

        // Create the HTML for a set of radio buttons
        var htmlString = '';
        var values = radioOptions.values;
        for (i = 0; i < values.length; i += 1)
        {
            htmlString += '<input type="radio" name="dui-' + item.id +
                '" value="' + values[i] + '">' + values[i] + '</input>';
        }
        checkElement.append(htmlString);

        // Set values from UI changes and value change events from code
        inputElements = checkElement.find('input');
        inputElements.change(function ()
        {
            item.setValue(this.value);
        });
        item.pushValue = function (value)
        {
            for (i = 0; i < inputElements.length; i += 1)
            {
                if (inputElements[i].value === value)
                {
                    $(inputElements[i]).attr('checked', true);
                }
            }
        };
        return item;
    }

    function addTreeHandler(params)
    {
        var item = createItem(params, true);
        var treeOptions = params.options || {};
        var treeElement = item.element;

        item.add = function (childEntry)
        {
            item.treeChildren.push(childEntry);
            if (item.onAdd)
            {
                item.onAdd(childEntry);
            }
        };

        item.treeChildren = [];

        treeOptions.dataSource = {
            data: function (options, cb)
            {
                var treeItem = item;
                if (options.additionalParameters)
                {
                    treeItem = items[options.additionalParameters.item.id];
                }

                treeItem.onAdd = function (childEntry)
                {
                    cb({data: [childEntry]});
                    var childItem = childEntry.additionalParameters.item;
                    if (childItem.children.length)
                    {
                        var controlItem = childItem.children[0];
                        childItem.children = [];
                        addToGroup(controlItem, childItem.id);
                    }
                    if (childItem.params.options.expanded)
                    {
                        item.treeRoot.tree("selectFolder", $(childItem.element).find('.tree-folder-header'));
                    }
                };

                if (treeItem.treeChildren.length)
                {
                    for (var i = 0; i < treeItem.treeChildren.length; i += 1)
                    {
                        treeItem.onAdd(treeItem.treeChildren[i]);
                    }
                }
                else
                {
                    cb({data: []});
                }
            }
        };

        // Create the Tree element
        treeElement.html('' +
            '<div id="dui-tree-' + item.id + '" class="tree dui-control-widget multi">' +
                '<div class="tree-folder" style="display:none;">' +
                    '<div class="tree-folder-header">' +
                        '<i class="icon-folder-close fa"></i>' +
                        '<div class="tree-folder-name"></div>' +
                        '<div class="tree-folder-controls"></div>' +
                    '</div>' +
                    '<div class="tree-folder-content dui-group"></div>' +
                    '<div class="tree-loader" style="display:none"></div>' +
                '</div>' +
                '<div class="tree-item" style="display:none;">' +
                    '<div class="tree-item-contents">' +
                        '<i class="tree-dot fa"></i>' +
                        '<div class="tree-item-name"></div>' +
                        '<div class="tree-item-controls"></div>' +
                    '</div>' +
                '</div>' +
            '</div>');

        item.treeRoot = treeElement.find(".tree").tree(treeOptions);

        treeElement.on('selected', function ()
        {
            var selectedItems = item.treeRoot.tree('selectedItems');
            var selection = [];
            for (var i = 0; i < selectedItems.length; i += 1)
            {
                selection.push(selectedItems[i].additionalParameters.item.id);
            }
            item.setValue(selection);
        });

        item.pushValue = function (value)
        {
            var i, j, found, id;
            var selectedItems = item.treeRoot.tree('selectedItems');
            var selection = [];
            for (i = 0; i < selectedItems.length; i += 1)
            {
                selection.push(selectedItems[i].additionalParameters.item.id);
            }
            var toggleSelection = function (id)
            {
                var item = items[id], type, element;
                if (item)
                {
                    if (item.type === 'folder')
                    {
                        type = "selectFolder";
                        element = $(item.element).find('.tree-folder-header');
                    }

                    if (item.type === 'item')
                    {
                        type = "selectItem";
                        element = $(item.element);
                    }

                    if (element.length)
                    {
                        item.treeRoot.tree(type, element);
                    }
                }
            };

            for (i = 0; i < selection.length; i += 1)
            {
                found = false;
                id = selection[i];
                for (j = 0; j < value.length && !found; j += 1)
                {
                    found = id === value[j];
                }
                if (!found)
                {
                    toggleSelection(id);
                }
            }

            for (i = 0; i < value.length; i += 1)
            {
                found = false;
                id = value[i];
                for (j = 0; j < selection.length && !found; j += 1)
                {
                    found = id === selection[j];
                }
                if (!found)
                {
                    toggleSelection(id);
                }
            }
        };
        return item;
    }

    function addTreeNodeHandler(params)
    {
        var parentItem = items[params.groupId];
        delete params.groupId;
        var item = createItem(params, true);
        var htmlId = 'tree-folder-' + item.id;

        item.element = "#" + htmlId;
        item.type = 'folder';

        item.add = function (childEntry)
        {
            item.treeChildren.push(childEntry);
            if (item.onAdd)
            {
                item.onAdd(childEntry);
            }
        };

        item.treeChildren = [];
        item.treeRoot = parentItem.treeRoot;

        var treeEntry = {
            name: item.params.title || item.params.id,
            type: 'folder',
            dataAttributes: {id: htmlId},
            additionalParameters: {item: item}
        };

        item.treeRoot.on('opened', function (event, eventData)
        {
            if (item === items[eventData.additionalParameters.item.id])
            {
                item.setValue(true);
            }
        });
        item.treeRoot.on('closed', function (event, eventData)
        {
            if (item === items[eventData.additionalParameters.item.id])
            {
                item.setValue(false);
            }
        });

        // Tree nodes are special groups that can take one child control
        groups[item.id] = item;
        item.children = [];
        item.contents = item.element + ' .tree-folder-controls';

        parentItem.add(treeEntry);

        return item;
    }

    function addTreeLeafNodeHandler(params)
    {
        var parentItem = items[params.groupId];
        delete params.groupId;
        var item = createItem(params, true);
        var htmlId = 'tree-item-' + item.id;

        item.element = "#" + htmlId;
        item.type = 'item';
        item.treeRoot = parentItem.treeRoot;

        var treeEntry = {
            name: item.params.title || item.params.id,
            type: 'item',
            dataAttributes: {id: htmlId},
            additionalParameters: {item: item}
        };

        // Tree nodes are special groups that can take one child control
        groups[item.id] = item;
        item.children = [];
        item.contents = item.element + ' .tree-item-controls';

        parentItem.add(treeEntry);

        return item;
    }

    function addGroupHandler(paramstring)
    {
        // Parse the parameters
        var params = JSON.parse(paramstring);
        var options = params.options || {};
        var id = params.id;
        var title = params.title || "";
        var groupId = params.groupId;

        // Create the group in a hidden, collapsed state. Group will be shown when first child is added
        // User will have to click to show the group
        var item = {
            id: id,
            title: title,
            children: [],
            element: $('<div class="dui-group hidden"><div class="dui-group-title" >' + title +
                '</div><div class="dui-group-contents"></div></div>'),
            collapsable: !!options.collapsable,
            collapsed: !!options.collapsable && !options.expanded
        };
        item.title = item.element.find('.dui-group-title');
        item.contents = item.element.find('.dui-group-contents');
        groups[id] = item;

        item.pushValue = function (value)
        {
            item.title.html(value);
        };

        item.element.toggleClass('collapsed', item.collapsable && item.collapsed);
        item.element.toggleClass('collapsable', item.collapsable);

        if (item.collapsable )
        {
            // Toggle collapsed state of groups on click
            item.title.click(function ()
            {
                var children = item.children;
                var i;
                item.collapsed = !item.collapsed;
                item.element.toggleClass('collapsed', item.collapsed);

                if (item.collapsed)
                {
                    for (i = 0; i < children.length; i += 1)
                    {
                        delete active[children[i]];
                    }
                }
                else
                {
                    for (i = 0; i < children.length; i += 1)
                    {
                        if (items[children[i]])
                        {
                            active[children[i]] = true;
                        }
                    }
                }

                bridge.emit('dynamicui.togglegroup', JSON.stringify({id: id, collapsed: item.collapsed}));
            });
        }

        // Don't let a user add a group to itself...
        if (id === groupId)
        {
            groupId = null;
        }
        addToGroup(id, groupId, options);
    }

    function modalShowHandler(paramstring)
    {
        var params = JSON.parse(paramstring);

        var groupParams = {
            id: params.id,
            title: params.title,
            groupId: '#modal-contents'
        };

        $('#modal-container').addClass('show').click(function (event)
        {
            if (event.target === $('#modal-container')[0])
            {
                destroyItem(params.id);
            }
        });

        addGroupHandler(JSON.stringify(groupParams));

        groups[params.id].isModal = true;
    }

    function addToGroupHandler(paramstring)
    {
        var params = JSON.parse(paramstring);
        var id = params.id;
        var groupId = params.groupId || null;
        addToGroup(id, groupId, params.options);
    }

    function removeFromGroupHandler(paramstring)
    {
        var params = JSON.parse(paramstring);
        var id = params.id;
        var groupId = params.groupId || null;
        var group = groups[groupId];
        if (group)
        {
            var index = $.inArray(id, group.children);
            if (index !== -1)
            {
                if (items.hasOwnProperty(id))
                {
                    $(items[id].element).detach();
                }
                else
                {
                    $(groups[id].element).detach();
                }

                group.children.splice(index, 1);

                if (group.children.length === 0) {
                    $(group.element).addClass('hidden');
                }
            }
        }
    }

    function removeAllFromGroupHandler(paramstring)
    {
        var params = JSON.parse(paramstring);
        var groupId = params.groupId || null;
        var group = groups[groupId];
        var except = params.except;
        if (group)
        {
            var children = group.children;
            var i = children.length - 1;
            while (i >= 0)
            {
                var id = children[i];
                if ($.inArray(id, except) === -1)
                {
                    children.splice(i, 1);

                    // possible for child not to exist in either items, or groups.
                    // this happens if the child was destroyed with destroyItem
                    // as it is not removed from the children list of its parent.
                    var item = items[id] || groups[id];
                    if (item)
                    {
                        $(item.element).detach();
                        if (params.destroy)
                        {
                            destroyItem(id);
                        }
                    }
                }
                i--;
            }
            if (children.length === 0 && (typeof groupId !== 'string' || groupId[0] !== '#'))
            {
                $(group.element).addClass('hidden');
            }
        }
    }

    function register()
    {
        // Create default group attached to dynamicui element if it exists
        groups[null] = {
            id: null,
            title: "",
            children: [],
            element: duiElement,
            contents: duiElement
        };

        // Register all the different UI type creators
        uiFactory.slider = addSliderHandler;
        uiFactory["vector-slider"] = addVectorSliderHandler;
        uiFactory["vector-text"]   = addVectorTextHandler;
        uiFactory.checkbox = addCheckboxHandler;
        uiFactory.watch = addWatchHandler;
        uiFactory.select = addSelectHandler;
        uiFactory.radio = addRadioButtonHandler;
        uiFactory.text = addTextHandler;
        uiFactory.button = addButtonHandler;
        uiFactory.tree = addTreeHandler;
        uiFactory.treeNode = addTreeNodeHandler;
        uiFactory.treeLeaf = addTreeLeafNodeHandler;
        uiFactory.iconGrid = addIconGridHandler;
        uiFactory.buttons = addButtonsHandler;
        uiFactory.separator = addSeparatorHandler;
        uiFactory.description = addDescriptionHandler;
        uiFactory.title = addTitleHandler;
        uiFactory.colorpicker = addColorpickerHandler;

        // Listen to 'add' events and delegate to the correct factory
        bridge.gameListenerOn('dynamicui.add-item', function (stringvalue)
        {
            var params = JSON.parse(stringvalue);
            var type = params.type;
            var item = uiFactory[type](params);
            finishItem(item);
        });

        // UI management functions
        bridge.gameListenerOn('dynamicui.modal-show', modalShowHandler);
        bridge.gameListenerOn('dynamicui.group-create', addGroupHandler);
        bridge.gameListenerOn('dynamicui.group-add', addToGroupHandler);
        bridge.gameListenerOn('dynamicui.group-remove', removeFromGroupHandler);
        bridge.gameListenerOn('dynamicui.group-remove-all', removeAllFromGroupHandler);
        bridge.gameListenerOn('dynamicui.destroy', function (paramstring)
        {
            destroyItem(JSON.parse(paramstring).id);
        });

        // Listen to requests to put specific values into the UI
        bridge.gameListenerOn('dynamicui.pushvalue', function (stringvalue)
        {
            var params = JSON.parse(stringvalue);
            var id = params.id;
            var value = params.value;
            var item = items[id] || groups[id];
            if (item && item.pushValue && JSON.stringify(value) !== JSON.stringify(valueCache[id]))
            {
                // Cache to avoid unnecessary updates to UI
                valueCache[id] = value;
                item.pushValue(value);
            }
        });

        bridge.gameListenerOn('dynamicui.pushoptions', function (stringvalue)
        {
            var params = JSON.parse(stringvalue);
            var id = params.id;
            var item = items[id] || groups[id];
            var options = params.options;
            if (item && item.pushOptions && JSON.stringify(options) !== JSON.stringify(optionsCache[id]))
            {
                optionsCache[id] = options;
                item.pushOptions(params.options);
            }
        });
    }

    if (bridge)
    {
        register();
    }
    else
    {
        var listeners = {};
        var registerListener = function (name, callback) {
            listeners[name] = callback;
        };
        var callListener = function (name, parameter)
        {
            if (listeners[name])
            {
                listeners[name](parameter);
            }
        };

        var turbulenz = window.top.Turbulenz || {};
        turbulenz.Services = turbulenz.Services || {};
        turbulenz.Services.bridge = {
            gameListenerOn: registerListener,
            setListener: registerListener,
            emit: callListener
        };

        bridge = turbulenz.Services.bridge;
        window.top.Turbulenz = turbulenz;
        register();
    }
})();

