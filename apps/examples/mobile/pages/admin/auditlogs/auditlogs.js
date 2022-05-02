
PORTAL.Pages.AuditLogs = SWAM.Pages.TablePage.extend({

    defaults: {
        icon: "journal-text",
        title: "Audit Logs",
        list_options: {
            add_classes: "swam-table-clickable small table-sm",
        },
        columns: [
            {label:"Created", field:"when|datetime"},
            {label:"Method", field:"request_method"},
            {label:"Path", field:"request_path"},
            {label:"IP", field:"session.ip", classes:"d-none d-lg-table-cell"},
	        {label:"Action", field:"action", classes:"d-none d-xl-table-cell"},
	        {label:"Component", field:"component", classes:"d-none d-lg-table-cell"},
            {label:"User", field:"user.username", classes:"d-none d-xl-table-cell"},
        ],
        Collection: SWAM.Collections.AuditLog,
        collection_params: {
            size: 10
        },
        filters: [
        	{
        		label: "Date Range",
        		name: "when",
        		type: "daterange"
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
        				label: "Low",
        				value: "__gt:5"
        			},
        			{
        				label: "Medium",
        				value: "__gt:20"
        			},
        			{
        				label: "High",
        				value: "__gt:30"
        			}
        		]
        	},
            {
                label: "Username",
                name: "user.username",
                type: "text"
            },
        ]
    },

    on_item_clicked: function(item) {
    	var opts = {
    		title: SWAM.renderString("Audit Log - {{when|datetime_tz}} - {{request_path}}", item.model),
    		size: "xl"
    	}
        var header = SWAM.Views.ModelView.build(item.model,
            [
                {label:"Created", field:"when|datetime", columns: 3},
                {label:"Method", field:"request_method", columns: 3},
                {label:"Level", field:"level", columns: 3},
                {label:"Path", field:"request_path", columns: 3},
                {label:"IP", field:"session.ip", columns: 3},
                {label:"Action", field:"action", columns: 3},
                {label:"Component", field:"component", columns: 3},
                {label:"User", field:"user.username", columns: 3},
                {label:"UserAgent", field:"session.user_agent", columns: 12},
            ]);
    	if (item.model.get("action") == "error") {
    		opts.message = header + item.model.get("message", "", "prettystacktrace|wrap('pre')");
    	} else {
            opts.message = header;
    		opts.json = item.model.get("message");
    	}
    	SWAM.Dialog.show(opts);
    }


});

