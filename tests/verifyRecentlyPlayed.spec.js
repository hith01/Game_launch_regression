const { test, expect } = require('@playwright/test');

test('Login and launch game', async ({ page }) => {

  // Navigate to the login page
  await page.goto('https://www.qa.betsson.com/en');

 // Fill in the login form
 await page.waitForSelector("//span[@class='mat-button-wrapper'][contains(text(),'Log in')]");
 await page.click("//span[@class='mat-button-wrapper'][contains(text(),'Log in')]");


  // Wait for the username field and fill it in forcefully
  const usernameField = page.locator('[data-test-id="login-username"]');
  await usernameField.waitFor();
  await usernameField.fill('');
  await page.evaluate(() => {
    const element = document.querySelector('[data-test-id="login-username"]');
    element.value = 'testbetssoneur01@betssongroup.com';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(usernameField).toHaveValue("testbetssoneur01@betssongroup.com");

  // Debugging step: Log value immediately after filling
  console.log('Username filled :', await usernameField.inputValue());

  // Wait before interacting with the password field
  await page.waitForTimeout(2000);

  // Wait for the password field and fill it in forcefully
  const passwordField = page.locator('[data-test-id="login-password"]');
  await passwordField.waitFor();
  await passwordField.fill('');
  await page.evaluate(() => {
    const element = document.querySelector('[data-test-id="login-password"]');
    element.value = 'Qwer1234';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(passwordField).toHaveValue("Qwer1234");

  // Debugging step: Log value immediately after filling
  console.log('Password filled :', await passwordField.inputValue());

  // Wait before clicking the submit button
  await page.waitForTimeout(2000);

  // Click the login button
  await page.click('button[test-id="login-submit"]');

  // Wait for navigation or a specific element to show login was successful
  //await page.waitForLoadState('networkidle');

  // Get the current page URL
  const currentURL1 = page.url();

  // Print the current page URL
  console.log('Current Page URL:', currentURL1);

  await page.waitForTimeout(2000);

   // Click the Casino link
   const casinoLink = page.locator('[data-test-id="menu.product.casino"]');
   await casinoLink.click();
  
   await page.waitForTimeout(2000);

   // Verify navigation to the Casino page
   await page.waitForURL('**/casino');
 
   // Print the current page URL
   const currentURL = page.url();
   console.log('Navigated to:', currentURL);
   

   //searching a game 
await page.click('span.button-text');
let search= await page.type('[test-id="search-input"]', 'Book of Dead');

await page.waitForTimeout(2000);


//Launching a game
//await page.locator("gaming-game_thumbnail").click();
let gamethumnail = page.locator("[name='gaming-game_overlay']");
console.log(gamethumnail);
await page.locator("gaming-game_overlay").shadowRoot.children[0].click();

});