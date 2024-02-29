

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
        this.$el.html(SWAM.Views.ModelView.build(this.options.model, this.options.fields, this.options));
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
                var lbl = key;
                if (prefix) lbl = prefix + "." + key
                if (options.fields && !options.fields.includes(lbl)) return;
                if (_.isDict(value)) return obj_to_models(value, col, lbl);
                if (["modified", "created", "when", "last_activity", "last_login"].has(key)) value = SWAM.Localize.datetime(value);
                col.add(new SWAM.Model({id:lbl, key:lbl, value:value}));
            });
        };
        obj_to_models(model, collection, null);

        var table = new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            columns: [
                {label:"field", field:"key", classes:"fw-bold"},
                {field: "value"}
            ]
        });
        return table;
    },

    build: function(model, fields, options) {
        options = options || {};
        var $container = $("<div />").addClass("model-fields row");
        if (options.inline) {
            $container.addClass("inline");
        }
        var model = model;
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
            _.each(fields, function(obj){
                if (_.isString(obj)) {
                    obj = {field:obj};
                } else {
                    obj = _.extend({}, obj);
                }
                if (!obj.field && obj.name) obj.field = obj.name;
                if (!obj.label) obj.label = obj.field;
                if (!obj.field) obj.field = obj.label;
                if (!obj.columns) obj.columns = 6;
                if (!obj.label) obj.label = "";
                if (obj.view_localize) obj.localize = obj.view_localize;
                var $fieldbox = $("<div />")
                    .addClass("col-md-" + obj.columns)
                    .appendTo($container);
                var $wrapper = $("<div data-label='" + obj.label + "' />").addClass("swam-field").appendTo($fieldbox);
                if (obj.type == "empty") return;
                if (obj.type == "line") {
                    $wrapper.html("<hr>");
                    return;
                }
                if (model) {
                    let value = null;
                    if (obj.template) {
                        value = SWAM.renderString(obj.template, {model:model});
                    } else if (obj.type == "toggle") {
                        value = model.get(obj.field, null, "yesno_icon");
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
            });
        }
        return $("<div />").append($container).html();
    }
});

