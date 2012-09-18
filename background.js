var resultsList = [],
    unlikely = "GOSHDARNYOUCHROME";

// Return the suggestions
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) { 
    // Search the bookmarks
    var searchResults = chrome.bookmarks.search(text, function(searchResults) {
      resultsList = [];
      
      for (var i = 0; i < searchResults.length; i++) {
        var item = searchResults[i];
        var isBookmarklet = (item.url.substring(0, 11) == "javascript:");

        resultsList.push({
          content:     unlikely + item.url, // Prepend our unlikely string to the URL
          description: item.title.replace(new RegExp("(" + text + ")", "gi"), "<match>$1</match>") + " <dim>" + (isBookmarklet ? "(Bookmarklet)" : "(URL)") + "</dim>"
        });
      };

      // Chrome adds a completely useless default suggestion in our case
      // So set the default and slice it off
      chrome.omnibox.setDefaultSuggestion({ description: resultsList[0].description });
      suggest(resultsList.slice(1, -1));
    })
  }
);

// Activate the selection on submit
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    // If text doesn't have unlikely prepended its the stupid default
    if(text.substring(0, unlikely.length) !== unlikely) {
      text = resultsList[0].content;
    }

    text = text.substring(unlikely.length); // Trim the unlikely string

    if (text.substring(0, 11) == "javascript:") {
      chrome.tabs.executeScript(null, { code: decodeURIComponent(text) });
    } else {
      chrome.tabs.update({ url: text });
    }
  }
);