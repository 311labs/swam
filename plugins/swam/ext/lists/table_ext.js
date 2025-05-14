

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
                            5, 10, 20, 50, 100, 200
                        ]
                    },
                    SWAM.Views.PaginatedList.DEFAULT_FILTER_BUTTONS
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

        if (!this.options.list_options || !this.options.list_options.columns) {
            this.options.list_options = _.extend({columns:this.options.columns}, this.options.list_options);
        }
        SWAM.Views.PaginatedTable.prototype.on_init.apply(this, arguments);
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

   	getBatchSelected: function() {
		return this.getChild("list").getBatchSelected();
	},

	clearBatchSelected: function() {
	   return this.getChild("list").clearBatchSelected();
	},

    on_item_clicked: function(item, evt) {
        if (this.options.on_item_clicked) {
            this.options.on_item_clicked(item, evt);
        } else {
            this.on_item_edit(item, evt);
        }
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
