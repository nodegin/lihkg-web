import React from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { Dropdown, Icon } from 'semantic-ui-react'
import FloatEditor from '../FloatEditor/FloatEditor'
import map from '../FloatEditor/emotions'
import './Thread.css'

class Thread extends React.PureComponent {
  state = {
    posts: [],
    pages: 1,
    error: null,
  }

  /*  https://gist.github.com/soyuka/6183947  */
  htmlToBBCode(html) {
    let match
    // extra lines
    html = html.replace(/<br(.*?)>/gi, '');
    html = html.replace(/\n/g, '[br]');

    // quote & format
    html = html.replace(/<blockquote>/gi, '[quote]');
    html = html.replace(/<\/blockquote>/gi, '[/quote]');
    html = html.replace(/<strong>/gi, '[b]');
    html = html.replace(/<\/strong>/gi, '[/b]');
    html = html.replace(/<em>/gi, '[i]');
    html = html.replace(/<\/em>/gi, '[/i]');
    html = html.replace(/<del>/gi, '[s]');
    html = html.replace(/<\/del>/gi, '[/s]');
    html = html.replace(/<ins>/gi, '[u]');
    html = html.replace(/<\/ins>/gi, '[/u]');

    // list
    html = html.replace(/<ul(.*?)>/gi, '[list]');
    html = html.replace(/<li>(.*?)\n/gi, '[*]$1\n');
    html = html.replace(/<\/ul>/gi, '[/list]');

    // img & url
    html = html.replace(/<img(.*?)src="(.*?)"(.*?)>/gi, '[img]$2[/img]');
    html = html.replace(/<a(.*?)>(.*?)<\/a>/gi, '[url]$2[/url]');

    // icons
    const iconsRegex = /\[img\].*?assets\/faces(.*?)\[\/img\]/
    /* eslint no-cond-assign: 0 */
    while (match = iconsRegex.exec(html)) {
      const url = match[1]
      html = html.replace(iconsRegex, map[url])
    }

    // color, font size
    const sizes = {
      'x-small': 1,
      'small': 2,
      'medium': 3,
      'large': 4,
      'x-large': 5,
      'xx-large': 6,
    }
    const msg = document.createElement('div')
    msg.innerHTML = html
    let elem
    while(elem = msg.querySelector('span')) {
      const color = elem.style.color
      const fontSize = elem.style.fontSize
      if (color) {
        elem.outerHTML = `[${ color }]` + elem.innerHTML + `[/${ color }]`
      } else if (fontSize) {
        let size = 'size=' + sizes[fontSize]
        elem.outerHTML = `[${ size }]` + elem.innerHTML + `[/${ size }]`
      }
    }

    // align
    while(elem = msg.querySelector('div')) {
      const align = elem.style.textAlign
      if (align) {
        elem.outerHTML = `[${ align }]` + elem.innerHTML + `[/${ align }]`
      }
    }

    html = msg.innerHTML.replace(/\[br\]/g, '\n')
    return html
  }

  async reloadPosts(page) {
    if (!this.props.app.categories.length) {
      return setTimeout(this.reloadPosts.bind(this, page), 100)
    }

    let list
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ this.props.params.id }/page/${ page }`)
      list = await list.json()
    } catch(e) {
      location.reload(true)
    }
    /*
      cat_id: "1"
      create_time: 1480156729
      dislike_count: "0"
      item_data: [{
        msg: "⼀"
        page: "1"
        post_id: "bdc85bd64eecf2b1d9222f9315d93655fdef4f66"
        reply_time: 1480156729
        status: "1"
        thread_id: "3960"
        user: Object
      }]
      last_reply_time: 1480156882
      like_count: "0"
      no_of_reply: "35"
      page: "1"
      thread_id: "3960"
      title: "輕鬆十連"
      total_page: 2
      user: {
        create_time: 1480085407
        gender: "F"
        is_blocked: false
        is_following: false
        level: "10"
        level_name: "普通會員"
        nickname: "9413"
        status: "1"
        user_id: "4623"
      }
    */
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
      const buttons = (
        <div className="Thread-buttons">
          <div className="Thread-leftAbs">
            <div><Link to={`/category/${ list.response.cat_id }`}>‹ { category.name }</Link></div>
            <div className="Thread-fixed-bw-link" hidden={ list.response.cat_id==="1" }><Link to="/category/1">(吹水台)</Link></div>
          </div>
          <b className="Thread-spaceFill"/>
          { prevPage }
          <div className="Thread-buttons-btn" onClick={ reload }>F5</div>
          { nextPage }
          <b className="Thread-spaceFill"/>
          <div className="Thread-rightAbs">
            <Dropdown inline scrolling text="㨂頁數" options={ pagesOptions } onChange={ handlePageChange } value={page}/>
          </div>
        </div>
      )
      const likeThis = this.rateThread.bind(this, 'like')
      const dislikeThis = this.rateThread.bind(this, 'dislike')
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
          { buttons }
          { list.response.item_data.map((c, i) => {
            let msg = c.msg.replace(/src="\/assets/g, 'src="https://lihkg.com/assets').replace(/><br\s?\/>/g, '>')
            const quote = () => this.editor.updateContent(`[quote]${ this.htmlToBBCode(c.msg) }[/quote]\n`)
            const removeDepth = document.createElement('div')
            removeDepth.innerHTML = msg
            const result = removeDepth.querySelector('blockquote' + ' > blockquote'.repeat(5 - 1))
            if (result) {
              result.parentNode.removeChild(result)
            }
            return (
              <div key={ c.post_id } className="Thread-replyBlock">
                <div className="Thread-blockHeader">
                  <span className="Thread-blockHeader-floor">#{ i + (page - 1) * 25 }</span>
                  <span style={{ color: c.user.gender === 'M' ? '#7986CB' : '#F06292' }}>{ c.user.nickname }</span>
                  <span className="Thread-blockHeader-info">{ moment(c.reply_time * 1000).format('DD/MM/YY hh:mm:ss') }</span>
                  <div className="Thread-blockHeader-quoteButton">
                    <Icon name="reply" onClick={ quote } />
                  </div>
                </div>
                <div className="Thread-content" dangerouslySetInnerHTML={{ __html: removeDepth.innerHTML }}/>
              </div>
            )
          }) }
          { buttons }
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
    }
  }

  render() {
    const linkRef = e => this.editor = e
    const reloadPosts = this.reloadPosts.bind(this)
    return (
      <div>
        { this.state.error ? this.state.error : (
          <div>
            { this.state.posts }
            <FloatEditor ref={ linkRef } { ...this.props } threadId={ this.props.params.id } reloadPosts={ reloadPosts } />
          </div>
        ) }
      </div>
    )
  }
}

export default Thread
