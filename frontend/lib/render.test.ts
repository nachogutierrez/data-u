import { replacePlaceholders } from './render';

describe('replacePlaceholders', () => {
  it('should replace all placeholders with corresponding values', () => {
    const template = 'Hello, {{name}}!';
    const placeholders = { name: 'John' };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, John!');
  });

  it('should throw an error for missing placeholder values', () => {
    const template = 'Hello, {{name}}!';
    const placeholders = { };
    expect(() => replacePlaceholders(template, placeholders)).toThrow('Missing values for placeholders: name');
  });

  it('should warn about unused placeholders', () => {
    console.warn = jest.fn();
    const template = 'Hello, {{name}}!';
    const placeholders = { name: 'John', age: 30 };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, John!');
    expect(console.warn).toHaveBeenCalledWith('Warning: Unused placeholders provided: age');
  });

  it('should handle templates with multiple placeholders', () => {
    const template = 'Hello, {{name}}! You are {{age}} years old.';
    const placeholders = { name: 'John', age: 30 };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, John! You are 30 years old.');
  });

  it('should handle templates with repeated placeholders', () => {
    const template = '{{greeting}}, {{name}}! {{greeting}}, {{name}}!';
    const placeholders = { greeting: 'Hello', name: 'John' };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, John! Hello, John!');
  });

  it('should work with placeholders having special characters in values', () => {
    const template = 'Hello, {{name}}! Your password is {{password}}.';
    const placeholders = { name: 'John', password: 'p@ssw0rd!' };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, John! Your password is p@ssw0rd!.');
  });

  it('should handle templates without placeholders', () => {
    const template = 'Hello, World!';
    const placeholders = { name: 'John' };
    const result = replacePlaceholders(template, placeholders);
    expect(result).toBe('Hello, World!');
  });
});
