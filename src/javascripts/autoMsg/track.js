module.exports = {
  trackShow (msg) {
    const customFields = msg.custom_fields
    mkz('trackAutoMessageShow', {
      auto_message_uid: customFields.uid,
      show_once: customFields.show_once
    })
  },
  trackReply (msg) {
    const customFields = msg.custom_fields
    mkz('trackAutoMessageReply', {
      auto_message_uid: customFields.uid,
      reply_text: customFields.text,
      reply_once: customFields.reply_once
    })
  }
}
