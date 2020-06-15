# Changelog

#### v2.17.0 2020-06-15

  New:

  - change disconnect method > .destroy()

#### v2.16.0 2020-06-14

  New:

  - send event on connect
  - send event on disconnect

#### v2.15.0 2020-06-10

  New:

  - getRawTransaction

  Updated:

  - docs

#### v2.14.0 2020-06-09

  Updated:

  - final docs structure & contents

#### v2.13.0 2020-06-09

  New:

  - getRawTransactions

#### v2.12.0 2020-06-08

  Updated:

  - endpoints config
  - docs

#### v2.11.0 2020-06-02

  Updated:

  - reinstated onConnect process
  - increase socket timeout to 20s

#### v2.10.0 2020-06-01

  Updated:

  - connect check feature removed

#### v2.9.1 2020-06-01

  Updated:

  - paths

#### v2.9.0 2020-06-01

  New:

  - salt is manadatory when sending transaction

#### v2.8.0 2020-05-31

  New:

  - retrieve object in Retrievable

#### v2.7.2 2020-05-24

  Updated:

  - removed getRetrievables
  - changed validateSend
  - updated tests

#### v2.7.1 2020-05-21

  Updated:

  - lastAddresses to include options from original request
  - makeOptions process and makes choice for watch options in request vs global
  - updated tests

#### v2.7 2020-05-21

  New:

  - 'watch' option for requests

#### v2.6 2020-05-20

  New:

  - isAuthenticated() method

#### v2.5 2020-05-13

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

#### v2.1 2020-05-12

  New:

  - Rates - getRates, getRate
  - Networks - getNetworks

  Updated:

  - Made 'owner' a required setting

#### v2 2020-04-23

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
