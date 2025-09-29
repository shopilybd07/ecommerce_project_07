from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the homepage
        page.goto("http://localhost:3000")

        # 1. Verify top bar changes on the homepage
        header = page.locator("header").first

        # Check that "Shop" link is not visible
        shop_link = header.get_by_role("link", name="Shop", exact=True)
        expect(shop_link).not_to_be_visible()

        # Check that "Categories" link exists and points to /products
        categories_link = header.get_by_role("link", name="Categories", exact=True)
        expect(categories_link).to_be_visible()
        expect(categories_link).to_have_attribute("href", "/products")

        # Take a screenshot of the homepage
        page.screenshot(path="jules-scratch/verification/homepage_verification.png")

        # 2. Verify navigation to the products page
        categories_link.click()

        # Wait for the products page to load and verify the URL
        expect(page).to_have_url("http://localhost:3000/products")

        # Check that the main heading is "Products"
        expect(page.get_by_role("heading", name="Products")).to_be_visible()

        # Take a screenshot of the products page (which should be empty)
        page.screenshot(path="jules-scratch/verification/products_page_verification.png")

        browser.close()
        print("Verification script completed successfully.")

if __name__ == "__main__":
    run_verification()