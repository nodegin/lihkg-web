import React from 'react'
import { Link } from 'react-router'
import moment from 'moment'

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
    page: 1,
    error: null,
  }

  async loadThreads(page) {
    let url
    if (this.props.params.id === '2') {
      url = 'hot?'    // 熱門
    } else if (this.props.params.id === '3') {
      url = 'latest?' // 最新
    } else {
      url = `category?cat_id=${ this.props.params.id }&`
    }
    let list
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ url }page=${ this.state.page }&count=50`)
      list = await list.json()
    } catch(e) {
      this.loadThreads(page)
      return
    }
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
        return (
          <div key={ `${ c.thread_id }|${ c.last_reply_time }` } className="Category-row">
            <small>
              <span style={{ color: c.user.gender === 'M' ? '#7986CB' : '#F06292' }}>{ c.user.nickname }</span>
              &emsp;{ c.like_count } 正皮 { c.dislike_count } 負皮 - { moment(c.last_reply_time * 1000).fromNow() } - { c.no_of_reply - 1 } 回覆
            </small>
            <Link to={ `/thread/${ c.thread_id }` }>{ c.title }</Link>
          </div>
        )
      })
      threads = [ ...this.state.threads, ...threads ]
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
        page: this.state.page + 1,
      }, () => {
        window.scrollTo(0, scrollY)
      })
      this.props.actions.onSetPageTitle(list.response.category.name)
    } else {
      this.setState({ error: list.error_message })
    }
  }

  componentDidMount() {
    this.loadThreads(1)
  }

  render() {
    const loadMore = this.loadThreads.bind(this, this.state.page + 1)
    return (
      <div className="Category-main">
        { this.state.error || (
          <div>
            <h2>{ this.state.category }</h2>
            { this.state.threads }
            { this.state.threads.length < 1 ? null : <div className="Category-more" onClick={ loadMore }>
              <span>蘇咪摩牙 <img alt="more" src="https://lihkg.com/assets/faces/normal/tongue.gif"/></span>
            </div> }
            <FloatEditor { ...this.props } catId={ this.props.params.id } />
          </div>
        ) }
      </div>
    )
  }
}

export default Category
