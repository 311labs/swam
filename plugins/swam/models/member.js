


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

    ]
});

SWAM.Collections.Member = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Member
    }
}, {
    
});