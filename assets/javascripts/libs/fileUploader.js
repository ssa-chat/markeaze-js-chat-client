const AWS = require('./awsSdkS3').default

export default class FileUploader {

  constructor (options) {
    this.canceled = false

    const defaultOptions = {
      apiVersion: '2006-03-01',
      handleUploadedFileKey () {
        const getUid = (len) => {
          const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
          const uuid = []
          const radix = chars.length
          for (let i = 0; i < len; i++) uuid.push(chars[Math.floor(radix * Math.random())])
          return uuid.join('')
        }
        const format = (v) => {
          return v < 10 ? `0${v}` : v
        }
        const region = options.region
        const appKey = options.appKey
        const uuid = getUid(8)
        const date = new Date()
        const year = date.getFullYear()
        const month = format(date.getMonth() + 1)
        return `${region}/${year}/${month}/${appKey}/${uuid}/`
      }
    }
    this.options = { ...defaultOptions, ...options }

    AWS.config.update({
      region: this.options.bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.options.identityPoolId
      })
    })

    this.s3 = new AWS.S3({
      apiVersion: this.options.apiVersion,
      params: { Bucket: this.options.albumBucketName }
    })
  }

  cancel () {
    this.canceled = true
  }

  upload (file) {
    const fileKey = this.options.handleUploadedFileKey()
    const fileName = this.sanitizeFileName(file.name)
    const Key = `${fileKey}${fileName}`
    return new Promise((resolve, reject) => {
      if (this.canceled) return reject()
      this.s3.upload(
        {
          Key,
          Body: file,
          ACL: 'public-read'
        },
        (err, data) => {
          if (this.canceled) return reject()
          if (err) reject(err.message)
          else {
            const url = this.options.dnsHost ? `https://${this.options.dnsHost}/${data.Key}` : data.Location
            resolve(url)
          }
        }
      )
    })
  }

  sanitizeFileName (name) {
    return name.replace(/[^а-яa-z0-9_,.{}()\[\]-]/gi, '_').toLowerCase()
  }

}
