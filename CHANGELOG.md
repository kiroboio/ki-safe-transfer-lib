# Changelog

##### v2.7 2020-05-21

  New:

  - 'watch' option for requests

##### v2.6 2020-05-20

  New:

  - isAuthenticated() method

##### v2.5 2020-05-13

  New:

  - 3 class layers to lower complexity - base, connect, service
  - retrieve() method

  Updated:

  - split types into multiple files
  - cleaned up tools, validations
  - extracted config
  - extract text
  - extra tests
  - faster tests

##### v2.1 2020-05-12

  New:

  - Rates - getRates, getRate
  - Networks - getNetworks

  Updated:

  - Made 'owner' a required setting

##### v2 2020-04-23

  New:

  - Changelog.
  - Search for utxo(s).
  - Owner property to request the details of your transactions [later](#identification).
  - Exist.
  - Paging options for dealing with large lists.
  - Exposed function to check the address.
  - Exposed function to create UUID.

  Updated:

  - _getRetrievable_ got a sibling function _getRetrievables_ which is dealing with array of _Retrievable_.
  - Documentation:
    - new functionality;
    - identification;


#### Identification

Please refer to [this]() section of the documentation for more details on identification options and safety.
