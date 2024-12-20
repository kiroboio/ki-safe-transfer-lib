/* eslint-disable @typescript-eslint/ban-ts-comment */

import { capitalize, makeString, compareBasicObjects, makeOptions } from '../src/tools'
import { Watch } from '../src'

process.on('unhandledRejection', () => {
  return
})

describe('Tools', () => {
  describe('- "capitalize"', () => {
    test('- doesn\'t crash at non-string, and returns empty string', () => {
      // @ts-expect-error
      expect(capitalize(123)).toBe('')
    })
    test('- returns string with capitalized 1st letter', () => {
      expect(capitalize('qwerty')).toBe('Qwerty')
    })
    test('- correctly returns, even if the are several words', () => {
      expect(capitalize('qwerty qwerty')).toBe('Qwerty qwerty')
    })
  })
  describe('- "makeString"', () => {
    test('- doesn\'t crash at no arguments', () => {
      // @ts-expect-error
      expect(makeString(123)).toBe('')
    })
    test('- doesn\'t crash at missing some arguments', () => {
      // @ts-expect-error
      expect(makeString(123)).toBe('')
    })
    test('- doesn\'t crash at wrong argument types', () => {
      // @ts-expect-error
      expect(makeString('qwerty')).toBe('')
    })
    test('- doesn\'t crash at wrong argument types #2', () => {
      // @ts-expect-error
      expect(makeString('qwerty', [2, {}])).toBe('')
    })
    test('- correctly creates string with one parameter', () => {
      expect(makeString('- correctly creates string with %1 parameter', ['one'])).toBe(
        '- correctly creates string with one parameter',
      )
    })
    test('- correctly creates string with several parameters', () => {
      expect(makeString('- correctly %1 string with %2 parameters', ['creates', 'several'])).toBe(
        '- correctly creates string with several parameters',
      )
    })
  })
  describe('- \'compareBasicObjects\'', () => {
    test('- doesn\'t crash at no arguments', () => {
      // @ts-expect-error
      expect(compareBasicObjects()).toBe(false)
    })
    test('- doesn\'t crash without some arguments', () => {
      // @ts-expect-error
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
  // TODO: test other features
  describe('- \'makeOptions\'', () => {
    test('- returns default pagination options without arguments', () => {
      // @ts-expect-error
      expect(JSON.stringify(makeOptions())).toBe(JSON.stringify({ $limit: 100, $skip: 0 }))
    })
    test('- chooses \'watch\' options correctly', () => {
      expect(JSON.stringify(makeOptions({ watch: Watch.ADD }, Watch.DISABLE))).toBe(
        JSON.stringify({ $limit: 100, $skip: 0, watch: 'add' }),
      )
    })
  })
})
