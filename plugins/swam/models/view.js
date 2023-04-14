

SWAM.Views.ModelView = SWAM.View.extend({
    tagName: "div",
    classes: "swam-model-view mt-1",

    on_render: function() {
        this.$el.html(SWAM.Views.ModelView.build(this.options.model, this.options.fields, this.options));
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
                    .addClass("col-6")
                    .appendTo($container);
                var $wrapper = $("<div data-label='" + key + "' />").addClass("swam-field").appendTo($fieldbox);
                $wrapper.html(value);
            });
        } else {
            _.each(fields, function(obj){
                if (_.isString(obj)) {
                    obj = {field:obj};
                }
                if (!obj.label) obj.label = obj.field;
                if (!obj.field) obj.field = obj.label;
                if (!obj.columns) obj.columns = 6;
                var $fieldbox = $("<div />")
                    .addClass("col-" + obj.columns)
                    .appendTo($container);
                var $wrapper = $("<div data-label='" + obj.label + "' />").addClass("swam-field").appendTo($fieldbox);
                if (model) {
                    var value = model.get(obj.field, obj.localize);
                    if ((obj.localize == "prettyjson")||(obj.tag == "pre")) $wrapper = $("<pre />").appendTo($wrapper);
                    if (!value) value = "&nbsp;"
                    $wrapper.html(value);
                } else {
                    $wrapper.text("&nbsp;");
                }
            });
        }
        return $("<div />").append($container).html();
    }
});

