

SWAM.Models.User = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member"
    },
});

SWAM.Collections.User = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.User
    }
}, {
    
});