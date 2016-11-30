import React from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { Dropdown, Icon } from 'semantic-ui-react'
import FloatEditor from '../FloatEditor/FloatEditor'
import map from './emotions'
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
  	html = html.replace(/<br(.*?)>\n<br(.*?)>/gi, '<br/><br/>')
  	html = html.replace(/\/>\s<br(.*?)>/gi, '/>\n')
  	html = html.replace(/<br(.*?)>/gi, '\n')
  	html = html.replace(/(\S)\n/gi, '$1')

  	// color & size
    html = html.replace(/<span(.*?)(black|red|green|blue|purple|violet|brown|pink|orange|gold|maroon|teal|navy|limegreen)(.*?)>(.*?)<\/span>/gmi, '[$2]$4[/$2]')
    html = html.replace(/<span(.*?)x-small(.*?)>(.*?)<\/span>/gmi, '[size=1]$3[/size=1]')
    html = html.replace(/<span(.*?)small(.*?)>(.*?)<\/span>/gmi, '[size=2]$3[/size=2]')
    html = html.replace(/<span(.*?)medium(.*?)>(.*?)<\/span>/gmi, '[size=3]$3[/size=3]')
    html = html.replace(/<span(.*?)large(.*?)>(.*?)<\/span>/gmi, '[size=4]$3[/size=4]')
    html = html.replace(/<span(.*?)x-large(.*?)>(.*?)<\/span>/gmi, '[size=5]$3[/size=5]')
    html = html.replace(/<span(.*?)xx-large(.*?)>(.*?)<\/span>/gmi, '[size=6]$3[/size=6]')

    // quote
    const quoteRegex = /<blockquote>(.*?)<\/blockquote>/gmi
    /* eslint no-cond-assign: 0 */
    while (match = quoteRegex.exec(html)) {
      html = html.replace(quoteRegex, '[quote]$1[/quote]')
    }

    // format
    html = html.replace(/<strong>(.*?)<\/strong>/gmi, '[b]$1[/b]')
    html = html.replace(/<em>(.*?)<\/em>/gmi, '[i]$1[/i]')
    html = html.replace(/<del>(.*?)<\/del>/gmi, '[s]$1[/s]')
    html = html.replace(/<ins>(.*?)<\/ins>/gmi, '[u]$1[/u]')

    // align
    html = html.replace(/<div(.*?)left(.*?)>(.*?)<\/div>/gmi, '[left]$3[/left]')
    html = html.replace(/<div(.*?)center(.*?)>(.*?)<\/div>/gmi, '[center]$3[/center]')
    html = html.replace(/<div(.*?)right(.*?)>(.*?)<\/div>/gmi, '[right]$3[/right]')

    // list
  	html = html.replace(/<ul(.*?)>/gi, '[list]')
  	html = html.replace(/<li>(.*?)\n/gi, '[*]$1\n')
  	html = html.replace(/<\/ul>/gi, '[/list]')

    // img & url
  	html = html.replace(/<img(.*?)src="(.*?)"(.*?)>/gi, '[img]$2[/img]')
  	html = html.replace(/<a(.*?)>(.*?)<\/a>/gi, '[url]$2[/url]')

  	// icons
  	const iconsRegex = /\[img\].*?assets\/faces(.*?)\[\/img\]/
    while (match = iconsRegex.exec(html)) {
      const url = match[1]
      html = html.replace(iconsRegex, map[url])
    }

  	return html
  }

  async reloadPosts(page) {
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
      const prevPage = page <= pages && page > 1 ? <Link to={`/thread/${ this.props.params.id }/page/${ page - 1 }`} className="Thread-buttons-btn">上頁</Link> : null
      const nextPage = pages > 1 && page < pages ? <Link to={`/thread/${ this.props.params.id }/page/${ page + 1 }`} className="Thread-buttons-btn">下頁</Link> : null
      const reload = () => location.reload(true)
      const pagesOptions = new Array(pages).fill().map((_, i) => {
        return { text: `第 ${ i + 1 } 頁`, value: i + 1 }
      })
      const handlePageChange = (e, item) => browserHistory.push(`/thread/${ this.props.params.id }/page/${ item.value }`)
      const posts = (
        <div className="Thread-main">
          <h2>
            <Link to={`/category/${ list.response.cat_id }`}>‹ 返回</Link>
            <span>{ list.response.title }</span>
            <Dropdown className="Thread-choosePage" inline text="㨂頁數" options={ pagesOptions } onChange={ handlePageChange }/>
          </h2>
          { list.response.item_data.map((c, i) => {
            let msg = c.msg.replace(/\/assets/g, 'https://lihkg.com/assets').replace(/><br\s?\/>/g, '>')
            const quote = () => this.editor.updateContent(`[quote]${ this.htmlToBBCode(c.msg) }[/quote]\n`)
            return (
              <div key={ c.post_id } className="Thread-replyBlock">
                <div className="Thread-blockHeader">
                  <span className="Thread-blockHeader-floor">#{ i + (page - 1) * 25 }</span>
                  <span style={{ color: c.user.gender === 'M' ? '#7986CB' : '#F06292' }}>{ c.user.nickname }</span>
                  <span className="Thread-blockHeader-info">{ moment(c.reply_time * 1000).fromNow() }</span>
                  <div className="Thread-blockHeader-quoteButton">
                    <Icon name="reply" onClick={ quote } />
                  </div>
                </div>
                <div className="Thread-content" dangerouslySetInnerHTML={{ __html: msg }}/>
              </div>
            )
          }) }
          <div className="Thread-buttons">
            { prevPage }
            <div className="Thread-buttons-btn" onClick={ reload }>F5</div>
            { nextPage }
          </div>
        </div>
      )
      this.setState({ posts, pages })
      this.props.actions.onSetPageTitle(list.response.title)
    } else {
      this.setState({ error: list.error_message })
    }
    window.scrollTo(0, 0)
  }

  componentDidMount() {
    const page = +(this.props.params.page || '1')
    this.reloadPosts(page)

    window.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
  }

  handleKeyUp(e) {
    if (e.target.nodeName !== 'BODY') {
      return
    }
    const page = +(this.props.params.page || '1')
    if (e.which === 37 && page <= this.state.pages && page > 1) {
      const params = page - 1 === 1 ? '' : `/page/${ page - 1 }`
      browserHistory.push(`/thread/${ this.props.params.id }${ params }`)
    } else if (e.which === 39 && this.state.pages > 1 && page < this.state.pages) {
      browserHistory.push(`/thread/${ this.props.params.id }/page/${ page + 1 }`)
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
