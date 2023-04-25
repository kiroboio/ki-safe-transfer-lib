import { validateArray } from '../validators';
import { AnyValue } from '../types/types';

const splitText = (text: string): string[] => text.split('');

const reassign = (group: string[], newMember: string): string[] => {
  group.splice(0, 1);
  return [newMember, ...group];
};

export const capitalize = (text: string): string => {
  if (typeof text !== 'string') return '';

  return reassign(splitText(text), splitText(text)[0].toUpperCase()).join('');
};

export const makeString = (template: string, params: (string | number)[]): string => {
  if (typeof template !== 'string') return '';

  if (!validateArray(params, ['string', 'number'])) return '';

  let result = template;

  params.forEach((param, key) => {
    result = result.replace(`%${key + 1}`, String(param));
  });

  return result;
};

export const Type = <T = AnyValue>(object: unknown): T => object as unknown as T;
