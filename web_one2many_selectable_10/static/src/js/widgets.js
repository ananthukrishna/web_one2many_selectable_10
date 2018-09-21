/*
    Usage in templates:

    <field name="One2many_name" widget="one2many_selectable" action="server_action" callback="javascript_callback>

    If defined, "server_action" will be RPC called and executed by server
    If defined, "javascript_callback" will be executed client side after "server_action" is executed server side,
    if also defined. "javascript_callback" will be sent results returned from "server_action" if any.
*/

odoo.define('web_one2many_selectable_10.form_widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var _t = core._t;
    var Model = require('web.Model');
    var FieldOne2Many = core.form_widget_registry.get('one2many');

    function executeFunctionByName(functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments, 2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    }

    var One2ManySelectable = FieldOne2Many.extend({
        template: 'One2ManySelectable',

        events: {
            'click .web_one2many_selectable': 'button_pressed',
        },

        multi_selection: true,

        // Retrieve options from caller template to have them available in the widget 'One2ManySelectable' template
        init: function () {
            this._super.apply(this, arguments);

            // Default options
            this.options = {
                caption: 'Apply',
                action: null,
                callback: null
            }

            // User defined options from field attributes in caller template
            if (arguments[1].attrs.hasOwnProperty('options')) {
                this.options = JSON.parse(arguments[1].attrs.options);
            }

            // Translate caption
            this.options.caption = _t(this.options.caption)
        },

        start: function () {
            this._super.apply(this, arguments);
        },

        // Catch button pressed event, collect IDs, call action server side, then callback client side if defined.
        button_pressed: function () {
            var self = this;
            var selected_ids = self.get_selected_ids_one2many();
            if (selected_ids.length === 0) {
                this.do_warn(_t("You must choose at least one record."));
                return false;
            }

            // If an action was defined in template, let's call this action server side
            if (this.options.action) {
                /* Here is a python example function to parse the selected objects

                    @api.multi
                    def your_action_name(self):
                         for record in self:
                             print record
                */

                var model_obj = new Model(this.dataset.model);
                model_obj.call(this.options.action, [selected_ids], {context: self.dataset.context})
                    .then(function (result) {
                        if (self.options.callback) {
                            // If a callback was defined in template, let's call this callback client side with
                            // results from server call above.
                            executeFunctionByName(self.options.callback, window, result);
                        } else {
                            // Else simply refresh the display for the selected records
                            var controller = self.get_active_view().controller;
                            $.each(selected_ids,function(){
                                controller.reload_record(controller.records.get(this));
                            });
                        }
                    });
            }
        },

        // Collect the object IDs for checked checkboxes
        get_selected_ids_one2many: function () {
            var ids = [];
            this.$el.find('td.o_list_record_selector input:checkbox:checked').closest('tr').each(function () {
                ids.push(parseInt($(this).context.dataset.id));
            });
            return ids;
        }

    });

    // Register this widget
    core.form_widget_registry.add('one2many_selectable', One2ManySelectable);

    // Make the widget available for other add-ons
    return {
        One2ManySelectable: One2ManySelectable
    }

});
