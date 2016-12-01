import React from 'react'
import { browserHistory } from 'react-router'

class Logout extends React.PureComponent {

  componentDidMount() {
    localStorage.removeItem('uinf')
    this.props.actions.onSetUser({})
    browserHistory.replace('/')
  }

  render() {
    return null
  }
}

export default Logout
