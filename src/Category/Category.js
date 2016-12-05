import React from 'react'

import FloatEditor from '../FloatEditor/FloatEditor'
import ThreadRow from '../ThreadRow/ThreadRow'
import './Category.css'

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
      let threads = list.response.items.map(c => <ThreadRow key={ `${ c.thread_id }|${ c.last_reply_time }` } data={ c } { ...this.props }/>)
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
