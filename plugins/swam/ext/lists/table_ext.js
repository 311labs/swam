

SWAM.Views.PaginatedTable = SWAM.Views.PaginatedList.extend({
    defaults: {
        List: SWAM.Views.Table,
    },
    classes: "swam-paginated-table swam-paginated-table-bs",

    on_init: function() {
        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        } else {
            if (this.options.download_prefix) this.options.list_options.download_prefix = this.options.download_prefix;
            if (this.options.download_group_prefix != undefined) this.options.list_options.download_group_prefix = this.options.download_group_prefix;
        }
        SWAM.Views.PaginatedList.prototype.on_init.apply(this, arguments);
    },

    addModel: function(model, at_top) {
        this.getChild("list").addModel(model, at_top);
    },

});

SWAM.Views.AdvancedTable = SWAM.Views.PaginatedTable.extend({
    classes: "swam-paginated-table swam-table-clickable",
    defaults: {
        List: SWAM.Views.Table,
        collection_params: {
            size: 10
        },
        fetch_on_tab: true,
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
        } else if (this.options.collection_url) {
            this.collection = new SWAM.Collection({url:this.options.collection_url, params:this.options.collection_params});
        }
        this.options.collection = this.collection;

        if (this.options.filter_bar) {

            var button_group;

            if (this.options.summary_button || this.options.filters) {
                button_group = _.find(this.options.filter_bar[this.options.filter_bar.length-1].fields, function(field){
                    return field.type == "buttongroup";
                });
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

            if (button_group && this.options.filters) {
                var menu = [];
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
                    items: menu
                });
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

    addModel: function(model, at_top) {
        this.getChild("list").addModel(model, at_top);
    },

    on_item_clicked: function(item, evt) {
        this.on_item_edit(item, evt);
    },

    on_item_edit: function(item, evt) {
        if (!this.options.edit_form) {
            this.options.edit_form = this.collection.options.Model.EDIT_FORM;
        }

        if (this.options.view) {
            this.options.view.setModel(item.model);
            SWAM.Dialog.showView(this.options.view, this.options.dialog_options);
        } else if (!this.options.view_only && this.options.edit_form) {
            let dlg_opts = _.extend({}, this.options.edit_dialog_options, {Title: "Edit"});
            dlg_opts.fields = this.options.edit_form;
            dlg_opts.form_config = this.options.form_config;
            dlg_opts.callback = function(model, resp) {
                if (resp.status) {
                // auto saved nothing to do
                }
            }.bind(this);
            SWAM.Dialog.editModel(item.model, dlg_opts);
        } else {
            SWAM.Dialog.showModel(item.model, null, {size:"md"});
        }
    },

    on_tab_focus: function() {
        if (this.isInDOM() && this.options.fetch_on_tab) this.collection.fetchIfStale();
    }
});