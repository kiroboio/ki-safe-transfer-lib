# Encryption
[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)

## Contents

- [Why encryption?](#Why-encryption?)
- [What is being encrypted?](#What-is-being-encrypted?)
- [How to do it?](#How-to-do-it?)
- [What collecting?](#What-about-collecting?)

## Why encryption?

Encryption is required to ensure additional layer of client's data protection, even in case of  successful attack on server. The only data, which is not encrypted and can be exposed to attacker:
- deposit transaction - it's freely available on the blockchain and required by the server to verify the validity of the transaction as well as that the balance is valid on the moment of the submission of the transaction to server;
- recipient's address - can't be encrypted, as it is required for the recipient to receive the transaction, sent to his address;
- 'from' value - which is optional, and even if provided can be a non-meaningful string;
- 'hint' value - which is also optional, and might have meaning only for  automated recipient;
- salt - if provided;
- amount.

The main element - the signed collect transaction, is encrypted to ensure it can't be used without the key. The passcode is not sent with Retrievable. The key for collection, when being sent to server, is an encrypted passcode;  The expiration policies ensure, that data is wiped and not stored - the successful transactions can be found on the blockchain.
> Despite passcode being always hidden, we highly recommend ___not to reuse passcodes___.

## What is being encrypted?

As mentioned above, the signed collect transaction and the passcode (in collect request) are the only valuable data and both being encrypted. Encrypting passcode before sending it to collect transaction creates additional security layer to protect in case of traffic hijacking.

For encryption/decryption we provide the [__Retrievable Transfer Crypto__ npm library](). The reason for not making Crypto a part of this library is to make the process more transparent and to give users more control of the Retrievable Transfer flow.

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

## What about collecting?

```TypeScript
import {generateDecryptionKey} from '@kiroboio/safe-transfer-crypto'

const createCollectKey = (passcode: string, salt: string) => generateDecryptionKey({ passcode, salt })
```
> Salt is provided from the server as a part of Collectable object.