// Chart.pluginService.register({
//   beforeDraw: function(chart) {
//     var width = chart.chart.width,
//         height = chart.chart.height,
//         ctx = chart.chart.ctx;

//     ctx.restore();
//     var fontSize = (height / 114).toFixed(2);
//     ctx.font = fontSize + "em sans-serif";
//     ctx.textBaseline = "middle";

//     var text = "75%",
//         textX = Math.round((width - ctx.measureText(text).width) / 2),
//         textY = height / 2;

//     ctx.fillText(text, textX, textY);
//     ctx.save();
//   }
// });
Chart.plugins = Chart.plugins || {};
Chart.plugins.centerText = {
    id: 'centerText',
    afterDatasetsDraw(chart, args, pluginOptions) {
        const { ctx } = chart;

        ctx.save();
        const cord = chart.getDatasetMeta(0).data[0];
        if (cord) {
          const text = pluginOptions.text || "20";
          ctx.textAlign = "center";
          ctx.font = pluginOptions.font || 'bold 12px sans-serif';
          ctx.textBaseline = "middle";
          var fontSize = pluginOptions.fontSize || (chart.height / 114).toFixed(2);
          ctx.font = `bold ${fontSize} em Verdana`;
          ctx.fillText(text, cord.x, cord.y);
        }
    }
};

// Chart.register(Chart.plugins.centerText);