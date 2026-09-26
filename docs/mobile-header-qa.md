# Mobile header QA contract

The DTF site header must remain usable on narrow phones without removing core navigation.

## Required behavior

- Search and Menu remain available down to 350px wide.
- Header controls provide at least a 46px touch target in the normal mobile range.
- The menu panel is viewport-bounded, scrollable, and uses overscroll containment so long navigation cannot run off-screen.
- At widths below 350px, the wordmark text may collapse while the brand mark and navigation controls remain available.
- Keyboard focus behavior continues to come from the shared `:focus-visible` rule.

## Deterministic check

Run `node scripts/verify-mobile-header.mjs` after changing `app/home-mobile.css` or mobile header rules. This check is static and intentionally does not use Playwright.
