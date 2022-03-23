// this is a page make it simple to support advanced table layouts

SWAM.Pages.TablePage = SWAM.Page.extend({
	classes: "page-view table-page-view page-padded has-topbar",
	template: "<div id='list'></div>",
	defaults: {
		collection_params: {
			size: 10
		}
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
	        columns: this.options.columns
	    }));
	},

	on_pre_render: function() {
	    this.children.list.collection.fetch();
	},

	on_item_clicked: function(item) {

	}

});
