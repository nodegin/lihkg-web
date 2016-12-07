import 'isomorphic-fetch'
import 'array.prototype.fill'
import 'array.prototype.find'
import 'array.prototype.filter'
import 'string.prototype.repeat'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, IndexRedirect, Route, browserHistory } from 'react-router'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

import App from './App/App'
import Bookmark from './Bookmark/Bookmark'
import Category from './Category/Category'
import Search from './Search/Search'
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
        <Route path="/thread/:id" component={ Category }/>
        <Route path="/thread/:id/page/:page" component={ Category }/>
        <Route path="/search" component={ Search }/>
        <Route path="/bookmark" component={ Bookmark }/>
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
