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
