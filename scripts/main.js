let signup_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRriKSnmOyDMzu0qAznH52vJfkSDH1kQuIilXU8bm2oFLYPbDusjHajHXPAjBh7-ff4x6EopMC1MXlM/pub?gid=552228275&single=true&output=csv';
let siteData = {}
const signUpDivID = "signup_list";
const previousPerformersDivID = "previous_performers"

// ===============================================================================

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
  renderSiteData();
}

// =========================================================================

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
        requestNumber = Object.keys(requestEntries).length+1;
        
        if (requestEntries[numericalTimestamp]){
          duplicateStatus = true;
        } else {
        };
      };

      if (duplicateStatus){
        console.log("Duplicate Status: " + duplicateStatus)
      } else {

        let requestEntry = {
          'name' : name,
          'systemName' : systemName,
          'setup' : setup,
          'instagram' : instagram,
          'timestamp' : timestamp,
          'numericalTimestamp' : numericalTimestamp,
          'requestNumber' : requestNumber,
          'alreadyPerformed' : false
        };

        requestEntries[numericalTimestamp] = requestEntry;

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
    renderSiteData();
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
      b.requestNumber - a.requestNumber || b.numericalTimestamp - a.numericalTimestamp
  );
  siteData.orderList = newList;
  siteData.previousPerformersList = newPreviousPerformersList;
};

function toggleAlreadyPerformedStatus(personID, requestID){
  if(siteData.signupRequests[personID]){
    let thisRequest = siteData.signupRequests[personID].requestEntries[requestID].alreadyPerformed;
    siteData.signupRequests[personID].requestEntries[requestID].alreadyPerformed = !thisRequest;   
  }
  sortOrderList()
  writeToLocalStorage(siteData)
  pullFromLocalStorage()
  console.log(siteData.signupRequests[personID].requestEntries[requestID])
}

// ========================================================================================

function renderSiteData(){
  const orderList = siteData.orderList;
  const previousPerformersList = siteData.previousPerformersList;
  const signUpDiv = document.getElementById(signUpDivID);
  const prevDiv = document.getElementById(previousPerformersDivID);

  signUpDiv.innerHTML = "";
  prevDiv.innerHTML = "";

  orderList.forEach(request =>{
    const name = request.name;
    const systemName = name.toLowerCase()
    const id = request.numericalTimestamp;
    const requestNumber = request.requestNumber;
    const instagram = request.instagram;

    let newRequestDiv = document.createElement("div");
    
    newRequestDiv.setAttribute("id", id);
    newRequestDiv.classList.add("request-wrapper");
    newRequestDiv.innerHTML = `
    <div class="artist-name">
    ${name} <span class="request-number">${requestNumber}</span>
    </div>
    <div class="instagram">
    ${instagram}
    </div>
    `
    let button = document.createElement("button");
    button.classList.add("toggle-button");
    button.innerHTML = "Switch";
    button.onclick = function() {
      console.log(systemName)
      console.log(id)
      toggleAlreadyPerformedStatus(systemName, id);
      renderSiteData()
    }
    newRequestDiv.appendChild(button);
    signUpDiv.appendChild(newRequestDiv)
  })

    previousPerformersList.forEach(request =>{
    const name = request.name;
    const systemName = name.toLowerCase();
    const id = request.numericalTimestamp;
    const requestNumber = request.requestNumber;
    const instagram = request.instagram;

    let newRequestDiv = document.createElement("div");
    
    newRequestDiv.setAttribute("id", id);
    newRequestDiv.classList.add("request-wrapper");
    newRequestDiv.innerHTML = `
    <div class="artist-name">
    ${name} <span class="request-number">${requestNumber}</span>
    </div>
    <div class="instagram">
    ${instagram}
    </div>
    `
    let button = document.createElement("button");
    button.classList.add("toggle-button");
    button.innerHTML = "Switch";
    button.onclick = function() {
      console.log(systemName)
      console.log(id)
      toggleAlreadyPerformedStatus(systemName, id);
      renderSiteData()
    }
    newRequestDiv.appendChild(button);
    prevDiv.appendChild(newRequestDiv)
  })
}

// ==================================================================================

if (!localStorage.siteData) {
  initializeLocalStorage();
}

fetch_data(signup_csv)

setInterval(function(){
    fetch_data(signup_csv)
}, 60000)
