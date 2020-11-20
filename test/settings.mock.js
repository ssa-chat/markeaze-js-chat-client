export default {
  chat_settings: {
    appearance: {
      agent_avatar: true,
      agent_post: true,
      agent_sound_path: 'https://themes.markeaze.com/default/livechat/sounds/new_message',
      client_sound_path: 'https://themes.markeaze.com/default/livechat/sounds/diversity',
      enabled: true,
      markeaze_link: true,
      title_bg: '#FC6881',
      title_text: 'Leave your message',
      welcome_message: 'Hello there! How can I help you today?',
      theme: 'markeaze',
      bar_padding_x: '20',
      bar_padding_y: '20',
      bar_position: 'r-b',
      bar_text_offline: 'Leave message',
      bar_text_online: 'We\'re here. Let\'s chat!',
      bar_type: 'bubble',
      notice_text: ''
    },
    behavior: {
      attachment_cta: {
        product: {
          callback: "(function(offer){console.log('Callback',offer);})",
          callback_label_text: 'added_to_cart',
          handler: "(function(offer, callback){console.log('Add to cart',offer);callback();})",
          label_text: 'add_to_cart'
        }
      }
    }
  },
  locale: 'en'
}
