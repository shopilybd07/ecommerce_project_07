import json
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()

    # 1. Create a fake user and set auth cookie
    fake_user = {
        "id": "test-user-id-123",
        "name": "Test User",
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com",
        "roles": [{"role": {"name": "USER"}}]
    }

    # The cookie needs to be set for the domain of the app
    # The dev server runs on http://localhost:3000 by default
    context.add_cookies([{
        "name": "auth-user",
        "value": json.dumps(fake_user),
        "domain": "localhost",
        "path": "/",
    }])

    page = context.new_page()

    # 2. Navigate to the dashboard
    try:
        page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
    except Exception as e:
        print(f"Navigation failed. Is the dev server running on http://localhost:3000? Error: {e}")
        page.screenshot(path="jules-scratch/verification/navigation_error.png")
        browser.close()
        return

    # Wait for the welcome message to ensure page is loaded
    expect(page.get_by_role("heading", name="Welcome back, Test User!")).to_be_visible(timeout=10000)

    # 3. Click the "Chat" button in the sidebar
    chat_button = page.get_by_role("button", name="Chat")
    expect(chat_button).to_be_visible()
    chat_button.click()

    # 4. Verify the chat window is visible
    chat_title = page.get_by_role("heading", name="Chat with Admin")
    expect(chat_title).to_be_visible()

    message_input = page.get_by_placeholder("Type a message...")
    expect(message_input).to_be_visible()

    # It might take a moment for the chat to connect and load
    time.sleep(2) # a small wait for any async operations in chat window

    # 5. Take a screenshot
    page.screenshot(path="jules-scratch/verification/chat-window.png")

    print("Screenshot taken successfully: jules-scratch/verification/chat-window.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)