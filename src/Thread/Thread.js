import React from 'react'
import ReactDOM from 'react-dom'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { Dropdown, Icon, Modal, Form } from 'semantic-ui-react'
import FloatEditor from '../FloatEditor/FloatEditor'
import htmlToBBCode, { map } from './htmlToBBCode'
import './Thread.css'

class Thread extends React.PureComponent {
  state = {
    posts: [],
    pages: 1,
    error: null,
    shareText: null,
  }

  parseMessage(msg) {
    msg = msg.replace(/src="\/?assets/g, 'src="https://lihkg.com/assets').replace(/><br\s?\/>/g, '>')
    const removeDepth = document.createElement('div')
    removeDepth.innerHTML = msg
    const result = removeDepth.querySelector('blockquote' + ' > blockquote'.repeat(5 - 1))
    if (result) {
      result.parentNode.removeChild(result)
    }
    if (this.props.app.officeMode) {
      const icons = removeDepth.querySelectorAll('img[src^="https://lihkg.com/assets"]')
      icons.forEach(i => {
        const code = i.src.split('faces')[1]
        i.outerHTML = map[code]
      })
    }
    return removeDepth.innerHTML
  }

  async bookmark(page) {
    const { user } = this.props.app.user
    if (!user) {
      return alert('請先登入')
    }
    try {
      let list, url
      if (this.props.app.bookmarks[this.props.params.id]) {
        //url = `https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/bookmark-last-read?page=${ page }&post_id=-1`
        url = `https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/unbookmark`
      } else {
        url = `https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/bookmark`
      }
      list = await fetch(url, {
        headers: {
          'X-DEVICE': localStorage.getItem('dt'),
          'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
          'X-USER': user.user_id,
        },
      })
      list = await list.json()
      if (!list.success) {
        throw new Error(list.error_message)
      }
      this.props.actions.onUpdateBookmarkList(list.response.bookmark_thread_list)
      this.reloadPosts(page)
    } catch(e) {
      alert(e.message)
    }
  }

  async updateBookmarkLastRead(page) {
    const { user } = this.props.app.user
    if (!user) {
      return
    }
    try {
      let list
      list = await fetch(`https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/bookmark-last-read?page=${ page }&post_id=-1`, {
        headers: {
          'X-DEVICE': localStorage.getItem('dt'),
          'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
          'X-USER': user.user_id,
        },
      })
      list = await list.json()
      if (!list.success) {
        throw new Error(list.error_message)
      }
      this.props.actions.onUpdateBookmarkList(list.response.bookmark_thread_list)
      this.reloadPosts(page)
    } catch(e) {
      alert(e.message)
    }
  }

  async reloadPosts(page) {
    if (!this.props.app.categories.length) {
      return setTimeout(this.reloadPosts.bind(this, page), 250)
    }

    let list
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ this.props.params.id }/page/${ page }`)
      list = await list.json()
    } catch(e) {
      location.reload(true)
    }
    if (list.success) {
      const pages = Math.ceil(list.response.no_of_reply / 25)
      const emptyBtn = <b className="Thread-buttons-btnSpace"/>
      const prevPage = page <= pages && page > 1 ? <Link to={`/thread/${ this.props.params.id }/page/${ page - 1 }`} className="Thread-buttons-btn">上頁</Link> : emptyBtn
      const nextPage = pages > 1 && page < pages ? <Link to={`/thread/${ this.props.params.id }/page/${ page + 1 }`} className="Thread-buttons-btn">下頁</Link> : emptyBtn
      const reload = () => location.reload(true)
      const pagesOptions = new Array(pages).fill().map((_, i) => {
        return { text: `第 ${ i + 1 } 頁`, value: i + 1 }
      })
      const handlePageChange = (e, item) => browserHistory.push(`/thread/${ this.props.params.id }/page/${ item.value }`)
      const category = this.props.app.categories.find(c => c.cat_id === list.response.cat_id)
      const bookmark = this.bookmark.bind(this, page)
      const openShareModal = () => {
        this.setState({ shareText: `${ list.response.title } - LIHKG Web\n\nhttps://lihkg.na.cx/thread/${ this.props.params.id }/page/${ page }` })
      }
      const links = (
        <div className="Thread-links">
          <div>
            <Link to={`/category/${ list.response.cat_id }`}>‹ { category.name }</Link>
            { list.response.cat_id === '1' ? null : <Link to="/category/1" style={{ marginLeft: 8 }}>(吹水台)</Link> }
          </div>
          <b className="Thread-spaceFill"/>
          <div className="Thread-actions">
            <Icon name="star" size="large" onClick={ bookmark } style={ this.props.app.bookmarks[this.props.params.id] ? { color: '#FBC02D' } : {} }/>
            <Icon name="share alternate" size="large" onClick={ openShareModal }/>
          </div>
          <Dropdown inline scrolling text="㨂頁數" options={ pagesOptions } onChange={ handlePageChange } value={ page } selectOnBlur={ false }/>
        </div>
      )
      const buttons = (top, bottom) => (
        <div className="Thread-extras">
          { top }
          <div className="Thread-buttons">
            <b className="Thread-spaceFill"/>
            { prevPage }
            <div className="Thread-buttons-btn" onClick={ reload }>F5</div>
            { nextPage }
            <b className="Thread-spaceFill"/>
          </div>
          { bottom }
        </div>
      )
      const likeThis = this.rateThread.bind(this, 'like')
      const dislikeThis = this.rateThread.bind(this, 'dislike')
      const icon = (() => {
        const elem = document.createElement('div')
        ReactDOM.render(
          <div style={{ display: 'inline-block' }}>
            <Icon name="image" size="big" style={{ cursor: 'pointer' }}/>
          </div>,
          elem
        )
        return elem.firstChild
      })()
      const linkContentRef = e => {
        if (!e || !this.props.app.officeMode) {
          return
        }
        const images = e.querySelectorAll('img')
        images.forEach(i => {
          icon.onclick = () => icon.innerHTML = `<img alt src="${ i.src }">`
          i.parentNode.replaceChild(icon, i)
        })
      }
      const postsToMap = !this.props.app.storyMode ?
        list.response.item_data :
        list.response.item_data.filter((c, i) => {
          // Make sure the comment id matches the original one
          c.i = i
          return c.user.user_id === list.response.user.user_id
        })
      const posts = (
        <div>
          <h2 className="Thread-header">
            <div className="Thread-header-rate" style={{ color: '#7CB342' }} onClick={ likeThis }>
              <Icon name="thumbs up"/>
              { list.response.like_count }
            </div>
            <div className="Thread-header-center">
            { list.response.title }
            </div>
            <div className="Thread-header-rate" style={{ color: '#EF5350' }} onClick={ dislikeThis }>
              <Icon name="thumbs down"/>
              { list.response.dislike_count }
            </div>
          </h2>
          { buttons(null, links) }
          <div>
            { postsToMap.map((c, i) => {
              const quote = () => this.editor.updateContent(`[quote]${ htmlToBBCode(c.msg) }[/quote]\n`)
              const msg = this.parseMessage(c.msg)
              const author = c.user.user_id === list.response.user.user_id ? { color: '#E0C354' } : {}
              const color = c.user.level === '999' ? '#FF9800' : (c.user.gender === 'M' ? '#7986CB' : '#F06292')
              return (
                <div key={ c.post_id } className="Thread-replyBlock">
                  <div className="Thread-blockHeader">
                    <span className="Thread-blockHeader-floor" style={ author }>#{ (c.i ? c.i : i) + 1 + (page - 1) * 25 }</span>
                    <span style={{ color }}>{ c.user.nickname }</span>
                    <span className="Thread-blockHeader-info">{ moment(c.reply_time * 1000).format('DD/MM/YY HH:mm:ss') }</span>
                    <div className="Thread-blockHeader-quoteButton">
                      <Icon name="reply" onClick={ quote }/>
                    </div>
                  </div>
                  <div ref={ linkContentRef } className="Thread-content" dangerouslySetInnerHTML={{ __html: msg }}/>
                </div>
              )
            }) }
          </div>
          { this.props.app.storyMode && postsToMap.length === 0 ?
            (<div style={{'textAlign': 'center', 'marginTop': '1em'}}><span>{ '呢頁樓主冇留言' } <img alt="" src="https://lihkg.com/assets/faces/normal/dead.gif"/></span></div>) :
            buttons(links, null) }
        </div>
      )
      this.setState({ posts, pages })
      this.props.actions.onSetPageTitle(list.response.title)
    } else {
      this.setState({ error: list.error_message })
    }
    window.scrollTo(0, 0)
  }

  async rateThread(action) {
    const { user } = this.props.app.user
    if (!user) {
      return alert('請先登入')
    }
    try {
      let list
      list = await fetch(`https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/${ action }`, {
        headers: {
          'X-DEVICE': localStorage.getItem('dt'),
          'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
          'X-USER': user.user_id,
        },
      })
      list = await list.json()
      if (!list.success) {
        throw new Error(list.error_message)
      }
      const page = +(this.props.params.page || '1')
      this.reloadPosts(page)
    } catch(e) {
      alert(e.message)
    }
  }

  componentDidMount() {
    const page = +(this.props.params.page || '1')
    this.reloadPosts(page)

    window.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  handleKeyUp = e => {
    if (e.target.nodeName !== 'BODY') {
      return
    }
    const page = +(this.props.params.page || '1')
    if (e.which === 37 && page <= this.state.pages && page > 1) {
      const params = page - 1 === 1 ? '' : `/page/${ page - 1 }`
      browserHistory.push(`/thread/${ this.props.params.id }${ params }`)
    } else if (e.which === 39 && this.state.pages > 1 && page < this.state.pages) {
      browserHistory.push(`/thread/${ this.props.params.id }/page/${ page + 1 }`)
    } else if (e.which === 8) {
      browserHistory.goBack()
    }
  }

  componentWillReceiveProps({ params }) {
    const currentPage = +(this.props.params.page || '1')
    const newPage = +(params.page || '1')
    if (currentPage !== newPage) {
      this.reloadPosts(newPage)
      if (this.props.app.bookmarks[this.props.params.id]) {
        this.updateBookmarkLastRead(newPage)
      }
    }
  }

  render() {
    const linkRef = e => this.editor = e
    const reloadPosts = this.reloadPosts.bind(this)
    const handleModalClose = () => this.setState({ shareText: null })
    return (
      <div>
        { this.state.error ? this.state.error : (
          <div>
            { this.state.posts }
            <Modal basic open={ this.state.shareText !== null } onClose={ handleModalClose }>
              <Modal.Content>
                <Form>
                  <Form.TextArea value={ this.state.shareText } style={{ fontSize: '1.2rem' }}/>
                </Form>
              </Modal.Content>
            </Modal>
            <FloatEditor ref={ linkRef } { ...this.props } threadId={ this.props.params.id } reloadPosts={ reloadPosts } />
          </div>
        ) }
      </div>
    )
  }
}

export default Thread
