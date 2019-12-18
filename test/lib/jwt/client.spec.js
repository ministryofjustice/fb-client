const proxyquire = require('proxyquire')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  expect
} = chai

const jwt = require('jsonwebtoken')
const got = require('got')

const nock = require('nock')

chai.use(sinonChai)

const encryptStub = sinon.stub()
const decryptStub = sinon.stub()

const Client = proxyquire('~/fb-user/jwt/client', {
  './aes256': {
    encrypt: encryptStub,
    decrypt: decryptStub
  }
})

const userId = 'testUserId'
const serviceSlug = 'testServiceSlug'
const serviceSecret = 'testServiceSecret'
const serviceToken = 'testServiceToken'

const microserviceUrl = 'https://microservice'

const encodedPrivateKey = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBM1NUQjJMZ2gwMllrdCtMcXo5bjY5MlNwV0xFdXNUR1hEMGlmWTBuRHpmbXF4MWVlCmx6MXh4cEpPTGV0ckxncW4zN2hNak5ZMC9uQUNjTWR1RUg5S1hycmFieFhYVGwxeVkyMStnbVd4NDlOZVlESW4KYmRtKzZzNUt2TGdVTk43WFZjZVA5UHVxWnlzeENWQTRUbm1MRURLZ2xTV2JVeWZ0QmVhVENKVkk2NFoxMmRNdApQYkFneFdBZmVTTGxiN0JQbHNIbS9IMEFBTCtuYmFPQ2t3dnJQSkRMVFZPek9XSE1vR2dzMnJ4akJIRC9OV05aCnNUVlFhbzRYd2hlYnVkaGx2TWlrRVczMldLZ0t1SEhXOHpkdlU4TWozM1RYK1picVhPaWtkRE54dHd2a1hGN0wKQTNZaDhMSTVHeWQ5cDZmMjdNZmxkZ1VJSFN4Y0pweTFKOEFQcXdJREFRQUJBb0lCQUU5ZjJTQVRmemlraWZ0aQp2RXRjZnlMN0EzbXRKd2c4dDI2cDcyT3czMUg0RWg4NHlOaWFHbE5ld2lialAvWW5wdmU2NitjRkg4SlBxK0NWCkJHRnhmdDBmampXZkRrZTNiTTVaUjdaQUVDaW8vay9pMEpveU5MK015ZkNRMWRmZ1FFUXV1L0gvdnJzSEdyT3cKRW5YQVZIUzg1enlCWWczbjM4QmxjVkw4V2s4R3FlMGxCUU5RSks5dSt5ckc5NEpoUTVoMTZubXlyQ0xpWkhSTAoyWS94MTdDL3BCN1VlUVFWeDZ4aVZSdVdmT1FoWlNmT2IzRHpsYldhc2owa2pTaHdWWDFQVG5sU0lxQXo5T3krClY5M013VFBtbVNOOGFiL0pGVlVBUzhtckM2elcxc0NjcFVUTFZHRVZBUFBJcWpjMmZFKzdLVGNjVDFzWkt0MWIKb2p1R2xSa0NnWUVBL2ZuK3VZcCtxSzdiQmxkUTZCSmNsNXpkR0xybXRrWFFZR096d2cvN21zd0NVdUM3UFpGYQpJV0xBSGM4QU85eDZvUFQ0SzFPNnQzYVBtMW8vUTR1S1N2NWNGK3EwaThMemVQM2JxdnowQXBXekdPVFdiMXg5CnNBRzNIOCtIT3JNS0NXVWl3bm5pUG1PMDNXUUY0dmFoWUd1WXYzSkNSNTYxanBJOFRkMkx6QmNDZ1lFQTN1ZkwKKzdqNGE2elVBOUNrak5wSnB2VkxyQk8ydUpiRHk5NXBpSzlCU3FIellQSEw3VVBWTExFaXRGWlNBWlRWRzFHMwpWbUNxMVoraXhCcTRST0t2VldyME1mSklsUlEvQXBQY3NwVXJjRTRPcnAxRkEyNjlLdXhhdnI5dmpLMCtIbWNRClEydWNRWWdUeWFXQlNZeW9laW04QWQ2UlpJRzVLQ25uTVlhNThZMENnWUVBNUp6VG5VLzlFdm5TVGJMck1QclcKUGVNRlllMWJIMWRZYW10VXM2cVBZSmVpdjlkcXM5RFN3SnFUTkVIUWhCSENrSC94bzQ2SzAvbjA2bkloNERzTApFTlpGTDRJbFltanBvRTlpSEZmMWpSNFRTS1UwSUttd3VXM1IyT0NGYVdFZjk3VUJ4T3pScWpjMTV0TFNPYXFuCk9KT2h1ekt1VnFtVjQrL2VPSGprRGFFQ2dZQUdMVFloeTRaV3RYdEtmOFdQZ1p6NDIyTTFhWFp1dHY3Rjcydk4KTmM0QlcydDdERGd5WXViTlRqcy85QVJodHRZUTQ3ckkwZlRwNW5xRUpKbG1qMEY4aEhJdjBCN2l3cVRjVld5UQpKa0lGNHFQVmd0WWV1anJUcmFqMkVDZnZKZjNLcWVCeGZkSGVudjZ0WDhDdFlSQnFFaTM3ZjBkWUdhQWYxTWxyClBlaDVJUUtCZ1FDbmN6YU8xcUx3VktyeUc4TzF5ZUhDSjQzT1h6SENwN3VnOE90aS9ScmhWZ08wSCtEdVpXUzUKSWhydHpUeU56MExyQTdibVFLTWZ4Y3k5Y29LOG9zZnVma1pZenJxM1ZFa0ViUCtjRWdLcGtlTDlaY2RSbXZ3WQozSTZkMUlOWVUwMldPSzhiRUJBNElJNGc0ak9ZcjJJUjFzb2lWZ0E2YnVya3E3QnMrUm41WFE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo='

const encodedPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzU1RCMkxnaDAyWWt0K0xxejluNgo5MlNwV0xFdXNUR1hEMGlmWTBuRHpmbXF4MWVlbHoxeHhwSk9MZXRyTGdxbjM3aE1qTlkwL25BQ2NNZHVFSDlLClhycmFieFhYVGwxeVkyMStnbVd4NDlOZVlESW5iZG0rNnM1S3ZMZ1VOTjdYVmNlUDlQdXFaeXN4Q1ZBNFRubUwKRURLZ2xTV2JVeWZ0QmVhVENKVkk2NFoxMmRNdFBiQWd4V0FmZVNMbGI3QlBsc0htL0gwQUFMK25iYU9Da3d2cgpQSkRMVFZPek9XSE1vR2dzMnJ4akJIRC9OV05ac1RWUWFvNFh3aGVidWRobHZNaWtFVzMyV0tnS3VISFc4emR2ClU4TWozM1RYK1picVhPaWtkRE54dHd2a1hGN0xBM1loOExJNUd5ZDlwNmYyN01mbGRnVUlIU3hjSnB5MUo4QVAKcXdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg=='

const publicKey = Buffer.from(encodedPublicKey, 'base64').toString('ascii')

describe('~/fb-user/jwt/client', () => {
  describe('Always', () => {
    it('exports the class', () => expect(Client).to.be.a('function'))

    describe('Instantiating a client', () => {
      describe('With required parameters', () => {
        class MockCustomError {}

        let client

        beforeEach(() => {
          client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl, MockCustomError)
        })

        it('assigns the service secret to a field of the instance', () => expect(client.serviceSecret).to.equal(serviceSecret))

        it('assigns the service token to a field of the instance', () => expect(client.serviceToken).to.equal(serviceToken))

        it('assigns the service slug to a field of the instance', () => expect(client.serviceSlug).to.equal(serviceSlug))

        it('assigns the custom error class to a field of the instance', () => expect(client.ErrorClass).to.equal(MockCustomError))

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
        it('throws an error', () => expect(() => new Client()).to.throw(Error, 'No service secret passed to client'))

        describe('The error', () => {
          it('has the expected name', () => {
            try {
              new Client()
            } catch ({name}) {
              expect(name).to.equal('ClientError')
            }
          })

          it('has the expected code', () => {
            try {
              new Client()
            } catch ({code}) {
              expect(code).to.equal('ENOSERVICESECRET')
            }
          })
        })
      })

      describe('Without a service token parameter', () => {
        it('throws an error', () => expect(() => new Client(serviceSecret)).to.throw(Error, 'No service token passed to client'))

        describe('The error', () => {
          it('has the expected name', () => {
            try {
              new Client(serviceSecret)
            } catch ({name}) {
              expect(name).to.equal('ClientError')
            }
          })

          it('has the expected code', () => {
            try {
              new Client(serviceSecret)
            } catch ({code}) {
              expect(code).to.equal('ENOSERVICETOKEN')
            }
          })
        })
      })

      describe('Without a service slug parameter', () => {
        it('throws an error', () => expect(() => new Client(serviceSecret, serviceToken)).to.throw(Error, 'No service slug passed to client'))

        describe('The error', () => {
          it('has the expected name', () => {
            try {
              new Client(serviceSecret, serviceToken)
            } catch ({name}) {
              expect(name).to.equal('ClientError')
            }
          })

          it('has the expected code', () => {
            try {
              new Client(serviceSecret, serviceToken)
            } catch ({code}) {
              expect(code).to.equal('ENOSERVICESLUG')
            }
          })
        })
      })

      describe('Without a service url parameter', () => {
        it('throws an error', () => expect(() => new Client(serviceSecret, serviceToken, serviceSlug)).to.throw(Error, 'No microservice url passed to client'))

        describe('The error', () => {
          it('has the expected name', () => {
            try {
              new Client(serviceSecret, serviceToken, serviceSlug)
            } catch ({name}) {
              expect(name).to.equal('ClientError')
            }
          })

          it('has the expected code', () => {
            try {
              new Client(serviceSecret, serviceToken, serviceSlug)
            } catch ({code}) {
              expect(code).to.equal('ENOMICROSERVICEURL')
            }
          })
        })
      })

      describe('With a custom error parameter', () => {
        class CustomError extends Error {}

        it('throws an error', () => expect(() => new Client(null, null, null, null, CustomError)).to.throw(CustomError))
      })
    })
  })

  describe('Injecting metrics instrumentation (`setMetricsInstrumentation()`)', () => {
    let mockApiMetrics
    let mockRequestMetrics
    let client

    beforeEach(() => {
      mockApiMetrics = {}
      mockRequestMetrics = {}

      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

      client.setMetricsInstrumentation(mockApiMetrics, mockRequestMetrics)
    })

    it('assigns the first argument to the field `apiMetrics`', () => expect(client.apiMetrics).to.equal(mockApiMetrics))

    it('assigns the second argument to the field `requestMetrics`', () => expect(client.requestMetrics).to.equal(mockRequestMetrics))
  })

  describe('Creating the endpoint URLs', () => {
    it('creates the URLs', () => {
      const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

      expect(client.createEndpointUrl('/service/:serviceSlug/user/:userId', {serviceSlug, userId})).to.equal('https://microservice/service/testServiceSlug/user/testUserId')
    })
  })

  describe('Generating a JSON web token', () => {
    let client
    let clock
    let accessToken

    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      clock = sinon.useFakeTimers({now: 1483228800000})
      accessToken = client.generateAccessToken({data: 'testData'}, serviceToken, 'HS256')
    })

    afterEach(() => {
      clock.restore()
    })

    it('generates a JSON web token containing a checksum', () => {
      const {
        checksum
      } = jwt.verify(accessToken, serviceToken, 'RS256')

      expect(checksum).to.equal('b5118e71a8ed3abbc8c40d4058b0dd54b9410ffd56ef888f602ed10026c46a3a')
    })

    it('generates a JSON web token containing an iat', () => {
      const {
        iat
      } = jwt.verify(accessToken, serviceToken)

      expect(iat).to.equal(1483228800)
    })
  })

  describe('Generating a JSON web token with encoded private key', () => {
    let client
    let clock
    let accessToken
    const options = {
      encodedPrivateKey: encodedPrivateKey
    }

    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl, undefined, options)
      clock = sinon.useFakeTimers({now: 1483228800000})
      accessToken = client.generateAccessToken({data: 'testData'}, client.privateKey(), 'RS256')
    })

    afterEach(() => {
      clock.restore()
    })

    it('generates a JSON web token containing a checksum verifiable with public key', () => {
      const {
        checksum
      } = jwt.verify(accessToken, publicKey)

      expect(checksum).to.equal('b5118e71a8ed3abbc8c40d4058b0dd54b9410ffd56ef888f602ed10026c46a3a')
    })

    it('generates a JSON web token containing an iat', () => {
      const {
        iat
      } = jwt.verify(accessToken, publicKey)

      expect(iat).to.equal(1483228800)
    })
  })

  describe('Creating the request options', () => {
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers({now: 1483228800000})
    })

    afterEach(() => {
      clock.restore()
    })

    describe('POST requests', () => {
      describe('With data', () => {
        it('returns an object with a JSON object assigned to the field `body`', () => {
          const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

          expect(client.createRequestOptions('/foo', {}, {foo: 'bar'}))
            .to.eql({
              url: 'https://microservice/foo',
              headers: {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjdhMzhiZjgxZjM4M2Y2OTQzM2FkNmU5MDBkMzViM2UyMzg1NTkzZjc2YTdiN2FiNWQ0MzU1YjhiYTQxZWUyNGIiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.Ir9FvrSHfSyqJp-KmHoCnj8Z6HbpszC3PhhmB0Dq2oI',
                'x-access-token-v2': undefined
              },
              responseType: 'json',
              json: {foo: 'bar'}
            })
        })

        describe('With private key available', () => {
          it('defines x-access-token-v2', () => {
            const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl, undefined, {encodedPrivateKey: encodedPrivateKey})

            expect(client.createRequestOptions('/foo', {}, {foo: 'bar'}))
              .to.eql({
                url: 'https://microservice/foo',
                headers: {
                  'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjdhMzhiZjgxZjM4M2Y2OTQzM2FkNmU5MDBkMzViM2UyMzg1NTkzZjc2YTdiN2FiNWQ0MzU1YjhiYTQxZWUyNGIiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.Ir9FvrSHfSyqJp-KmHoCnj8Z6HbpszC3PhhmB0Dq2oI',
                  'x-access-token-v2': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjdhMzhiZjgxZjM4M2Y2OTQzM2FkNmU5MDBkMzViM2UyMzg1NTkzZjc2YTdiN2FiNWQ0MzU1YjhiYTQxZWUyNGIiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.0w4kIowhP50x84G_4g1PU9ErpcJ1BBY4rUo5sOcyV3wjLviDKhwtPEZEmYgCGM28D00Xt8cWw9ImKDLhCL0CTWu_S1nodyQc1updMdgopWmgDLIfOJrImorx3GbO16o0sVSh3y8K-4ldj4TcUZ_b2RrJx1FZN5wBZ_alKDEihX-mKNpYZ4mpQH8bWVvX-86_JB_MnaCo2ZHyG3SNMQaTHUAQmhsH04K1ECG8_03wIXUWwfhbmqNyaiMlS0PKUubHFD8-6HoC4CQGO7ongmhXbOY_Jxsrkxgmcx9VhAtbAaBmGRJHkO8a5gL0gM2QuhuigIiinxpIOgvLSnCKoaStHA'
                },
                responseType: 'json',
                json: {foo: 'bar'}
              })
          })
        })
      })

      describe('Without data', () => {
        it('returns an object without a JSON object assigned to the field `body`', () => {
          const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

          expect(client.createRequestOptions('/foo', {}, {}))
            .to.eql({
              url: 'https://microservice/foo',
              headers: {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjQ0MTM2ZmEzNTViMzY3OGExMTQ2YWQxNmY3ZTg2NDllOTRmYjRmYzIxZmU3N2U4MzEwYzA2MGY2MWNhYWZmOGEiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.45aiVFL2v7ZFSoazhffWHNhnRQiDgdVXyGBbn1Se9LA',
                'x-access-token-v2': undefined
              },
              responseType: 'json',
              json: {}
            })
        })
      })
    })

    describe('GET requests', () => {
      describe('With data', () => {
        it('returns an object with a `searchParams` field', () => {
          const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

          expect(client.createRequestOptions('/foo', {}, {foo: 'bar'}, true))
            .to.eql({
              url: 'https://microservice/foo',
              headers: {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjdhMzhiZjgxZjM4M2Y2OTQzM2FkNmU5MDBkMzViM2UyMzg1NTkzZjc2YTdiN2FiNWQ0MzU1YjhiYTQxZWUyNGIiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.Ir9FvrSHfSyqJp-KmHoCnj8Z6HbpszC3PhhmB0Dq2oI',
                'x-access-token-v2': undefined
              },
              responseType: 'json',
              searchParams: {payload: 'eyJmb28iOiJiYXIifQ=='}
            })
        })
      })

      describe('Without data', () => {
        it('returns an object without a `searchParams` field', () => {
          const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

          expect(client.createRequestOptions('/foo', {}, {}, true))
            .to.eql({
              url: 'https://microservice/foo',
              headers: {
                'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVja3N1bSI6IjQ0MTM2ZmEzNTViMzY3OGExMTQ2YWQxNmY3ZTg2NDllOTRmYjRmYzIxZmU3N2U4MzEwYzA2MGY2MWNhYWZmOGEiLCJpYXQiOjE0ODMyMjg4MDAsImlzcyI6InRlc3RTZXJ2aWNlU2x1ZyJ9.45aiVFL2v7ZFSoazhffWHNhnRQiDgdVXyGBbn1Se9LA',
                'x-access-token-v2': undefined
              },
              responseType: 'json'
            })
        })
      })
    })
  })

  describe('Getting', () => {
    let client

    let generateAccessTokenStub
    let getGetStub

    let returnValue

    describe('With a payload', () => {
      beforeEach(async () => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        generateAccessTokenStub = sinon.stub(client, 'generateAccessToken').returns('testAccessToken')
        getGetStub = sinon.stub(got, 'get').callsFake((options) => Promise.resolve({body: {foo: 'bar'}}))

        returnValue = await client.sendGet({
          url: '/user/:userId',
          context: {userId},
          payload: {foo: 'bar'}
        })
      })

      afterEach(() => {
        generateAccessTokenStub.restore()
        getGetStub.restore()
      })

      it('calls the correct url', () => expect(getGetStub.getCall(0).args[0].url).to.equal(`${microserviceUrl}/user/testUserId`))
      it('adds the correct x-access-token header', () => expect(getGetStub.getCall(0).args[0].headers['x-access-token']).to.equal('testAccessToken'))
      it('returns the unencrypted data', () => expect(returnValue).to.eql({foo: 'bar'}))
    })

    describe('Without a payload', () => {
      beforeEach(async () => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        generateAccessTokenStub = sinon.stub(client, 'generateAccessToken').returns('testAccessToken')
        getGetStub = sinon.stub(got, 'get').returns(Promise.resolve({}))

        returnValue = await client.sendGet({
          url: '/user/:userId',
          context: {userId}
        })
      })

      afterEach(() => {
        generateAccessTokenStub.restore()
        getGetStub.restore()
      })

      it('calls the correct url', () => expect(getGetStub.getCall(0).args[0].url).to.equal(`${microserviceUrl}/user/testUserId`))
      it('adds the correct x-access-token header', () => expect(getGetStub.getCall(0).args[0].headers['x-access-token']).to.equal('testAccessToken'))
      it('returns an object', () => expect(returnValue).to.eql({}))
    })
  })

  describe('Posting', () => {
    describe('With a payload', () => {
      let client

      let generateAccessTokenStub
      let getPostStub

      let returnValue

      beforeEach(async () => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        generateAccessTokenStub = sinon.stub(client, 'generateAccessToken').returns('accessToken')
        getPostStub = sinon.stub(got, 'post').returns(Promise.resolve({body: {foo: 'bar'}}))

        returnValue = await client.sendPost({
          url: '/user/:userId',
          context: {userId},
          payload: {foo: 'bar'}
        })
      })

      afterEach(() => {
        getPostStub.restore()
        generateAccessTokenStub.restore()
      })

      it('calls the correct url', () => expect(getPostStub.getCall(0).args[0].url).to.equal(`${microserviceUrl}/user/testUserId`))
      it('adds the x-access-token header', () => expect(getPostStub.getCall(0).args[0].headers['x-access-token']).to.equal('accessToken'))
      it('returns an object', () => expect(returnValue).to.eql({foo: 'bar'}))
    })

    describe('Without a payload', () => {
      let client

      let generateAccessTokenStub
      let getPostStub

      let returnValue

      beforeEach(async () => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        generateAccessTokenStub = sinon.stub(client, 'generateAccessToken').returns('accessToken')
        getPostStub = sinon.stub(got, 'post').returns(Promise.resolve({}))

        returnValue = await client.sendPost({
          url: '/user/:userId',
          context: {userId}
        })
      })

      afterEach(() => {
        getPostStub.restore()
        generateAccessTokenStub.restore()
      })

      it('calls the correct url', () => expect(getPostStub.getCall(0).args[0].url).to.equal(`${microserviceUrl}/user/testUserId`))
      it('adds the x-access-token header', () => expect(getPostStub.getCall(0).args[0].headers['x-access-token']).to.equal('accessToken'))
      it('returns an object', () => expect(returnValue).to.eql({}))
    })
  })

  describe('Posting to an endpoint successfully', () => {
    let client

    let apiMetricsEndStub
    let apiMetricsStartTimerStub

    let requestMetricsEndStub
    let requestMetricsStartTimerStub

    beforeEach(async () => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

      apiMetricsEndStub = sinon.stub()
      apiMetricsStartTimerStub = sinon.stub(client.apiMetrics, 'startTimer').returns(apiMetricsEndStub)

      requestMetricsEndStub = sinon.stub()
      requestMetricsStartTimerStub = sinon.stub(client.requestMetrics, 'startTimer').returns(requestMetricsEndStub)

      nock(microserviceUrl)
        .post('/route')
        .reply(200, {success: true})

      await client.send('post', {
        url: '/route'
      })
    })

    afterEach(() => {
      apiMetricsStartTimerStub.restore()
      requestMetricsStartTimerStub.restore()
    })

    it('starts the api metrics instrumentation timer with the correct args', () => expect(apiMetricsStartTimerStub.getCall(0).args[0]).to.eql({
      client_name: 'Client',
      base_url: microserviceUrl,
      url: '/route',
      method: 'post'
    }))

    it('stops the api metrics instrumentation timer with the correct args', () => expect(apiMetricsEndStub.getCall(0).args[0]).to.eql({status_code: 200, status_message: 'OK'}))

    it('starts the request instrumentation timer with the correct args', () => expect(requestMetricsStartTimerStub.getCall(0).args[0]).to.eql({
      client_name: 'Client',
      base_url: microserviceUrl,
      url: '/route',
      method: 'post'
    }))

    it('stops the request instrumentation timer with the correct args', () => expect(requestMetricsEndStub.getCall(0).args[0]).to.eql({status_code: 200, status_message: 'OK'}))
  })

  describe('Posting to an endpoint unsuccessfully', () => {
    let client

    let apiMetricsEndStub
    let apiMetricsStartTimerStub

    let requestMetricsEndStub
    let requestMetricsStartTimerStub

    beforeEach(async () => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

      apiMetricsEndStub = sinon.stub()
      apiMetricsStartTimerStub = sinon.stub(client.apiMetrics, 'startTimer').returns(apiMetricsEndStub)

      requestMetricsEndStub = sinon.stub()
      requestMetricsStartTimerStub = sinon.stub(client.requestMetrics, 'startTimer').returns(requestMetricsEndStub)

      nock(microserviceUrl)
        .post('/not-found')
        .reply(404, {code: 404, name: 'ENOTFOUND'})
    })

    afterEach(() => {
      apiMetricsStartTimerStub.restore()
      requestMetricsStartTimerStub.restore()
    })

    it('throws an ‘ENOERROR’', async () => {
      try {
        await client.send('post', {
          url: '/not-found'
        }, {error: () => {}})
      } catch (e) {
        expect(e.name).to.equal('ClientError')
      }
    })

    it('starts the api metrics instrumentation timer with the correct args', async () => {
      try {
        await client.send('post', {
          url: '/not-found'
        }, {error: () => {}})
      } catch (e) {
        expect(apiMetricsStartTimerStub.getCall(0).args[0]).to.eql({
          client_name: 'Client',
          base_url: microserviceUrl,
          url: '/not-found',
          method: 'post'
        })
      }
    })

    it('stops the api metrics instrumentation timer with the correct args', async () => {
      try {
        await client.send('post', {
          url: '/not-found'
        }, {error: () => {}})
      } catch (e) {
        expect(apiMetricsEndStub.getCall(0).args[0]).to.eql({error_code: 404, error_message: 'Not Found'})
      }
    })

    it('starts the request instrumentation timer with the correct args', async () => {
      try {
        await client.send('post', {
          url: '/not-found'
        }, {error: () => {}})
      } catch (e) {
        expect(requestMetricsStartTimerStub.getCall(0).args[0]).to.eql({
          client_name: 'Client',
          base_url: microserviceUrl,
          url: '/not-found',
          method: 'post'
        })
      }
    })

    it('stops the request instrumentation timer with the correct args', async () => {
      try {
        await client.send('post', {
          url: '/not-found'
        }, {error: () => {}})
      } catch (e) {
        expect(requestMetricsEndStub.getCall(0).args[0]).to.eql({status_code: 404, status_message: 'Not Found'})
      }
    })
  })

  describe('Retrying', () => {
    let client

    let apiMetricsEndStub
    let apiMetricsStartTimerStub

    let requestMetricsEndStub
    let requestMetricsStartTimerStub

    beforeEach(async () => {
      /*
       *  Don't use Nock or the nocked microservice URL
       */
      client = new Client(serviceSecret, serviceToken, serviceSlug, 'https://retry-microservice')

      apiMetricsEndStub = sinon.stub()
      apiMetricsStartTimerStub = sinon.stub(client.apiMetrics, 'startTimer').returns(apiMetricsEndStub)

      requestMetricsEndStub = sinon.stub()
      requestMetricsStartTimerStub = sinon.stub(client.requestMetrics, 'startTimer').returns(requestMetricsEndStub)
    })

    afterEach(() => {
      apiMetricsStartTimerStub.restore()
      requestMetricsStartTimerStub.restore()
    })

    it('throws an ‘ENOTFOUND’', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(e.name).to.equal('ClientError')
      }
    }).timeout(30000)

    it('starts the api metrics instrumentation timer with the correct args', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(apiMetricsStartTimerStub.getCall(0).args[0]).to.eql({
          client_name: 'Client',
          base_url: 'https://retry-microservice',
          url: '/server-error',
          method: 'get'
        })
      }
    }).timeout(30000)

    it('stops the api metrics instrumentation timer with the correct args', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(apiMetricsEndStub.getCall(0).args[0]).to.eql({
          error_code: 502,
          error_message: 'getaddrinfo ENOTFOUND retry-microservice'
        })
      }
    }).timeout(30000)

    it('starts the request instrumentation timer with the correct args', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(requestMetricsStartTimerStub.getCall(0).args[0]).to.eql({
          client_name: 'Client',
          base_url: 'https://retry-microservice',
          url: '/server-error',
          method: 'get'
        })
      }
    }).timeout(30000)

    it('stops the request instrumentation timer with the correct args', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(requestMetricsEndStub.getCall(0).args[0]).to.eql({
          error_code: 502,
          error_message: 'getaddrinfo ENOTFOUND retry-microservice'
        })
      }
    }).timeout(30000)

    it('calls the api metrics start timer the expected number of times', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(apiMetricsStartTimerStub.callCount).to.equal(1)
      }
    }).timeout(30000)

    it('calls api metrics end the expected number of times', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(apiMetricsEndStub.callCount).to.equal(1)
      }
    }).timeout(30000)

    it('calls request metrics end the expected number of times', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(requestMetricsEndStub.callCount).to.equal(4)
      }
    }).timeout(30000)

    it('calls the request metrics start timer the expected number of times', async () => {
      try {
        await client.send('get', {url: '/server-error', sendOptions: {retry: 3}}, {error (e) { return e }})
      } catch (e) {
        expect(requestMetricsStartTimerStub.callCount).to.equal(4)
      }
    }).timeout(30000)
  })

  describe('An endpoint returns JSON', () => {
    describe('The JSON is populated', () => {
      let client
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('Getting', async () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .get('/json-body')
            .reply(201, {success: true})

          const response = await client.send('get', {url: '/json-body'})

          expect(response).to.eql({success: true})
        })
      })

      describe('Posting', () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .post('/json-body')
            .reply(201, {success: true})

          const response = await client.send('post', {url: '/json-body'})

          expect(response).to.eql({success: true})
        })
      })
    })

    describe('The JSON is not populated', () => {
      let client
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('Getting', () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .get('/empty-json-body')
            .reply(201, {})

          const response = await client.send('get', {url: '/empty-json-body'})

          expect(response).to.eql({})
        })
      })

      describe('Posting', () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .post('/empty-json-body')
            .reply(201, {})

          const response = await client.send('post', {url: '/empty-json-body'})

          expect(response).to.eql({})
        })
      })
    })
  })

  describe('An endpoint returns a string', () => {
    describe('The string is populated', () => {
      let client
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('With mixed characters', () => {
        describe('Getting', () => {
          it('throws an ‘ENOERROR’', async () => {
            try {
              nock(microserviceUrl)
                .get('/non-empty-body')
                .reply(201, ' lorem ipsum ')

              await client.send('get', {url: '/non-empty-body'})
            } catch (e) {
              expect(e.name).to.equal('ClientError')
            }
          })
        })

        describe('Posting', () => {
          it('throws an ‘ENOERROR’', async () => {
            try {
              nock(microserviceUrl)
                .post('/non-empty-body')
                .reply(201, ' lorem ipsum ')

              await client.send('post', {url: '/non-empty-body'})
            } catch (e) {
              expect(e.name).to.equal('ClientError')
            }
          })
        })
      })

      describe('With whitespace', () => {
        describe('Getting', () => {
          it('throws an ‘ENOERROR’', async () => {
            try {
              nock(microserviceUrl)
                .get('/spaces-body')
                .reply(201, '    ')

              await client.send('get', {url: '/spaces-body'})
            } catch (e) {
              expect(e.name).to.equal('ClientError')
            }
          })
        })

        describe('Posting', () => {
          it('throws an ‘ENOERROR’', async () => {
            try {
              nock(microserviceUrl)
                .post('/spaces-body')
                .reply(201, '    ')

              await client.send('post', {url: '/spaces-body'})
            } catch (e) {
              expect(e.name).to.equal('ClientError')
            }
          })
        })
      })
    })

    describe('The string is not populated', () => {
      let client
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('Getting', async () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .get('/empty-string-body')
            .reply(201, '')

          const response = await client.send('get', {url: '/empty-string-body'})

          expect(response).to.eql({})
        })
      })

      describe('Posting', () => {
        it('returns an object', async () => {
          nock(microserviceUrl)
            .post('/empty-string-body')
            .reply(201, '')

          const response = await client.send('post', {url: '/empty-string-body'})

          expect(response).to.eql({})
        })
      })
    })
  })

  describe('An endpoint returns undefined', () => {
    let client
    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
    })

    /*
     *  When the response is undefined expect an object (for now)
     */
    describe('Getting', () => {
      it('returns an object', async () => {
        nock(microserviceUrl)
          .get('/undefined-body')
          .reply(201)

        const response = await client.send('get', {url: '/undefined-body'})

        expect(response).to.eql({})
      })
    })

    describe('Posting', () => {
      it('returns an object', async () => {
        nock(microserviceUrl)
          .post('/undefined-body')
          .reply(201)

        const response = await client.send('post', {url: '/undefined-body'})

        expect(response).to.eql({})
      })
    })
  })

  describe('`encrypt()`', () => {
    let client
    let mockData
    let JSONStub
    let returnValue

    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      mockData = {}
      encryptStub.returns('mock encrypted data')
      JSONStub = sinon.stub(JSON, 'stringify').returns('mock serialised data')

      returnValue = client.encrypt('mock service secret', mockData, 'mock initialization vector')
    })

    afterEach(() => {
      JSONStub.restore()
    })

    it('calls `encrypt()`', () => {
      expect(encryptStub)
        .to.be.calledWith('mock service secret', 'mock serialised data', 'mock initialization vector')
    })

    it('calls `JSON.stringify()`', () => {
      expect(JSONStub)
        .to.be.calledWith(mockData)
    })

    it('returns a string', () => {
      expect(returnValue)
        .to.equal('mock encrypted data')
    })
  })

  describe('`decrypt()`', () => {
    describe('`JSON.parse()` throws an error', () => {
      let client
      let JSONStub
      let throwRequestErrorStub
      let returnValue

      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        decryptStub.returns('mock decrypted data')
        JSONStub = sinon.stub(JSON, 'parse').throws()
        throwRequestErrorStub = sinon.stub(client, 'throwRequestError')

        returnValue = client.decrypt('mock service secret', 'mock encrypted data')
      })

      afterEach(() => {
        JSONStub.restore()
      })

      it('calls `decrypt()`', () => {
        expect(decryptStub)
          .to.be.calledWith('mock service secret', 'mock encrypted data')
      })

      it('calls `JSON.parse()`', () => {
        expect(JSONStub)
          .to.be.calledWith('mock decrypted data')
      })

      it('calls `throwRequestError()`', () => {
        expect(throwRequestErrorStub)
          .to.be.calledWith(500, 'EINVALIDPAYLOAD')
      })

      it('returns a string', () => {
        expect(returnValue)
          .not.to.equal('mock parsed data')
      })
    })

    describe('`JSON.parse()` does not throw an error', () => {
      let client
      let JSONStub
      let throwRequestErrorStub
      let returnValue

      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
        decryptStub.returns('mock decrypted data')
        JSONStub = sinon.stub(JSON, 'parse').returns('mock parsed data')
        throwRequestErrorStub = sinon.stub(client, 'throwRequestError')

        returnValue = client.decrypt('mock service secret', 'mock encrypted data')
      })

      afterEach(() => {
        JSONStub.restore()
      })

      it('calls `decrypt()`', () => {
        expect(decryptStub)
          .to.be.calledWith('mock service secret', 'mock encrypted data')
      })

      it('calls `JSON.parse()`', () => {
        expect(JSONStub)
          .to.be.calledWith('mock decrypted data')
      })

      it('does not call `throwRequestError()`', () => {
        return expect(throwRequestErrorStub)
          .not.to.be.called
      })

      it('returns a string', () => {
        expect(returnValue)
          .to.equal('mock parsed data')
      })
    })
  })

  describe('`encryptUserIdAndToken()`', () => {
    let client
    let encryptStub

    let returnValue

    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      encryptStub = sinon.stub(client, 'encrypt').returns('mock encrypted data')
      client.serviceSecret = 'mock service secret'

      returnValue = client.encryptUserIdAndToken('mock user id', 'mock user token')
    })

    it('calls `encrypt()`', () => {
      expect(encryptStub)
        .to.be.calledWith('mock service secret', {userId: 'mock user id', userToken: 'mock user token'}, 'mock user idmock user token')
    })

    it('returns a string', () => {
      expect(returnValue)
        .to.equal('mock encrypted data')
    })
  })

  describe('`decryptUserIdAndToken()`', () => {
    let client
    let decryptStub

    let returnValue

    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      decryptStub = sinon.stub(client, 'decrypt').returns('mock decrypted data')
      client.serviceSecret = 'mock service secret'

      returnValue = client.decryptUserIdAndToken('mock encrypted data')
    })

    it('calls `decrypt()`', () => {
      expect(decryptStub)
        .to.be.calledWith('mock service secret', 'mock encrypted data')
    })

    it('returns a string', () => {
      expect(returnValue)
        .to.equal('mock decrypted data')
    })
  })

  describe('`logError()`', () => {
    let error

    let errorStub

    let client

    describe('GET', () => {
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('With fields on the error instance', () => {
        beforeEach(() => {
          errorStub = sinon.stub()

          const type = 'API'
          error = new Error()
          error.code = 'mock error code'
          error.statusCode = 400
          error.statusMessage = 'mock status message'
          error.body = {
            name: 'mock error name',
            message: 'mock error message',
            code: 400
          }

          const labels = {client_name: 'Client', method: 'get', base_url: 'https://microservice', url: '/url'}
          const logger = {error: errorStub}

          client.logError(type, error, labels, logger)
        })

        it('assigns the value of `error.body` to the field `error.error`', () => {
          expect(error.error).to.equal(error.body)
        })

        it('calls `logger.error()', () => {
          expect(errorStub)
            .to.be.calledWith({
              client_name: 'Client',
              url: '/url',
              base_url: 'https://microservice',
              method: 'get',
              error
            }, 'JWT API request error: Client: GET https://microservice/url - Error - mock error code - 400 - mock status message - {"name":"mock error name","message":"mock error message","code":400}')
        })
      })

      describe('Without fields on the error instance', () => {
        beforeEach(() => {
          errorStub = sinon.stub()

          const type = 'API'
          error = new Error()

          const labels = {client_name: 'Client', method: 'get', base_url: 'https://microservice', url: '/url'}
          const logger = {error: errorStub}

          client.logError(type, error, labels, logger)
        })

        it('assigns the value of `error.body` to the field `error.error`', () => {
          expect(error.error).to.equal(error.body)
        })

        it('calls `logger.error()', () => {
          expect(errorStub)
            .to.be.calledWith({
              client_name: 'Client',
              url: '/url',
              base_url: 'https://microservice',
              method: 'get',
              error
            }, 'JWT API request error: Client: GET https://microservice/url - Error -  -  -  - ')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      })

      describe('With fields on the error instance', () => {
        beforeEach(() => {
          errorStub = sinon.stub()

          const type = 'API'
          error = new Error()
          error.code = 'mock error code'
          error.statusCode = 400
          error.statusMessage = 'mock status message'
          error.body = {
            name: 'mock error name',
            message: 'mock error message',
            code: 400
          }

          const labels = {client_name: 'Client', method: 'post', base_url: 'https://microservice', url: '/url'}
          const logger = {error: errorStub}

          client.logError(type, error, labels, logger)
        })

        it('assigns the value of `error.body` to the field `error.error`', () => {
          expect(error.error).to.equal(error.body)
        })

        it('calls `logger.error()', () => {
          expect(errorStub)
            .to.be.calledWith({
              client_name: 'Client',
              url: '/url',
              base_url: 'https://microservice',
              method: 'post',
              error
            }, 'JWT API request error: Client: POST https://microservice/url - Error - mock error code - 400 - mock status message - {"name":"mock error name","message":"mock error message","code":400}')
        })
      })

      describe('Without fields on the error instance', () => {
        beforeEach(() => {
          errorStub = sinon.stub()

          const type = 'API'
          error = new Error()

          const labels = {client_name: 'Client', method: 'post', base_url: 'https://microservice', url: '/url'}
          const logger = {error: errorStub}

          client.logError(type, error, labels, logger)
        })

        it('assigns the value of `error.body` to the field `error.error`', () => {
          expect(error.error).to.equal(error.body)
        })

        it('calls `logger.error()', () => {
          expect(errorStub)
            .to.be.calledWith({
              client_name: 'Client',
              url: '/url',
              base_url: 'https://microservice',
              method: 'post',
              error
            }, 'JWT API request error: Client: POST https://microservice/url - Error -  -  -  - ')
        })
      })
    })
  })

  describe('`sendGet()`', () => {
    let client
    let sendStub

    let mockArgs
    let mockLogger
    let mockReturnValue

    let returnValue

    beforeEach(async () => {
      mockReturnValue = {}

      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      sendStub = sinon.stub(client, 'send').returns(mockReturnValue)

      mockArgs = {}
      mockLogger = {}

      returnValue = await client.sendGet(mockArgs, mockLogger)
    })

    it('calls `send`', () => {
      expect(sendStub).to.be.calledWith('get', mockArgs, mockLogger)
    })

    it('returns a `Promise` which resolves to an object', () => {
      expect(returnValue).to.be.an('object')
    })
  })

  describe('`sendPost()`', () => {
    let client
    let sendStub

    let mockArgs
    let mockLogger

    let returnValue

    beforeEach(async () => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
      sendStub = sinon.stub(client, 'send').returns(undefined)

      mockArgs = {}
      mockLogger = {}

      returnValue = await client.sendPost(mockArgs, mockLogger)
    })

    it('calls `send`', () => {
      expect(sendStub).to.be.calledWith('post', mockArgs, mockLogger)
    })

    it('returns a `Promise` which resolves to undefined', () => {
      return expect(returnValue).to.be.undefined
    })
  })

  describe('`handleRequestError()`', () => {
    let client
    let throwRequestErrorStub

    describe('The client has a custom error', () => {
      describe('The error is an instance of the custom error', () => {
        it('throws the custom error', () => {
          class CustomError extends Error {}

          const client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl, CustomError)

          throwRequestErrorStub = sinon.stub(client, 'throwRequestError')

          expect(() => client.handleRequestError(new CustomError())).to.throw(CustomError)
        })
      })
    })

    describe('The client does not have a custom error', () => {
      beforeEach(() => {
        client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)

        throwRequestErrorStub = sinon.stub(client, 'throwRequestError')
      })

      describe('The error is an instance of the custom error', () => {
        it('does not throw the custom error', () => {
          class CustomError extends Error {}

          expect(() => client.handleRequestError(new CustomError())).not.to.throw(CustomError)
        })
      })

      describe('The error has a `body` field', () => {
        it('Assigns the value to an `error` field', () => {
          const mockBody = {}
          const mockError = {body: mockBody}

          client.handleRequestError(mockError)

          expect(mockError.error).to.equal(mockBody)
        })
      })

      describe('The error has a `statusCode`', () => {
        describe('400s', () => {
          describe('401', () => {
            it('throws a 401 request error', () => {
              client.handleRequestError({statusCode: 401})

              expect(throwRequestErrorStub).to.be.calledWith(401)
            })
          })

          describe('403', () => {
            it('throws a 403 request error', () => {
              client.handleRequestError({statusCode: 403})

              expect(throwRequestErrorStub).to.be.calledWith(403)
            })
          })

          describe('404', () => {
            it('throws a 404 request error', () => {
              client.handleRequestError({statusCode: 404})

              expect(throwRequestErrorStub).to.be.calledWith(404)
            })
          })
        })

        describe('500s', () => {
          describe('The error has an `error` field', () => {
            describe('The object on the error field has a `name` field', () => {
              it('throws a request error with the name', () => {
                client.handleRequestError({statusCode: 500, error: {name: 'mock name'}})

                expect(throwRequestErrorStub).to.be.calledWith(500, 'mock name')
              })
            })

            describe('The object on the error field does not have a `name` field but has a `code` field', () => {
              it('throws a request error with the code', () => {
                client.handleRequestError({statusCode: 500, error: {code: 'mock code'}})

                expect(throwRequestErrorStub).to.be.calledWith(500, 'mock code')
              })
            })

            describe('The object on the error field has neither a `name` field nor a `code` field', () => {
              it('throws a request error with the default code and the default type', () => {
                client.handleRequestError({statusCode: 500, error: { }})

                expect(throwRequestErrorStub).to.be.calledWith(500, 'EUNSPECIFIED')
              })
            })
          })

          describe('The error does not have an `error` field', () => {
            describe('The error has a `code` field', () => {
              it('throws a request error with the code', () => {
                client.handleRequestError({statusCode: 500, code: 'mock code'})

                expect(throwRequestErrorStub).to.be.calledWith(500, 'mock code')
              })
            })

            describe('The error does not have a `code` field', () => {
              it('throws a request error with the default code and the default type', () => {
                client.handleRequestError({statusCode: 500, error: { }})

                expect(throwRequestErrorStub).to.be.calledWith(500, 'EUNSPECIFIED')
              })
            })
          })
        })
      })

      describe('The error does not have a `statusCode`', () => {
        describe('The error has an `error` field', () => {
          describe('The object on the error field has a `name` field', () => {
            describe('Mapping the name to a status code', () => {
              describe('The name is `ENOERROR`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {name: 'ENOERROR'}})

                  expect(throwRequestErrorStub).to.be.calledWith(500, 'ENOERROR')
                })
              })

              describe('The name is `ENOTFOUND`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {name: 'ENOTFOUND'}})

                  expect(throwRequestErrorStub).to.be.calledWith(502, 'ENOTFOUND')
                })
              })

              describe('The name is `ECONNREFUSED`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {name: 'ECONNREFUSED'}})

                  expect(throwRequestErrorStub).to.be.calledWith(503, 'ECONNREFUSED')
                })
              })
            })
          })

          describe('The object on the error field does not have a `name` field but has a `code` field', () => {
            describe('Mapping the code to a status code', () => {
              describe('The code is `ENOERROR`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {code: 'ENOERROR'}})

                  expect(throwRequestErrorStub).to.be.calledWith(500, 'ENOERROR')
                })
              })

              describe('The code is `ENOTFOUND`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {code: 'ENOTFOUND'}})

                  expect(throwRequestErrorStub).to.be.calledWith(502, 'ENOTFOUND')
                })
              })

              describe('The code is `ECONNREFUSED`', () => {
                it('throws a request error with the name', () => {
                  client.handleRequestError({error: {code: 'ECONNREFUSED'}})

                  expect(throwRequestErrorStub).to.be.calledWith(503, 'ECONNREFUSED')
                })
              })
            })
          })

          describe('The object on the error field has neither a `name` field nor a `code` field', () => {
            it('throws a request error with the default code and the default type', () => {
              client.handleRequestError({error: { }})

              expect(throwRequestErrorStub).to.be.calledWith(500, 'EUNSPECIFIED')
            })
          })
        })

        describe('The error does not have an `error` field', () => {
          describe('The error has a `code` field', () => {
            describe('Mapping the code to a status code', () => {
              describe('The code is `ENOERROR`', () => {
                it('throws a request error with the status code', () => {
                  client.handleRequestError({code: 'ENOERROR'})

                  expect(throwRequestErrorStub).to.be.calledWith(500, 'ENOERROR')
                })
              })

              describe('The code is `ENOTFOUND`', () => {
                it('throws a request error with the status code', () => {
                  client.handleRequestError({code: 'ENOTFOUND'})

                  expect(throwRequestErrorStub).to.be.calledWith(502, 'ENOTFOUND')
                })
              })

              describe('The code is `ECONNREFUSED`', () => {
                it('throws a request error with the status code', () => {
                  client.handleRequestError({code: 'ECONNREFUSED'})

                  expect(throwRequestErrorStub).to.be.calledWith(503, 'ECONNREFUSED')
                })
              })

              describe('The code is not recognised', () => {
                it('throws a request error with the default status code', () => {
                  client.handleRequestError({code: 'ENOERROR'})

                  expect(throwRequestErrorStub).to.be.calledWith(500, 'ENOERROR')
                })
              })
            })

            it('throws a request error with the code', () => {
              client.handleRequestError({code: 'mock code'})

              expect(throwRequestErrorStub).to.be.calledWith(500, 'mock code')
            })
          })

          describe('The error does not have a `code` field', () => {
            it('throws a request error with the default code and the default type', () => {
              client.handleRequestError({error: { }})

              expect(throwRequestErrorStub).to.be.calledWith(500, 'EUNSPECIFIED')
            })
          })
        })
      })
    })
  })

  describe('`throwRequestError()`', () => {
    let client
    beforeEach(() => {
      client = new Client(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
    })

    describe('With a code', () => {
      it('throws an error', () => expect(() => client.throwRequestError('mock code')).to.throw(Error))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            client.throwRequestError('mock code')
          } catch ({name}) {
            expect(name)
              .to.equal('ClientError')
          }
        })

        it('has the expected code', () => {
          try {
            client.throwRequestError('mock code')
          } catch ({code}) { // {error: }) {
            expect(code)
              .to.equal('mock code')
          }
        })

        it('has the expected message', () => {
          try {
            client.throwRequestError('mock code')
          } catch ({message}) { // {error: }) {
            expect(message)
              .to.equal('mock code')
          }
        })
      })
    })

    describe('With a code and a message', () => {
      it('throws an error', () => expect(() => client.throwRequestError('mock code', 'mock message')).to.throw(Error))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            client.throwRequestError('mock code', 'mock message')
          } catch ({name}) {
            expect(name)
              .to.equal('ClientError')
          }
        })

        it('has the expected code', () => {
          try {
            client.throwRequestError('mock code', 'mock message')
          } catch ({code}) { // {error: }) {
            expect(code)
              .to.equal('mock code')
          }
        })

        it('has the expected message', () => {
          try {
            client.throwRequestError('mock code', 'mock message')
          } catch ({message}) { // {error: }) {
            expect(message)
              .to.equal('mock message')
          }
        })
      })
    })
  })
})
