

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