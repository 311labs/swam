

SWAM.Models.LockHistory = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/acs/lock/history"
    },
});

SWAM.Collections.LockHistory = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.LockHistory
    }
});