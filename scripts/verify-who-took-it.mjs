import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const page = read('app/games/who-took-it/page.tsx');
const game = read('app/games/who-took-it/WhoTookItGame.tsx');
const css = read('app/games/who-took-it/page.module.css');
const catalog = read('lib/game-catalog.ts');
const sitemap = read('app/sitemap.ts');

const suspectIds = [...game.matchAll(/id: "suspect_\d{3}"/g)].map((match) => match[0]);
const itemIds = [...game.matchAll(/id: "item_[a-z_]+"/g)].map((match) => match[0]);
const questionIds = [...game.matchAll(/id: "q_[si]_[a-z_]+"/g)].map((match) => match[0]);
const uniqueSuspects = new Set(suspectIds);
const uniqueItems = new Set(itemIds);
const uniqueQuestions = new Set(questionIds);

assert(page.includes('WhoTookItGame'), 'route page must render WhoTookItGame');
assert(page.includes('Who Took It? | DTF Games'), 'route metadata title missing');
assert(page.includes('/games'), 'route page must link back to all games');

assert.equal(uniqueSuspects.size, 25, `expected 25 unique suspects, found ${uniqueSuspects.size}`);
assert.equal(uniqueItems.size, 5, `expected 5 unique items, found ${uniqueItems.size}`);
assert.equal(uniqueQuestions.size, 29, `expected 29 unique preset questions, found ${uniqueQuestions.size}`);

for (const mode of ['solo', 'shared', 'duel']) {
  assert(game.includes(`"${mode}"`), `missing supported mode: ${mode}`);
}

for (const phrase of [
  'STORAGE_KEY',
  'AGE_KEY',
  'schemaVersion: 1',
  'isSavedPayload',
  'const mysteries = value.mysteries;',
  'hasMounted',
  'setHasMounted(true)',
  'if (!hasMounted) return;',
  'bestLead',
  'aria-live="polite"',
  'aria-modal="true"',
  'Yes, I am 21+',
  'Lock accusation',
]) {
  assert(game.includes(phrase), `WhoTookItGame missing required feature marker: ${phrase}`);
}

assert(!game.includes('const [saved] = useState(() => readSaved())'), 'saved browser state must not be read during initial render');
assert(!game.includes('React.CSSProperties'), 'use imported CSSProperties type instead of React namespace');
assert(!game.includes('contentEditable'), 'first release must not use free-form questions');
assert(!game.includes('textarea'), 'first release must not use typed/free-form question input');
assert(!game.toLowerCase().includes('hasbro'), 'route must not include third-party board-game branding');
assert(!game.toLowerCase().includes('harry potter'), 'route must not include third-party character data');
assert(!game.toLowerCase().includes('one piece'), 'route must not include third-party character data');

assert(catalog.includes('slug: "who-took-it"'), 'game catalog must include who-took-it slug');
assert(catalog.includes('Play Who Took It?'), 'game catalog action label missing');
assert(sitemap.includes('item("/games/who-took-it"'), 'sitemap must include /games/who-took-it');

for (const className of ['gameShell', 'modeBar', 'suspectGrid', 'bestLead', 'ageGate', 'result']) {
  assert(css.includes(`.${className}`), `CSS module missing .${className}`);
}

for (const cssMarker of [
  ':focus-visible',
  'prefers-reduced-motion',
  '@media (max-width: 380px)',
  'overflow-x: clip',
  'minmax(0, 1fr)',
]) {
  assert(css.includes(cssMarker), `CSS module missing accessibility/mobile marker: ${cssMarker}`);
}

console.log('Who Took It? route verification passed.');
