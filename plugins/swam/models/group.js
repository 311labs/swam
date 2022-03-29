

SWAM.Models.Group = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/group"
    },
}, {
    EDIT_FORM: [
        {
            type:"group",
            columns: 4,
            fields: [
                {
                    name:"logo",
                    label:"Logo",
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
                    name:"name",
                    label:"Name",
                    type:"text",
                    placeholder:"Enter Name",
                    columns: 12
                },
                {
                    name:"kind",
                    label:"Kind",
                    type:"kind",
                    placeholder:"Enter Group Kind",
                    columns: 12
                },
                {
                    name:"metadata.timezone",
                    label:"Timezone",
                    type:"select",
                    options: "timezones",
                    columns: 12
                },
            ]
        }
    ]
});

SWAM.Collections.Group = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Group
    }
});