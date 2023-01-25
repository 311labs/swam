SWAM.Views.EditSelect = SWAM.View.extend({
    classes: "swam-editselect",
    template: "swam.ext.misc.editselect",
    defaults: {
        tagName: "div",
        replaces_el: false,
        btn_classes: "btn btn-link dropdown-toggle",
        menu_items: [],
        action: "dropdown_item",
        empty_label: "Select Item"
    },

    on_init: function() {
        var normalized = [];
        _.each(this.options.menu_items, function(item){
            if (_.isString(item)) {
                normalized.push({id:item, label:item});
            } else {
                if (_.isUndefined(item.id)) item.id = item.label;
                normalized.push(item);
            }
        });
        this.options.menu_items = normalized;
    },

    replaceSelect: function($el) {
        this.options.name = $el.attr("name");
        this.options.value = $el.val();
        var self = this;
        $el.find("option").each(function(){
            self.options.menu_items.push({label:this.innerHTML, value:this.value})
        });

        this.addToDOM($el.parent());
        $el.remove();
    },

    events: {
        "focus input": "on_focus",
        "blur input": "on_blur"
    },

    on_focus: function(evt) {
        this.$dropdown.css("width", this.$el.outerWidth());
        this.$dropdown.addClass("show");
    },

    on_blur: function(evt) {
        setTimeout(function(){
            this.$dropdown.removeClass("show");
        }.bind(this), 200);
    },

    on_action_es_selected: function(evt) {
        var $el = $(evt.currentTarget);
        this.$el.find("input").val($el.data("id"));
    },

    active_label: function() {
        if (this.options.active_item) {
            var item = this.options.active_item;
            if (item.icon) {
                return SWAM.Icons.getIcon(item.icon) + " " + item.label;
            }
            return item.label;
        }
        return this.options.empty_label;
    },

    on_post_render: function() {
        this.$dropdown = this.$el.find(".dropdown-menu");
    }
});