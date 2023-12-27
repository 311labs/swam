
PORTAL.Views.UserPassKeys = SWAM.Views.PaginatedList.extend({
    defaults: {
        add_classes: "p-3",
        item_template: "portal_ext.pages.admin.users.passkey",
        Collection: SWAM.Collections.UserPassKey,
    },

    setModel: function(model) {
      this.model = model;
      this.collection.params.member = model.id;
      if (this.isInViewport()) {
          this.collection.fetch();
      } else {
          this.collection.reset();
      }
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    },

    on_action_add_passkey: function() {
        SWAM.Dialog.confirm({
            title: "Create New Passkey",
            message: "Are you sure you want to create a new passkey?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    WEBAUTHN.register(this.on_passkey.bind(this));
                }
            }.bind(this)
        });
    },

    on_passkey: function(model, resp) {
        this.collection.fetch();
    },

    on_action_delete_passkey: function(evt, id) {
        let item = this.list.get(id);
        SWAM.Dialog.confirm({
            title: `Delete Passkey #${id}`,
            message: `Are you sure you want to delete this passkey?`,
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    item.model.destroy(function(model, resp){
                        this.collection.fetch();
                    }.bind(this));
                }
            }.bind(this)
        });
    }

});
