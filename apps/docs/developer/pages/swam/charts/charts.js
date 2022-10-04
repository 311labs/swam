
PORTAL.Pages.ExampleCharts = SWAM.Page.extend({
    template: ".pages.swam.charts",
    classes: "page-view page-padded has-topbar",
    tagName: "div",

    defaults: {
        title: "Examples: Charts"
    },

    on_init: function() {
        if (!this.id) {
            this.id = PORTAL.Pages.ExampleCharts.LAST_ID;
        }
        this.on_init_bar();
        this.on_init_line();
        this.on_init_pie();
        this.on_init_doughnut();
    },

    on_init_bar: function() {
        this.addChild("barchart", new SWAM.Views.Chart({type:"bar", max_length:12}));
        this.children.barchart.setLabels(SWAM.DataSets.months.slice(0,6));
        this.children.barchart.addDataSet("beers", [10, 20, 30, 40, 50, 60], {backgroundColor: 'rgba(255, 99, 132, 0.5)'});
        this.children.barchart.addDataSet("shots", [2, 80, 20, 15, 40, 50], {backgroundColor: 'rgba(153, 102, 255, 0.5)'});
    },

    on_action_add_to_barchart: function(evt) {
        this.children.barchart.pushData(
            this.getNextMonth(this.children.barchart.options.labels.last()), // the next label for the column
            [Number.randomInt(10, 100), Number.randomInt(10, 100)]); // the next data for both beers and shots
    },

    on_init_line: function() {
        this.addChild("linechart", new SWAM.Views.Chart({type:"line", max_length:12}));
        this.children.linechart.setLabels(SWAM.DataSets.months.slice(0,6));
        this.children.linechart.addDataSet("beers", [10, 20, 30, 40, 50, 60], {borderColor: 'rgba(255, 99, 132, 0.5)'});
        this.children.linechart.addDataSet("shots", [2, 80, 20, 15, 40, 50], {borderColor: 'rgba(153, 102, 255, 0.5)'});
    },

    getNextMonth: function(month) {
        var i = SWAM.DataSets.months.indexOf(month) + 1;
        if (i >= 12) i = 0;
        return SWAM.DataSets.months[i];
    },

    on_action_add_to_linechart: function(evt) {
        this.children.linechart.pushData(
            this.getNextMonth(this.children.linechart.options.labels.last()), // the next label for the column
            [Number.randomInt(10, 100), Number.randomInt(10, 100)]); // the next data for both beers and shots
    },

    on_init_pie: function() {
        this.addChild("piechart", new SWAM.Views.Chart({type:"pie"}));
        this.children.piechart.pushData("beers", Number.randomInt(10, 100), {backgroundColor: 'rgba(255, 99, 132, 0.5)'});
        this.children.piechart.pushData("shots", Number.randomInt(10, 100));
        this.children.piechart.pushData("water", Number.randomInt(10, 100));
    },

    on_action_add_to_piechart: function(evt) {
        this.children.piechart.pushData(String.Random(6), Number.randomInt(10, 100));
    },

    on_init_doughnut: function() {
        this.addChild("doughnutchart", new SWAM.Views.Chart({type:"doughnut"}));
        this.children.doughnutchart.pushData("beers", Number.randomInt(10, 100), {backgroundColor: 'rgba(255, 99, 132, 0.5)'});
        this.children.doughnutchart.pushData("shots", Number.randomInt(10, 100));
        this.children.doughnutchart.pushData("water", Number.randomInt(10, 100));
    },

    on_action_add_to_doughnutchart: function(evt) {
        this.children.doughnutchart.pushData(String.Random(6), Number.randomInt(10, 100));
    },

});


