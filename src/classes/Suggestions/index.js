import Network from '../../helpers/Network'
export default class Suggestions {
  /**
   * Gets suggestions from search engine.
   * @param {DOMElement} input
   * @param {function(data)} callback
   */
  static getSearchSuggestions = (input, callback = null) => {
    var inputText = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd)
    var suggestions = []
    Network.requestUrl('http://google.com/complete/search?client=chrome&q=' + inputText.toLowerCase(), function (data, error) {
      if (error) {
        if (callback != null) {
          callback(null, error)
        }
        return
      }

      try {
        var json = JSON.parse(data)
        var tempSuggestions = []

        for (var i = 0; i < json[1].length; i++) {
          if (!tempSuggestions.contains(json[1][i])) {
            tempSuggestions.push(String(json[1][i]).toLowerCase())
          }
        }

        // Remove duplicates from array.
        var seenSuggestions = []
        for (i = 0; i < tempSuggestions.length; i++) {
          if (!seenSuggestions.contains(tempSuggestions[i])) {
            suggestions.push(tempSuggestions[i])
            seenSuggestions.push(tempSuggestions[i])
          }
        }

        // Sort array by length.
        suggestions.sort(function (a, b) {
          return a.length - b.length
        })

        // Set max length for array.
        tempSuggestions = []
        var length = 5
        if (suggestions.length > 5) {
          length = 5
        } else {
          length = suggestions.length
        }
        for (i = 0; i < length; i++) {
          tempSuggestions.push(suggestions[i])
        }

        suggestions = tempSuggestions

        if (callback != null) {
          callback(suggestions)
        }
      } catch (e) {
        if (callback != null) {
          callback(null, e)
        }
      }
    })
  }
  /**
   * Gets suggestions from history
   * @param {DOMElement} input
   * @param {function(data)} callback
   */
  static getHistorySuggestions = (input, callback = null) => {
    var suggestions = []
    var inputText = (input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd)).toLowerCase()

    Network.requestUrl(global.historyPath, function (data, error) {
      var json = JSON.parse(data)
      if (inputText !== '') {
        var tempSuggestions = []
        for (var i = 0; i < json.length; i++) {
          var url = json[i].url
          var title = json[i].title

          var suggestion = {
            url: url.toLowerCase(),
            title: title.toLowerCase()
          }

          if (url.indexOf(inputText.toLowerCase()) !== -1 && url.indexOf('?q=') === -1) {
            if (!tempSuggestions.contains(suggestion)) {
              tempSuggestions.push(suggestion)
            }
          }
        }

        let regex = /(http(s?)):\/\/(www.)?/gi

        let shortestSuggestion = Object.assign({}, tempSuggestions[0])

        if (shortestSuggestion != null && shortestSuggestion.url != null) {
          shortestSuggestion.url = shortestSuggestion.url.replace(regex, '')

          shortestSuggestion.url = shortestSuggestion.url.substring(0, shortestSuggestion.url.indexOf('/'))

          let urlLC = shortestSuggestion.url.toLowerCase()
          let inputTextLC = inputText.toLowerCase()

          if (urlLC.startsWith(inputTextLC)) {
            tempSuggestions.unshift(shortestSuggestion)
          }
        }

        // Remove duplicates from array.
        var seenSuggestions = []
        for (i = 0; i < tempSuggestions.length; i++) {
          if (!seenSuggestions.contains(tempSuggestions[i].url)) {
            suggestions.push(tempSuggestions[i])
            seenSuggestions.push(tempSuggestions[i].url)
          }
        }

        // Sort array by length.
        suggestions.sort(function (a, b) {
          return a.url.length - b.url.length
        })
      }

      // Set max length for array.
      tempSuggestions = []
      var length = 5
      if (suggestions.length > 5) {
        length = 5
      } else {
        length = suggestions.length
      }
      for (i = 0; i < length; i++) {
        tempSuggestions.push(suggestions[i])
      }

      suggestions = tempSuggestions

      if (callback != null) {
        callback(suggestions)
      }
    })
  }
}
