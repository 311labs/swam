

SWAM.Views.ModelView = SWAM.View.extend({
    tagName: "div",
    classes: "swam-model-view mt-1",

    on_render: function() {
        this.$el.html(SWAM.Views.ModelView.build(this.options.model, this.options.fields, this.options));
    }
}, {
    build: function(model, fields, options) {
        options = options || {};
        var $container = $("<div />").addClass("model-fields row");
        if (options.inline) {
            $container.addClass("inline");
        }
        var model = model;
        _.each(fields, function(obj){
            if (_.isString(obj)) {
                obj = {field:obj};
            }
            if (!obj.label) obj.label = obj.field;
            if (!obj.field) obj.field = obj.label;
            if (!obj.columns) obj.columns = 6;
            var $fieldbox = $("<div />")
                .addClass("col-md-" + obj.columns)
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
        return $("<div />").append($container).html();
    }
});

