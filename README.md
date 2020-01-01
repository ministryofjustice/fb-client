# Client

Clients for Email, SMS, Submitter, User Data Store, User File Store, and JWT.

## JSON Web Token client

Base client for requests to endpoints which require a JSON Web Token for authentication.

### Using a client

``` javascript
// require the client class
const FBJWTClient = require('@ministryofjustice/fb-client/user/jwt/client')

// create a client instance
const jwtClient = new FBJWTClient(serviceSecret, serviceToken, serviceSlug, microserviceUrl, [errorClass])
```

#### `serviceSecret`

A `serviceSecret` is _required_.

The constructor will throw an error if no `serviceSecret` is provided.

#### `serviceToken`

A `serviceToken` is _required_.

The constructor will throw an error if no `serviceToken` is provided.

#### `serviceSlug`

A `serviceSlug` is _required_.

The constructor will throw an error if no `serviceSlug` is provided.

#### `microserviceUrl`

A `microserviceUrl` is _required_.

The constructor will throw an error if no `microserviceUrl` is provided.

#### `errorClass`

An `errorClass` is _optional_.

### Extending

``` javascript
// extend base class
class FBMyClient extends FBJWTClient {
  constructor (serviceSecret, serviceToken, serviceSlug, microserviceUrl, myVar) {
    super(serviceSecret, serviceToken, serviceSlug, microserviceUrl)
    // do something with additional constructor argument
    this.myVar = myVar
  }
}

const myClient = new FBMyClient('service_secret', 'service_token', 'myservice', 'http://myservice', 'my var')
```

``` javascript
// extend base class with custom error
class FBAnotherClient extends FBJWTClient {
  constructor (serviceSecret, serviceToken, serviceSlug, microserviceUrl) {
    // create custom error class
    class FBAnotherClientError extends FBJWTClient.prototype.ErrorClass {}
    super(serviceSecret, serviceToken, serviceSlug, microserviceUrl, FBAnotherClientError)
  }
}
```

### Methods

- generateAccessToken

  Generate a JWT access token

- createEndpointUrl

  Create the URL for an endpoint

- sendGet

  Dispatch `GET` requests to an endpoint

- sendPost

  Dispatch `POST` requests to an endpoint

- encrypt

  Encrypt data with AES 256

- decrypt

  Decrypt data

- encryptUserIdAndToken

  Encrypt the user ID and token using the service secret

- decryptUserIdAndToken

  Decrypt the user ID and token using the service secret

- handleRequestError

  This function will be invoked with an error an argument when the transaction fails

- createRequestOptions

  Create request options, whether `GET` or `POST`

- throwRequestError

  This function can be invoked to throw request errors

## JSON Web Token client implementations

### Data Store client

Client for requests to datastore endpoints.

#### Using a client

``` javascript
// load client
const FBUserDataStoreClient = require('@ministryofjustice/fb-client/user/datastore/client')

// initialise client
const userDataStoreClient = new FBUserDataStoreClient(serviceSecret, serviceToken, serviceSlug, userDataStoreUrl)
```

#### Fetching and storing

``` javascript
// fetch user data
const userData = await userDataStoreClient.getData(userId, userToken)

// store user data
await userDataStoreClient.setData(userId, userToken, userData)
```

### File Store client

Client for requests to filestore endpoints.

#### Using a client

``` javascript
// load client
const FBUserFileStoreClient = require('@ministryofjustice/fb-client/user/filestore/client')

// initialise client
const userFileStoreClient = new FBUserFileStoreClient(serviceSecret, serviceToken, serviceSlug, userFileStoreUrl)
```

#### Fetching and storing

``` javascript
// fetch user file
const userFile = await userFileStoreClient.fetch(userId, userToken, fingerprint)
// userFile => { file }

// With the policy defined
const policy = { [max_size], [expires], [allowed_types] }

let uploadDetails

// Either
// store user file
uploadDetails = await userFileStoreClient.store(userId, userToken, file, policy)
// uploadDetails => { fingerpint, url, size, type, date }

// Or
// store user file from file path
uploadDetails = await userFileStoreClient.storeFromPath(userId, userToken, filePath, policy)
```
