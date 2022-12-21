SWAM.Views.Dropdown = SWAM.View.extend({
    classes: "dropdown",
    template: "swam.ext.misc.dropdown",
    defaults: {
        btn_classes: "btn btn-link",
        menu_items: [],
        show_context_menu: false,
        context_menu_icon: "bi bi-three-dots-vertical",
        action: "dropdown_item",
        empty_label: "Select Item"
    },

    on_init: function() {
        var normalized = [];
        _.each(this.options.menu_items, function(item){
            if (_.isString(item)) {
                normalized.push({id:item, label:item});
            } else {
                if (_.isUndefined(item.id)) item.id = item.label.lower();
                normalized.push(item);
            }
        });
        this.options.menu_items = normalized;
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

    on_action_dropdown_item: function(evt) {
        var id = $(evt.currentTarget).data("id");
        var item = _.findWhere(this.options.menu_items, {id:id});
        if (item) {
            this.setActiveItem(item, evt);
        }
    },

    setActiveItem: function(item, evt) {
        this.options.active_item = item;
        if (!this.options.show_context_menu) {
            this.$el.find("button#dropdown_toggle").html(this.active_label());
        }
        
        this.trigger("change", item);
    }
});

SWAM.Views.DropDown = SWAM.Views.Dropdown;

