export function diff(prev: number | undefined, now?: number): number {
  if (!prev) return 100;

  const nowDate = (): number => (now ? new Date(now).getTime() : new Date().getTime());

  return Math.round((nowDate() - new Date(prev).getTime()) / 1000);
}

export function getTime(): number {
  return new Date().valueOf();
}
