SWAM.Models.EmailInbox = SWAM.Model.extend({
    defaults: {
        url:"/rpc/inbox/inbox"
    },
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