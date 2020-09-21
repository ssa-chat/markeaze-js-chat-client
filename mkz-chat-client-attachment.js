const FileAttach = require('./src/javascripts/fileAttach').default

const app = {

  // Plugin interface

  version: '1.0.0',
  store: {}, // Store from the main app
  libs: {}, // Libraries from the main app
  create () {
    const chatPlugin = this.getPlugin('chat')
    if (!chatPlugin || !chatPlugin.app.config) return

    const chatApp = chatPlugin.app

    this.fileAttach = new FileAttach(
      chatApp.view,
      chatApp.config.s3,
      chatApp.pusherAttachmentMsg.bind(chatApp),
      chatApp.helpers,
      chatApp.libs.domEvent,
      chatApp.icons
    )
  },
  destroy () {
    if (!this.fileAttach)
    this.fileAttach.remove()
  },

  // / Plugin interface

  getPlugin (name) {
    const plugin = this.store.plugins[name]
    return plugin && plugin.created && plugin
  }

}

mkz('initPlugin', 'chatAttachment',  app)
