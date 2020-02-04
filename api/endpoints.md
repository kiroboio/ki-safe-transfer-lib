## API Endpoints

- #### ___getSettings()___

  Function to check the current settings of the library session:

  ```javascript
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
- #### async ___getRetrievable()___
- #### async ___send()___
- #### async ___collect()___
- #### async ___getStatus()___

