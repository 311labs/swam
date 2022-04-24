// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		collection_params: {
			size: 10
		},
		table_classes: "swam-table-clickable",
		add_button: {
	        type: "button",
	        action: "add",
	        label: "<i class='bi bi-plus'></i> Add",
	        classes: "btn btn-primary",
	        columns:3
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
		                form_wrap: "search",
		                placeholder: "search",
		                button: {
		                    icon: "bi bi-search"
		                }
		            },
		            {
		                columns: 3,
		                columns_classes: "col-3",
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
		if (this.options.group_filtering) {
			app.on("group:change", this.on_group_change, this);
		}
		
		if (this.options.Collection) {
			this.collection = new this.options.Collection(this.options.collection_params);
		}
		this.collection.on("loading:begin", this.on_loading_begin, this);

		if (this.options.filter_bar) {
			if (this.options.filters) {
				this.options.filter_bar[0].fields[2].buttons.push({
					type: "dropdown",
					icon: "bi bi-filter",
					fields: this.options.filters
				});
			}
			if (this.options.add_button) {
				this.options.filter_bar.unshift(this.options.add_button);
			} else {
				this.options.filter_bar.unshift({columns:3, type:"hidden"}); // need this to make view look clean
			}
		}

		this.addChild("list", new SWAM.Views.PaginatedTable({
			icon: this.options.icon,
			title: this.options.title,
			collection: this.collection, 
			filter_bar: this.options.filter_bar,
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
		SWAM.Dialog.editModel(item.model, 
			{
				title:"Edit",
				size: "lg",
				callback:function(model, resp) {
					if (resp.status) {
					// auto saved nothing to do
					}
				}.bind(this)
			});
	},

	on_action_add: function(evt) {
	    // SWAM.Dialog.alert({title:"Not Implemented", message:"This form is not yet implemented"})
		SWAM.Dialog.editModel(new this.collection.options.Model(), 
			{
				title:"Add",
				size: "lg",
				callback:function(model, resp) {
					if (resp.status) {
					// auto saved nothing to do
					}
				}.bind(this)
			});
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

	on_action_download_pdf: function(evt) {
	    SWAM.toast("Add Group", "Not implemented yet", "warning");
	},
});
