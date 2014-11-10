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

  this.container = container;
  this.header = header;
  this.currentList;
}

List.prototype.clearList = function ()
{
  var nodes = this.tbody.childNodes;
  for (var i = nodes.length - 1; i >= 0 ; --i)
  {
    this.tbody.removeChild(nodes[i]);
  }
}

List.prototype.updateList = function ()
{
  var nodes = this.tbody.childNodes;
  for (var j = 0; j < nodes.length; ++j)
  {
    var data = this.currentList[j];
    var tr = nodes[j];
    if (data.completed) 
    {
      tr.setAttribute("class", "completed");
    }
    for (var i = 0; i < this.header.length; ++i)
    {
      var title = this.header[i];
      var td = tr.childNodes[i];
      td.innerHTML = data[title.key];
      if (title.name) { td.setAttribute("class", "name"); }
    }
  }
}

List.prototype.createList = function (dataList)
{
  this.currentList = dataList
  this.clearList();
  // create list
  for (var j = 0; j < dataList.length; ++j)
  {
    var data = dataList[j];
    var tr = document.createElement("TR");
    
    for (var i = 0; i < this.header.length; ++i)
    {
      var td = document.createElement("TD");
      tr.appendChild(td);
    }
    tr.appendChild(td);

    this.tbody.appendChild(tr);
  }
  this.updateList();
}

List.prototype.show = function ()
{
  this.container.removeAttribute("hidden");
}

List.prototype.hide = function ()
{
  this.container.setAttribute("hidden", true);
}
