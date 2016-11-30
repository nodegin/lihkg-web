import React from 'react'
import { Link } from 'react-router'
import { initialStates } from '../reducers'

import './Categories.css'

class Categories extends React.PureComponent {
  state = {
    categories: [],
  }

  async componentDidMount() {
    let list
    try {
      list = await fetch('https://lihkg.com/api_v1/system/property')
      list = await list.json()
    } catch(e) {
      location.reload(true)
    }
    const categories = list.response.category_list.map(c => {
      return (
        <div key={ c.cat_id } className="Categories-item">
          <Link to={ `/category/${ c.cat_id }` }>{ c.name }</Link>
        </div>
      )
    })
    this.setState({ categories })
    this.props.actions.onSetPageTitle(initialStates.pageTitle)
  }

  render() {
    return (
      <div className="Categories-container">
        { this.state.categories }
      </div>
    )
  }
}

export default Categories
