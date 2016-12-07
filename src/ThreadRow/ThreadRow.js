import React from 'react'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { Dropdown } from 'semantic-ui-react'
import './ThreadRow.css'

class ThreadRow extends React.PureComponent {

  render() {
    const { data } = this.props
    let cateogryRowClassName = 'ThreadRow-row'
    const index = this.props.app.visitedThreads.findIndex(c => c.threadId.toString() === data.thread_id)
    const isVisited = index >= 0
    const replyNumDelta = isVisited ?  data.no_of_reply - 1 - this.props.app.visitedThreads[index].replyNum : null
    if (isVisited) {
      cateogryRowClassName += ' visited'
    }
    const handlePageChange = (e, item) => browserHistory.push(`/thread/${ data.thread_id }/page/${ item.value }`)
    const color = data.user.level === '999' ? '#FF9800' : (data.user.gender === 'M' ? '#7986CB' : '#F06292')
    const cf = (className, cond) => cond ? className : ''
    const highlightLikeDislikeDifference = 5
    const highlightProportion = 2.5
    const highlightThreshold = 100
    const pages = Math.ceil(data.no_of_reply / 25)
    const pagesOptions = new Array(pages).fill().map((_, i) => {
      return { text: `第 ${ i + 1 } 頁`, value: i + 1 }
    })
    return (
      <div className={ cateogryRowClassName } style={{ background: this.props.highlighted ? 'rgba(128, 128, 128, .1)' : 'transparent' }}>
        <small>
          <span style={{ color }}>{ data.user.nickname }</span>
          &emsp;
          <span className={ cf('ThreadRow-row-manyLike', data.like_count - data.dislike_count > highlightLikeDislikeDifference && data.like_count / Math.max(data.dislike_count, 1) > highlightProportion) }>{ data.like_count } 正皮</span>
          &nbsp;
          <span className={ cf('ThreadRow-row-manyDislike', data.dislike_count - data.like_count > highlightLikeDislikeDifference && data.dislike_count / Math.max(data.like_count, 1) > highlightProportion) }>{ data.dislike_count } 負皮</span>
          { ' - ' }
          { moment(data.last_reply_time * 1000).fromNow() }
          { ' - ' }
          <span className={ cf('ThreadRow-row-hotThread', data.no_of_reply > highlightThreshold) }>{ data.no_of_reply - 1 } 回覆</span>
          <span> { isVisited && replyNumDelta > 0 ? `(${replyNumDelta} 新回覆)` : null }</span>
        </small>
        <div className="ThreadRow-row-titleWrapper">
          <div className="ThreadRow-row-title">
            <Link to={ `/thread/${ data.thread_id }`}>{ data.title }</Link>
            {
              this.props.lastRead && this.props.lastRead >= 1 ? (
                <span>
                  <br/>
                  上次睇到 <Link to={ `/thread/${ data.thread_id }/page/${ this.props.lastRead }`}>第 { this.props.lastRead } 頁</Link>
                </span>
              ) : null
            }
          </div>
          <div className="ThreadRow-row-page">
            <Dropdown inline scrolling text={ `${ pages } 頁` } options={ pagesOptions } onChange={ handlePageChange } selectOnBlur={ false }/>
          </div>
        </div>
      </div>
    )
  }
}

export default ThreadRow
