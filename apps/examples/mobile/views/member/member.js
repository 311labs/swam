

PORTAL.Views.Member = SWAM.View.extend({
    template: ".views.member",
    classes: "acs-member",
    tagName: "div",

    defaults: {
        title: "Examples: Tabs"
    },

    on_init: function() {
        this.tabs = new SWAM.Views.Tabs();
        this.tabs.addTab("Details", "details", new SWAM.View({template:".views.member.details"}));

        this.tabs.addTab("Access", "access", new PORTAL.Views.MemberLocks());

        this.tabs.addTab("Logs", "logs", new PORTAL.Views.Logs());

        this.tabs.setActiveTab("details");

        this.addChild("example_tabs", this.tabs);

    },

    on_action_edit: function(evt) {
        SWAM.Dialog.editModel(this.model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
            },
            stack: true,
        })
    }

});


SWAM.Views.MemberLockItem = SWAM.Views.ListItem.extend({
    template: ".views.member.member_lock",
    // tagName: "div",
    // classes: "card"
});

PORTAL.Views.MemberLocks = SWAM.View.extend({
    template: "<button role='button' class='btn btn-primary mt-2 mb-2' data-action='add'>Add Lock Access</button><div id='list'></div>",
    classes: "acs-lock",
    tagName: "div",

    on_init: function() {
        this.collection = new SWAM.Collections.LockAccessMember();
        this.addChild("list", new SWAM.Views.List({
            collection: this.collection, 
            ItemView: SWAM.Views.MemberLockItem,
            columns: [
                {
                    label: "Member",
                    field: "member.username",
                }
            ]
        }));
        this.children["list"].on("item:clicked", this.on_item_clicked, this);
    },

    setModel: function(model) {
        this.model = model;
        this.collection.params.member = model.get("member.id");
        this.collection.params.group = app.group.id;
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

    },

    on_action_add: function(evt) {
        var locks = new SWAM.Collections.LockAccess({params:{size:500, group:app.group.id}});
        app.showBusy("download");
        locks.fetch(function(resp){
            app.hideBusy();
            SWAM.Dialog.showForm([
                    {
                        label: "Lock to grant access:",
                        name: "lock",
                        type: "select",
                        options: locks,
                        placeholder: "Select Lock",
                        display_field: "display_name",
                        value_field: "lock.id",
                        help: "If the lock you are looking for does not show up, then you need to first add them to this merchant!"
                    }
                ], {
                    title: "Grant Member Access to Lock",
                    stack: true,
                    lbl_save: "Add Lock",
                    callback: function(dlg) {
                        var data = dlg.getData();
                        dlg.dismiss();
                        var model = new SWAM.Models.LockAccessMember();
                        data.group = app.group.id;
                        data.member = this.model.get("member.id");
                        app.showBusy("upload");
                        model.save(data, function(model, resp){
                            app.hideBusy();
                            if (resp.error) {
                                SWAM.Dialog.warning(resp.error);
                            } else {
                                this.collection.fetch();
                                SWAM.toast("SUCCESS", "Lock access granted!");
                            }
                        }.bind(this));
                    }.bind(this)
                })
        }.bind(this));
    },

    on_action_remove: function(evt) {
        evt.stopPropagation();
        var model = this.collection.get($(evt.currentTarget).data("id"));
        SWAM.Dialog.yesno({
            title:"Remove Lock Access For Member",
            stack: true,
            message:"Are you sure you want to remove lock access?",
            callback: function(dlg, choice) {
                dlg.dismiss();
                if (choice == "yes") {
                    app.showBusy("trash");
                    model.destroy(function(resp){
                        app.hideBusy();
                        this.collection.fetch();
                    }.bind(this));
                }
            }.bind(this)
        })
    }

});
