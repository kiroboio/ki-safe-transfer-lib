/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { capitalize, makeStringFromTemplate, compareBasicObjects, not } from '../src/tools'

process.on('unhandledRejection', () => {
  return
})

describe('Tools', () => {
  describe('- "capitalize"', () => {
    test('- doesn\'t crash at non-string, and returns empty string', () => {
      // @ts-ignore
      expect(capitalize(123)).toBe('')
    })
    test('- returns string with capitalized 1st letter', () => {
      expect(capitalize('qwerty')).toBe('Qwerty')
    })
    test('- correctly returns, even if the are several words', () => {
      expect(capitalize('qwerty qwerty')).toBe('Qwerty qwerty')
    })
  })
  describe('- "makeStringFromTemplate"', () => {
    test('- doesn\'t crash at no arguments', () => {
      // @ts-ignore
      expect(makeStringFromTemplate(123)).toBe('')
    })
    test('- doesn\'t crash at missing some arguments', () => {
      // @ts-ignore
      expect(makeStringFromTemplate(123)).toBe('')
    })
    test('- doesn\'t crash at wrong argument types', () => {
      // @ts-ignore
      expect(makeStringFromTemplate('qwerty')).toBe('')
    })
    test('- doesn\'t crash at wrong argument types #2', () => {
      // @ts-ignore
      expect(makeStringFromTemplate('qwerty', [2, {}])).toBe('')
    })
    test('- correctly creates string with one parameter', () => {
      expect(makeStringFromTemplate('- correctly creates string with %1 parameter', ['one'])).toBe(
        '- correctly creates string with one parameter',
      )
    })
    test('- correctly creates string with several parameters', () => {
      expect(makeStringFromTemplate('- correctly %1 string with %2 parameters', ['creates', 'several'])).toBe(
        '- correctly creates string with several parameters',
      )
    })
  })
  describe('- \'compareBasicObjects\'', () => {
    test('- doesn\'t crash at no arguments', () => {
      // @ts-ignore
      expect(compareBasicObjects()).toBe(false)
    })
    test('- doesn\'t crash without some arguments', () => {
      // @ts-ignore
      expect(compareBasicObjects(123)).toBe(false)
    })
    test('- different objects, don\'t match', () => {
      expect(compareBasicObjects({ key: 'value' }, { key: 'qwerty' })).toBe(false)
    })
    test('- different objects, don\'t match #2', () => {
      expect(compareBasicObjects({ key: 'qwerty' }, { key: 'qwerty', keyTwo: 2 })).toBe(false)
    })
    test('- objects with complex values, don\'t match', () => {
      expect(compareBasicObjects({ key: ['qwerty'] }, { key: ['qwerty'] })).toBe(false)
    })
    test('- objects with same basic values match', () => {
      expect(compareBasicObjects({ key: 'qwerty', keyTwo: 2 }, { key: 'qwerty', keyTwo: 2 })).toBe(true)
    })
  })
  describe('- \'not\'', () => {
    test('- returns false on missing argument', () => {
      // @ts-ignore
      expect(not()).toBe(false)
    })
    test('- returns false on wrong arguments', () => {
      expect.assertions(3)
      // @ts-ignore
      expect(not(undefined)).toBe(false)
      // @ts-ignore
      expect(not(undefined)).toBe(false)
      // @ts-ignore
      expect(not([])).toBe(false)
    })
    test('- returns false on true', () => {
      expect(not(true)).toBe(false)
    })
    test('- returns true on false', () => {
      expect(not(false)).toBe(true)
    })
  })
})
