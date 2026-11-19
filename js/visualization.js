// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  loadNetCostData("data/net_cost.csv").then(data => {
    console.log("Cleaned rows:", data.length, data.slice(0, 5));

    const latestYear = d3.max(data, d => d.year);
    d3.select("#treemap-title").text(`Share of total net cost, FY${latestYear}`);
    const myLegend = legend();
    myLegend("#legend");

    const myTreemap = treemap().year(latestYear);
    myTreemap("#treemap", data);

    dispatcher.on("selectAgency.treemap", () => myTreemap.highlight());
    dispatcher.on("selectAgency.legend", () => myLegend.highlight());

    const firstYear = d3.min(data, d => d.year);
    d3.select("#bumpchart-title").text(`Agency rank by net cost, FY${firstYear}–FY${latestYear}`);

    bumpChart()
      .width(800)
      .height(420)
      ("#bumpchart", data);
  });

})());