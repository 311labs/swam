
SWAM.Form.Test = {};

SWAM.Form.Test.Basic = [
    {
        label: "plain input",
        name: "plain3",
        columns: 4,
    },
    {
        label: "plain input (default value)",
        name: "plain1",
        columns: 4,
        value: "hello world",
        can_clear: true
    },
    {
        label: "with place holder (maxlength)",
        help: "this is a simple tooltip",
        name: "plain2",
        columns: 4,
        maxlength: 8,
        placeholder: "this is a place holder"
    },
    {
        label: "Email Address (min length)",
        type: "email",
        help: "this is a nice looking left icon",
        name: "left_icon1",
        left_icon: "bi bi-envelope",
        columns: 4,
        minlength: 8,
        placeholder: "enter email"
    },
    {
        label: "Secure",
        type: "password",
        help: "This is a secure input.  Notice it does not autocomplete!",
        name: "right_icon1",
        left_icon: "bi bi-lock",
        columns: 4,
        placeholder: "enter secure input"
    },
    {
        label: "right icon",
        help: "this is a nice looking right_icon1 icon",
        name: "left_icon2",
        icon: "bi bi-person",
        columns: 4,
        placeholder: "this is a place holder"
    },
    {
        label: "tags",
        name: "tags1",
        columns: 6,
        type:"tags",
        help_title: "Tag Help",
        help:"<strong>Tags</strong> can be really fun and simple.",
        placeholder: "input your tags"
    },
    {
        label: "search",
        name: "search",
        columns: 6,
        form_wrap: "search",
        placeholder:'search',
        button: {
            icon: "bi bi-search"
        }
    }
];

SWAM.Form.Test.Datetime = [
    {
        label: "a date picker",
        name: "the_date",
        placeholder: "Select Date",
        columns: 4,
        type: "date"
    },
    {
        label: "a daterange picker",
        name: "daterange",
        placeholder: "Pick Date Range",
        columns: 8,
        type: "daterange"
    },
    {
        label: "Select Month",
        name: "the_month",
        columns: 4,
        type: "select",
        placeholder: "Select Month",
        options: "months"
    },
    {
        label: "Select Day",
        name: "simple_day",
        type: "select",
        options: "days",
        placeholder: "Select Day",
        columns: 4
    },
    {
        label: "Select Time",
        name: "simple_time",
        type: "select",
        placeholder: "Select Time",
        options: "hours",
        columns: 4
    },
    {
        label: "Select Hour",
        name: "simple_hour",
        type: "select",
        default: 12,
        start: 1,
        end: 24,
        step: 1,
        columns: 2
    },
    {
        label: "Minute",
        name: "simple_minute",
        type: "select",
        default: 0,
        start: 0,
        end: 59,
        step: 5,
        columns: 2
    },
    {
        label: "Select Year",
        name: "simple_year",
        type: "select",
        placeholder: "Select Year",
        start: 1975,
        end: 2050,
        step: 1,
        columns: 4,
        default: 2022
    }
];

SWAM.Form.Test.Buttons = [
    {
        columns: 2,
        type: "dropdown",
        full_width: true,
        icon: "bi bi-download",
        items: [
            {
                icon: "bi bi-filetype-csv",
                label: "Download CSV",
                action: "download_csv"
            },
            {
                icon: "bi bi-filetype-json",
                label: "Download JSON",
                action: "download_json"
            },
            {
                icon: "bi bi-file-pdf-fill",
                label: "Download PDF",
                action: "download_pdf"
            },
        ]
    },
    {
        columns: 3,
        label: "Email Format",
        classes: "d-md-flex justify-content-md-end",
        type: "dropdown",
        icon: "bi bi-email",
        items: [
            {
                icon: "bi bi-download",
                label: "Download CSV",
                action: "download_csv"
            },
            {
                icon: "bi bi-filetype-json",
                label: "Download JSON",
                action: "download_json"
            },
            {
                icon: "bi bi-file-pdf-fill",
                label: "Download PDF",
                action: "download_pdf"
            },
        ]
    },
    {
        columns: 3,
        label: "Test Button",
        icon: "bi bi-download",
        type: "button",
        action: "test_button",
        full_width: true
    },
    {
        columns: 4,
        type: "buttongroup",
        buttons: [
            {
                icon: "bi bi-upload",
                action: "notify"
            },
            {
                icon: "bi bi-download",
                action: "notify"
            },
            {
                icon: "bi bi-calendar",
                action: "notify"
            },
        ]
    },
    {
        columns: 4,
        type: "buttongroup",
        buttons: [
            {
                classes: "btn btn-secondary",
                icon: "bi bi-arrow-repeat",
                action: "notify"
            },
            {
                type: "dropdown",
                icon: "bi bi-download",
                items: [
                    {
                        icon: "bi bi-download",
                        label: "Download CSV",
                        action: "download_csv"
                    },
                    {
                        icon: "bi bi-upload",
                        label: "Download JSON",
                        action: "download_json"
                    },
                    {
                        icon: "bi bi-lock",
                        label: "Download PDF",
                        action: "download_pdf"
                    },
                ]
            },
            {
                type: "dropdown",
                icon: "bi bi-power",
                items: [
                    {
                        icon: "bi bi-filetype-csv",
                        label: "Download CSV",
                        action: "download_csv"
                    },
                    {
                        icon: "bi bi-filetype-json",
                        label: "Download JSON",
                        action: "download_json"
                    },
                    {
                        icon: "bi bi-file-pdf-fill",
                        label: "Download PDF",
                        action: "download_pdf"
                    },
                ]
            },

        ]
    },
]

SWAM.Form.Test.Misc = [

    {
        label: "a check box",
        name: "checkbox1",
        columns: 4,
        type: "checkbox"
    },
    {
        label: "a toggle",
        name: "toggle1",
        columns: 4,
        type: "toggle",
        on_label: "ON",
        off_label: "OFF",
        help: "You can set the on/off labels!"
    },
    {
        label: "a toggle",
        name: "toggle2",
        columns: 4,
        type: "toggle",
        help: "Toggle with a static label!",
        default: 1
    },
    {
        label: "a select",
        name: "select1",
        columns: 4,
        type: "select",
        placeholder: "select color",
        options: ["blue", "green", "yellow", "red", "purple", "orange", "pink"]
    },
    {
        label: "a editable select",
        name: "select2",
        columns: 4,
        type: "select",
        editable: true,
        placeholder: "select bird",
        options: ["swallow", "eagle", "falcon"]
    },
    {
        label: "Pick a color",
        name: "mycolor",
        type: "color",
        columns: 4
    },
    {
        label: "text area",
        name: "blob",
        type: "textarea",
        columns: 12,
        floating_label: true,
    },
    " ",
    {
        label: "Email (Floating Labels)",
        name: "email_floating",
        type: "email",
        floating_label: true,
        placeholder: "bob@example.com",
        columns: 12
    },
    {
        label: "Password",
        name: "password_normal",
        type: "password",
        can_view: true,
        value: "my secret password",
        columns: 6
    },
    {
        label: "Password (Floating Labels)",
        name: "password_floating",
        type: "password",
        can_view: true,
        floating_label: true,
        columns: 6
    },
    {
        label: "Password",
        name: "password_floating",
        type: "password",
        can_view: true,
        columns: 6
    },
];

