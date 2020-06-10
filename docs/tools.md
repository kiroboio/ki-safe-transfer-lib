# Tools

[◅ _return to documentation_](documentation.md)

## Contents
  - [___generateId()___]()
  - [___validateAddress()___]()

---

In addition, library exposing several useful tools, provided by the libraries it is using:
  - generateId
  - validateAddress

## ___generateId()___

This method generates random id, using the [uuid](https://www.npmjs.com/package/uuid#create-version-4-random-uuids)  library. Use:

```typescript
import { generateId } from '@kiroboio/safe-transfer-lib'

const id = generateId()

// f04eebd3-6580-4c0b-bedd-f9e358d80b2b
```

[⬑ _to top_](#tools)

## ___validateAddress()___

This method allows to validate crypto currency address, using [multicoin-address-validator](https://www.npmjs.com/package/multicoin-address-validator) library. Use:

```typescript
import { validateAddress } from '@kiroboio/safe-transfer-lib'

const isOK = validateAddress({
          address: 'xxxx',
          currency: 'btc',
          networkType: 'mainnet',
        })

// true
```

[⬑ _to top_](#tools)

[◅ _return to documentation_](documentation.md)