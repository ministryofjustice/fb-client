require('@ministryofjustice/module-alias/register-module')(module)

const Client = require('~/fb-client/user/jwt/client')

class UserFileStoreClientError extends Client.prototype.ErrorClass {}

const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

// endpoint urls
const endpoints = {
  fetch: '/service/:serviceSlug/user/:userId/:fingerprint',
  store: '/service/:serviceSlug/user/:userId'
}

/**
 * Creates user filestore client
 * @class
 */
class UserFileStoreClient extends Client {
  /**
   * Initialise user filestore client
   *
   * @param {string} serviceSecret
   * Service secret
   *
   * @param {string} serviceSlug
   * Service slug
   *
   * @param {string} userFileStoreUrl
   * User filestore URL
   *
   * @param {object} [options]
   * Options for instantiating client
   *
   * @param {number} [options.maxSize]
   * Default max size for uploads (bytes)
   *
   * @param {number} [options.expires]
   * Default expiry duration in days for uploads
   * eg. 14
   *
   * @return {object}
   *
   **/
  constructor (serviceSecret, serviceSlug, userFileStoreUrl, encodedPrivateKey) {
    super(serviceSecret, serviceSlug, userFileStoreUrl, UserFileStoreClientError, encodedPrivateKey)

    this.maxSize = 10 * 1024 * 1024 // 10Mb
    this.expires = 28
  }

  /**
   * Get url to download uploaded file from
   *
   * @param {string} userId
   * User ID
   *
   * @param {string} fingerprint
   * File fingerprint
   *
   * @return {string} url
   */
  getFetchUrl (userId, fingerprint) {
    return this.createEndpointUrl(endpoints.fetch, { serviceSlug: this.serviceSlug, userId, fingerprint })
  }

  /**
   * Fetch user file
   *
   * @param {object} args
   * Fetch args
   *
   * @param {string} args.userId
   * User ID
   *
   * @param {string} args.userToken
   * User token
   *
   * @param {string} args.fingerprint
   * File fingerprint
   *
   * @param {object} logger
   * Bunyan logger instance
   *
   * @return {promise<string>}
   * Promise resolving to file
   *
   **/
  async fetch (args, logger) {
    const { userId, userToken, fingerprint } = args
    const url = endpoints.fetch
    const serviceSlug = this.serviceSlug

    const encrypted_user_id_and_token = this.encryptUserIdAndToken(userId, userToken) // eslint-disable-line camelcase

    const context = { serviceSlug, userId, fingerprint }
    const payload = { encrypted_user_id_and_token } // eslint-disable-line camelcase
    const subject = userId

    const json = await this.sendGet({ url, context, payload, subject }, logger)
    const { file } = json
    return Buffer.from(file, 'base64').toString()
  }

  /**
   * Store user file
   *
   * @param {object} args
   * Store args
   *
   * @param {string} args.userId
   * User ID
   *
   * @param {string} args.userToken
   * User token
   *
   * @param {string|buffer} args.file
   * User file
   *
   * @param {object} args.policy
   * Policy to apply to file
   *
   * @param {number} [args.policy.max_size]
   * Maximum file size in bytes
   *
   * @param {string} [args.policy.expires]
   * Maximum file size in bytes
   *
   * @param {array<string>} [args.policy.allowed_types]
   * Allowed mime-types
   *
   * @param {object} logger
   * Bunyan logger instance
   *
   * @return {promise<undefined>}
   *
   **/
  async store (args, logger) {
    const { userId, userToken } = args
    let { file, policy } = args
    const url = endpoints.store
    const serviceSlug = this.serviceSlug

    if (!file.buffer) {
      file = Buffer.from(file)
    }
    file = file.toString('base64')

    policy = Object.assign({}, policy)
    if (!policy.max_size) {
      policy.max_size = this.maxSize
    }
    if (!policy.expires) {
      policy.expires = this.expires
    }
    if (policy.allowed_types && policy.allowed_types.length === 0) {
      delete policy.allowed_types
    }

    const encrypted_user_id_and_token = this.encryptUserIdAndToken(userId, userToken) // eslint-disable-line camelcase

    const context = { serviceSlug, userId }
    const payload = { encrypted_user_id_and_token, file, policy } // eslint-disable-line camelcase
    const subject = userId

    const result = await this.sendPost({ url, context, payload, subject }, logger)
    // useless if no fingerprint returned
    if (!result.fingerprint) {
      this.throwRequestError(500, 'ENOFINGERPRINT')
    }
    return result
  }

  /**
   * Store user file from a file path
   *
   * @param {string} filePath
   * Path to user file
   *
   * @param {object} args
   * Store args
   *
   * @param {string} args.userId
   * User ID
   *
   * @param {string} args.userToken
   * User token
   *
   * @param {object} args.policy
   * Policy to apply to file - see store method for details
   *
   * @param {object} logger
   * Bunyan logger instance
   *
   * @return {promise<undefined>}
   *
   **/
  async storeFromPath (filePath, args, logger) {
    const file = await readFile(filePath)
    args.file = file
    return this.store(args, logger)
  }
}

UserFileStoreClient.offline = function offline () {
  class UserFileStoreClientOffline extends UserFileStoreClient {
    async store (args) {
      const dateObj = new Date()
      const fingerprint = dateObj.getTime()
      const date = fingerprint
      const timestamp = dateObj.toString()
      return {
        fingerprint,
        date,
        timestamp
      }
    }
  }

  return new UserFileStoreClientOffline('SERVICE_SECRET', 'SERVICE_SLUG', 'SUBMITTER_URL')
}

module.exports = UserFileStoreClient
