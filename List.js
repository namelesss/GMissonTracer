List = function(container, header, countDownCallback) 
{
  var table = document.createElement("TABLE");
  var thead = document.createElement("THEAD");
  var tbody = document.createElement("TBODY");
  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
  
  var tr = document.createElement("TR");
  for (var i = 0; i < header.length; ++i)
  {
    var th = document.createElement("TH");
    th.innerHTML = header[i].title;
    if (header[i].name) { th.setAttribute("class", "name"); }
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  this.tbody = tbody;

  this.header = header;
  this.countDownList;
  this.countDownCallback = countDownCallback;
  this.tickID;
}

List.prototype.clearList = function (dataList)
{
  this.stopCountDown();
  
  var nodes = this.tbody.childNodes;
  for (var i = nodes.length - 1; i >= 0 ; --i)
  {
    this.tbody.removeChild(nodes[i]);
  }
}

List.prototype.updateSingleList = function (dataList, catagory)
{
  // create list
  for (var j = 0; j < dataList.length; ++j)
  {
    var data = dataList[j];
    var tr = document.createElement("TR");
    if (data.completed) 
    {
      tr.setAttribute("class", "completed");
    }
    
    for (var i = 0; i < this.header.length; ++i)
    {
      var title = this.header[i];
      var td = document.createElement("TD");
      if (!title.countDown) 
      {
        td.innerHTML = data[title.key];
        if (title.name) { td.setAttribute("class", "name"); }
      }
      else if (!data.completed)
      {
        this.countDownList.push([td, data[title.key], catagory]);
      } // do nothing if countdown object undefined 
      tr.appendChild(td);
    }
    tr.appendChild(td);

    this.tbody.appendChild(tr);
  }
}

List.prototype.updateList = function (dataList)
{
  this.clearList();
  this.updateSingleList(dataList);
  // start count down if needed
  if (this.countDownList.length > 0)
  {
    this.startCountDown();
  }
  
}

List.prototype.updateAllList = function (dataListParent, listKeyName, keyList)
{
  this.clearList();
  for (var i in keyList)
  {
    var key = keyList[i];
    this.updateSingleList(dataListParent[key][listKeyName], key);
  }
  // start count down if needed
  if (this.countDownList.length > 0)
  {
    this.startCountDown();
  }
}


List.prototype.startCountDown = function() 
{
  var list = this.countDownList;
  var callback = this.countDownCallback;
  var tickFunc = function() 
  { 
    var nowTime = new Date();
    for (var i in list)
    {
      var td = list[i][0];
      var t = list[i][1];
      var diff = Math.floor((t - nowTime) / 60000);
      if (diff >= 0) // (diff > 0) notify when 1 min left (not show 00:00)
      {
        var h = Math.floor(diff/60);
        var m = diff%60;
        td.innerHTML = (h + ":" + ((m < 10) ? "0" + m : m))+ ":" + Math.floor((t - nowTime) / 1000)%60; //sec for debuging
      }
      else if (callback)
      {
        callback(td.parentNode.rowIndex - 1, list[i][2]);
      }
    }
  }
  tickFunc();
  this.tickID = setInterval(tickFunc, 1000); //sec for debuging
}

List.prototype.stopCountDown = function() 
{
  clearInterval(this.tickID);
  this.countDownList = [];
}
