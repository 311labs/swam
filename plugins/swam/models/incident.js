

SWAM.Models.IncidentRule = SWAM.Model.extend({
    defaults: {
        url:"/rpc/incident/rule"
    },
}, {
    EDIT_FORM: [
        {
            name:"name",
            label:"Name",
            type:"text",
            placeholder:"Enter Name",
            columns: 12
        },
        {
            name:"category",
            label:"Category",
            type:"select",
            help: "The category is something the event will match on",
            editable: true,
            options: ["ossec", "account"],
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
                }
            ],
            columns: 6
        },
        {
            name:"action",
            label:"Action",
            type:"select",
            help: "Perform an action when the rule is triggered.  You can configure a task to fire with 'task:APP_NAME:FNAME:CHANNEL' as your action.",
            editable: true,
            options: ["notify", "ignore"],
            columns: 6
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
        url:"/rpc/incident/rule/check"
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
            options: ["==", ">", ">=", "<", "<=", "!="],
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
    ]
});

SWAM.Collections.IncidentRuleCheck = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentRuleCheck
    }
});



SWAM.Models.IncidentEvent = SWAM.Model.extend({
    defaults: {
        url:"/rpc/incident/event"
    },
});

SWAM.Collections.IncidentEvent = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentEvent
    }
});

SWAM.Models.IncidentEventHistory = SWAM.Model.extend({
    defaults: {
        url:"/rpc/incident/event/history"
    },
});

SWAM.Collections.IncidentEventHistory = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentEventHistory
    }
});

SWAM.Models.Incident = SWAM.Model.extend({
    defaults: {
        url:"/rpc/incident/incident"
    },
}, {
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
    ]
});

SWAM.Collections.Incident = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Incident
    }
});


SWAM.Models.IncidentHistory = SWAM.Model.extend({
    defaults: {
        url:"/rpc/incident/incident/history"
    },
}, {
    EDIT_FORM: [
        {
            name:"date_tine",
            label:"Date",
            type:"text",
            placeholder:"Enter Date",
            columns: 12
        },
    ]
});


SWAM.Collections.IncidentHistory = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.IncidentHistory
    }
});