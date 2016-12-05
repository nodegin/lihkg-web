export const SET_USER = 'SET_USER'
export const onSetUser = user => ({
  type: SET_USER,
  user,
})

export const SET_PAGE_TITLE = 'SET_PAGE_TITLE'
export const onSetPageTitle = title => ({
  type: SET_PAGE_TITLE,
  title,
})

export const UPDATE_BOOKMARK_LIST = 'UPDATE_BOOKMARK_LIST'
export const onUpdateBookmarkList = list => ({
  type: UPDATE_BOOKMARK_LIST,
  list,
})

export const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
export const onToggleDarkMode = () => ({
  type: TOGGLE_DARK_MODE,
})

export const TOGGLE_OFFICE_MODE = 'TOGGLE_OFFICE_MODE'
export const onToggleOfficeMode = () => ({
  type: TOGGLE_OFFICE_MODE,
})

export const SET_STORY_MODE_USER_ID = 'SET_STORY_MODE_USER_ID'
export const setStoryModeUserId = userId => ({
  type: SET_STORY_MODE_USER_ID,
  userId,
})

export const DELETE_STORY_MODE_USER_ID = 'DELETE_STORY_MODE_USER_ID'
export const deleteStoryModeUserId = () => ({
  type: DELETE_STORY_MODE_USER_ID,
  DELETE_STORY_MODE_USER_ID
})

export const SET_CATEGORIES = 'SET_CATEGORIES'
export const onSetCategories = categories => ({
  type: SET_CATEGORIES,
  categories,
})

export const SET_VISITED_THREAD = 'SET_VISITED_THREAD'
export const onSetVisitedThread = threadId => ({
  type: SET_VISITED_THREAD,
  threadId,
})

export const DELETE_VISITED_THREAD = 'DELETE_VISITED_THREAD'
export const onDeleteVisitedThread = () => ({
  type: DELETE_VISITED_THREAD
})
