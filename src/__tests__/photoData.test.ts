import { describe, it, expect } from 'vitest';
import {
  FEATURED_PHOTOS,
  LANDSCAPE_IMAGES,
  NATURE_IMAGES,
  STREET_IMAGES,
  ALL_ALBUMS,
} from '@/lib/photoData';

describe('photoData', () => {
  it('exports featured photos with required fields', () => {
    expect(FEATURED_PHOTOS.length).toBeGreaterThan(0);
    for (const photo of FEATURED_PHOTOS) {
      expect(photo).toHaveProperty('title');
      expect(photo).toHaveProperty('src');
      expect(photo.src).toMatch(/^\/photos\//);
    }
  });

  it('exports category image arrays with src and alt', () => {
    for (const images of [LANDSCAPE_IMAGES, NATURE_IMAGES, STREET_IMAGES]) {
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.src).toBeTruthy();
        expect(img.alt).toBeTruthy();
      }
    }
  });

  it('ALL_ALBUMS combines all category images', () => {
    const expectedCount =
      LANDSCAPE_IMAGES.length + NATURE_IMAGES.length + STREET_IMAGES.length;
    expect(ALL_ALBUMS).toHaveLength(expectedCount);
  });

  it('ALL_ALBUMS entries have category labels', () => {
    const categories = new Set(ALL_ALBUMS.map((a) => a.category));
    expect(categories).toContain('Landscape');
    expect(categories).toContain('Nature');
    expect(categories).toContain('Street');
  });
});
