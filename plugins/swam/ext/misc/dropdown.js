SWAM.Views.Dropdown = SWAM.View.extend({
    classes: "dropdown",
    template: "swam.ext.misc.dropdown",
    defaults: {
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
        this.$el.find("button.dropdown-toggle").html(this.active_label());
        this.trigger("change", item);
    }
});

SWAM.Views.DropDown = SWAM.Views.Dropdown;

