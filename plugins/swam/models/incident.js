

SWAM.Models.IncidentRule = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/rule"
    },

    bundle_by_display: function() {
        let b = this.get("bundle_by");
        let field = _.findWhere(SWAM.Models.IncidentRule.EDIT_FORM, {name:"bundle_by"});
        let opt = _.findWhere(field.options, {value:b});
        if (opt) return opt.label;
        return "";
    },
    bundle_time_display: function() {
        let b = this.get("bundle");
        let field = _.findWhere(SWAM.Models.IncidentRule.EDIT_FORM, {name:"bundle"});
        let opt = _.findWhere(field.options, {value:b});
        if (opt) return opt.label;
        return "Disabled";
    },

    match_by_display: function() {
        let b = this.get("match_by");
        let field = _.findWhere(SWAM.Models.IncidentRule.EDIT_FORM, {name:"match_by"});
        let opt = _.findWhere(field.options, {value:b});
        if (opt) return opt.label;
        return "All";
    }
}, {
    EDIT_FORM: [
        {
            name:"name",
            label:"Name",
            type:"text",
            placeholder:"Enter Name",
            columns: 6
        },
        {
            name:"category",
            label:"Category",
            type:"select",
            help: "The category is something the event will match on",
            editable: true,
            options: ["ossec", "account", "rest_error", "rest_denied", "firewall"],
            columns: 6
        },
        {
            name:"match_by",
            label:"Match By",
            type:"select",
            help: "Define how the rule check should match.  All when all the rules must match, Any for when just one rule needs to match.",
            options: [
                {
                    value: 0,
                    label: "All"
                },
                {
                    value: 4,
                    label: "Any"
                },
            ],
            columns: 6
        },
        {
            name:"priority",
            label:"Priority",
            type:"select",
            placeholder:"Select Priority",
            help: "Priortiy level with 1 being the highest level and 10 being the least important!",
            start: 0, step: 1, end: 10,
            columns: 6
        },
        {
            name:"bundle",
            label:"Bundle For",
            type:"select",
            placeholder:"Do Not Bundle",
            help: "Bundle any events that this rule triggers into one incident for a set time since the first event!",
            options: [
                {
                    label: "5 minutes",
                    value: 5,
                },
                {
                    label: "30 minutes",
                    value: 30,
                },
                {
                    label: "1 hour",
                    value: 60,
                },
                {
                    label: "2 hours",
                    value: 120,
                },
                {
                    label: "6 hours",
                    value: 360,
                },
                {
                    label: "12 hours",
                    value: 720,
                },
                {
                    label: "24 hours",
                    value: 1440,
                },
                {
                    label: "1 week",
                    value: 10080,
                },
                {
                    label: "1 week",
                    value: 10080,
                }
            ],
            columns: 6
        },
        {
            name:"bundle_by",
            label:"Bundle By",
            type:"select",
            help: "Perform an action when the rule is triggered. <br>Notify members of the group.<br>Trigger a task 'task:APP_NAME:FNAME:CHANNEL'.<br>Send email 'email:USER_NOTIFICATION'<br>Send sms 'sms:USER_NOTIFICATION'",
            options: [
                {
                    value: 0,
                    label: "Not Set"
                },
                {
                    value: 4,
                    label: "IP"
                },
                {
                    value: 1,
                    label: "Hostname"
                },
                {
                    value: 9,
                    label: "Group"
                },
                {
                    value: 2,
                    label: "Component"
                },
                {
                    value: 3,
                    label: "Component and Hostname"
                },
                {
                    value: 5,
                    label: "Component and IP"
                },
                {
                    value: 6,
                    label: "Category"
                },
                {
                    value: 7,
                    label: "Category and Hostname"
                },
                {
                    value: 8,
                    label: "Category and IP"
                },
            ],
            columns: 6
        },
        {
            name:"action",
            label:"Action",
            type:"select",
            help: "Perform an action when the rule is triggered. <br>Notify members of the group.<br>Trigger a task 'task:APP_NAME:FNAME:CHANNEL'.<br>Send email 'email:USER_NOTIFICATION'<br>Send sms 'sms:USER_NOTIFICATION'",
            editable: true,
            force_top: true,
            options: [
                "notify", "email", 
                "sms", "ignore", "resolved",
                "group:issues",
                "task:APP_NAME:FNAME:CHANNEL", 
                "email:USER_NOTIFICATION", 
                "sms:USER_NOTIFICATION", 
                "webhook:URL"],
            columns: 6
        },
        {
            name:"action_after",
            label:"Action After Count",
            type:"text",
            help: "If bundled this will trigger the action after X number of events. If number is negative then it will trigger every x number of events.  IE -1 triggers every time, -4 triggers every 4.",
            default: 0,
            columns: 6
        },
        {
            label:"Title Template",
            field:"title_template",
            help: "Customize the incident title by event metadata. example {event.metadata.geoip.country}",
            columns: 12
        },
        {
            label:"Notify Template",
            field:"notify_template",
            help: "Customize the incident message by event metadata. example {event.metadata.geoip.country}",
            type: "textarea",
            columns: 12
        },
    ]
});

SWAM.Collections.IncidentRule = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentRule
    }
});

SWAM.Models.IncidentRuleCheck = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/rule/check"
    },
}, {
    EDIT_FORM: [
        {
            name:"name",
            label:"name",
            type:"text",
            placeholder:"Enter Name",
            columns: 12
        },
        {
            name:"field_name",
            label:"Event Field",
            help: "The metadata field name for the incoming event!",
            type:"text",
            placeholder:"Enter Field Name",
            columns: 5
        },
        {
            name:"comparator",
            label:"Operator",
            type:"select",
            placeholder:"Select Operator",
            options: ["==", ">", ">=", "<", "<=", "!=", "contains", "regex"],
            default: "==",
            columns: 3
        },
        {
            name:"value",
            label:"Value",
            help: "The value to compare against!",
            type:"text",
            placeholder:"Enter Value",
            columns: 4
        },
        {
            name:"value_type",
            label:"Type",
            help: "The value to type!",
            type:"select",
            index_value: true,
            options: ["int", "float", "string"],
            columns: 6
        },
        {
            name:"index",
            label:"index",
            type:"text",
            default: 0,
            index_value: true,
            help: "the order in which the check runs, lower runs first",
            columns: 6
        },
        {
            label: "Is Required",
            name: "is_required",
            columns: 6,
            type: "toggle",
            help: "Only used for when match is any, then this field is required to match."
        },
    ]
});

SWAM.Collections.IncidentRuleCheck = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentRuleCheck
    }
});



SWAM.Models.IncidentEvent = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/event"
    },
});

SWAM.Collections.IncidentEvent = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentEvent
    }
});

SWAM.Models.IncidentEventHistory = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/event/history"
    },
});

SWAM.Collections.IncidentEventHistory = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentEventHistory
    }
});

SWAM.Models.Incident = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/incident"
    },

    details: function() {
        let out = this.get("metadata.details");
        if (!out) out = this.get("description");
        return out;
    },

    location: function() {
        let out = this.get("metadata.geoip");
        if (!out) out = this.get("metadata");
        return out;
    },

    state_bg_class: function() {
        let state = this.get("state_display|lower");
        let cls = SWAM.Models.Incident.STATE_COLORS[state];
        if (!cls) return "bg-primary";
        return cls;
    },

    getCategoryIcon: function() {
        let icon = SWAM.Models.Incident.CATEGORY_ICONS[this.get("category")];
        if (!icon) icon = "shield-shaded";
        return SWAM.Icons.getIcon(icon, "text-danger");
    }
}, {
    STATE_COLORS: {
        "new": "bg-danger",
        "opened": "bg-primary",
        "resolved": "bg-success",
        "ignored": "bg-dark",
        "paused": "bg-secondary"
    },
    COMPONENTS: [
        "account",
        "access_request",
        "rest_denied",
        "rest_error",
        "taskqueue_errors",
        "uncaught_error",
        "ossec",
        "devtools"
    ],
    EDIT_FORM: [
        {
            name:"description",
            label:"Description",
            type:"text",
            placeholder:"Enter Name",
            columns: 12
        },
        {
            name:"state",
            label:"State",
            type:"select",
            placeholder:"Select State",
            index_value: true,
            options: ["new", "opened", "paused", "ignore", "resolved"],
            columns: 6
        },
        {
            name:"priority",
            label:"Priority",
            type:"select",
            placeholder:"Select Priority",
            index_value: true,
            help: "Priortiy level with 1 being the highest level and 10 being the least important!",
            start: 0, step: 1, end: 10,
            columns: 6
        },
    ],
    CATEGORY_ICONS: {
        "ossec": "broadcast",
        "account": "person-badge",
        "access_request": "person-lock",
        "rest_denied": "person-fill-slash",
        "rest_error": "exclamation-triangle-fill",
        "rest_exception": "bug-fill",
        "taskqueue_errors": "exclamation-octagon-fill",
        "uncaught_error": "exclamation-octagon-fill",
        "devtools": "tools",
        "support": "chat-left"
    }
});

SWAM.Collections.Incident = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Incident,
        ignore_params: ["incident"]
    }
});


SWAM.Models.IncidentHistory = SWAM.Model.extend({
    defaults: {
        url:"/api/incident/incident/history"
    },
}, {
    ADD_FORM: [
        {
            name:"kind",
            label:"Kind",
            type:"select",
            options: [
                "note", "history", "file"
            ],
            columns: 12
        },
        {
            name:"note",
            label:"Note",
            type:"textarea",
            columns: 12
        },
        {
            name:"media",
            label:"File (optional media)",
            type:"file",
            columns: 12
        },
    ],
    EDIT_FORM: [
        {
            name:"kind",
            label:"Kind",
            type:"select",
            options: [
                "note", "history", "file"
            ],
            columns: 12
        },
        {
            name:"note",
            label:"Note",
            type:"textarea",
            columns: 12
        },
    ]
});


SWAM.Collections.IncidentHistory = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentHistory
    }
});