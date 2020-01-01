require('@ministryofjustice/module-alias/register')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  expect
} = chai

chai.use(sinonChai)

const SubmitterClient = require('~/fb-client/submitter/client')

const serviceSlug = 'testServiceSlug'
const serviceToken = 'testServiceToken'
const serviceSecret = 'testServiceSecret'
const submitterUrl = 'https://submitter'

describe('~/fb-client/submitter/client', () => {
  describe('Always', () => it('exports the class', () => expect(SubmitterClient).to.be.a('function')))

  describe('Instantiating a client', () => {
    describe('With required parameters', () => {
      let client

      beforeEach(() => {
        client = new SubmitterClient(serviceSecret, serviceToken, serviceSlug, submitterUrl)
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
      it('throws an error', () => expect(() => new SubmitterClient()).to.throw(Error, 'No service secret passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new SubmitterClient()
          } catch ({name}) {
            expect(name).to.equal('SubmitterClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new SubmitterClient()
          } catch ({code}) {
            expect(code).to.equal('ENOSERVICESECRET')
          }
        })
      })
    })

    describe('Without a service token parameter', () => {
      it('throws an error', () => expect(() => new SubmitterClient(serviceSecret)).to.throw(Error, 'No service token passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new SubmitterClient(serviceSecret)
          } catch ({name}) {
            expect(name).to.equal('SubmitterClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new SubmitterClient(serviceSecret)
          } catch ({code}) {
            expect(code).to.equal('ENOSERVICETOKEN')
          }
        })
      })
    })

    describe('Without a service slug parameter', () => {
      it('throws an error', () => expect(() => new SubmitterClient(serviceSecret, serviceToken)).to.throw(Error, 'No service slug passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new SubmitterClient(serviceSecret, serviceToken)
          } catch ({name}) {
            expect(name).to.equal('SubmitterClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new SubmitterClient(serviceSecret, serviceToken)
          } catch ({code}) {
            expect(code).to.equal('ENOSERVICESLUG')
          }
        })
      })
    })

    describe('Without a service url parameter', () => {
      it('throws an error', () => expect(() => new SubmitterClient(serviceSecret, serviceToken, serviceSlug)).to.throw(Error, 'No microservice url passed to client'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            new SubmitterClient(serviceSecret, serviceToken, serviceSlug)
          } catch ({name}) {
            expect(name).to.equal('SubmitterClientError')
          }
        })

        it('has the expected code', () => {
          try {
            new SubmitterClient(serviceSecret, serviceToken, serviceSlug)
          } catch ({code}) {
            expect(code).to.equal('ENOMICROSERVICEURL')
          }
        })
      })
    })
  })

  describe('`getStatus()`', () => {
    let client
    let sendGetStub

    let mockSubmissionId
    let mockLogger

    let returnValue

    beforeEach(async () => {
      client = new SubmitterClient(serviceSecret, serviceToken, serviceSlug, submitterUrl)

      sendGetStub = sinon.stub(client, 'sendGet')

      mockSubmissionId = {userId: 'mock user id', userToken: 'mock user token'}
      mockLogger = {}

      returnValue = await client.getStatus(mockSubmissionId, mockLogger)
    })

    afterEach(() => {
      sendGetStub.restore()
    })

    it('calls `sendGet`', () => {
      expect(sendGetStub).to.be.calledWith({url: '/submission/:submissionId', context: {submissionId: mockSubmissionId}}, mockLogger)
    })

    it('returns a `Promise` which resolves to undefined', () => {
      return expect(returnValue).to.be.undefined
    })
  })

  describe('`submit()`', () => {
    let client
    let sendPostStub
    let encryptUserIdAndTokenStub

    const mockUserId = 'mock user id'
    const mockUserToken = 'mock user token'

    let mockSubmission
    let mockLogger

    let returnValue

    beforeEach(async () => {
      client = new SubmitterClient(serviceSecret, serviceToken, serviceSlug, submitterUrl)
      sendPostStub = sinon.stub(client, 'sendPost').returns({payload: 'mock payload'})
      encryptUserIdAndTokenStub = sinon.stub(client, 'encryptUserIdAndToken').returns('mock encrypted user id and token payload')

      mockSubmission = {}
      mockLogger = {}

      returnValue = await client.submit(mockSubmission, mockUserId, mockUserToken, mockLogger)
    })

    afterEach(() => {
      sendPostStub.restore()
      encryptUserIdAndTokenStub.restore()
    })

    it('calls `encryptUserIdAndToken`', () => {
      expect(encryptUserIdAndTokenStub).to.be.calledWith('mock user id', 'mock user token')
    })

    it('calls `sendPost`', () => {
      expect(sendPostStub).to.be.calledWith({
        url: '/submission',
        payload: {
          encrypted_user_id_and_token: 'mock encrypted user id and token payload',
          service_slug: 'testServiceSlug'
        }
      }, mockLogger)
    })

    it('returns a `Promise` which resolves to undefined', () => {
      return expect(returnValue).to.be.undefined
    })
  })
})
