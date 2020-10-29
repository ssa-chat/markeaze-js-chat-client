export default {
  version: '1.0.0',
  plugins: {
    chat: {
      url: 'https://cdn.jsdelivr.net/gh/markeaze/markeaze-js-chat-client@latest/dist/mkz-chat-client.js',
      settings: {}
    },
    chatAttachment: {
      url: 'https://cdn.jsdelivr.net/gh/markeaze/markeaze-js-chat-client@latest/dist/mkz-chat-client-attachment.js',
      enabled: true
    }
  },
  trackerName: 'markeaze-js',
  debugMode: false,
  trackEnabled: true,
  appKey: 'xxxxxxxxxxxxxxx@test',
  visitor: {},
  uid: 'yyyyyyy',
  assets: {},
  cookieUid: '_mkz_dvc_uid',
  region: 'test',
  trackerEndpoint: 'example.net',
  trackerUrl: null,
  pingerUrl: null,
  chatEndpoint: 'example.net',
  chatUrl: null,
  airbrakeProject: 123,
  airbrakeApiKey: 'xxxxxx',
  webFormPreview: null
}
