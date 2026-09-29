const CONFIG = {
  shortName: "Aliss",
  fullName: "Aliss Selina Tomalá",
  signature: "Roberto Jiménez",
  musicUrl: "https://open.spotify.com/intl-es/track/1hLjr039Q03AmrlXqQEIQH"
};

const CONTENT = {
  openingTitle: "Tengo algo para ti, {shortName}",
  celebrationTitle: "¡Feliz cumpleaños, {shortName}!",
  celebrationSubtitle: "Te tengo un pequeño detalle para celebrar tu día.",
  openLabel: "Toca para abrir",
  swipeHint: "desliza →",
  phrases: [
    "Que este año te traiga lo que sueñas, y dale con toda, y estoy seguro que vas a seguir con esas ganas de seguir comiendote al mundo.",
    "Disfruta los pequeños momentos, valóralos y atesóralos, nunca dejes de sonreír, y verás que vas a tener muchos recuerdos que quieras guardar por mucho tiempo."
  ],
  photoPath: "./fotos/aliss.jpeg",
  photoAlt: "Fotografía de Aliss",
  tianaPath: "./fotos/tiana.png",
  rayPath: "./fotos/rey.png",
  lilyPath: "./fotos/lirio.png",
  photoCaption: "Que nunca te falten momentos felices, buena música y razones para sonreír.",
  closingMessage: "Que este nuevo año de vida llegue lleno de momentos especiales, sueños cumplidos y muchas razones para celebrar. ¡Feliz cumpleaños, {fullName}!",
  finalLabel: "Abrir un deseo para ti",
  finalWish: "Que sigas avanzando con confianza, disfrutando cada etapa y celebrando todos los logros que están por llegar.",
  finalWishGreeting: "¡Feliz cumpleaños, Aliss!",
  musicLabel: "Una canción para ti",
  reducedMotionNote: "Que tengas un cumpleaños muy bonito."
};

const state = { isOpen: false, currentPanel: 0, phraseRendered: new Set(), finalWishVisible: false };
const carousel = document.querySelector("#birthday-carousel");
const panels = [...document.querySelectorAll("[data-panel]")];
const controls = document.querySelector(".carousel-controls");
const dots = document.querySelector("#progress-dots");

function setContent() {
  document.title = `Un detalle para ${CONFIG.shortName}`;
  document.querySelector("[data-content='openingTitle']").textContent = formatText(CONTENT.openingTitle);
  document.querySelector("[data-content='celebrationTitle']").textContent = formatText(CONTENT.celebrationTitle);
  document.querySelector("[data-content='celebrationSubtitle']").textContent = CONTENT.celebrationSubtitle;
  document.querySelector("#open-lily").textContent = CONTENT.openLabel;
  document.querySelector("#swipe-hint").textContent = CONTENT.swipeHint;
  document.querySelector("[data-content='photoCaption']").textContent = CONTENT.photoCaption;
  document.querySelector("[data-content='closingMessage']").textContent = formatText(CONTENT.closingMessage);
  document.querySelector("[data-content='signature']").textContent = CONFIG.signature;
  document.querySelector("#final-detail").textContent = CONTENT.finalLabel;
  const image = document.querySelector("#birthday-photo");
  image.src = CONTENT.photoPath;
  image.alt = formatText(CONTENT.photoAlt);
  configureMusicLink();
}

function formatText(text) {
  return text.replaceAll("{shortName}", CONFIG.shortName).replaceAll("{fullName}", CONFIG.fullName);
}

function configureMusicLink() {
  const link = document.querySelector("#music-link");
  link.textContent = CONTENT.musicLabel;
  link.href = CONFIG.musicUrl;
  link.hidden = !CONFIG.musicUrl;
}

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

function renderDots() {
  panels.forEach((panel, index) => {
    const dot = document.createElement("button");
    dot.className = "progress-dot";
    dot.type = "button";
    dot.role = "tab";
    dot.ariaLabel = `Ir a la pantalla ${index + 1}`;
    dot.addEventListener("click", () => goToPanel(index));
    dots.append(dot);
  });
  updateControls();
}

function updateControls() {
  const dotButtons = [...dots.children];
  dotButtons.forEach((dot, index) => {
    dot.ariaSelected = String(index === state.currentPanel);
    dot.tabIndex = index === state.currentPanel ? 0 : -1;
  });
  document.querySelector("#previous-slide").disabled = state.currentPanel === 0;
  document.querySelector("#next-slide").disabled = state.currentPanel === panels.length - 1;
  controls.classList.toggle("is-light", state.currentPanel >= 1 && state.currentPanel <= 3);
}

function setPanelAccessibility(activeIndex) {
  panels.forEach((panel, index) => {
    const active = index === activeIndex;
    panel.setAttribute("aria-hidden", String(!active));
    panel.inert = !active;
  });
}

function goToPanel(index, smooth = true) {
  if (!state.isOpen || index < 0 || index >= panels.length) return;
  state.currentPanel = index;
  setPanelAccessibility(index);
  panels[index].scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto", block: "nearest", inline: "start" });
  updateControls();
  if (index === 1 || index === 2) renderPhrase(index - 1);
}

function updatePanelFromScroll() {
  if (!state.isOpen) return;
  const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
  if (index === state.currentPanel) return;
  state.currentPanel = Math.max(0, Math.min(index, panels.length - 1));
  setPanelAccessibility(state.currentPanel);
  updateControls();
  if (state.currentPanel === 1 || state.currentPanel === 2) renderPhrase(state.currentPanel - 1);
}

function openLily() {
  if (state.isOpen) return;
  state.isOpen = true;
  state.currentPanel = 0;
  document.querySelector(".panel--opening").classList.add("is-open");
  document.querySelector(".pond-art").classList.add("is-open");
  document.querySelector(".opening-state").hidden = true;
  document.querySelector(".celebration-state").hidden = false;
  document.querySelector("#open-lily").tabIndex = -1;
  document.querySelector("#swipe-hint").hidden = false;
  controls.hidden = false;
  document.querySelector(".experience").classList.add("has-navigation");
  carousel.setAttribute("aria-label", "Mensaje de cumpleaños abierto");
  setPanelAccessibility(0);
  createLilies(12);
  updateControls();
}

function renderPhrase(index) {
  if (state.phraseRendered.has(index)) return;
  const target = document.querySelector(`[data-phrase='${index}']`);
  const fullText = CONTENT.phrases[index];
  const accessible = document.createElement("span");
  accessible.className = "sr-only";
  accessible.textContent = fullText;
  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");
  fullText.split(" ").forEach((word, wordIndex) => {
    const span = document.createElement("span");
    span.className = "phrase-word";
    span.textContent = word;
    span.style.opacity = prefersReducedMotion() ? "1" : "0";
    span.style.transform = prefersReducedMotion() ? "none" : "translateY(.35em)";
    if (!prefersReducedMotion()) span.style.transition = `opacity .35s ease ${wordIndex * .045}s, transform .35s ease ${wordIndex * .045}s`;
    visual.append(span);
  });
  target.replaceChildren(accessible, visual);
  requestAnimationFrame(() => visual.querySelectorAll(".phrase-word").forEach(word => {
    word.style.opacity = "1";
    word.style.transform = "none";
  }));
  state.phraseRendered.add(index);
}

function createLilies(count) {
  if (prefersReducedMotion()) return;
  const layer = document.querySelector(".lily-layer");
  const svgNamespace = "http://www.w3.org/2000/svg";
  for (let index = 0; index < Math.min(count, 16); index += 1) {
    const lily = document.createElementNS(svgNamespace, "svg");
    const use = document.createElementNS(svgNamespace, "use");
    lily.classList.add("falling-lily");
    lily.setAttribute("viewBox", "0 0 100 100");
    lily.setAttribute("aria-hidden", "true");
    lily.style.left = `${4 + Math.random() * 92}%`;
    lily.style.setProperty("--size", `${32 + Math.random() * 32}px`);
    lily.style.setProperty("--duration", `${5 + Math.random() * 2}s`);
    lily.style.setProperty("--drift", `${-12 + Math.random() * 24}vw`);
    lily.style.setProperty("--rotation", `${-25 + Math.random() * 50}deg`);
    use.setAttribute("href", "#falling-lily-symbol");
    lily.append(use);
    lily.addEventListener("animationend", () => lily.remove(), { once: true });
    layer.append(lily);
  }
}

function triggerFinalEffect() {
  if (state.finalWishVisible) return;
  state.finalWishVisible = true;
  const button = document.querySelector("#final-detail");
  const card = document.createElement("section");
  const wish = document.createElement("p");
  const greeting = document.createElement("p");
  card.className = "final-wish";
  card.tabIndex = -1;
  card.setAttribute("role", "region");
  card.setAttribute("aria-label", "Deseo de cumpleaños");
  card.setAttribute("aria-live", "polite");
  wish.textContent = CONTENT.finalWish;
  greeting.textContent = CONTENT.finalWishGreeting;
  card.append(wish, greeting);
  button.disabled = true;
  button.setAttribute("aria-expanded", "true");
  document.querySelector("#final-wish-slot").append(card);
  if (!prefersReducedMotion()) document.querySelector(".fireflies").classList.add("wish-halo-active");
  card.focus();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function handleKeyboard(event) {
  if (!state.isOpen || !carousel.matches(":focus-within")) return;
  if (event.key === "ArrowRight") { event.preventDefault(); goToPanel(state.currentPanel + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); goToPanel(state.currentPanel - 1); }
}

function setupPhotoFallback() {
  const image = document.querySelector("#birthday-photo");
  const fallback = document.querySelector(".photo-fallback");
  image.hidden = true;
  fallback.hidden = false;
  image.addEventListener("load", () => { image.hidden = false; fallback.hidden = true; }, { once: true });
  image.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; }, { once: true });
}

function init() {
  setupPhotoFallback();
  setContent();
  renderFireflies();
  renderDots();
  setPanelAccessibility(0);
  document.querySelector("#open-lily").addEventListener("click", openLily);
  document.querySelector("#previous-slide").addEventListener("click", () => goToPanel(state.currentPanel - 1));
  document.querySelector("#next-slide").addEventListener("click", () => goToPanel(state.currentPanel + 1));
  document.querySelector("#final-detail").addEventListener("click", triggerFinalEffect);
  carousel.addEventListener("scroll", updatePanelFromScroll, { passive: true });
  document.addEventListener("keydown", handleKeyboard);
}

init();
