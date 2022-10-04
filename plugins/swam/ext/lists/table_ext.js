

SWAM.Views.PaginatedTable = SWAM.Views.PaginatedList.extend({
    defaults: {
        List: SWAM.Views.Table,
    },
    classes: "swam-paginated-table swam-paginated-table-bs",

    on_init: function() {
        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        }
        SWAM.Views.PaginatedList.prototype.on_init.apply(this, arguments);
    },

});

SWAM.Views.AdvancedTable = SWAM.Views.PaginatedTable.extend({
    classes: "swam-paginated-table swam-table-clickable",
    defaults: {
        List: SWAM.Views.Table,
        collection_params: {
            size: 10
        },
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                fields: [
                    {
                        name: "search",
                        columns: 7,
                        form_wrap: "search",
                        placeholder: "search",
                        button: {
                            icon: "bi bi-search"
                        }
                    },
                    {
                        columns: 2,
                        type: "select",
                        name: "size",
                        options: [
                            5, 10, 20, 50, 100
                        ]
                    },
                    {
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
                ]
            }
        ],
    },

    on_init: function() {
        if (this.options.collection) {
            this.collection = this.options.collection;
            if (this.options.collection_params) this.collection.params = _.extend({}, this.collection.params, this.options.collection_params);
        } else if (this.options.Collection) {
            this.collection = new this.options.Collection({params:this.options.collection_params});
        }
        this.options.collection = this.collection;

        if (this.options.filter_bar) {
            if (this.options.filters) {
                var field = _.find(this.options.filter_bar[this.options.filter_bar.length-1].fields, function(field){
                    return field.type == "buttongroup";
                });

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
                        items: menu
                    });
                }
            }
            if (this.options.add_button) {
                this.options.filter_bar.unshift(this.options.add_button);
            } else {
                this.options.filter_bar[0].columns = 12;
                // don't bother with grouping
                // this.options.filter_bar = [this.options.filter_bar[0].fields];
                // this.options.filter_bar.unshift({columns:3, type:"hidden"}); // need this to make view look clean
            }
        }

        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        }
        SWAM.Views.PaginatedTable.prototype.on_init.apply(this, arguments);

        this.list.on("item:clicked", this.on_item_clicked, this);
    },

    setParams: function(params) {
        this.params = params || {};
        if (this.params.url_params) {
            this.collection.params = _.extend({}, this.collection.params, this.params.url_params);
        }
    },

    reload: function() {
        this.collection.fetch();
    },

    on_action_download_csv: function(evt) {
        var filename = "download.csv";
        window.location.assign(this.collection.getRawUrl({
            format_filename: filename,
            format:"csv",
        }));
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_action_download_json: function(evt) {
        var filename = "download.json";
        window.location.assign(this.collection.getRawUrl({
            format_filename: filename,
            format:"json",
        }));
        SWAM.toast("Download Started", "Your file is downloading: " + filename, "success");
    },

    on_item_clicked: function(item) {
        SWAM.toast("oops", "nope");
    }

});