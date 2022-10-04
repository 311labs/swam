
SWAM.View.TableTOC = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "swam.ext.lists.table_toc",
    classes: "swam-table-toc",

    defaults: {
        view_padding: true,
        toc_padding: true,
        view_graph: null,
        filter_bar_filters: [],

        action_bar_filters: [
            {
                columns: 12,
                columns_classes: "col-auto",
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
        ]
    },

    table_defaults: {
        add_classes: "swam-table-clickable",
        pager_options: {
            size_select: true,
            prev_label: "<i class='bi bi-chevron-double-left'></i>",
            next_label: "<i class='bi bi-chevron-double-right'></i>",
        },
    },

    on_init: function() {
        this.options.table_options = _.extend({}, this.table_defaults, this.options.table_options);
        this.setView(this.options.view);
        this.addChild("toc_table", new SWAM.Views.Table(this.options.table_options));
        this.children.toc_table.on("item:clicked", this.on_item_clicked, this);

        if (this.options.filter_bar_filters) {
            this.filters = new SWAM.Views.ListFilters({list:this.children.toc_table, filter_bar:this.options.filter_bar_filters});
            this.addChild("filter_bar", this.filters);
        }

        if (this.options.action_bar_filters) {
            if (this.options.filters) {
                var field = this.options.action_bar_filters[this.options.action_bar_filters.length-1];
                var menu = [];
                _.each(this.options.filters, function(value){
                    menu.push({
                        label: value.label,
                        icon: value.icon,
                        id: value.name,
                        action: "add_filter"
                    });
                });

                if (field) {
                    field.buttons.push({
                        type: "dropdown",
                        icon: "bi bi-filter",
                        btn_classes: "btn btn-secondary swam-toc-hide dropdown-toggle",
                        items: menu
                    });
                }
            }

            // add spacing hack, to force flex right
            this.options.action_bar_filters.insertAt({
                columns_classes: "col",
                type:"empty",
            }, 0);

            this.filters = new SWAM.Views.ListFilters({
                list:this.children.toc_table, 
                filter_bar:this.options.action_bar_filters,
                filters: this.options.filters
            });

            this.addChild("action_bar", this.filters);
        }

        this.children.toc_table.options.collection.on("loading:begin", this.on_loading_begin, this);
        this.children.toc_table.options.collection.on("loading:end", this.on_loading_end, this);
    },

    collapse: function() {
        this.$el.addClass("swam-toc-collapsed");
    },

    expand: function() {
        this.$el.removeClass("swam-toc-collapsed");
    },

    setView: function(view) {
        this.options.view = view;
        this.removeChild("toc_view");
        if (this.options.view) this.addChild("toc_view", this.options.view);
    },
    
    on_action_toggle: function(evt) {
        this.expand();
        if (this.selected_item) {
            this.selected_item.$el.removeClass("swam-toc-selected");
        }
    },

    setItem: function(item) {
        this.options.view.setModel(item.model);
        this.options.view.render();
        this.$el.addClass("swam-toc-collapsed");
        if (this.selected_item) {
            this.selected_item.$el.removeClass("swam-toc-selected");
        }
        this.selected_item = item;
        this.selected_item.$el.addClass("swam-toc-selected");
    },

    on_item_clicked: function(item) {
        if (this.options.view_graph) {
            app.showBusy();
            item.model.params.graph = this.options.view_graph;
            item.model.fetch(function(model, resp){
                app.hideBusy();
                this.setItem(item);
            }.bind(this));
        } else {
            this.setItem(item);
        }
    },

    on_loading_begin: function() {
        this.showBusy();
    },

    on_loading_end: function() {
        this.hideBusy();
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
    }

});

