
PORTAL.Views.Memberships = SWAM.Views.AdvancedTable.extend({
    classes: "swam-paginated-table swam-table-clickable swam-table-tiny",
    defaults: {
        columns: [
            {label: " ", field:"member.avatar|img('/portal/imgs/empty_avatar.jpg', 'avatar avatar-circle')", no_sort:true},
            {label:"User Name", field:"member.username"},
            {label:"Display Name", field:"member.display_name"},
            {label:"Role", field:"role"},
            {label:"Permissions", field:"metadata.permissions|badges"},
        ],
        Collection: SWAM.Collections.Member,
        collection_params: {
            size: 5,
            sort: "-created"
        },
        group_members: true,
        // filter_bar: null
        download_prefix: "members",
        add_button: {
            type: "button",
            action: "add",
            label: "<i class='bi bi-send-plus'></i> Invite",
            classes: "btn btn-primary",
            columns:3
        },
        filters: [
            {
                label: "State",
                name: "state",
                type: "select",
                options: [
                    {label:"Active", value:0},
                    {label: "Disabled", value: -25},
                    {label: "Invite Pending", value: -10},
                ],
                operator: "is"
            },
            {
                label: "Role",
                name: "role",
                type: "select",
                editable: true,
                options: [
                    "user",
                    "admin",
                    "billing",
                    "guest"
                ],
                operator: "is"
            },
        ],
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


    on_action_add: function(evt) {
        // SWAM.Dialog.alert({title:"Not Implemented", message:"This form is not yet implemented"})
        let subject = "Invitation to join: " + this.model.get("name");
        let url = `${location.protocol}//${location.host}${app.options.root}dashboard?group=${this.model.id}`;
        SWAM.Dialog.showForm(
            {
                title:"Invite User to Merchant",
                message: "The user will receive an email inviting them to join this merchant.",
                lbl_save: "Invite",
                fields: [
                    {
                        label: "Email Address",
                        name: "email",
                        type: "text",
                        placeholder: "Enter email address"
                    },
                    {
                        label: "Role",
                        name: "role",
                        type: "select",
                        help: "Select the role the use will have in this merchant!",
                        options: [
                            "user",
                            "admin",
                            "billing",
                            "guest"
                        ]
                    },
                    {
                        label: "Email Subject",
                        name: "invite_subject",
                        type: "text",
                        help: "The subject of the invite email sent to the member.",
                        default: subject
                    },
                    {
                        label: "Email Message",
                        name: "invite_msg",
                        type: "text",
                        help: "Add an optional personal message to the invite.",
                        placeholder: "optional message to include in the invite"
                    },
                    {
                        type: "hidden",
                        name: "group",
                        default: this.model.id
                    },
                    {
                        type: "hidden",
                        name: "invite_url",
                        default: url
                    },
                ],
                callback:function(dlg, choice) {
                    var data = dlg.getData();
                    if (app.options.site_logo) data.site_logo = app.options.site_logo;
                    if (app.options.company_name) {
                        data.company_name = app.options.company_name;
                        data.powered_by = false;
                    }
                    app.showBusy("envelope");
                    SWAM.Rest.POST("/rpc/account/group/invite", data, function(resp, status){
                        app.hideBusy();
                        if (resp.error) {
                            SWAM.Dialog.warning(resp.error);
                            return;
                        }
                        dlg.dismiss();
                        SWAM.toast("Invited User", data.email + " was sent an invitation to join " + this.model.get("name") + "!");
                        this.reload();
                    }.bind(this));
                }.bind(this),
            });
    }

});
