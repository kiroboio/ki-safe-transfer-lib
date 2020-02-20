# API Endpoints
[◅ _return home_](README.md#Kirobo-Retrievable-Transfer-Library-Documentation)

## Contents

  - [_getSettings()_](#getSettings)
  - [_getLastAddresses()_](#getLastAddresses)
  - [_clearLastAddresses()_](#clearLastAddresses)
  - [_connect()_](#connect)
  - [async _getCollectables()_](#async-getCollectables)
    - [Caching of get Collectables request](#Caching-of-get-Collectables-request)
  - [async _getRetrievable()_](#async-getRetrievable)
  - [async _send()_](#async-send)
  - [async _collect()_](#async-collect)
  - [async _getStatus()_](#async-getStatus)



## ___getSettings()___

  Function to check the current settings of the library session:

  ```TypeScript
  ...

  const service = new Service()

  const result = service.getSettings()

  console.log(result)
  // {
  //   debug: 2,
  //   currency: 'btc',
  //   network: 'testnet',
  //   version: 'v1',
  //   respondAs: 'direct'
  // }
  ```

  > Check more details about [debug levels](setup.md#debug) and [default settings](setup.md#Default-settings).

  [⬑ _to top_](#API-Endpoints)

## ___getLastAddresses()___

  Show [cached](#Caching-of-get-Collectables-request) addresses, saved after last [getCollectables()](#async-getCollectables):

  ```TypeScript

  const result = service.getLastAddresses()

  console.log(result) // ['xxxxxx', 'xxxxxx']

  ```

  [⬑ _to top_](#API-Endpoints)

## ___clearLastAddresses()___

  Clear [cached](#Caching-of-get-Collectables-request) addresses, saved after last [getCollectables()](#async-getCollectables):

  ```TypeScript

  service.clearLastAddresses()

  ```

  [⬑ _to top_](#API-Endpoints)

## ___connect()___

  Get information about library connection status and connect/disconnect library from Kirobo service.

  To check connection status:

  ```TypeScript

  const service = new Service()

  const status = service.connect({ action: SwitchActions.STATUS })

  console.log(status) // true

  ```

  To connect:

  ```TypeScript

  service.connect({ action: SwitchActions.CONNECT, value: true })

  // will be a minor connection delay

  const status = service.connect({ action: SwitchActions.STATUS })

  console.log(status) // true

  ```

  To disconnect:

  ```TypeScript

  service.connect({ action: SwitchActions.CONNECT, value: false })

  const status = service.connect({ action: SwitchActions.STATUS })

  console.log(status) // false

  ```

  To toggle connection:

  ```TypeScript

  service.connect({ action: SwitchActions.CONNECT })

  // might a minor connection delay, if connecting

  ```

  [⬑ _to top_](#API-Endpoints)

## async ___getCollectables()___

  Get collectable transactions for a certain address:

  ```TypeScript
  function eventBus(event: Event) {
    console.log('event fired: ', event)
    // event fired:  {
    //   type: 'service_get_collectables',
    //   payload: [
    //     {
    //       amount: 100000,
    //       collect: {
    //          broadcasted: -1, confirmed: -1, txid: ''
    //       },
    //       createdAt: '2020-02-05T08:51:58.607Z',
    //       expires: { at: '2020-02-06T08:51:58.607Z' },
    //       from: 'Kirobo',
    //       hint: 'xxxxx',
    //       id: 'xxxxx',
    //       salt: 'xxxxx',
    //       state: 'ready',
    //       to: 'xxxxx',
    //       updatedAt: '2020-02-05T08:51:58.607Z'
    //     },
    //     {
    //       amount: 100000,
    //       collect: {
    //         broadcasted: -1, confirmed: -1, txid: ''
    //       },
    //       createdAt: '2020-02-05T08:51:58.607Z',
    //       expires: { at: '2020-02-06T08:51:58.607Z' },
    //       id: 'xxxxx',
    //       salt: 'xxxxx',
    //       state: 'ready',
    //       to: 'xxxxx',
    //       updatedAt: '2020-02-05T10:30:31.862Z'
    //     }
    //   ]
    // }
  }

  const service = new Service({
    respond: Responses.Callback,
    eventBus,
    })

  service.getCollectables('xxxxx') // provide recipient's address
  ```
  > Read more about object contents [here](how_does_it_work#Life-on-server).

  ### Caching of get Collectables request

  Every time you send request for collectables, the address(es) from your last request are being cached in the library. In case Internet connection dropped, the library will attempt  to reconnect once the connection is restored. After successful reconnection, library will use the cached addresses to update (re-send last request for collectables). To check the contents of the cache you can use [getLastAddresses()](#getLastAddresses) function. To clear the cache - [clearLastAddresses()](#clearLastAddresses).

  [⬑ _to top_](#API-Endpoints)

## async ___getRetrievable()___

  Get information about a retrievable transaction by it's ID:

  ```TypeScript
  function eventBus(event: Event) {
      console.log('event fired: ', event)
      // event fired:  {
      //  type: 'service_get_retrievable',
      //  payload: {
      //    amount: 23000,
      //    createdAt: '2020-02-03T10:53:57.120Z',
      //    deposit: {
      //      txid: 'xxxxx',
      //      vout: 0
      //    },
      //    expires: { at: '2020-02-04T10:53:57.120Z' },
      //    id: 'xxxxx',
      //    state: 'ready',
      //    to: 'xxxxx',
      //    updatedAt: '2020-02-03T12:46:15.054Z'
      //  }
      // }
  }

  const service = new Service({
    respond: Responses.Callback,
    eventBus,
    })

  service.getRetrievable('xxxxx') // provide transaction id
  ```
  > For information on how to make an ID, please refer [this section](creating_retrievable_id.md).

  [⬑ _to top_](#API-Endpoints)

## async ___send()___

  Send _retrievable_ transaction. The format is the following:
  ```TypeScript
  export type Sendable = {
    amount: number  // amount of transaction
    collect: string // encrypted raw collect transaction, to be collected
    deposit: string // raw deposit transaction, already broadcasted
    from?: string // any text to identify sender, optional
    hint?: string // hint for automated transactions, optional
    id?: string // custom ID, uses hash, optional; more on this below
    to: string // recipient's address
  }
  ```
  > Why and what to encrypt, as well as how, is discussed [here](encryption.md#Encryption).

  Sending:

  ```TypeScript
  const service = new Service({
    respond: Responses.Callback,
    eventBus,
  })

  const transaction: Sendable = {
    amount: 100000,
    collect: 'xxxxx',
    deposit: 'xxxxx',
    from: 'From Kirobo',
    id: 'hash;xxxxxx',
    to: 'xxxxx',
  }

  service.send(transaction)
  ```
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
  > Life cycle, including states and expiration is explained [here](how_does_it_work.md#How-does-it-work?).

  [⬑ _to top_](#API-Endpoints)

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

    // event fired:  {
    // type: 'service_updated_collectable',
    // payload: {
    //  amount: 12345
    //  collect: {
    //  broadcasted: 12345;
    //  confirmed: -1; // only will be updated, when 1st confirmation happens
    //  txid: 'xxxxxx'
    //}
    //  createdAt: "2020-02-20T13:12:26.064Z"
    //  expires: { at: string }
    //  from: 'Kirobo
    //  id: 'xxxxxx'
    //  salt: 'xxxxxx'
    //  state: 'collecting'
    //  to: 'xxxxxx'
    //  updatedAt: "2020-02-20T13:12:26.064Z"
    //}

  try {

    const service = new Service({
      respond: Responses.Callback,
      eventBus
      })

    service.collect({
      id: selected.id,
      key: createCollectKey(passcode, transaction.salt),
    })

  } catch (e) {
    console.log('error: ', e.message)
  }
  ```

  If transaction ID is wrong (for example, it [expired](how_does_it_work.md#Expiration) before the collect request has reached the server), the error message will be:

  ```
  No record found for id 'xxxxxx'
  ```

  [⬑ _to top_](#API-Endpoints)

## async ___getStatus()___

Get status - block height for current network, server status and average fee for the latest block. The height and the fee are taken from the blockchain directly.

  ```TypeScript

  async function run() {

    try {
      const service = new Service()
      const result = await service.getStatus()
      console.log(result)
      // { height: 123456, online: true, fee: 12345 }
    } catch (e) {
      console.log('error: ', e.message)
    }

  }

  run()
  ```

  [⬑ _to top_](#API-Endpoints)

  [◅ _return home_](README.md#Kirobo-Retrievable-Transfer-Library-Documentation)
