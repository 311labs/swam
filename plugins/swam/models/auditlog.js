

SWAM.Models.AuditLog = SWAM.Model.extend({
    defaults: {
    	url:"/api/auditlog/plog"
    },

    who: function() {
        var output = this.get("user.username");
        if (!output) {
            output = this.get("tid");
            if (!output) {
                output = "n/a";
            }
        }
        return output;
    }
});

SWAM.Collections.AuditLog = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.AuditLog
    }
});