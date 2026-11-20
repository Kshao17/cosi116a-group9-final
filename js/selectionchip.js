// "Selected: X ×" chip (click to clear selection)
function selectionChip() {
  let chip;

  function chart(selector) {
    chip = d3.select(selector).append("button")
      .attr("class", "selection-chip")
      .attr("title", "Clear selection")
      .on("click", () => selectAgency(null));

    chart.update();
  }

  // Show the selected agency, or hide the chip if none
  chart.update = function () {
    const selected = state.selectedAgency;

    if (selected === null) {
      chip.style("display", "none");
      return;
    }

    // Dark text on light colors, white text on dark colors
    const color = AGENCY_COLOR(selected);
    const textColor = d3.hsl(color).l > 0.55 ? "#222" : "white";

    chip.style("display", null)
      .style("background", color)
      .style("color", textColor)
      .text(`Selected: ${selected} ×`);
  };

  return chart;
}
