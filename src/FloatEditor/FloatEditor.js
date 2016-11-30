import React from 'react'
import { browserHistory } from 'react-router'

import { Icon, Form, Button } from 'semantic-ui-react'
import './FloatEditor.css'

class FloatEditor extends React.PureComponent {
  state = {
    replying: false,
    title: '',
    content: '',
  }

  handleChange(field, e) {
    this.setState({ [field]: e.target.value })
  }

  updateContent(content) {
    this.setState({
      replying: true,
      content,
    })
  }

  async handleSubmit(e) {
    e.preventDefault()
    let result
    if (this.props.threadId) {
      // Reply
      result = await fetch('https://lihkg.na.cx/mirror/thread/reply', {
        method: 'POST',
        headers: {
          'X-DEVICE': localStorage.getItem('dt'),
          'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
          'X-USER': this.props.app.user.user.user_id,
        },
        body: JSON.stringify({
          content: this.state.content,
          thread_id: this.props.threadId,
        }),
      })
      result = await result.json()
      if (result.success) {
        this.setState({ replying: false, title: '', content: '' })
        this.props.reloadPosts(result.response.total_page)
        browserHistory.replace(`/thread/${ this.props.threadId }/page/${ result.response.total_page }`)
      } else {
        alert(result.error_message)
      }
    } else {
      // New thread
      result = await fetch('https://lihkg.na.cx/mirror/thread/create', {
        method: 'POST',
        headers: {
          'X-DEVICE': localStorage.getItem('dt'),
          'X-DIGEST': 'ffffffffffffffffffffffffffffffffffffffff',
          'X-USER': this.props.app.user.user.user_id,
        },
        body: JSON.stringify({
          title: this.state.title,
          content: this.state.content,
          cat_id: this.props.catId,
        }),
      })
      result = await result.json()
      if (result.success) {
        this.setState({ replying: false, title: '', content: '' })
        browserHistory.replace(`/thread/${ result.response.thread_id }`)
      } else {
        alert(result.error_message)
      }
    }
  }

  render() {
    const toggleReplying = () => this.setState({ replying: !this.state.replying })
    const handleTitleChange = this.handleChange.bind(this, 'title')
    const handleContentChange = this.handleChange.bind(this, 'content')
    const handleSubmit = this.handleSubmit.bind(this)

    if (this.props.app.user.user) {
      if (this.props.threadId) {
        // Reply
        return (
          <div className="FloatEditor-quickReply">
            <div className="FloatEditor-quickReply-toggle" onClick={ toggleReplying }>
              <Icon name={ this.state.replying ? 'minus' : 'reply' } size="large"/>
            </div>
            <div className="FloatEditor-quickReply-editor" style={{ marginBottom: this.state.replying ? 0 : '-110%' }}>
              <Form className="FloatEditor-quickReply-editorInner" onSubmit={ handleSubmit }>
                <Form.Field>
                  <Form.TextArea name="content" placeholder="輸入回覆內文" value={ this.state.content } onChange={ handleContentChange }/>
                </Form.Field>
                <Form.Field style={{ textAlign: 'right' }}>
                  <Button compact>回覆</Button>
                </Form.Field>
              </Form>
            </div>
          </div>
        )
      } else {
        // New topic
        return (
          <div className="FloatEditor-quickReply">
            <div className="FloatEditor-quickReply-toggle" onClick={ toggleReplying }>
              <Icon name={ this.state.replying ? 'minus' : 'plus' } size="large"/>
            </div>
            <div className="FloatEditor-quickReply-editor" style={{ marginBottom: this.state.replying ? 0 : '-110%' }}>
              <Form className="FloatEditor-quickReply-editorInner" onSubmit={ handleSubmit }>
                <Form.Field>
                  <Form.Input name="title" placeholder="輸入貼文標題" value={ this.state.title } onChange={ handleTitleChange }/>
                </Form.Field>
                <Form.Field>
                  <Form.TextArea name="content" placeholder="輸入貼文內文" value={ this.state.content } onChange={ handleContentChange }/>
                </Form.Field>
                <Form.Field style={{ textAlign: 'right' }}>
                  <Button compact>貼文</Button>
                </Form.Field>
              </Form>
            </div>
          </div>
        )
      }
    }
    return null
  }

}

export default FloatEditor
