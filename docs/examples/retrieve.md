# Retrieve a transaction from deposit
[◅ _return to examples_](examples.md#contents)

To retrieve available transaction, you need to ensure that it's state is __ready__. Then send retrieve request:

```TypeScript
interface RetrieveRequest {
  id: string
  raw: string
}
```



[⬑ _to top_](#retrieve-transaction-from-deposit)