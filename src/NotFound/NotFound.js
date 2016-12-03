import React from 'react'
import { Link } from 'react-router'

class NotFound extends React.PureComponent {
  componentDidMount() {
    this.props.actions.onSetPageTitle('404')
  }

  render() {
    return (
      <div style={{'textAlign': 'center', 'marginTop': '4em'}}>
        <img alt="404" style={{'width': '300px'}} src={'http://i1.kym-cdn.com/photos/images/newsfeed/001/042/619/4ea.jpg'}/>
        <h1>{'冇野係度喎 ¯\\_(ツ)_/¯'}</h1>
        <Link to="/">
          <p style={{'display': 'inline-block'}}>{'主頁'}</p>
        </Link>
      </div>
    )
  }
}

export default NotFound
