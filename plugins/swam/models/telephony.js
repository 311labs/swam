
SWAM.Models.TextMessage = SWAM.Model.extend({
    defaults: {
        url:"/api/telephony/sms/msg"
    },
}, {
    EDIT_FORM: [
        {
            name:"endpoint",
            label:"To",
            columns: 6
        },
        {
            name:"srcpoint",
            label:"From",
            columns: 6
        },
        {
            name:"message",
            label:"Message",
            type:"textarea",
            rows: 10,
            columns: 12,
        }
    ],
    VIEW_FIELDS: [
        {
            label: "SID",
            field: "sid",
            columns: 12
        },
        {
            label: "Created",
            field: "created|datetime",
            columns: 6
        },
        {
            label: "Status",
            field: "status",
            columns: 6
        },
        {
            label: "From",
            field: "srcpoint",
            columns: 6
        },
        {
            label: "To",
            field: "endpoint",
            columns: 6
        },
        {
            label: "Message",
            field: "message",
            columns: 12
        }
    ]
});

SWAM.Collections.TextMessage = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.TextMessage
    }
});



SWAM.Models.PhoneInfo = SWAM.Model.extend({
    defaults: {
        url:"/api/telephony/info"
    },
}, {
    ADD_FORM: [
        {
            name:"phone_number",
            label:"Phone Number",
            columns: 12
        }
    ],
});

SWAM.Collections.PhoneInfo = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.PhoneInfo
    }
});