SWAM.Models.EmailInbox = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/inbox"
    },
}, {

    EDIT_FORM: [
        {
            name:"state",
            label:"Is Active",
            type: "toggle",
            default: "1",
            columns: 12
        },
        {
            name:"email",
            label:"Email",
            columns: 12,
            placeholder: "Enter incoming email address"
        },
        {
            name:"tq_app",
            label:"App Name",
            help: "Name of the DJANGO App to handle incoming emails",
            columns: 12,
        },
        {
            name:"tq_handler",
            label:"Handler Method",
            help: "Name of the handler method in the tq.py for the application.",
            default: "on_incoming_email",
            columns: 12,
        },
        {
            name:"tq_channel",
            label:"Task Channel Name",
            help: "Name of the task channel to publish the email task to.",
            default: "tq_app_handler",
            columns: 12,
        },
    ],
});

SWAM.Collections.EmailInbox = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailInbox
    }
});

SWAM.Models.EmailMessage = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/message"
    },
});

SWAM.Collections.EmailMessage = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailMessage
    }
});


SWAM.Models.EmailAttachment = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/message/attachment"
    },
});

SWAM.Collections.EmailAttachment = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailAttachment
    }
});



SWAM.Models.EmailBounced = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/bounced"
    },
});

SWAM.Collections.EmailBounced = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailBounced
    }
});

SWAM.Models.EmailComplaint = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/complaint"
    },
});

SWAM.Collections.EmailComplaint = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailComplaint
    }
});

SWAM.Models.EmailOutgoing = SWAM.Model.extend({
    defaults: {
        url:"/rpc/account/notifications/"
    },
});

SWAM.Collections.EmailOutgoing = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailOutgoing
    }
});

SWAM.Models.EmailTemplate = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/template"
    },
}, {
    EDIT_FORM: [
        {
            name:"name",
            label:"Name",
            type:"text",
            help: "An example would be group.invite",
            placeholder:"Enter Name (must be unique)",
            columns: 12
        },
        {
            name:"kind",
            label:"Kind",
            type:"text",
            help: "An example would be group.invite",
            placeholder:"Enter Kind (email)",
            default: "email",
            columns: 12
        },
        {
            name:"template",
            label:"Template",
            type:"textarea",
            rows: 10,
            columns: 12,
        },
    ]
});

SWAM.Collections.EmailTemplate = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.EmailTemplate
    }
});