

SWAM.Models.User = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member"
    },
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
                    name:"metadata.phone",
                    label:"Phone",
                    type:"tel",
                    placeholder:"Enter Phone Number",
                    columns: 12
                },
            ]
        },
        " ",
        {
            label:"Permissions",
            help: "Control system level permissions.",
            type:"label",
            columns: 12
        },
        {
            name:"metadata.permissions.manage_members",
            label:"Manage Members",
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

    ]
});

SWAM.Collections.User = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.User
    }
}, {
    
});