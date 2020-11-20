const translations = require('./translations')

export class Translate {
  protected locale: string = null

  constructor (locale: string) {
    this.locale = locale
  }

  public t (key: string, properties: any = {}): string {
    const text = translations[this.locale][key]
    if (!text) return key
    return text.replace(new RegExp('(%{.*?})', 'gi'), (matched) => {
      const key = matched.replace('%{', '').replace('}', '')
      return properties[key] || ''
    })
  }
}
