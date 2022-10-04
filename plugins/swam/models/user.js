

SWAM.Models.User = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member"
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
                    name:"metadata.phone",
                    label:"Phone",
                    type:"tel",
                    placeholder:"Enter Phone Number",
                    columns: 12
                },
            ]
        },
    ]
});

SWAM.Collections.User = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.User
    }
}, {
    
});