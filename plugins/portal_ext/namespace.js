window.PORTAL = window.PORTAL || {};
window.PORTAL.Menus = window.PORTAL.Menus || {};
window.PORTAL.Views = window.PORTAL.Views || {};
window.PORTAL.Pages = window.PORTAL.Pages || {};


window.PORTAL.init_admin_pages = function() {
	app.addPage("admin_dashboard", new PORTAL.Pages.AdminDashboard(), ["admin/dashboard"]);
	app.addPage("users", new PORTAL.Pages.Users(), ["admin/users", "users"]);
	app.addPage("groups", new PORTAL.Pages.Groups(), ["admin/groups", "groups"]);
	app.addPage("audit_logs", new PORTAL.Pages.AuditLogs(), ["admin/logs", "logs"]);
	app.addPage("taskqueue", new PORTAL.Pages.TaskQueue(), ["admin/taskqueue", "taskqueue"]);
	
	app.addPage("email_inbox", new PORTAL.Pages.EmailInbox(), ["admin/email/inbox"]);
	app.addPage("email_message", new PORTAL.Pages.EmailMessage(), ["admin/email/messages"]);
	app.addPage("email_outbox", new PORTAL.Pages.EmailOutgoing(), ["admin/email/outbox"]);
	app.addPage("email_bounced", new PORTAL.Pages.EmailBounced(), ["admin/email/bounced"]);
	app.addPage("email_complaint", new PORTAL.Pages.EmailComplaint(), ["admin/email/complaints"]);
	app.addPage("email_template", new PORTAL.Pages.EmailTemplate(), ["admin/email/templates"]);
	
	app.addPage("phone_sms", new PORTAL.Pages.TextMessages(), ["admin/phone/sms"]);
	app.addPage("phone_info", new PORTAL.Pages.PhoneInfo(), ["admin/phone/info"]);
	
	app.addPage("admin_media", new PORTAL.Pages.MediaItems(), ["admin/media"]);
	app.addPage("admin_metrics", new PORTAL.Pages.Metrics(), ["admin/metrics"]);
	app.addPage("admin_cloudwatch", new PORTAL.Pages.CloudWatch(), ["admin/cloudwatch"]);
	app.addPage("admin_firewall", new PORTAL.Pages.FirewallEvents(), ["admin/firewall"]);
	app.addPage("admin_servers", new PORTAL.Pages.ServerInfo(), ["admin/servers"]);
	app.addPage("admin_domains", new PORTAL.Pages.DomainWatch(), ["admin/domains"]);
	app.addPage("admin_ips", new PORTAL.Pages.GeoIPs(), ["admin/geo/ips"]);

	app.addPage("incidents", new PORTAL.Pages.Incidents({group_filtering:false}), ["admin/incidents"]);
	app.addPage("incident_events", new PORTAL.Pages.IncidentEvents({group_filtering:false}), ["admin/incident/events"]);
	app.addPage("incident_rules", new PORTAL.Pages.IncidentRules({group_filtering:false}), ["admin/incident/rules"]);
}

PORTAL.Menus.Admin = [
	{
		label: "Dashboard",
		icon: "speedometer2",
		page: "admin_dashboard"
	},
	{
		icon: "list-check",
		label:"Task Queue",
		page: "taskqueue",
		requires_perm: "sys.view_logs"
	},
	{
		icon: "wrench-adjustable-circle",
		label: "System",
		requires_perm: ["sys.manage_users", "sys.manage_groups", "sys.view_logs"],
		items: [
			{
				icon: "person-circle",
				label:"Users",
				page: "users",
				requires_perm: "sys.manage_users",
			},
			{
				icon: "people-fill",
				label:"Groups",
				page: "groups",
				requires_perm: "sys.manage_groups",
			},
			{
				icon: "journals",
				label:"Logs",
				page: "audit_logs",
				requires_perm: "sys.view_logs",
			}
		]
	},
	{
		icon: "mailbox",
		label: "EMail",
		requires_perm: ["sys.view_logs", "sys.view_email"],
		items: [
			{
				icon: "mailbox",
				label:"Inbox",
				page: "email_inbox"
			},
			{
				icon: "envelope-open",
				label:"Incoming",
				page: "email_message"
			},
			{
				icon: "send",
				label:"Outgoing",
				page: "email_outbox"
			},
			{
				icon: "envelope-slash-fill",
				label:"Bounced",
				page: "email_bounced"
			},
			{
				icon: "envelope-exclamation-fill",
				label:"Complaints",
				page: "email_complaint"
			},
		]
	},
	{
		icon: "phone",
		label: "Telephony",
		requires_perm: ["sys.view_logs", "sys.view_telephony"],
		items: [
			{
				icon: "chat",
				label: "SMS",
				page: "phone_sms"
			},
			{
				icon: "info-circle-fill",
				label: "Lookup",
				page: "phone_info"
			},
		]
	},
	{
		icon: "bullseye",
		label: "Incidents",
		requires_perm: "sys.view_incidents",
		items: [
			{
				icon: "exclamation-diamond-fill",
				label:"Incidents",
				page: "incidents"
			},
			{
				icon: "exclamation-circle-fill",
				label:"Events",
				page: "incident_events"
			},
			{
				icon: "list-check",
				label:"Rules",
				page: "incident_rules"
			}
		]
	},
	{
		icon: "speedometer2",
		label: "Cloud Watch",
		items: [
			{
				label:"AWS Monitor",
				icon: "pc-horizontal",
				page: "admin_cloudwatch"
			},
			{
				label:"Firewall",
				icon: "lock",
				page: "admin_firewall"
			},
			{
				label:"Server Info",
				icon: "info-circle-fill",
				page: "admin_servers"
			},
			{
				label:"Domain Watch",
				icon: "info-circle-fill",
				page: "admin_domains"
			},
			{
				label:"Geo IPs",
				icon: "globe",
				page: "admin_ips"
			}
		]
	},
	{
		icon: "wrench-adjustable",
		label:"Metrics",
		page: "admin_metrics",
		requires_perm: "sys.reporting"
	},
	// {
	// 	icon: "wrench-adjustable-circle-fill",
	// 	label:"Global",
	// 	page: "admin_global"
	// },
	{
		icon: "file-earmark-image",
		label:"Media",
		page: "admin_media",
		requires_perm: "view_groups",
	},
	{
		icon: "book",
		label: "Developer Help",
		items: [
			{
				label:"UI Docs",
				icon: "book",
				url: "/docs/developer"
			},
			{
				label:"Bootstrap Docs",
				icon: "bootstrap-fill",
				url: "https://getbootstrap.com/docs/5.2/getting-started/introduction/"
			},
			{
				label:"Bootstrap Icons",
				icon: "bootstrap-fill",
				url: "https://icons.getbootstrap.com/"
			},
		]
	},

]