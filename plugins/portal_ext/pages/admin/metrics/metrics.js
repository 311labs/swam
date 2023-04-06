
PORTAL.Pages.Metrics = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "metrics",
        icon: "exclamation-diamond-fill",
        title: "Events",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"start", field:"start|datetime"},
            {label:"granularity", field:"granularity"},
            {label:"group", field:"group"},
            {label:"slug", field:"slug"},
            {label:"uuid", field:"uuid"},
        ],
        Collection: SWAM.Collections.Metrics,
        collection_params: {
            size: 25
        },
        add_button: false,
        group_filtering: false,
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 12,
                fields: [
                    {
                        name: "slug",
                        columns: 3,
                        type: "text",
                        can_clear: true,
                        placeholder: "enter slug"
                    },
                    {
                        name: "uuid__icontains",
                        columns: 3,
                        type: "text",
                        can_clear: true,
                        placeholder: "enter uuid"
                    },
                    {
                        name: "granularity",
                        columns: 3,
                        type: "select",
                        placeholder: "all",
                        options: ["daily", "weekly", "monthly", "yearly"]
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
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        // this.view = new PORTAL.Views.Member();
    },

    on_item_clicked: function(item) {
        // this.view.setModel(item.model);
        SWAM.Dialog.show({title:"Metrics", size:"lg", can_dismiss:true, json:item.model.getMetrics()});
    },

});


