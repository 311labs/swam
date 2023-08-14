
PORTAL.Pages.WikiPage = SWAM.Page.extend({
    template: "wiki.views.page",
    classes: "page-view page-padded page-fullscreen-topbar",

    on_init: function() {

    },

    on_params: function() {
        // this handler is for when routing directly to this url (ie direct link, not navigated)
        // group should be magically handled by the app start process
        console.log("on_params for page");
        console.log(this.params);
        if (!this.params.wiki && this.params.path) {
            let paths = this.params.path.split("/");
            this.params.wiki = paths[0];
            this.params.page = paths[1];
        }

        if (!this.params.path && this.params.wiki) {
            this.params.path = `${this.params.wiki}/${this.params.page}`;
        }

        if (this.params) {
            this.setModel(new SWAM.Models.WikiPage(this.params));
        } 

        this.page_id = this.params.path;
        this.params.slug = this.params.page;
        if (this.params.slug) {
            this.params.title = this.params.slug.replace("_", " ").capitalize();
        }

        if (!this.model.id) {
            this.model.fetchByPath(function(model, resp){
                if (!model.id) {
                    this.createPage();
                }
            }.bind(this));

        } else {
            this.model.fetch();
        }
        app.trigger("page:change", this.page_name);
    },

    refresh: function() {
        if (!app.group) return;

    },

    on_action_local_page: function(evt, id) {
        evt.preventDefault();
        let href = $(evt.currentTarget).attr("href");
        this.params.parent = this.model.get("parent.id");
        this.params.path = `${this.model.get("parent.slug")}/${href}`;
        this.params.wiki = this.model.get("parent.slug");
        this.params.page = href;
        this.params.id = null;
        this.on_params();
    },

    showBusy: function() {
        this.busy_dlg = SWAM.Dialog.showLoading({
            parent:this.$el
        });
    },

    hideBusy: function() {
        if (this.busy_dlg) {
            this.busy_dlg.removeFromDOM();
            this.busy_dlg = null;
        }
    },

    createPage: function() {
        // hack for now rely on app
        SWAM.Dialog.confirm({
            message: `<h5>Do you want to create this page?</h5><div>Title: ${this.params.title}</div><div>Path: ${this.params.path}</div>`,
            callback: function(dlg, choice) {
                dlg.dismiss();
                if (choice.lower() == "yes") {
                    let data = {
                        title: this.params.title,
                        slug: this.params.slug,
                        parent: this.params.parent
                    };
                    app.showBusy();
                    this.model.save(data, function(model, resp){
                        app.hideBusy();
                        if (this.options.wiki_menu) {
                            this.options.wiki_menu.refresh();
                        }
                        this.updateURL();
                    }.bind(this));
                }
            }.bind(this)
        });
    },

    on_post_render: function() {
        this.$el.find("#wiki_edit_btn").data("params", this.params);
    }
});


