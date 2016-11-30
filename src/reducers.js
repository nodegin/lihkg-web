import * as types from './actions'

export const initialStates = {
  user: {},
  pageTitle: 'LIHKG 討論區 Web',
  darkMode: true,
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
    default:
      return state
  }
}

export default { app }
