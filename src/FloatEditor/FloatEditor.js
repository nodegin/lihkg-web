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
    }, () => this.textarea.focus())
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
    const openDropdown = (dropdown, e) => {
      e.preventDefault()
      if (this.refs[dropdown]) {
        this.refs[dropdown].open()
      }
    }
    const insertAtCursor = (left, right = null) => {
      const { selectionStart, selectionEnd } = this.textarea
      const selected = this.state.content.slice(selectionStart, selectionEnd)
      let insert = left
      if (right !== null) {
        insert = left + selected + right
      }
      const content = this.state.content.slice(0, selectionStart) + insert + this.state.content.slice(selectionEnd)
      this.setState({ content }, () => {
        this.textarea.selectionStart = this.textarea.selectionEnd = selectionStart + left.length + (!right ? 0 : selected.length)
        this.textarea.focus()
      })
    }
    const iconTray = (
      <div className="FloatEditor-quickReply-editor-iconTray">{
        Object.keys(map).map(k => {
          const addIcon = () => insertAtCursor(map[k] + ' ')
          return <img key={ k } alt="" src={ `https://lihkg.com/assets/faces${ k }` } onClick={ addIcon }/>
        })
      }</div>
    )
    const formatOptions = [
      { text: '圖片', value: 'img', icon: 'image' },
      { text: '網址', value: 'url', icon: 'linkify' },
      { text: '置左', value: 'left', icon: 'align left' },
      { text: '置中', value: 'center', icon: 'align center' },
      { text: '置右', value: 'right', icon: 'align right' },
      { text: 'Size 1', value: 'size=1', className: 'FloatEditor-text-size-1' },
      { text: 'Size 2', value: 'size=2', className: 'FloatEditor-text-size-2' },
      { text: 'Size 3', value: 'size=3', className: 'FloatEditor-text-size-3' },
      { text: 'Size 4', value: 'size=4', className: 'FloatEditor-text-size-4' },
      { text: 'Size 5', value: 'size=5', className: 'FloatEditor-text-size-5' },
      { text: 'Size 6', value: 'size=6', className: 'FloatEditor-text-size-6' },
      { text: '粗體', value: 'b', icon: 'bold' },
      { text: '刪除', value: 's', icon: 'strikethrough' },
      { text: '斜體', value: 'i', icon: 'italic' },
      { text: '底線', value: 'u', icon: 'underline' },
    ]
    const colorFormatOptions = [
      { text: '紅色', value: 'red', className: 'FloatEditor-text-red'},
      { text: '綠色', value: 'green', className: 'FloatEditor-text-green'},
      { text: '藍色', value: 'blue', className: 'FloatEditor-text-blue'},
      { text: '紫色', value: 'purple', className: 'FloatEditor-text-purple'},
      { text: '紫紅色', value: 'violet', className: 'FloatEditor-text-violet'},
      { text: '棕色', value: 'brown', className: 'FloatEditor-text-brown'},
      { text: '粉色', value: 'pink', className: 'FloatEditor-text-pink'},
      { text: '橙色', value: 'orange', className: 'FloatEditor-text-orange'},
      { text: '金色', value: 'gold', className: 'FloatEditor-text-gold'},
      { text: '深紅色', value: 'maroon', className: 'FloatEditor-text-maroon'},
      { text: '淺藍色', value: 'teal', className: 'FloatEditor-text-teal'},
      { text: '深藍色', value: 'navy', className: 'FloatEditor-text-navy'},
      { text: '淺綠色', value: 'limegreen', className: 'FloatEditor-text-limegreen'},
    ]
    const setFormat = (e, item) => {
      preventDefault(e)
      const left = `[${ item.value }]`
      const right = `[/${ item.value }]`
      insertAtCursor(left, right)
    }
    const buttons = (
      <Form.Field className="FloatEditor-quickReply-editor-buttons">
        <Button compact onClick={ openDropdown.bind(null, 'colorDropdownSelect') }>
          <Dropdown ref="colorDropdownSelect" fluid scrolling options={ colorFormatOptions } text="顏色" onClick={ preventDefault } onChange={ setFormat } selectOnBlur={ false }/>
        </Button>
        <Button compact onClick={ openDropdown.bind(null, 'textDropdownSelect') }>
          <Dropdown ref="textDropdownSelect" fluid scrolling options={ formatOptions } text="格式" onClick={ preventDefault } onChange={ setFormat } selectOnBlur={ false }/>
        </Button>
        <Button compact onClick={ toggleIcons }><img alt="icon" src="https://lihkg.com/assets/faces/normal/smile.gif"/></Button>
        <Button compact>回覆</Button>
      </Form.Field>
    )
    const linkTextareaRef = e => this.textarea = ReactDOM.findDOMNode(e)
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
                  <TextArea ref={ linkTextareaRef } name="content" placeholder="輸入回覆內文" value={ this.state.content } onChange={ handleContentChange }/>
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
                  <TextArea ref={ linkTextareaRef } name="content" placeholder="輸入貼文內文" value={ this.state.content } onChange={ handleContentChange }/>
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
