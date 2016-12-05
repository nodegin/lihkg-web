import React from 'react'
import { browserHistory } from 'react-router'

import { Form, Input } from 'semantic-ui-react'
import ThreadRow from '../ThreadRow/ThreadRow'
import './Search.css'

class Search extends React.PureComponent {
  state = {
    keyword: '',
    threads: [],
    page: 1,
    error: null,
  }

  componentDidMount() {
    const { q } = this.props.location.query
    if (q) {
      this.setState({ keyword: q }, this.search)
    }
  }

  timeout = 0

  async search() {
    let list
    list = await fetch(`https://lihkg.com/api_v1/thread/search?q=${ this.state.keyword }&page=${ this.state.page }&count=30`)
    list = await list.json()
    if (!list.success) {
      return this.setState({ error: list.error_message })
    }
    browserHistory.replace('/search?q=' + this.state.keyword)

    let threads = [ ...this.state.threads, ...list.response.items ]
    threads = threads.map(c => <ThreadRow key={ `${ c.thread_id }|${ c.last_reply_time }` } data={ c } { ...this.props }/>)
    threads = threads.reduce((all, current) => ({
      ...all,
      [current.key]: current,
    }), {})
    threads = Object.keys(threads).map(k => threads[k])
    threads = threads.sort((a, b) => {
      const aTime = +a.key.split('|')[1]
      const bTime = +b.key.split('|')[1]
      return bTime - aTime
    })

    this.setState({
      threads,
      loadingMessage: '蘇咪摩牙',
    })
  }

  render() {
    const preventDefault = e => e.preventDefault()
    const handleKeywordChange = e => {
      clearTimeout(this.timeout)
      this.setState({
        keyword: e.target.value,
        threads: [],
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
          { this.state.threads }
        </div>
        { this.state.threads.length < 1 ? null : <div className="Search-more">
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
