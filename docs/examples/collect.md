# Collecting transaction
[◅ _return to examples_](examples.md#contents)

Collecting a transaction is very simple - just provide the transaction ID and a key, encrypted with [@kiroboio/safe-transfer-crypto]() and salt from Collectable transaction you want to collect:

```TypeScript
interface CollectRequest {
  id: string // transaction ID to collect
  key: string // encrypted key from passcode
}
```

thus, the full code will be:

```TypeScript
import { generateDecryptionKey } from '@kiroboio/safe-transfer-crypto';

function makeCollectableObject(transaction: Collectable, passcode: string) {
  return {
    id: transaction.id,
    key: generateDecryptionKey({
      passcode,
      salt: transaction.salt,
    }),
  }
}

service.collect(makeCollectableObject(transaction, passcode)).catch((err) => console.log(err))
```
Event bus (or directly, if requested) will get the following event:

```TypeScript
{ type: "service_collect_transaction",
  payload: {
    fromNodeTxid: "7ced7833c159d65a093298d4aec8025a4bbe33f84f327cd0e3531d82774a1b93"
  }
}
```
If you have used watch options on this collect or on previous ```getCollectables()``` / ```getRetrievables()``` requests, you will start getting updates about this transaction. First will be:

```TypeScript
{
  type: "service_updated_collectable"
  payload: {
    amount: 100000
    collect: {
      broadcasted: 1111111,
      confirmed: -1,
      txid: "aaaaa"
    }
    createdAt: "2020-06-07T08:02:34.771Z"
    expires: {
      block: 1111222
    },
    from: "Kirobo"
    id: "bbbbb"
    salt: "ccccc"
    state: "collecting"
    to: "xxxxx"
    updatedAt: "2020-06-07T13:15:19.606Z"
  }
}
```
Updates will be coming on on each state change __ready__ > __collecting__ > __collected__. Using changes of the block height from ```getStatus()``` vs ```transaction.collect.confirmed```, it is easy to calculate quantity of confirmations:

![alt](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/examples/screenshots/collected.jpg)

[⬑ _to top_](#collecting-transaction)