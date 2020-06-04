/**
 * This is a sample file for the 'client' runner. Make adjustments, rename to 'client.ts' and
 * run it with 'npm run dev'
 *
 * */

import dotenv from 'dotenv' // library to load environment variables from .env file

import Service, { Responses, Event, DebugLevels, wait, Watch } from '../src' // import required class, types and tool

dotenv.config() // configure the library

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
  await wait(1000)

  // request status update and add it to 'watch' list, to receive further updates via eventBus
  const response = await service.getStatus({ respondDirect: true })

  console.log(response)
}

// run the main function
run()
