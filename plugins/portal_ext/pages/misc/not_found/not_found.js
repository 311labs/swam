
PORTAL.Pages.NotFound = SWAM.Page.extend({
    template: "portal_ext.pages.misc.not_found",
    classes: "has-topbar page-view page-fullscreen",

    updateURL: function() {
        
    }

});

PORTAL.Pages.Denied = SWAM.Page.extend({
    template: "portal_ext.pages.misc.not_found.denied",
    classes: "has-topbar page-view page-fullscreen bg-white",

    updateURL: function() {

    },

    on_action_request_access: function() {
        let title;
        if (this.params.denied_group) {
            title = `You are requesting access to group #${this.params.denied_group}`;
        } else if (this.params.denied_page) {
            title = `You are requesting access to page <span class="text-brand">${this.params.denied_page.page_name}</span>`;
        }
        SWAM.Dialog.showForm([
            {
                label: title,
                type: "heading",
                size: 5
            },
            {
                label: "Reason",
                name: "reason",
                type: "textarea",
                required: true
            }
        ], {
            title: "Request Access",
            lbl_save: "Request",
            callback: function(dlg) {
                if (dlg.hasRequiredData(true)) {
                    dlg.dismiss();
                    this.requestAccess(dlg.getData().reason);
                }
            }.bind(this)
        });
    },

    requestAccess: function(reason) {
        let username = app.me.get("username");
        let description, details, extra;
        if (this.params.denied_group) {
            description = `${username} is requesting access to group #${this.params.denied_group}`;
            details = `${description}\n${reason}`;
            extra = {
                group_id:this.params.denied_group,
                reason: reason
            };
        } else if (this.params.denied_page) {
            description = `${username} is requesting access to page '${this.params.denied_page.page_name}`;
            details = `${description}\n${reason}`;
            extra = {
                reason: reason,
                page: this.params.denied_page.page_name,
                requires_perm: this.params.denied_page.options.requires_perm
            };
            if (app.group) {
                extra.group_id = app.group.id;
                extra.group_name = app.group.get("name");
            }
        }

        app.reportIncident(
            "access_request",
            description,
            details,
            3, false, extra);

        SWAM.Dialog.show({
            add_classes: "modal-info",
            icon: "check-circle",
            title: "Access Request",
            message: "Your access request has been sent to the adminstrator for this resource."
        });
    },

    on_page_enter: function() {
        if (this.params.denied_page) {
            // lets try one more time, to see if this is a slow connect?
            setTimeout(this.on_recheck_perms.bind(this), 1000);
        }
    },

    on_recheck_perms: function() {
        if (this.isActivePage() && this.params.denied_page) {
            if (app.me.hasPerm(this.params.denied_page.options.requires_perm)) {
                this.params.denied_page.showPage();
            }
        }
    }
});