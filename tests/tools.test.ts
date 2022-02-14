import { capitalize, makeString } from '../src/tools';

process.on('unhandledRejection', () => {
  return;
});

describe('Tools', () => {
  describe('- "capitalize"', () => {
    test("- doesn't crash at non-string, and returns empty string", () => {
      // @ts-expect-error
      expect(capitalize(123)).toBe('');
    });
    test('- returns string with capitalized 1st letter', () => {
      expect(capitalize('qwerty')).toBe('Qwerty');
    });
    test('- correctly returns, even if the are several words', () => {
      expect(capitalize('qwerty qwerty')).toBe('Qwerty qwerty');
    });
  });
  describe('- "makeString"', () => {
    test("- doesn't crash at no arguments", () => {
      // @ts-expect-error
      expect(makeString(123)).toBe('');
    });
    test("- doesn't crash at missing some arguments", () => {
      // @ts-expect-error
      expect(makeString(123)).toBe('');
    });
    test("- doesn't crash at wrong argument types", () => {
      // @ts-expect-error
      expect(makeString('qwerty')).toBe('');
    });
    test("- doesn't crash at wrong argument types #2", () => {
      // @ts-expect-error
      expect(makeString('qwerty', [2, {}])).toBe('');
    });
    test('- correctly creates string with one parameter', () => {
      expect(makeString('- correctly creates string with %1 parameter', ['one'])).toBe(
        '- correctly creates string with one parameter',
      );
    });
    test('- correctly creates string with several parameters', () => {
      expect(makeString('- correctly %1 string with %2 parameters', ['creates', 'several'])).toBe(
        '- correctly creates string with several parameters',
      );
    });
  });
});
