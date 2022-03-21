

SWAM.Form.TestFields = [
    {
        label: "plain input",
        name: "plain3",
        columns: 4,
    },
    {
        label: "plain input (default value)",
        name: "plain1",
        columns: 4,
        value: "hello world"
    },
    {
        label: "with place holder",
        help: "this is a simple tooltip",
        name: "plain2",
        columns: 4,
        placeholder: "this is a place holder"
    },
    {
        label: "tags",
        name: "tags1",
        columns: 6,
        type:"tags",
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
    },
    {
        label: "a date picker",
        name: "the_date",
        columns: 4,
        type: "date"
    },
    {
        label: "a daterange picker",
        name: "daterange",
        columns: 8,
        type: "daterange"
    },
    {
        label: "Select Month",
        name: "the_month",
        columns: 4,
        type: "select",
        options: "months"
    },
    {
        label: "Select Day",
        name: "simple_time",
        type: "select",
        options: "days",
        columns: 4
    },
    {
        label: "Select Time",
        name: "simple_time",
        type: "select",
        options: "hours",
        columns: 4
    },
    {
        label: "Select Hour",
        name: "simple_hour",
        type: "select",
        start: 1,
        end: 24,
        step: 1,
        columns: 2
    },
    {
        label: "Minute",
        name: "simple_minute",
        type: "select",
        start: 0,
        end: 59,
        step: 5,
        columns: 2
    },
    {
        label: "Select Year",
        name: "simple_year",
        type: "select",
        start: 1975,
        end: 2050,
        step: 1,
        columns: 4,
        default: 2022
    },
    " ",
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
        help: "this is a simple toggle"
    },
    {
        label: "a toggle",
        name: "toggle2",
        columns: 4,
        type: "toggle",
        help: "this is a simple toggle",
        default: 1
    },
    {
        label: "a select",
        name: "select1",
        columns: 4,
        type: "select",
        options: ["blue", "green", "yellow", "red", "purple", "orange", "pink"]
    },
    {
        label: "a editable select",
        name: "select2",
        columns: 4,
        type: "select",
        editable: true,
        options: ["blue", "green", "yellow"]
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
    {
        label: "Email (Floating Labels)",
        name: "email_floating",
        type: "email",
        floating_label: true,
        placeholder: "bob@example.com",
        columns: 12
    },
    {
        label: "Password (Floating Labels)",
        name: "password_floating",
        type: "text",
        floating_label: true,
        columns: 12
    },
];

