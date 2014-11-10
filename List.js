List = function(container, header) 
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
}

List.prototype.clearList = function (dataList)
{
  var nodes = this.tbody.childNodes;
  for (var i = nodes.length - 1; i >= 0 ; --i)
  {
    this.tbody.removeChild(nodes[i]);
  }
}

List.prototype.updateList = function (dataList)
{
  this.clearList();
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
      td.innerHTML = data[title.key];
      if (title.name) { td.setAttribute("class", "name"); }
      tr.appendChild(td);
    }
    tr.appendChild(td);

    this.tbody.appendChild(tr);
  }
}

