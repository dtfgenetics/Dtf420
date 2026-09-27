import fs from 'node:fs';

const css = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layout = fs.readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

const required = [
  '.mobile-nav-actions',
  'touch-action: manipulation',
  'max-height: calc(100dvh - 82px)',
  'overscroll-behavior: contain',
  '@media (max-width: 700px)',
  '.mobile-search',
  'display: inline-flex',
  '@media (max-width: 350px)',
];

const missing = required.filter((token) => !css.includes(token));
if (missing.length) {
  console.error(`Mobile header verification failed. Missing from globals.css: ${missing.join(', ')}`);
  process.exit(1);
}

if (/home-mobile\.css/.test(layout)) {
  console.error('Mobile header verification failed. Root layout must not reintroduce app/home-mobile.css.');
  process.exit(1);
}

console.log('Mobile header verification passed against consolidated globals.css.');
