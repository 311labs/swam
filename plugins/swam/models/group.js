
SWAM.Models.Group = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/group"
    },

    fetchMembership: function(callback) {
        // this will fetch the membership for the app.me for this group
        if (!this.membership) this.membership = new SWAM.Models.Member();
        SWAM.Rest.GET(`/rpc/account/membership/group/${this.id}`, {}, function(resp, status){
            this.membership._on_fetched(resp, status);
            if (callback) callback(this, resp);
        }.bind(this));
        return this.membership;
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
                    name:"uuid",
                    label:"UUID",
                    help: "globaly unique id that can be used to reference this group.",
                    type:"text",
                    placeholder:"Enter UUID (OPTIONAL)",
                    columns: 12
                },
                {
                    label: "Group Kind",
                    name: "kind",
                    type: "select",
                    editable: true,
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
                            label: "Incident Group",
                            value: "incident",
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