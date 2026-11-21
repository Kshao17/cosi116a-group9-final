// Immediately Invoked Function Expression to limit access to our
// variables and prevent
(() => {
  loadNetCostData("data/net_cost.csv").then((data) => {
    console.log("Cleaned rows:", data.length, data.slice(0, 5));

    const latestYear = d3.max(data, (d) => d.year);
    state.selectedYear = latestYear; // slider starts at the latest year

    const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
    const mySlider = yearSlider();
    mySlider("#year-slider", years);
    dispatcher.on("selectYear.slider", () => mySlider.update());

    const myChip = selectionChip();
    myChip("#selection-chip");
    dispatcher.on("selectAgency.chip", () => myChip.update());
    d3.select("#treemap-title").text(`Share of total net cost, FY${latestYear}`);
    const myLegend = legend();
    myLegend("#legend");

    const myTreemap = treemap().year(latestYear);
    myTreemap("#treemap", data);

    dispatcher.on("selectAgency.treemap", () => myTreemap.highlight());
    dispatcher.on("selectAgency.legend", () => myLegend.highlight());

    const firstYear = d3.min(data, (d) => d.year);
    d3.select("#bumpchart-title").text(`Agency rank by net cost, FY${firstYear}–FY${latestYear}`);

    const myBumpChart = bumpChart();
    myBumpChart("#bumpchart", data);

    const myBarChart = barChart();
    myBarChart("#barchart", data);

    dispatcher.on("selectAgency.barchart", () => myBarChart.update());

    dispatcher.on("selectYear.barchart", () => myBarChart.update());

    dispatcher.on("selectAgency.bumpchart", () => myBumpChart.highlight());
    dispatcher.on("selectYear.bumpchart", () => myBumpChart.showYear());

    // Slider updates the treemap: redraw it (and its title) for the new year
    dispatcher.on("selectYear.treemap", () => {
      d3.select("#treemap-title").text(`Share of total net cost, FY${state.selectedYear}`);
      myTreemap.year(state.selectedYear);
      myTreemap("#treemap", data);
    });
  });
})();
