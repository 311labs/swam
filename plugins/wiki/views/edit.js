
PORTAL.Pages.EditWikiPage = SWAM.Page.extend({
    template: "wiki.views.edit",
    classes: "page-view page-padded has-topbar",

    defaults: {
        fields: [
            {
                name:"title",
                label:"Title",
                columns: 4,
                placeholder: "Enter Page Title"
            },
            {
                name:"slug",
                label:"Slug",
                columns: 4,
                placeholder: "Enter Page Slug"
            },
            {
                name:"order",
                label:"Page Order",
                help: "Set the page order, the higher number shows up first",
                type: "select",
                start: 0,
                step: 1,
                end: 100,
                columns: 4,
                placeholder: "Select Page Order"
            },
            {
                name:"body",
                label:"Text",
                columns: 12,
                markdown: true,
                type: "textarea",
                placeholder: "Enter Markdown"
            }
        ]
    },

    on_init: function() {
        this.addChild("edit_form", new SWAM.Form.View(this.defaults));
        this.getChild("edit_form").on("mde:insert_image", this.on_mde_insert_image, this);
    },

    on_params: function() {
        // this handler is for when routing directly to this url (ie direct link, not navigated)
        // group should be magically handled by the app start process
        console.log("on_params for page");
        console.log(this.params);
        if (!this.params.wiki && this.params.path) {
            let paths = this.params.path.split("/");
            this.params.wiki = paths[1];
            this.params.page = paths[2];
        }

        if (!this.params.path && this.params.wiki) {
            this.params.path = `${this.options.root}/${this.params.wiki}/${this.params.page}`;
        }

        this.page_id = this.params.path;
        this.params.slug = this.params.page;
        if (this.params.slug) {
            this.params.title = this.params.slug.replace("_", " ").capitalize();
        }
        
        this.setModel(new SWAM.Models.WikiPage(this.params));

        if (!this.model.id) {
            this.model.fetchByPath(function(model, resp){
                
            }.bind(this));

        } else {
            this.model.fetch();
        }
    },

    on_action_wiki_save: function(evt) {
        let data = this.getChild("edit_form").getData();
        app.showBusy();
        this.model.save(data, function(){
            app.hideBusy();
            if (this.options.wiki_menu) this.options.wiki_menu.refresh();
            app.showPage("wiki_page", this.params);
        }.bind(this));
    },

    on_post_render: function() {
        this.$el.find("button.btn-wiki").data("params", this.params);
    },

    createPage: function() {
        // hack for now rely on app
        app.on_action_new_wiki_page();
    },

    on_mde_insert_image: function(editor) {
        // SWAM.toast(null, "NOT IMPLEMENTED", "danger", 4000, true);
        let view = new SWAM.Views.Table({
            remote_sort: false,
            add_classes: "swam-table-clickable",
            Collection: SWAM.Collections.WikiMedia,
            columns: [
                {label:"thumb", template:"{{{model.media|lightbox}}}", no_sort:true},
                {label: "Name", field: "media.name"},
                {label: "Kind", field: "media.kind"},
            ],
        });
        let buttons = [
            {
                label: "Upload New",
                action: "choice",
                id: "new"
            },
            {
                label: "Close",
                action: "close"
            },
        ]
        view.collection.fetch();
        let dlg = SWAM.Dialog.showView(view, {
            title:"Select Media",
            buttons: buttons,
            callback: function(dlg, choice) {
                let model = new SWAM.Models.WikiMedia();
                SWAM.Dialog.editModel(model, {
                    defaults: {entry: this.model.get("parent.id")},
                    callback: function(model, resp, dlg) {
                        if (dlg) dlg.dismiss();
                        view.collection.fetch();
                    }
                })
            }.bind(this)
        });

        view.on("item:clicked", 
            function(item){
                dlg.dismiss();
                view.off("item:clicked");
                var pos = editor.codemirror.getCursor();
                editor.codemirror.setSelection(pos, pos);
                editor.codemirror.replaceSelection(`![${item.model.get("media.name")}](${item.model.getMediaURL()})`);
            }, this);
    },
});
