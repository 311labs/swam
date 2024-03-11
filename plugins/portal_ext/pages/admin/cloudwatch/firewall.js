
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
        add_button_lbl: "<i class='bi bi-shield-plus'></i> Action",
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
                title: "Firewall Action",
                can_dismiss: true,
                color: "danger",
                buttons: [
                    {label:"Block IP", id:"block", action:"choice"},
                    {label:"UNBlock IP", id:"unblock", action:"choice"},
                ],
                callback: function(dlg, choice) {
                    return SWAM.Dialog.warning(choice);
                    let data = dlg.getData();
                    data.action = choice;
                    dlg.dismiss();
                    if (data.ip && data.ip.isIPV4()) {
                        SWAM.Rest.POST(
                            "/api/incident/firewall", data,
                            function(resp, status) {
                                if (resp.status) {
                                    SWAM.toast("FIREWALL", `IP '${data.ip}' is now ${choice}`, "success", 5000, true);
                                } else {
                                    SWAM.toast("FIREWALL", `IP '${data.ip}' ${choice} FAILED`, "danger", 5000, true);
                                }
                            });
                    }
                    
                }
            });
    }

});


