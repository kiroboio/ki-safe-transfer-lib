/**
 * This is a sample file for the 'client' runner. Make adjustments, rename to 'client.ts' and
 * run it with 'npm run dev'
 *
 * */
import prettyFormat from 'pretty-format'

import Service, { DebugLevels, Responses, Event } from '../src'
import dotenv from 'dotenv'
import { wait } from './tools'

dotenv.config()

const { log, dir } = console

const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

function eventBus(event: Event): void {
  dir(event, { depth: 15, colors: true, compact: true })
}

const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET,
    respondAs: Responses.Callback,
    eventBus,
    authDetails,
  },
  true,
)

async function run(): Promise<void> {
  await wait(3000)
  service.getStatus().catch((err) => log('getStatus error', err))
}

run()
