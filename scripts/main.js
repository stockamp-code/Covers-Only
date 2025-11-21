let sheet_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRriKSnmOyDMzu0qAznH52vJfkSDH1kQuIilXU8bm2oFLYPbDusjHajHXPAjBh7-ff4x6EopMC1MXlM/pub?gid=552228275&single=true&output=csv';
let siteData = {
  'signupRequests' : {},
  'orderList' : [],
  'previousPerformersList' : []
};


function fetch_data(sheet_csv) {
  fetch(sheet_csv)
  .then(function(response){return response.text();})
  .then(function(data){parseData(data)});

  const parseData = function(data){
    let gson = Papa.parse(data, {header:true}).data;
    renderData(gson);
  };

  const renderData = function(gson) {
    let signupRequests = siteData.signupRequests;
    
    for (let i=0; i<gson.length; i++) {
      const entry = gson[i];
      // console.log(entry)

      const timestamp = entry.Timestamp;
      const name = entry.Name;
      const systemName = name.toLowerCase();
      const setup = entry.Setup.split(", "); 
      let instagram = entry.Instagram;
      let requestEntries = {};
      let duplicateStatus = false;
      let requestNumber = 1;

      if (signupRequests[systemName]){
        if (instagram === ""){
          instagram = signupRequests[systemName].instagram;
        };
        requestEntries = signupRequests[systemName].requestEntries

        requestNumber = Object.keys(requestEntries).length + 1;

        if (requestEntries[timestamp]){
          duplicateStatus = true;
        }
      }

      if (duplicateStatus){
        console.log("Duplicate Status: " + duplicateStatus)
      } else {
        let requestEntry = {
          'name' : name,
          'setup' : setup,
          'instagram' : instagram,
          'timestamp' : timestamp,
          'requestNumber' : requestNumber,
          'alreadyPerformed' : false
        }

        requestEntries[timestamp] = requestEntry;

        let personData = {
          'name' : name,
          'instagram' : instagram,
          'requestEntries' : requestEntries,
          'totalRequestCount' : requestNumber,
        }
        
        signupRequests[systemName] = personData;
      }
    }

    siteData.signupRequests = signupRequests;
    console.log(siteData)
  }

}

function sortOrderList(signupRequests, orderList, previousPerformersList) {
  console.log("Howdy")
}

fetch_data(sheet_csv)
sortOrderList(siteData.signupRequests, siteData.orderList, siteData.previousPerformersList)


