// Fiscal year slider
function yearSlider() {
  let holder;

  function chart(selector, years) {
    holder = d3.select(selector).attr("class", "year-slider");

    // Label
    holder.append("label")
      .attr("for", "year-input")
      .text("Fiscal year");

    // First year
    holder.append("span").attr("class", "year-end").text(years[0]);

    // Slider (moving it sets the selected year)
    const timeline = holder.append("div").attr("class", "year-timeline");
    timeline.append("input")
      .attr("type", "range")
      .attr("id", "year-input")
      .attr("min", years[0])
      .attr("max", years[years.length - 1])
      .attr("step", 1)
      .on("input", event => selectYear(+event.target.value));

    timeline.append("div")
      .attr("class", "year-ticks")
      .attr("aria-hidden", "true")
      .selectAll("span")
      .data(years)
      .join("span")
      .style("left", year => `${100 * (year - years[0]) / (years[years.length - 1] - years[0] || 1)}%`);

    // Last year
    holder.append("span").attr("class", "year-end").text(years[years.length - 1]);

    // Selected year badge
    timeline.append("div").attr("class", "year-badge-track")
      .append("span").attr("class", "year-badge");

    chart.update();
  }

  // Match the slider and badge to the selected year
  chart.update = function () {
    holder.select("#year-input")
      .property("value", state.selectedYear)
      .attr("aria-valuetext", "Fiscal year " + state.selectedYear);
    holder.select(".year-badge").text("FY" + state.selectedYear);
    const input = holder.select("#year-input");
    const firstYear = +input.attr("min");
    const lastYear = +input.attr("max");
    holder.select(".year-badge")
      .style("left", `${100 * (state.selectedYear - firstYear) / (lastYear - firstYear || 1)}%`);
  };

  return chart;
}
