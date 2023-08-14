
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

        if (!this.model.id) {
            this.model.fetchByPath();

        } else {
            this.model.fetch();
        }
        app.trigger("page:change", this.page_name);
    },

    refresh: function() {
        if (!app.group) return;

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

    on_post_render: function() {
        this.$el.find("#wiki_edit_btn").data("params", this.params);
    }
});


