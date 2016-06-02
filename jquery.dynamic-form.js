/** This is JS

 * Generate a form specified by the json input.
 * After generating stores the value of the dynamic groups in an array.
 * Switches between the types using the array html.
 * Stores the result in a hidden div.

*/
(function ($) {

    $.fn.generateForm = function ( options ) {

        baseID = this.selector;
        
        var config = $.extend({

            source: null,

            classes: {
                label: 'df-label control-label col-md-3',
                input: 'form-control',
                select: 'form-control',
                button: 'btn btn-success form-save',
                inputwrap: 'col-md-9'
            },

        }, options);

        var elements = {

            label: function (labelhtml) {

                return $('<label/>', {
                    'class': config.classes.label,
                    'html': labelhtml
                });

            },
            input: function (JsonInputObject) {

                var element = $('<input/>', {
                    'name': JsonInputObject.name,
                    'class': config.classes.input
                });

                if (JsonInputObject.required) {
                    element.attr('required', 'required')
                }

                return element;

            },
            select: function (JsonSelectObject) {

                var select = $('<select/>', {
                    'name': JsonSelectObject.name,
                    'class': config.classes.select,
                });

                for (var i = 0; i < JsonSelectObject.options.length; i++) {
                    select.append(new elements.option(JsonSelectObject.options[i]));
                }

                return select

            },
            option: function (JsonOptionObject) {

                return $('<option/>', {
                    'value': JsonOptionObject.value,
                    'html': JsonOptionObject.display
                })

            },
            button: function () {

                return $('<button/>', {
                    'type': 'button',
                    'class': config.classes.button,
                    'html': 'Save'
                });

            },
            FormGroup: function () {

                return $('<div/>', {
                    'class': 'form-group'
                })

            },
            getElementBasedOnType: function (JsonInputObject) {

                html = null;

                switch (JsonInputObject.type) {
                    case 'input':
                        html = new elements.input(JsonInputObject);
                        break;
                    case 'select':
                        html = new elements.select(JsonInputObject);
                        break;
                    default:
                        console.log(JsonInputObject.type + 'not supported, maybe you can add it?')
                }

                return new $('<div/>', {
                    'class': config.classes.inputwrap
                }).append(html);

            }

        }
        var ui = {

            createStatics: function(JsonStaticsObject) {

                var element = $('<div></div>', {
                    'class': 'form-static'
                });

                for (var i = 0; i < JsonStaticsObject.length; i++) {
                    element.append(new elements.FormGroup().append(new elements.label(JsonStaticsObject[i].display)).append(elements.getElementBasedOnType(JsonStaticsObject[i])));
                }

                $(baseID).append(element);
                    
            },
            createBaseSelect: function (JsonSelectObject) {

                $(baseID).append(
                    new elements.FormGroup()
                    .append(new elements.label(JsonSelectObject.name))
                    .append($('<div/>', {
                        'class': config.classes.inputwrap
                    }).append(new elements.select(JsonSelectObject))
                    .addClass('main-select'))
                    );

            },
            createDynamicBase: function () {

                $(baseID).append(
                    $('<div></div>', {
                        'class': 'form-dynamic'
                    }));

            },
            createDynamicGroup: function (JsonOptionsObject) {

                var element = $('<div></div>', {
                    'id': 'optiongroup-' + JsonOptionsObject.value,
                });

                for (var i = 0; i < JsonOptionsObject.dynamic.length; i++) {
                    element.append(new elements.FormGroup().append(new elements.label(JsonOptionsObject.dynamic[i].display)).append(elements.getElementBasedOnType(JsonOptionsObject.dynamic[i])));
                }

                $('.form-dynamic').append(element);

            },
            createSubmit: function () {

                $(baseID).append(
                    new elements.FormGroup().append(
                        $('<div></div>', {
                            'class': 'col-md-3'
                        })).append(
                        $('<div></div>', {
                            'class': 'col-md-9',
                            'html': new elements.button()
                        })
                    )
               );

            }

        }

        $(document).on('ready', function () {

            for (var i = 0; i < config.source.length; i++) {

                var index = config.source[i];

                ui.createBaseSelect(index.select[0]);
                ui.createStatics(index.statics);

                ui.createDynamicBase();

                for (var i = 0; i < index.select[0].options.length; i++) {
                    ui.createDynamicGroup(index.select[0].options[i])
                }

            }

            ui.createSubmit();

        });

        return this;

    }
}(jQuery));

(function ($) {

    $.fn.dynamicForm = function (options) {

        baseID = this.selector;

        var dynamicgrouphtml = []; // Key/Value array where key = option.Value
        var result = []; 

        var config = $.extend({

            saveToElementSelector: null,
            renderToElementSelector: null,

            selectors: {
                mainselect: '.main-select',
                dynamicwrap: '.form-dynamic',
                dynamicgroupbase: '#optiongroup-' // optiongroup-'option.Value'
            },

            elements: {
                resultobject: function (formAsJsonObject) {

                    return $('<span/>', {
                        'value': formAsJsonObject.Type,
                        'class': 'form-result-object',
                        'html': formAsJsonObject.Details.Name
                    });

                },
                removeobject: function () {

                    return $('<span/>', {
                        'class': 'remove-form-object glyphicon glyphicon-remove-sign'
                    });

                }
            }

        }, options);

        var ui = {

            switchGroups: function (selectValue) {
                
                $(config.selectors.dynamicwrap).html('');
                $(config.selectors.dynamicwrap).append(dynamicgrouphtml[selectValue]);

            },
            renderResult: function (formAsJsonObject) {

                $(config.renderToElementSelector).append(
                    new config.elements.resultobject(formAsJsonObject).append(new config.elements.removeobject()));

            }
        }

        function InitializeDynamicGroups() {

            var options = $(baseID).find(config.selectors.mainselect + ' option')
            var values = $.map(options, function (option) {
                return option.value;
            });

            for (var i = 0; i < values.length; i++) {

                var element = $(baseID).find(config.selectors.dynamicgroupbase + values[i])[0]

                if (element > 0 || element != undefined) {
                    dynamicgrouphtml[values[i]] = element.outerHTML;
                }
                else {
                    console.log('Trying to store the html with the ID: ' + config.selectors.dynamicgroupbase + values[i] + ' but couldn\'t find it!');
                }

            }

            ui.switchGroups(values[0]);

        }

        $(document).on('ready', function () {

            InitializeDynamicGroups();

            if (config.saveToElementSelector == null && config.renderToElementSelector == null) {
                console.log('function returned! you need to specify "saveToElement" & "renderToElement" in the configuration first!');
                return this;
            }

            $(baseID).on('change', config.selectors.mainselect, function () {

                var selectValue = $(this).find(':selected').val();

                ui.switchGroups(selectValue);

            });

            $(baseID).on('click', '.form-save', function () {

                var formAsJsonString = $(baseID).serializeJSON(); //serializeJSON(); requires jquery.serialize-object.js

                result[result.length] = formAsJsonString;

                $(config.saveToElementSelector).attr('value', result);

                ui.renderResult(JSON.parse(formAsJsonString));

                $(baseID).find('input:text, input:password, input:file, textarea').val('');
                
                $('#form-output').html(result); //For demo only.

            });

            $(document).on('click', '.remove-form-object', function () {

                for (var i = 0; i < result.length; i++) {
                    if (result[i].search($(this).parent().attr('value'))) {

                        result.splice(i, 1);
                    }
                }

                $(config.saveToElementSelector).attr('value', result);

                $(this).parent().remove();

                $('#form-output').html(result); //For demo only.
                
            });


        });

        return this;

    }
}(jQuery));