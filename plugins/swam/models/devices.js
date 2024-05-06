

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

SWAM.Models.CloudCredentials = SWAM.Model.extend({
    defaults: {
        url:"/api/account/group/cloud/credentials"
    },
}, {
    EDIT_FORM: [
        {label:"Name", name:"name", columns:6},
        {label:"UUID", name:"uuid", columns:6},
        {
            name: "parent",
            label: "group",
            type: "searchdown",
            options: {
                inline: true
            },
            collection: function(fc, form_info) {
                var col = new SWAM.Collections.Group(null, {size:5});
                return col;
            }
        },
        {
            label: "Credentials JSON",
            name: "credentials",
            type: "textarea",
            rows: 10
        }
    ]
});

SWAM.Collections.CloudCredentials = SWAM.Collection.extend({
    defaults: {
        Model: SWAM.Models.CloudCredentials
    }
});
