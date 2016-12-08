import storage from './storage'
import * as types from './actions'

const initialStates = {
  user: JSON.parse(storage.getItem('uinf')) || {},
  bookmarks: JSON.parse(storage.getItem('bms')) || {},
  pageTitle: window.document.title,
  darkMode: true,
  officeMode: false,
  splitMode: false,
  categories: [],
  visitedThreads: JSON.parse(storage.getItem('vth')) || [],
  pageActions: [],
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
    case types.UPDATE_BOOKMARK_LIST:
      storage.setItem('bms', JSON.stringify(action.list))
      return {
        ...state,
        bookmarks: action.list,
      }
    case types.TOGGLE_OFFICE_MODE:
      storage.setItem('mtr', !state.officeMode)
      return {
        ...state,
        officeMode: !state.officeMode,
      }
    case types.TOGGLE_DARK_MODE:
      storage.setItem('lui', state.darkMode)
      document.body.style.background = state.darkMode ? '#f0f0f0' : '#1d1d1d'
      return {
        ...state,
        darkMode: !state.darkMode,
      }
    case types.TOGGLE_SPLIT_MODE:
      storage.setItem('spl', !state.splitMode)
      return {
        ...state,
        splitMode: !state.splitMode,
      }
    case types.SET_CATEGORIES:
      return {
        ...state,
        categories: action.categories,
      }
    case types.SET_VISITED_THREAD:
      const visitedThreads = [...state.visitedThreads]
      const index = visitedThreads.findIndex(c => c.threadId === action.threadId)
      if (index < 0) {
        visitedThreads.push({
          threadId: action.threadId,
          replyNum: action.replyNum,
        })
      } else {
        visitedThreads[index].replyNum = action.replyNum
      }
      storage.setItem('vth', JSON.stringify(visitedThreads))
      return {
        ...state,
        visitedThreads,
      }
    case types.DELETE_VISITED_THREAD:
      storage.removeItem('vth')
      return {
        ...state,
        visitedThreads: [],
      }
    case types.UPDATE_ACTION_HELPER:
      return {
        ...state,
        pageActions: action.helper,
      }
    default:
      return state
  }
}

export default { app }
