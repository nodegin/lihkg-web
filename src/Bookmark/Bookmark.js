import storage from '../storage'
import React from 'react'

import ThreadRow from '../ThreadRow/ThreadRow'
import './Bookmark.css'

class Bookmark extends React.PureComponent {
  state = {
    page: 1,
    error: null,
    threads: [],
    loadingMessage: '撈緊，等陣',
  }

  componentDidMount() {
    if (this.props.app.user.user) {
      this.reloadPosts()
    }
  }

  async reloadPosts() {
    let list
    list = await fetch(`https://lihkg.na.cx/mirror/thread/bookmark?page=${ this.state.page }&count=30`, {
      headers: {
        'X-DEVICE': storage.getItem('dt'),
        'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
        'X-USER': this.props.app.user.user.user_id,
      }
    })
    list = await list.json()
    if (!list.success) {
      return this.setState({ error: list.error_message })
    }

    let threads = [ ...this.state.threads, ...list.response.items ]
    threads = threads.map(c => {
      const lr = this.props.app.bookmarks[c.thread_id]
      return <ThreadRow key={ `${ c.thread_id }|${ c.last_reply_time }` } data={ c } lastRead={ lr ? lr.page : null } { ...this.props }/>
    })
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
    const loadMore = () => this.setState({
      page: this.state.page + 1,
      loadingMessage: '撈緊，等陣',
    }, this.reloadPosts.bind(this))
    return (
      <div className="Bookmark-main">
        <div className="Bookmark-results">
          { this.state.threads }
        </div>
        <div className="Bookmark-more">
          { this.state.error ? null : (
            <span onClick={ loadMore } style={{ cursor: 'pointer' }}>
              { this.state.loadingMessage }
              &emsp;
              <img alt="more" src={ 'https://lihkg.com/assets/faces/normal/tongue.gif' }/>
            </span>
          ) }
          { this.state.error ? (
            <span>
              { this.state.error }
              &emsp;
              <img alt="dead" src={ 'https://lihkg.com/assets/faces/normal/dead.gif' }/>
            </span>
          ) : null }
        </div>
      </div>
    )
  }
}

export default Bookmark
