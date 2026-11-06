import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const output = mkdtempSync(path.join(tmpdir(), 'pua-game-tests-'));
process.on('exit', () => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  'node_modules/typescript/bin/tsc', 'lib/game.ts', 'data/scenario.ts',
  '--outDir', output, '--module', 'commonjs', '--moduleResolution', 'node',
  '--target', 'es2022', '--strict', '--skipLibCheck',
], { stdio: 'inherit' });
const require = createRequire(import.meta.url);
const { createInitialSnapshot, playChoice, continueConversation, useFocus, resolveStepForScene } = require(path.join(output, 'lib/game.js'));
const { scenario, targetProfiles, endings } = require(path.join(output, 'data/scenario.js'));

const steady = (patch = {}) => ({
  ...createInitialSnapshot(42), target: targetProfiles[0],
  player: { mental: 5, observation: 4 },
  hidden: { caution: 3, interest: 2, vibe: 3, timePressure: 2 },
  ...patch,
});
const turn = (snapshot, id) => continueConversation(playChoice(snapshot, id));

test('replaying the same seed and actions reproduces every response', () => {
  const run = () => ['honest', 'mirror-question', 'listen-fatigue', 'contact-now'].reduce(turn, createInitialSnapshot(42));
  assert.deepEqual(run(), run());
  assert.notDeepEqual(createInitialSnapshot(42), createInitialSnapshot(43));
});

test('focus is shared, capped, and does not advance time or the random stream', () => {
  const initial = steady({ player: { mental: 2, observation: 7 } });
  const observed = useFocus(initial, 'observe');
  assert.equal(observed.focus, 1);
  assert.equal(observed.player.observation, 8);
  assert.deepEqual(observed.hidden, initial.hidden);
  assert.equal(observed.rngState, initial.rngState);
  assert.equal(observed.stepIndex, 0);
  assert.equal(useFocus(observed, 'observe'), observed);
  const recovered = useFocus(observed, 'breathe');
  assert.equal(recovered.player.mental, 5);
  assert.equal(recovered.focus, 0);
  assert.equal(useFocus(recovered, 'breathe'), recovered);
  assert.equal(initial.focus, 2);
  const full = steady({ player: { mental: 8, observation: 4 } });
  assert.equal(useFocus(full, 'breathe'), full);
});

test('a response must be acknowledged and duplicate clicks cannot consume turns', () => {
  const initial = steady();
  assert.equal(continueConversation(initial), initial);
  const response = playChoice(initial, 'honest');
  assert.equal(response.awaitingContinue, true);
  assert.equal(response.stepIndex, 0);
  assert.equal(response.logs.length, 1);
  assert.equal(playChoice(response, 'honest'), response);
  assert.equal(useFocus(response, 'observe'), response);
  const next = continueConversation(response);
  assert.equal(next.stepIndex, 1);
  assert.equal(next.awaitingContinue, false);
  assert.equal(playChoice(next, 'not-a-choice'), next);
});

test('questions followed by listening improve the conversation and observation', () => {
  const initial = steady();
  const questioned = turn(turn(initial, 'honest'), 'mirror-question');
  const listened = playChoice(questioned, 'listen-fatigue');
  assert.equal(listened.player.observation, questioned.player.observation + 1);
  assert.match(listened.logs.at(-1).feedback.join(), /聞いてから受け止めた/);
  assert.ok(listened.hidden.interest > questioned.hidden.interest);
});

test('a third consecutive tone stops generating interest and vibe gains', () => {
  const first = playChoice(steady(), 'honest').logs[0];
  const initial = steady({
    stepIndex: 2,
    logs: [{ ...first, tone: 'playful' }, { ...first, tone: 'playful' }],
  });
  const response = playChoice(initial, 'light-joke');
  assert.equal(response.hidden.interest, initial.hidden.interest);
  assert.equal(response.hidden.vibe, initial.hidden.vibe);
  assert.match(response.logs.at(-1).feedback.join(), /同じ調子/);
});

test('time advances on long replies while concise replies offset it', () => {
  const initial = steady({ stepIndex: 1 });
  assert.equal(playChoice(initial, 'boyfriend').hidden.timePressure, 3);
  assert.equal(playChoice(initial, 'give-space').hidden.timePressure, 2);
  const timedOut = playChoice(steady({ hidden: { caution: 2, interest: 4, vibe: 4, timePressure: 7 } }), 'honest');
  assert.equal(timedOut.ending.id, 'fail');
});

test('early contact exchange actually ends the encounter', () => {
  const response = playChoice(steady({ stepIndex: 3 }), 'contact-now');
  assert.equal(response.ending.id, 'contact');
  assert.equal(response.awaitingContinue, false);
  assert.equal(continueConversation(response), response);
  assert.equal(playChoice(response, 'pressure-time'), response);
  assert.equal(useFocus(response, 'observe'), response);
});

test('two consecutive bad responses end a conversation instead of ignoring refusal', () => {
  const response = playChoice(steady({
    stepIndex: 1, lastMood: 'bad',
    hidden: { caution: 6, interest: 0, vibe: 0, timePressure: 6 },
  }), 'boyfriend');
  assert.equal(response.ending.id, 'fail');
});

test('an uncertain confirmation never produces a hotel ending', () => {
  const initial = steady({
    stepIndex: 5, hotelRoute: 'drink',
    hidden: { caution: 4, interest: 3, vibe: 2, timePressure: 6 },
  });
  const response = playChoice(initial, 'hotel-final-confirm');
  assert.equal(response.lastMood, 'mixed');
  assert.ok(!response.ending.id.startsWith('hotel'));
});

test('all normal decision paths terminate, stay bounded, and all ten endings remain reachable', () => {
  const found = new Set();
  let paths = 0;
  const visit = (snapshot) => {
    assert.ok(snapshot.stepIndex >= 0 && snapshot.stepIndex < scenario.length);
    for (const value of [...Object.values(snapshot.player), ...Object.values(snapshot.hidden)]) {
      assert.ok(value >= 0 && value <= 8);
    }
    if (snapshot.ending) {
      found.add(snapshot.ending.id);
      paths += 1;
      return;
    }
    const next = continueConversation(snapshot);
    for (const choice of scenario[next.stepIndex].choices) visit(playChoice(next, choice.id));
  };
  for (let index = 0; index < 40; index += 1) visit(createInitialSnapshot(Math.imul(index, 2654435761) >>> 0));
  assert.deepEqual([...found].sort(), Object.keys(endings).sort());
  assert.ok(paths > 1000);
});

test('scene-specific choices still resolve for every location', () => {
  for (const target of targetProfiles) {
    for (const step of scenario) {
      const resolved = resolveStepForScene(step, target.visualKey);
      assert.ok(resolved.npcLine);
      assert.equal(resolved.choices.length, step.choices.length);
      assert.ok(resolved.choices.every((choice) => choice.text && choice.replies.good && choice.replies.mixed && choice.replies.bad));
    }
  }
});
