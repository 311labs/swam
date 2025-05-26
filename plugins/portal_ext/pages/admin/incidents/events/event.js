PORTAL.Views.Event = SWAM.Views.Tabs.extend({

    on_init: function() {
        SWAM.Views.Tabs.prototype.on_init.call(this);
        this.init_summary_tab();
        this.init_details_tab();
        this.setActiveTab("summary");
    },

    init_summary_tab: function() {
        this.addTab("Summary", "summary", new SWAM.Views.ModelView({inline:false, fields:[
            {
                label: "Details",
                field: "details",
                tag: "pre",
                localize: "ifempty(description)|prettystacktrace",
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

    init_details_tab: function() {
        let metadata = this.options.model.get("metadata");
        if (metadata) {
            delete metadata.details;
            delete metadata.description;
        }
        this.addTab("Metadata", "metadata", new SWAM.Views.ModelView({
            model:new SWAM.Model(metadata),
            as_table: true,
            ignore_set_model:true}));
    },

    on_action_edit_event: function(evt, id) {
        let dlg = SWAM.Dialog.editModel(this.model);
    },

    on_action_ip_lookup: function(evt, id) {
        PORTAL.Pages.GeoIPs.Lookup(this.model.get("reporter_ip"));
    },

    on_action_abuse_info: function(evt, id) {
        SWAM.Rest.GET("/incident/abuse/lookup", {ip: this.model.get("reporter_ip")}, (response, status) => {
            console.log(response, status)
        });
    },
}, {
    showDialog: function(model) {
        let view = new this({ model: model });
        let context_menu = [
            {
                label: "Edit Event",
                icon: "pencil",
                action: "edit_event"
            },
            {divider:true},
            {
                label: "IP Lookup",
                icon: "search",
                action: "ip_lookup"
            },
            {
                label: "Abuse IP Info",
                icon: "shield-fill",
                action: "view_abuse"
            },
            {
                label: "View OSSEC",
                icon: "terminal",
                action: "view_ossec"
            }
        ];
        context_menu.push({divider:true});
        var dlg;
        context_menu.push({
            label: "Close Window",
            icon: "x",
            action: "close"
        });

        let header_template = "portal_ext.pages.admin.incidents.events.header";
        // let header = SWAM.renderTemplate(header_template, item);

        let title_view = new SWAM.View({
            icon: model.getCategoryIcon(),
            model: model,
            template:header_template
        });

        title_view.addChild("action_bar", new SWAM.Form.View({
            model:model,
            action_context: view,
            fields:[
            {
                type: "buttongroup",
                buttons: [
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

        let dlg_opts = {
            title_view: title_view,
            title: null,
            can_dismiss: true,
            padded: false,
            scrollable: true,
            fullscreen: false,
            scrollable_class: "overflow-y-auto overflow-x-hidden",
            add_header_classes: "d-block border-bottom-1",
            size: 'lg',
            // height: 'md',
            "context_menu": context_menu
        };

        dlg = SWAM.Dialog.showView(view, dlg_opts);
        return dlg;
    }
});
