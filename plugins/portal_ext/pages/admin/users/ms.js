
PORTAL.Views.Member = SWAM.View.extend({
    template: ".pages.members.member",
    classes: "portal-member",
    tagName: "div",

    defaults: {

    },

    on_init: function() {
        this.tabs = new SWAM.Views.Tabs();
        this.tabs.addTab("Profile", "details", new SWAM.View({template:".pages.members.details"}));

        // "portal_access", "manage_group", "manage_members", "manage_terminals", "billing"
        this.tabs.addTab("Permissions", "permissions", new SWAM.Form.View({
            fields: [
                {
                    label:"Permissions",
                    type:"label",
                    columns: 12
                },
                {
                    name:"metadata.permissions.portal_access",
                    label:"Portal Access",
                    help: "Allow user to access the portal.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_group",
                    label:"Merchant Settings",
                    help: "Allow this user manage merchant settings.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_members",
                    label:"Manage Members",
                    help: "Allow this user to manage members of this merchant.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_employees",
                    label:"Manage Employees",
                    help: "Allow this user to manage employees for employee reporting.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.view_terminals",
                    label:"View Terminals",
                    help: "Allow this user to view terminals.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_terminals",
                    label:"Manage Terminals",
                    help: "Allow this user to manage terminals.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.view_tx",
                    label:"View Transactions",
                    help: "Allow this user to view transactions.",
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.reporting",
                    label:"View Reporting",
                    help: "Allow user to access reporting information.",
                    type:"toggle",
                    columns: 6
                },
                {
                    type: "line"
                },
                {
                    name:"metadata.permissions.manage_processor",
                    label:"Manage Processor",
                    help: "Allow user to manage their own processing.",
                    requires_perm: ["sys.manage_groups"],
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_fees",
                    label:"Manage Fee Tables",
                    help: "Allow this user to view and manage their Fee Tables.",
                    requires_perm: ["sys.manage_groups"],
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.view_issues",
                    label:"View Issues",
                    help: "Allow user Merchant Issues.",
                    requires_perm: ["sys.manage_groups"],
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.file_vault",
                    label:"View File Vault",
                    help: "Extremely secure file storage system.",
                    requires_perm: ["sys.manage_groups"],
                    type:"toggle",
                    columns: 6
                },
                {
                    name:"metadata.permissions.view_logs",
                    label:"View Logs",
                    help: "Allow this user to view their system logs",
                    type:"toggle",
                    requires_perm: ["sys.manage_users"],
                    columns: 6
                },
                {
                    name:"metadata.permissions.manage_media",
                    label:"Manage Media",
                    help: "Allow this user to access and manage media.",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    name:"metadata.permissions.fulfillment",
                    label:"Fulfillment",
                    help: "Allow this user to access fulfillment section.",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    name:"metadata.permissions.group_chat",
                    label:"Group Chat",
                    help: "Allow this user to access Group Chat.",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    type: "line"
                },
                {
                    label:"Notifications",
                    type:"label",
                    columns: 12
                },
                {
                    name:"metadata.notify.sms_issues",
                    label:"SMS Issues",
                    help: "Receive text notifications for any issues reported.",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    name:"metadata.notify.email_issues",
                    label:"Email Issues",
                    help: "Receive email notifications for any issues reported.",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    name:"metadata.notify.fulfillment",
                    label:"Fulfillment Changes",
                    help: "Receive notification on fulfillment changes",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                },
                {
                    name:"metadata.notify.fulfillment_notes",
                    label:"Fulfillment Notes",
                    help: "Receive notifications for fulfillment notes",
                    type:"toggle",
                    requires_perm: ["sys.manage_groups"],
                    columns: 6
                }
            ],
        }));

        // this.tabs.addTab("Devices", "devices", new PORTAL.Views.MemberDevices());

        this.tabs.addTab("Group Activity", "activity", new PORTAL.Views.Logs({
            component: "account.Membership",
            param_field: null,
            group_filtering: true,
            group_field: "group"
        }));

        this.tabs.addTab("Logs", "logs", new PORTAL.Views.Logs({
            model_field: "member.id",
            group_filtering: true,
            group_field: "group",
            columns: [
                {label:"Created", field:"when|datetime"},
                {label:"Action", field:"action", classes:"d-none d-xl-table-cell"},
                {label:"Path", template:"<div>{{model.request_method}}:{{model.request_path}}</div>"},
             ],
        }), {requires_perm:["view_logs"]});

        this.tabs.setActiveTab("details");

        this.addChild("example_tabs", this.tabs);

        this.tabs.tab_views.permissions.on("input:change", this.on_perm_change, this);


    },

    on_perm_change: function(ievt) {
        var data = {};
        data[ievt.name] = ievt.value;
        this.model.save(data);
    },

    on_action_edit: function(evt) {
        SWAM.Dialog.editModel(this.model, {
            callback: function(model, resp, dlg) {
                // nothing to do?
            },
            stack: true,
        })
    },

    on_action_remove: function(evt) {
        SWAM.Dialog.confirm({
            title: "Disable Group Access",
            icon: "x-circle-fill",
            color: "warning",
            message: "<p>Are you sure you want to disable user access to this merchant?</p><p>This will allow you to re-enable this user in the future.</p>",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    app.showBusy({icon:"trash"});
                    this.model.save({state:-25}, function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Membership disabled", "Succesfully remove member from merchant", "success", 4000);
                            SWAM.Dialog.dismissAll();
                            app.active_page.reload();
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    })
                }
            }.bind(this)
        });
    },

    on_action_ms_delete: function(evt) {
        SWAM.Dialog.confirm({
            title: "Delete Group Access",
            icon: "trash-fill",
            color: "danger",
            message: "<p>Are you sure you want to delete user access?</p><p>This will allow delete all user data for this merchant.</p>",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    app.showBusy({icon:"trash"});
                    this.model.destroy(function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Membership deleted", "Succesfully deleted member from merchant", "success", 4000);
                            SWAM.Dialog.dismissAll();
                            app.active_page.reload();
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    }, {params:{delete_children:1}});
                }
            }.bind(this)
        });
    },

    on_action_enable: function(evt) {
        SWAM.Dialog.confirm({
            title: "Enable Member",
            message: "Are you sure you want to enable this member for the current merchant?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    app.showBusy();
                    this.model.save({state:0}, function(model, resp) {
                        app.hideBusy();
                        if (resp.status) {
                            SWAM.toast("Membership enabled", "Succesfully added member to merchant", "success", 4000);
                            SWAM.Dialog.dismissAll();
                            app.active_page.reload();
                        } else {
                            SWAM.Dialog.warning("Request Failed", resp.error);
                        }
                    }.bind(this))
                }
            }.bind(this)
        });
    },

    on_action_resend: function(evt) {
        evt.stopPropagation(); 
        let subject = "Invitation to join: " + app.group.get("name");
        let url = `${location.protocol}//${location.host}${app.options.root}dashboard?group=${app.group.id}`;
        this.model.save({action:"resend_invite", invite_url:url, invite_subject:subject});
        SWAM.toast("Invite Resent", "Invitation has been resent to " + this.model.get("member.email") + "!");
    }
});

