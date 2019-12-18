const chai = require('chai')

const {
  expect
} = chai

const {
  decrypt,
  encrypt
} = require('~/fb-user/jwt/aes256')

const userToken = 'testUserToken'
const encryptedData = 'RRqDeJRQlZULKx1NYql/imRmDsy9AZshKozgLuY='
const decryptedData = '{"foo":"bar"}'

describe('~/fb-user/jwt/aes256', () => {
  // Decrypting user data
  describe('Decrypting', () => {
    describe('With a key and a value', () => {
      it('decrypts the data', () => expect(decrypt(userToken, encryptedData)).to.eql(decryptedData))
    })

    describe('Without a key', () => {
      it('throws an error', () => expect(() => decrypt(undefined, encryptedData)).to.throw(Error, 'Key must be a non-empty string'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            decrypt(undefined, encryptedData)
          } catch ({name}) {
            expect(name).to.equal('AES256Error')
          }
        })

        it('has the expected code', () => {
          try {
            decrypt(undefined, encryptedData)
          } catch ({code}) {
            expect(code).to.equal('ENODECRYPTKEY')
          }
        })
      })
    })

    describe('Without a value', () => {
      it('throws an error', () => expect(() => decrypt(userToken)).to.throw(Error, 'Encrypted value must be a non-empty string'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            decrypt(userToken)
          } catch ({name}) {
            expect(name).to.equal('AES256Error')
          }
        })

        it('has the expected code', () => {
          try {
            decrypt(userToken)
          } catch ({code}) {
            expect(code).to.equal('ENODECRYPTVALUE')
          }
        })
      })
    })
  })

  // Encrypting user data
  describe('Encrypting', () => {
    describe('With a key and a value', () => {
      describe('With an IV seed', () => {
        const one = encrypt(userToken, decryptedData, 'ivSeed')
        const two = encrypt(userToken, decryptedData, 'ivSeed')

        it('returns the same encrypted value', () => expect(one).to.equal(two))
        it('decrypts', () => expect(decrypt(userToken, one)).to.equal(decryptedData))
        it('decrypts', () => expect(decrypt(userToken, two)).to.equal(decryptedData))
      })

      describe('Without an IV seed', () => {
        const one = encrypt(userToken, decryptedData)
        const two = encrypt(userToken, decryptedData)

        it('returns a different encrypted value', () => expect(one).not.to.equal(two))
        it('decrypts', () => expect(decrypt(userToken, one)).to.equal(decryptedData))
        it('decrypts', () => expect(decrypt(userToken, two)).to.equal(decryptedData))
      })
    })

    describe('Without a key', () => {
      it('throws an error', () => expect(() => encrypt(undefined, decryptedData)).to.throw(Error, 'Key must be a non-empty string'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            encrypt(undefined, decryptedData)
          } catch ({name}) {
            expect(name).to.equal('AES256Error')
          }
        })

        it('has the expected code', () => {
          try {
            encrypt(undefined, decryptedData)
          } catch ({code}) {
            expect(code).to.equal('ENOENCRYPTKEY')
          }
        })
      })
    })

    describe('Without a value', () => {
      it('throws an error', () => expect(() => encrypt(userToken)).to.throw(Error, 'Plaintext value must be a non-empty string'))

      describe('The error', () => {
        it('has the expected name', () => {
          try {
            encrypt(userToken)
          } catch ({name}) {
            expect(name).to.equal('AES256Error')
          }
        })

        it('has the expected code', () => {
          try {
            encrypt(userToken)
          } catch ({code}) {
            expect(code).to.equal('ENOENCRYPTVALUE')
          }
        })
      })
    })
  })
})
