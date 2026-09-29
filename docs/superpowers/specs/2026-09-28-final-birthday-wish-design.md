# Final Birthday Wish Design

## Scope

Replace the closing-panel action currently labeled "Un último detalle" with "Abrir un deseo para ti". The original closing message, navigation controls, and music link remain unchanged.

## Interaction

The closing button is a one-time action. On its first activation, JavaScript disables it and inserts one semantic wish card adjacent to the button. The card contains:

> Que nunca te falten motivos para sonreír, personas que te aprecien y nuevos sueños por cumplir.
> ¡Feliz cumpleaños, Aliss!

The card receives programmatic focus after insertion so keyboard and screen-reader users discover it. A guard prevents creating a second card if the action is invoked again.

## Motion And Decoration

For normal-motion users, the existing firefly container is styled into a concentrated golden halo around the card, without creating new particle nodes. Ray remains in the closing panel and gains a subtle golden glow while the wish is visible. The card transitions from reduced opacity and scale to its resting state.

For `prefers-reduced-motion: reduce`, the card is inserted visibly with no firefly concentration, Ray glow, or transition. No final interaction may call `createLilies` in either motion mode.

## Accessibility And Validation

The card is a focusable labeled region with a live announcement for its new content. The disabled button prevents duplicate activation. The existing reduced-motion stylesheet continues to suppress animations globally.

Manual verification covers the first click, repeated click, keyboard activation and focus, visible fireflies and Ray glow, and reduced-motion behavior.
