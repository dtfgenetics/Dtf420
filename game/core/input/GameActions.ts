export const STANDARD_GAME_ACTIONS = [
  "MOVE_LEFT",
  "MOVE_RIGHT",
  "MOVE_UP",
  "MOVE_DOWN",
  "PRIMARY",
  "SECONDARY",
  "BOOST",
  "INTERACT",
  "PAUSE",
  "MENU_BACK",
] as const;

export type StandardGameAction = (typeof STANDARD_GAME_ACTIONS)[number];
export type GameActionState = Partial<Record<StandardGameAction, boolean>>;

export function clampAxis(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export function digitalAxis(negative: boolean, positive: boolean): number {
  return (positive ? 1 : 0) - (negative ? 1 : 0);
}

export function mergeActionSources(...sources: readonly GameActionState[]): GameActionState {
  const merged: GameActionState = {};
  for (const action of STANDARD_GAME_ACTIONS) {
    if (sources.some((source) => source[action] === true)) merged[action] = true;
  }
  return merged;
}

export function horizontalAxis(actions: GameActionState): number {
  return digitalAxis(Boolean(actions.MOVE_LEFT), Boolean(actions.MOVE_RIGHT));
}

export function verticalAxis(actions: GameActionState): number {
  return digitalAxis(Boolean(actions.MOVE_UP), Boolean(actions.MOVE_DOWN));
}

export function isActionActive(actions: GameActionState, action: StandardGameAction): boolean {
  return actions[action] === true;
}
