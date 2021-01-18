import { append, forEach } from 'ramda';

function makeStringFromArray(arr: string[][]): string {
  let result: string[] = [];

  const forEachFn = (group: string[]): void => {
    result = append(`${group[0]} (${group[1]})`, result);
  };

  forEach(forEachFn, arr);
  return result.join(', ');
}

export { makeStringFromArray };
