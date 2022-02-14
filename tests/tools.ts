export async function wait(ms: number): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
}
