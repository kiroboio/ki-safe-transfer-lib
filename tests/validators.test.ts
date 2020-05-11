/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { validateObject, validateObjectWithStrings } from '../src/validators'

describe('Validators', () => {
  describe('validateObject', () => {
    it('throws on empty', () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        validateObject()
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws if not object {}', () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        validateObject([])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Argument can\'t be array. It should be object {}.')
      }
    })
    it('throws if array', () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        validateObject([])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Argument can\'t be array. It should be object {}.')
      }
    })
    it('throws if function', () => {
      expect.assertions(2)

      try {
        // @ts-ignore
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
          // @ts-ignore
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
          // @ts-ignore
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
          // @ts-ignore
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
          // @ts-ignore
          validateObjectWithStrings({}, 'Props', 'test')
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError)
          expect(err).toHaveProperty('message', 'Props in params of "test" method can\'t be empty.')
        }
      })

      it('throws if values are not string', () => {
        expect.assertions(2)

        try {
          // @ts-ignore
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
          // @ts-ignore
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
  })
  describe('validatePropsString',()=>{ return })
})
