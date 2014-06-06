  var max_tab = 7;
  var tabs = {};

  function updateIcon() {
    chrome.browserAction.setIcon({path:"icon" + current + ".png"});
    current++;

    if (current > max)
      current = min;
  }

  function callback(tab) {
  }

  function closeTab(tab) {
      chrome.tabs.remove(tab.id);
  }
  
  function closeSelectedTab() {
      console.log('close selected tab');
      chrome.tabs.getSelected(null, closeTab);
      //chrome.tabs.remove(tid) 
  }

  function pinTab(tab) { 
      console.log('pin tab');
      // Toggle the pinned status
      chrome.tabs.update(tab.id, {'pinned': !tab.pinned});
  }

  function pinTabListener(request, sender, sendResponse) {
      console.log('heard');
      if (request.toggle_pin) {
          // Get the currently selected tab
          chrome.tabs.getSelected(null, pinTab);
      }
  }

  function sortTabInfo(a, b) {
      return b.lastUse - a.lastUse;
  }

  function currentTime() {
      var d = new Date();
      return d.getTime(); 
  }

  function TabInfo(id) {
      this.id = id;
      this.createTime = currentTime();
      this.lastUse = currentTime();
  }

  function pruneTabs() {
      console.log('prune'); 
      tab_arr = [];
      for (var tid in tabs) {
          tab_arr.push(tabs[tid]);
      }
      tab_arr.sort(sortTabInfo);
      console.log(tab_arr.length + ' tabs');
      console.log(max_tab);
      if (tab_arr.length > max_tab) {
          console.log('really prune'); 
          console.log(tab_arr.length); 
          console.log(tab_arr); 
          while (tab_arr.length > max_tab) {
              var t = tab_arr.pop();
              console.log('kill ' + t.id); 
              chrome.tabs.remove(t.id);  // triggers remove handler
              console.log('closed');
          }
      }
  }

  function addTab(tabId) {
      var t = new TabInfo(tabId);
      tabs[t.id] = t;
      pruneTabs();
  }

  function removeTab(tabId) {
      delete tabs[tabId];
  }

  function createHandler(tab) {
      addTab(tab.id);
  }
  
  function removeHandler(tabId, removeInfo) {
      removeTab(tabId);
  }

  function selectionChangeHandler(tabId, selectInfo) {
      tabs[tabId].lastUse = currentTime();
  }

  function updateHandler(tabId, changeInfo, tab) {
      if ('pinned' in changeInfo) {
          console.log('pinning changed');
          if (changeInfo.pinned) {
              console.log('pinned');
              removeTab(tabId);
          } else {
              console.log('unpinned');
              addTab(tabId);
          }
      } else {
          console.log('other update');
      }
  }

  //function detachHandler(tabId, detachInfo) {
  //    delete tabs[tabId];
  //}

  //function attachHandler(tabId, attachInfo) {
  //    tabs[tabId] = currentTime();
  //}


  chrome.tabs.getAllInWindow(null, function(tabs) {
      for (var i=0; i<tabs.length; i++) {
          tab = tabs[i];
          if (!tab.pinned) {
              console.log('add tab ' + tab.id);
              addTab(tab.id);
          }
      }
  });

  //chrome.browserAction.onClicked.addListener(closeSelectedTab);

  chrome.extension.onRequest.addListener(pinTabListener);

  chrome.tabs.onCreated.addListener(createHandler);
  chrome.tabs.onRemoved.addListener(removeHandler);
  chrome.tabs.onSelectionChanged.addListener(selectionChangeHandler);
  chrome.tabs.onUpdated.addListener(updateHandler);
  //chrome.tabs.onAttached.addListener(attachHandler);
  //chrome.tabs.onDetached.addListener(detachHandler);
  //updateIcon();
