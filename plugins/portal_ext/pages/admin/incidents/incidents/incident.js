
PORTAL.Views.Incident = SWAM.Views.Tabs.extend({
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
                label:"Rule",
                field:"rule.name",
                columns: 6
            },
            {
                label:"Rule Action",
                field:"rule.action",
                columns: 6
            },
            {
                label:"Component",
                field:"component",
                columns: 6
            },
            {
                label:"Component ID",
                field:"component_id",
                columns: 6
            },
            {
                label:"Assigned TO",
                field:"assigned_to.username",
                columns: 6
            },
            {
                label:"Notify Sent",
                field:"action_sent|datetime",
                columns: 6
            },
            {
                label:"Reporter",
                field:"reporter_ip",
                columns: 6
            },
            {
                label:"Host",
                field:"hostname",
                columns: 6
            }
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
                {label:"description", field:"description"},
            ],
            pagination: true,
        }));

        this.getTab("events").on("item:clicked", function(item){
            SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
        }.bind(this));
    },

    init_history_tab: function() {
        let collection = new SWAM.Collections.IncidentHistory();
        collection.params.parent = -1;
        this.addTab("Notes", "history", new SWAM.Views.AdvancedTable({
            collection: collection,
            remote_sort: false,
            add_button: {
                type: "button",
                action: "add",
                label: "<i class='bi bi-pencil'></i> Add Note",
                classes: "btn btn-primary",
                columns:3
            },
            add_classes: "swam-table-clickable",
            columns: [
                {label:"When", template:"<div>{{model.by.display_name}}</div><div>{{model.created|datetime}}</div>"},
                {label:"Note", template:"<div>{{{model.note}}}</div>"}
            ],
            pagination: true,
        }));
    },

    setModel: function(model) {
        // filter the collection models to pertain only to the views model id
        SWAM.Views.Tabs.prototype.setModel.call(this, model);
        this.options.model = model;
        this.getTab("events").collection.params.incident = this.options.model.get("id");
        this.getTab("events").collection.reset();
        this.getTab("history").collection.params.parent = this.options.model.get("id");
        this.getTab("history").collection.reset();
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
