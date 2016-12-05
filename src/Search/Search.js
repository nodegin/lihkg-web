import React from 'react'

import { Form, Input } from 'semantic-ui-react'
import ThreadRow from '../ThreadRow/ThreadRow'
import './Search.css'

class Search extends React.PureComponent {
  state = {
    keyword: '',
    results: [],
    page: 1,
    error: null,
  }

  timeout = 0

  async search() {
    let list
    list = await fetch(`https://lihkg.com/api_v1/thread/search?q=${ this.state.keyword }&page=${ this.state.page }&count=30`)
    list = await list.json()
    if (!list.success) {
      return this.setState({ error: list.error_message })
    }
    let results = [ ...this.state.results, ...list.response.items ]
    this.setState({
      results,
      loadingMessage: '蘇咪摩牙',
    })
  }

  render() {
    const preventDefault = e => e.preventDefault()
    const handleKeywordChange = e => {
      clearTimeout(this.timeout)
      this.setState({
        keyword: e.target.value,
        results: [],
        page: 1,
        error: null,
      }, () => {
        this.timeout = setTimeout(this.search.bind(this), 500)
      })
    }
    const loadMore = () => this.setState({
      page: this.state.page + 1,
      loadingMessage: '撈緊，等陣'
    }, this.search)
    return (
      <div className="Search-main">
        <Form onSubmit={ preventDefault }>
          <Form.Field>
            <Input type="text" placeholder="題目，作者名或主題編號" name="keyword" value={ this.state.keyword } onChange={ handleKeywordChange }/>
          </Form.Field>
        </Form>
        <div className="Search-results">
          { this.state.results.map(c => <ThreadRow key={ c.thread_id } data={ c } { ...this.props }/>) }
        </div>
        { this.state.results.length < 1 ? null : <div className="Search-more">
          { this.state.error ? (
            <span>
              { this.state.error }
              &emsp;
              <img alt="dead" src={ 'https://lihkg.com/assets/faces/normal/dead.gif' }/>
            </span>
          ) : (
            <span onClick={ loadMore } style={{ cursor: 'pointer' }}>
              { this.state.loadingMessage }
              &emsp;
              <img alt="more" src={ 'https://lihkg.com/assets/faces/normal/tongue.gif' }/>
            </span>
          ) }
        </div> }
      </div>
    )
  }
}

export default Search
