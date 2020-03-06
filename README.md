# Client

Clients for Email, SMS, Submitter, User Data Store, User File Store, and JWT.

## JSON Web Token client

Base client for requests to endpoints which require a JSON Web Token for authentication.

### Using a client

``` javascript
const FBJWTClient = require('@ministryofjustice/fb-client/user/jwt/client')

const jwtClient = new FBJWTClient(serviceSecret, serviceSlug, microserviceUrl, [errorClass])
```

#### Service Secret

A `serviceSecret` is _required_.

The constructor will throw an error if no `serviceSecret` is provided.

#### Service Slug

A `serviceSlug` is _required_.

The constructor will throw an error if no `serviceSlug` is provided.

#### Microservice URL

A `microserviceUrl` is _required_.

The constructor will throw an error if no `microserviceUrl` is provided.

#### Error Class

An `errorClass` is _optional_.

### Extending

``` javascript
class FBMyClient extends FBJWTClient {
  constructor (serviceSecret, serviceSlug, microserviceUrl, [myVar]) {
    super(serviceSecret, serviceSlug, microserviceUrl)
    this.myVar = myVar // assign the optional constructor argument
  }
}

const myClient = new FBMyClient('service_secret', 'myservice', 'http://myservice', ['my var'])
```

``` javascript
// a custom error class extending the base error class
class FBAnotherClientError extends FBJWTClient.prototype.ErrorClass {}

class FBAnotherClient extends FBJWTClient {
  constructor (serviceSecret, serviceSlug, microserviceUrl) {
    super(serviceSecret, serviceSlug, microserviceUrl, FBAnotherClientError)
  }
}
```

### Methods

- `generateAccessToken`

  Generate a JWT access token

- `createEndpointUrl`

  Create the URL for an endpoint

- `sendGet`

  Dispatch `GET` requests to an endpoint

- `sendPost`

  Dispatch `POST` requests to an endpoint

- `encrypt`

  Encrypt data with AES 256

- `decrypt`

  Decrypt data

- `encryptUserIdAndToken`

  Encrypt the user ID and token using the service secret

- `decryptUserIdAndToken`

  Decrypt the user ID and token using the service secret

- `handleRequestError`

  This function will be invoked with an error an argument when the transaction fails

- `createRequestOptions`

  Create request options, whether `GET` or `POST`

- `throwRequestError`

  This function can be invoked to throw request errors

## JSON Web Token client implementations

### Data Store client

Client for requests to datastore endpoints.

#### Using a client

``` javascript
const FBUserDataStoreClient = require('@ministryofjustice/fb-client/user/datastore/client')

const userDataStoreClient = new FBUserDataStoreClient(serviceSecret, serviceSlug, userDataStoreUrl)
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
const FBUserFileStoreClient = require('@ministryofjustice/fb-client/user/filestore/client')

const userFileStoreClient = new FBUserFileStoreClient(serviceSecret, serviceSlug, userFileStoreUrl)
```

#### Fetching and storing

##### Fetching
``` javascript
// fetch user file
const userFile = await userFileStoreClient.fetch(userId, userToken, fingerprint)
```

##### Storing

Define a policy:

``` javascript
const policy = { [max_size], [expires], [allowed_types] }
```

Either:
``` javascript
// store user file from file data
const uploadDetails = await userFileStoreClient.store(userId, userToken, file, policy)
```

Or:
``` javascript
// store user file from file path
const uploadDetails = await userFileStoreClient.storeFromPath(userId, userToken, filePath, policy)
```
