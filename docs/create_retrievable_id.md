# Create Retrievable ID
[◅ _return home_](api.md#api-documentation)

To make a Retrievable ID, you need txid of deposit transaction and it's vout. Then, using the following formula, you can create an ID for a Retrievable transaction.

```TypeScript
const makeTransactionId = (txid: string, vout: number): string =>
  `${txid}${(+vout || 0).toString(16).padStart(4, '0')}`

```

> Please, note, that Collectable transaction's ID is _different_ - it's random in order not to disclose to others deposit's details, before the right passcode is entered and transaction is posted to blockchain.