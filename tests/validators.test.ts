
import { validateObject, validateObjectWithStrings, validatePropsArray } from '@src/validators'

describe('Validators', () => {
  describe('validateObject', () => {
    it('throws on empty', () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        validateObject()
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws if not object {}', () => {
      expect.assertions(2)

      try {
        validateObject([])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Argument can\'t be array. It should be object {}.')
      }
    })
    it('throws if array', () => {
      expect.assertions(2)

      try {
        validateObject([])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Argument can\'t be array. It should be object {}.')
      }
    })
    it('throws if function', () => {
      expect.assertions(2)

      try {
        validateObject(() => { return })
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Argument can\'t be a function.')
      }
    })

    describe('validateObjectWithStrings', () => {
      it('throws on empty', () => {
        expect.assertions(2)

        try {
          // @ts-expect-error
          validateObjectWithStrings()
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'paramName or method can\'t be empty for "validateObjectWithStrings" method. It should be paramName: string, method: string.',
          )
        }
      })
      it('throws if not object {}', () => {
        expect.assertions(2)

        try {
          validateObjectWithStrings([], 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'Props in params of "test" method can\'t be array. It should be object {[index:string]:string}.',
          )
        }
      })

      it('throws if function', () => {
        expect.assertions(2)

        try {
          validateObjectWithStrings(() => { return }, 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'Props in params of "test" method can\'t be function. It should be object {[index:string]:string}.',
          )
        }
      })
      it('throws if empty', () => {
        expect.assertions(2)

        try {
          validateObjectWithStrings({}, 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty('message', 'Props in params of "test" method can\'t be empty.')
        }
      })

      it('throws if values are not string', () => {
        expect.assertions(2)

        try {
          validateObjectWithStrings({ key: 0 }, 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'Element key in params of "test" method can\'t be number. It should be string.',
          )
        }
      })
      it('throws if values are empty strings', () => {
        expect.assertions(2)

        try {
          validateObjectWithStrings({ key: '' }, 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'Element key in params of "test" method can\'t be empty. It should be value in string form.',
          )
        }
      })
    })
    describe('validatePropsArray', () => {
      it('throws if empty ', () => {
        expect.assertions(2)

        try {
          validatePropsArray([], 'string', 'strings', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty('message', 'Required argument (strings) of [test] function is empty.')
        }
      })
      it('throws if element in array of different type', () => {
        expect.assertions(2)

        try {
          validatePropsArray(['string', 123], 'number', 'strings', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty(
            'message',
            'Type of argument (#0: string) in function [test] is wrong - string. Should be number.',
          )
        }
      })
    })
  })
  describe('validatePropsString',()=>{ return })
})
