Tab = function(container, tabClickCallback, tabAllClickCallback)
{
  var ul = document.createElement("UL"); 
  ul.setAttribute("class", "tabs");
  container.appendChild(ul);
  this.ul = ul;

  this.selectedID = "";
  this.tabClickCallback = tabClickCallback;
  this.tabAllClickCallback = tabAllClickCallback;
}

Tab.prototype.getSelectedID = function ()
{
  return this.selectedID;
}

Tab.prototype.isAllTabSelected = function ()
{
  return (this.selectedID == "all");
}

Tab.prototype.tabClicked = function (id)
{
  if (id)
  {
    this.selectedID = id;
  }

  var nodes = this.ul.childNodes;
  for (var i = 0; i < nodes.length; ++i)
  {
    var node = nodes[i];
    if (this.selectedID == node.id) 
    {
      node.setAttribute("class", "selected");
    }
    else
    {
      node.removeAttribute("class");
    }
  }
  if (id == "all")
  {
    this.tabAllClickCallback();
  }
  else
  {
    this.tabClickCallback(this.selectedID);
  }
}

Tab.prototype.clearTabs = function ()
{
  var nodes = this.ul.childNodes;
  for (var i = nodes.length - 1; i >= 0 ; --i)
  {
    this.ul.removeChild(nodes[i]);
  }
}

Tab.prototype.create = function (tabList)
{
  this.clearTabs();

  var generateTab = function (tabInstance, id, name, title)
  {
    var li = document.createElement("LI");
    li.id = id;
    if (title) { li.title = title; }
    li.appendChild(document.createTextNode(name))
    li.addEventListener('click', function (e) {
      tabInstance.tabClicked(e.currentTarget.id);
    });
    tabInstance.ul.appendChild(li);
  }

  if (this.tabAllClickCallback)
  {
    generateTab(this, "all", "ALL");
  }

  for (var i in tabList)
  {
    var tab = tabList[i];
    generateTab(this, i, tab.name, tab.title);
  }

  if (this.selectedID == "" || !(this.selectedID in tabList))
  {
    this.tabClicked(Object.keys(tabList)[0]);
  }
  else
  {
    this.tabClicked();
  }
  
}


