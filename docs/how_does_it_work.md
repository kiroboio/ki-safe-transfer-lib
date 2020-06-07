# How does it work?
[◅ _return home_](README.md#kirobo-retrievable-transfer-library-documentation)

## Contents

- [Steps](#steps)
- [Creation](#creation)
- [Life on server](#life-on-server)
  - [Retrievable type](#retrievable-type)
  - [Collectable type](#collectable-type)
  - [Expiration](#expiration)
  - [Subscription](#subscription)
- [Collection](#collection)

## Steps

The Retrievable Transfer process consists of several blocks:
- [ creation of retrievable transfer and sending it's details to server ](#creation)
- [ life-cycle of transaction on server ](#life-on-server)
- [ collection of the transfer and it's life-cycle after that ](#collection)

[⬑ _to top_](#how-does-it-work)

## Creation

To create a retrievable transfer (or just Retrievable), that can be collected the following steps have to be made:

- make deposit transaction (create, sign, transmit)
- create collection transaction from deposit to recipient's address (create, sign, ___but not transmit___)
- form an object, based on the following structure:

  ```TypeScript
  {
    amount: number, // amount in  satoshi
    collect: string, // collected transaction, encrypted¹
    deposit: string, // deposit transaction
    to: string, // recipient's address
    from?: string, // free-form text to describe sender, optional
    hint?: string, // this is for automated systems to send a hint of passcode to use, thus not revealing either passcode or logic to the Kirobo, optional
  }
  ```
  > ¹ for encrypting transaction, please refer [this section](encryption.md).

- send the above object with data to Kirobo, using [send()](endpoints.md#async-send) function.

After the positive response from server that the transaction has been accepted, current session will be receiving the updates through [eventBus] on the changes of the transaction status. This is how the [subscription](#subscription) mechanism works.
To check manually or to start getting updates in the new session (connection) use either [getRetrievable()](endpoints.md#async-getretrievable) with id, or [getCollectables()](endpoints.md#async-getcollectables) using the array of recipient's addresses.

[⬑ _to top_](#how-does-it-work)

## Life on server

After creation of the Retrievable transaction a Collectable one appears and those, [subscribed](#subscription) to recipient's address, will receive an event, with Collectable object. We'll talk about subscription mechanism in a bit. The difference between the Retrievable and Collectable objects is slight - after all, both of them are the same transaction. Here are the types of them:

### Retrievable type

```TypeScript
interface Retrievable {
  amount: number // transfer amount in satoshi
  collect: {
    // collect object, available only when collection has started
    broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  createdAt: string | Date
  deposit: {
    // deposit transaction details
    txid: string // deposit transaction ID
    vout: number // vector of output
    value: number // amount transferred
    address: string // address of deposit
    path?: string // derivation path
  }
  retrieve: {
    // retrieve transaction details
    broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  expires: { at?: string; block?: number } // expiration details time/block height
  from?: string // 'from' note
  hint?: string // password hint
  id: string // generated inidividual ID of transaction record
  state: string // state of the transaction
  to: string // address of the recipient
  updatedAt: string | Date
  owner: string // owner ID
}
```
[⬑ _to top_](#how-does-it-work)

### Collectable type

```TypeScript
interface Collectable {
  amount: number // the transfer amount in satoshi
  collect: // collect information
  {
     broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  createdAt: string
  expires: { at?: string | Date; block?: number } // expiration details time/block height
  from?: string // 'from' note
  hint?: string // password hint
  id: string // generated inidividual ID of transaction record
  salt: string // salt is used to encrypt the 'collect' transaction
  state: 'ready' | 'collecting' | 'collected' // state of the transaction
  to: string // address of the recipient
  updatedAt: string
}
```

[⬑ _to top_](#how-does-it-work)


#### Expiration

Once transaction is sent to server - there are 5 minutes to start the collection process, after which the transaction will be wiped from the server. Once collection has been requested, the transaction changes state to 'collecting' and will be wiped after 10 blocks from confirmation block. The expiration information is provided for your convenience by both Retrievable and Collectable objects.

ID strings are different for security purposes. The Retrievable has an ID, based on deposits' _hash_ and _vout_, while Collectable has a random ID, to avoid compromising the deposit hash, and thus leaking the sender's information. You can check out how to create ID [here](create_retrievable_id.md#create_retrievable_id).

[⬑ _to top_](#how-does-it-work)

### Subscription

Subscription is an automated feature. Every new session of the library use (```const service = new Service({ authDetails })```) creates an individual real-time socket connection to the server. Every request for/about Retrievable and Collectable subscribes this session to the updates about the subject.

For example, a request for all Collectable transactions for address 'xxxxx', will subscribe the session to events about all transactions with 'to: "xxxxx"' in the body, even those, not yet created. A request for Retrievable transaction or creation of Retrievable with 'id: "yyyyy"' will subscribe the session, which was used for that, to all the updates of this transaction.

[⬑ _to top_](#how-does-it-work)

## Collection

Collection of the transaction is a rather simple process. To do that you just need to know the recipient's address and passcode for individual ones; while for automated systems you need you system needs to recognize and process _hint_ values:

- get the list of transactions for provided address  with [getCollectables()](endpoints.md#async-getcollectables)
- collect the transaction with [collect()](endpoints.md#async-collect), using ID of the selected transaction and a key, generated from the entered passcode and salt. You can read more about encryption/decryption [here](encryption.md#encryption):

  ```TypeScript
  try {
    const service = new Service({ authDetails })

    service.collect({
      id: selected.id,
      key: createCollectKey(passcode, transaction.salt),
    })
  } catch (e) {
    console.log(e.message)
  }
  ```

[⬑ _to top_](#how-does-it-work)

[◅ _return home_](README.md#kirobo-retrievable-transfer-library-documentation)