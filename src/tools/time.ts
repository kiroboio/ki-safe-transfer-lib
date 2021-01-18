function diff(prev: number | undefined, now?: number): number {
  if (!prev) return 100;

  const nowDate = (): number => (now ? new Date(now).getTime() : new Date().getTime());

  return Math.round((nowDate() - new Date(prev).getTime()) / 1000);
}

function getTime(): number {
  return new Date().valueOf();
}

/**
 * Function to force test to wait extra time to ensure, that the socket connect it properly OFF
 *
 * */
async function wait(ms: number): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
}

export { diff, getTime, wait };
