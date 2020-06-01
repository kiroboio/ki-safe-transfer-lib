import { find, isNil, isEmpty } from 'ramda'

import { Event } from '@src/.'

/**
 * Function to force test to wait extra time to ensure, that the socket connect it properly OFF
 *
 * */
export async function wait(ms: number): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('')
    }, ms)
  })
}

export function getEventByType(events: Event[], type: string): Event | undefined {
  if (isNil(events) || isEmpty(events) || !type) return undefined

  const finderFn = (el: Event): boolean => el.type === type

  return find(finderFn, events)
}
