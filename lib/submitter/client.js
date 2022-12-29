require('@ministryofjustice/module-alias/register-module')(module)
const crypto = require('crypto')

const Client = require('~/fb-client/user/jwt/client')

class SubmitterClientError extends Client.prototype.ErrorClass {}

// endpoint urls
const endpoints = {
  submit: '/submission',
  getStatus: '/submission/:submissionId'
}

class SubmitterClient extends Client {
  constructor (serviceSecret, serviceSlug, submitterUrl, encodedPrivateKey, submissionEncryptionKey) {
    super(serviceSecret, serviceSlug, submitterUrl, SubmitterClientError, encodedPrivateKey)
    this.submissionEncryptionKey = submissionEncryptionKey
  }

  async getStatus (submissionId, logger) {
    const url = endpoints.getStatus

    return this.sendGet({
      url,
      context: { submissionId }
    }, logger)
  }

  async submit (submission, userId, userToken, logger) {
    const url = endpoints.submit

    /* eslint-disable camelcase */
    const service_slug = this.serviceSlug
    const encrypted_user_id_and_token = this.encryptUserIdAndToken(userId, userToken)
    const subject = userId
    /* eslint-enable camelcase */

    const algorithm = 'aes-256-ctr'
    const key = this.submissionEncryptionKey // 32 Characters
    const iv = key.slice(0, 16) // 16 Characters

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let crypted = cipher.update(JSON.stringify(submission), 'utf-8', 'base64')
    crypted += cipher.final('base64')

    const encryptedSubmission = {
      encrypted_submission: crypted
    }

    const payload = Object.assign(
      { service_slug, encrypted_user_id_and_token }, // eslint-disable-line camelcase
      encryptedSubmission
    )

    await this.sendPost({ url, payload, subject }, logger)
  }
}

SubmitterClient.offline = () => {
  class SubmitterClientOffline extends SubmitterClient {
    async submit () {}
  }
  return new SubmitterClientOffline('SERVICE_SECRET', 'SERVICE_SLUG', 'SUBMITTER_URL')
}

module.exports = SubmitterClient
