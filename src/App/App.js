import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as types from '../actions'
import Helmet from 'react-helmet'

import { Icon, Modal, Image } from 'semantic-ui-react'
import { VelocityComponent } from 'velocity-react'
import Settings from '../Settings/Settings'
import './App.css'

class App extends Component {
  state = {
    drawerOpen: false,
    modalOpen: false,
  }

  async componentDidMount() {
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
    const isLight = JSON.parse(localStorage.getItem('lui'))
    if (isLight && this.props.app.darkMode) {
      this.props.actions.onToggleDarkMode()
    }
    const isOffice = JSON.parse(localStorage.getItem('mtr'))
    if (isOffice && !this.props.app.officeMode) {
      this.props.actions.onToggleOfficeMode()
    }

    let list
    try {
      list = await fetch('https://lihkg.com/api_v1/system/property')
      list = await list.json()
      list = list.response.category_list
    } catch(e) {
      location.reload(true)
    }
    this.props.actions.onSetCategories(list)
  }

  scrollToTop() {
    let scrollCount = 0
    let oldTimestamp = performance.now()
    const scrollDuration = 250
    const cosParameter = window.scrollY / 2
    function step(newTimestamp) {
      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp))
      if (scrollCount >= Math.PI) window.scrollTo(0, 0)
      if (window.scrollY === 0) return
      window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)))
      oldTimestamp = newTimestamp
      window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }

  render() {
    let { user } = this.props.app.user
    const linkRef = e => this.settings = e
    const children = React.Children.map(this.props.children, child => React.cloneElement(child, { ...this.props }))
    const toggleDrawer = e => {
      e.preventDefault()
      this.setState({ drawerOpen: !this.state.drawerOpen }, () => {
        document.body.style.overflow = this.state.drawerOpen ? 'hidden' : 'visible'
      })
    }
    const toggleSettings = e => {
      e.preventDefault()
      this.settings.toggle()
    }
    const toggleModal = e => {
      e.preventDefault()
      this.setState({ modalOpen: !this.state.modalOpen })
    }
    const drawer = (
      <div className="App-drawer">
        { this.props.app.categories.map(c => {
          const click = e => {
            setTimeout(browserHistory.push.bind(null, `/category/${ c.cat_id }`), 250)
            toggleDrawer(e)
          }
          return <div key={ c.cat_id } className="App-drawer-item" onClick={ click }>{ c.name }</div>
        }) }
      </div>
    )
    return (
      <div className={ `App ${ this.props.app.darkMode ? 'dark' : 'light' }` }>
        <Helmet title={ this.props.app.officeMode ? 'LIHKG Web' : this.props.app.pageTitle }/>
        <header>
          <div>
            <div className="App-headerLeft">
              <a href="#" onClick={ toggleDrawer } style={{ textDecoration: 'none' }}>
                <Icon name="content" size="large"/>
              </a>
              <a href="#" onClick={ toggleSettings } style={{ textDecoration: 'none' }}>
                <Icon name="setting" size="large"/>
              </a>
              <a href="#" onClick={ toggleModal } style={{ textDecoration: 'none' }}>
                <Icon name="help" size="large"/>
              </a>
            </div>
            <i className="App-logo" onClick={ this.scrollToTop }></i>
            <div className="App-headerRight">{
              !user ? <div>
                <Link to="/auth/login">登入</Link>
                <span style={{ color: '#888' }}> | </span>
                <a target="_blank" href="https://lihkg.com/register">註冊</a>
              </div> : <div>
                { this.props.app.officeMode ? null : user.nickname } <Link to="/auth/logout">(登出)</Link>
              </div>
            }</div>
          </div>
        </header>
        <Modal size="small" open={ this.state.modalOpen } onClose={ toggleModal }>
          <Modal.Header>LIHKG Web</Modal.Header>
          <Modal.Content image>
            <Image wrapped size="small" src='https://camo.githubusercontent.com//72d1ef1620c2cfbec36c476248b9e65cf4d3757f//68747470733a2f2f782e6c69686b672e636f6d2f6173736574732f696d672f6c6f676f322e706e67' />
            <Modal.Description>
              此 LIHKG 閱讀器由 <a target="_blank" href="https://na.cx">nasece cloud</a> 提供並非 LIHKG 官方發佈
              <br/>
              請詳閱 <a target="_blank" href="https://lihkg.com/tnc">LIHKG 使用條款</a>。如想支持本站，歡迎按此捐款
              <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" style={{ display: 'inline-block' }}>
                <input type="hidden" name="cmd" value="_s-xclick"/>
                <input type="hidden" name="hosted_button_id" value="6QZX62BVJY6EQ"/>
                <input type="image" alt="" src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_SM.gif" name="submit" style={{ height: 12 }}/>
                <img alt="" src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif" width="1" height="1"/>
              </form>
              <br/>
              本網站的原始碼在 MIT 授權下於 <a target="_blank" href="https://git.io/lihkg">GitHub</a> 發佈
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <div style={{ pointerEvents: this.state.drawerOpen ? 'auto' : 'none' }}>
          <VelocityComponent animation={{ opacity: this.state.drawerOpen ? 1 : 0 }} duration={ 250 }>
            <b className="App-drawerOverlay" onClick={ toggleDrawer }/>
          </VelocityComponent>
          <VelocityComponent animation={{ translateX: this.state.drawerOpen ? 0 : '-100%' }} duration={ 250 }>
            { drawer }
          </VelocityComponent>
        </div>
        <main className="App-content">
          { children }
          <Settings ref={ linkRef } { ...this.props }/>
        </main>
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
