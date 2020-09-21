export default {
  s3: {
    albumBucketName: 'markeaze-chat-uploads',
    bucketRegion: 'us-east-1',
    identityPoolId: 'us-east-1:60f90615-2526-467f-8d3c-cdfb52f3fd77',
    dnsHost: 'attachments.markeaze.com',
    uploadFileSizeLimitMb: 10,
    accept: [
      'jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'tiff', 'doc', 'docx',
      'xls', 'xlsx', 'psd', 'eml', 'xml', 'csv', 'mp4', 'avi', 'txt', 'pdf'
    ]
  },
  airbrake: {
    project: 254408,
    apiKey: '84e2f7b3f257c5fffb9edf2d951f2054'
  }
}
