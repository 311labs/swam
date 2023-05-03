
PORTAL.Pages.Groups = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "group",
        title: "Groups",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {
                label:"id", field:"id"
            },
            {
                label: "group",
                sort: "name",
                template: "<div>{{model.name}}</div><div class='text-muted'>{{model.kind}}</div>",
                classes:"d-table-cell d-sm-none"
            },
            {
                label:"uuid", field:"uuid",
                classes:"d-none d-sm-none d-lg-table-cell"
            },
            {
                label:"Created", field:"created|date",
                classes:"d-none d-sm-table-cell"
            },
            {
                label:"name", field:"name",
                classes:"d-none d-sm-table-cell"
            },
            {
                label:"kind", field:"kind",
                classes:"d-none d-sm-table-cell"

            },
            {
                label:"city", field:"location.city",
                no_sort:true,
                classes:"d-none d-sm-none d-lg-table-cell"
            },
            {
                label:"state", field:"location.state",
                no_sort:true,
                classes:"d-none d-sm-none d-lg-table-cell"
            },
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

