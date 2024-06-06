SWAM.WikiMenu = SWAM.Object.extend({
	defaults: {
		menu_name: "help"
	},

	initialize: function(opts) {
		this.init_options(opts);
		this.collection = new SWAM.Collection({
			url:"/api/wiki/page", 
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
				let requires_perm = model.get("metadata.requires_perm");
				if (_.isString(requires_perm) && (requires_perm.contains(","))) {
					requires_perm = requires_perm.split(',');
				}
				if (requires_perm) item.requires_perm = requires_perm;
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
				action: "new_wiki_page",
				requires_perm: "edit_wiki"
			});
			items.push({
				label: "New Section",
				icon: "file-earmark-plus",
				action: "new_wiki_section",
				requires_perm: "edit_wiki"
			});
			this.options.menu.hideBusy();
			this.options.menu.items = items;
			this.options.menu.setMenuItems(items);
			this.options.menu.render();
		}.bind(this))
	}
}, {
	SIDE_BAR_MENU: {
		title: "Help",
		classes: "bg-light text-dark",
		template: "swam.ext.nav.sidebar.adminbar",
		match_on_id: true, // instead of page name
		menu: []
	},
	ADMIN_MENU_ITEM: {
		label: "Help",
		icon: "question-circle-fill",
		id: "help",
		requires_perm: "view_wiki",
	},

	TOP_BAR_ITEM: {
		id: "wiki_menu",
	    icon: "question-circle-fill",
	    page: "wiki_page",
	    params: {wiki:"faq", page:"home"},
	    data_id: "faq/home",
	    requires_perm: "view_wiki",
	},

	init_wiki: function() {
		// app.getChild("title-bar").options.right_nav.insertAt(this.TOP_BAR_ITEM, 0);
		app.sidebar.options.menus.help = this.SIDE_BAR_MENU;
		app.sidebar.options.admin_menus.insertAt(this.ADMIN_MENU_ITEM, 0);
		app.help_menu = new SWAM.WikiMenu({menu:app.sidebar, wiki:"help"});
		
		app.addPage("wiki_page", new PORTAL.Pages.WikiPage({
			wiki_menu:app.help_menu, 
			root:"help"}), ["help", "help/:wiki/:page"]);

		app.addPage("wiki_edit", new PORTAL.Pages.EditWikiPage({
			wiki_menu:app.help_menu, 
			root:"help"}), ["help/:wiki/:page/edit"]);
		
		app.addPage("global_wiki", new PORTAL.Pages.WikiList({group_filtering:false}), ["global/wikis"]);

		app.addPage("wiki_404", new SWAM.Page({template:"wiki.views.not_found"}), ["help/:wiki/:page/404"]);
		app.getPage("wiki_404").on_action_create_page = function(evt) {
			app.showPage("wiki_edit", this.params);
		};

		app.on_action_new_wiki_page = function(evt) {
			this.help_menu.createPage();
		};

		app.on_action_new_wiki_section = function(evt) {
			this.help_menu.createSection();
		};


	}
});

