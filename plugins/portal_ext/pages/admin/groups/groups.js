
PORTAL.Pages.Groups = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "group",
        title: "Groups",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"id", field:"id"},
            {label:"uuid", field:"uuid"},
            {label:"Created", field:"created|date"},
            {label:"name", field:"name"},
            {label:"kind", field:"kind"},
            {label:"city", field:"location.city", no_sort:true},
            {label:"state", field:"location.state", no_sort:true},
        ],
        Collection: SWAM.Collections.Group,
        collection_params: {
            size: 10
        },
        group_filtering: false,
        filters: [
            {
                label: "Name",
                name: "name",
                type: "text"
            },
            {
                label: "Kind",
                name: "kind",
                type: "select",
                editable: true,
                options: [
                    "org", "group", "incident", "test_group", "internal_group"
                ]
            },
            {
                label: "Created",
                name: "created",
                type: "daterange"
            },
            {
                label: "City",
                name: "city",
                type: "text"
            },
            {
                label: "State",
                name: "state",
                type: "select",
                options: "us_states"
            }
        ]
    },

    on_group_change: function() {
        if (app.group) {
            this.collection.params.parent = app.group.id;
        } else if (this.collection.params.parent) {
            delete this.collection.params.parent;
        }
        if (this.isActivePage()) {
            this.collection.fetch();
        }
    },
});

