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
    holder.append("input")
      .attr("type", "range")
      .attr("id", "year-input")
      .attr("min", years[0])
      .attr("max", years[years.length - 1])
      .attr("step", 1)
      .on("input", event => selectYear(+event.target.value));

    // Last year
    holder.append("span").attr("class", "year-end").text(years[years.length - 1]);

    // Selected year badge
    holder.append("span").attr("class", "year-badge");

    chart.update();
  }

  // Match the slider and badge to the selected year
  chart.update = function () {
    holder.select("#year-input").property("value", state.selectedYear);
    holder.select(".year-badge").text("FY" + state.selectedYear);
  };

  return chart;
}
