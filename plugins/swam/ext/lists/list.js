SWAM.Views.ListItem = SWAM.View.extend({
    template: "<div>{{model.id}}</div>",
    tagName: "li",
    classes: "list-group-item",
    on_init: function() {
        this.setModel(this.options.model);
    },
    setModel: function(model) {
        this.model = model;
        this.id = model.id;
        this.model.on("change", this.on_model_change, this);
    }
});


SWAM.Views.List = SWAM.View.extend({
    classes: "swam-list list-group",
    tagName: "ul",

    defaults: {
        ItemView: SWAM.Views.ListItem,
        loading_html: "loading..."
    },

    on_init: function() {
        this.collection = null;
        this.items = [];
        if (this.options.collection) this.setCollection(this.options.collection);
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
            this.collection.on('change', this.on_model_change, this);
            this.collection.on("loading:begin", this.on_loading_begin, this);
            this.collection.on("loading:end", this.on_loading_end, this);
        }

        if (this.options.sort_by) {
            this.collection.sortByField(this.options.sort_by, this.options.descending)
        }
    },

    getAt: function(index) {
        if (index > this.items.length) return undefined;
        return this.items[index];
    },

    get: function(id) {
        return _.findWhere(this.items, {id:id});
    },

    add: function(model) {
        var item = this.get(model.id);
        if (!item) {
            var opts = {model:model, list:this};
            if (this.options.item_template) opts.template = this.options.item_template;
            item = new this.options.ItemView(opts);
            this.items.push(item);
            this.trigger("add", model);
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
    },

    on_loading_end: function() {
        this.options.is_loading = false;
        this.render();
    },

    on_pre_render: function() {
        this.$body = this.$el; // this can be used to make more advanced lists
    },

    on_render: function() {
        if (!this.options.is_loading) {
            this.$body.empty();
            _.each(this.items, function(item){
                this.$body.append(item.$el);
                item.render();
            }.bind(this))
        } else {
            this.$body.html(this.options.loading_html);
        }

    }

});


