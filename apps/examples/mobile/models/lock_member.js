
SWAM.Models.LockAccessMember = SWAM.Model.extend({
    defaults: {
        url:"/rpc/acs/lock/access/member"
    },

    display_name: function() {
        var name = this.get("lock_access.lock.name");
        if (name) return name;
        return this.get("lock_access.lock.uuid");
    }
}, {
    EDIT_FORM: [
        {
            name:"model",
            label:"Model",
            help: "Controller Model Number.",
            type:"text",
            columns: 12
        },
        {
            name:"uuid",
            label:"Serial Number",
            help: "Controller Serial Number.",
            type:"text",
            readonly: true,
            columns: 12
        },
    ]
});

SWAM.Collections.LockAccessMember = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.LockAccessMember
    }
});
