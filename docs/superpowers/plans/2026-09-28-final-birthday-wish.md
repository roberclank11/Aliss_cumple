# Final Birthday Wish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal one accessible birthday-wish card from the final button while concentrating the initial fireflies and never triggering another lily rain.

**Architecture:** `script.js` renders a fixed initial set of fireflies once during startup, then the final action only changes existing DOM state and creates the guarded wish card. `style.css` owns the normal-motion halo, Ray glow, card reveal, and reduced-motion overrides; `index.html` provides the stable card insertion point.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Python Playwright.

---

## File Structure

- Modify: `index.html` - add an insertion point beside the final action.
- Modify: `script.js` - restore one-time initial firefly rendering and replace the lily-based final effect.
- Modify: `style.css` - position initial fireflies, create the CSS-only halo, and style the card and reduced-motion behavior.
- Create: `tests/final-wish.py` - exercise initial fireflies, opening, final reveal, duplicate prevention, and reduced motion in Chromium.

### Task 1: Capture the final interaction contract

**Files:**
- Create: `tests/final-wish.py`

- [ ] **Step 1: Write the failing browser test**

```python
from playwright.sync_api import sync_playwright


def check_page(page, reduced_motion=False):
    page.goto("http://localhost:4173")
    page.wait_for_load_state("networkidle")

    assert page.locator(".fireflies .firefly").count() == 8
    page.get_by_role("button", name="Toca para abrir").click()
    assert page.locator(".panel--opening").get_attribute("class").find("is-open") >= 0

    page.locator("#next-slide").click()
    page.locator("#next-slide").click()
    page.locator("#next-slide").click()
    button = page.get_by_role("button", name="Abrir un deseo para ti")
    initial_fireflies = page.locator(".fireflies .firefly").count()
    button.click()

    card = page.get_by_role("region", name="Deseo de cumpleaños")
    assert card.is_visible()
    assert "Que nunca te falten motivos para sonreír" in card.inner_text()
    assert "¡Feliz cumpleaños, Aliss!" in card.inner_text()
    assert button.is_disabled()
    assert page.locator(".fireflies").evaluate("node => node.classList.contains('wish-halo-active')") is not reduced_motion
    assert page.locator(".fireflies .firefly").count() == initial_fireflies
    assert page.locator(".lily-layer .falling-lily").count() == 0

    page.locator("#final-detail").evaluate("button => { button.disabled = false; button.click(); }")
    assert page.get_by_role("region", name="Deseo de cumpleaños").count() == 1
    if reduced_motion:
        assert page.locator(".firefly").evaluate("node => getComputedStyle(node).animationName") == "none"


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    normal_page = browser.new_page()
    check_page(normal_page)
    reduced_page = browser.new_page(reduced_motion="reduce")
    check_page(reduced_page, reduced_motion=True)
    browser.close()
```

- [ ] **Step 2: Run the browser test to verify it fails**

Run: `python .agents/skills/webapp-testing/scripts/with_server.py --server "python -m http.server 4173" --port 4173 -- python tests/final-wish.py`

Expected: FAIL because the final button still has its former label and does not create a wish card.

### Task 2: Add a stable wish-card insertion point

**Files:**
- Modify: `index.html:116-121`

- [ ] **Step 1: Add the insertion point after the final button**

```html
<button class="button button--final" id="final-detail" type="button"></button>
<div id="final-wish-slot"></div>
<a class="music-link" id="music-link" target="_blank" rel="noopener noreferrer" hidden></a>
```

- [ ] **Step 2: Verify the focused test still fails only on the unimplemented behavior**

Run: `python .agents/skills/webapp-testing/scripts/with_server.py --server "python -m http.server 4173" --port 4173 -- python tests/final-wish.py`

Expected: FAIL because the label, card creation, and halo class are not implemented yet.

### Task 3: Restore initial fireflies and replace the final action

**Files:**
- Modify: `script.js:25-30, 57-61, 180-190, 211-224`

- [ ] **Step 1: Replace the final content and state fields**

```javascript
finalLabel: "Abrir un deseo para ti",
finalWish: "Que nunca te falten motivos para sonreír, personas que te aprecien y nuevos sueños por cumplir.",
finalWishGreeting: "¡Feliz cumpleaños, Aliss!"
```

```javascript
const state = { isOpen: false, currentPanel: 0, phraseRendered: new Set(), finalWishVisible: false };
```

- [ ] **Step 2: Restore the one-time startup renderer above `renderDots`**

```javascript
function renderFireflies() {
  const layer = document.querySelector(".fireflies");
  if (layer.children.length) return;
  const positions = [[12, 23], [79, 18], [24, 40], [88, 48], [8, 71], [73, 76], [44, 14], [57, 86]];
  positions.forEach(([left, top], index) => {
    const firefly = document.createElement("span");
    firefly.className = "firefly";
    firefly.style.left = `${left}%`;
    firefly.style.top = `${top}%`;
    firefly.style.animationDelay = `${index * -.55}s`;
    layer.append(firefly);
  });
}
```

- [ ] **Step 3: Replace `triggerFinalEffect` with the guarded card reveal**

```javascript
function triggerFinalEffect() {
  if (state.finalWishVisible) return;
  state.finalWishVisible = true;
  const button = document.querySelector("#final-detail");
  const fireflyLayer = document.querySelector(".fireflies");
  const slot = document.querySelector("#final-wish-slot");
  const card = document.createElement("section");
  card.className = "final-wish";
  card.tabIndex = -1;
  card.setAttribute("aria-label", "Deseo de cumpleaños");
  card.setAttribute("role", "region");
  card.setAttribute("aria-live", "polite");
  const wish = document.createElement("p");
  wish.textContent = CONTENT.finalWish;
  const greeting = document.createElement("p");
  greeting.textContent = CONTENT.finalWishGreeting;
  card.append(wish, greeting);
  button.disabled = true;
  button.setAttribute("aria-expanded", "true");
  slot.append(card);
  if (!prefersReducedMotion()) fireflyLayer.classList.add("wish-halo-active");
  card.focus();
}
```

- [ ] **Step 4: Render the initial fireflies once during startup**

```javascript
function init() {
  setupPhotoFallback();
  setContent();
  renderFireflies();
  renderDots();
  // Retain the existing listeners below this point.
}
```

- [ ] **Step 5: Verify the script has no final lily creation or invalid layer selectors**

Run: `rg "triggerFinalEffect|createLilies|renderFireflies|fireflies|firefly-layer|lily-layer" script.js index.html style.css`

Expected: `createLilies` appears only in `openLily`; firefly selectors consistently use `.fireflies`; `.lily-layer` remains exclusive to falling lilies.

### Task 4: Style the card, halo, and reduced-motion mode

**Files:**
- Modify: `style.css:136-143, 188-201, 227-230`

- [ ] **Step 1: Add the card and Ray reveal styles**

```css
.final-wish {
  margin: 1.25rem auto 0;
  padding: 1.25rem;
  border: 1px solid rgba(242, 201, 76, .65);
  border-radius: 1rem;
  color: var(--ink);
  background: var(--lily);
  box-shadow: 0 0 2rem rgba(242, 201, 76, .2);
  opacity: 0;
  transform: scale(.94);
  animation: wish-card-in .45s ease forwards;
}
.final-wish p { margin: 0; font: 500 1.25rem/1.25 var(--serif); }
.final-wish p + p { margin-top: .5rem; }
.image-rey { transition: filter .45s ease; }
.closing-panel:has(.final-wish) .image-rey { filter: drop-shadow(0 0 .75rem var(--firefly)); }
```

- [ ] **Step 2: Add CSS-only concentration for the existing fireflies**

```css
.fireflies.wish-halo-active .firefly {
  left: 50% !important;
  top: 63% !important;
  opacity: .9;
  transition: left .6s ease, top .6s ease, transform .6s ease;
}
.fireflies.wish-halo-active .firefly:nth-child(1) { transform: translate(-8rem, -3rem); }
.fireflies.wish-halo-active .firefly:nth-child(2) { transform: translate(6rem, -4rem); }
.fireflies.wish-halo-active .firefly:nth-child(3) { transform: translate(-10rem, 1rem); }
.fireflies.wish-halo-active .firefly:nth-child(4) { transform: translate(8rem, 2rem); }
.fireflies.wish-halo-active .firefly:nth-child(5) { transform: translate(-5rem, 5rem); }
.fireflies.wish-halo-active .firefly:nth-child(6) { transform: translate(4rem, 5rem); }
.fireflies.wish-halo-active .firefly:nth-child(7) { transform: translate(-1rem, -5rem); }
.fireflies.wish-halo-active .firefly:nth-child(8) { transform: translate(1rem, 6rem); }
@keyframes wish-card-in { to { opacity: 1; transform: scale(1); } }
```

- [ ] **Step 3: Complete the reduced-motion override**

```css
@media (prefers-reduced-motion: reduce) {
  .firefly { animation: none; }
  .final-wish { opacity: 1; transform: none; animation: none; }
  .image-rey { transition: none; filter: none !important; }
}
```

- [ ] **Step 4: Run the browser test to verify it passes**

Run: `python .agents/skills/webapp-testing/scripts/with_server.py --server "python -m http.server 4173" --port 4173 -- python tests/final-wish.py`

Expected: PASS with no browser-console errors, eight initial fireflies, one focusable wish card, no final-action lily nodes, and static reduced-motion behavior.

- [ ] **Step 5: Commit the implementation**

```bash
git add index.html script.js style.css tests/final-wish.py
git commit -m "Add final birthday wish"
```
