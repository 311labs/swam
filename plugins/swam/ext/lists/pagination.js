

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
        var list_opts = _.extend({
            collection: this.options.collection,
            item_template: this.options.item_template,
            Collection: this.options.Collection,
            collection_params: this.options.collection_params,
        }, this.options.list_options);
        this.list = new this.options.List(list_opts);
        this.collection = this.list.collection;
        if (!this.collection) {
            console.error("cannot init PaginatedList without collection set!", this);
            throw new Error("PaginatedList requires a collection");
        }

        this.collection.on("loading:end", this.on_loading_end, this);
        this.addChild("list", this.list);
        this.list.on("item:clicked", this.on_item_clicked, this);

        if (this.options.filter_bar) {
            let button_group;
            if (this.options.summary_button ||this.options.allow_batch_upload || this.options.filters) {
                button_group = _.find(this.options.filter_bar[this.options.filter_bar.length-1].fields, function(field){
                    return field.type == "buttongroup";
                });

                if (button_group) {
                    let filter_menu = _.findWhere(button_group.buttons, {id:"filter_menu"});
                    if (filter_menu) {
                        
                    }
                }
            }


            if (button_group && this.options.summary_button) {
                button_group.buttons.push({
                    classes: "btn btn-secondary",
                    icon: "bi bi-calculator",
                    action: "rest_summary"
                });

                if (this.options.summary_template) {
                    if (!this.options.list_options) this.options.list_options = {};
                    this.options.list_options.summary_template = this.options.summary_template;
                }
            }

            if (button_group && this.options.allow_batch_upload) {
                button_group.buttons.push({
                    classes: "btn btn-secondary",
                    icon: "bi bi-upload",
                    action: "batch_upload"
                });
            }

            if (this.options.add_filter_buttons) {
                _.each(this.options.add_filter_buttons, function(btn){
                    if (btn.index >= 0) {
                        button_group.buttons.insertAt(btn, btn.index);
                    } else {
                        button_group.buttons.push(btn);
                    }
                });
            }

            if (button_group && this.options.filters) {
                let menu = [];
                _.each(this.options.filters, function(value){
                    menu.push({
                        label: value.label,
                        icon: value.icon,
                        id: value.name,
                        action: "add_filter"
                    });
                });

                button_group.buttons.push({
                    type: "dropdown",
                    icon: "bi bi-filter",
                    id: "filter_menu",
                    items: menu
                });
            }
        }

        this.pager = new SWAM.Views.ListPagination({list:this.list});
        this.addChild("pager", this.pager);
        this.counter = new SWAM.Views.ListPaginationCount({list:this.list});
        this.addChild("counter", this.counter);
        if (this.options.filter_bar) {
            if (this.options.add_button) {
                this.options.filter_bar.unshift(this.options.add_button);
            } else {
                let fitem = this.options.filter_bar[0];
                if (fitem.type != "button") {
                    fitem.columns = 12;
                }
            }
            
            this.filters = new SWAM.Views.ListFilters({
                list: this.list, 
                filter_bar: this.options.filter_bar,
                filters: this.options.filters
            });
            this.addChild("filters", this.filters);
        }
        if (this.options.title_right_view) {
            this.addChild("title_right_view", this.options.title_right_view);
        }
    },

    has_title_right: function() {
        return (this.options.title_right || this.options.title_right_view);
    },

    addTitleRightView: function(view) {
        this.options.title_right_view = view;
        this.addChild("title_right_view", this.options.title_right_view);
    },

    on_item_clicked: function(item) {

    },

    on_loading_end: function() {
        this.$el.find("#count").text(this.collection.count);
        if (this.getChild("title_right_view")) this.getChild("title_right_view").render();
    },

    reset: function() {
        this.list.reset();
    },

    reload: function() {
        this.list.reload();
    }

}, {
    DEFAULT_FILTER_BUTTONS: {
        columns: 3,
        columns_classes: "col-sm-auto",
        type: "buttongroup",
        buttons: [
            {
                classes: "btn btn-secondary",
                icon: "bi bi-arrow-repeat",
                action: "reload"
            },
            {
                type: "dropdown",
                icon: "bi bi-download",
                items: [
                    {
                        icon: "bi bi-filetype-csv",
                        label: "Download CSV",
                        action: "download_csv"
                    },
                    {
                        icon: "bi bi-filetype-json",
                        label: "Download JSON",
                        action: "download_json"
                    },
                ]
            }

        ]
    },
    DEFAULT_SIZE_FILTER: {
        columns: 3,
        columns_classes: "col-md col-lg col-sm-12",
        type: "select",
        name: "size",
        options: [
            5, 10, 20, 50, 100
        ]
    },
    DEFAULT_SEARCH_FILTER: {
        name: "search",
        type: "search",
        columns: 6,
        columns_classes: "col-md col-lg col-sm-12",
        form_wrap: "search",
        placeholder: "search...",
        can_clear: true,
        button: {
            icon: "bi bi-search"
        },
        attributes: {
            autocomplete: "nope"
        }
    }
});



