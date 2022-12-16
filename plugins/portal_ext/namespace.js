window.PORTAL = window.PORTAL || {};
window.PORTAL.Views = window.PORTAL.Views || {};
window.PORTAL.Pages = window.PORTAL.Pages || {};


window.PORTAL.init_admin_pages = function() {
	app.addPage("dashboard", new PORTAL.Pages.Dashboard(), ["dashboard"]);
	app.addPage("users", new PORTAL.Pages.Users(), ["admin/users", "users"]);
	app.addPage("groups", new PORTAL.Pages.Groups(), ["admin/groups", "groups"]);
	app.addPage("audit_logs", new PORTAL.Pages.AuditLogs(), ["admin/logs", "logs"]);
	app.addPage("taskqueue", new PORTAL.Pages.TaskQueue(), ["admin/taskqueue", "taskqueue"]);
	app.addPage("email_inbox", new PORTAL.Pages.EmailInbox(), ["admin/email/inbox"]);
	app.addPage("email_message", new PORTAL.Pages.EmailMessage(), ["admin/email/messages"]);
	app.addPage("email_outbox", new PORTAL.Pages.EmailOutgoing(), ["admin/email/outbox"]);
	app.addPage("email_bounced", new PORTAL.Pages.EmailBounced(), ["admin/email/bounced"]);
	app.addPage("email_complaint", new PORTAL.Pages.EmailComplaint(), ["admin/email/complaints"]);
	app.addPage("admin_media", new PORTAL.Pages.MediaItems(), ["admin/media"]);
}