
SWAM.Icons = {
    "download": 'bi bi-cloud-arrow-down',
    "upload": 'bi bi-cloud-arrow-up-fill',
    "secure": 'bi bi-shield-lock',
    "key": 'bi bi-key',
    "clock": 'bi bi-clock',
    "payment": 'bi bi-credit-card-fill',
    "plug": 'bi bi-plug-fill',
    "wrench": 'bi bi-wrench',
    "group": 'bi bi-people-fill',
    "user": 'bi bi-person-fill',
    "reload": 'bi bi-arrow-repeat',

    getIcon: function(icon, extra_classes) {
        let classes = this.getIconClass(icon);
        if (extra_classes) classes += " " + extra_classes;
        return "<i class='" + classes + "'></i>";
    },

    getIconClass: function(icon) {
        if (!icon) return icon;
        if (icon.contains(" ")) return icon;
        if (SWAM.Icons[icon]) return SWAM.Icons[icon];
        return "bi bi-" + icon;
    }
};


