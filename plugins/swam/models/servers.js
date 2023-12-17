SWAM.Models.ServerInfo = SWAM.Model.extend({
    defaults: {
    	url:"/api/metrics/restit/servers"
    },
});

SWAM.Collections.ServerInfo = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.ServerInfo
    }
});

SWAM.Models.DomainWatch = SWAM.Model.extend({
    defaults: {
        url:"/api/metrics/restit/domains"
    },
});

SWAM.Collections.DomainWatch = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.DomainWatch
    }
});


SWAM.Models.GeoIP = SWAM.Model.extend({
    defaults: {
        url:"/api/location/geo/ip"
    },
}, {
    ADD_FORM: [
        {
            name:"ip",
            label:"IP Address",
            columns: 12
        }
    ],
});

SWAM.Collections.GeoIP = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.GeoIP
    }
});