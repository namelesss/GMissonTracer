var chooseFileButton = document.querySelector('#choose_file');
var refreshButton = document.querySelector('#refresh');
var output = document.querySelector('output');
var textarea = document.querySelector('textarea');
var missionsC = new List(document.getElementById('missionsC'),
                         [ {key: "name", title: "任務名稱", name: true},
                           {key: "completeTimeObj", title: "剩餘", countDown: true},
                           {key: "completeTime", title: "完成"}
                         ], countDownCallback);

var tabC = new Tab(document.getElementById('tabC'), tabClickCallback, tabAllClickCallback);

var GMLDB;
var showList;

function getTimeLeft(strTimeLeft)
{
  var h, m, s;
  h = (h = strTimeLeft.match(/\d+\u5C0F/)) ? parseInt(h[0].match(/\d+/)[0]) : 0; //小
  m = (m = strTimeLeft.match(/\d+\u5206/)) ? parseInt(m[0].match(/\d+/)[0]) : 0; //分
  s = (s = strTimeLeft.match(/\d+\u79D2/)) ? parseInt(s[0].match(/\d+/)[0]) : 0; //秒
  //return " ("+h+"h"+m+"m"+s+"s)";
  return 3600*h+60*m+s;
}

function tabClickCallback(account)
{
  missionsC.updateList(GMLDB[account].missions); 
}

function tabAllClickCallback()
{
  missionsC.updateAllList(GMLDB, "missions", showList);
}

function countDownCallback(idx, catagory)
{
  if (tabC.isAllTabSelected())
  {
    GMLDB[catagory].missions[idx].completeTime = "--:--";
    GMLDB[catagory].missions[idx].completed = true;
    missionsC.updateAllList(GMLDB, "missions", showList);
  }
  else
  {
    var accountSelected = tabC.getSelectedID();
    GMLDB[accountSelected].missions[idx].completeTime = "--:--";
    GMLDB[accountSelected].missions[idx].completed = true;
    missionsC.updateList(GMLDB[accountSelected].missions);
  }
}

// Convert table frome lua file to JSON format
function handleLua(e)
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
      }
    }
  }
  // build tab contents & showList
  var tabs = {};
  showList = [];
  Object.keys(GMLDB).forEach(function (account) 
  {
    tabs[account] = { name: account.split("-")[0], title: account };
    showList.push(account);
  });
  tabC.create(tabs);
  startLoop();
}

function loadFileEntry(_chosenEntry) {
  var chosenEntry = _chosenEntry;
  chosenEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = function(e){
      console.error(e);
    };
    reader.onload = handleLua;

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
