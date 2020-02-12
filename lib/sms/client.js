require('@ministryofjustice/module-alias/register-module')(module)

const Client = require('~/fb-client/user/jwt/client')

class SmsClientError extends Client.prototype.ErrorClass {}

/**
 * Creates SMS client
 * @class
 */
class SmsClient extends Client {
  /**
   * Initialise SMS client
   *
   * @param {string} serviceSecret
   * Service secret
   *
   * @param {string} serviceSlug
   * Service slug
   *
   * @param {string} smsUrl
   * Email endpoint URL
   *
   * @return {object}
   *
   **/
  constructor (serviceSecret, serviceSlug, smsUrl) {
    super(serviceSecret, serviceSlug, smsUrl, SmsClientError)
  }

  /**
   * Post to sms API
   *
   * @param {object} message
   * SMS data
   *
   * @param {object} [sendOptions]
   * SMS send options
   *
   * @param {object} [logger]
   * Bunyan logger instance
   *
   * @return {promise<undefined>}
   *
   **/
  async sendMessage (message, sendOptions, logger) {
    const url = '/sms'

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

module.exports = SmsClient
