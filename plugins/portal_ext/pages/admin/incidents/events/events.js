
PORTAL.Pages.IncidentEvents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Events",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"when", field:"created|datetime"},
            {label:"description", field:"description"},
            {label:"hostname", field:"hostname"},
            {label:"category", field:"category"},
            {label:"level", field:"level"},
        ],
        Collection: SWAM.Collections.IncidentEvent,
        collection_params: {
            size: 10
        },
        add_button: false,
        group_filtering: true,
        filters: [
            {
                label: "Created",
                name: "created",
                type: "daterange"
            },
            {
                label: "IP",
                name: "reporter_ip",
                type: "text"
            },
            {
                label: "Category",
                name: "category",
                type: "select",
                editable: true,
                options: ["ossec", "account"]
            },
            {
                label: "Level",
                name: "level",
                type: "select",
                options: [
                    {
                        label: "All Levels",
                        value: ""
                    },
                    {
                        label: "Caution",
                        value: "__lt:9"
                    },
                    {
                        label: "Warning",
                        value: "__lt:6"
                    },
                    {
                        label: "Critical",
                        value: "__lt:3"
                    }
                ]
            },
        ]
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        // this.view = new PORTAL.Views.Member();
    },

    on_item_clicked: function(item) {
        // this.view.setModel(item.model);
        SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
    },

});


