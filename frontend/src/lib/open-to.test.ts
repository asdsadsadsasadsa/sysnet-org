import { describe, it, expect } from 'vitest';
import { sanitizeOpenTo } from './open-to';

describe('sanitizeOpenTo', () => {
  it('keeps only allowed values in stable order', () => {
    expect(sanitizeOpenTo(['hiring', 'foo', 'mentoring', 'consulting', 'hiring'])).toEqual([
      'hiring',
      'mentoring',
      'consulting',
    ]);
  });

  it('limits to max 3 values', () => {
    expect(sanitizeOpenTo(['hiring', 'mentoring', 'consulting', 'other'])).toEqual([
      'hiring',
      'mentoring',
      'consulting',
    ]);
  });
});
