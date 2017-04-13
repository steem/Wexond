import React from 'react'
import TabBar from '../tabs/tabbar'
import Page from '../tabs/page'
import Titlebar from './titlebar'
import Bar from '../navbar/bar'

import '../../../resources/browser/scss/app.scss'
import '../../../resources/browser/scss/tab.scss'
import '../../../resources/browser/scss/page.scss'
import '../../../resources/browser/scss/titlebar.scss'
import '../../../resources/browser/scss/tabbar.scss'
import '../../../resources/browser/scss/bar.scss'
import '../../../resources/browser/scss/suggestions.scss'
import '../../../resources/browser/scss/suggestion.scss'

export default class App extends React.Component {
  constructor () {
    super()

    this.state = {
      pagesToCreate: []
    }
  }
  /*
    lifecycle
    */
  componentDidMount () {
    var self = this

    setTimeout(function () {
      self.refs.tabbar.addTab()
    }, 1)

    document.addEventListener('keyup', function (e) {
      // CTRL + T
      if (e.ctrlKey && e.keyCode === 84) {
        self.getTabBar().addTab()
      }
    }, false)
    window.addEventListener('contextmenu', function (e) {
      if (e.target.tagName === 'WEBVIEW') {
        currentWindow.getChildWindows()[0].send('browser-menu:show-animation', e.screenX, e.screenY)
      }
    })

    // communicate with BrowserMenu

    ipcRenderer.on('webview:back', function () {
      var tab = self.getSelectedTab()
      var webview = tab.getPage().getWebView()
      if (webview.canGoBack()) {
        webview.goBack()
        currentWindow.getChildWindows()[0].send('webview:can-go-back', webview.canGoBack())
      }
    })
    ipcRenderer.on('webview:forward', function () {
      var tab = self.getSelectedTab()
      var webview = tab.getPage().getWebView()
      if (webview.canGoForward()) {
        webview.goForward()
        currentWindow.getChildWindows()[0].send('webview:can-go-forward', webview.canGoForward())
      }
    })
    ipcRenderer.on('webview:reload', function () {
      var tab = self.getSelectedTab()
      var webview = tab.getPage().getWebView()
      webview.reload()
    })
  }

  /*
  * closes window
  */
  close () {
    currentWindow.close()
  }
  /*
    * maximizes / restores window
    */
  maximizeOrRestore () {
    if (currentWindow.isMaximized()) {
      // restore window
      currentWindow.unmaximize()
    } else {
      // maximize window
      currentWindow.maximize()
    }
  }
  /*
    * minimizes / restores window
    */
  minimizeOrRestore () {
    if (currentWindow.isMinimized()) {
      // restore window
      currentWindow.restore()
    } else {
      // minimize window
      currentWindow.minimize()
    }
  }
  /*
    * adds page to render queue
    * @param1 {function} getTabFunction
    */
  addPage = (getTabFunction) => {
    this.setState((p) => {
      p.pagesToCreate.push(getTabFunction)
      return {pagesToCreate: p.pagesToCreate}
    })
  }
  /*
  * sets bar text
  * @param1 text
  */
  updateBarText = (text) => {
    var bar = this.getBar()
    // check if webview's url is in excluded urls
    if (!excludeURLs.isInArray(text)) {
      // if not, set bar's text to webview's url and unlock bar
      bar.setText(text)
      bar.locked = false
      bar.tempLocked = false
    } else {
      bar.setText('')
      // if it is, check if the url is wexond://newtab
      if (text.startsWith('wexond://newtab')) {
        // if it is, lock and show bar
        bar.locked = true
        bar.show()
      }
    }
  }
  /*
    * gets app
    * @return {App}
    */
  getApp = () => {
    return this
  }
  /*
    * gets tabbar
    * @return {TabBar}
    */
  getTabBar = () => {
    return this.refs.tabbar
  }
  /*
    * gets browser menu
    * @return {BrowserMenu}
    */
  getBrowserMenu = () => {
    return this.refs.menu
  }
  /*
    * gets bar
    * @return {Bar}
    */
  getBar = () => {
    return this.refs.bar
  }
  /*
    * gets selected tab
    * @return {Tab}
    */
  getSelectedTab = () => {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].selected) {
        return tabs[i]
      }
    }
  }

  render () {
    var self = this
    return (
      <div>
        <Titlebar getApp={this.getApp} ref='titlebar'>
          <TabBar getApp={this.getApp} ref='tabbar' />
        </Titlebar>
        {self.state.pagesToCreate.map((object, i) => {
          return <Page key={i} getTab={object} getApp={self.getApp} />
        })
}
        <Bar ref='bar' />
      </div>
    )
  }
}
