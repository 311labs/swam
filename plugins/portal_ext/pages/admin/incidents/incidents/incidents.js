
PORTAL.Pages.Incidents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "incidents",
        icon: "exclamation-diamond-fill",
        title: "Incidents",
        list_options: {
            add_classes: "swam-table-clickable swam-table-tiny small table-sm",
            batch_select: true,
            batch_actions: [
                {label:"Ignore", icon:"shield-fill-x", action:"ignore"},
                {label:"Accept", icon:"eye-fill", action:"accept"},
                {label:"Resolved", icon:"shield-check", action:"resolved"},
                {label:"Merge", icon:"sign-merge-left", action:"merge"},
            ]
        },
        item_url_param: "incident",
        columns: [
            {
                label:"incident",
                sort_field: "category",
                template: "portal_ext.pages.admin.incidents.incidents.item",
                classes:"d-table-cell d-sm-none"
            },
            {
                label:"when", template:"portal_ext.pages.admin.incidents.incidents.when",
                classes: "d-none d-sm-table-cell fs-8"
            },
            {
                label:"details",
                sort_field: "category",
                template: "portal_ext.pages.admin.incidents.incidents.details",
                classes: "d-none d-sm-table-cell"
            },
            // {
            //     label:"state",
            //     template:"{{model.state_display}} #{{model.id}}",
            //     sort_field:"state",
            //     classes: "d-none d-sm-table-cell"
            // },
            // {
            //     label:"events", field:"metadata.event_count",
            //     classes: "d-none d-sm-table-cell"
            // },
            // {
            //     label:"cat", field:"category",
            //     classes: "d-none d-sm-table-cell"
            // },
            // {
            //     label:"rule", field:"rule.name|ifempty('none')",
            //     sort_field:"rule.id",
            //     classes:"d-none d-lg-table-cell"
            // },
            // {
            //     label:"description", field:"description",
            //     classes:"d-none d-lg-table-cell"
            // }
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
            {
                label: "Component",
                name: "component",
                type: "text"
            },  
            {
                label: "Component ID",
                name: "component_id",
                type: "text"
            },
            {
                label: "IP",
                name: "reporter_ip",
                type: "text"
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
                            {label:"Paused", value:"2"},
                            {label:"Ignored", value:"3"},
                            {label:"Resolved", value:"4"}
                        ],
                        columns: 3
                    },
                    {
                        name: "category",
                        type: "select",
                        editable: true,
                        placeholder: "Select category",
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
        setTimeout(function(){
            app.hideBusy();
            this.reload();
        }.bind(this), 2000);
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
        setTimeout(function(){
            app.hideBusy();
            this.reload();
        }.bind(this), 2000);
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
        setTimeout(function(){
            app.hideBusy();
            this.reload();
        }.bind(this), 2000);    },

    on_action_merge: function(evt) {
        SWAM.Dialog.confirm({
            title: "Merge Incidents",
            message: "Are you sure you want to merge the selected incidents?",
            callback: function(dlg, value) {
                dlg.dismiss();
                if (value.upper() == "YES") {
                    this.mergeSelected(evt);
                }
            }.bind(this)
        });
    },
    
    mergeSelected: function(evt) {
        app.showBusy();
        let selected = this.getBatchSelected();
        let last_index = selected.length-1;
        let merge_to = selected.pop();
        let ids = [];
        _.each(selected, function(item, index){
            ids.push(item.model.id);
        });
        if (ids.length == 0) {
            app.hideBusy();
            SWAM.Dialog.warning("requires at least 2 items selected");
            returns;
        }
        merge_to.model.save({
            action: "merge",
            merge_ids: ids
        }, function(model, resp){
            SWAM.toast("Incident System", `${selected.length} Incidents Merged`);
            app.hideBusy();
            if (resp.status) {
                this.reload();
            } else {
                SWAM.Dialog.warning(resp.error);
            }
            
        }.bind(this));
    },

    on_rule_edit: function(item) {
        let model = new SWAM.Models.IncidentRule(item.model.get("rule"));
        let view = new PORTAL.Views.Rule();
        view.setModel(model);
        let dlg = SWAM.Dialog.showView(view, {
            title: SWAM.renderString("Rule #{{model.id}} - {{model.name}}", {model:model}),
            size:"lg", vsize:"lg",
            can_dismiss:true,
            context_menu: [
                {
                    label: "Edit",
                    icon: "pencil",
                    callback: function(d, menu) {
                        SWAM.Dialog.editModel(model, {});
                    }
                }
            ]
        });
    },

    on_item_clicked: function(item) {
        this.view.setModel(item.model);
        let state = item.model.get("state");
        let state_display = item.model.get("state_display");
        let description = item.model.get("description");
        let component = item.model.get("component"); 

        let context_menu = [
            {
                label: "Edit Incident",
                icon: "pencil",
                callback: function(dlg, menu) {
                    this.on_item_edit(item);
                }.bind(this)
            }
        ];

        if (item.model.get("rule")) {
            context_menu.push({
                    label: "Edit Rule",
                    icon: "pencil",
                    callback: function(dlg, menu) {
                        this.on_rule_edit(item);
                    }.bind(this)
                });
        }

        context_menu.push({divider:true});
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
            } else if (state == 1) {
                context_menu.push({
                    label: "Pause",
                    icon: "inbox-fill",
                    callback: function(dlg, menu) {
                        app.showBusy();
                        item.model.save({state:2}, function(){
                            app.hideBusy();
                            dlg.dismiss();
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
                        dlg.dismiss();
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
                        dlg.dismiss();
                        this.collection.fetch();
                    }.bind(this));
                }.bind(this)
            });
        }
        let header = SWAM.renderTemplate("portal_ext.pages.admin.incidents.incidents.header", {model:item.model});
        let dlg = SWAM.Dialog.showView(this.view, {
            title: header,
            kind: "primary",
            can_dismiss: true,
            padded: true,
            scrollable: true,
            size: 'lg',
            height: 'md',
            "context_menu": context_menu
        });

        this.on_item_dlg(item, dlg);
    },

});



