# Changelog

#### v2.23.0 2020-10-12

  Feat:

  `206746d` - getBalance
  `1dca393` - estimateFees
  `bbaac3f` - getKiroPrice
  `a5771da` - getKiroState
  `8c22dd3` - license GPLv3

#### v2.22.2 2020-09-31

  Fix:

  - naming of the response for rate/rates doesn't include ETH option

#### v2.22.1 2020-08-31

  Fix:

  - minor correction

#### v2.22.0 2020-08-31

	New:

	- support for Ethereum

#### v2.21.0 2020-06-30

  New:

  - destroy() for instance

  Updated:

  - getConnectionStatus() is correct

#### v2.20.2 2020-06-29

  Fixed:

  - _main_ > _prod_ in address validation

#### v2.20.1 2020-06-28

  Fix:

  - minor bug fix

#### v2.20.0 2020-06-28

  Updated:

  - removed _disconnect_ method
  - updated docs & tests

#### v2.19.1 2020-06-28

  Fixed:

  - smaller functions is fixed
  - disconnect test is disabled

#### v2.19.0 2020-06-28

  Tests:

  - _node_ mode for testing
  - extended timing to wait after connection

#### v2.17.2 2020-06-15

  Fix:

  - restore sending events connect/disconnect

#### v2.17.1 2020-06-15

  Fix:

  - connection test

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
