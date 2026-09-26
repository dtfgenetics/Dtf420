# DTF420 Responsive Layout Standard

This is the unified-app responsive contract.

The goal is one coherent interface that intentionally adapts across phones, tablets, compact laptops, desktops, and wide displays. A desktop page that merely shrinks is not considered responsive.

## Canonical viewport bands

| Band | CSS width | Default expectation |
| --- | ---: | --- |
| Small phone | 320–420 px | One reading column, compact spacing, full-width primary actions |
| Large phone | 421–700 px | One main column; limited compact two-up UI only when proven usable |
| Tablet | 701–900 px | Deliberate tablet composition |
| Compact desktop / large tablet | 901–1120 px | Reduced desktop layout |
| Desktop | 1121–1440 px | Full composition |
| Wide desktop | 1441 px+ | Capped content width |

## Shared layout source

Primary shared styles live in:

- `app/globals.css`

Page- or feature-specific styles may extend the system, but must not silently reverse shared behavior at overlapping breakpoints.

## Core rules

- Use fluid gutters and capped content widths.
- Prefer `clamp()`, `min()`, `max()`, and `minmax(0,1fr)`.
- Give shrinkable grid/flex children `min-width:0`.
- Keep media at or below container width.
- Long labels, URLs, lineage strings, source names, and generated content must wrap.
- Use local horizontal scrolling for tables/code instead of widening the page.
- Keep touch targets at least 44 px high where practical.
- Use `100dvh` for height-constrained menus/dialogs.
- Treat tablet as its own composition state.
- Do not use `overflow-x:hidden` or clipping as a substitute for fixing the overflowing child.
- Avoid duplicate responsive logic in multiple late-loaded stylesheets.


## Assessments, exams, and certification screens

Certification and testing UI must remain usable under time pressure on phones, tablets, and desktop screens.

- Answer choices are primary interactive controls and must keep at least a 44px touch target.
- Selecting an answer must not immediately reveal correctness unless the assessment design explicitly calls for practice mode; scored exams should preserve the learner's choice and grade after submission.
- Timers, progress indicators, question numbers, and candidate identity must remain visible without covering the question or answer controls.
- Fixed or sticky exam navigation must respect `env(safe-area-inset-bottom)` and constrained-height viewports.
- Do not place required Submit, Next, Previous, Finish, or Review controls behind a fixed footer, browser chrome, or the virtual keyboard.
- Long questions, answer text, references, and validation messages must wrap without creating page-level horizontal scrolling.
- Tables, figures, and diagrams inside questions must use local responsive containment.
- Review/grading screens must work as a separate post-assessment state and must not depend on the learner self-verifying answers during the test.
- Print/certificate actions must remain secondary to the pass/fail result and must not be required to finish the assessment.

## CSS load-order review

Before changing a breakpoint-sensitive rule:

1. list every stylesheet affecting the component;
2. find every matching selector/property;
3. note media-query ranges;
4. note specificity and `!important`;
5. determine which declaration wins at each canonical viewport.

If two declarations conflict at the same width, consolidate or separate responsibilities.

## Known failure this standard prevents

A previous homepage issue used two files with overlapping small-screen rules. The shared file collapsed the discovery grid to one column, while the later-loaded mobile file forced it back to two columns. Both files looked reasonable by themselves, but the final cascade was wrong.

Responsive review must therefore inspect the final cascade, not isolated files.

## QA matrix

Minimum rendered checks:

```text
360x800
390x844
430x932
768x1024
820x1180
1024x768
1280x800
1440x900
```

For sticky menus, overlays, or game HUDs, also test a short-height viewport.

## Automated guardrail

Run:

```bash
npm run verify:responsive
```

The verifier checks:

- shared fluid gutter/touch-target tokens;
- expected tablet/phone breakpoint contract;
- shrink-safe grid behavior;
- local overflow resilience;
- dynamic-height handling;
- the homepage small-phone discovery grid remains one column;
- this standard retains the required QA matrix.

It does not replace rendered QA.

## Review checklist

- [ ] Shared CSS inspected before local overrides.
- [ ] No contradictory overlapping breakpoint rule.
- [ ] Phone, tablet, compact, and desktop states are intentional.
- [ ] No page-level horizontal overflow.
- [ ] Long text/media cannot force width.
- [ ] Touch controls remain usable.
- [ ] Sticky/overlay UI works at constrained height.
- [ ] Tables/code use local scrolling.
- [ ] `npm run verify:responsive` passes.
- [ ] Rendered QA completed at the required matrix.
- [ ] Exact release SHA verified before merge.
