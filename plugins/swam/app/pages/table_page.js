// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		dialog_options: {size:"lg", vsize:"lg", can_dismiss:true, scrollable:true},
		list_options: {
			download_prefix: "download",
			download_group_prefix: true
		},
		collection_params: {
			size: 10
		},
		form_config: {

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
		                placeholder: "search...",
		                can_clear: true,
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
		this.collection.params.start = 0; // reset the page to 0
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
		this.options.list_options = _.extend({}, 
			{download_prefix:"download", download_group_prefix:true},
			{download_prefix:this.options.download_prefix}, this.options.list_options);
		if (this.options.summary_template) this.options.list_options.summary_template = this.options.summary_template;

		this.addChild("list", new SWAM.Views.PaginatedTable({
			icon: this.options.icon,
			title: this.options.title,
			collection: this.collection, 
			filter_bar: this.options.filter_bar,
			filters: this.options.filters,
			summary_button: this.options.summary_button,
			summary_template: this.options.summary_template,
			columns: this.options.columns,
			list_options: this.options.list_options
		}));
		this.children["list"].list.on("item:clicked", this.on_item_clicked, this);
	},

	getBatchSelected: function() {
		return this.children.list.list.selected;
	},

	clearBatchSelected: function() {
		this.children.list.list.deselectAll();
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
		this.collection.params.start = 0; // reset the page to 0
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
			SWAM.Dialog.editModel(item.model, 
				{
					title:"Edit",
					size: "md",
					fields: this.options.edit_form,
					form_config: this.options.form_config,
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
			form_config: this.options.form_config,
			callback:function(model, resp) {
				if (resp.status) {
				// auto saved nothing to do
					this.collection.fetch();
				}
			}.bind(this)
		};

		if (!this.options.add_form && this.collection.options.Model.ADD_FORM) this.options.add_form = this.collection.options.Model.ADD_FORM;
		if (!this.options.edit_form) this.options.edit_form = this.collection.options.Model.EDIT_FORM;
		if (!this.options.add_form && this.options.edit_form) this.options.add_form = this.options.edit_form;

		if (this.options.add_form) options.fields = this.options.add_form;
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

	on_action_batch_delete: function(evt) {
	    let selected = this.getBatchSelected();
	    let deleted = 0;
	    SWAM.Dialog.confirm({
	        title: `Delete ${selected.length} Items?`,
	        message: "Are you sure you want to remove the selected items?",
	        callback: function(dlg, value) {
	            dlg.dismiss();
	            if (value.lower() == "yes") {
	                dlg.dismiss();
	                app.showBusy({icon:"trash"});
	                _.each(selected, function(item, index){
	                    item.model.destroy(function(model, resp) {
	                    	if (index == selected.length-1) {
	                    		app.hideBusy();
	                    	}	             
	                        if (resp.status) {
	                        	deleted += 1;
	                            if (index == selected.length-1) {
	                                SWAM.toast("Items Deleted", `Deleted ${deleted} of ${selected.length}`, "success", 4000);
	                                this.collection.fetch();
	                            }
	                        } else {
	                            SWAM.toast(`Delete Failed for id = ${model.id}`, resp.error, "danger", 5000, true);
	                        }
	                    }.bind(this));
	                }.bind(this))
	            }
	        }.bind(this)
	    });
	},

	on_action_download_pdf: function(evt) {
	    SWAM.toast("Add Group", "Not implemented yet", "warning");
	},
});
