let signup_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRriKSnmOyDMzu0qAznH52vJfkSDH1kQuIilXU8bm2oFLYPbDusjHajHXPAjBh7-ff4x6EopMC1MXlM/pub?gid=552228275&single=true&output=csv';
let siteData = {}

function writeToLocalStorage(data){
  const newData = JSON.stringify(data);
  localStorage.setItem("siteData", newData);
};

function pullFromLocalStorage(){
  const oldData = localStorage.getItem("siteData");
  siteData = JSON.parse(oldData);
};

function initializeLocalStorage(){
  const blankData = {
    'signupRequests' : {},
    'orderList' : [],
    'previousPerformersList' : []
  };
  writeToLocalStorage(blankData)
  pullFromLocalStorage();
  console.log("initialized local storage")
}

function fetch_data(signup_csv) {
  fetch(signup_csv)
  .then(function(response){return response.text();})
  .then(function(data){parseData(data)});

  const parseData = function(data){
    let gson = Papa.parse(data, {header:true}).data;
    renderData(gson);
  };

  const renderData = function(gson) {
    
    pullFromLocalStorage()

    let signupRequests = siteData.signupRequests;
    
    for (let i=0; i<gson.length; i++) {
      const entry = gson[i];
      // console.log(entry)

      const timestamp = entry.Timestamp;
      const numericalTimestamp= Date.parse(timestamp)
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
        requestEntries = signupRequests[systemName].requestEntries;

        requestNumber = Object.keys(requestEntries).length + 1;

        if (requestEntries[timestamp]){
          duplicateStatus = true;
        };
      };

      if (duplicateStatus){
        console.log("Duplicate Status: " + duplicateStatus)
      } else {
        let requestEntry = {
          'name' : name,
          'setup' : setup,
          'instagram' : instagram,
          'timestamp' : timestamp,
          'numericalTimestamp' : numericalTimestamp,
          'requestNumber' : requestNumber,
          'alreadyPerformed' : false
        };

        requestEntries[timestamp] = requestEntry;

        let personData = {
          'name' : name,
          'instagram' : instagram,
          'requestEntries' : requestEntries,
          'totalRequestCount' : requestNumber,
        };
        
        signupRequests[systemName] = personData;
      };
    };

    siteData.signupRequests = signupRequests;
    sortOrderList()
    writeToLocalStorage(siteData);
    pullFromLocalStorage();
    console.log(siteData);
  };
};

function sortOrderList() {
  let newList = [];
  let newPreviousPerformersList = [];
  Object.keys(siteData.signupRequests).forEach(personKey=>{
    let person = siteData.signupRequests[personKey];
    Object.keys(person.requestEntries).forEach(requestKey=>{
      let request = person.requestEntries[requestKey];
      request.systemName = person.systemName;
      if (!request.alreadyPerformed){
        newList.push(request)
      } else {
        newPreviousPerformersList.push(request)
      }
    })
  })

  newList.sort(
    (a, b) => 
      a.requestNumber - b.requestNumber || a.numericalTimestamp - b.numericalTimestamp
  );
  newPreviousPerformersList.sort(
    (a, b) => 
      a.requestNumber - b.requestNumber || a.numericalTimestamp - b.numericalTimestamp
  );
  // console.log(newList)
  // console.log(newPreviousPerformersList)
  siteData.orderList = newList;
  siteData.previousPerformersList = newPreviousPerformersList;
};

if (!localStorage.siteData) {
  initializeLocalStorage();
}

fetch_data(signup_csv)

setInterval(function(){
    fetch_data(signup_csv)
}, 60000)
