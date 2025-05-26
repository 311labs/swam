PORTAL.Views.Incident = SWAM.View.extend(SWAM.Ext.DropZone).extend({
    template: "portal_ext.pages.admin.incidents.incidents.view",
    classes: "swam-view h-100 bg-white",

    on_init: function() {
        this.addChild("tabs", new PORTAL.Views.IncidentTabs());
        this.notes = new SWAM.Views.ChatView({
            title: "Notes",
            buttons: [
                {
                    icon: "paperclip",
                    action: "upload"
                },
                {
                    icon: "reload",
                    action: "reload"
                }
            ],
            item_options: {
                message_field: "note"
            },
            collection: new SWAM.Collections.IncidentHistory()
        });
        if (window.outerWidth > 800) {
            this.addChild("notes", this.notes);
        } else {
            this.template = "portal_ext.pages.admin.incidents.incidents.mview";
            this.getChild("tabs").addTab("Notes", "notes", this.notes);
        }

        this.notes.on("new_msg", this.on_new_msg, this);
    },

    setModel: function(model) {
        // filter the collection models to pertain only to the views model id
        SWAM.View.prototype.setModel.call(this, model);
        this.options.model = model;
        this.getTab("events").collection.params.incident = this.options.model.get("id");
        this.getTab("events").collection.reset();
        // this.getTab("history").collection.params.parent = this.options.model.get("id");
        // this.getTab("history").collection.reset();
        this.notes.collection.params.parent = this.options.model.get("id");
        this.notes.collection.fetch()
    },

    on_new_msg: function(evt) {
        if (!evt.value) return;
        this.addNote(evt.value);
    },

    addNote: function(text, file) {
        this.notes.showBusy();
        let model = new SWAM.Models.IncidentHistory();
        let data = {note:text};
        data.by = app.me.id;
        data.kind = "note";
        data.group = this.model.get("group.id");
        data.parent = this.model.id;
        if (file) {
            data.media = file;
            data.kind = "upload";
            data = SWAM.Form.filesToData(file, data);
        }
        model.save(data, function(resp){
            this.notes.hideBusy();
            this.notes.clearMessage();
            this.notes.collection.fetch();
        }.bind(this));
    },

    getTab: function(tab) {
        return this.children.tabs.getTab(tab);
    },

    on_drop_file: function(file) {
        let dsize = SWAM.Localize.bytes(file.size);
        let msg = `${file.name} (${dsize})`;
        SWAM.toast("File Uploading", msg, "info");
        this.addNote(msg, file);
    },

    on_action_upload: function(evt, id) {
        SWAM.Dialog.showForm(
            [{label:"Select File", name:"media", type:"file"}],
            {
                callback: function(dlg){
                    var files = dlg.getFiles();
                    // console.log(files)
                    dlg.dismiss();
                    this.on_drop_file(files.media[0].files[0]);
                }.bind(this)
            });

    },

    on_action_chat_click_upload: function(evt, id) {
        let item = this.notes.getChatItem($(evt.currentTarget).parent().data("chatid"));
        SWAM.Dialog.showMedia(item.model.get("media"));
    },

    on_action_state_change: function(evt, id) {
        app.showBusy();
        this.model.save({state:id}, function(){
            app.hideBusy();
            if (this.options.dlg) this.options.dlg.dismiss();
        }.bind(this));
    },

    on_action_edit_incident: function(evt, id) {
        let dlg = SWAM.Dialog.editModel(this.model);
    },

    on_action_edit_rule: function(evt, id) {
        this.editRule();
    },

    editRule: function() {
        let model = new SWAM.Models.IncidentRule(this.model.get("rule"));
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

    on_action_view_abuse: function(evt, id) {
        var opts = {
            title: "Abuse IP Info",
            size: "md",
            json: this.model.get("metadata.abuse_info")
        }
        SWAM.Dialog.show(opts);
    },

    showDialog: function(model, collection, parent) {
        this.setModel(model);
        let state = model.get("state");
        let item = {model:model};
        let status_menu = [
            {
                label: "New",
                id: 0,
                action: "state_change",
                icon: "shield-exclamation",
            },
            {
                label: "Open",
                id: 1,
                action: "state_change",
                icon: "shield-fill-plus",
            },
            {
                label: "Pause",
                id: 2,
                action: "state_change",
                icon: "pause-circle",
            },
            {
                label: "Ignore",
                id: 3,
                action: "state_change",
                icon: "shield-x",
            },
            {
                label: "Resolved",
                id: 4,
                action: "state_change",
                icon: "shield-fill-check",
            }
        ];
        let context_menu = [
            {
                label: "Edit Incident",
                icon: "pencil",
                action: "edit_incident"
            }
        ];

        if (model.get("rule")) {
            context_menu.push({
                    label: "Edit Rule",
                    icon: "pencil",
                    action: "edit_rule"
                });
        }

        if (model.get("category") == "ossec") {
            context_menu.push({
                    label: "Abuse IP Info",
                    icon: "shield-fill",
                    action: "view_abuse"
                });
        }

        context_menu.push({divider:true});
        var dlg;
        context_menu.push({
            label: "Close Window",
            icon: "x",
            action: "close"
        });

        let header_template = "portal_ext.pages.admin.incidents.incidents.header";
        // let header = SWAM.renderTemplate(header_template, item);

        let title_view = new SWAM.View({
            icon: model.getCategoryIcon(),
            template:header_template
        });
        title_view.addChild("action_bar", new SWAM.Form.View({
            model:model,
            action_context: this,
            fields:[
            {
                type: "buttongroup",
                buttons: [
                    {
                        type: "dropdown",
                        name: "state",
                        btn_classes: "btn btn-primary",
                        columns_classes: "col-auto",
                        items: status_menu
                    },
                    {
                        type: "dropdown",
                        icon:"bi bi-three-dots-vertical",
                        btn_classes: "btn btn-primary dropdown-toggle dropdown-toggle-hide-caret",
                        columns_classes: "col-auto",
                        items: context_menu
                    }
                ]
            }
        ]}));

        title_view.setModel(item.model);

        let dlg_opts = {
            title_view: title_view,
            title: null,
            can_dismiss: true,
            padded: false,
            scrollable: true,
            fullscreen: true,
            scrollable_class: "overflow-y-auto overflow-x-hidden",
            add_header_classes: "d-block border-bottom-1",
            // size: 'lg',
            // height: 'md',
            "context_menu": context_menu
        };

        if (collection) {
            dlg_opts.buttons = [
                {
                    id: "prev",
                    action:"choice",
                    label:"Previous",
                },
                {
                    id: "next",
                    action:"choice",
                    label:"Next",
                    classes: "btn btn-link me-4"
                },
                {
                    action:"close",
                    label:"Close",
                },
            ];

            dlg_opts.callback = function(dlg, choice) {
                dlg.dismiss();
                if (choice == "prev") {
                    this.showDialog(collection.getBefore(item.model), collection, parent);
                } else {
                    this.showDialog(collection.getAfter(item.model), collection, parent);
                }

            }.bind(this);
        }

        dlg = SWAM.Dialog.showView(this, dlg_opts);
        this.options.dlg = dlg;
        return dlg;
    }
});

PORTAL.Views.IncidentTabs = SWAM.Views.Tabs.extend({
    on_init: function() {
        SWAM.Views.Tabs.prototype.on_init.call(this);
        this.init_details_tab();
        this.init_events_tab();
        this.init_history_tab();
        this.setActiveTab("details");
    },

    init_details_tab: function() {
        this.addTab("Details", "details", new SWAM.Views.ModelView({inline:false, fields:[
            {
                label: "Details",
                field: "details",
                tag: "pre",
                localize: "prettystacktrace",
                columns: 12
            },
            {
                label:"Created",
                field:"created|datetime",
                columns: 6
            },
            {
                label:"Category",
                field:"category",
                columns: 6
            },
            {
                label:"User",
                field:"metadata.username|ifempty|clipboard",
                columns: 6
            },
            {
                label:"IP",
                field:"reporter_ip|ifempty|clipboard",
                columns: 6
            },
            {
                label:"Host",
                field:"hostname|ifempty",
                columns: 6
            },
            {
                label:"Location",
                field:"metadata|location",
                columns: 6
            },
            {
                label:"Group",
                field:"metadata.group_name|ifempty",
                columns: 6
            },
            {
                label:"Group ID",
                field:"metadata.group_id|ifempty|clipboard",
                columns: 6
            },
            {
                label:"User Agent",
                field:"metadata.http_user_agent|ifempty",
                columns: 12
            },
            {
                label:"Rule",
                field:"rule.name|ifempty",
                columns: 6
            },
            {
                label:"Rule Action",
                field:"rule.action|ifempty",
                columns: 6
            },
            {
                label:"Abuse Info",
                field:"metadata.abuse_info.abuseConfidenceScore|ifempty",
                view_action: "view_abuse",
                view_classes: "text-primary",
                columns: 6
            },
            {
                label:"OSSEC ID",
                field:"metadata.rule_id",
                columns: 6
            },
        ]}));
    },

    init_events_tab: function() {
        let collection = new SWAM.Collections.IncidentEvent();
        collection.params.incident = -1;
        this.addTab("Events", "events", new SWAM.Views.Table({
            collection: collection,
            remote_sort: false,
            add_classes: "swam-table-clickable",
            columns: [
                {label:"when", field:"created|datetime"},
                {label:"hostname", field:"hostname"},
                {label:"ip", field:"reporter_ip"},
                {label:"description", field:"description", td_classes:"td-pre"}
            ],
            pagination: true,
        }));

        this.getTab("events").on("item:clicked", function(item){
            // SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
             let dlg = PORTAL.Views.Event.showDialog(item.model);
        }.bind(this));
    },

    init_history_tab: function() {
        // let collection = new SWAM.Collections.IncidentHistory();
        // collection.params.parent = -1;
        // this.addTab("Notes", "history", new SWAM.Views.AdvancedTable({
        //     collection: collection,
        //     remote_sort: false,
        //     add_button: {
        //         type: "button",
        //         action: "add",
        //         label: "<i class='bi bi-pencil'></i> Add Note",
        //         classes: "btn btn-primary",
        //         columns:3
        //     },
        //     add_classes: "swam-table-clickable",
        //     columns: [
        //         {label:"When", template:"<div>{{model.by.display_name}}</div><div>{{model.created|datetime}}</div>"},
        //         {label:"Note", template:"<div>{{{model.note}}}</div>", td_classes:"td-pre"}
        //     ],
        //     pagination: true,
        // }));
    },

    on_action_add: function(evt) {
        let view = this.getTab("history");
        var options = {
            title:"Add Note",
            size: "md",
            form_config: view.options.form_config,
            callback:function(model, resp) {
                if (resp.status) {
                // auto saved nothing to do
                    view.collection.fetch();
                }
            }.bind(view),
        };

        options.defaults = {parent:this.model.id, by:app.me.id};

        if (!view.options.add_form && view.collection.options.Model.ADD_FORM) view.options.add_form = view.collection.options.Model.ADD_FORM;
        if (!view.options.edit_form) view.options.edit_form = view.collection.options.Model.EDIT_FORM;
        if (!view.options.add_form && view.options.edit_form) view.options.add_form = view.options.edit_form;

        if (view.options.add_form) options.fields = view.options.add_form;
        if (!view.options.group_filtering) {
            options.use_app_group = false;
        }
        if (view.collection.params.group) {
            options.extra_fields = [
                {
                    type: "hidden",
                    name: "group",
                    default: view.collection.params.group
                }
            ];
        }
        SWAM.Dialog.editModel(new view.collection.options.Model(), options);
    },

});
