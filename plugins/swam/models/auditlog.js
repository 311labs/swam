

SWAM.Models.AuditLog = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/auditlog/plog"
    },
});

SWAM.Collections.AuditLog = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.AuditLog
    }
});