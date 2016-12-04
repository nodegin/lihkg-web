import * as types from './actions'

const initialStates = {
  user: {},
  pageTitle: window.document.title,
  darkMode: true,
  officeMode: false,
  categories: [],
  visitedThreads: JSON.parse(localStorage.getItem('visitedThreads')) || [],
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
    case types.TOGGLE_OFFICE_MODE:
      localStorage.setItem('mtr', !state.officeMode)
      return {
        ...state,
        officeMode: !state.officeMode,
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
    case types.SET_VISITED_THREAD:
      // Check if the threadId already exisits in visitedThreads
      if (state.visitedThreads.indexOf(action.threadId) < 0) {
        state.visitedThreads.push(action.threadId)
      }
      localStorage.setItem('visitedThreads', JSON.stringify(state.visitedThreads))
      return {
        ...state,
        visitedThreads: state.visitedThreads,
      }
    case types.DELETE_VISITED_THREAD:
      localStorage.removeItem('visitedThreads')
      return {
        ...state,
        visitedThreads: [],
      }
    default:
      return state
  }
}

export default { app }
