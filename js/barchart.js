// Linked bar chart showing total or selected agency net cost over time
function barChart() {
  let width = 800;
  let height = 350;

  const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 90,
  };

  let svg = null;
  let allData = null;
  let totalRows = null;

  function chart(selector, data) {
    allData = data;
    totalRows = d3.rollups(data, (values) => d3.sum(values, (d) => d.netCost), (d) => d.year)
      .map(([year, netCost]) => ({ year, netCost, agency: "All agencies" }));

    svg = d3.select(selector).selectAll("svg").data([null]).join("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet").style("width", "100%").style("height", "auto");

    chart.update();
  }

  chart.update = function () {
    if (!svg) return chart;

    const agency = state.selectedAgency;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;

    // Background click clears selection
    svg
      .selectAll("rect.background").data([null]).join("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .on("click", () => selectAgency(null));

    const rows = (agency === null
      ? totalRows
      : allData.filter((d) => d.agency === agency))
      .sort((a, b) => a.year - b.year);

    const innerWidth = width - margin.left - margin.right;

    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.selectAll("g.plot").data([null]).join("g")
      .attr("class", "plot")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(rows.map((d) => d.year))
      .range([0, innerWidth])
      .padding(0.15);

    const y = d3
      .scaleLinear()
      // Costs are in billions: agency views share a $2T ceiling.
      .domain([0, agency === null ? d3.max(totalRows, (d) => d.netCost) : 2000])
      .nice()
      .range([innerHeight, 0]);

    const bars = g.selectAll("rect.bar")
      .data(rows, (d) => d.year)
      .join(
        enter => enter.append("rect")
          .attr("y", innerHeight)
          .attr("height", 0),
        update => update,
        exit => exit.remove()
      )
      .attr("class", "bar")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        selectYear(d.year);
      })
      .on("mouseover", (event, d) => showTooltip(event, d))
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    bars.interrupt("update")
      .attr("fill", (d) => (d.year === state.selectedYear ? (agency === null ? "#4E79A7" : AGENCY_COLOR(agency)) : FADED_GRAY))
      .transition("update").duration(duration)
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.netCost))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.netCost));

    g.selectAll("g.x-axis").data([null]).join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));

    g.selectAll("g.y-axis").data([null]).join("g")
      .attr("class", "y-axis")
      .interrupt("update").transition("update").duration(duration)
      .call(d3.axisLeft(y).tickFormat((d) => `$${d3.format(",.0f")(d)}B`));

    g.selectAll("text.y-label").data([null]).join("text")
      .attr("class", "y-label")
      .attr("x", -innerHeight / 2)
      .attr("y", -60)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font", "12px sans-serif")
      .text("Net Cost (Billions USD)");

    d3.select("#barchart-title").text(agency === null ? "Total net cost by year" : `${agency} net cost by year`);

    return chart;
  };

  chart.width = function (v) {
    if (!arguments.length) return width;
    width = v;
    return chart;
  };

  chart.height = function (v) {
    if (!arguments.length) return height;
    height = v;
    return chart;
  };

  return chart;
}
