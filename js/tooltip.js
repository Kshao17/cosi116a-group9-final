// Shared hover tooltip for every view

// Tooltip box
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// Fill in the tooltip and show it
function showTooltip(event, info) {
  let html = `<strong>${info.agency} · FY${info.year}</strong>`;
  html += `<br>Net cost: $${d3.format(",.0f")(info.netCost)}B`;

  if (info.share !== undefined) {
    html += `<br>Share of total: ${d3.format(".1%")(info.share)}`;
  }
  if (info.rank !== undefined) {
    html += `<br>Rank: #${info.rank}`;
  }

  tooltip.html(html).style("opacity", 1);
  moveTooltip(event);
}

// Keep the tooltip next to the mouse
function moveTooltip(event) {
  tooltip.style("left", (event.pageX + 12) + "px")
         .style("top", (event.pageY - 12) + "px");
}

// Hide the tooltip
function hideTooltip() {
  tooltip.style("opacity", 0);
}
