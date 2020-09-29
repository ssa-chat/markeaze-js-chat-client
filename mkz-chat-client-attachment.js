const FileAttach = require('./src/javascripts/fileAttach').default

const app = {

  // Plugin interface

  version: '1.0.0',
  store: {}, // Store from the main app
  libs: {}, // Libraries from the main app
  create () {
    const chatPlugin = this.getPlugin('chat')
    if (!chatPlugin || !chatPlugin.app || !chatPlugin.app.config) return

    const chatApp = chatPlugin.app

    if (this.libs.notifierInstance) {
      this.notifier = this.libs.notifierInstance(
        chatApp.version,
        chatApp.config.airbrake.project,
        chatApp.config.airbrake.apiKey,
        process.env.NODE_ENV
      )
    } else {
      this.notifier = this.libs.notifier
    }

    this.notifier.call(() => {
      this.fileAttach = new FileAttach(
        chatApp.view,
        chatApp.config.s3,
        chatApp.pusherAttachmentMsg.bind(chatApp),
        chatApp.helpers,
        chatApp.libs.domEvent,
        chatApp.icons
      )
    })
  },
  destroy () {
    if (!this.fileAttach) return

    this.fileAttach.remove()
  },

  // / Plugin interface

  getPlugin (name) {
    const plugin = this.store.plugins[name]
    return plugin && plugin.created && plugin
  }

}

mkz('initPlugin', 'chatAttachment',  app)
