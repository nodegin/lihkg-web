import React, { Component } from 'react'

import { Button, Popup } from 'semantic-ui-react'
import { VelocityComponent } from 'velocity-react'
import './Settings.css'

class Settings extends Component {
  state = {
    visible: false,
  }

  toggle() {
    this.setState({ visible: !this.state.visible }, () => {
      document.body.style.overflow = this.state.visible ? 'hidden' : 'visible'
    })
  }

  deleteHistory() {
    this.props.actions.onDeleteVisitedThread()
    window.location.reload()
  }

  render() {
    const toggle = this.toggle.bind(this)
    return (
      <VelocityComponent animation={{ opacity: this.state.visible ? 1 : 0, top:this.state.visible ? 0 : '2em' }} duration={ 250 }>
        <div className="Settings-wrapper" style={{ pointerEvents: this.state.visible ? 'auto' : 'none' }}>
          <div className="Settings-overlay" onClick={ toggle }/>
          <div className="Settings-main">
            <div className="Settings-row">
              <span>黑夜模式</span>
              <Button toggle active={ this.props.app.darkMode } onClick={ this.props.actions.onToggleDarkMode }>
                { this.props.app.darkMode ? 'ON' : 'OFF' }
              </Button>
            </div>
            <div className="Settings-row">
              <span>公司模式</span>
              <Button toggle active={ this.props.app.officeMode } onClick={ this.props.actions.onToggleOfficeMode }>
                { this.props.app.officeMode ? 'ON' : 'OFF' }
              </Button>
            </div>
            <div className="Settings-row">
              <span>洗底</span>
              <Popup
                trigger={<Button color='red' onClick={ this.deleteHistory.bind(this) }>APPLY</Button>}
                content='DEL曬你D瀏覽記錄（綠色邊果D）'
                positioning='right center'
              />
            </div>
          </div>
        </div>
      </VelocityComponent>
    )
  }
}

export default Settings
