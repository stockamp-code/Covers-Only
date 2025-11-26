let signup_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRriKSnmOyDMzu0qAznH52vJfkSDH1kQuIilXU8bm2oFLYPbDusjHajHXPAjBh7-ff4x6EopMC1MXlM/pub?gid=552228275&single=true&output=csv';
const performersOrderWrapperID = "order_content";
const signUpDivID = "signup_list";
const previousPerformersDivID = "previous_performers";
const signUpFormID = "form_content";
const utilityButtonsID = "utility_buttons";
const iFrameFormID = "iframe_form";

let siteData = {};
startUpRoutine();

// ===============================================================================

function writeToLocalStorage(data){
  const newData = JSON.stringify(data);
  localStorage.setItem("siteData", newData);
};

function pullFromLocalStorage(){
  const oldData = localStorage.getItem("siteData");
  siteData = JSON.parse(oldData);
};

function updateLocalStorageAndPullFromIt (){
  writeToLocalStorage(siteData);
  pullFromLocalStorage()
}

function initializeLocalStorage(){
  const blankData = {
    'signupRequests' : {},
    'orderList' : [],
    'previousPerformersList' : [],
    'showSetup' : false,
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
      const timestamp = entry.Timestamp || (new Date().toLocaleString());
      const numericalTimestamp= Date.parse(timestamp);
      const name = entry.Name || "Error - Missing Name"+numericalTimestamp;
      const systemName = name.toLowerCase();
      const setup = entry.Setup.split(", ") || []; 
      const isMinor = (entry.Age === "Yes") ? true : false;
      let instagram = entry.Instagram || "";
      let requestEntries = {};
      let requestNumber = 1;
      let duplicateStatus = false;

      if (signupRequests[systemName]){
        requestEntries = signupRequests[systemName].requestEntries;
        requestNumber = Object.keys(requestEntries).length+1;

        if (requestEntries[numericalTimestamp]){
          duplicateStatus = true;
        } 
        if (instagram === ""){
          instagram = signupRequests[systemName].instagram;
        };
      };

      if (!duplicateStatus){
        let requestEntry = {
          'name' : name,
          'systemName' : systemName,
          'setup' : setup,
          'instagram' : instagram,
          'timestamp' : timestamp,
          'numericalTimestamp' : numericalTimestamp,
          'requestNumber' : requestNumber,
          'alreadyPerformed' : false,
          'isMinor' : isMinor,
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
    updateLocalStorageAndPullFromIt()
    renderSiteData();
    // console.log(siteData);
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
  // console.log(siteData.signupRequests[personID].requestEntries[requestID])
}

// ========================================================================================

function renderSiteData(){
  const orderList = siteData.orderList;
  const previousPerformersList = siteData.previousPerformersList;
  const signUpDiv = document.getElementById(signUpDivID);
  const prevDiv = document.getElementById(previousPerformersDivID);
  let requestPosition = 0;

  signUpDiv.innerHTML = "";
  prevDiv.innerHTML = "";

  function renderList(list, parentDiv, listType, showSetupStatus){
    list.forEach(request =>{
      const name = request.name;
      const systemName = name.toLowerCase()
      const id = request.numericalTimestamp;
      const requestNumber = (request.requestNumber > 1) ? "#"+request.requestNumber : "";
      const instagram = request.instagram;
      const isMinor = request.isMinor;
      const setupList = request.setup;
      (listType === "on deck") ? requestPosition++ : requestPosition="";

      let newRequestDiv = document.createElement("div");
      newRequestDiv.setAttribute("id", id);
      newRequestDiv.classList.add("request-wrapper");
      if (isMinor){newRequestDiv.classList.add("minor-flag")}
      if (listType !== "on deck"){newRequestDiv.classList.add("alt")};
      newRequestDiv.innerHTML = `
        <div class="list-rank">${requestPosition}</div>
        <div>
          <div class="artist-name">
            ${name} <span class="request-number">${requestNumber}</span>
          </div>
          <div class="instagram">${instagram}</div>
        </div>`

      let setupDiv = document.createElement("ul");
      setupDiv.classList.add("set-up-information");
      if(showSetupStatus){setupDiv.classList.add("show")}
      setupList.forEach(item =>{
        let listItem = document.createElement("li")
        listItem.innerHTML = item
        setupDiv.append(listItem)
      })
      
      newRequestDiv.append(setupDiv)
      
      let button = document.createElement("button");
      button.classList.add("toggle-button");
      button.innerHTML = (listType === "on deck") ? '<i class="fa-solid fa-turn-up"></i>': '<i class="fa-solid fa-turn-down"></i>';
      button.onclick = () => {
        toggleAlreadyPerformedStatus(systemName, id);
        renderSiteData()
      }

      newRequestDiv.append(button);
      parentDiv.append(newRequestDiv)
    })
  }

  renderList(previousPerformersList, prevDiv, "already performed", false)
  renderList(orderList, signUpDiv, "on deck", siteData.showSetup)
}

function toggleSetupVisibility () {
  console.log(siteData.showSetup)
  siteData.showSetup = !siteData.showSetup
  console.log(siteData.showSetup)
  updateLocalStorageAndPullFromIt();
  renderSiteData();
}

// function clickRender(buttonType){
//   renderToggleFormViewButton(buttonType)
// }

function refreshIframe() {
    var iframe = document.getElementById(iFrameFormID);
    iframe.src = iframe.src;
}

function renderToggleFormViewButton(buttonType) {
  let button = document.getElementById("form_and_list_toggle");
  
  if (buttonType === "toggle_to_list_view"){
    button.innerHTML = '<i class="fa-solid fa-list-ul"></i>';
    document.getElementById(performersOrderWrapperID).classList.add("hide")
    document.getElementById(signUpFormID).classList.remove("hide")
    refreshIframe()
  } else if (buttonType === "toggle_to_form_view"){
    button.innerHTML = '<i class="fa-solid fa-user-plus"></i>';
    document.getElementById(signUpFormID).classList.add("hide")
    document.getElementById(performersOrderWrapperID).classList.remove("hide")
  }
  
  button.onclick = () => {
    if (buttonType === "toggle_to_list_view") {
      console.log("list view")
      button.innerHTML = '<i class="fa-solid fa-user-plus"></i>';
      document.getElementById(performersOrderWrapperID).classList.add("hide")
      document.getElementById(signUpFormID).classList.remove("hide")
      refreshIframe()
      renderToggleFormViewButton("toggle_to_form_view")
    } else if (buttonType === "toggle_to_form_view") {
      console.log("form view")
      button.innerHTML = '<i class="fa-solid fa-list-ul"></i>';
      document.getElementById(signUpFormID).classList.add("hide")
      document.getElementById(performersOrderWrapperID).classList.remove("hide")
      renderToggleFormViewButton("toggle_to_list_view")
    }
  }
}

//==================================================================================

function startUpRoutine(){
  (!localStorage.siteData) ? initializeLocalStorage() : pullFromLocalStorage();
  fetch_data(signup_csv)
  setInterval(function(){
    fetch_data(signup_csv)
  }, 60000)
  console.log("boo")
}

//=================================================================================