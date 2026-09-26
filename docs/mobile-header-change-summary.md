# Mobile header change scope

This pass is intentionally limited to mobile header usability and its deterministic QA guardrail.

- Preserve Search on narrow phones instead of hiding it at 390px.
- Keep Search/Menu touch targets usable while reducing wasted header width.
- Bound the open menu to the dynamic viewport and allow internal scrolling.
- Collapse wordmark text only on extremely narrow screens below 350px.
- Do not change desktop navigation, route structure, page content, game mechanics, or visual assets.
