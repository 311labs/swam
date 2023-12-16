
PORTAL.Pages.Groups = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "group",
        title: "Groups",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        item_url_param: "item",
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

            }
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
                label: "Disabled",
                name: "is_active",
                type: "select",
                placeholder: "Select Status",
                options: [{label:"Disabled", value: 0}, {label:"Enabled", value:1}]
            },
            {
                label: "Created",
                name: "created",
                type: "daterange"
            },
            {
                label: "ID",
                name: "id",
                type: "text"
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
                editable: true,
                options: "us_states"
            }
        ],
        // batch_select: true,
        // batch_actions: [
        //     {label:"Delete", icon:"trash", action:"delete"},
        //     {label:"Refresh", icon:"recycle", action:"refresh"}
        // ]
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

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.AdminGroup();
    },

    on_item_clicked: function(item) {
        this.view.setModel(item.model);
        let dlg = SWAM.Dialog.showView(this.view, {
            title: item.model.get("name"),
            size:"lg", vsize:"lg",
            add_classes: "modal-primary",
            context_menu: [
                {
                    icon: "pencil",
                    label: "Edit",
                    action: "edit_group",
                    callback: function(dlg, menu) {
                        this.on_item_edit(item);
                    }.bind(this)
                }
            ],
            can_dismiss:true, scrollable:true});
        this.on_item_dlg(item, dlg);
    },
});

