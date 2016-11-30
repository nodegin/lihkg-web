import React from 'react'
import './NotFound.css'

class NotFound extends React.PureComponent {
  componentDidMount() {
    this.props.actions.onSetPageTitle('404')
  }

  render() {
    return (
      <h1>{'¯\\_(ツ)_/¯'}</h1>
    )
  }
}

export default NotFound
