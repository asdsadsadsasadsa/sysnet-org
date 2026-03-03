import { describe, it, expect } from 'vitest';
import { normalizeHandle, parseCsvList } from './profile-utils';

describe('normalizeHandle', () => {
  it('lowercases and trims whitespace', () => {
    expect(normalizeHandle('  Alice_ENG  ')).toBe('alice_eng');
  });

  it('removes invalid characters and collapses dashes', () => {
    expect(normalizeHandle('A!li ce---Eng')).toBe('ali-ce-eng');
  });

  it('returns empty string for invalid input', () => {
    expect(normalizeHandle('***')).toBe('');
  });
});

describe('parseCsvList', () => {
  it('splits, trims, lowercases, dedupes, and drops empties', () => {
    expect(parseCsvList(' MBSE, SysML,mbse, , STPA  ')).toEqual(['mbse', 'sysml', 'stpa']);
  });

  it('enforces max items and max item length', () => {
    const long = 'x'.repeat(100);
    const input = ['one', 'two', 'three', long].join(',');
    expect(parseCsvList(input, { maxItems: 2, maxLen: 10 })).toEqual(['one', 'two']);
  });
});
