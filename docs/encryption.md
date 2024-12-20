# Encryption

[◅ _return to documentation_](documentation.md)

## Contents

- [Why encryption?](#why-encryption)
- [What is being encrypted?](#what-is-being-encrypted)
- [How to do it?](#how-to-do-it)
- [What about collecting?](#what-about-collecting)

---

## Why encryption?

Encryption is required to for additional layer of client's data protection, even in case of  successful attack on server. The only data, which is not encrypted and can be exposed to attacker:
- deposit transaction - it's freely available on the blockchain and required by the server to verify the validity of the transaction as well as to ensure the balance is valid on submission of transaction to server;
- recipient's address - can't be encrypted, as it is required for the recipient to receive the transaction, sent to him (his address);
- *from* value - optional, and even if provided can be a non-meaningful string;
- *hint* value - optional, and might have meaning only for  automated recipient;
- salt;
- amount.

The main element - the signed collect transaction, is encrypted to ensure it can't be used without the key. The passcode is not sent with Retrievable transaction The key for collection, when sent to server, is an encrypted passcode;  the expiration policies ensure, that data is wiped and not stored - the successful transactions can be found on the blockchain.
> ☝ despite passcode being always hidden, we highly recommend ___not to reuse passcodes___.

[⬑ _to top_](#encryption)

## What is being encrypted?

As mentioned above, the signed collect transaction and the passcode (in collect request) are the only valuable data and both being encrypted. Encrypting passcode before sending it to collect transaction creates additional security layer to protect in case of traffic hijacking.

For encryption/decryption we provide the [Retrievable Transfer Crypto](https://github.com/kiroboio/ki-safe-transfer-crypto) npm library. The reason for not making Crypto a part of this library is to make the process more transparent and to give users more control of the Retrievable Transfer flow.

[⬑ _to top_](#encryption)

## How to do it?

To encrypt the collect transaction when sending

```TypeScript
import {
  generateSalt,
  encryptTransaction,
} from '@kiroboio/safe-transfer-crypto'

const salt = generateSalt({ raw: raw_collect_transaction })

const encryptedTrx = encryptTransaction({
  raw: raw_collect_transaction,
  passcode: passcode,
  salt: salt,
})
```

[⬑ _to top_](#encryption)

## What about collecting?

```TypeScript
import {generateDecryptionKey} from '@kiroboio/safe-transfer-crypto'

const createCollectKey = (passcode: string, salt: string) => generateDecryptionKey({ passcode, salt })
```
> Salt is provided from the server as a part of Collectable object.

[⬑ _to top_](#encryption)

[◅ _return to documentation_](documentation.md)