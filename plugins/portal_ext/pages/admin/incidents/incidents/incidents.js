
PORTAL.Pages.Incidents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Incidents",
        list_options: {
            add_classes: "swam-table-clickable",
            batch_select: true,
            batch_actions: [
                {label:"Ignore", icon:"shield-fill-x", action:"ignore"},
                {label:"Accept", icon:"eye-fill", action:"accept"},
                {label:"Resolved", icon:"shield-check", action:"resolved"},
            ],
        },
        columns: [
            {label:"state", field:"state_display"},
            {label:"when", field:"created|datetime"},
            {label:"component", field:"component"},
            {label:"rule", field:"rule.name|ifempty('none')", sort_field:"rule.id", classes:"d-none d-lg-table-cell"},
            {label:"description", field:"description", classes:"d-none d-lg-table-cell"},
            {label:"priority", field:"priority"},

        ],
        Collection: SWAM.Collections.Incident,
        collection_params: {
            size: 10,
            state: "__lt:3"
        },
        group_filtering: true,
        filters: [
            {
                label: "Date Range",
                name: "created",
                type: "daterange",
                operator: "is"
            },
            {
                labe: "Search",
                name: "search",
                type: "text",
            },
        ],
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                fields: [
                    {
                        placeholder: "Select State",
                        type: "select",
                        name: "state",
                        options: [
                            {label:"Active", value:"__lt:3"},
                            {label:"New", value:"0"},
                            {label:"Opened", value:"1"},
                            {label:"Ignored", value:"3"},
                            {label:"Resolved", value:"4"}
                        ],
                        columns: 3
                    },
                    {
                        name: "component",
                        type: "select",
                        editable: true,
                        placeholder: "Select Component",
                        options: SWAM.Models.Incident.COMPONENTS,
                        columns: 3,
                    },
                    {
                        columns: 3,
                        columns_classes: "col-sm-3 col-md-3 col-lg-2",
                        type: "select",
                        name: "size",
                        options: [
                            5, 10, 20, 50, 100
                        ]
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
        this.view = new PORTAL.Views.Incident();
    },

    on_action_ignore: function(evt) {
        app.showBusy();
        let selected = this.getBatchSelected();
        let last_index = selected.length-1;
        _.each(selected, function(item, index){
            item.model.save({state:3});
            if (index == last_index) {

            }
        });
        SWAM.toast("Incident System", `${selected.length} Incidents Ignored`);
        app.hideBusy();
        this.reload();
    },

    on_action_accept: function(evt) {
        app.showBusy();
        let selected = this.getBatchSelected();
        let last_index = selected.length-1;
        _.each(selected, function(item, index){
            item.model.save({state:1});
            if (index == last_index) {

            }
        });
        SWAM.toast("Incident System", `${selected.length} Incidents Accepted`);
        app.hideBusy();
        this.reload();
    },

    on_action_resolved: function(evt) {
        app.showBusy();
        let selected = this.getBatchSelected();
        let last_index = selected.length-1;
        _.each(selected, function(item, index){
            item.model.save({state:4});
            if (index == last_index) {

            }
        });
        SWAM.toast("Incident System", `${selected.length} Incidents Resolved`);
        app.hideBusy();
        this.reload();
    },

    on_item_clicked: function(item) {
        this.view.setModel(item.model);
        var title = item.model.get("description") + " on " + item.model.get("component"); 
        SWAM.Dialog.showView(this.view, {
            title: `Incident: ${title}`,
            kind: "primary",
            can_dismiss: true,
            padded: true,
            scrollable: true,
            size: 'lg',
            height: 'md',
            // "context_menu": context_menu
        });
    },

});


PORTAL.Views.Incident = SWAM.Views.Tabs.extend({
    on_init: function() {
        SWAM.Views.Tabs.prototype.on_init.call(this)
        let collection = new SWAM.Collections.IncidentEvent();
        collection.params.incident = -1;
        this.addTab("Events", "events", new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"when", field:"created|datetime"},
                {label:"description", field:"description"},
                {label:"hostname", field:"hostname"},
                {label:"category", field:"category"},
                {label:"level", field:"level"},
            ],
            pagination: true,
        }));

        this.getTab("events").on("item:clicked", function(item){
            SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
        }.bind(this));

        collection = new SWAM.Collections.IncidentHistory();
        collection.params.parent = -1;
        this.addTab("History", "history", new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"when", field:"created|datetime"},
                {label:"component", field:"component"},
                {label:"description", field:"description"},
                {label:"priority", field:"priority"},
                {label:"state", field:"state_display"},
            ],
            pagination: true,
        }));

        this.setActiveTab("events");
    },

    setModel: function(model) {
        // filter the collection models to pertain only to the views model id
        SWAM.Views.Tabs.prototype.setModel.call(this, model);
        this.options.model = model;
        this.getTab("events").collection.params.incident = this.options.model.get("id");
        this.getTab("history").collection.params.parent = this.options.model.get("id");
    }
});


