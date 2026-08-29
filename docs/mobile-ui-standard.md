# Mobile UI standard

DTF Genetics treats mobile as a first-class product surface rather than a compressed desktop layout.

## Release requirements

- Primary navigation must not wrap into multiple desktop-style rows on small screens.
- Interactive controls should provide a practical touch target of at least 44 by 44 CSS pixels where layout permits.
- Pages must not introduce horizontal document overflow at supported mobile viewports.
- Primary calls to action must remain readable, reachable, and visually distinct without hover.
- Dense desktop grids must collapse intentionally instead of shrinking content below readable sizes.
- Images and game canvases must remain contained within the viewport.
- Literal internal links must resolve to an application route, configured redirect, or public asset.
- Desktop and mobile Browser QA must pass before production cutover.

## Priority order on small screens

1. Brand and navigation
2. Page identity and primary action
3. Search/discovery where applicable
4. Primary genetics, learning, diagnostic, or tool content
5. Supporting references and secondary destinations
6. Community/editorial material
7. Footer navigation

The mobile experience may progressively disclose secondary navigation and dense supporting content rather than displaying every desktop element simultaneously.
