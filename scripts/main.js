let sheet_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRriKSnmOyDMzu0qAznH52vJfkSDH1kQuIilXU8bm2oFLYPbDusjHajHXPAjBh7-ff4x6EopMC1MXlM/pub?gid=552228275&single=true&output=csv';
let siteData = {};



function fetch_data(sheet_csv) {
  fetch(sheet_csv)
  .then(function(response){return response.text();})
  .then(function(data){parseData(data)});

  const parseData = function(data){
  let gson = Papa.parse(data, {header:true}).data;
  renderData(gson);
  };

  const renderData = function(gson) {
    let signupRequests = siteData;
    for (let i=0; i<gson.length; i++) {
      const entry = gson[i];
      let requestNumber = 1;
      if (siteData[entry.Name]){
       console.log("duplicate")
       console.log(entry.Name)
       requestNumber = siteData[entry.Name].requestNumber + 1;
       console.log(requestNumber);
      }

      let entryObject = {
        'name' : entry.Name+" ["+requestNumber+"]",
        'time' : entry.Timestamp,
        'setup' : entry.Setup,
        'instagram' : entry.Instagram,
        'requestNumber' : requestNumber
      }
      
      signupRequests[entry.Name] = entryObject
      // console.log(entryObject)
    }
    console.log(signupRequests)
  }

}

fetch_data(sheet_csv)


