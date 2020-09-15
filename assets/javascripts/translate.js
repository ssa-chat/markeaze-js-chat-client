const translations = require('./translations')

export default class Translate {
  constructor (locale) {
    this.locale = locale
  }
  t (key, properties = {}) {
    const text = translations[this.locale][key]
    if (!text) return key
    return text.replace(new RegExp('(%{.*?})', 'gi'), (matched) => {
      const key = matched.replace('%{', '').replace('}', '')
      return properties[key] || ''
    })
  }
}
