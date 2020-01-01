require('@ministryofjustice/module-alias/register-module')(module)

const Client = require('~/fb-client/user/jwt/client')

class EmailClientError extends Client.prototype.ErrorClass {}

/**
 * Creates email client
 * @class
 */
class EmailClient extends Client {
  /**
   * Initialise email client
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
   * @param {string} emailUrl
   * Email endpoint URL
   *
   * @return {object}
   *
   **/
  constructor (serviceSecret, serviceToken, serviceSlug, emailUrl) {
    super(serviceSecret, serviceToken, serviceSlug, emailUrl, EmailClientError)
  }

  /**
   * Post to email API
   *
   * @param {object} message
   * Email data
   *
   * @param {object} [sendOptions]
   * Email send options
   *
   * @param {object} [logger]
   * Bunyan logger instance
   *
   * @return {promise<undefined>}
   *
   **/
  async sendMessage (message, sendOptions, logger) {
    const url = '/email'

    const payload = {
      message
    }
    payload.service_slug = this.serviceSlug

    return this.sendPost({
      url,
      payload,
      sendOptions
    }, logger)
  }
}

module.exports = EmailClient
