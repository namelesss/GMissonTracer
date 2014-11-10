var chooseFileButton = document.querySelector('#choose_file');
var refreshButton = document.querySelector('#refresh');
var missionsC = new List(document.getElementById('missionsC'),
                         [ {key: "name", title: "任務名稱", name: true},
                           {key: "timeLeft", title: "剩餘"},
                           {key: "completeTime", title: "完成"}
                         ]);

var tabC = new Tab(document.getElementById('tabC'), tabClickCallback);//, tabAllClickCallback);
var menuC = new Tab(document.getElementById('menuC'), menuClickCallback);
var menu = { all: {name: "ALL"},
  uncompleted: {name: "Uncompleted"}, 
  uncategorized:{name: "Uncategorized"}
};
var GMLDB;
var allList, uncompletedList;
var countdownTick;

function getTimeLeft(strTimeLeft)
{
  var h, m, s;
  h = (h = strTimeLeft.match(/\d+\u5C0F/)) ? parseInt(h[0].match(/\d+/)[0]) : 0; //小
  m = (m = strTimeLeft.match(/\d+\u5206/)) ? parseInt(m[0].match(/\d+/)[0]) : 0; //分
  s = (s = strTimeLeft.match(/\d+\u79D2/)) ? parseInt(s[0].match(/\d+/)[0]) : 0; //秒
  //return " ("+h+"h"+m+"m"+s+"s)";
  return 3600*h+60*m+s;
}

function menuClickCallback(menu)
{
  if (menu == "all")
  {
    tabC.show();
    missionsC.createList(GMLDB[tabC.getSelectedID()].missions);
  }
  else if (menu == "uncompleted")
  {
    tabC.hide();
    // remove completed mission in uncompletedList
    while(uncompletedList[0].completed) { uncompletedList.shift(); }
    missionsC.createList(uncompletedList);
  }
  else if (menu == "uncategorized")
  {
    tabC.hide();
    missionsC.createList(allList);    
  }
}

function tabClickCallback(account)
{
  missionsC.createList(GMLDB[account].missions); 
}

function countdown()
{ 
  var nowTime = new Date();
  for (var i in GMLDB)
  {
    var acc = GMLDB[i];
    for (var j in acc.missions)
    {
      var mission = acc.missions[j];
      if (! mission.completed)
      {
        var diff = Math.floor((mission.completeTimeObj - nowTime)/ 60000);
        if (diff >= 0)// (diff > 0) notify when 1 min left (not show 00:00)
        {
          var h = Math.floor(diff/60);
          var m = diff%60;
          mission.timeLeft = (h + ":" + ((m < 10) ? "0" + m : m))
            + ":" + Math.floor((mission.completeTimeObj - nowTime) / 1000)%60; //sec for debuging
        }
        else
        {
          mission.completeTime = "--:--";
          mission.completed = true;
          mission.timeLeft = "";
        }
      }
    }
  }
  missionsC.updateList();
}

// Convert table frome lua file to JSON format
function handleFile(e)
{
  var result = "" + e.target.result;

  result = result.replace(/GMLDB = /, "")
                 .replace(/--.+\r\n/g, "")
                 .replace(/\s+/g, " ")
                 .replace(/[\[\]]/g,"")
                 .replace(/=/g,":")
                 .replace(/" :/g,"\":")
                 .replace(/,(\s+\})/g,"$1")
                 .replace(/\{ \{(.*?)\} \}/g,"[{$1}]") 
                 ;
  
  GMLDB = JSON.parse(result);
  // Add Complete Time
  for (var i in GMLDB)
  {
    var acc = GMLDB[i];
    for (var j in acc.missions)
    {
      var mission = acc.missions[j];
      var completeTime = new Date((acc.timestamp + getTimeLeft(mission.timeLeft)) * 1000);
      var nowTime = new Date();
      if (nowTime < completeTime)
      {
        var h = completeTime.getHours();
        var m = completeTime.getMinutes();
        mission.completeTime = ((h < 10) ? "0" : "") + h + ":";
        mission.completeTime += ((m < 10) ? "0" : "") + m;
        mission.completeTimeObj = completeTime;
      }
      else
      {
        mission.completeTime = "--:--";
        mission.completed = true;
        mission.timeLeft = "";
        mission.completeTimeObj = nowTime; // for sorting
      }
    }
    acc.missions.sort(function(a, b){ return a.completeTimeObj - b.completeTimeObj; });
  }
  // build tab contents & allList
  var tabs = {};
  allList = [];
  uncompletedList = [];
  var idx = 0;
  Object.keys(GMLDB).forEach(function (account) 
  {
    tabs[account] = { name: account.split("-")[0], title: account };
    for (var j in GMLDB[account].missions)
    {
      allList[idx++] = GMLDB[account].missions[j];
    }
  });
  allList.sort(function(a, b) { return a.completeTimeObj - b.completeTimeObj; });
  allList.forEach(function(m) { if (!m.completed) {uncompletedList.push(m);} });



  tabC.createTab(tabs);
  menuC.createTab(menu);  // this initial sequence is strange?
  startLoop();
  clearInterval(countdownTick);
  countdown();
  countdownTick = setInterval(countdown, 1000);
}

function loadFileEntry(_chosenEntry) {
  var chosenEntry = _chosenEntry;
  chosenEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = function(e){
      console.error(e);
    };
    reader.onload = handleFile;

    reader.readAsText(file);
    // Update pathname
    chrome.fileSystem.getDisplayPath(chosenEntry, function(path) {
      document.querySelector('#file_path').value = path;
    });
  });
}

function loadFileFromStorageEntry()
{
  chrome.storage.local.get('chosenFile', function(items) 
  {
    if (items.chosenFile) 
    {
      chrome.fileSystem.isRestorable(items.chosenFile, function(bIsRestorable) 
      {
        if (bIsRestorable) 
        {
          console.info("Restoring " + items.chosenFile);
          chrome.fileSystem.restoreEntry(items.chosenFile, function(chosenEntry) 
          {
            if (chosenEntry) 
            {
              loadFileEntry(chosenEntry);
            }
          });
        }
      });
    }
  });
}

// Init
function init(launchData)
{
  if (launchData && launchData.items && launchData.items[0]) 
  {
    loadFileEntry(launchData.items[0].entry);
  } 
  else 
  {
    loadFileFromStorageEntry();
  }
}

refreshButton.addEventListener('click', function(e)
{
  stopLoop();
  loadFileFromStorageEntry();
});

chooseFileButton.addEventListener('click', function(e) 
{
  chrome.fileSystem.chooseEntry({type: 'openFile', 
                                 suggestedName: "GMissionLogger.lua",
                                 accepts: [{extensions: ["lua"]}],
                                 acceptsAllTypes: false }, function(theEntry) 
  {
    if (chrome.runtime.lastError || !theEntry) 
    {
      // No file selected
      return;
    }
    // use local storage to retain access to this file
    chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
    stopLoop();
    loadFileEntry(theEntry);
  });
});

var gmlTick;
function startLoop()
{
  gmlTick = setInterval(loadFileFromStorageEntry, 300000);
}

function stopLoop()
{
  clearInterval(gmlTick);
}

init(launchData);
/*
  var txt = "";
  var obj = accountUL.childNodes;
  for(var i in  obj)
  {
    txt += i + " " + obj[i]+"\r\n";
  }
  textarea.value = txt;
  */
