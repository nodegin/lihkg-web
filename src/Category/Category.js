import React from 'react'
import ReactDOM from 'react-dom'

import FloatEditor from '../FloatEditor/FloatEditor'
import ThreadRow from '../ThreadRow/ThreadRow'
import Thread from '../Thread/Thread'
import './Category.css'

class Category extends React.PureComponent {
  state = {
    pane: 'category',
    threadId: -1,
    threadPage: 1,
    category: {},
    threads: [],
    page: 0,
    error: null,
    bwAll: true,
    loadingMessage: '蘇咪摩牙',
  }

  constructor(props) {
    super(props)
    this.linkCategoryRef = e => this.categoryList = ReactDOM.findDOMNode(e)
    this.loadThreads = this.loadThreads.bind(this)
    let lastF5 = 0
    this.reloadThreads = e => {
      e.preventDefault()
      if ((Date.now() - lastF5) / 1000 < 3) {
        return alert('您的 F5 速度太快了吧...')
      }
      this.loadThreads(this.state.category.cat_id, this.state.page)
      lastF5 = Date.now()
    }
    this.postThread = e => {
      e.preventDefault()
      this.refs.editor.toggle()
    }
    this.loadMore = () => this.loadThreads(this.state.category.cat_id, this.state.page + 1)
    this.toggleBwMode = e => {
      e.preventDefault()
      this.setState({ bwAll: !this.state.bwAll }, () => {
        this.loadThreads(this.state.category.cat_id, 1)
      })
    }
  }

  async loadThreads(catId, page) {
    this.setState({ loadingMessage: '撈緊，等陣' })
    let url
    if (catId === '1' && this.state.bwAll) {
      url = 'latest?' // 吹水台 (全部)
    } else if (catId === '2') {
      url = 'hot?'    // 熱門
    } else if (catId === '3') {
      url = 'news?' // 最新
    } else {
      url = `category?cat_id=${ catId }&`
    }
    let list
    list = await fetch(`https://lihkg.com/api_v1/thread/${ url }page=${ page }&count=50`)
    list = await list.json()
    if (list.success) {
      let threads = list.response.items
      if (page !== 1) {
        threads = [ ...this.state.threads, ...threads ]
      }
      const shouldScrollTop = catId !== this.state.category.cat_id
      this.props.actions.onSetPageTitle(list.response.category.name)
      this.setState({
        threads,
        category: list.response.category,
        page,
        loadingMessage: '蘇咪摩牙',
      }, () => {
        if (shouldScrollTop) {
          this.categoryList.scrollTop = 0
        }
      })
    } else {
      this.setState({
        error: list.error_message,
        loadingMessage: '冇得撈啦',
      })
    }
  }

  componentDidMount() {
    const pane = this.props.location.pathname.split('/')[1]
    if (pane === 'thread') {
      const threadId = +this.props.params.id
      const threadPage = +(this.props.params.page || '1')
      this.setState({ threadId, threadPage })
    } else {
      this.loadThreads(this.props.params.id, 1)
    }
    this.setState({ pane })
    this.props.actions.onUpdateActionHelper([
      { id: 'open-drawer', text: '打開選單', callback: () => document.querySelector('#menu').click() },
      { id: 'new-topic', text: '新主題', callback: () => this.refs.editor.toggle() },
    ])
  }

  componentWillUnmount() {
    //  Empty after <Thread/> unmount
    setTimeout(() => {
      this.props.actions.onUpdateActionHelper([])
    }, 0)
  }

  componentWillReceiveProps({ location, params }) {
    const pane = location.pathname.split('/')[1]
    if (pane === 'thread') {
      const threadId = +params.id
      const threadPage = +(params.page || '1')
      this.setState({ threadId, threadPage })
    } else {
      if (this.props.params.id !== params.id) {
        if (this.refs.threadPane) {
          this.refs.threadPane.reset()
        }
        this.setState({ threadId: -1 })
      }
      if (this.state.category.cat_id !== params.id) {
        this.loadThreads(params.id, 1)
        window.scrollTo(0, 0)
      }
    }
    this.setState({ pane })
  }

  render() {
    let titleExtra = null
    if (this.state.category.cat_id === '1') {
      titleExtra = <small><a href="#" onClick={ this.toggleBwMode }>{ ` (${ this.state.bwAll ? '只顯示吹水台文章' : '顯示所有台的文章' })` }</a></small>
    }
    let threads = this.state.threads
    threads = threads.map(c => {
      return <ThreadRow key={ `${ c.thread_id }|${ c.last_reply_time }` } data={ c } { ...this.props } highlighted={ +c.thread_id === this.state.threadId }/>
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

    return (
      <div className={ 'Category-splited ' + this.state.pane + (this.props.app.splitMode ? ' split' : '') }>
        <FloatEditor ref="editor" { ...this.props } catId={ this.state.category.cat_id } />
        <div ref={ this.linkCategoryRef } className="Category-main">
          <h2>{ this.state.category.name }{ titleExtra }</h2>
          <div className="Category-main-actions">
            <a href="#" onClick={ this.reloadThreads }>F5</a>
            <a href="#" onClick={ this.postThread }>發文</a>
          </div>
          { threads }
          <br/>
          { threads.length < 1 ? null : <div className="Category-more" onClick={ this.loadMore }>
            <span>
              { this.state.loadingMessage }
              &emsp;
              <img alt="more" src={ `https://lihkg.com/assets/faces/normal/${ this.state.loadingMessage.startsWith('冇') ? 'dead' : 'tongue' }.gif` }/>
            </span>
          </div> }
        </div>
        <div className="Category-thread">
          {
            this.state.threadId !== -1 ? (
              <Thread
                { ...this.props }
                ref="threadPane"
                params={{ id: this.state.threadId, page: this.state.threadPage }}
                pane={ this.state.pane }
                shouldLoadThreads={ !this.state.threads.length }
                loadThreads={ this.loadThreads }
                newTopicEditor={ this.refs.editor }/>
            ) : (
              <div className="Category-thread-nothing">冇嘢喺度 :)</div>
            )
          }
        </div>
      </div>
    )
  }
}

export default Category
