SWAM.WikiMenu = SWAM.Object.extend({
	defaults: {
		menu_name: "help"
	},

	initialize: function(opts) {
		this.init_options(opts);
		this.collection = new SWAM.Collection({
			url:"/rpc/wiki/page", 
			params:{
				graph:"toc",
				sort: "-order",
				size:1000
			}
		});

		if (this.options.wiki) {
			this.collection.params.parent__path = this.options.wiki;
		} else {
			this.collection.params.parent = "null";
		}
		if (this.options.menu) {
			this.options.menu.on("menu:change", this.on_menu_change, this);
		}
	},

	on_menu_change: function(menu) {
		if (menu.options.active_menu_name == this.options.menu_name) {
			this.refresh();
		}
	},

	createPage: function() {
		let model = new SWAM.Models.WikiPage();
		SWAM.Dialog.editModel(model, {
			title: "Add Help Page",
			fields: [
				{
					label: "Parent",
					name: "parent",
					type: "select",
					options: this.collection,
					label_field: "title"
				},
				{
				    name:"title",
				    label:"Title",
				    placeholder: "Enter Page Title"
				},
			],

			callback: function(model, resp) {
				this.refresh();
				app.showPage("wiki_page", {path:model.get("path"), id:model.id});
			}.bind(this)
		})
	},

	createSection: function() {
		let model = new SWAM.Models.WikiPage();
		SWAM.Dialog.editModel(model, {
			title: "Add Help Section",
			fields: [
				{
				    name:"title",
				    label:"Section Title",
				    placeholder: "Enter Section Title"
				},
			],
			defaults: {parent:this.options.wiki},
			callback: function(model, resp) {
				this.refresh();
			}.bind(this)
		})
	},

	getFirst: function() {
		let first = this.collection.getAt(0);
		return new SWAM.Models.WikiPage(first.attributes.children[0]);
	},

	refresh: function() {
		this.options.menu.showBusy();
		this.collection.fetch(function(){
			let items = [];
			this.collection.each(function(model){
				let item = {
					label: model.get("title"),
					icon: model.get("metadata.icon"),
					items: []
				};
				items.push(item);
				let requires_perms = model.get("metadata.requires_perms");
				if (requires_perms) item.requires_perms = requires_perms;
				_.each(model.get("children"), function(child){
					let cicon = "file-earmark-richtext";
					if (child.metadata && child.metadata.icon) icon = child.metadata.icon;
					item.items.push({
						label: child.title,
						icon: cicon,
						page: "wiki_page",
						params: {id:child.id, path:child.path},
						data_id: child.path
					});
				});
			});

			items.push({kind:"separator"});

			items.push({
				label: "New Page",
				icon: "file-earmark-plus",
				action: "new_wiki_page"
			});
			items.push({
				label: "New Section",
				icon: "file-earmark-plus",
				action: "new_wiki_section"
			});
			this.options.menu.hideBusy();
			this.options.menu.items = items;
			this.options.menu.setMenuItems(items);
			this.options.menu.render();
		}.bind(this))
	}
});