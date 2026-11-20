// Bump chart: each agency's rank by net cost, by year
function bumpChart() {
  const width = 800, height = 420;
  const margin = { top: 16, right: 110, bottom: 48, left: 44 };

  // Agencies to rank ("Other" is left out)
  const agencies = AGENCY_ORDER.filter(a => a !== "Other");

  // How many agencies are colored when nothing is selected
  const TOP_N = 5;
  let topAgencies = [];

  let svg, x, yearMarker;

  function chart(selector, data) {
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // All years, oldest first
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    // Rank agencies within each year (1 = highest net cost), plus share of that year's total
    const ranked = [];
    years.forEach(year => {
      const total = d3.sum(data.filter(d => d.year === year), d => d.netCost);
      const rows = data.filter(d => d.year === year && agencies.includes(d.agency));
      rows.sort((a, b) => b.netCost - a.netCost);
      rows.forEach((d, i) => {
        ranked.push({ agency: d.agency, year: d.year, netCost: d.netCost,
                      share: d.netCost / total, rank: i + 1 });
      });
    });

    // One line's worth of points per agency
    const series = agencies.map(agency => ({
      agency: agency,
      values: ranked.filter(d => d.agency === agency)
    }));

    // Top agencies in the latest year
    const latestYear = years[years.length - 1];
    topAgencies = ranked
      .filter(d => d.year === latestYear && d.rank <= TOP_N)
      .map(d => d.agency);

    // Scales
    x = d3.scalePoint().domain(years).range([0, innerW]).padding(0.3);
    const y = d3.scalePoint().domain(d3.range(1, agencies.length + 1)).range([0, innerH]).padding(0.5);

    // SVG
    svg = d3.select(selector).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%").style("height", "auto");

    // Background (click to clear selection)
    svg.append("rect")
      .attr("width", width).attr("height", height)
      .attr("fill", "white")
      .on("click", () => selectAgency(null));

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.selectAll("line.grid").data(y.domain()).join("line")
      .attr("class", "grid")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", "#eee");

    // X axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.6em").attr("dy", "-0.5em")
      .style("font", "9px sans-serif");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => "#" + d).tickSize(0).tickPadding(8))
      .call(axis => axis.select(".domain").remove())
      .selectAll("text")
      .style("font", "10px sans-serif");

    // Y axis title
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2).attr("y", -margin.left + 10)
      .attr("text-anchor", "middle")
      .style("font", "11px sans-serif").style("fill", "#555")
      .text("Rank by net cost");

    // Selected year marker
    yearMarker = g.append("line")
      .attr("y1", -6).attr("y2", innerH)
      .attr("stroke", "#333")
      .attr("stroke-dasharray", "4 3")
      .style("pointer-events", "none");

    // Line generator
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.rank));

    // One group per agency (click to select)
    const agencyG = g.selectAll("g.agency").data(series).join("g")
      .attr("class", "agency")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        selectAgency(d.agency);
      });

    // Invisible wide line for easier clicking
    agencyG.append("path")
      .attr("d", d => line(d.values))
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 12);

    // Visible line
    agencyG.append("path")
      .attr("class", "line")
      .attr("d", d => line(d.values))
      .attr("fill", "none");

    // Dots (hover for tooltip)
    agencyG.selectAll("circle").data(d => d.values).join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.rank))
      .attr("stroke", "white")
      .on("mouseover", (event, d) => showTooltip(event, d))
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    // End labels
    agencyG.append("text")
      .attr("class", "end-label")
      .attr("x", d => x(latestYear) + 8)
      .attr("y", d => y(d.values[d.values.length - 1].rank))
      .attr("dy", "0.35em")
      .style("font", "bold 11px sans-serif")
      .text(d => d.agency);

    chart.highlight();
    chart.showYear();
  }

  // Checks if an agency should be colored
  function isColored(agency) {
    if (state.selectedAgency === null) {
      return topAgencies.includes(agency);
    }
    return agency === state.selectedAgency;
  }

  // Line/dot color
  function colorOf(agency) {
    return isColored(agency) ? AGENCY_COLOR(agency) : FADED_GRAY;
  }

  // Line thickness
  function lineWidth(agency) {
    if (agency === state.selectedAgency) return 3.5;
    if (isColored(agency)) return 2;
    return 1.5;
  }

  // Dot size
  function dotSize(agency) {
    if (agency === state.selectedAgency) return 4;
    if (isColored(agency)) return 3;
    return 2;
  }

  // Update colors for the current selection
  chart.highlight = function () {
    svg.selectAll("g.agency").filter(d => isColored(d.agency)).raise();

    svg.selectAll("path.line")
      .transition().duration(300)
      .attr("stroke", d => colorOf(d.agency))
      .attr("stroke-width", d => lineWidth(d.agency));

    svg.selectAll("g.agency circle")
      .transition().duration(300)
      .attr("fill", d => colorOf(d.agency))
      .attr("r", d => dotSize(d.agency));

    svg.selectAll("text.end-label")
      .transition().duration(300)
      .style("fill", d => isColored(d.agency) ? AGENCY_COLOR(d.agency) : "#999");
  };

  // Move the year marker to the selected year
  chart.showYear = function () {
    const year = state.selectedYear;
    yearMarker
      .transition().duration(300)
      .attr("x1", x(year)).attr("x2", x(year));
    svg.selectAll(".x-axis .tick text")
      .style("font-weight", d => d === year ? "bold" : "normal");
  };

  return chart;
}
