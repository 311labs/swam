

SWAM.Models.MemberDevice = SWAM.Model.extend({
    defaults: {
    	url:"/rpc/account/member/device"
    },
});

SWAM.Collections.MemberDevice = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MemberDevice
    }
});

SWAM.Models.MemberSession = SWAM.Model.extend({
    defaults: {
        url:"/rpc/account/session"
    },
});

SWAM.Collections.MemberSession = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MemberSession
    }
});