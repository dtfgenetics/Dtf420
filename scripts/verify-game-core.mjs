import { DeterministicRng } from "../game/core/random/DeterministicRng.ts";
import { clampAxis, digitalAxis, horizontalAxis, mergeActionSources } from "../game/core/input/GameActions.ts";
import {
  DEFAULT_RECONNECT_POLICY,
  applyColyseusReconnectPolicy,
  normalizeGameServerEndpoint,
  createFriendlyInviteCode,
  FRIENDLY_INVITE_ALPHABET,
  normalizeInviteCode,
  normalizeRoomCode,
  connectionStateAfterDrop,
  canStartMultiplayerRoom,
  roomCapacityRemaining,
  multiplayerStatusLabel,
  MULTIPLAYER_TRANSPORT_CAPABILITIES,
  transportSupportsManualResume,
} from "../game/core/network/MultiplayerRuntime.ts";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function approx(actual, expected, epsilon = 1e-12) {
  return Math.abs(actual - expected) <= epsilon;
}

const expected = [
  0.1330479981843382,
  0.9552457584068179,
  0.6820800814311951,
  0.5836122329346836,
  0.3880935769993812,
];

const compatibility = new DeterministicRng("DTF-420");
for (const [index, expectedValue] of expected.entries()) {
  const actual = compatibility.next();
  assert(
    approx(actual, expectedValue),
    `compatibility sequence changed at index ${index}: expected ${expectedValue}, got ${actual}`,
  );
}

const first = new DeterministicRng("repeatable-seed");
const second = new DeterministicRng("repeatable-seed");
for (let index = 0; index < 100; index += 1) {
  assert(first.next() === second.next(), `same seed diverged at draw ${index}`);
}

const source = ["a", "b", "c", "d", "e", "f"];
const shuffleA = new DeterministicRng("shuffle").shuffle(source);
const shuffleB = new DeterministicRng("shuffle").shuffle(source);
assert(JSON.stringify(shuffleA) === JSON.stringify(shuffleB), "shuffle must be deterministic");
assert(JSON.stringify(source) === JSON.stringify(["a", "b", "c", "d", "e", "f"]), "shuffle must not mutate its input");

const forkParent = new DeterministicRng("parent");
const forkA = forkParent.fork("cosmetic");
const forkB = forkParent.fork("cosmetic");
assert(forkA.next() === forkB.next(), "same named fork must produce the same stream at the same parent state");

const beforeForkCheck = new DeterministicRng("parent");
const expectedParentNext = beforeForkCheck.next();
const afterForkCheck = new DeterministicRng("parent");
afterForkCheck.fork("cosmetic");
assert(afterForkCheck.next() === expectedParentNext, "fork must not consume the parent stream");

const empty = new DeterministicRng("empty");
assert(empty.pick([]) === undefined, "pick([]) must return undefined");

assert(clampAxis(-2) === -1, "clampAxis must clamp below -1");
assert(clampAxis(2) === 1, "clampAxis must clamp above 1");
assert(clampAxis(Number.NaN) === 0, "clampAxis must neutralize non-finite values");
assert(digitalAxis(true, false) === -1, "negative digital input must produce -1");
assert(digitalAxis(false, true) === 1, "positive digital input must produce 1");
assert(digitalAxis(true, true) === 0, "opposing digital inputs must cancel");

const mergedActions = mergeActionSources(
  { MOVE_LEFT: true, BOOST: false },
  { BOOST: true, PRIMARY: true },
);
assert(mergedActions.MOVE_LEFT === true, "merged actions must preserve active movement");
assert(mergedActions.BOOST === true, "active action in any source must win over inactive source");
assert(mergedActions.PRIMARY === true, "merged actions must include source-specific actions");
assert(horizontalAxis(mergeActionSources({ MOVE_LEFT: true }, { MOVE_RIGHT: true })) === 0, "opposing sources must cancel on horizontal axis");

assert(normalizeGameServerEndpoint(" https://games.example.test/ ", "Test") === "https://games.example.test", "game server endpoint must trim whitespace and trailing slashes");
let endpointRejected = false;
try {
  normalizeGameServerEndpoint("   ", "Test");
} catch {
  endpointRejected = true;
}
assert(endpointRejected, "blank game server endpoints must be rejected");
assert(normalizeRoomCode(" ABC123 ", "room code") === "ABC123", "room codes must be trimmed");
assert(normalizeInviteCode(" ab-c_12 ") === "AB-C_12", "invite codes must normalize to a stable shareable format");
const inviteSamples = [0, 0.25, 0.5, 0.75, 0.999999];
let inviteSampleIndex = 0;
const friendlyInvite = createFriendlyInviteCode(6, () => inviteSamples[(inviteSampleIndex++) % inviteSamples.length]);
assert(friendlyInvite.length === 6, "friendly invite codes must use the requested safe length");
assert([...friendlyInvite].every((character) => FRIENDLY_INVITE_ALPHABET.includes(character)), "friendly invite codes must only use the ambiguity-resistant alphabet");
assert(!/[01IO]/.test(friendlyInvite), "friendly invite codes must exclude ambiguous 0/1/I/O characters");
assert(createFriendlyInviteCode(1, () => 0).length === 4, "friendly invite codes must enforce the minimum safe length");
assert(createFriendlyInviteCode(99, () => 0).length === 12, "friendly invite codes must enforce the maximum safe length");
assert(connectionStateAfterDrop(true, 3) === "reconnecting", "recoverable drops must expose reconnecting state");
assert(connectionStateAfterDrop(true, 0) === "disconnected", "exhausted reconnect attempts must expose disconnected state");
assert(connectionStateAfterDrop(false, 3) === "disconnected", "disabled reconnect must expose disconnected state");

const hostLobby = { phase: "lobby", playerCount: 2, minPlayers: 2, maxPlayers: 8, isHost: true };
assert(canStartMultiplayerRoom(hostLobby) === true, "host must be able to start a full-enough lobby");
assert(canStartMultiplayerRoom({ ...hostLobby, isHost: false }) === false, "non-host must not start a shared room");
assert(canStartMultiplayerRoom({ ...hostLobby, playerCount: 1 }) === false, "rooms below minimum player count must not start");
assert(canStartMultiplayerRoom({ ...hostLobby, phase: "playing" }) === false, "active rooms must not re-enter start transition");
assert(roomCapacityRemaining(hostLobby) === 6, "shared room capacity must report remaining seats");
assert(roomCapacityRemaining({ playerCount: 9, maxPlayers: 8 }) === 0, "room capacity must never become negative");
assert(multiplayerStatusLabel("reconnecting") === "Reconnecting…", "shared reconnecting UI label must remain stable");
assert(multiplayerStatusLabel("connected", "playing") === "Playing", "connected room phase must drive shared status label");
assert(MULTIPLAYER_TRANSPORT_CAPABILITIES.colyseus.authoritativeState === true, "Colyseus adapter must remain server-authoritative");
assert(MULTIPLAYER_TRANSPORT_CAPABILITIES["socket-io"].authoritativeState === true, "Socket.IO adapter contract must remain server-authoritative");
assert(transportSupportsManualResume("colyseus") === true, "Colyseus must expose reload/session resume capability");
assert(transportSupportsManualResume("socket-io") === false, "Socket.IO manual resume must not be claimed until a DTF session-token adapter implements it");

const mockRoom = {
  reconnection: {
    enabled: false,
    maxRetries: 0,
    maxDelay: 0,
    maxEnqueuedMessages: 0,
  },
};
applyColyseusReconnectPolicy(mockRoom);
assert(mockRoom.reconnection.enabled === true, "shared reconnect policy must enable reconnection");
assert(mockRoom.reconnection.maxRetries === DEFAULT_RECONNECT_POLICY.maxRetries, "shared reconnect retries must stay centralized");
assert(mockRoom.reconnection.maxDelay === DEFAULT_RECONNECT_POLICY.maxDelayMs, "shared reconnect delay must stay centralized");
assert(mockRoom.reconnection.maxEnqueuedMessages === DEFAULT_RECONNECT_POLICY.maxEnqueuedMessages, "shared queued-message limit must stay centralized");

if (errors.length) {
  console.error("Game core verification failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Game core verified: deterministic RNG, named input/actions, shared connection/reconnect, invite, and room-lifecycle contracts passed.");
