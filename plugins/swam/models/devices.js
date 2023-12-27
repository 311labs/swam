

SWAM.Models.MemberDevice = SWAM.Model.extend({
    defaults: {
    	url:"/api/account/member/device"
    },
});

SWAM.Collections.MemberDevice = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MemberDevice
    }
});

SWAM.Models.MemberSession = SWAM.Model.extend({
    defaults: {
        url:"/api/account/session"
    },

    browser_icon: function() {
        let browser = this.get("browser").lower();
        return `browser-${browser}`;
    }
});

SWAM.Collections.MemberSession = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.MemberSession
    }
});


SWAM.Models.UserPassKey = SWAM.Model.extend({
    defaults: {
        url:"/api/account/passkey"
    },
});

SWAM.Collections.UserPassKey = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.UserPassKey
    }
});
