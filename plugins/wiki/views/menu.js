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
				size:1000,
				parent: "null"
			}
		});
		if (opts.menu) {
			opts.menu.on("menu:change", this.on_menu_change, this);
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
					placeholder: "Select Parent",
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
			this.options.menu.hideBusy();
			this.options.menu.items = items;
			this.options.menu.setMenuItems(items);
			this.options.menu.render();
		}.bind(this))
	}
});