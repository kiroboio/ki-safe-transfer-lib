import { validateObject } from '../src/validators';

describe('Validators', () => {
  describe('validateObject', () => {
    it('throws on empty', () => {
      expect.assertions(2);

      try {
        // @ts-expect-error
        validateObject();
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect(err).toHaveProperty('message', 'Data is missing');
      }
    });
    it('throws if not object {}', () => {
      expect.assertions(2);

      try {
        validateObject([]);
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect(err).toHaveProperty('message', "Argument can't be array. It should be object {}.");
      }
    });
    it('throws if array', () => {
      expect.assertions(2);

      try {
        validateObject([]);
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect(err).toHaveProperty('message', "Argument can't be array. It should be object {}.");
      }
    });
    it('throws if function', () => {
      expect.assertions(2);

      try {
        validateObject(() => {
          return;
        });
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect(err).toHaveProperty('message', "Argument can't be a function.");
      }
    });
  });
  describe('validatePropsString', () => {
    return;
  });
});
