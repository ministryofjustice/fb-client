require('@ministryofjustice/module-alias/register-module')(module)

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

    const encryptedSubmission = {
      encrypted_submission: this.encrypt(this.submissionEncryptionKey, submission)
    }

    const payload = Object.assign(
      { service_slug, encrypted_user_id_and_token },
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
