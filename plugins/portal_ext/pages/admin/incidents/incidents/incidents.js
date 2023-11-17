
PORTAL.Pages.Incidents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Incidents",
        list_options: {
            add_classes: "swam-table-clickable swam-table-tiny",
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
            state: "0"
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
        let state = item.model.get("state");
        let state_display = item.model.get("state_display");
        let description = item.model.get("description");
        let component = item.model.get("component"); 

        let context_menu = [
            {
                label: "Edit",
                icon: "pencil",
                callback: function(dlg, menu) {
                    this.on_item_edit(item);
                }.bind(this)
            }
        ];

        let menu_state = {};
        if (state < 3) {
            if (state == 0) {
                context_menu.push({
                    label: "Open",
                    icon: "inbox-fill",
                    callback: function(dlg, menu) {
                        app.showBusy();
                        item.model.save({state:1}, function(){
                            app.hideBusy();
                            this.collection.fetch();
                        }.bind(this));
                    }.bind(this)
                });
            }

            context_menu.push({
                label: "Ignore",
                icon: "trash2",
                callback: function(dlg, menu) {
                    app.showBusy();
                    item.model.save({state:3}, function(){
                        app.hideBusy();
                        this.collection.fetch();
                    }.bind(this));
                }.bind(this)
            });

            context_menu.push({
                label: "Resolved",
                icon: "check-square",
                callback: function(dlg, menu) {
                    app.showBusy();
                    item.model.save({state:4}, function(){
                        app.hideBusy();
                        this.collection.fetch();
                    }.bind(this));
                }.bind(this)
            });
        }
        SWAM.Dialog.showView(this.view, {
            title: `<div>${description}</div><div class='row fs-7'><div class='col'>state: ${state_display}</div><div class='col'>category: ${component}</div></div>`,
            kind: "primary",
            can_dismiss: true,
            padded: true,
            scrollable: true,
            size: 'lg',
            height: 'md',
            "context_menu": context_menu
        });
    },

});



