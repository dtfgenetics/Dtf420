import fs from 'node:fs';

const css = fs.readFileSync(new URL('../app/home-mobile.css', import.meta.url), 'utf8');

const required = [
  '.mobile-nav-actions',
  'touch-action: manipulation',
  'max-height: calc(100dvh - 82px)',
  'overscroll-behavior: contain',
  '@media (max-width: 420px)',
  '.mobile-search',
  'display: inline-flex',
  '@media (max-width: 350px)',
];

const missing = required.filter((token) => !css.includes(token));
if (missing.length) {
  console.error(`Mobile header verification failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Mobile header verification passed.');
