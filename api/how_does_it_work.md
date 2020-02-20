# How does it work?
[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)

## Contents

- [Steps](#Steps)
- [Creation](#Creation)
- [Life on server](#Life-on-server)
  - [Subscription](#Subscription)
- [Collection](#Collection)

## Steps

The Retrievable Transfer process consists of several blocks:
- [ creation of retrievable transfer and sending it's details to server ](#Creation)
- [ life-cycle of transaction on server ](#Life-on-server)
- [ collection of the transfer and it's life-cycle after that ](#Collection)

[⬑ _to top_](#How-does-it-work?)

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

- send the above object with data to Kirobo, using [send()](endpoints.md#async-___send()___) function.

After the positive response from server that the transaction has been accepted, current session will be receiving the updates through [eventBus] on the changes of the transaction status. This is how the [subscription](#Subscription) mechanism works.
To check manually or to start getting updates in the new session (connection) use either [getRetrievable()](endpoints.md#async-___getRetrievable()___) with id, or [getCollectables()](endpoints.md#async-___getCollectables()___) using the array of recipient's addresses.

[⬑ _to top_](#How-does-it-work?)

## Life on server

After creation of the Retrievable transaction a Collectable one appears and those, [subscribed](#Subscription) to recipient's address, will receive an event, with Collectable object. We'll talk about subscription mechanism in a bit. The difference between the Retrievable and Collectable objects is slight - after all, both of them are the same transaction. Here are the types of them:

```TypeScript
export type Retrievable = {
  amount: number
  collect: { // below information is available only after the Retrievable Transfer has been collected
    broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // txid of the transaction
  }
  createdAt: string // creation timestamp
  deposit: { // data of the deposit transaction
    txid: string
    vout: number
  }
  expires: { at: string } // expiration time¹
  id: string // transaction id on server¹
  state: string // state of transaction
  to: string // recipient's address
  updatedAt: string // timestamp of last transaction update
}

export type Collectable = {
  amount: number
  collect: {
    broadcasted: number;
    confirmed: number;
    txid: string
  }
  createdAt: string
  expires: { at: string }
  from?: string
  hint?: string
  id: string // transaction id on server, different from the Retrievable one¹
  salt: string // salt for passcode encryption
  state: string
  to: string
  updatedAt: string
}
```
> ¹ We'll cover this below.

Once transaction is sent to server - there are 5 minutes to start the collection process, after which the transaction will be wiped from the server. Once collection has been requested, the transaction changes state to 'collecting' and will be wiped after 10 blocks from confirmation block. The expiration information is provided for your convenience by both Retrievable and Collectable objects.

ID strings are different for security purposes. The Retrievable has an ID, based on deposits' _hash_ and _vout_, while Collectable has a random ID, to avoid compromising the deposit hash, and thus leaking the sender's information. You can check out how to create ID [here](creating_retrievable_id.md#Creating-Retrievable-ID).

[⬑ _to top_](#How-does-it-work?)

### Subscription

Subscription is an automated feature. Every new session of the library use (```const service = new Service()```) creates an individual real-time socket connection to the server. Every request for/about Retrievable and Collectable subscribes this session to the updates about the subject.

For example, a request for all Collectable transactions for address 'xxxxx', will subscribe the session to events about all transactions with 'to: "xxxxx"' in the body, even those, not yet created. A request for Retrievable transaction or creation of Retrievable with 'id: "yyyyy"' will subscribe the session, which was used for that, to all the updates of this transaction.

[⬑ _to top_](#How-does-it-work?)

## Collection

Collection of the transaction is a rather simple process. To do that you just need to know the recipient's address and passcode for individual ones; while for automated systems you need you system needs to recognize and process _hint_ values:

- get the list of transactions for provided address  with [getCollectables()](endpoints.md#async-___getCollectables()___)
- collect the transaction with [collect()](endpoints.md#async-___collect()___), using ID of the selected transaction and a key, generated from the entered passcode and salt. You can read more about encryption/decryption [here](encryption.md#Encryption):

  ```TypeScript
  try {
    const service = new Service()

    service.collect({
      id: selected.id,
      key: createCollectKey(passcode, transaction.salt),
    })
  } catch (e) {
    console.log(e.message)
  }
  ```

[⬑ _to top_](#How-does-it-work?)

[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)