


SWAM.Models.Member = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/membership"
    },

    hasPerm: function(perm) {
        if (_.isArray(perm)) {
            var i=0;
            for (; i < perm.length; i++) {
                if (this.hasPerm(perm[i])) return true;
            }
            return false;
        }
        if (this.get("metadata.permissions." + perm)) return true;
        return false;
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