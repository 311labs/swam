

SWAM.Views.ListPagination = SWAM.View.extend({
    tagName: "ul",
    classes: "pagination pagination-sm",
    template: "swam.ext.lists.pagination",

    defaults: {
        next_label: "Next",
        prev_label: "Prev"
    },

    on_init: function() {
        this.collection().on("loading:end", this.render.bind(this));
    },

    collection: function() {
        // helper method for templates to get current collection
        return this.options.list.collection;
    },

    on_action_pager: function(evt) {
        evt.preventDefault();
        var page_id = $(evt.currentTarget).data("page-id");
        this.collection().fetchPage(page_id);
    }
});

SWAM.Views.ListPaginationCount = SWAM.View.extend({
    tagName: "div",
    classes: "fs-6 text-muted",
    template: "swam.ext.lists.paginationcount",

    on_init: function() {
        this.is_loading = false;
        this.collection().on("loading:begin", this.on_collection_change, this);
        this.collection().on("loading:end", this.on_collection_change, this);
    },

    on_collection_change: function() {
        this.is_loading = this.collection().is_loading;
        this.render();
    },

    collection: function() {
        // helper method for templates to get current collection
        return this.options.list.collection;
    }
});

SWAM.Views.PaginatedList = SWAM.View.extend({
    template: "swam.ext.lists.paginatedlist",
    classes: "swam-paginated-list",
    defaults: {
        List: SWAM.Views.List,
    },
    
    on_init: function() {
        this.collection = this.options.collection;
        if (!this.collection) {
            console.error("cannot init PaginatedList without collection set!", this);
            throw new Error("PaginatedList requires a collection");
        }
        var list_opts = _.extend({collection:this.collection}, this.options.list_options);
        this.list = new this.options.List(list_opts);
        this.collection.on("loading:end", this.on_loading_end, this);
        this.addChild("list", this.list);
        this.pager = new SWAM.Views.ListPagination({list:this.list});
        this.addChild("pager", this.pager);
        this.counter = new SWAM.Views.ListPaginationCount({list:this.list});
        this.addChild("counter", this.counter);
        if (this.options.filter_bar) {
            this.filters = new SWAM.Views.ListFilters({
                list: this.list, 
                filter_bar: this.options.filter_bar,
                filters: this.options.filters
            });
            this.addChild("filters", this.filters);
        }
    },

    on_loading_end: function() {
        this.$el.find("#count").text(this.collection.count);
    }

});



