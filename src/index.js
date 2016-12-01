import 'isomorphic-fetch'
import 'array.prototype.fill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, IndexRedirect, Route, browserHistory } from 'react-router'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

import App from './App/App'
import Category from './Category/Category'
import Thread from './Thread/Thread'
import Login from './Login/Login'
import Logout from './Logout/Logout'
import NotFound from './NotFound/NotFound'

import reducers from './reducers'
import './index.css'

const store = createStore(combineReducers(reducers))

browserHistory.listen(location => {
  window.ga('set', 'page', location.pathname + location.search)
  window.ga('send', 'pageview')
})

ReactDOM.render(
  <Provider store={ store }>
    <Router history={ browserHistory }>
      <Route path="/" component={ App }>
        <IndexRedirect to="/category/1"/>
        <Route path="/category/:id" component={ Category }/>
        <Route path="/thread/:id" component={ Thread }/>
        <Route path="/thread/:id/page/:page" component={ Thread }/>
        <Route path="/auth">
          <Route path="login" component={ Login }/>
          <Route path="logout" component={ Logout }/>
        </Route>
        <Route path="*" component={ NotFound }/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
