

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
                    label: "Group Kind",
                    field: "kind",
                    type: "select",
                    help: "Orgnazations are top level groups that hold merchants.  Merchants typically hold internal groups.",
                    options: [
                        {
                            label: "Organization",
                            value: "org",
                        },
                        {
                            label: "Merchant",
                            value: "merchant",
                        },
                        {
                            label: "Internal Group",
                            value: "internal_group",
                        },
                        {
                            label: "Test Group",
                            value: "test_group",
                        },
                    ],
                    default:"merchant",
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