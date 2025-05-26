

SWAM.Views.ModelView = SWAM.View.extend(SWAM.Ext.BS).extend({
    tagName: "div",
    classes: "swam-model-view",
    defaults: {
        add_classes: "m-3",
    },

    on_action_edit_model: function() {
        let dlg_opts = {fields:this.options.fields, size: "lg"};
        if (this.options.title) dlg_opts.title = this.options.title;
        let dlg = SWAM.Dialog.editModel(this.model, dlg_opts);
    },

    on_render: function() {
        if (this.options.as_table) {
            this.appendChild("table", SWAM.Views.ModelView.buildTable(this.options.model, this.options));
        } else {
            this.$el.html(SWAM.Views.ModelView.build(this.options.model, this.options.fields, this.options));
        }
        if (this.options.can_edit) {
            this.$el.append("<div class='my-2'><button class='btn btn-primary' data-action='edit_model'>EDIT</button></div>");
        }
    }
}, {
    buildTable: function(model, options) {
        var collection = new SWAM.Collection();
        if (model.attributes) model = model.attributes;
        var obj_to_models = function(obj, col, prefix) {
            _.each(obj, function(value, key){
                let lbl = key;
                let fkey = key;
                if (prefix) fkey = prefix + "." + key
                if (options.fields && !options.fields.includes(fkey)) return;
                if (_.isDict(value)) return obj_to_models(value, col, fkey);
                if (["modified", "created", "when", "last_activity", "last_login"].has(key)) value = SWAM.Localize.datetime(value);
                col.add(new SWAM.Model({id:fkey, key:lbl, value:value}));
            });
        };
        if (options.fields) {
            _.each(options.fields, function(field) {
                let value = " ";
                if (!_.isDict(field)) {
                    field = {label:field, field:field};
                }
                if (field.field && field.field.count("|")) {
                    value = SWAM.Localize.render(field.field, model);
                } else {
                    if (model[field.field] != undefined) value = model[field.field];
                    if (["modified", "created", "when", "last_activity", "last_login"].has(field.field)) value = SWAM.Localize.datetime(value);
                }
                collection.add(new SWAM.Model({id:field.field, key:field.label, value:value}));
            });
        } else {
            obj_to_models(model, collection, null);
        }


        var table = new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            columns: [
                {label:"field", field:"key", classes:"fw-bold"},
                {label:"value", field: "value|prettyjson", td_classes:"pretty-json"}
            ]
        });
        return table;
    },

    buildField: function(obj, model, $container) {
        if (_.isString(obj)) {
            obj = {field:obj};
        } else {
            obj = _.extend({}, obj);
        }
        if (obj.view_ignore) return;
        if (obj.requires_perm && !app.me.hasPerm(obj.requires_perm)) return;
        if (obj.requires_field && !model.get(obj.requires_field)) return;
        if (!obj.field && obj.name) obj.field = obj.name;
        if (obj.label === undefined) obj.label = obj.field;
        if (!obj.field) obj.field = obj.label;
        if (!obj.columns) obj.columns = 6;
        if (obj.view_localize) obj.localize = obj.view_localize;
        var $fieldbox = $("<div />")
            .addClass("col-md-" + obj.columns)
            .appendTo($container);

        var $wrapper = $(`<div data-label='${obj.label}'></div>`)
        if (obj.view_action) {
            $wrapper = $(`<div data-label='${obj.label}' data-action='${obj.view_action}'></div>`)
        }
        $wrapper.appendTo($fieldbox);
        if (obj.type == "empty") return;
        if (obj.type == "line") {
            $wrapper.html("<hr>");
            return;
        } else if (obj.type == "heading") {
            if (!obj.size) obj.size = 3;
            let tag = "h" + obj.size;
            let $el = $(document.createElement(tag)).html(obj.value || obj.label);
            $wrapper.append($el)
            if (obj.classes) $el.addClass(obj.classes);
            if (obj.view_classes)  $el.addClass(obj.view_classes);
            return;
        } else if (obj.type == "button") {
            let value = null;
            if (model) {
                value = model.get(obj.field, null, obj.localize);
            }
            if (!obj.classes) obj.classes = "btn btn-primary";
            let $el = $(`<button class='${obj.classes}' data-id='${value}' data-action="${obj.action}"></button>`).html(obj.value || obj.label);
            $wrapper.append($el)
            return;
        }
        if (obj.view_classes) $wrapper.addClass(obj.view_classes);
        if (obj.label != null) {
            $wrapper.addClass("swam-field");
        }

        if (model) {
            let value = null;
            if (obj.template) {
                value = SWAM.renderString(obj.template, {model:model});
            } else if (obj.type == "toggle") {
                value = model.get(obj.field, null, "yesno_icon");
            } else if (obj.type == "searchdown") {
                let display_field = "name";
                if (obj.options && obj.options.display_field) display_field = obj.options.display_field;
                value = model.get(`${obj.field}.${display_field}`);
            } else {
                value = model.get(obj.field, null, obj.localize);
                if ((obj.localize == "prettyjson")||(obj.tag == "pre")) $wrapper = $("<pre />").appendTo($wrapper);
            }

            if (!value) {
                if (obj.hide_null) {
                    $fieldbox.remove();
                    return;
                }
                value = "&nbsp;"
            }
            $wrapper.html(value);
        } else {
            $wrapper.text("&nbsp;");
        }
    },

    build: function(model, fields, options) {
        options = options || {};
        var $container = $("<div />").addClass("model-fields row");
        if (options.inline) {
            $container.addClass("inline");
        }
        if (!fields) {
            _.each(model.attributes, function(value, key){
                var $fieldbox = $("<div />")
                    .addClass("col-md-6")
                    .appendTo($container);
                if (["modified", "created", "when", "last_activity", "last_login"].has(key)) value = SWAM.Localize.datetime(value);
                var $wrapper = $("<div data-label='" + key + "' />").addClass("swam-field").appendTo($fieldbox);
                $wrapper.html(value);
            });
        } else {
            if (options.prepend_fields) {
                _.each(options.prepend_fields, function(obj){
                    SWAM.Views.ModelView.buildField(obj, model, $container);
                });
            }
            _.each(fields, function(obj){
                SWAM.Views.ModelView.buildField(obj, model, $container);
            });
            if (options.append_fields) {
                _.each(options.append_fields, function(obj){
                    SWAM.Views.ModelView.buildField(obj, model, $container);
                });
            }
        }
        return $("<div />").append($container).html();
    }
});
