SWAM.Models.ServerLogs = SWAM.Model.extend({
    defaults: {
    	url:"/api/auditlog/server/logs"
    },
});

SWAM.Collections.ServerLogs = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.ServerLogs
    }
});

PORTAL.Pages.ServerLogs = SWAM.Pages.TablePage.extend({
    defaults: {
        download_prefix: "server_logs",
        icon: "exclamation-diamond-fill",
        title: "Server Logs",
        list_options: {
            add_classes: "swam-table-clickable",
            download_local: true,
        },
        columns: [
            {label:"When", field:"time|parse_date('DD/MMM/YYYY:HH:mm:ss Z')|datetime"},
            {label:"IP", field:"ip"},
            {label:"Method", field:"method"},
            {label:"URL", field:"url"},
            {label:"Status", field:"status"},
            {label:"Referrer", field:"referrer"}
        ],
        Collection: SWAM.Collections.ServerLogs,
        add_button: false,
        group_filtering: false,
        collection_params: {
            log_streams: "access.log,ui_access.log"
        },
        filters: [
            {
                label: "Date Range",
                name: "created",
                type: "daterange",
                operator: "is"
            },
            {
                label: "Server",
                name: "log_group",
                type: "select",
                options: []
            },
            // {
            //     label: "Log Files",
            //     name: "log_streams",
            //     type: "select",
            //     options: [
            //         "access.log",
            //         "access.log,ui_access.log",
            //     ]
            // },
        ]
    },

    on_page_init: function() {
        SWAM.Pages.TablePage.prototype.on_page_init.call(this);
        this.getChild("list").collection.options.reset_before_fetch = true;
        this.getChild("list")
        	.getChild("filters")
        	.getChild("fb_actions")
        	.on("input:change", this.on_input_change, this);
        // this.view = new PORTAL.Views.Member();
    },

    on_input_change: function(evt) {
    	evt.stopPropagation();
    	console.log(`${evt.name}, ${evt.value}, evt`);
    },

    on_item_clicked: function(item) {
        // this.view.setModel(item.model);
        SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
    },

    setServerLogOptions: function(options) {
        this.options.filters[1].options = options;
        if (this.getChild("list")) {
            this.getChild("list").getChild("filters").options.filters[1].options = options;
        }  
    }

});
