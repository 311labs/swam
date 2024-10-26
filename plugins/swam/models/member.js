


SWAM.Models.Member = SWAM.Model.extend({
    defaults: {
    	url:"/api/account/membership"
    },

    isDisabled: function() {
        return this.get("state") == -25;
    },

    active_perms: function() {
        let perms = [];
        _.each(this.get("metadata.permissions"), function(value, key){
            if (value) perms.push(key);
        });
        return perms;
    },

    getPerm: function(perm) {
        let v = this.get("metadata.permissions." + perm);
        return (v != undefined) && (v != 0) && (v != "0");
    },

    hasPerm: function(perm) {
        if (_.isArray(perm)) {
            var i=0;
            for (; i < perm.length; i++) {
                if (this.hasPerm(perm[i])) return true;
            }
            return false;
        }
        return this.getPerm(perm);
    }
}, {
    EDIT_FORM: [
        {
            name:"member.display_name",
            label:"Display Name",
            type:"text",
            placeholder:"Enter Display Name",
            columns: 12
        },
        {
            name:"member.email",
            label:"Email",
            type:"email",
            placeholder:"Enter Email",
            columns: 12
        },
        {
            name:"member.phone_number",
            label:"Phone",
            type:"tel",
            placeholder:"Enter Phone Number",
            columns: 12
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

    ],
    PERMISSIONS: [
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
        }
    ],
});

SWAM.Collections.Member = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Member
    }
}, {
    
});