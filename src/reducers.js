import * as types from './actions'

const initialStates = {
  user: {},
  pageTitle: window.document.title,
  darkMode: true,
  categories: [],
}

const app = (state = initialStates, action = {}) => {
  switch (action.type) {
    case types.SET_USER:
      return {
        ...state,
        user: action.user,
      }
    case types.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.title,
      }
    case types.TOGGLE_DARK_MODE:
      localStorage.setItem('lui', state.darkMode)
      return {
        ...state,
        darkMode: !state.darkMode,
      }
    case types.SET_CATEGORIES:
      return {
        ...state,
        categories: action.categories,
      }
    default:
      return state
  }
}

export default { app }
