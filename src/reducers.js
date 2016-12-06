import * as types from './actions'

const initialStates = {
  user: JSON.parse(localStorage.getItem('uinf')) || {},
  bookmarks: JSON.parse(localStorage.getItem('bms')) || {},
  pageTitle: window.document.title,
  darkMode: true,
  officeMode: false,
  storyMode: false,
  dockMenu: false,
  categories: [],
  visitedThreads: JSON.parse(localStorage.getItem('vts')) || [],
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
      localStorage.setItem('bms', JSON.stringify(action.list))
      return {
        ...state,
        bookmarks: action.list,
      }
    case types.TOGGLE_OFFICE_MODE:
      localStorage.setItem('mtr', !state.officeMode)
      return {
        ...state,
        officeMode: !state.officeMode,
      }
    case types.TOGGLE_DARK_MODE:
      localStorage.setItem('lui', state.darkMode)
      document.body.style.background = state.darkMode ? '#f9f9f9' : '#1d1d1d'
      return {
        ...state,
        darkMode: !state.darkMode,
      }
    case types.TOGGLE_STORY_MODE:
      localStorage.setItem('sm', !state.storyMode)
      return {
        ...state,
        storyMode: !state.storyMode,
      }
    case types.TOGGLE_DOCK_MENU:
        localStorage.setItem('dm', !state.dockMenu)
        return {
            ...state,
            dockMenu: !state.dockMenu,
        }
    case types.SET_CATEGORIES:
      return {
        ...state,
        categories: action.categories,
      }
    case types.SET_VISITED_THREAD:
      const visitedThreads = [...state.visitedThreads]
      if (visitedThreads.indexOf(action.threadId) < 0) {
        visitedThreads.push(action.threadId)
      }
      localStorage.setItem('vts', JSON.stringify(visitedThreads))
      return {
        ...state,
        visitedThreads,
      }
    case types.DELETE_VISITED_THREAD:
      localStorage.removeItem('vts')
      return {
        ...state,
        visitedThreads: [],
      }
    default:
      return state
  }
}

export default { app }
