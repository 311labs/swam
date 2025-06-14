// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		update_url: true,
		dialog_options: {size:"lg", vsize:"lg", can_dismiss:true, scrollable:true},
		edit_dialog_options: {size:"lg", can_dismiss:false, scrollable:true},
		dlg_add_title: "Add",
		show_on_add: false,
		fetch_on_click: false,
		item_graph: "detailed",
		item_url_param: "item",
		requires_group: false,
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
		can_add: true,
		add_button: {
	        type: "button",
	        action: "add",
	        label: "<i class='bi bi-plus'></i> Add",
	        classes: "btn btn-primary",
	        columns: 3,
	        columns_classes: "col-auto",
	    },
		filter_bar: [
		    {
		        type: "group",
		        classes: "justify-content-sm-end",
		        columns: 9,
		        columns_classes: "col",
		        fields: [
		            SWAM.Views.PaginatedList.DEFAULT_SEARCH_FILTER,
		            SWAM.Views.PaginatedList.DEFAULT_SIZE_FILTER,
		            SWAM.Views.PaginatedList.DEFAULT_FILTER_BUTTONS
		        ]
		    }
		],
	},

	reload: function() {
		this.collection.params.start = 0; // reset the page to 0
		if (this.options.requires_group && !this.collection.params.group) return;
		this.collection.fetch();
	},

	on_init: function() {

	},

	on_page_init: function() {
		if (this.options._page_inited_) return;
		this.options._page_inited_ = true;

		if (this.options.group_filtering) {
			app.on("group:change", this.on_group_change, this);
		}

		if (this.options.add_button && this.options.add_button_lbl) {
			this.options.add_button.label = this.options.add_button_lbl;
		}

		if (this.options.no_search || this.options.search_field) {
			var searchfield = _.find(this.options.filter_bar[0].fields, function(field) {
				return (field.name == "search");
			});
			if (searchfield) {
				if (this.options.no_search) {
					this.options.filter_bar[0].fields.remove(searchfield);
				} else if (this.options.search_field) {
					searchfield.name = this.options.search_field;
				}

			}
		}

		if (this.options.download_formats) {
            var download_field = _.find(this.options.filter_bar[0].fields, function(field) {
     			return (field.type == "buttongroup");
      		});
            if (download_field) {
                download_field.buttons[1].items = this.options.download_formats;
            }
		}

		if (this.options.table_options) this.options.list_options = this.options.table_options;
		this.options.list_options = _.extend({},
			{download_prefix:"download", download_group_prefix:this.options.group_filtering},
			{download_prefix:this.options.download_prefix}, this.options.list_options);
		if (this.options.summary_template) this.options.list_options.summary_template = this.options.summary_template;

		this.addChild("list", new SWAM.Views.PaginatedTable({
			icon: this.options.icon,
			title: this.options.title,
			Collection: this.options.Collection,
			collection: this.options.collection,
			filter_bar: this.options.filter_bar,
			add_filter_buttons: this.options.add_filter_buttons,
			filters: this.options.filters,
			allow_batch_upload: this.options.allow_batch_upload,
			summary_button: this.options.summary_button,
			summary_template: this.options.summary_template,
			columns: this.options.columns,
			add_button: this.options.add_button,
			title_right: this.options.title_right,
			title_right_view: this.options.title_right_view,
			list_options: this.options.list_options
		}));

		if (!this.options.on_item_clicked) {
			this.children["list"].list.on("item:clicked", this.on_item_clicked, this);
		}

		this.collection = this.children.list.collection;
		this.collection.on("loading:begin", this.on_loading_begin, this);
		this.collection.on("loading:end", this.on_loading_end, this);
		if (this.options.collection_params) this.collection.params = _.extend({}, this.collection.params, this.options.collection_params);
		if (this.options.item_url_param) this.collection.options.item_url_param = this.options.item_url_param;
		if (this.options.group_filtering && app.group) this.collection.params.group = app.group.id;
		if (_.isString(this.options.item_url_param) && !this.collection.options.ignore_params) {
			this.collection.options.ignore_params = [this.options.item_url_param];
		}
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
			this.collection.params = _.extend({}, this.collection.params, this.params.url_params)
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
			this.reload();
		}
	},

	on_loading_begin: function() {
		if (this.options.update_url) {
			this.updateURL(this.collection.params);
		}
	},

	on_loading_end: function() {

	},

	on_pre_render: function() {
		if (this.isActivePage()) {
			this.reload();
		}
	},

	on_item_clicked: function(item, evt) {
		if (!this.options.fetch_on_click) {
			this.on_item_edit(item, evt);
		} else {
			app.showBusy();
			item.model.params.graph = this.options.item_graph;
			item.model.fetch(function(model, resp){
				app.hideBusy();
				this.on_item_edit(item, evt);
			}.bind(this));
		}
	},

	on_item_edit: function(item, evt) {
		if (!this.options.edit_form) {
			this.options.edit_form = this.collection.options.Model.EDIT_FORM;
		}
		let dlg = null;

		if (this.options.view) {
			dlg = this.showView(item);
		} else if (!this.options.view_only && this.options.edit_form) {
			let dlg_opts = _.extend({}, this.options.edit_dialog_options, {Title: "Edit"});
			dlg_opts.fields = this.options.edit_form;
			dlg_opts.form_config = this.options.form_config;
			dlg_opts.callback = function(model, resp) {
				this.on_model_saved(model, resp, dlg);
			}.bind(this);
			dlg = SWAM.Dialog.editModel(item.model, dlg_opts);
		} else {
			dlg = this.showItem(item);
		}
		this.on_item_dlg(item, dlg);
	},

	showView: function(item) {
		this.options.view.setModel(item.model);
		return SWAM.Dialog.showView(this.options.view, this.options.dialog_options);
	},

	showItem: function(item) {
		let fields = this.collection.options.Model.VIEW_FIELDS;
		return SWAM.Dialog.showModelView(item.model, fields, {
			title: `Item #${item.model.id}`,
			inline: true,
			padded: true,
			size:"md"
		});
	},

	on_item_dlg: function(item, dlg) {
		let item_url_param = this.options.item_url_param;
		if (dlg && _.isString(item_url_param)) {
			this.active_dlg = dlg;
			this.collection.params[item_url_param] = item.model.id;
			this.updateURL(this.collection.params);
			dlg.on("dialog:closed", function(d){
			    dlg.off("dialog:closed");
			    if (this.active_dlg == dlg) this.active_dlg = null;
			    if (this.collection.params[item_url_param]) {
			        delete this.collection.params[item_url_param];
			        this.updateURL(this.collection.params);
			    }
			}.bind(this));
		}
	},

	on_model_added: function(model, resp, dlg) {
		if (resp.error) {
			SWAM.Dialog.warning("Error Saving", resp.error);
		} else {
			this.reload();
			if (this.options.show_on_add) {
				this.showItem({model:model});
			}
		}
	},

	on_model_saved: function(model, resp, dlg) {
		if (resp.error) {
			SWAM.Dialog.warning("Error Saving", resp.error);
		}
	},

	on_model_created: function(model) {

	},

	on_action_add: function(evt) {
        if (!this.options.can_add) return;
	    let defaults = {
			title: this.options.dlg_add_title,
			size: "md",
			form_config: this.options.form_config,
			callback:function(model, resp, dlg) {
				this.on_model_added(model, resp, dlg);
			}.bind(this)
		};

		let options = _.extend({}, defaults, this.options.edit_dialog_options);

		if (!this.options.add_form && this.collection.options.Model.ADD_FORM) this.options.add_form = this.collection.options.Model.ADD_FORM;
		if (!this.options.edit_form) this.options.edit_form = this.collection.options.Model.EDIT_FORM;
		if (!this.options.add_form && this.options.edit_form) this.options.add_form = this.options.edit_form;

		if (this.options.add_form) options.fields = this.options.add_form;
		if (!this.options.group_filtering) {
			options.use_app_group = false;
		}
		if (this.collection.params.group) {
			options.extra_fields = [
				{
				    type: "hidden",
				    name: "group",
				    default: this.collection.params.group
				}
			];
		}
		let model = new this.collection.options.Model();
		this.on_model_created(model);
		SWAM.Dialog.editModel(model, options);
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
	                                this.reload();
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

	on_action_batch_upload: function() {
		SWAM.Dialog.showForm([{label:"Upload File", name:"batch_file", type:"file"}], {
			callback: function(dlg) {
				let files = dlg.getFiles(true);
				dlg.dismiss();
				app.showBusy();
				SWAM.Form.readFileAsText(files[0], function(text){
					this.collection.batchUpload(text, function(resp, status){
						app.hideBusy();
						this.collection.fetch();
					}.bind(this));
				}.bind(this));
			}.bind(this)
		});
	},

	on_page_reenter: function() {
	    this.on_page_enter();
	},

	on_page_enter: function() {
		if (_.isString(this.options.item_url_param)) {
			if (this.params && this.params.url_params && this.params.url_params[this.options.item_url_param]) {
			    let pk = this.params.url_params[this.options.item_url_param];
			    let model = new this.collection.options.Model({id:pk});
			    model.fetch(function(){
			        this.on_item_clicked({model:model});
			    }.bind(this));
			}
		}
	}
});
