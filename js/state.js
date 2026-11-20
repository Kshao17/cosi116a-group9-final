const state = {
  selectedAgency: null,
  selectedYear: null    // set to the latest year when the data loads
};

const dispatcher = d3.dispatch("selectAgency", "selectYear");

const FADED_GRAY = "#D9D9D9";

// Click the same agency again to clear the selection
function selectAgency(agency) {
  state.selectedAgency = (agency === state.selectedAgency) ? null : agency;
  dispatcher.call("selectAgency", null, state.selectedAgency);
}

// Called by the fiscal year slider; tells every view the year changed
function selectYear(year) {
  state.selectedYear = year;
  dispatcher.call("selectYear", null, year);
}

// Agency color when it is selected
function colorFor(agency) {
  const s = state.selectedAgency;
  return (s === null || s === agency) ? AGENCY_COLOR(agency) : FADED_GRAY;
}