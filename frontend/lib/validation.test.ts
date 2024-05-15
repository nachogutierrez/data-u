// validation.test.ts
import {
    validateIsIntegerInRange,
    validateIsFloatInRange,
    validateIntegerDifference,
    validateIsEnum,
    validateLocationQuery,
    validateSearchParams,
    extractFilters,
    isN
  } from './validation';
  import { runQuery as runNominatimQuery } from '@/lib/nominatim';
  import { OrderByOption, OrderByDirection, PropertyType, Operation } from '@/db/bigquery/types';
  
  // Mock runNominatimQuery
  jest.mock('@/lib/nominatim', () => ({
    runQuery: jest.fn(),
  }));
  
  describe('Validation Tests', () => {
    describe('validateIsIntegerInRange', () => {
      it('should validate an integer within the range', () => {
        expect(() => validateIsIntegerInRange('test', '5', 1, 10)).not.toThrow();
      });
  
      it('should throw an error if the integer is out of range', () => {
        expect(() => validateIsIntegerInRange('test', '15', 1, 10)).toThrow("Expected 'test' to be at most 10. Got '15'");
      });
  
      it('should throw an error if the value is not an integer', () => {
        expect(() => validateIsIntegerInRange('test', 'abc')).toThrow("Expected 'test' to be an integer. Got 'abc'");
      });
    });
  
    describe('validateIsFloatInRange', () => {
        it('should validate a float within the range', () => {
          expect(() => validateIsFloatInRange('test', '5.00', 1, 10)).not.toThrow();
        });
      
        it('should throw an error if the float is out of range', () => {
          expect(() => validateIsFloatInRange('test', '15.00', 1, 10)).toThrow("Expected 'test' to be at most 10. Got '15.00'");
        });
      
        it('should throw an error if the value is not a float', () => {
          expect(() => validateIsFloatInRange('test', 'abc')).toThrow("Expected 'test' to be a float. Got 'abc'");
        });
      });
      
  
    describe('validateIntegerDifference', () => {
      it('should validate if the first integer is less than or equal to the second integer', () => {
        expect(() => validateIntegerDifference('min', 'max', '5', '10')).not.toThrow();
      });
  
      it('should throw an error if the first integer is greater than the second integer', () => {
        expect(() => validateIntegerDifference('min', 'max', '15', '10')).toThrow('Expected min to be lower than or equal to max');
      });
    });
  
    describe('validateIsEnum', () => {
      it('should validate if the value is a valid enum value', () => {
        expect(() => validateIsEnum('orderByOption', '1', OrderByOption)).not.toThrow();
      });
  
      it('should throw an error if the value is not a valid enum value', () => {
        expect(() => validateIsEnum('orderByOption', '100', OrderByOption)).toThrow("Invalid value '100' for orderByOption");
      });
    });
  
    describe('validateLocationQuery', () => {
      it('should validate a base64-encoded location query', () => {
        const base64Location = Buffer.from('valid location').toString('base64');
        expect(() => validateLocationQuery('q', base64Location)).not.toThrow();
      });
  
      it('should throw an error if the decoded location query does not match the regex', () => {
        const invalidBase64Location = Buffer.from('invalid_location!').toString('base64');
        expect(() => validateLocationQuery('q', invalidBase64Location)).toThrow("Expected q to match regex /^[a-zA-Z ,]+$/. Make sure q is base64-encoded.");
      });
  
      it('should throw an error if the decoded location query is empty', () => {
        const emptyBase64Location = Buffer.from('').toString('base64');
        expect(() => validateLocationQuery('q', emptyBase64Location)).toThrow("Location query can't be empty.");
      });
  
      it('should throw an error if the decoded location query is too long', () => {
        const longLocation = 'a'.repeat(101);
        const longBase64Location = Buffer.from(longLocation).toString('base64');
        expect(() => validateLocationQuery('q', longBase64Location)).toThrow("Location query can't be more than 100 characters long. Got 101 characters.");
      });
    });
  
    describe('validateSearchParams', () => {
      it('should validate search params without throwing an error', () => {
        const params = {
          ps: '10',
          p: '1',
          minp: '100',
          maxp: '1000',
          minpsm: '50',
          maxpsm: '200',
          mindc: '30',
          maxdc: '300',
          obo: '1',
          obd: '1',
          minpdo: '0',
          maxpdo: '5',
          minpde: '1.00',
          maxpde: '2.00',
          t: '1',
          op: '1',
          q: Buffer.from('valid location').toString('base64'),
        };
  
        expect(() => validateSearchParams(params)).not.toThrow();
      });
  
      it('should throw an error if any search param is invalid', () => {
        const invalidParams = {
          ps: 'abc',
        };
  
        expect(() => validateSearchParams(invalidParams)).toThrow("Expected 'ps' to be an integer. Got 'abc'");
      });
    });
  
    describe('extractFilters', () => {
      it('should extract filters correctly', async () => {
        (runNominatimQuery as jest.Mock).mockResolvedValue({ polygon: 'some-polygon' });
  
        const params = {
          q: Buffer.from('valid location').toString('base64'),
          ps: '10',
          p: '1',
          minp: '100',
          maxp: '1000',
          minpsm: '50',
          maxpsm: '200',
          mindc: '30',
          maxdc: '300',
          minpdo: '0',
          maxpdo: '5',
          minpde: '1.00',
          maxpde: '2.00',
          obo: '1',
          obd: '1',
          t: '1',
          op: '1',
        };
  
        const filters = await extractFilters(params);
  
        expect(filters).toEqual({
          polygon: 'some-polygon',
          price: { min: 100, max: 1000 },
          priceDowns: { min: 0, max: 5 },
          priceDelta: { min: 1.00, max: 2.00 },
          priceM2: { min: 50, max: 200 },
          dimensionCovered: { min: 30, max: 300 },
          type: 1,
          operation: 1,
          pagination: { pageNumber: 1, pageSize: 10 },
          sort: {
            option: 1,
            direction: 1,
          },
        });
      });
  
      it('should return default filters if params are undefined', async () => {
        const filters = await extractFilters(undefined);
  
        expect(filters).toEqual({
          pagination: { pageNumber: 0, pageSize: 100 },
          sort: {
            option: OrderByOption.PRICE_M2,
            direction: OrderByDirection.ASC,
          },
        });
      });
    });

    describe('isN', () => {
        test('should return true for valid numbers', () => {
          expect(isN(42)).toBe(true);
          expect(isN(0)).toBe(true);
          expect(isN(-10)).toBe(true);
          expect(isN(3.14)).toBe(true);
        });
      
        test('should return false for NaN', () => {
          expect(isN(NaN)).toBe(false);
        });
      
        test('should return false for null', () => {
          expect(isN(null)).toBe(false);
        });
      
        test('should return false for undefined', () => {
          expect(isN(undefined)).toBe(false);
        });
      
        test('should return false for non-numeric strings', () => {
          expect(isN('abc')).toBe(false);
        });
      
        test('should return false for numeric strings', () => {
          expect(isN('42')).toBe(false);
        });
      
        test('should return false for boolean values', () => {
          expect(isN(true)).toBe(false);
          expect(isN(false)).toBe(false);
        });
      
        test('should return false for objects', () => {
          expect(isN({})).toBe(false);
          expect(isN({ number: 42 })).toBe(false);
        });
      
        test('should return false for arrays', () => {
          expect(isN([])).toBe(false);
          expect(isN([42])).toBe(false);
        });
      
        test('should return false for functions', () => {
          expect(isN(() => {})).toBe(false);
          expect(isN(function() {})).toBe(false);
        });
      
        test('should return false for symbols', () => {
          expect(isN(Symbol())).toBe(false);
        });
      });
      
  });
  