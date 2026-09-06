# PhenoQuest current-main recovery — 2026-09-06

This recovery preserves the intended PhenoQuest MVP from stale PR #80 without carrying its diverged history into `main`.

## Reconciliation proof

- Recovery parent is Atlas-reconciled `main` commit `202b0171b5857c9f5e97b067a801d456f32f6973`.
- The original PR #80 was based on `eaa441e3c83c3001bba5a8d1b1a4d5bd032f77d1` and had become non-mergeable.
- The Games hub blob on current main was byte-identical to PR #80's base before the PhenoQuest insertion, so the PhenoQuest Games card can be transplanted without overwriting unrelated hub work.
- The seven game-specific runtime/route/data files and browser/verifier files are preserved from the repaired PR #80 head.
- `package.json` is merged semantically: all current Atlas/image-intake verification gates and current Next/React dependency versions remain intact, with only `verify:phenoquest` added to the scripts and full verify chain.

## Release gate

Do not merge until exact-head Verify, Static Overlay QA, and Browser QA all pass. Keep PhenoQuest labeled Development preview after integration.