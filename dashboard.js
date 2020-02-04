const AGWE_DB = "AgWe Data";
const DB_VERSION = 1;
const EVENT_STORES = ["temp", "humid", "light"];

var db;
var temp = [], humid = [], light = [];
var data = [temp, humid, light];

openDB();

var socket = io("http://" + document.domain);

EVENT_STORES.forEach(function(store_name){
  socket.on(store_name, function (data) {
    document.getElementById(store_name).innerHTML = data[store_name];
    if(db){storeReading(store_name, data)}
  });
});

function openDB(){
  var db_req = indexedDB.open(AGWE_DB, DB_VERSION);
  db_req.onsuccess = function () {
    db = this.result;
    data.forEach(function(store, index){
      fetchData(EVENT_STORES[index], store);
    });
  };
  db_req.onerror = function (evt) {
    console.error("openDb error:", evt.target.errorCode);
  };
  db_req.onupgradeneeded = function (event) {
    var db = event.target.result;
    EVENT_STORES.forEach(function(store_name){
      db.createObjectStore(store_name, { keyPath: "timestamp" });
    });
  };
}

function getObjectStore (store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}

function storeReading (store_name, data) {
  //TODO generate timestamps at sensor read time
  data.timestamp = Date.now();
  var store = getObjectStore(store_name, 'readwrite');
  var action = store.add(data);
  action.onsuccess = function () {
    console.log(store_name, " Insertion in DB successful");
  };
  action.onerror = function() {
    console.error(store_name, " DB Insert error: ", this.error);
  };
}

function fetchData (store_name, data_array) {
  var store = getObjectStore(store_name, 'readonly');
  store.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      data_array.push(cursor.value);
      cursor.continue();
    }else {
      displayData(store_name, data_array);
      graphData(store_name, data_array);
    }
  }
}

function graphData(store_name, data_array) {
  var data = [];
  var labels = [];
  data_array.forEach(function(datapt){
    data.push(datapt[store_name]);
    labels.push(new Date(datapt.timestamp).toLocaleTimeString());
  });
  var ctx = document.getElementById(store_name + "-chart");
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: store_name,
        data: data,
        fill: true,
        lineTension: 0,
        borderWidth: 1,
        pointRadius: 0.1,
        pointStyle: 'line',
        backgroundColor: 'rgb(38, 90, 136)'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      }
    }
  });
}

function displayData (store_name, data_array) {
  var tbodyID = store_name + "-body";
  var tbody = document.getElementById(tbodyID);
  data_array.forEach(function(dobj){
    var formatdate = new Date(dobj.timestamp);
    tbody.innerHTML = tbody.innerHTML + "<tr><td>" + formatdate +"</td><td>" + dobj[store_name] + "</td></tr>";
  });
}
