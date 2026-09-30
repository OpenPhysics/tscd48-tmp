# Accessibility

The demo web interface aims for **WCAG 2.1 AA**.

## What is supported
- **Keyboard:** every control is reachable with Tab in a logical order, a "Skip to main content" link appears on first Tab, and sliders (Trigger Level, DAC Output) respond to arrow keys. Focus shows a 3px pink (`#e94560`) outline.
- **Screen readers:** semantic landmarks, descriptive `aria-label`s, and live regions (`aria-live="polite"`) for connection status, channel counts, device status and slider values. The activity log uses `role="log"`.
- **Visual:** body text contrast is 17.8:1 (`#eeeeee` on `#0f0f1e`), status is conveyed by text as well as colour, text is sized in `rem` and stays usable at 200% zoom, and `prefers-reduced-motion` is honoured.
- **Browsers:** Web Serial is needed, so Chrome/Edge 89+ and Opera 76+ only.

## Known limitations
- The chart is canvas-based and not exposed to screen readers. Use CSV export as the accessible alternative.
- Channel counts update often and can be chatty in live regions. Turn off auto-refresh for a quieter experience.
- Only keyboard-only navigation has been tested thoroughly. NVDA was tested partially, and JAWS, VoiceOver and TalkBack have not been tested.
- Dark theme only.

Automated checks live in `tests/e2e/accessibility.spec.ts`. Report barriers through the repository's issue tracker, and include browser, assistive technology and steps to reproduce.
