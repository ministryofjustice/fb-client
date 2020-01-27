require('@ministryofjustice/module-alias/register')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  expect
} = chai

chai.use(sinonChai)

const EmailClient = require('~/fb-client/email/client')

const serviceSlug = 'testServiceSlug'
const serviceToken = 'testServiceToken'
const serviceSecret = 'testServiceSecret'
const emailUrl = 'https://email'

describe('~/fb-client/email/client', () => {
  describe('Always', () => it('exports the class', () => expect(EmailClient).to.be.a('function')))

  describe('Instantiating a client', () => {
    describe('With required parameters', () => {
      let client

      beforeEach(() => {
        client = new EmailClient(serviceSecret, serviceToken, serviceSlug, emailUrl)
      })

      it('assigns the service secret to a field of the instance', () => expect(client.serviceSecret).to.equal(serviceSecret))

      it('assigns the service token to a field of the instance', () => expect(client.serviceToken).to.equal(serviceToken))

      it('assigns the service slug to a field of the instance', () => expect(client.serviceSlug).to.equal(serviceSlug))

      it('assigns a default metrics object to the field `apiMetrics`', () => {
        expect(client.apiMetrics).to.be.an('object')

        const {
          startTimer
        } = client.apiMetrics

        expect(startTimer).to.be.a('function')
      })

      it('assigns a default metrics object to the field `requestMetrics`', () => {
        expect(client.requestMetrics).to.be.an('object')

        const {
          startTimer
        } = client.requestMetrics

        expect(startTimer).to.be.a('function')
      })
    })

    describe('Without a service secret parameter', () => {
      it('throws an error', () => expect(() => new EmailClient()).to.throw(Error, 'No service secret passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new EmailClient()
          } catch ({ name }) {
            expect(name).to.equal('EmailClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new EmailClient()
          } catch ({ code }) {
            expect(code).to.equal('ENOSERVICESECRET')
          }
        })
      })
    })

    describe('Without a service token parameter', () => {
      it('throws an error', () => expect(() => new EmailClient(serviceSecret)).to.throw(Error, 'No service token passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new EmailClient(serviceSecret)
          } catch ({ name }) {
            expect(name).to.equal('EmailClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new EmailClient(serviceSecret)
          } catch ({ code }) {
            expect(code).to.equal('ENOSERVICETOKEN')
          }
        })
      })
    })

    describe('Without a service slug parameter', () => {
      it('throws an error', () => expect(() => new EmailClient(serviceSecret, serviceToken)).to.throw(Error, 'No service slug passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new EmailClient(serviceSecret, serviceToken)
          } catch ({ name }) {
            expect(name).to.equal('EmailClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new EmailClient(serviceSecret, serviceToken)
          } catch ({ code }) {
            expect(code).to.equal('ENOSERVICESLUG')
          }
        })
      })
    })

    describe('Without an email url parameter', () => {
      it('throws an error', () => expect(() => new EmailClient(serviceSecret, serviceToken, serviceSlug)).to.throw(Error, 'No microservice url passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new EmailClient(serviceSecret, serviceToken, serviceSlug)
          } catch ({ name }) {
            expect(name).to.equal('EmailClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new EmailClient(serviceSecret, serviceToken, serviceSlug)
          } catch ({ code }) {
            expect(code).to.equal('ENOMICROSERVICEURL')
          }
        })
      })
    })
  })

  describe('`sendMessage()`', () => {
    let client
    let sendPostStub

    let mockMessage
    let mockSendOptions
    let mockLogger

    let returnValue

    beforeEach(async () => {
      client = new EmailClient(serviceSecret, serviceToken, serviceSlug, emailUrl)
      sendPostStub = sinon.stub(client, 'sendPost')

      mockMessage = 'mock message'
      mockSendOptions = {}
      mockLogger = {}

      returnValue = await client.sendMessage(mockMessage, mockSendOptions, mockLogger)
    })

    afterEach(() => {
      sendPostStub.restore()
    })

    it('calls `sendPost`', () => {
      expect(sendPostStub).to.be.calledWith({ url: '/email', payload: { message: 'mock message', service_slug: serviceSlug }, sendOptions: mockSendOptions }, mockLogger)
    })

    it('returns a `Promise` which resolves to undefined', () => {
      return expect(returnValue).to.be.undefined
    })
  })
})
