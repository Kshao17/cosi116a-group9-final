function bumpChart() {
  let width = 600, height = 420;
  const margin = { top: 16, right: 110, bottom: 48, left: 44 };
  let agencies = AGENCY_ORDER.filter(a => a !== "Other");

  function chart(selector, data) {
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const rows = data.filter(d => agencies.includes(d.agency));
    const ranked = [];
    d3.group(rows, d => d.year).forEach(yearRows => {
      yearRows.slice()
        .sort((a, b) => b.netCost - a.netCost)
        .forEach((d, i) => ranked.push({ ...d, rank: i + 1 }));
    });

    const years = Array.from(new Set(ranked.map(d => d.year))).sort((a, b) => a - b);
    const series = d3.groups(ranked, d => d.agency)
      .map(([agency, values]) => ({ agency, values: values.sort((a, b) => a.year - b.year) }));

    const x = d3.scalePoint().domain(years).range([0, innerW]).padding(0.3);
    const y = d3.scalePoint().domain(d3.range(1, agencies.length + 1)).range([0, innerH]).padding(0.5);

    const svg = d3.select(selector).selectAll("svg").data([null]).join("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%").style("height", "auto");

    const g = svg.selectAll("g.plot").data([null]).join("g")
      .attr("class", "plot")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("line.grid").data(y.domain()).join("line")
      .attr("class", "grid")
      .attr("x1", 0).attr("x2", innerW)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", "#eee");

    g.selectAll("g.x-axis").data([null]).join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d => d).tickSizeOuter(0))
      .call(a => a.selectAll("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.6em").attr("dy", "-0.5em")
        .style("font", "9px sans-serif"));

    g.selectAll("g.y-axis").data([null]).join("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickFormat(d => `#${d}`).tickSize(0).tickPadding(8))
      .call(a => a.select(".domain").remove())
      .call(a => a.selectAll("text").style("font", "10px sans-serif"));

    g.selectAll("text.y-label").data([null]).join("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2).attr("y", -margin.left + 10)
      .attr("text-anchor", "middle")
      .style("font", "11px sans-serif").style("fill", "#555")
      .text("Rank by net cost");

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.rank));

    const agencyG = g.selectAll("g.agency")
      .data(series, d => d.agency)
      .join("g")
      .attr("class", "agency");

    agencyG.selectAll("path").data(d => [d]).join("path")
      .attr("d", d => line(d.values))
      .attr("fill", "none")
      .attr("stroke", d => AGENCY_COLOR(d.agency))
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round");

    agencyG.selectAll("circle").data(d => d.values).join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.rank))
      .attr("r", 3)
      .attr("fill", d => AGENCY_COLOR(d.agency))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("title").data(d => [d]).join("title")
      .text(d => `${d.agency} · FY${d.year}\nRank: #${d.rank}\n` +
                 `Net cost: $${d3.format(",.0f")(d.netCost)}B`);

    agencyG.selectAll("text.end-label").data(d => [d.values[d.values.length - 1]]).join("text")
      .attr("class", "end-label")
      .attr("x", d => x(d.year) + 8)
      .attr("y", d => y(d.rank))
      .attr("dy", "0.35em")
      .style("font", "bold 11px sans-serif")
      .style("fill", d => AGENCY_COLOR(d.agency))
      .text(d => d.agency);
  }

  chart.width = function (v) { if (!arguments.length) return width; width = v; return chart; };
  chart.height = function (v) { if (!arguments.length) return height; height = v; return chart; };
  chart.agencies = function (v) { if (!arguments.length) return agencies; agencies = v; return chart; };
  return chart;
}
