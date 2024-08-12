const { test, expect } = require('@playwright/test');

test('Login and launch game', async ({ page }) => {

  // Navigate to the login page
  await page.goto('https://www.betsson.com/en');
     
  // Click the Casino link
   const casinoLink = page.locator('[data-test-id="menu.product.casino"]');
   await casinoLink.click();
  
   await page.waitForTimeout(2000);

  
  // Wait for the gaming game thumbnail to be visible
  await page.waitForSelector('gaming-game_thumbnail');

 // Locate and click the button within nested shadow DOMs

//For Practice Play
//  const button = page.locator('gaming-game_thumbnail').first().
//  locator('css=gaming-game_overlay >> css=wds-button >> css=button.play-for-fun-button');

 //For real Play
 const button = page.locator('gaming-game_thumbnail').first().
locator('css=gaming-game_overlay >> css=wds-button >> css=button.secondary-button');

// Click the button
await button.click();
 await page.waitForTimeout(2000);
console.log('Button clicked successfully');
await page.waitForTimeout(2000);

 //For real Play 

//  // Wait for the username field and fill it in forcefully
 const usernameField = page.locator('[data-test-id="login-username"]');
 await usernameField.waitFor();
 await usernameField.fill('');
 await page.evaluate(() => {
   const element = document.querySelector('[data-test-id="login-username"]');
   element.value = 'gx.obga@gmail.com';
   element.dispatchEvent(new Event('input', { bubbles: true }));
 });
 await expect(usernameField).toHaveValue("gx.obga@gmail.com");

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

 console.log("Logged in successfully and game is launched");
 await page.waitForTimeout(5000);

 

 const allframes = await page.frames();
 console.log("No of frames:", allframes.length)


// Wait for the iframe to load
const iframeElement = await page.waitForSelector('iframe');
console.log('Iframe loaded');

// Get the content frame of the iframe
const frame = await iframeElement.contentFrame();
if (!frame) {
  console.error('Failed to access the content frame of the iframe.');
  return;
}
console.log('Content frame accessed');



// Wait for the iframe to load and get its frame
const iframeElementHandle = await page.waitForSelector('iframe[src*="glauncher.bpsgameserver.com"]', { timeout: 5000 });
if (!iframeElementHandle) {
  console.error('Iframe not found');
  await browser.close();
  return;
}

const iframe = await iframeElementHandle.contentFrame();
if (!iframe) {
  console.error('Unable to access iframe content');
  await browser.close();
  return;
}
console.log("aaaaaaa");

// Wait for the canvas element inside the iframe
const canvas = await iframe.waitForSelector('canvas', { timeout: 5000 });
if (!canvas) {
  console.error('Canvas not found');
  await browser.close();
  return;
}






});

