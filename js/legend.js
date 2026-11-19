// Clicking a legend item also selects that agency
function legend() {
  let container = null;

  function chart(selector) {
    container = d3.select(selector);
    container.selectAll("div.legend-item")
      .data(AGENCY_ORDER)
      .join("div")
      .attr("class", "legend-item")
      .style("display", "inline-flex").style("align-items", "center")
      .style("margin", "0 16px 6px 0").style("cursor", "pointer")
      .style("font", "14px sans-serif")
      .on("click", (event, agency) => selectAgency(agency))
      .call(item => {
        item.selectAll("span.swatch").data(d => [d]).join("span")
          .attr("class", "swatch")
          .style("display", "inline-block").style("width", "14px").style("height", "14px")
          .style("margin-right", "6px");
        item.selectAll("span.label").data(d => [d]).join("span")
          .attr("class", "label").text(d => d);
      });
    chart.highlight();
  }

  // Gray out legend items that are not selected
  chart.highlight = function () {
    if (!container) return chart;
    container.selectAll("span.swatch").style("background", d => colorFor(d));
    container.selectAll("span.label")
      .style("font-weight", d => d === state.selectedAgency ? "bold" : "normal")
      .style("color", d => (state.selectedAgency === null || state.selectedAgency === d) ? "#222" : "#999");
    return chart;
  };

  return chart;
}