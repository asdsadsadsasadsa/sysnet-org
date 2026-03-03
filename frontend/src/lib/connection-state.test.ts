import { describe, it, expect } from 'vitest';
import { canSendConnectionRequest, canTransitionRequest } from './connection-state';

describe('canSendConnectionRequest', () => {
  it('rejects self requests', () => {
    expect(canSendConnectionRequest('u1', 'u1', false)).toBe(false);
  });

  it('rejects when a pending request already exists', () => {
    expect(canSendConnectionRequest('u1', 'u2', true)).toBe(false);
  });

  it('allows normal request', () => {
    expect(canSendConnectionRequest('u1', 'u2', false)).toBe(true);
  });
});

describe('canTransitionRequest', () => {
  it('allows pending -> accepted/declined', () => {
    expect(canTransitionRequest('pending', 'accepted')).toBe(true);
    expect(canTransitionRequest('pending', 'declined')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(canTransitionRequest('accepted', 'pending')).toBe(false);
    expect(canTransitionRequest('declined', 'accepted')).toBe(false);
    expect(canTransitionRequest('pending', 'pending')).toBe(false);
  });
});
