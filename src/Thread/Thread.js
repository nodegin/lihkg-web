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
    data: null,
    error: null,
    shareText: null,
    authorFilter: null,
  }

  reset() {
    this.setState({ data: null })
  }

  parseMessages(messages) {
    while (messages.indexOf('src="/assets') > 0) {
      messages = messages.replace('src="/assets', 'src="https://lihkg.com/assets')
    }
    messages = messages.replace(/><br\s?\/>/g, '>')
    const dom = document.createElement('div')
    const qsa = selector => {
      const nodeList = dom.querySelectorAll(selector)
      const array = []
      for (let i = 0; i < nodeList.length; i++) {
        array[i] = nodeList[i]
      }
      return array
    }
    dom.innerHTML = messages

    //  Remove quotes
    const quotes = qsa('blockquote' + ' > blockquote'.repeat(5 - 1))
    quotes.forEach(r => r.parentNode.removeChild(r))
    //  Remove icons
    if (this.props.app.officeMode) {
      const icons = qsa('img[src^="https://lihkg.com/assets"]')
      icons.forEach(i => {
        const code = i.src.split('faces')[1]
        i.outerHTML = map[code]
      })
    }
    //  Add link to image
    if (!this.props.app.officeMode) {
      const images = qsa('img:not(.hkgmoji)')
      images.forEach(i => {
        const anchor = document.createElement('a')
        anchor.target = '_blank'
        anchor.href = i.src
        i.parentNode.replaceChild(anchor, i)
        anchor.appendChild(i)
      })
    }

    return dom.innerHTML.split('<hr>')
  }

  async bookmark(page) {
    const { user } = this.props.app.user
    if (!user) {
      return alert('請先登入')
    }
    try {
      let list, url, isBookmark = true
      if (this.props.app.bookmarks[this.props.params.id]) {
        url = `https://lihkg.na.cx/mirror/thread/${ this.props.params.id }/unbookmark`
        isBookmark = false
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
      if (isBookmark) {
        this.updateBookmarkLastRead(page)
      }
      this.reloadPosts(this.props.params.id, page, false)
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
    } catch(e) {
      alert(e.message)
    }
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
      this.reloadPosts(this.props.params.id, this.props.params.page)
    } catch(e) {
      alert(e.message)
    }
  }

  async reloadPosts(thread, page, scrollTop = true) {
    if (!this.props.app.categories.length) {
      return setTimeout(this.reloadPosts.bind(this, thread, page), 250)
    }
    let list
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ thread }/page/${ page }`)
      list = await list.json()
    } catch(e) {
      location.reload(true)
    }
    if (list.success) {
      this.props.actions.onSetPageTitle(list.response.title)
      this.setState({ data: list.response }, () => {
        if (scrollTop) {
          window.scrollTo(0, 0)
        }
        if (this.props.shouldLoadThreads) {
          this.props.loadThreads(list.response.cat_id, 1)
        }
      })
    } else {
      this.setState({ error: list.error_message })
    }
  }

  componentDidMount() {
    this.reloadPosts(this.props.params.id, this.props.params.page)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  componentWillReceiveProps({ params, pane }) {
    const paneReload = this.props.pane !== pane && pane === 'thread'
    if (this.props.params.id !== params.id || this.props.params.page !== params.page || paneReload) {
      this.reloadPosts(params.id, params.page)
      if (this.props.app.bookmarks[params.id]) {
        this.updateBookmarkLastRead(params.page)
      }
    }
  }

  handleKeyUp = e => {
    if (e.target.nodeName !== 'BODY' || !this.state.data) {
      return
    }
    const pages = Math.ceil(this.state.data.no_of_reply / 25)
    const page = +(this.props.params.page || '1')
    if (e.which === 37 && page <= pages && page > 1) {
      const params = page - 1 === 1 ? '' : `/page/${ page - 1 }`
      browserHistory.push(`/thread/${ this.props.params.id }${ params }`)
    } else if (e.which === 39 && pages > 1 && page < pages) {
      browserHistory.push(`/thread/${ this.props.params.id }/page/${ page + 1 }`)
    } else if (e.which === 8) {
      browserHistory.goBack()
    }
  }

  render() {
    const { authorFilter, data, error, shareText } = this.state
    if (!data) {
      return null
    }
    const linkEditorRef = e => this.editor = e
    const reloadPosts = this.reloadPosts.bind(this, this.props.params.id)
    const handleModalClose = () => this.setState({ shareText: null })
    //  Threads
    const page = +data.page
    const pages = Math.ceil(data.no_of_reply / 25)
    const emptyBtn = <b className="Thread-buttons-btnSpace"/>
    const prevPage = page <= pages && page > 1 ? <Link to={`/thread/${ this.props.params.id }/page/${ page - 1 }`} className="Thread-buttons-btn">上頁</Link> : emptyBtn
    const nextPage = pages > 1 && page < pages ? <Link to={`/thread/${ this.props.params.id }/page/${ page + 1 }`} className="Thread-buttons-btn">下頁</Link> : emptyBtn
    const bookmark = this.bookmark.bind(this, page)
    const category = this.props.app.categories.find(c => c.cat_id === data.cat_id)
    const handlePageChange = (e, item) => browserHistory.push(`/thread/${ this.props.params.id }/page/${ item.value }`)
    const openShareModal = () => {
      this.setState({ shareText: `${ data.title } - LIHKG Web\n\nhttps://lihkg.na.cx/thread/${ this.props.params.id }/page/${ page }` })
    }
    const links = position => (
      <div className="Thread-links">
        <div className="Thread-links-channel">
          <Link to={`/category/${ data.cat_id }`}>‹ { category.name }</Link>
          { data.cat_id === '1' ? null : <Link to="/category/1" style={{ marginLeft: 8 }}>(吹水台)</Link> }
        </div>
        <b className="Thread-spaceFill"/>
        <div className="Thread-actions">
          <Icon name="star" size="large" onClick={ bookmark } style={ this.props.app.bookmarks[this.props.params.id] ? { color: '#FBC02D' } : {} }/>
          <Icon name="share alternate" size="large" onClick={ openShareModal }/>
        </div>
        <Dropdown inline scrolling text={ `第 ${ page } 頁` } pointing={ position } options={
          new Array(pages).fill().map((_, i) => {
            return { text: `第 ${ i + 1 } 頁`, value: i + 1 }
          })
        } onChange={ handlePageChange } value={ page } selectOnBlur={ false }/>
      </div>
    )
    const linkContentRef = e => {
      if (!e || !this.props.app.officeMode) {
        return
      }
      const images = e.querySelectorAll('img')
      images.forEach(i => {
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
        icon.onclick = () => icon.innerHTML = `<img alt src="${ i.src }">`
        i.parentNode.replaceChild(icon, i)
      })
    }
    const setAuthorFilter = authorFilter => this.setState({ authorFilter })
    const exitStoryMode = e => {
      e.preventDefault()
      setAuthorFilter(null)
    }
    const reload = () => this.reloadPosts(this.props.params.id, this.props.params.page, false)
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
    let posts = data.item_data
    if (authorFilter) {
      posts = posts.filter((c, i) => {
        c.i = i
        return c.user.user_id === authorFilter.id
      })
    }
    const messages = this.parseMessages(posts.map(c => c.msg).join('<hr>'))
    posts = posts.map((c, i) => {
      const quote = () => this.editor.updateContent(`[quote]${ htmlToBBCode(c.msg) }[/quote]\n`)
      const msg = messages[i]
      const author = c.user.user_id === data.user.user_id ? { color: '#E0C354' } : {}
      const color = c.user.level === '999' ? '#FF9800' : (c.user.gender === 'M' ? '#7986CB' : '#F06292')
      const toggleStoryMode = () => {
        if (authorFilter && authorFilter.id === c.user.user_id) {
          setAuthorFilter(null)
        } else {
          setAuthorFilter({
            id: c.user.user_id,
            name: c.user.nickname,
          })
        }
      }
      const floor = (c.i || i) + 1 + (page - 1) * 25
      return (
        <div key={ c.post_id } className="Thread-replyBlock">
          <div className="Thread-blockHeader">
            <span className="Thread-blockHeader-floor" style={ author }>#{ floor }</span>
            <span style={{ color }}>{ c.user.nickname }</span>
            <span className="Thread-blockHeader-info">{ moment(c.reply_time * 1000).format('DD/MM/YY HH:mm:ss') }</span>
            <div className="Thread-blockHeader-quoteButton">
              <Icon style={{ marginRight: '1rem' }} name={ authorFilter && authorFilter.id === c.user.user_id ? 'hide' : 'unhide' } onClick={ toggleStoryMode }/>
              <Icon name="reply" onClick={ quote }/>
            </div>
          </div>
          <div ref={ linkContentRef } className="Thread-content" dangerouslySetInnerHTML={{ __html: msg }}/>
        </div>
      )
    })
    const likeThis = this.rateThread.bind(this, 'like')
    const dislikeThis = this.rateThread.bind(this, 'dislike')
    const buttonsTop = buttons(null, links('top'))
    const buttonsBottom = buttons(links('bottom'), null)

    return (
      <div>
        { error ? error : (
          <div>
            <div>
              <h2 className="Thread-header">
                <div className="Thread-header-rate" style={{ color: '#7CB342' }} onClick={ likeThis }>
                  <Icon name="thumbs up"/>
                  { data.like_count }
                </div>
                <div className="Thread-header-center">
                { data.title }
                </div>
                <div className="Thread-header-rate" style={{ color: '#EF5350' }} onClick={ dislikeThis }>
                  <Icon name="thumbs down"/>
                  { data.dislike_count }
                </div>
              </h2>
              { buttonsTop }
              <div>
                { posts }
                { authorFilter && posts.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: '4em' }}>
                    <span>
                      <b>{ authorFilter.name }</b>
                      { ` 冇喺呢一頁 (第 ${ page } 頁) 留過言` }
                      <br/>
                      <a href="#" onClick={ exitStoryMode } style={{ display: 'inline-block', marginTop: '2em' }}>顯示所有回覆</a>
                    </span>
                  </div>
                ) : buttonsBottom }
              </div>
            </div>
            <Modal basic open={ shareText !== null } onClose={ handleModalClose }>
              <Modal.Content>
                <Form>
                  <Form.TextArea value={ shareText } style={{ fontSize: '1.2rem' }}/>
                </Form>
              </Modal.Content>
            </Modal>
            <FloatEditor ref={ linkEditorRef } { ...this.props } threadId={ this.props.params.id } reloadPosts={ reloadPosts } />
          </div>
        ) }
      </div>
    )
  }
}

export default Thread
