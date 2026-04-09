import { describe, it, expect } from 'vitest';
import { responsiveSrc, responsiveSrcSet } from '@/lib/responsiveImage';

describe('responsiveSrc', () => {
  it('appends the w60 quality suffix before the extension', () => {
    expect(responsiveSrc('/photos/Bridge.png')).toBe('/photos/Bridge-w60.png');
  });

  it('handles JPEG extensions', () => {
    expect(responsiveSrc('/photos/Big_Sur.JPEG')).toBe('/photos/Big_Sur-w60.JPEG');
  });

  it('handles paths without an extension', () => {
    expect(responsiveSrc('/photos/noext')).toBe('/photos/noext-w60');
  });
});

describe('responsiveSrcSet', () => {
  it('produces a 1x srcset string', () => {
    expect(responsiveSrcSet('/photos/Bridge.png')).toBe('/photos/Bridge-w60.png 1x');
  });
});
