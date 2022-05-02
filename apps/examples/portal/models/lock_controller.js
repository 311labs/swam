

SWAM.Models.LockController = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/acs/lock/controller"
    },
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

SWAM.Collections.LockController = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.LockController
    }
});