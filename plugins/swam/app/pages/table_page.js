// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		download_prefix: "download",
		collection_params: {
			size: 10
		},
		table_classes: "swam-table-clickable",
		add_button: {
	        type: "button",
	        action: "add",
	        label: "<i class='bi bi-plus'></i> Add",
	        classes: "btn btn-primary",
	        columns:3,
	        columns_classes: "col-sm-12 col-md-3 col-lg-3",
	    },
		filter_bar: [
		    {
		        type: "group",
		        classes: "justify-content-sm-end",
		        columns: 9,
		        fields: [
		            {
		                name: "search",
		                columns: 6,
		                columns_classes: "col-sm-12 col-md-5 col-lg-6",
		                form_wrap: "search",
		                placeholder: "search",
		                button: {
		                    icon: "bi bi-search"
		                }
		            },
		            {
		                columns: 3,
		                columns_classes: "col-sm-3 col-md-3 col-lg-2",
		                type: "select",
		                name: "size",
		                options: [
		                    5, 10, 20, 50, 100
		                ]
		            },
		            {
		                columns: 3,
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
		    }
		],
	},

	reload: function() {
		this.collection.fetch();
	},

	on_init: function() {
		this.addChild("list", new SWAM.Views.AdvancedTable(this.options));
		this.collection = this.children.list.collection;
		if (this.collection) {
			this.collection.on("loading:begin", this.on_loading_begin, this);
			if (this.options.collection_params) this.collection.params = _.extend({}, this.collection.params, this.options.collection_params);
		}

		if (this.options.group_filtering) {
			app.on("group:change", this.on_group_change, this);
		}

		if (this.options.no_search) {
			var searchfield = _.find(this.options.filter_bar[0].fields, function(field) {
				return (field.name == "search");
			});
			if (searchfield) {
				this.options.filter_bar[0].fields.remove(searchfield);
			}
		}

		if (this.options.table_options) this.options.list_options = this.options.table_options;

		this.addChild("list", new SWAM.Views.PaginatedTable({
			icon: this.options.icon,
			title: this.options.title,
			collection: this.collection, 
			filter_bar: this.options.filter_bar,
			filters: this.options.filters,
			columns: this.options.columns,
			list_options: this.options.list_options
		}));
		this.children["list"].list.on("item:clicked", this.on_item_clicked, this);
	},

	setParams: function(params) {
		this.params = params || {};
		if (this.params.url_params) {
			this.collection.params = _.extend({}, this.collection.params, this.params.url_params);
		}
		if (!this.options.group_filtering && this.collection.params.group) {
			delete this.collection.params.group;
		}
	},

	on_group_change: function() {
		if (app.group) {
			this.collection.params.group = app.group.id;
		} else if (this.collection.params.group) {
			delete this.collection.params.group;
		}
		if (this.isActivePage()) {
			this.collection.fetch();
		}
	},

	on_loading_begin: function() {
		this.updateURL(this.collection.params);
	},

	on_pre_render: function() {
		if (this.isActivePage()) {
			this.collection.fetch();
		}
	},

	on_item_clicked: function(item, evt) {
		if (!this.options.view_only && item.model.constructor.EDIT_FORM) {
			SWAM.Dialog.editModel(item.model, 
				{
					title:"Edit",
					size: "md",
					callback:function(model, resp) {
						if (resp.status) {
						// auto saved nothing to do
						}
					}.bind(this)
				});
		} else {
			SWAM.Dialog.showModel(item.model, null, {size:"md"});
		}

	},

	on_action_add: function(evt) {
	    var options = {
			title:"Add",
			size: "md",
			callback:function(model, resp) {
				if (resp.status) {
				// auto saved nothing to do
					this.collection.fetch();
				}
			}.bind(this)
		};
		if (!this.options.edit_form) {
			this.options.edit_form = this.collection.options.Model.constructor.EDIT_FORM;
		}
		if (this.options.edit_form) options.fields = this.options.edit_form;
		if (this.collection.params.group) {
			options.extra_fields = [
				{
				    type: "hidden",
				    name: "group",
				    default: this.collection.params.group
				}
			];
		}
		SWAM.Dialog.editModel(new this.collection.options.Model(), options);
	},

	on_action_download_pdf: function(evt) {
	    SWAM.toast("Add Group", "Not implemented yet", "warning");
	},
});


