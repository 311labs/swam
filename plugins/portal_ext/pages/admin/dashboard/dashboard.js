
PORTAL.Pages.AdminDashboard = SWAM.Page.extend({
    template: "portal_ext.pages.admin.dashboard",
    classes: "page-view page-padded has-topbar",

    on_init: function() {
        this.addChild("rest_metrics",
            new PORTAL.Views.MetricsChart({
                title: "Rest Metrics",
                slugs:["rest_calls", "rest_errors"],
                parse_slug: "_",
                granularity: "hourly",
                colors:["rgba(150, 220, 150, 0.9)", "rgba(250, 50, 50, 0.9)"],
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 2,
                filters: true
            }));
        this.addChild("email_metrics",
            new PORTAL.Views.MetricsChart({
                title: "Email Metrics",
                slugs:["email_errors", "emails_sent", "email_complaints", "emails_bounced", "emails_received"],
                parse_slug: "_",
                granularity: "hourly",
                colors:[
                    "rgba(250, 50, 50, 0.9)",
                    "rgba(50, 20, 255, 0.9)",
                    "rgba(200, 80, 20, 0.9)",
                    "rgba(25, 25, 25, 0.9)",
                    "rgba(50, 255, 100, 0.9)",
                ],
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 2,
                filters: true
            }));

        this.addChild("incident_events",
            new PORTAL.Views.MetricsChart({
                title: "Events",
                parse_slug: "_",
                slugs: "incident_evt",
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 3,
                colors:["rgba(255, 135, 55, 0.9)"],
                granularity: "hourly",
                filters: true
            }));
        
        this.addChild("incidents",
            new PORTAL.Views.MetricsChart({
                title: "Incidents",
                parse_slug: "_",
                slugs: "incidents",
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 3,
                colors:["rgba(50, 250, 50, 0.9)", "rgba(250, 50, 50, 0.9)"],
                granularity: "hourly",
                filters: true
            }));

        this.addChild("host_incident_events",
            new PORTAL.Views.MetricsChart({
                title: "Host Events",
                parse_slug: "_",
                category: "incident_events",
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 2,
                filters: true
            }));
        this.addChild("host_incidents",
            new PORTAL.Views.MetricsChart({
                title: "Host Incidents",
                parse_slug: "_",
                category: "incidents",
                chart_type: "line",
                chart_types: ["line", "bar"],
                line_width: 2,
                filters: true
            }));
    },

    refresh: function() {
        this.render();
    },

    on_page_enter: function() {
        this.refresh();
    }

});
