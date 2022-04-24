
SWAM.Views.ListFilters = SWAM.Form.View.extend({
    classes: "swam-list-filter",

    on_input_change: function(name, val, evt) {
        evt.stopPropagation();
        if ((val == null)||(val == "")) {
            delete this.options.list.collection.params[name];
        } else {
            this.options.list.collection.params[name] = val;
        }
        this.options.list.collection.fetch();
    },

    toRangeString: function(dt) {
        // having issues with the picker and dates, doing manual
        return dt.toISOString().split('T')[0];
    },

    on_daterange_picker: function(evt) {
        this.options.list.collection.params["dr_field"] = evt.name;
        this.options.list.collection.params["dr_start"] = this.toRangeString(evt.start);
        this.options.list.collection.params["dr_end"] = this.toRangeString(evt.end);
        this.options.list.collection.params["dr_offset"] = new Date().getTimezoneOffset();
        this.options.list.collection.fetch();
    },

    on_action_reload: function(evt) {
        // allow the event to bubble down to page
        this.options.list.collection.fetch();
    },

    on_render: function() {
        this.$el.html(SWAM.Form.build(this.options.filters, this.options.list.collection.params, this.options.model));
    },
});