require('@ministryofjustice/module-alias/register-module')(module)

const got = require('got')
const jwt = require('jsonwebtoken')
const pathToRegexp = require('path-to-regexp')
const crypto = require('crypto')
const _ = require('lodash')

const debug = require('debug')
const log = debug('client:user:jwt')
const error = debug('client:user:jwt')

const aes256 = require('./aes256')

const CommonError = require('~/fb-client/common/error')

class ClientError extends CommonError {}

function getResponseLabels (response) {
  const responseLabels = {}

  if (response.status) responseLabels.status = response.status

  /*
   *  Are the fields present?
   */
  if (
    Reflect.has(response, 'statusCode') &&
    Reflect.has(response, 'statusMessage')) {
    const statusCode = Reflect.get(response, 'statusCode')
    const statusMessage = Reflect.get(response, 'statusMessage')
    /*
     *  Are the values null?
     */
    if (statusCode) responseLabels.status_code = statusCode
    if (statusMessage) responseLabels.status_message = statusMessage
  } else {
    /*
     *  Alternatively, explicitly test for an Error
     */
    if (response instanceof Error) {
      if (Reflect.has(response, 'body')) {
        const {
          body: {
            code,
            name: message
          }
        } = response

        if (code) responseLabels.error_code = code
        if (message) responseLabels.error_message = message
      } else {
        const code = getErrorStatusCode(Reflect.get(response, 'code') || Reflect.get(response, 'name'))
        const message = getErrorStatusMessage(code, Reflect.get(response, 'message'))

        responseLabels.error_code = code
        responseLabels.error_message = message
      }
    }
  }

  return responseLabels
}

/*
 *  Known errors. This can, of course, be extended
 */
function getErrorStatusCode (key) {
  switch (key) {
    case 'HTTPError':
      return 404
    case 'ENOTFOUND':
      return 502
    case 'ECONNREFUSED':
      return 503
    default:
      return 500
  }
}

/*
 *  This can, of course, be extended, too
 */
const getErrorStatusMessage = (key, message) => key === 404 ? 'Not Found' : message

/**
 * Creates client using JSON Web Tokens
 * @class
 */
class Client {
  /**
   * Initialise client
   *
   * @param {string} serviceSecret
   * Service secret
   *
   * @param {string} serviceSlug
   * Service slug
   *
   * @param {string} microserviceUrl
   * URL of microservice to communicate with
   *
   * @param {error} [errorClass]
   * Error class (defaults to ClientError)
   *
   * @param {object} [options]
   * Additional options
   *
   * @return {object}
   **/
  constructor (serviceSecret, serviceSlug, microserviceUrl, errorClass, options) {
    if (errorClass) {
      this.ErrorClass = errorClass
    }

    if (!serviceSecret) {
      this.throwRequestError('ENOSERVICESECRET', 'No service secret passed to client')
    }
    if (!serviceSlug) {
      this.throwRequestError('ENOSERVICESLUG', 'No service slug passed to client')
    }
    if (!microserviceUrl) {
      this.throwRequestError('ENOMICROSERVICEURL', 'No microservice url passed to client')
    }

    this.serviceSecret = serviceSecret
    this.serviceUrl = microserviceUrl
    this.serviceSlug = serviceSlug

    let encodedPrivateKey
    if (typeof options === 'string') {
      encodedPrivateKey = options
    } else {
      encodedPrivateKey = (
        options || {}
      ).encodedPrivateKey
    }

    this.encodedPrivateKey = encodedPrivateKey

    // provide default Prometheus startTimer behaviour so as not to have to wrap all instrumentation calls in conditionals
    const startTimer = () => () => ({})

    this.apiMetrics = {
      startTimer
    }

    this.requestMetrics = {
      startTimer
    }
  }

  privateKey () {
    if (this.encodedPrivateKey) {
      const buffer = Buffer.from(this.encodedPrivateKey, 'base64')
      return buffer.toString('ascii')
    }
  }

  /**
   * Add metrics recorders for requests
   *
   * @param {object} apiMetrics
   * Prometheus histogram instance
   *
   * @param {object} requestMetrics
   * Prometheus histogram instance
   *
   * @return {undefined}
   *
   **/
  setMetricsInstrumentation (apiMetrics, requestMetrics) {
    this.apiMetrics = apiMetrics
    this.requestMetrics = requestMetrics
  }

  /**
   * Generate access token
   *
   * @param {string} [data]
   * Request data
   *
   * @param {string} [secret]
   * random string or RSA private key
   *
   * @param {string} [algorithm]
   * HS256 or RS256
   *
   * @param {object} [options]
   * Optional object with additional options
   * Can be used to set subject claim of JWT
   *
   * @return {string}
   * Access token
   *
   **/
  generateAccessToken (data, secret, algorithm, options = {}) {
    const checksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    const subject = options.subject

    if (secret) {
      if (subject) {
        return jwt.sign({ checksum }, secret, { issuer: this.serviceSlug, subject: subject, algorithm: algorithm })
      } else {
        return jwt.sign({ checksum }, secret, { issuer: this.serviceSlug, algorithm: algorithm })
      }
    }
  }

  /**
   * Encrypt data with AES 256
   *
   * @param {string} token
   * Token
   *
   * @param {any} data
   * Request data
   *
   * @param {string} [ivSeed]
   * Initialization Vector
   *
   * @return {string}
   * Encrypted data
   *
   **/
  encrypt (token, data, ivSeed) {
    return aes256.encrypt(token, JSON.stringify(data), ivSeed)
  }

  /**
   * Decrypt data
   *
   * @param {string} token
   * Token
   *
   * @param {string} data
   * Encrypted data
   *
   * @return {string}
   * Decrypted data
   *
   **/
  decrypt (token, data) {
    try {
      return JSON.parse(aes256.decrypt(token, data))
    } catch (e) {
      this.throwRequestError(500, 'EINVALIDPAYLOAD')
    }
  }

  /**
   * Encrypt user ID and token using service secret
   *
   * Guaranteed to return the same value
   *
   * @param {string} userId
   * User ID
   *
   * @param {string} userToken
   * User token
   *
   * @return {string}
   *
   **/
  encryptUserIdAndToken (userId, userToken) {
    const ivSeed = userId + userToken

    return this.encrypt(this.serviceSecret, { userId, userToken }, ivSeed)
  }

  /**
   * Decrypt user ID and token using service secret
   *
   * @param {string} data
   * Encrypted user ID and token
   *
   * @return {object}
   *
   **/
  decryptUserIdAndToken (data) {
    return this.decrypt(this.serviceSecret, data)
  }

  /**
   * Create user-specific endpoint
   *
   * @param {string} urlPattern
   * Uncompiled pathToRegexp url pattern
   *
   * @param {object} context
   * Object of values to substitute
   *
   * @return {string}
   * Endpoint URL
   *
   **/
  createEndpointUrl (urlPattern, context = {}) {
    const toPath = pathToRegexp.compile(urlPattern)

    return this.serviceUrl + toPath(context)
  }

  /**
   * Create request options
   *
   * @param {string} urlPattern
   * Uncompiled pathToRegexp url pattern
   *
   * @param {string} context
   * User ID
   *
   * @param {object} [data]
   * Payload
   *
   * @param {boolean} [isGET]
   * Send payload as query string
   *
   * @param {object} [options]
   * Optional object for additional options
   * Can be used to set subject claim in JWT
   *
   * @return {object}
   * Request options
   *
   **/
  createRequestOptions (urlPattern, context, data = {}, isGET, options = {}) {
    const accessTokenV2 = this.generateAccessToken(data, this.privateKey(), 'RS256', options)
    const url = this.createEndpointUrl(urlPattern, context)
    const hasData = !!Object.keys(data).length

    const requestOptions = {
      url,
      headers: { 'x-access-token-v2': accessTokenV2 },
      responseType: 'json'
    }

    if (isGET) {
      if (hasData) {
        requestOptions.searchParams = {
          payload: Buffer.from(JSON.stringify(data)).toString('Base64')
        }
      }
    } else {
      requestOptions.json = data
    }

    return requestOptions
  }

  logError (type, error, labels, logger) {
    if (Reflect.has(error, 'gotOptions')) {
      const {
        gotOptions: {
          headers
        }
      } = error

      error.client_headers = headers
    }

    const {
      client_name: name
    } = labels

    if ((error.body || false) instanceof Object) error.error = error.body

    const logObject = Object.assign({}, labels, { error })

    /*
     *  This is ugly but at least it's not a single super long line of stupid
     */
    const logMessage = `JWT ${type} request error: ${name}:`
      .concat(' ')
      .concat(labels.method.toUpperCase())
      .concat(' ')
      .concat([
        labels.base_url.concat(labels.url),
        error.name || '',
        error.code || '',
        error.statusCode || '',
        error.statusMessage || ''
      ].join(' - ').concat(' - '))
      .concat(
        error.error ? JSON.stringify(error.error) : ''
      )

    if (logger) logger.error(logObject, logMessage)
  }

  /**
   * Handle client requests
   *
   * @param {string} method
   * Method for request
   *
   * @param {object} args
   * Args for request
   *
   * @param {string} args.urlPattern
   * Url pattern for request
   *
   * @param {object} args.context
   * Context for url pattern substitution
   *
   * @param {object} [args.payload]
   * Payload to send as query param to endpoint
   *
   * @param {object} [args.sendOptions]
   * Additional options to pass to got method
   *
   * @param {object} [logger]
   * Bunyan logger instance
   *
   * @return {object}
   * Returns JSON object or handles exception
   *
   **/
  async send (method, args, logger) {
    const {
      url,
      context = {},
      payload,
      sendOptions = {},
      subject
    } = args

    const client = this
    const client_name = this.constructor.name // eslint-disable-line camelcase
    const base_url = this.serviceUrl // eslint-disable-line camelcase
    const requestOptions = this.createRequestOptions(url, context, payload, method === 'get', { subject })

    const labels = {
      client_name,
      base_url,
      url,
      method
    }

    function logError (type, error) {
      client.logError(type, error, Object.assign({}, labels, { name: `jwt_${type.toLowerCase()}_request_error` }), logger)
    }

    let requestMetricsEnd
    let retryCounter = 1

    const gotOptions = got.mergeOptions(got.defaults.options, {
      timeout: 30000,
      retry: { limit: 3, methods: ['GET', 'POST'] },
      hooks: {
        beforeRequest: [
          () => {
            requestMetricsEnd = this.requestMetrics.startTimer(labels)
          }
        ],
        beforeRetry: [
          (options, error, retryCount) => {
            error.retryCount = retryCounter = retryCount

            if (logger) logError('client', error)

            if (requestMetricsEnd) requestMetricsEnd(getResponseLabels(error))
            requestMetricsEnd = this.requestMetrics.startTimer(labels)
          }
        ],
        beforeError: [
          (error) => {
            error.retryCount = retryCounter
            if (requestMetricsEnd) requestMetricsEnd(getResponseLabels(error))
            return error
          }
        ],
        afterResponse: [
          (response) => {
            if (response.statusCode >= 400 && logger) logError('client', response)

            if (requestMetricsEnd) requestMetricsEnd(getResponseLabels(response))
            return response
          }
        ]
      }
    }, sendOptions, requestOptions, { method })

    const apiMetricsEnd = this.apiMetrics.startTimer(labels)

    try {
      const response = await got[method](gotOptions)

      apiMetricsEnd(getResponseLabels(response))

      /*
       *  Return whatever has been parsed or an object
       *
       *  `got` is transforming an undefined response body into a
       *  zero-length string. We handle that by returning an object
       *
       *  Our `responseType` is JSON so we expect an object or
       *  an error
       */
      return response.body || {}
    } catch (e) {
      const { response: { statusCode } = {} } = e

      if (statusCode < 300) {
        /*
         *  The request was successful
         */
        apiMetricsEnd(getResponseLabels(e))

        const { name } = e
        /*
         *  But parsing the response failed
         */
        if (name === 'ParseError') this.throwRequestError(500, 'EINVALIDPAYLOAD')
        /*
         *  Otherwise, we could test for other conditions and handle them ...
         *  once we have encountered some (I'm sure it won't be long)
         */
        this.throwRequestError(500, 'EUNKNOWN')
      }

      apiMetricsEnd(getResponseLabels(e))

      if (logger) logError('API', e)

      const { code, message, response } = e

      error({ ...(code ? { code } : {}), ...(message ? { message } : {}) })

      client.handleRequestError(e, { ...(code ? { code } : {}), ...(message ? { message } : {}), response })
    }
  }

  /**
   * Handle client get requests
   *
   * @param {object} args
   * Args for request
   *
   * @param {string} args.url
   * Url pattern for request
   *
   * @param {object} args.context
   * Context for url pattern substitution
   *
   * @param {object} [args.payload]
   * Payload to send as query param to endpoint
   *
   * @param {object} [args.sendOptions]
   * Additional options to pass to got method
   *
   * @param {object} [logger]
   * Bunyan logger instance
   *
   * @return {promise<object>}
   * Returns promise resolving to JSON object or handles exception
   *
   **/
  async sendGet (args, logger) {
    return this.send('get', args, logger)
  }

  /**
   * Handle client post requests
   *
   * @param {object} args
   * Args for request
   *
   * @param {string} args.url
   * Url pattern for request
   *
   * @param {object} args.context
   * Context for url pattern substitution
   *
   * @param {object} args.payload
   * Payload to post to endpoint
   *
   * @param {object} [args.sendOptions]
   * Additional options to pass to got method
   *
   * @param {object} [logger]
   * Bunyan logger instance
   *
   * @return {promise<object>}
   * Returns promise resolving to JSON object or handles exception
   *
   **/
  async sendPost (args, logger) {
    return this.send('post', args, logger)
  }

  /**
   * Handle client response errors
   *
   * @param {object} e
   * Error returned by Request
   *
   * @return {undefined}
   * Returns nothing as it should throw an error
   *
   **/
  handleRequestError (e, response) {
    // rethrow error if already client error
    if (e instanceof this.ErrorClass) throw e

    // adjust
    if ((e.body || false) instanceof Object) e.error = e.body

    const {
      statusCode
    } = e

    let message
    let code
    if (statusCode) {
      log(statusCode)

      if (statusCode > 400 && statusCode < 500) {
        // Data does not exist - ie. expired
        message = statusCode
        code = statusCode
      } else {
        if (e.error) {
          // Handle errors which have an error object
          message = e.error.name || e.error.code || 'EUNSPECIFIED'
          code = statusCode
        } else {
          // Handle errors which have no error object
          message = e.code || 'ENOERROR'
          code = statusCode
        }
      }
    } else if (e.error) {
      // Handle errors which have an error object
      message = e.error.name || e.error.code || 'EUNSPECIFIED'
      code = getErrorStatusCode(message)
    } else if (_.has(response, 'response.body')) {
      // Nested response object
      const body = _.get(response, 'response.body')
      message = _.get(body, 'name', 'ENOERROR')
      code = _.get(body, 'code', getErrorStatusCode(message))
    } else {
      // Handle errors which have no error object
      message = e.code || 'ENOERROR'
      code = getErrorStatusCode(message)
    }

    this.throwRequestError(code, message, response)
  }

  /**
   * Convenience function for throwing errors
   *
   * @param {number|string} code
   * Error code
   *
   * @param {string} [message]
   * Error message (defaults to code)
   *
   * @return {undefined}
   * Returns nothing as it should throw an error
   *
   **/
  throwRequestError (code, message = code, data) {
    error({ code, message })

    throw new this.ErrorClass({
      error: {
        code,
        message
      },
      ...(data ? { data } : {})
    })
  }
}

// default client error class
Client.prototype.ErrorClass = ClientError

module.exports = Client
