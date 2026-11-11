const AGENCY_ORDER = ["HHS", "SSA", "Defense", "Interest on Debt", "VA",
                      "Treasury", "Agriculture", "Transportation", "Other"];
const AGENCY_COLOR = d3.scaleOrdinal()
  .domain(AGENCY_ORDER)
  .range(["#EDC948", "#59A14F", "#F28E2B", "#76B7B2", "#4E79A7",
          "#9C755F", "#FF9DA7", "#B07AA1", "#BAB0AC"]);

function agencyGroup(name) {
  if (/interest on/i.test(name)) return "Interest on Debt";   
  if (/health\s*(&|and)\s*human/i.test(name)) return "HHS";
  if (/social security/i.test(name)) return "SSA";
  if (/department of defense/i.test(name)) return "Defense";
  if (/veteran/i.test(name)) return "VA";
  if (/department of the treasury/i.test(name)) return "Treasury";
  if (/department of agriculture/i.test(name)) return "Agriculture";
  if (/department of transportation/i.test(name)) return "Transportation";
  return "Other";
}

function loadNetCostData(path) {
  return d3.csv(path).then(raw => {
    const cols = Object.keys(raw[0]);
    const find = re => cols.find(c => re.test(c));
    const STMT_YEAR = find(/statement.*year|stmt.*year/i);
    const REPORT_YEAR = cols.find(c => /fiscal.?year/i.test(c) && c !== STMT_YEAR);
    const AGENCY = find(/agency/i);
    const NET_COST = find(/net.?cost/i);
    console.log("Columns used:", { STMT_YEAR, REPORT_YEAR, AGENCY, NET_COST });

    const toNum = v => +String(v).replace(/[$,\s]/g, "");

    const cleaned = raw
      .filter(d => toNum(d[STMT_YEAR]) === toNum(d[REPORT_YEAR]))
      .filter(d => !/total/i.test(d[AGENCY]))
      .map(d => ({
        year: toNum(d[STMT_YEAR]),
        agency: agencyGroup(d[AGENCY]),
        netCost: toNum(d[NET_COST])
      }))
      .filter(d => !isNaN(d.year) && !isNaN(d.netCost));

    return d3.flatRollup(cleaned, v => d3.sum(v, d => d.netCost), d => d.year, d => d.agency)
      .map(([year, agency, netCost]) => ({ year, agency, netCost }))
      .sort((a, b) => a.year - b.year || b.netCost - a.netCost);
  });
}