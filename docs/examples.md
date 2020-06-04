# Example Code

## Contents

- [Update status](#update-status)


## Update status

Request block height, online status, network ID, average fee of the last block. Authentication request key/secret pair, which can be obtain either through ```.env``` file (we are going to use this way further on):

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch } from '../src'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
}

// run the main function
run()
```

or importing from config file:

```TypeScript

import Service, { Responses, Event, DebugLevels, wait } from '../src'

// get configuration for file
import { CONFIG } from './env_config'

// set authentication details
const authDetails = { key: CONFIG.AUTH_KEY, secret: CONFIG.AUTH_SECRET }
// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
}

// run the main function
run()

```

On the initial connection (when we __replace__ instance), library will automatically request status update, but it will not add it to watch list. It is done in this way so you can decide whether you want to 'watch' it or not. Without __eventBus__ callback function provided no real-time updates can be provided, such as transaction state updates, collection/retrieving information update and others.
The data can be requested with direct response:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch } from '../src'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  // request status update with direct response (won't affect the global setting above)
  const response = await service.getStatus({ respondDirect: true })

  console.log('response',response)
  // this is the result you will get:
  //
  // response {
  //   height: 1747690,
  //   online: true,
  //   netId: 'testnet',
  //   timestamp: 1591258377,
  //   fee: 100634,
  //   updatedAt: '2020-06-04T08:12:58.753Z'
  // }

}

// run the main function
run()
```
Below is the real life example of the library connected to a React app with Redux via middleware:

```TypeScript
import Service, { DebugLevels, Responses } from '@kiroboio/safe-transfer-lib';
import { AppState } from '../models';

// interfaces describing Redux elements

interface Action {
  type: string;
  payload?: any;
}

interface RootState {
  app: AppState;
}

interface Store {
  getState: () => RootState;
  dispatch: (arg0: Action) => void;
}

// holder for Processor service
let service: Service;

// get authentication details
const authDetails = {
  key: process.env.REACT_APP_AUTH_KEY || '',
  secret: process.env.REACT_APP_AUTH_SECRET || '',
};

// middleware function
export const kiroboMiddleware = ({ dispatch }: Store) => (next: (action: Action) => void) => async (
  action: Action,
) => {
  try {
    if (!service) {
      service = Service.getInstance(
        {
          debug: DebugLevels.QUIET,
          respondAs: Responses.Callback,
          eventBus: dispatch,
          authDetails,
        },
        true,
      );
      console.log('Service is set.');
      // ![image](Colors.assets/image.jpg)
    }
  } catch (err) {
    console.log('[kirobo_middleware] setting service caught error:', err);
  }

  next(action);

  switch (action.type) {
    case 'service_update_status':
      console.log('Update status:', action.payload);

      break;
    case 'request_rates':
      service.getRates();

      break;
    case 'get_settings':
      const response = service.getSettings();
      console.log('Settings', response);
  }
};
```

After connection, the library automatically request updated status, which comes to Redux. We process it by checking ```action.type``` and get the following:

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/screenshots/status.jpg)

Connecting the library to React like this allows to call action, suing standard Redux dispatch:

```TypeScript
import React from 'react';
import { useDispatch } from 'react-redux';

export function Sample(): JSX.Element {
  const dispatch = useDispatch();

  dispatch({ type: 'request_rates' });

  return <div>Sample React functional component</div>;
}
```

After middleware receives ```action.type``` = __'request_rates'__, it will request library:

```TypeScript
 case 'request_rates':
      service.getRates();
 break;
```

You will receive the data via provided eventBus (Redux):

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/screenshots/rates.jpg)

> ☝Please, note, that every event library is pushing has name, starting with _'service'_, like _'service_get_btc_to_usd_rates'_ on the screenshot above.

You can request data with direct response:

```TypeScript
case 'get_settings':
      const response = service.getSettings();
      console.log('Settings', response);
break;
```

The result will be:

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/screenshots/settings.jpg)

> ☝By the way, _getSettings()_ is one of the few methods in the library that have only direct response.