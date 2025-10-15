from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000/")

    # Click the first product link
    page.locator(".product-card a").first.click()

    # Wait for the product details page to load
    page.wait_for_selector("text=Add to Cart")

    # Click the "Buy Now" button
    page.get_by_role("button", name="Buy Now").click()

    # Wait for the checkout page to load
    page.wait_for_url("**/checkout**")

    # Take a screenshot of the checkout page
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
