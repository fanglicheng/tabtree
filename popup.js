    var bkg = chrome.extension.getBackgroundPage();
    tab_arr = []
    for (var tid in bkg.tabs) {
        tab = bkg.tabs[tid];
        tab_arr.push(tab)
    }
    document.write(tab_arr.length + ' unpinned tabs.');
    document.write("<br>");

    function change_max_tab () {
       var textbox = document.getElementById("max_tab");
       bkg.max_tab = parseInt(textbox.value)
    }
