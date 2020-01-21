require('@ministryofjustice/module-alias/register-module')(module)

const Client = require('~/fb-client/user/jwt/client')

class UserDataStoreClientError extends Client.prototype.ErrorClass {}

// endpoint urls
const endpointUrlTemplate = '/service/:serviceSlug/user/:userId'
const endpoints = {
  getData: endpointUrlTemplate,
  setData: endpointUrlTemplate
}

/**
 * Creates user datastore client
 * @class
 */
class UserDataStoreClient extends Client {
  /**
   * Initialise user datastore client
   *
   * @param {string} serviceSecret
   * Service secret
   *
   * @param {string} serviceToken
   * Service token
   *
   * @param {string} serviceSlug
   * Service slug
   *
   * @param {string} userDataStoreUrl
   * User datastore URL
   *
   * @param {string} encodedPrivateKey
   * Base64 encoded string of RSA private key
   *
   * @return {object}
   *
   **/
  constructor (serviceSecret, serviceToken, serviceSlug, userDataStoreUrl, encodedPrivateKey) {
    super(
      serviceSecret,
      serviceToken,
      serviceSlug,
      userDataStoreUrl,
      UserDataStoreClientError,
      {encodedPrivateKey})
  }

  /**
   * Fetch user data
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
   * @param {object} logger
   * Bunyan logger instance
   *
   * @return {promise<object>}
   * Promise resolving to object containing unencrypted user data
   *
   **/
  async getData (args, logger) {
    const {userId, userToken} = args
    const url = endpoints.getData
    const serviceSlug = this.serviceSlug

    const json = await this.sendGet({
      url,
      context: {serviceSlug, userId}
    }, logger)

    const {payload} = json

    return this.decrypt(userToken, payload)
  }

  /**
   * Store user data
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
   * @param {object} args.payload
   * User data
   *
   * @param {object} logger
   * Bunyan logger instance
   *
   * @return {promise<undefined>}
   *
   **/
  async setData (args, logger) {
    const {userId, userToken, payload} = args
    const url = endpoints.setData
    const serviceSlug = this.serviceSlug

    const encryptedPayload = this.encrypt(userToken, payload)

    await this.sendPost({
      url,
      context: {serviceSlug, userId},
      payload: {payload: encryptedPayload},
      subject: userId
    }, logger)
  }
}

module.exports = UserDataStoreClient
