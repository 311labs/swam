
SWAM.Models.LockAccess = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/acs/lock/access"
    },

    display_name: function() {
        var name = this.get("lock.name");
        if (name) return name;
        return this.get("lock.uuid");
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

SWAM.Collections.LockAccess = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.LockAccess
    }
});

