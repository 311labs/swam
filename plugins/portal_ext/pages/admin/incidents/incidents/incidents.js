
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
                {label:"Accept", icon:"eye-fill", action:"open"},
                {label:"Resolved", icon:"shield-check", action:"resolved"},
            ],
        },
        columns: [
            {label:"when", field:"created|datetime"},
            {label:"component", field:"component"},
            {label:"description", field:"description"},
            {label:"priority", field:"priority"},
            {label:"state", field:"state_display"}
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
                label: "Component",
                name: "component",
                type: "text",
                operator: "is"
            },
            {
                label: "State",
                type: "select",
                name: "state",
                options: [
                    {label:"Active", value:"__lt:3"},
                    {label:"New", value:"0"},
                    {label:"Accepted/Opened", value:"1"},
                    {label:"Ignored", value:"3"},
                    {label:"Resolved", value:"4"}
                ]
            },
        ],
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        this.view = new PORTAL.Views.Incident();
    },

    on_action_ignore: function(evt) {
        app.showBusy();
        _.each(this.getBatchSelected(), function(item){
            SWAM.toast("Ignoring", item.model.get("description"), null, 2000);
            item.model.save({state:3})
        });
        app.hideBusy();
        this.reload();
    },

    on_action_accept: function(evt) {
        app.showBusy();
        _.each(this.getBatchSelected(), function(item){
            SWAM.toast("Accepting", item.model.get("description"), null, 2000);
            item.model.save({state:1})
        });
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


