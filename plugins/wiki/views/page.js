
PORTAL.Pages.WikiPage = SWAM.Page.extend({
    template: "wiki.views.page",
    classes: "page-view page-padded page-fullscreen-topbar",

    defaults: {
        show_title: true,
        show_header: true
    },

    events: {
        "click img": "on_image_click",
        // "click video": "on_video_click"
    },

    on_image_click: function(evt) {
        let src = $(evt.currentTarget).attr("src");
        let alt = $(evt.currentTarget).attr("alt") || " ";
        console.log(src);
        SWAM.Dialog.showMedia({url:src, kind:"image", title:alt});
    },

    on_video_click: function(evt) {
        let ve = evt.currentTarget;
        if (ve.requestFullscreen) {
            ve.requestFullscreen();
        } else if (ve.mozRequestFullScreen) { // Firefox
            ve.mozRequestFullScreen();
        } else if (ve.webkitRequestFullscreen) { // Chrome, Safari, Opera
            ve.webkitRequestFullscreen();
        } else if (ve.msRequestFullscreen) { // IE/Edge
            ve.msRequestFullscreen();
        }
    },

    on_init: function() {

    },

    on_params: function() {
        // this handler is for when routing directly to this url (ie direct link, not navigated)
        // group should be magically handled by the app start process
        console.log("on_params for page");
        console.log(this.params);
        if (this.params.show_menu) {
            app.getChild("panel-left").showMenu(this.params.show_menu);
        }
        if (!this.params.wiki && this.params.path) {
            let paths = this.params.path.split("/");
            this.params.wiki = paths[1];
            this.params.page = paths[2];
        }

        if (!this.params.path && this.params.wiki) {
            this.params.path = `${this.options.root}/${this.params.wiki}/${this.params.page}`;
        }

        if (this.params) {
            this.setModel(new SWAM.Models.WikiPage(this.params));
        } 

        this.page_id = this.params.path;
        this.params.slug = this.params.page;
        if (this.params.slug) {
            this.params.title = this.params.slug.replace("_", " ").capitalize();
            this.options.title = this.params.title;
        }

        if (!this.model.id) {
            this.model.fetchByPath(function(model, resp){
                if (!model.id) {
                    app.showPage("wiki_404", this.params);
                    // this.createPage();
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
        this.params = _.extend({}, this.params);
        this.params.parent = this.model.get("parent.id");
        this.params.path = `${this.options.root}/${this.model.get("parent.slug")}/${href}`;
        this.params.wiki = this.model.get("parent.slug");
        this.params.page = href;
        this.params.id = null;
        this.model = null;
        this.on_params();
        this.updateURL();
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
    },

    on_action_wiki_settings: function() {
        let fields = [
            {
                label: "Section Name",
                field: "title"
            },
            {
                label: "Section Slug",
                field: "slug"
            },
            {
                label: "Section Order",
                field: "order",
                type: "select",
                start: 0,
                end: 100
            },
            {
                label: "Requires Permissions",
                field: "perms",
            },
        ];
        let model = new SWAM.Models.WikiPage(this.model.get("parent"));
        SWAM.Dialog.editModel(model, {
                title: "Edit Section Settings",
                fields: fields,
                callback: function(model, resp, dlg) {
                    this.options.wiki_menu.refresh();
                }.bind(this)
            })
    },

    on_action_wiki_delete: function() {
        SWAM.Dialog.confirm({
            title: `Delete '${this.model.get("title")}' Page?`,
            message: "Are you sure you want to delete this page?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.lower() == "yes") {
                    dlg.dismiss();
                    app.showBusy({icon:"trash"});
                    this.model.destroy(function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast(`Deleted Page`, "Succesfully deleted the page.", "success", 4000);
                            if (this.options.wiki_menu) {
                                let first = this.options.wiki_menu.getFirst();
                                if (first) {
                                    this.setModel(first); 
                                    this.model.fetch();
                                }
                                this.options.wiki_menu.refresh();
                            }
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    }.bind(this));
                }
            }.bind(this)
        });
    }
});

if (SWAM.Dialog) {
    SWAM.Dialog.showWikiPage = function(path, opts) {
        opts = _.extend({ignore_errors:false}, opts);
        let view = new PORTAL.Pages.WikiPage({show_title:false, show_header:false});

        let paths = path.split("/");
        view.params = {};
        view.params.root = paths[0];
        view.params.wiki = paths[1];
        view.params.page = paths[2];
        view.params.path = path

        view.setModel(new SWAM.Models.WikiPage(view.params));

        let buttons = [
            {
                id: "view_page",
                action:"choice",
                label: "View Wiki"
            },
            {
                action:"close",
                label:"Close"
            }
        ];

        view.model.fetch(function(m, r){
            if (r.error) {
                if (!opts.ignore_errors) {
                    SWAM.Dialog.show({
                        title:null,
                        message:`<div class='text-muted fs-3'>${r.error}</div><div>Accessing Page: '${path}'</div>`
                    });
                }
            } else {
                SWAM.Dialog.show({
                    title: m.get("title"),
                    add_classes: "modal-white",
                    view: view,
                    size: "lg",
                    buttons: buttons,
                    scrollable: true,
                    callback: function(dlg, choice) {
                        dlg.dismiss();
                        app.setActivePage("wiki_page", view.params);
                    }
                });
            }


        }.bind(this));
    }
}


