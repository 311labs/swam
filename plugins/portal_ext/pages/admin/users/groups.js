
PORTAL.Views.MemberGroups = SWAM.Views.List.extend({
    defaults: {
        add_classes: "p-3",
        item_template: "portal_ext.pages.admin.users.group",
        Collection: SWAM.Collections.Member,

        collection_params: {
            size: 5
        }
    },

    setModel: function(model) {
        this.model = model;
        if (this.options.group_members) {
            this.collection.params.group = model.id;
        } else {
            this.collection.params.member = model.id;
        }

        if (this.isInViewport()) {
            this.collection.fetch();
        } else {
            this.collection.reset();
        }
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    },

    on_item_clicked: function(item) {
 
    }

});
