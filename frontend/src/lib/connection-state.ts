export type RequestState = 'pending' | 'accepted' | 'declined';

export function canSendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  pendingAlreadyExists: boolean
): boolean {
  if (!fromUserId || !toUserId) return false;
  if (fromUserId === toUserId) return false;
  if (pendingAlreadyExists) return false;
  return true;
}

export function canTransitionRequest(from: RequestState, to: RequestState): boolean {
  return from === 'pending' && (to === 'accepted' || to === 'declined');
}
