// Clicking a block selects that agency; clicking empty space clears it
function treemap() {
  let width = 800, height = 500, year = null;
  let svg = null;

  function chart(selector, data) {
    const rows = data.filter(d => d.year === year);
    const total = d3.sum(rows, d => d.netCost);
    const positive = rows.filter(d => d.netCost > 0);

    const root = d3.hierarchy({ children: positive })
      .sum(d => d.netCost)
      .sort((a, b) => b.value - a.value);
    d3.treemap().size([width, height]).paddingInner(2).round(true)(root);

    svg = d3.select(selector).selectAll("svg").data([null]).join("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%").style("height", "auto");

    svg.selectAll("rect.background").data([null]).join("rect")
      .attr("class", "background")
      .attr("width", width).attr("height", height)
      .attr("fill", "white")
      .on("click", () => selectAgency(null));

    const cell = svg.selectAll("g.cell")
      .data(root.leaves(), d => d.data.agency)
      .join("g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .style("cursor", "pointer")
      // Click a block to select its agency
      .on("click", (event, d) => {
        event.stopPropagation();
        selectAgency(d.data.agency);
      });

    cell.selectAll("rect.block").data(d => [d]).join("rect")
      .attr("class", "block")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);

    // Clip each label to its block so long names don't spill over
    cell.selectAll("clipPath").data(d => [d]).join("clipPath")
      .attr("id", d => `clip-${d.data.agency.replace(/\W/g, "")}`)
      .selectAll("rect").data(d => [d]).join("rect")
      .attr("width", d => d.x1 - d.x0).attr("height", d => d.y1 - d.y0);

    // Basic hover text
    cell.selectAll("title").data(d => [d]).join("title")
      .text(d => `${d.data.agency}\nFY${year} net cost: $${d3.format(",.0f")(d.data.netCost)}B\n` +
                 `Share of total: ${d3.format(".1%")(d.data.netCost / total)}`);

    // Labels only where the block is big enough to fit them
    cell.selectAll("text").data(d => (d.x1 - d.x0 > 60 && d.y1 - d.y0 > 34) ? [d] : []).join("text")
      .attr("clip-path", d => `url(#clip-${d.data.agency.replace(/\W/g, "")})`)
      .attr("x", 6).attr("y", 18)
      .style("font", "13px sans-serif").style("pointer-events", "none")
      .call(t => t.selectAll("tspan").data(d => [d.data.agency, `$${d3.format(",.0f")(d.data.netCost)}B`])
        .join("tspan").attr("x", 6).attr("dy", (d, i) => i ? "1.2em" : 0)
        .style("font-weight", (d, i) => i ? "normal" : "bold").text(d => d));

    chart.highlight();
  }

  // Recolor blocks for the current selection
  chart.highlight = function () {
    if (!svg) return chart;
    const s = state.selectedAgency;
    svg.selectAll("g.cell rect.block")
      .transition().duration(300)
      .attr("fill", d => colorFor(d.data.agency))
      .attr("stroke", d => d.data.agency === s ? "#222" : "none")
      .attr("stroke-width", 3);
    svg.selectAll("g.cell text")
      .transition().duration(300)
      .style("fill", d => (s === null || s === d.data.agency) ? "#222" : "#999");
    return chart;
  };

  chart.width = function (v) { if (!arguments.length) return width; width = v; return chart; };
  chart.height = function (v) { if (!arguments.length) return height; height = v; return chart; };
  chart.year = function (v) { if (!arguments.length) return year; year = v; return chart; };
  return chart;
}