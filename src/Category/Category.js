import React from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { Dropdown } from 'semantic-ui-react'
import FloatEditor from '../FloatEditor/FloatEditor'
import './Category.css'

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s:  '1s',
    ss: '%ss',
    m:  '1m',
    mm: '%dm',
    h:  '1h',
    hh: '%dh',
    d:  '1d',
    dd: '%dd',
    M:  '1m',
    MM: '%dM',
    y:  '1y',
    yy: '%dY'
  }
})

class Category extends React.PureComponent {
  state = {
    category: '',
    threads: [],
    page: 0,
    error: null,
    bwAll: true,
    loadingMessage: '蘇咪摩牙',
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
      /*
        cat_id: "16"
        create_time: 1480129583
        dislike_count: "18"
        is_bookmarked: false
        is_hot: false
        last_reply_time: 1480155548
        last_reply_user_id: "828"
        like_count: "32"
        no_of_reply: "49"
        status: "1"
        thread_id: "2865"
        title: "自從轉左會，身體都健康左"
        total_page: 2
        user: {
          create_time: 1480079457
          gender: "M"
          is_blocked: false
          is_following: false
          level: "10"
          level_name: "普通會員"
          nickname: "10000米"
          status: "1"
          user_id: "115"
        }
        user_gender: "M"
        user_nickname: "10000米"
      */
      let threads = list.response.items.map(c => {
        const pages = Math.ceil(c.no_of_reply / 25)
        const pagesOptions = new Array(pages).fill().map((_, i) => {
          return { text: `第 ${ i + 1 } 頁`, value: i + 1 }
        })
        const handlePageChange = (e, item) => browserHistory.push(`/thread/${ c.thread_id }/page/${ item.value }`)
        const color = c.user.level === '999' ? '#FF9800' : (c.user.gender === 'M' ? '#7986CB' : '#F06292')
        const cf = (className, cond) => cond ? className : ''
        const highlightLikeDislikeDifference = 5
        const highlightProportion = 2.5
        const highlightThreshold = 100
        let cateogryRowClassName = 'Category-row'
        if (this.isThreadVisited(c.thread_id)) {
          cateogryRowClassName += ' visited'
        }
        return (
          <div key={ `${ c.thread_id }|${ c.last_reply_time }` } className={ cateogryRowClassName }>
            <small>
              <span style={{ color }}>{ c.user.nickname }</span>
              &emsp;
              <span className={ cf('Category-row-manyLike', c.like_count - c.dislike_count > highlightLikeDislikeDifference && c.like_count / Math.max(c.dislike_count, 1) > highlightProportion) }>{ c.like_count } 正皮</span>
              &nbsp;
              <span className={ cf('Category-row-manyDislike', c.dislike_count - c.like_count > highlightLikeDislikeDifference && c.dislike_count / Math.max(c.like_count, 1) > highlightProportion) }>{ c.dislike_count } 負皮</span>
              { ' - ' }
              { moment(c.last_reply_time * 1000).fromNow() }
              { ' - ' }
              <span className={ cf('Category-row-hotThread', c.no_of_reply > highlightThreshold) }>{ c.no_of_reply - 1 } 回覆</span>
            </small>
            <div className="Category-row-titleWrapper">
              <div className="Category-row-title" onClick={ () => this.props.actions.onSetVisitedThread(c.thread_id) }>
                <Link to={ `/thread/${ c.thread_id }`}>{ c.title }</Link>
              </div>
              <div className="Category-row-page">
                <Dropdown inline scrolling text={ `${ pages } 頁` } options={ pagesOptions } onChange={ handlePageChange } selectOnBlur={ false }/>
              </div>
            </div>
          </div>
        )
      })
      if (page !== 1) {
        threads = [ ...this.state.threads, ...threads ]
      }
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

      const scrollY = window.scrollY
      this.setState({
        threads,
        category: list.response.category.name,
        page,
      }, () => {
        window.scrollTo(0, scrollY)
      })
      this.props.actions.onSetPageTitle(list.response.category.name)
      this.setState({ loadingMessage: '蘇咪摩牙' })
    } else {
      this.setState({
        error: list.error_message,
        loadingMessage: '冇得撈啦',
      })
    }
  }

  isThreadVisited(threadId) {
    return this.props.app.visitedThreads.indexOf(threadId) >= 0
  }

  componentDidMount() {
    this.loadThreads(this.props.params.id, 1)
  }

  componentWillReceiveProps({ params }) {
    if (this.props.params.id !== params.id) {
      this.loadThreads(params.id, 1)
    }
  }

  render() {
    const loadMore = this.loadThreads.bind(this, this.props.params.id, this.state.page + 1)
    const toggleBwMode = e => {
      e.preventDefault()
      this.setState({ bwAll: !this.state.bwAll }, () => {
        this.loadThreads(this.props.params.id, 1)
      })
    }
    let titleExtra = null
    if (this.props.params.id === '1') {
      titleExtra = <a href="#" onClick={ toggleBwMode }>{ ` (${ this.state.bwAll ? '只顯示吹水台文章' : '顯示所有台的文章' })` }</a>
    }
    return (
      <div className="Category-main">
        { (
          <div>
            <h2>{ this.state.category }{ titleExtra }</h2>
            { this.state.threads }
            <br/>
            { this.state.threads.length < 1 ? null : <div className="Category-more" onClick={ loadMore }>
              <span>
                { this.state.loadingMessage }
                &emsp;
                <img alt="more" src={ `https://lihkg.com/assets/faces/normal/${ this.state.loadingMessage.startsWith('冇') ? 'dead' : 'tongue' }.gif` }/>
              </span>
            </div> }
            <FloatEditor { ...this.props } catId={ this.props.params.id } />
          </div>
        ) }
      </div>
    )
  }
}

export default Category
