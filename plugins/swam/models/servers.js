SWAM.Models.ServerInfo = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/metrics/restit/servers"
    },
});

SWAM.Collections.ServerInfo = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.ServerInfo
    }
});

SWAM.Models.DomainWatch = SWAM.Model.extend({
    defaults: {
        url:"/rpc/metrics/restit/domains"
    },
});

SWAM.Collections.DomainWatch = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.DomainWatch
    }
});