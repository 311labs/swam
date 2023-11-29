

SWAM.Models.User = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member"
    },

    icons: function () {
        var icons = "";
        if (this.get('is_online')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is online'><i class='bi bi-globe text-success'></i></span>";
        if (this.get('is_blocked')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is blocked'><i class='bi bi-slash-circle-fill text-danger'></i></span>";
        if (!this.canNotify()) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='notifications disabled'><i class='bi bi-bell-slash-fill text-secondary'></i></span>";
        if (this.is_disabled()) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is disabled'><i class='bi bi-slash-circle-fill text-danger'></i></span>";
        if (this.get('is_superuser')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='super user'><i class='bi bi-person-badge text-warning'></i></span>";
        if (this.hasPerm('manage_users')) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user is admin'><i class='bi bi-people-fill text-info'></i></span>";
        if (this.get("has_totp")) icons += "<span data-bs-toggle='tooltip' data-bs-placement='right' title='user has mfa'><i class='bi bi-shield-lock-fill text-info'></i></span>";
        return icons;
    },

    disable: function(callback) {
        this.save({action:"disable"}, callback);
    },
    enable: function(callback) {
        this.save({action:"enable"}, callback);
    },

    isMemberOf: function(group) {
        var gid = group;
        if (gid.id) gid = gid.id;
        return (_.find(this.get("groups"), function(grp){ return (gid == grp.id) }) != undefined);
    },

    canNotify: function() {
        return this.get("metadata.notify_via", "all") == "off";
    },

    is_disabled: function() {
        return !this.attributes.is_active;
    },


    isSuperUser: function() {
        return this.attributes.is_superuser;
    },

    isStaff: function() {
        return this.attributes.is_staff;
    },

    totp_ready: function() {
        return this.get("metadata.totp_verified");
    },

    hasPerm: function(perm) {
        if (_.isArray(perm)) {
            var i=0;
            for (; i < perm.length; i++) {
                if (this.hasPerm(perm[i])) return true;
            }
            return false;
        }
        if (this.isSuperUser()) return true;
        if ((perm == "staff")&&(this.isStaff())) return true;
        if (this.get("metadata.permissions." + perm)) return true;
        if (this.membership) return this.membership.hasPerm(perm);
        return false;
    },

    hasSetting: function(setting) {
        if (_.isArray(setting)) {
            for (var i = 0; i < setting.length; i++) {
                if (this.hasSetting(setting[i])) return true;
            }
            return false;
        }
        var val = this.get("metadata." + setting);
        if (val == undefined) val = this.get(setting);
        return ["True", "true", "1", 1, true].indexOf(val) >= 0;
    },

    sendEvent: function(name, message, extra, callback, opts) {
        var payload = {message:message, extra:extra, name:name, action:"send_event", member:this.id};
        SWAM.Rest.POST("/rpc/account/member/action", payload, function(response, status) {
            if (callback) callback(this, response);
        }.bind(this), opts);
    }

}, {
    EDIT_FORM: [
        {
            type:"group",
            columns: 4,
            fields: [
                {
                    name:"avatar",
                    label:"Avatar",
                    type:"image",
                    columns: 12
                },
            ]
        },
        {
            type:"group",
            columns: 8,
            fields: [
                {
                    name:"display_name",
                    label:"Display Name",
                    type:"text",
                    placeholder:"Enter Display Name",
                    columns: 12
                },
                {
                    name:"email",
                    label:"Email",
                    type:"email",
                    placeholder:"Enter Email",
                    columns: 12
                },
                {
                    name:"username",
                    label:"Username",
                    type:"username",
                    placeholder:"Enter Username",
                    columns: 12
                },
                {
                    name:"phone_number",
                    label:"Phone",
                    type:"tel",
                    placeholder:"Enter Phone Number",
                    columns: 12
                },
            ]
        },
    ],
    PERMISSIONS_FORM: [
        {
            label:"System Permissions",
            type:"label",
            columns: 12
        },
        {
            name:"metadata.permissions.manage_users",
            label:"Manage Users",
            help: "Allow this user to manage other system users",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.permissions.view_all_groups",
            label:"View Groups",
            help: "Allow this user to view all groups",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.permissions.manage_groups",
            label:"Manage Groups",
            help: "Allow this user to created, edit, and view all groups",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.permissions.view_logs",
            label:"View Logs",
            help: "Allow this user to view all system logs",
            type:"toggle",
            columns: 6
        },
        {
            name:"requires_totp",
            label:"Requires MFA",
            help: "Requires the user to use a 'time based one time passwords' through an app like authy or SMS code to phone.",
            type:"toggle",
            columns: 6
        },
        {
            label:"System Notifications",
            type:"label",
            columns: 12
        },
        {
            name:"metadata.notify.server_login",
            label:"Server Login",
            help: "Get notified when someone logs into a server.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.ossec_alerts",
            label:"Intrusion Detection",
            help: "Get notifified when the intrusion detection system detects an anomaly.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.rest_errors",
            label:"API Errors",
            help: "Get notified when a api error occurs.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.app_errors",
            label:"APP Errors",
            help: "Get notified of application errors.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.admin_alerts",
            label:"User Audits",
            help: "Get notified of general system alerts, like failed passwords.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.unknown_incidents",
            label:"Unknown Incidents",
            help: "Get notified of unknown incidents.",
            type:"toggle",
            columns: 6
        },
        {
            name:"metadata.notify.incident_alerts",
            label:"Incident Alerts",
            help: "Will notify you in the portal for any incidents.",
            type:"toggle",
            columns: 6
        }
    ]
});

SWAM.Collections.User = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.User
    }
}, {
    
});