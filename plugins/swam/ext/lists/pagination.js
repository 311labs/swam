

SWAM.Views.ListPagination = SWAM.View.extend({
    tagName: "ul",
    classes: "pagination pagination-sm justify-content-end mt-3",
    template: "plugins.swam.ext.lists.pagination",

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
    classes: "fs-6 mt-4 text-muted",
    template: "plugins.swam.ext.lists.paginationcount",

    on_init: function() {
        this.collection().on("loading:end", this.render.bind(this));
    },

    collection: function() {
        // helper method for templates to get current collection
        return this.options.list.collection;
    }
});

SWAM.Views.PaginatedList = SWAM.View.extend({
    template: "plugins.swam.ext.lists.paginatedlist",
    defaults: {
        List: SWAM.Views.List,
    },
    
    on_init: function() {
        this.list = new this.options.List(this.options);
        this.collection = this.list.collection;
        this.collection.on("loading:end", this.on_loading_end, this);
        this.addChild("list", this.list);
        this.pager = new SWAM.Views.ListPagination({list:this.list});
        this.addChild("pager", this.pager);
        this.counter = new SWAM.Views.ListPaginationCount({list:this.list});
        this.addChild("counter", this.counter);
    },

    on_loading_end: function() {
        this.$el.find("#count").text(this.collection.count);
    }

});

