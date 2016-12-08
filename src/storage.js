function getStorage() {
  let storageImpl
  try {
    localStorage.setItem('_', '')
    localStorage.removeItem('_')
    storageImpl = localStorage
  } catch (e) {
    storageImpl = new MemoryStorage()
  }
  return storageImpl
}

function MemoryStorage() {
  const structureLocalStorage = {}
  this.setItem = (key, value) => structureLocalStorage[key] = value
  this.getItem = key => {
    if (typeof structureLocalStorage[key] !== 'undefined') {
      return structureLocalStorage[key]
    }
    return null
  }
  this.removeItem = key => delete structureLocalStorage[key]
}

export default getStorage()
