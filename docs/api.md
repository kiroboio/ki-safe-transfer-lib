# Library API

[◅ _return to documentation_](documentation.md)

## Contents

  - [_getSettings()_](#getsettings)
    - [_isAuthed_](#isAuthed)
  - [_getLastAddresses()_](#getlastaddresses)
  - [_clearLastAddresses()_](#clearlastaddresses)
  - [_connect()_](#connect)
  - [_disconnect()_](#disconnect)
  - [_getConnectionStatus()_](#getconnectionstatus)
  - [async _getCollectables()_](#async-getcollectables)
    - [Caching of get Collectables request](#caching-of-get-collectables-request)
  - [async _send()_](#async-send)
  - [async _collect()_](#async-collect)
  - [async _getStatus()_](#async-getstatus)
  - [async _getUtxos()_](find_utxos.md#how-to-use-the-library)
  - [async _getFresh()_](find_addresses.md#how-to-use-the-library)
  - [async _getUsed()_](find_addresses.md#how-to-use-the-library)
  - [async _getRawTransaction()_](#async-getrawtransaction)
  - [async _getRawTransactions()_](#async-getrawtransactions)
  - [async _getByOwnerId()_](#async-getbyownerid)
  - [async _getOnlineNetworks()_](#async-getonlinenetworks)
  - [async _getRate()_](#async-getrate)
  - [async _getRates()_](#async-getrates)
  - [async _retrieve ()_](#async-retrieve)

---

> ☝ "only _direct_ response" message means, that this method has response and it can only be received via direct response, not via [eventBus](event_bus.md).

## ___getSettings()___

  > only _direct_ response

  Function to check the current settings of the library session:

  ```TypeScript
  ...¹

  const service = Service.getInstance({ authDetails })

  const result = service.getSettings()

  console.log(result)
  // {
  //   authDetails: true,
  //   currency: 'btc',
  //   debug: 1,
  //   eventBus: true,
  //   isAuthed: true,
  //   lastAddresses: { addresses: [] },
  //   network: 'testnet',
  //   respondAs: 'callback',
  //   version: 'v1'
  // }
  ```
  > ¹ Here and further we are not going to show the imports and settings of the library in the code. You can get into details [here](setup.md#setup) or see more in [examples](examples/examples.md).

  > ☝ Check more details about [debug levels](setup.md#debug) and [default settings](setup.md#default-settings).

  The object in response contains settings and statuses as following:

  - __authDetails__ - if authentication details are present (__not__ that they are correct)
  - __currency__ - crypto currency
  - __debug__ - [debug level](setup.md#debug)
  - __eventBus__ - if eventBus (callback) function has been set
  - __isAuthed__ - if connection to Kirobo API has been established and authorized
  - __lastAddresses__ - addresses cache for [getCollectables()](#caching-of-get-collectables-request) function
  - __network__ - blockchain network
  - __respondAs__ - global setting for [respond](setup.md#respondas)
  - __version__ - API target version

[⬑ _to top_](#library-api)

### ___isAuthed___

> only _direct_ response

To ensure the library has connected correctly to the API and ready to use, you can get the value of _isAuthed_ state from inside of the library:

```TypeScript
...

const { isAuthed } = service

console.log(isAuthed) // true
```

[⬑ _to top_](#library-api)

## ___getLastAddresses()___

> only _direct_ response

Show [cached](#caching-of-get-collectables-request) addresses, saved after last [getCollectables()](#async-getcollectables):

```TypeScript
...

const result = service.getLastAddresses()

console.log(result) // { addresses: ['xxxxxx', 'xxxxxx'] }
```
or simply:

```TypeScript
...

const { addresses } = service.getLastAddresses()

console.log(addresses) // ['xxxxxx', 'xxxxxx']
```

> Also available via [getSettings()](#getsettings)

[⬑ _to top_](#library-api)

## ___clearLastAddresses()___

Clear [cached](#caching-of-get-collectables-request) addresses, saved after last [getCollectables()](#async-getcollectables):

```TypeScript
...

// check for collectables
await service.getCollectables(['address1'])

// get cached addresses
const checkOne = service.getLastAddresses().addresses

console.log(checkOne) // [ 'address1' ]

// clear addresses
service.clearLastAddresses()

// get cached addresses again
const checkTwo = service.getLastAddresses().addresses

console.log(checkTwo) // []
```

[⬑ _to top_](#library-api)

## ___connect()___

Manual request for library to connect to server:

```TypeScript
...

service.connect()
```

[⬑ _to top_](#library-api)

## ___disconnect()___

Manual request for library to disconnect from server:

```TypeScript
...

service.disconnect()
```
> ☝ If library has been manually disconnected, it will __not__ reconnect itself.

[⬑ _to top_](#library-api)

## ___getConnectionStatus()___

Check connection status of library to the server:

```TypeScript
...

const response = service.getConnectionStatus({ respondDirect: true }))

console.log(response) // true

```

[⬑ _to top_](#library-api)

## async ___getCollectables()___

Get collectable transactions for a certain address or addresses:

```TypeScript
...

service.getCollectables(['xxxxx']) // provide recipient's address(es) in array
```

The method has the following argument/return types:

```TypeScript

async function getCollectables(addresses: string[], options?: QueryOptions): Promise<Results<Collectable> | void>

```
Full set of [QueryOptions](query_options.md) is avaialble for this method. Response will be a part of [Results](results.md) object.

Data received directly or through event bus will of the following structure:
```TypeScript

interface Collectable {
  amount: number // transfer amount in satoshi
  collect: // collect information
  {
    broadcasted: number // block number on broadcast
    confirmed: number // block number on confirmation
    txid: string // the tx ID of the transaction
  }
  createdAt: string // transaction create timestamp
  expires: { // expiration time/blockahin height
    at?: string | Date
    block?: number
  }
  from?: string // sender's attached message
  hint?: string // sender's attached passcode hint
  id: string // unique ID
  salt: string // salt to use in encrpytion on collect
  state: 'ready' | 'collecting' | 'collected' // collect state
  to: string // the destination address
  updatedAt: string // transaction update timestamp
}

```

> ☝ID of Collectable is auto generated by the system and not linked to initial transfer to avoid potential identification of the sender.

### Caching of __getCollectables__ request

Every time you send request for collectables, the address(es) from your last request are being cached in the library. In case Internet connection dropped, the library will attempt  to reconnect once the connection is restored. After successful reconnection, library will use the cached addresses to update (re-send last request for collectables). To check the contents of the cache you can use [getLastAddresses()](#getlastaddresses) function or via [getSettings()](#getsettings). To clear the cache - [clearLastAddresses()](#clearlastaddresses).

[⬑ _to top_](#library-api)

## async ___send()___

Send _retrievable_ transaction:

```TypeScript
...

const transaction: SendRequest = {
  amount: 100000,
  collect: 'xxxxx',
  deposit: 'xxxxx',
  from: 'From Kirobo',
  owner: 'xxxxx',
  salt: 'xxxxx',
  to: 'xxxxx',
}

service.send(transaction)

```

  The type of the argument is the following:
```TypeScript
interface SendRequest {
  amount: number // the transfer amount in satoshi
  collect: string // collect raw transaction
  deposit?: string // deposit raw transaction
  depositPath?: string // deposit hd derived path
  from?: string // free text to be attached to this transfer
  hint?: string // passcode hint for the recipient
  owner: string // owner id of this transaction, maxLength: 120, minLength: 20
  salt: string // salt to encrypt collect transaction and passcode on collection
  to: string // the destination address
}
```
> Why and what to encrypt, as well as how, is discussed [here](encryption.md#encryption).

In case of successful acceptance of transaction by the API, it will respond with the following:

```TypeScript
{
  amount: 100000,
  createdAt: '2020-02-05T08:51:58.598Z',
  deposit: {
    txid: 'xxxxx', // can be used to match the response with original transaction in your system
    vout: 0
  },
  expires: { at: '2020-02-06T08:51:58.598Z' }, // after this time, the transaction, if not being collected, will be purged
  from: 'From Kirobo',
  id: 'xxxxx',
  state: 'new', // state updates will be sent through the eventBus only, according to transaction life cycle
  to: 'xxxxx',
  updatedAt: '2020-02-05T08:51:58.598Z'
}
```
> Life cycle, including states and expiration is explained [here](how_does_it_work.md#how-does-it-work).

[⬑ _to top_](#library-api)

## async ___collect()___

Collect Collectable transaction:

```TypeScript
function eventBus(event: Event) {
  console.log('event fired: ', event)

// >>> event #1

// *** if unsuccessful:

// event fired:  {
  // type: 'service_message',
  // payload: {
  //  isError: true,
  //  text: "Transaction Rejected by the Blockchain"
  //  }

  // ***  or, if successful:

  // event fired:  {
  // type: 'service_collect_transaction',
  // payload: {
  //  data: {
  //    fromNodeTxid: "xxxxxx"
  //    },
  //    isError: false,
  //    text: "Request submitted."
  //}

  // >>> event #2 (only if successful)

  // event fired:
  // { type: "service_updated_collectable"
  // payload: {
  //   amount: 100000
  //   collect: {
  //     broadcasted: 1111111,
  //     confirmed: -1,
  //     txid: "aaaaa"
  //   }
  //   createdAt: "2020-06-07T08:02:34.771Z"
  //   expires: {
  //     block: 1111222
  //   },
  //   from: "Kirobo"
  //   id: "bbbbb"
  //   salt: "ccccc"
  //   state: "collecting"
  //   to: "xxxxx"
  //   updatedAt: "2020-06-07T13:15:19.606Z"
  // }
}

try {

  const service = Service.getInstance({
    respond: Responses.Callback,
    eventBus
    })

  service.collect({
    id: selected.id,
    key: createCollectKey(passcode, transaction.salt),
  })

} catch (err) {
  console.log(err)
}
```

If transaction ID is wrong (for example, it [expired](how_does_it_work.md#expiration) before the collect request has reached the server), the error message will be:

```
No record found for id 'xxxxxx'
```

[⬑ _to top_](#library-api)

## async ___getStatus()___

Get status - block height for current network, server status and average fee for the latest block. The height and the fee are taken from the blockchain directly.

```TypeScript

async function run() {

  try {
    const service = new Service({ authDetails })
    const result = await service.getStatus()
    console.log(result)
    // { height: 123456, online: true, fee: 12345 }
  } catch (e) {
    console.log('error: ', e.message)
  }

}

run()
```
[⬑ _to top_](#library-api)
[
## async  ___getRawTransaction()___

Working with hardware wallet one might face situation when raw transactions are required for certain transaction IDs. Kirobo API provides such a service. You can request raw transactions for a single transaction ID (below) or [multiple IDs](#async-getrawtransactions).

```TypeScript
try {
  service.getRawTransaction('transaction_id')
} catch (err) {
  console.log(err)
}
```
The response will be:
```TypeScript
{ type: 'service_get_raw_transactions',
  payload:
   { hex:
      '5g9caZjdzDNX1JZMFWDv39YXq9Qn41ncLSSHc4yRBxiRjTTB0vaKNtlyqVJp9i0a4e2fr72XhxzUrHvmf2Q8mRrY43iwV9dlFYYjKOnfAhlWkPHuXROqgnaCsmTul1rqG8ZdKQFtBagKdSGSDLyJwgCdwHB4gbsrj4yjArthgG4zAODKC6ZoybRBBNt6ioOq78PKFmW7KsK0OCAruOTmBVuDQ0X9YjAu323nf6nf1MVnRFF1vNIjMxgKWcegfPwV5g9caZjdzDNX1JZMFWDv39YXq9Qn41ncLSSHc4yRBxiRjTTB0vaKNtlyqVJp9i0a4e2fr72XhxzUrHvmf2Q8mRrY43iwV9dlFYYjKOnfAhlWkPHuXROqgnaCsmTul1rqG8ZdKQFtBagKdSGSDLyJwgCdwHB4gbsrj4yjArthgG4zAODKC6ZoybRBBNt6ioOq78PKFmW7KsK0OCAruOTmBVuDQ0X9YjAu323nf6nf1MVnRFF1vNIjMxgKWcegfPwV',
     txid: 'transaction_id'
   }
}
```

⬑ _to top_](#library-api)

## async  ___getRawTransactions()___

If you want to use multiple transaction IDs (you can check single method above), do the following:

```TypeScript
  try {
    service.getRawTransactions(['transaction_id1','transaction_id2'])
  } catch (err) {
    console.log(err)
  }
}
```

For this the response will be:

```TypeScript
 type: 'service_get_raw_transactions',
  payload:
   { total: 2,
     limit: 100,
     skip: 0,
     data:
      [ { hex:
           '5g9caZjdzDNX1JZMFWDv39YXq9Qn41ncLSSHc4yRBxiRjTTB0vaKNtlyqVJp9i0a4e2fr72XhxzUrHvmf2Q8mRrY43iwV9dlFYYjKOnfAhlWkPHuXROqgnaCsmTul1rqG8ZdKQFtBagKdSGSDLyJwgCdwHB4gbsrj4yjArthgG4zAODKC6ZoybRBBNt6ioOq78PKFmW7KsK0OCAruOTmBVuDQ0X9YjAu323nf6nf1MVnRFF1vNIjMxgKWcegfPwV5g9caZjdzDNX1JZMFWDv39YXq9Qn41ncLSSHc4yRBxiRjTTB0vaKNtlyqVJp9i0a4e2fr72XhxzUrHvmf2Q8mRrY43iwV9dlFYYjKOnfAhlWkPHuXROqgnaCsmTul1rqG8ZdKQFtBagKdSGSDLyJwgCdwHB4gbsrj4yjArthgG4zAODKC6ZoybRBBNt6ioOq78PKFmW7KsK0OCAruOTmBVuDQ0X9YjAu323nf6nf1MVnRFF1vNIjMxgKWcegfPwV',
          txid: 'transaction_id1'
        },
        { hex:
           'AtupzJHwKvCEYZvi2pekq35nlM4K9P0hDkctPIlGEPnwpfHX8tx4lVt2kNhYC0EVr6tHFoBEpJLTqX7Kdd25CVFaQjcMSlDGhV1mDM0ce2ATnXKFSBkxtEgpAeshgjqr5meNreXLAzj4SM15wR5QSuJ0uKOmuRb89qer27eCkMgBpAsh9uYRH2A7eStEmvptebsga2ZC9fdplqjQxyFuWMyf0XD4F3QpsH3BEGNfQsnXBjMLlibIhnkLaGlM4O1BAtupzJHwKvCEYZvi2pekq35nlM4K9P0hDkctPIlGEPnwpfHX8tx4lVt2kNhYC0EVr6tHFoBEpJLTqX7Kdd25CVFaQjcMSlDGhV1mDM0ce2ATnXKFSBkxtEgpAeshgjqr5meNreXLAzj4SM15wR5QSuJ0uKOmuRb89qer27eCkMgBpAsh9uYRH2A7eStEmvptebsga2ZC9fdplqjQxyFuWMyf0XD4F3QpsH3BEGNfQsnXBjMLlibIhnkLaGlM4O1B',
          txid: 'transaction_id2' }
      ]
   }
}
```

[⬑ _to top_](#library-api)

## async ___getByOwnerId()___

To get all available transactions for a certain owner ID:

```TypeScript
try {
// get all transactions with the owner ID
service.getByOwnerId(
  'xxxxx',
)
} catch (err) {
  console.log(err)
}
```

Event bus will get [Results](results.md) object with [paging](query_options.md#paging) details and with array of transactions or empty array if non has been found:

```TypeScript
{ type: 'service_get_by_owner_id',
  payload:
   { total: 1,
     limit: 100,
     skip: 0,
     data:
      [ { amount: 100000,
          collect: {},
          createdAt: '2020-06-07T08:02:34.695Z',
          deposit:
           { txid: 'aaaaaa',
             vout: 0,
             value: 100744,
             address: 'bbbbb',
             path: "derivation_path" },
          expires: { at: '2020-06-07T20:02:34.695Z' },
          from: 'Kirobo',
          id: 'yyyyy',
          retrieve: { broadcasted: -1, confirmed: -1, txid: '' },
          state: 'ready',
          to: 'zzzzz',
          updatedAt: '2020-06-07T08:02:34.759Z',
          owner:
           'xxxxx'
        }
      ]
   }
}
```
> Transaction type is [Retrievable](how_does_it_work.md#life-on-server).

[⬑ _to top_](#library-api)

## async ___getOnlineNetworks()___

To check available blockchain networks:

```TypeScript
try {
  service.getOnlineNetworks()
} catch (err) {
  console.log(err)
}
```
to get [Results](results.md) object, like:

```TypeScript
{ type: 'service_get_online_networks',
  payload:
   { total: 2,
     limit: 100,
     skip: 0,
     data:
      [ { height: 1764243,
          online: true,
          netId: 'testnet',
          timestamp: 1591711682,
          fees: [ 500257, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000 ],
          fee: 1087,
          updatedAt: '2020-06-09T14:08:12.136Z' },
        { height: 633879,
          online: true,
          netId: 'main',
          timestamp: 1591711240,
          fees: [ 100879, 69101, 42935, 24462, 24462, 21985, 20570, 20570, 20570, 20570 ],
          fee: 90286.33333333333,
          updatedAt: '2020-06-09T14:00:54.866Z' }
      ]
   }
}
```
[⬑ _to top_](#library-api)

## async ___getRate()___

Kirobo API offers fresh BTC/USD exchange rate:
```TypeScript
try {
  service.getRate({ source: RatesSources.COINGECKO, options: { watch: Watch.ADD } })
} catch (err) {
  console.log(err)
}
```
You will be getting the following event:
```TypeScript
{
  type: 'service_get_btc_to_usd_rate',
  payload:
   { source: 'coingecko.com', timestamp: 1591266540, online: true, value: 9533.772 }
}
```
> ☝If your preferred source is BitFinex, then you don't have to specify it, as it is a default one:
```TypeScript
service.getRate({ options: { watch: Watch.ADD } })
```

[⬑ _to top_](#library-api)

## async ___getRates()___

You can request exchange rates from 3 sources:
```TypeScript
try {
  service.getRates()
} catch (err) {
  console.log(err)
}
```

eventBus will receive the following:
```TypeScript
{
  type: 'service_get_btc_to_usd_rates',
  payload:
    { total: 3,
      limit: 100,
      skip: 0,
      data:
      [
        { source: 'coingecko.com', timestamp: 1591265280, online: true, value: 9540.962 },
        { source: 'blockchain.info', timestamp: 1591265280, online: true, value: 9534.79 },
        { source: 'bitfinex.com', timestamp: 1591265280, online: true, value: 9543.8 }
      ]
    }
}
```
[⬑ _to top_](#library-api)

## async ___retrieve()___

To retrieve a transaction:

```TypeScript
try {
  service.retrieve({ id: 'aaaaa', raw: 'bbbbb' })
} catch (err) {
  console.log(err)
}
```
and you will get:

```TypeScript
{ fromNodeTxid: 'transaction_id' }
```
[⬑ _to top_](#library-api)

[◅ _return to documentation_](documentation.md)
