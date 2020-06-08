# Retrieve a transaction from deposit
[◅ _return to Examples_](examples.md#contents)

To retrieve available transaction, you need to ensure that it's state is __ready__. Then send retrieve request:

```TypeScript
interface RetrieveRequest {
  id: string // ID of the transaction you want to retrieve
  raw: string // Raw transaction
}
```
The ID can be obtained from [getByOwnerId()](examples.md#get-retrievable-transfers-by-owner-id). Raw transaction will be published to blockchain and in response the library will send:

```TypeScript
fromNodeTxid: 'transaction_id'
```


[⬑ _to top_](#retrieve-transaction-from-deposit)