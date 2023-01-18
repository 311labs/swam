SWAM.Views.ListItem = SWAM.View.extend({
    template: "<div>{{display_label}}</div>",
    tagName: "li",
    classes: "swam-list-item list-group-item",

    events: {
        "click": "on_clicked"
    },

    display_label: function() {
        return this.model.get(this.options.display_field);
    },

    on_init: function() {
        if (!this.options.display_field) this.options.display_field = this.options.list.options.display_field || "id";
        this.setModel(this.options.model);
    },

    on_clicked: function(evt) {
        evt.preventDefault();
        this.options.list.on_item_clicked(this, evt);
    },

    on_model_change: function(model) {
        this.render();
    },

    on_pre_render: function() {
        if (_.isFunction(this.options.list.options.getItemViewClasses)) {
            this.options.add_classes = this.options.list.options.getItemViewClasses(this);
            this.updateAttributes();
        }
    },

    setModel: function(model) {
        this.model = model;
        this.id = model.id;
        this.model.on("change", this.on_model_change, this);
    },
});


SWAM.Views.List = SWAM.View.extend({
    classes: "swam-list list-group",
    tagName: "ul",

    defaults: {
        ItemView: SWAM.Views.ListItem,
        item_options: {},
        loading_html: "loading...",
        collection_params: {size:50},
        empty_html: "<div class='text-center p-3 text-muted'>No items returned</div>",
        remote_sort: true
    },

    on_init: function() {
        this.collection = null;
        this.items = [];
        this.selected = [];
        if (!this.options.collection && this.options.Collection) {
            this.options.collection = new this.options.Collection({params:this.options.collection_params});
        }
        if (this.options.collection) this.setCollection(this.options.collection);
    },

    fetch: function(callback, options) {
        this.collection.fetch(callback, options);
    },

    sortBy: function(field, decending, models) {
        this.collection.sortBy(field, decending, models);
    },

    setCollection: function(col) {
        if (this.collection) {
            this.collection.off('add', this.on_add, this);
            this.collection.off('remove', this.on_remove, this);
            this.collection.off('reset', this.on_reset, this);
            this.collection.off("loading:begin", this.on_loading_begin, this);
            this.collection.off("loading:end", this.on_loading_end, this);
            //this.collection.on('reset', this.on_reset, this);
        }
        this.collection = col;
        if (col) {
            this.collection.on('add', this.on_add, this);
            this.collection.on('remove', this.on_remove, this);
            this.collection.on('reset', this.on_reset, this);
            this.collection.on("loading:begin", this.on_loading_begin, this);
            this.collection.on("loading:end", this.on_loading_end, this);
        }

        if (this.options.sort_by) {
            this.collection.sortByField(this.options.sort_by, this.options.descending)
        }

        _.each(this.collection.models, function(model){
            this.add(model, true);
        }.bind(this));
    },

    getAt: function(index) {
        if (index > this.items.length) return undefined;
        return this.items[index];
    },

    get: function(id) {
        return _.findWhere(this.items, {id:id});
    },

    add: function(model, silent) {
        var item = this.get(model.id);
        if (!item) {
            var opts = _.extend({model:model, list:this}, this.options.item_options);
            if (this.options.item_template) opts.template = this.options.item_template;
            item = new this.options.ItemView(opts);
            this.items.push(item);
            if (!silent) this.trigger("add", model);
        }
        return item;
    },

    remove: function(model) {
        if (this.get(model)) {
            this.on_remove(model);
            this.trigger("remove", model);
        }
    },

    on_add: function(model) {
        this.add(model);

    },

    on_remove: function(model) {
        this.remove(model);
    },

    on_reset: function() {
        this.items = [];
        this.trigger("reset", this);
        this.render();
    },

    on_loading_begin: function() {
        this.options.is_loading = true;
        if (this.options.show_loading) {
            this.showBusy();
        }
    },

    on_loading_end: function() {
        this.options.is_loading = false;
        this.render();
        if (this.options.show_loading) {
            this.hideBusy();
        }
    },

    showBusy: function() {
        if (this.busy_dlg) this.hideBusy();
        this.busy_dlg = SWAM.Dialog.showLoading({parent:this.$el});
    },

    hideBusy: function() {
        if (this.busy_dlg) {
            this.busy_dlg.removeFromDOM();
            this.busy_dlg = null;
        }
    },

    on_pre_render: function() {
        this.$body = this.$el; // this can be used to make more advanced lists
    },

    on_render: function() {
        if (!this.options.is_loading) {
            this.$body.empty();
            var index = 0;
            _.each(this.items, function(item){
                if (index > this.options.max_size) return false;
                item.undelegateEvents();
                this.$body.append(item.$el);
                item.render();
                item.delegateEvents();
                index += 1;
            }.bind(this));

            if (this.items.length == 0) {
                this.$body.html(this.options.empty_html);
            }
        } else {
            this.$body.html(this.options.loading_html);
        }

    },

    on_item_clicked: function(item, evt) {
        // called when the item is clicked
        this.trigger("item:clicked", item, evt);
    }

});


