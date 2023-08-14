
PORTAL.Pages.EditWikiPage = SWAM.Page.extend({
    template: "wiki.views.edit",
    classes: "page-view page-padded has-topbar",

    defaults: {
        fields: [
            {
                name:"title",
                label:"Title",
                columns: 6,
                placeholder: "Enter Page Title"
            },
            {
                name:"slug",
                label:"Slug",
                columns: 6,
                placeholder: "Enter Page Slug"
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

        this.page_id = this.params.path;

        if (this.params) {
            this.setModel(new SWAM.Models.WikiPage(this.params));
        } 

        if (!this.model.id) {
            this.model.fetchByPath();

        } else {
            this.model.fetch();
        }
    },

    on_action_wiki_save: function(evt) {
        let data = this.getChild("edit_form").getData();
        app.showBusy();
        this.model.save(data, function(){
            app.hideBusy();
            app.showPage("wiki_page", this.params);
        }.bind(this));
    },

    on_post_render: function() {
        this.$el.find("button.btn-wiki").data("params", this.params);
    }
});
