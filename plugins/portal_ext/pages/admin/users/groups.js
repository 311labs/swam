
PORTAL.Views.MemberGroups = SWAM.Views.PaginatedList.extend({
    defaults: {
        add_classes: "p-3",
        item_template: "portal_ext.pages.admin.users.group",
        Collection: SWAM.Collections.Member,
        can_view: true,
        collection_params: {
            size: 5
        },

        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                columns_classes: "col",
                fields: [
                    {
                        name: "search",
                        type: "search",
                        columns: 6,
                        columns_classes: "col-md col-lg col-sm-12",
                        form_wrap: "search",
                        placeholder: "search...",
                        can_clear: true,
                        button: {
                            icon: "bi bi-search"
                        },
                        attributes: {
                            autocomplete: "nope"
                        }
                    },
                    {
                        columns: 3,
                        columns_classes: "col-auto",
                        type: "buttongroup",
                        buttons: [
                            {
                                classes: "btn btn-secondary",
                                icon: "bi bi-arrow-repeat",
                                action: "reload"
                            },
                            {
                                type: "dropdown",
                                icon: "bi bi-download",
                                items: [
                                    {
                                        icon: "bi bi-filetype-csv",
                                        label: "Download CSV",
                                        action: "download_csv"
                                    },
                                    {
                                        icon: "bi bi-filetype-json",
                                        label: "Download JSON",
                                        action: "download_json"
                                    },
                                ]
                            }
                        ]
                    },
                ]
            }
        ],

        filters: [
            {
                label: "State",
                name: "state",
                type: "select",
                options: [
                    {label:"Active", value:0},
                    {label: "Disabled", value: -25},
                    {label: "Invite Pending", value: -10},
                ],
                operator: "is"
            },
            {
                label: "Role",
                name: "role",
                type: "select",
                editable: true,
                options: [
                    "user",
                    "admin",
                    "billing",
                    "guest"
                ],
                operator: "is"
            },
        ],
    },

    setModel: function(model) {
        this.model = model;
        if (this.options.group_members) {
            this.collection.params.group = model.id;
        } else {
            this.collection.params.member = model.id;
        }

        if (this.isInViewport()) {
            this.collection.fetch();
        } else {
            this.collection.reset();
        }
    },

    on_tab_focus: function() {
        this.collection.fetchIfStale();
    },

    on_item_clicked: function(item) {
        if (!this.options.can_view) return;
        let view;
        if (PORTAL.Views.Member) {
            view = new PORTAL.Views.Member();
            view.setModel(item.model);
        } else {
            view = new PORTAL.Views.AdminGroup();
            view.setModel(new SWAM.Models.Group(item.model.get("group")));
        }

        let dlg = SWAM.Dialog.showView(view, {scrollable:true, can_dismiss:true});
    }

});
