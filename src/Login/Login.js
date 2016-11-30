import React from 'react'
import { browserHistory } from 'react-router'

import { Form, Input, Button } from 'semantic-ui-react'
import './Login.css'

class Login extends React.PureComponent {
  state = {
    email: '',
    password: '',
  }

  componentDidMount() {
    this.props.actions.onSetPageTitle('登入 LIHKG')
  }

  handleChange(field, e) {
    this.setState({ [field]: e.target.value })
  }

  async handleLogin(e) {
    e.preventDefault()
    let result
    result = await fetch('https://lihkg.na.cx/mirror/auth/login', {
      method: 'POST',
      headers: {
        'X-DEVICE': localStorage.getItem('dt'),
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      }),
    })
    result = await result.json()
    if (result.success) {
      localStorage.setItem('uinf', JSON.stringify(result.response))
      this.props.actions.onSetUser(result.response)
      browserHistory.replace('/')
    } else {
      alert(result.error_message)
    }
  }

  render() {
    const handleEmailChange = this.handleChange.bind(this, 'email')
    const handlePasswordChange = this.handleChange.bind(this, 'password')
    const handleSubmit = this.handleLogin.bind(this)
    return (
      <div className="Login-flexCenter">
        <div>
          <img className="Login-logo" alt="logo" src="https://x.lihkg.com/assets/img/logo2.png"/>
          <br/>
          <h2>登入您的 LIHKG 帳號</h2>
          <br/>
          <Form onSubmit={ handleSubmit }>
            <Form.Field>
              <Input type="text" placeholder="電郵地址" name="email" value={ this.state.email } onChange={ handleEmailChange }/>
            </Form.Field>
            <Form.Field>
              <Input type="password" placeholder="密碼" name="password" value={ this.state.password } onChange={ handlePasswordChange }/>
            </Form.Field>
            <Form.Field>
              <br/>
              <Button inverted color="blue">Login</Button>
            </Form.Field>
          </Form>
        </div>
      </div>
    )
  }
}

export default Login
