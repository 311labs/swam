PORTAL.Menus = PORTAL.Menus || {};

PORTAL.Menus.Default = [
    {
        icon: "info-circle-fill",
        label:"Overview",
        items: [
            {
                icon: "server",
                label:"Data Models",
                page: "swam_models",
                // requires_perm: [],
            },
            {
                icon: "chat-left-text",
                label:"REST",
                page: "swam_rest",
                // requires_perm: [],
            },
            {
                icon: "window-sidebar",
                label:"Views",
                page: "swam_views",
                // requires_perm: [],
            },
            {
                icon: "window",
                label:"Pages",
                page: "swam_pages",
                // requires_perm: [],
            },
            {
                icon: "filetype-html",
                label:"Templates",
                page: "swam_templates",
                // requires_perm: [],
            },
            {
                icon: "chat-left-text",
                label:"Localize",
                page: "swam_localize",
                // requires_perm: [],
            },
        ]
    },
    {
        icon: "table",
        label:"Tables",
        // requires_perm: [],
        items: [
            {
                icon: "table",
                label:"Basic Tables",
                page: "swam_tables",
                // requires_perm: [],
            },
            {
                icon: "table",
                label:"Table Page",
                page: "swam_table_grid_page",
                // requires_perm: [],
            },
            {
                icon: "layout-sidebar",
                label:"Table TOC",
                page: "swam_table_toc",
                // requires_perm: [],
            },
        ]
    },
    {
        icon: "window",
        label:"Forms",
        items: [
            {
                icon: "wrench-circle",
                label:"Basic",
                page: "swam_forms",
            },
            {
                icon: "wrench-circle",
                label:"Builder",
                page: "swam_form_builder",
            },
        ]
    },
    {
        icon: "menu-up",
        label:"Dialogs",
        page: "swam_dialogs",
        // requires_perm: [],
    },
    {
        label:"Misc",
        icon: "wrench",
        items: [
            {
                icon: "window-dock",
                label:"Tabs",
                page: "swam_tabs",
                // requires_perm: [],
            },
            {
                icon: "card-list",
                label:"SearchDown",
                page: "swam_searchdown",
            },
            {
                icon: "bar-chart-fill",
                label:"Charts",
                page: "swam_charts",
                // requires_perm: [],
            },
            {
                icon: "hourglass-bottom",
                label:"Loaders/Busy",
                page: "swam_busy",
            },
            {
                icon: "chat-left-fill",
                label:"Toast",
                page: "swam_toast",
            },
            {
                icon: "wrench",
                label:"Misc",
                page: "swam_misc",
            },
        ]
    },
    {
        label:"Bootstrap 5",
        icon: "bootstrap-fill",
        items: [
            {
                label:"Docs",
                icon: "box-arrow-up-right",
                url: "https://getbootstrap.com/docs/5.2/getting-started/introduction/"
            },
            {
                label:"Icons",
                icon: "box-arrow-up-right",
                url: "https://icons.getbootstrap.com/"
            },
            {
                label: "Animations",
                icon: "camera-reels",
                url: "https://animate.style/"
            }
        ]
    }
];

