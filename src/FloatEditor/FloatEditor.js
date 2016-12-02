import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory } from 'react-router'

import { Icon, Form, Button, Dropdown, TextArea } from 'semantic-ui-react'
import map from './emotions'
import './FloatEditor.css'

class FloatEditor extends React.PureComponent {
  state = {
    replying: false,
    showIcons: false,
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
    const preventDefault = e => e.preventDefault()
    const toggleIcons = e => {
      preventDefault(e)
      this.setState({ showIcons: !this.state.showIcons })
    }
    const iconTray = (
      <div className="FloatEditor-quickReply-editor-iconTray">{
        Object.keys(map).map(k => {
          const addIcon = () => this.setState({ content: this.state.content + map[k] + ' ' })
          return <img key={ k } alt="" src={ `https://lihkg.com/assets/faces${ k }` } onClick={ addIcon }/>
        })
      }</div>
    )
    const formatOptions = [
      { text: '置左', value: 'left' },
      { text: '置中', value: 'center' },
      { text: '置右', value: 'right' },
      { text: 'Size 1', value: 'size=1' },
      { text: 'Size 2', value: 'size=2' },
      { text: 'Size 3', value: 'size=3' },
      { text: 'Size 4', value: 'size=4' },
      { text: 'Size 5', value: 'size=5' },
      { text: 'Size 6', value: 'size=6' },
    ]
    let textarea
    const setFormat = (e, item) => {
      preventDefault(e)
      const node = ReactDOM.findDOMNode(textarea)
      const { selectionStart, selectionEnd } = node
      const selected = this.state.content.slice(selectionStart, selectionEnd)
      const insert = `[${ item.value }]${ selected }[/${ item.value }]`
      const content = this.state.content.slice(0, selectionStart) + insert + this.state.content.slice(selectionEnd)
      this.setState({ content }, () => {
        node.selectionStart = node.selectionEnd = selectionStart + `[${ item.value }]`.length + selected.length
        node.focus()
      })
    }
    const buttons = (
      <Form.Field className="FloatEditor-quickReply-editor-buttons">
        <Button compact onClick={ preventDefault }>
          <Dropdown fluid scrolling options={ formatOptions } text="格式" onClick={ preventDefault } onChange={ setFormat }/>
        </Button>
        <Button compact onClick={ toggleIcons }><img alt="" src="https://lihkg.com/assets/faces/normal/smile.gif"/></Button>
        <Button compact>回覆</Button>
      </Form.Field>
    )
    const linkRef = e => textarea = e
    if (this.props.app.user.user) {
      const editorStyle = { marginBottom: this.state.replying ? 0 : -400, pointerEvents: this.state.replying ? 'auto' : 'none' }
      if (this.props.threadId) {
        // Reply
        return (
          <div className="FloatEditor-quickReply">
            <div className="FloatEditor-quickReply-toggle" onClick={ toggleReplying }>
              <Icon name={ this.state.replying ? 'minus' : 'reply' } size="large"/>
            </div>
            <div className="FloatEditor-quickReply-editor" style={ editorStyle }>
              <Form className="FloatEditor-quickReply-editorInner" onSubmit={ handleSubmit }>
                { buttons }
                <Form.Field className="FloatEditor-quickReply-editor-main">
                  <TextArea ref={ linkRef } name="content" placeholder="輸入回覆內文" value={ this.state.content } onChange={ handleContentChange }/>
                  { this.state.showIcons ? iconTray : null }
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
            <div className="FloatEditor-quickReply-editor" style={ editorStyle }>
              <Form className="FloatEditor-quickReply-editorInner" onSubmit={ handleSubmit }>
                { buttons }
                <Form.Field>
                  <Form.Input name="title" placeholder="輸入貼文標題" value={ this.state.title } onChange={ handleTitleChange }/>
                </Form.Field>
                <Form.Field className="FloatEditor-quickReply-editor-main">
                  <TextArea ref={ linkRef } name="content" placeholder="輸入貼文內文" value={ this.state.content } onChange={ handleContentChange }/>
                  { this.state.showIcons ? iconTray : null }
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
