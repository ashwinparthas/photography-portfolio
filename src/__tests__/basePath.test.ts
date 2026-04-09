import { describe, it, expect } from 'vitest';
import { withBasePath } from '@/lib/basePath';

describe('withBasePath', () => {
  it('returns empty/falsy paths unchanged', () => {
    expect(withBasePath('')).toBe('');
  });

  it('preserves absolute http(s) URLs', () => {
    expect(withBasePath('https://example.com/img.png')).toBe('https://example.com/img.png');
    expect(withBasePath('http://localhost:3000/test')).toBe('http://localhost:3000/test');
  });

  it('normalises paths that lack a leading slash', () => {
    expect(withBasePath('photos/Bridge.png')).toBe('/photos/Bridge.png');
  });

  it('returns leading-slash paths unchanged when no base path is set', () => {
    expect(withBasePath('/photos/Bridge.png')).toBe('/photos/Bridge.png');
  });
});
