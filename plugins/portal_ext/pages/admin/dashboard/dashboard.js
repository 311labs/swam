
PORTAL.Pages.AdminDashboard = SWAM.Page.extend({
    template: "portal_ext.pages.admin.dashboard",
    classes: "page-view page-padded has-topbar",

    on_init: function() {
        this.addChild("rest_metrics",
            new PORTAL.Views.MetricsChart({
                title: "Rest Metrics",
                slugs:["rest_calls", "rest_errors"],
                parse_slug: "_",
                colors:["rgba(50, 250, 50, 0.9)", "rgba(250, 50, 50, 0.9)"]
            }));
        this.addChild("email_metrics",
            new PORTAL.Views.MetricsChart({
                title: "Email Metrics",
                slugs:["email_errors", "emails_sent", "email_complaints", "emails_bounced", "emails_received"],
                parse_slug: "_",
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                ]
            }));

        this.addChild("incident_events",
            new PORTAL.Views.MetricsChart({
                title: "Events",
                parse_slug: "_",
                category: "incident_events"
            }));
        this.addChild("incidents",
            new PORTAL.Views.MetricsChart({
                title: "Incidents",
                parse_slug: "_",
                category: "incidents"
            }));
    },

    refresh: function() {
        this.render();
    },

    on_page_enter: function() {
        this.refresh();
    }

});
