from playwright.sync_api import sync_playwright


def check_page(page, reduced_motion=False):
    page.goto("http://127.0.0.1:4188")
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
    assert card.inner_text() == "Que nunca te falten motivos para sonreír, personas que te aprecien y nuevos sueños por cumplir.\n¡Feliz cumpleaños, Aliss!"
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
    try:
        normal_page = browser.new_page()
        check_page(normal_page)
        reduced_page = browser.new_page(reduced_motion="reduce")
        check_page(reduced_page, reduced_motion=True)
    finally:
        browser.close()
