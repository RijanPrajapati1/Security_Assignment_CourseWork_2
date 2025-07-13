// tests/navbar.test.js
const { test, expect } = require('@playwright/test');

test('Navbar UI Elements', async ({ page }) => {
  // Navigate to the page that renders the Navbar
  await page.goto('http://localhost:5173'); // Make sure your frontend is running

  // Test for Navbar title
  const title = await page.locator('a.btn-ghost.normal-case.text-2xl.font-bold.text-white');
  await expect(title).toHaveText('Wheeloop');

  // Test for Menu Items
  const menuItems = await page.locator('ul.menu-horizontal li');
  await expect(menuItems).toHaveCount(5);

  // Test for Login button visibility when not logged in
  const loginButton = await page.locator('button:has-text("Login")');
  await expect(loginButton).toBeVisible();

  // Click the login button and test the modal
  await loginButton.click();
  const loginModal = await page.locator('div.bg-white.rounded-xl.shadow-lg');
  await expect(loginModal).toBeVisible();

  // Test Login Modal Fields
  const emailField = await loginModal.locator('input[name="email"]');
  const passwordField = await loginModal.locator('input[name="password"]');
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();

  // Test Signup modal toggle
  const signupButton = await loginModal.locator('button:has-text("Sign Up")');
  await signupButton.click();
  const signupModal = await page.locator('div.bg-white.rounded-xl.shadow-lg');
  await expect(signupModal).toBeVisible();

  // Test Signup Modal Fields
  const fullNameField = await signupModal.locator('input[name="fullName"]');
  const confirmPasswordField = await signupModal.locator('input[name="confirmPassword"]');
  await expect(fullNameField).toBeVisible();
  await expect(confirmPasswordField).toBeVisible();

  // Test Profile dropdown visibility after login (assuming localStorage has auth data)
  await page.evaluate(() => {
    localStorage.setItem("authToken", "dummy_token");
    localStorage.setItem("userRole", "customer");
  });
  await page.reload();  // Reload the page after setting localStorage

  const profileDropdown = await page.locator('div.dropdown-end');
  await expect(profileDropdown).toBeVisible();

  // Test Profile Navigation
  const profileLink = await profileDropdown.locator('a:has-text("Profile")');
  await expect(profileLink).toBeVisible();
});
