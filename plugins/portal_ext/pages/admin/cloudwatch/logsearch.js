SWAM.Models.ServerLogs = SWAM.Model.extend({
    defaults: {
    	url:"/api/metrics/servers/logs"
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
        },
        columns: [
            {label:"IP", field:"remote_addr"},
            {label:"Request", field:"request"},
            {label:"Status", field:"status"},
            {label:"Referrer", field:"http_referer"},
            {label:"Agent", field:"http_user_agent"}
        ],
        Collection: SWAM.Collections.ServerLogs,
        add_button: false,
        group_filtering: false,
        collection_params: {
            ip: "headless"
        },
        filter_bar: [
            {
                type: "group",
                classes: "justify-content-sm-end",
                columns: 9,
                fields: [
                    {
                        name: "ip",
                        type: "search",
                        columns: 3,
                        columns_classes: "col-sm-12 col-md-5 col-lg-6",
                        form_wrap: "search",
                        placeholder: "search...",
                        can_clear: true,
                        button: {
                            icon: "bi bi-search"
                        },
                        attributes: {
                        	autocomplete: "nope"
                        }
                    },
                    {
                        name: "server",
                        type: "text",
                        placeholder: "server",
                        columns: 3,
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
                ],
                filters: [
               	   {
                    	columns: 3,
                       	name: "gz",
                       	type: "select",
                       	options: [
        	               	{
        	               		label: "Active Logs",
        	               		value: "active"
        	               	},
        	               	{
        	               		label: "GZip Logs",
        	               		value: "gz"
        	               	},
                       	]
                    },
                ]
            }
        ]
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
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

});
