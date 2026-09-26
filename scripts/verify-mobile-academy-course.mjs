import fs from 'node:fs';

const css = fs.readFileSync(new URL('../app/learn/academy/[course]/page.module.css', import.meta.url), 'utf8');

const required = [
  '@media (max-width: 620px)',
  'overflow-wrap: anywhere',
  'touch-action: manipulation',
  'min-height: 46px',
  'grid-template-columns: 1fr',
  'min-height: 48px',
  '@media (max-width: 380px)',
];

const missing = required.filter((token) => !css.includes(token));
if (missing.length) {
  console.error(`Academy mobile course verification failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Academy mobile course verification passed.');
