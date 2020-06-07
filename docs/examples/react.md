# React app with Redux.
[◅ _return to Examples_](examples.md)

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

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/examples/screenshots/status.jpg)

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

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/examples/screenshots/rates.jpg)

> ☝Please, note, that every event library is pushing has name, starting with _'service'_, like _'service_get_btc_to_usd_rates'_ on the screenshot above.

You can request data with direct response:

```TypeScript
case 'get_settings':
      const response = service.getSettings();
      console.log('Settings', response);
break;
```

The result will be:

![image](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/examples/screenshots/settings.jpg)

> ☝By the way, _getSettings()_ is one of the few methods in the library that have __only__ direct response.

[⬑ _to top_](#react-app-with-redux)