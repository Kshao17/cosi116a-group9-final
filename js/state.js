const state = {
  selectedAgency: null  
};

const dispatcher = d3.dispatch("selectAgency");

const FADED_GRAY = "#D9D9D9";

// Click the same agency again to clear the selection
function selectAgency(agency) {
  state.selectedAgency = (agency === state.selectedAgency) ? null : agency;
  dispatcher.call("selectAgency", null, state.selectedAgency);
}

// Agency color when it is selected 
function colorFor(agency) {
  const s = state.selectedAgency;
  return (s === null || s === agency) ? AGENCY_COLOR(agency) : FADED_GRAY;
}