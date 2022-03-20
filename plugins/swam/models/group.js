

SWAM.Models.Group = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/group"
    },
});

SWAM.Collections.Group = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.Group
    }
}, {
    
});