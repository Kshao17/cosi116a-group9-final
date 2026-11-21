// Linked bar chart showing a selected agency's net cost over time
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

  function chart(selector, data) {
    allData = data;

    svg = d3.select(selector).selectAll("svg").data([null]).join("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet").style("width", "100%").style("height", "auto");

    chart.update();
  }

  chart.update = function () {
    if (!svg) return chart;

    svg.selectAll("*").remove();

    const agency = state.selectedAgency;

    // Background click clears selection
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .on("click", () => selectAgency(null));

    if (agency === null) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font", "14px sans-serif")
        .style("fill", "#666")
        .text("Select an agency to view yearly net cost");

      d3.select("#barchart-title").text("Agency net cost by year");

      return chart;
    }

    const rows = allData.filter((d) => d.agency === agency).sort((a, b) => a.year - b.year);

    const innerWidth = width - margin.left - margin.right;

    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(rows.map((d) => d.year))
      .range([0, innerWidth])
      .padding(0.15);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(rows, (d) => d.netCost)])
      .nice()
      .range([innerHeight, 0]);

    g.selectAll("rect.bar")
      .data(rows)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.netCost))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.netCost))
      .attr("fill", (d) => (d.year === state.selectedYear ? AGENCY_COLOR(agency) : FADED_GRAY))
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        selectYear(d.year);
      })
      .on("mouseover", (event, d) => showTooltip(event, d))
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y).tickFormat((d) => `$${d3.format(",.0f")(d)}B`));

    g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -60)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font", "12px sans-serif")
      .text("Net Cost (Billions USD)");

    d3.select("#barchart-title").text(`${agency} net cost by year`);

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
