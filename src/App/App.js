import React, { Component } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { initialStates } from '../reducers'
import * as types from '../actions'
import Helmet from 'react-helmet'

import { Icon } from 'semantic-ui-react'
import './App.css'

class App extends Component {
  componentDidMount() {
    const deviceToken = localStorage.getItem('dt')
    if (!deviceToken) {
      const possible = '0123456789abcdef'
      let text = ''
      for (let i = 0; i < 40; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      localStorage.setItem('dt', text)
    }
    const item = localStorage.getItem('uinf')
    if (item) {
      this.props.actions.onSetUser(JSON.parse(item))
    }
    const mode = localStorage.getItem('lui')
    if (mode && JSON.parse(mode) && this.props.app.darkMode) {
      this.props.actions.onToggleDarkMode()
    }
  }

  render() {
    let { user } = this.props.app.user
    const children = React.Children.map(this.props.children, child => React.cloneElement(child, { ...this.props }))
    return (
      <div className={ `App ${ this.props.app.darkMode ? 'dark' : 'light' }` }>
        <Helmet title={ this.props.app.pageTitle }/>
        <header>
          <div className="App-headerLeft">
            <span style={{ cursor: 'pointer' }} onClick={ this.props.actions.onToggleDarkMode }>
              <Icon name={ this.props.app.darkMode ? 'moon' : 'sun' } size="large"/>
            </span>
          </div>
          <i className="App-logo"></i>
          <Link to="/">{ initialStates.pageTitle }</Link>
          <div className="App-headerRight">{
            !user ? <div>
              <Link to="/auth/login">登入</Link>&emsp;|&emsp;<a href="https://lihkg.com/register">註冊</a>
            </div> : <div>
              { user.nickname } <Link to="/auth/logout">(登出)</Link>
            </div>
          }</div>
        </header>
        <main className="App-content">
          { children }
        </main>
        <br/>
        <footer>
          此網站為 LIHKG 討論區之網上閱讀器，由 <a target="_blank" href="https://na.cx">nasece cloud</a> 建立及營運，並非 LIHKG 官方提供
          <br/>
          使用前請詳閱 <a target="_blank" href="https://lihkg.com/tnc">LIHKG 使用條款</a>，如想支持本網站，歡迎捐款作支持
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" style={{ display: 'inline-block' }}>
            <input type="hidden" name="cmd" value="_s-xclick"/>
            <input type="hidden" name="hosted_button_id" value="6QZX62BVJY6EQ"/>
            <input type="image" alt="" src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_SM.gif" name="submit" style={{ height: 12 }}/>
            <img alt="" src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif" width="1" height="1"/>
          </form>
        </footer>
      </div>
    )
  }
}

export default connect(
  state => ({
    app: state.app,
  }),
  dispatch => ({
    actions: bindActionCreators(types, dispatch),
  })
)(App)
