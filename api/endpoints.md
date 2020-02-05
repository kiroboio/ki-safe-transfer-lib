## API Endpoints

- #### ___getSettings()___

  Function to check the current settings of the library session:

  ```typescript
  ...

  const service = new Service({})

  const result = service.getSettings()

  console.log(result)
  // {
  //   debug: 1,
  //   currency: 'btc',
  //   network: 'testnet',
  //   version: 'v1',
  //   respond: 'direct'
  // }
  ```

- #### async ___getCollectables()___

  Get collectable transactions for a certain address:

  ```typescript
  function eventBus(event: Event) {
    console.log('event fired: ', event)
    event fired:  {
      type: 'service_get_collectables',
      payload: [
        {
          amount: 100000,
          collect: {
             broadcasted: -1, confirmed: -1, txid: ''
          },
          createdAt: '2020-02-05T08:51:58.607Z',
          expires: { at: '2020-02-06T08:51:58.607Z' },
          from: 'Kirobo',
          hint: 'xxxxx',
          id: 'xxxxx',
          salt: 'xxxxx',
          state: 'ready',
          to: 'xxxxx',
          updatedAt: '2020-02-05T08:51:58.607Z'
        },
        {
          amount: 100000,
          collect: {
            broadcasted: -1, confirmed: -1, txid: ''
          },
          createdAt: '2020-02-05T08:51:58.607Z',
          expires: { at: '2020-02-06T08:51:58.607Z' },
          id: 'xxxxx',
          salt: 'xxxxx',
          state: 'ready',
          to: 'xxxxx',
          updatedAt: '2020-02-05T10:30:31.862Z'
        }
      ]
    }
  }

  const service = new Service({
    respond: Responses.Callback,
    eventBus,
    })

  service.getCollectables('xxxxx') // provide recipient's address
  ```
  > Read more about object `confirmed` [here]()

- #### async ___getRetrievable()___

  Get information about a retrievable transaction by it's ID:

  ```typescript
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
  > For information on how to make an ID, please refer [this section](how_does_it_work.md).

- #### async ___send()___

  Send _retrievable_ transaction. The format is the following:
  ```typescript
  export type Sendable = {
    amount: number  // amount of transaction
    collect: string // encrypted raw collect transaction, to be collected
    deposit: string // raw deposit transaction, already broadcasted
    from?: string // any text to identify sender, optional
    hint?: string // hint for automated transactions, optional
    id?: string // custom ID, uses hash; more on this below
    to: string // recipient's address
  }
  ```
  > Why and what to encrypt, as well as how, is discussed [here](how_does_it_work.md).

  Sending:

  ```typescript
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

  ```typescript
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
  > Life cycle, including states and expiration is explained [here](how_does_it_work.md).

- #### async ___collect()___

  ```typescript

  Service (collect):  {
    fromNodeTxid: '3792c7051d0f914264057b400bc2649ddaec1b671a6c953a39838cf8a7940595'
  }

  Service (collect) got an error. Transaction Rejected by the Blockchain

  Service (collect) got an error. No record found for id 'dec962629088b1ae2fa9ecd72a6f74a8a8016f91e1239988fd9701069837d3c'

  ```

- #### async ___getStatus()___

