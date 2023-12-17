
PORTAL.Pages.FirewallEvents = SWAM.Pages.TablePage.extend({

    defaults: {
        download_prefix: "firewall",
        icon: "exclamation-diamond-fill",
        title: "Firewall",
        list_options: {
            add_classes: "swam-table-clickable",
        },
        columns: [
            {label:"When", field:"created|datetime"},
            {label:"IP", field:"metadata.ip"},
            {label:"ISP", field:"metadata.isp"},
            {label:"City", field:"metadata.city"},
            {label:"State", field:"metadata.province"},
            {label:"Country", field:"metadata.country"},
            {label:"Server", field:"hostname"},
            {label:"Action", field:"metadata.action"},
        ],
        Collection: SWAM.Collections.IncidentEvent,
        collection_params: {
            category: "firewall",
            size: 10
        },
        search_field: "reporter_ip__icontains",
        group_filtering: false,
        filters: [
            {
                label: "Created",
                name: "created",
                type: "daterange"
            }
        ]
    },

    on_init: function() {
        SWAM.Pages.TablePage.prototype.on_init.call(this);
        // this.view = new PORTAL.Views.Member();
    },

    on_item_clicked: function(item) {
        // this.view.setModel(item.model);
        SWAM.Dialog.showModel(item.model, null, {size:"lg", vsize:"lg", can_dismiss:true});
    },

    on_action_add: function(evt) {
        SWAM.Dialog.showForm([
                {
                    label: "IP",
                    name: "ip"
                }
            ], {
                title: "Block IP Address",
                can_dismiss: true,
                callback: function(dlg) {
                    let data = dlg.getData();
                    data.action = "block";
                    dlg.dismiss();
                    if (data.ip && data.ip.isIPV4()) {
                        SWAM.Rest.POST(
                            "/api/incident/firewall", data,
                            function(resp, status) {
                                if (resp.status) {
                                    SWAM.toast("FIREWALL", `IP '${data.ip}' is now blocked`, "success", 5000, true);
                                } else {
                                    SWAM.toast("FIREWALL", `IP '${data.ip}' block FAILED`, "danger", 5000, true);
                                }
                            });
                    }
                    
                }
            });
    }

});


