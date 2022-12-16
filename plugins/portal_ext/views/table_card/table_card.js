PORTAL.Views.TableCard = SWAM.View.extend(SWAM.Ext.BS).extend({
    template: "swamcore.plugins.portal_ext.views.table_card",
    classes: "swam-table-card",
    defaults: {
        view_padding: true,
        prefetch_count: 0,
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
        show_loading: true,
        add_classes: "table-sm swam-table-clickable",
        pager_options: {
            size_select: true,
            prev_label: "<i class='bi bi-chevron-double-left'></i>",
            next_label: "<i class='bi bi-chevron-double-right'></i>",
        },
    },

    on_init: function() {
        this.options.table_options = _.extend({}, this.table_defaults, this.options.table_options);
        this.addChild("tc_table", new SWAM.Views.Table(this.options.table_options));
        this.children.tc_table.on("item:clicked", this.on_item_clicked, this);

        if (this.options.filter_bar_filters) {
            this.filters = new SWAM.Views.ListFilters({list:this.children.tc_table, filters:this.options.filter_bar_filters});
            this.addChild("filter_bar", this.filters);
        }

        if (this.options.action_bar_filters) {
            this.filters = new SWAM.Views.ListFilters({list:this.children.tc_table, filters:this.options.action_bar_filters});
            this.addChild("action_bar", this.filters);
        }

        this.children.tc_table.options.collection.params.graph = "list";
        this.children.tc_table.options.collection.on("loading:begin", this.on_loading_begin, this);
        this.children.tc_table.options.collection.on("loading:end", this.on_loading_end, this);
    },


    setModel: function(model) {
        if(this.options.prefetch_badge) {
            this.children.tc_table.options.collection.fetch(function(data, status) {
                this.options.prefetch_count = data.length;
                this.render()
            }.bind(this));
        }
    },


    setParams: function(params) {
        this.children.tc_table.collection.params = _.extend({}, this.children.tc_table.collection.params, params);
    },

    on_post_render: function() {
        this.$el.find("#"+this.options.tc_id).on("show.bs.collapse", function() {
            this.children.tc_table.options.collection.fetch();
        }.bind(this))
    },

    fetch: function() {
        if(document.getElementById(this.options.tc_id).getAttribute("aria-expanded")) {
            this.children.tc_table.options.collection.fetch();
        }
    },

    on_item_clicked: function(item) {

    },
});
