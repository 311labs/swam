// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		collection_params: {
			size: 10
		},
		table_classes: "swam-table-clickable",

		filters: [
		    {
		        type: "button",
		        action: "add",
		        label: "<i class='bi bi-plus'></i> Add",
		        classes: "btn btn-primary add-membership",
		        columns:3
		    },
		    {
		        type: "group",
		        classes: "justify-content-sm-end",
		        columns: 9,
		        fields: [
		            {
		                name: "search",
		                columns: 4,
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
		                                icon: "bi bi-download",
		                                label: "Download CSV",
		                                action: "download_csv"
		                            },
		                            {
		                                icon: "bi bi-upload",
		                                label: "Download JSON",
		                                action: "download_json"
		                            },
		                            {
		                                icon: "bi bi-lock",
		                                label: "Download PDF",
		                                action: "download_pdf"
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
		if (this.options.Collection) {
			this.collection = new this.options.Collection(this.options.collection_params);
		}
		this.addChild("list", new SWAM.Views.PaginatedTable({
			icon: this.options.icon,
			title: this.options.title,
			collection: this.collection, 
			filters: this.options.filters,
			columns: this.options.columns,
			list_options: this.options.list_options
		}));
		this.children["list"].list.on("item:clicked", this.on_item_clicked, this);
	},

	on_pre_render: function() {
		this.children.list.collection.fetch();
	},

	on_item_clicked: function(item, evt) {
		SWAM.Dialog.editModel(item.model, 
			{
				title:"Edit",
				callback:function(model, resp) {
					if (resp.status) {
					// auto saved nothing to do
					}
				}.bind(this)
			});
	}
});
