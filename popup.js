BKG = chrome.extension.getBackgroundPage();
UI_TABS = [];

X_SRC = chrome.extension.getURL('x.gif');

function addChild(node) {
    node.parent = this
    this.children.push(node)
    this.children_elem.appendChild(node.elem)
}

function remove() {
    console.log('remove')      
    console.log(this)      
    for (var i in this.children) {
        this.children[i].remove()
    }
    if (!this.domain && this.tab) {
        chrome.tabs.remove(this.tab.id);
    }
    this.parent.children_elem.removeChild(this.elem)

    var i = this.parent.children.indexOf(this)
    if (i != -1) {
        console.log('remove ' + i)      
        this.parent.children.splice(i, 1)
    }
}

function Node(tab, domain) {
    this.tab = tab
    this.domain = false  // is domain node
    this.children = []
    this.addChild = addChild
    this.remove = remove

    this.elem = document.createElement('table')
    this.elem.setAttribute('class', 'node')
  
    // table structure
    var row1 = document.createElement('tr')
    this.elem.appendChild(row1)
    var cell1 = document.createElement('td')
    row1.appendChild(cell1)

    var row2 = document.createElement('tr')
    this.elem.appendChild(row2)
    var cell2 = document.createElement('td')
    cell2.width = '0px'
    row2.appendChild(cell2)
    var cell3 = document.createElement('td')
    row2.appendChild(cell3)

    this.children_elem = cell3

    // close button
    var xbutton = document.createElement('img')
    xbutton.setAttribute('class', 'xbutton')
    xbutton.onclick = remove.bind(this)
    xbutton.src = X_SRC
    cell1.appendChild(xbutton)

    // fav icon and title for tab node
    if (this.domain) {
        var fav = document.createElement('img')
        fav.src = tab.favIconUrl
        cell1.appendChild(fav)

        var title = document.createElement('span')
        title.setAttribute('class', 'title')
        title.innerHTML = tab.domain
        title.onclick = selecttab.bind(title, tab.id);
        cell1.appendChild(title)
    } else if (this.tab) {
        var fav = document.createElement('img')
        fav.src = tab.favIconUrl
        cell1.appendChild(fav)

        var title = document.createElement('span')
        title.setAttribute('class', 'title')
        title.innerHTML = tab.title
        title.onclick = selecttab.bind(title, tab.id);
        cell1.appendChild(title)
    }
}

byProperty = function(prop) {
    console.log('construct cmp func');
    return function(a,b) {
        console.log("cmp");
        if (typeof a[prop] == "number") {
            return (a[prop] - b[prop]);
        } else {
            return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
        }
    };
}

byKey = function(key) {
    console.log('construct cmp func');
    return function(a,b) {
        console.log("key cmp");
        var s = key(a);
        var t = key(b);
        console.log('compare these:');
        console.log(s);
        console.log(t);
        result = ((s < t) ? -1 : ((s > t) ? 1 : 0));
        console.log(result);
        return result;
    };
}

function sortIntoGroups(tabs) {
    console.log('sort')
    var result = []
    if (tabs.length == 0) {
        console.log(result)
        return result
    }
    var group = []
    for (var i in tabs) { 
        if (i > 0 && tabs[i].domain != tabs[i-1].domain) {
            result.push(group)
            group = []
        }
        group.push(tabs[i])
    }
    result.push(group)
    console.log(result)
    return result
}

// input: array of tabs
function show(tabs) {
    // sort by pinned : unpinned
    var pinned = [];
    var unpinned = [];
    for (var i in tabs) {
        var tab = tabs[i];
        if (tab.pinned)
            pinned.push(tab);
        else
            unpinned.push(tab);
    }
    // keep pinned tabs fixed
    pinned.sort(byKey(function(x) { return x.old_index }));
    tabs_pinned_unpinned = pinned.concat(unpinned);
    console.log('pinned unpinned sort');
    console.log(tabs_pinned_unpinned);
    var tab_section = document.getElementById('tabs');

    var root = new Node(null)

    console.log('pinned')
    console.log(pinned)
    pinned_groups = sortIntoGroups(pinned)
    for (var i in pinned_groups) {
        var group = pinned_groups[i]
        var node = new Node(group[0])
        if (group.length > 1) {
            node.domain = true
            for (var i in group) {
                var tab = group[i]
                node.addChild(new Node(tab))
            }
        }
        root.addChild(node)
    }

    console.log('unpinned')
    console.log(unpinned)
    unpinned_groups = sortIntoGroups(unpinned)
    for (var i in unpinned_groups) {
        var group = unpinned_groups[i]
        var node = new Node(group[0])
        if (group.length > 1) {
            node.domain = true
            for (var i in group) {
                var tab = group[i]
                node.addChild(new Node(tab))
            }
        }
        root.addChild(node)
    }

    /*
    for (var i in tabs_pinned_unpinned) {
        var tab = tabs_pinned_unpinned[i];
        console.log(tab);
        console.log('display tab id: ' + tab.id);

        root.addChild(new Node(tab))
        //console.log(tabs[i].title);
        //console.log("id " + tabs[i].id);
        //console.log("parent " + tabs[i].openerTabId);
        //console.log(tabs[i].url);
        var xbutton = document.createElement('img');
        xbutton.setAttribute('class', 'xbutton');
        xbutton.src = x_src;
        xbutton.onclick = closetab.bind(xbutton, tab.id);
        xbutton.id = "x" + tab.id;
        //xbutton.innerHTML = "x";

        var fav = document.createElement('img');
        fav.id = 'fav' + tab.id;
        fav.src = tab.favIconUrl;

        var elem = document.createElement('span');
        elem.setAttribute('class', 'title');
        elem.id = tab.id;
        elem.onclick = selecttab.bind(elem, tab.id);
        elem.innerHTML = tab.title;

        var br = document.createElement('br');
        br.id = "br" + tab.id;

        tab_section.appendChild(xbutton);
        tab_section.appendChild(fav);
        tab_section.appendChild(elem);
        tab_section.appendChild(br);
    }
    */
    tab_section.appendChild(root.elem)
    console.log(root)
}

function selecttab(id) {
    console.log('select ' + id);
    chrome.tabs.get(id, function(tab) {
      chrome.tabs.highlight({windowId: chrome.windows.WINDOW_ID_CURRENT, tabs: tab.index}, function(){})
    });
    //chrome.tabs.get(id, function(tab){console.log('highlight ' + tab.id); tab.highlighted = true;});
}

function clear() {
    document.getElementById('tabs').innerHTML = '';
}

function removeBar(id) {
    console.log('remove from html ' + id);
    var elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("x" + id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("br" + id);
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById("fav" + id);
    elem.parentNode.removeChild(elem);
}

function closetab(id) {
    console.log('close ' + id);
    chrome.tabs.remove(id);
    removeBar(id);
}

function numPinned(tabs) {
    var pinned = 0;
    for (i in tabs) {
        if (tabs[i].pinned) {
            pinned++;
        }
    }
    return pinned;
}

function move(tabs) {
    console.log('move tabs');
    console.log(tabs);
    var pinned = numPinned(tabs);
    var pinned_moved = 0;
    var unpinned_moved = 0;
    for (i in tabs) {
        var tab = tabs[i];
        if (tab.pinned) {
            chrome.tabs.move(tab.id, {index: pinned_moved});
            pinned_moved++;
        } else {
            chrome.tabs.move(tab.id, {index: pinned + unpinned_moved});
            unpinned_moved++;
        }
    }
}

function domainTree() {
  var tabs = [];
  for (var id in BKG.TABS) {
    var tab = BKG.TABS[id];
    tabs.push(tab);
  }
  tabs.sort(byKey(function(x) { return x.domain }));
  var root = new node();
  var lastdomain = null;
  for (var tab in tabs) {
    if (!lastdomain || tab.domain != lastdomain) {
      var child = node();
      child.fav = tab.favIconUrl;
      root.children.push(child);
    } else {
      child.children.push(tab);
    }
  }
}

function sortByDomain(tabs) {
    console.log('sort by domain');
    clear();
    for (var i in tabs) {
        var tab = tabs[i]
        console.log(tab)
        tab.domain = BKG.getDomain(tab.url)
    }
    tabs.sort(byKey(function(x) { return x.domain }));
    show(tabs);
    move(tabs);
}

function sortByIndex(tabs) {
    console.log('sort by index');
    clear();
    for (var i in tabs) {
        var tab = tabs[i]
        console.log(tab)
        tab.domain = BKG.getDomain(tab.url)
    }
    tabs.sort(byKey(function(x) { return x.index }));
    show(tabs);
    move(tabs);
}

function DOMContentLoadedListener() {
    /*
    console.log(UI_TABS);
    for (var id in BKG.TABS) {
        var tab = BKG.TABS[id];
        tab.old_index = tab.index;
        UI_TABS.push(tab);
    }
    */

    button_section = document.getElementById('buttons');

    var index = document.createElement('button');
    index.id = "index";
    index.innerHTML = "Original";
    index.onclick = sortByIndex
    button_section.appendChild(index);

    var domain = document.createElement('button');
    domain.id = "domain";
    domain.innerHTML = "Domain";
    domain.onclick = sortByDomain
    button_section.appendChild(domain);

    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, sortByIndex)
}

document.addEventListener('DOMContentLoaded', DOMContentLoadedListener);
