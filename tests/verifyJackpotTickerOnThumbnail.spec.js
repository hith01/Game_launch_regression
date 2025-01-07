const { test, expect } = require('@playwright/test');
const { Console } = require('console');

test('Login and fetch jackpot values', async ({ page }) => {
  let apiJackpotMap = new Map();
  let gameIdMap = new Map();



  // Function to login into the page 
  async function login()
  {

  await page.goto('https://www.qa.betsson.com/en');
  await page.waitForSelector("//span[@class='mat-button-wrapper'][contains(text(),'Log in')]");
  await page.click("//span[@class='mat-button-wrapper'][contains(text(),'Log in')]");
  const usernameField = page.locator('[data-test-id="login-username"]');
  await usernameField.waitFor();
  await usernameField.fill('');
  await page.evaluate(() => {
    const element = document.querySelector('[data-test-id="login-username"]');
    element.value = 'testbetssoneur01@betssongroup.com';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(usernameField).toHaveValue("testbetssoneur01@betssongroup.com");
  //console.log('Username filled :', await usernameField.inputValue());
  await page.waitForTimeout(2000);
  const passwordField = page.locator('[data-test-id="login-password"]');
  await passwordField.waitFor();
  await passwordField.fill('');
  await page.evaluate(() => {
    const element = document.querySelector('[data-test-id="login-password"]');
    element.value = 'Qwer1234';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(passwordField).toHaveValue("Qwer1234");
  //console.log('Password filled :', await passwordField.inputValue());
  await page.waitForTimeout(2000);
  await page.click('button[test-id="login-submit"]');
  await page.waitForLoadState('networkidle');
  console.log("Succesfully logged in");
}


  //Function to navigate to AllGames 
  async function navigateToAllGames() 
  {
  
  const currentURL1 = page.url();
  console.log('Current Page URL:', currentURL1);
  await page.waitForTimeout(2000);
  const casinoLink = page.locator('[data-test-id="menu.product.casino"]');
  await casinoLink.click();
  await page.waitForTimeout(2000);
  await page.waitForURL('**/casino');
  console.log('Navigated to:', page.url());
  const AllGamesLink = page.locator("//a[@data-test-id='menu.primary.casino.categories.all-games']");
  await AllGamesLink.click();
  await page.waitForTimeout(2000);
  console.log("Successfully navigated to All games page ");

}



// Function to Fetch Jackpot Data from Backend API and store it in a map
  async function fetchApiJackpotData()
  {
    const apiUrl = 'https://www.qa.betsson.com/api/v1/jackpots';
    const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    'X-Obg-Channel': 'Web',
    'X-Obg-Country-Code': 'MT',
    'brandid': 'e123be9a-fe1e-49d0-9200-6afcf20649af',
    'marketcode': 'en',
  };

  let jackpotData = [];

  try 
  {
    const response = await page.request.get(apiUrl, { headers: headers });
    jackpotData = await response.json();
   // console.log("API Response:", jackpotData);
  } 
  catch (error) 
  {
    console.error('Error fetching jackpot data:', error);
    return null;
  }
  
 
  // Iterate over the API response and extract gameId and jackpotValue
  jackpotData.forEach(
    game => 
      {
    const gameId = game.gameId;  // Extract gameId
    const jackpotValue = game.jackpotValue.value;  // Extract jackpot value (nested inside jackpotValue object)
    
    // Store gameId and jackpotValue in the map
    apiJackpotMap.set(gameId, jackpotValue);
    
    
  });
}

// Function to fetch jackpot data from UI and store it in a Map 
async function fetchUIJackpotData()     
{

  let allGames = []; // Initialize an empty array to store game details
  

  const gameThumbnailSelector = 'article.obg-m-game-thumbnail-wrapper';
  await page.waitForSelector(gameThumbnailSelector, { timeout: 10000 }); 

  let showMoreButtonVisible = true;
  let gameId;
 await page.waitForSelector(gameThumbnailSelector, { timeout: 10000 }); 
  const currentGameCount = await page.locator(gameThumbnailSelector).count();

  while (showMoreButtonVisible) 
    {
  const gameThumbnails = await page.locator(gameThumbnailSelector).all();

  // // Limit to the first 20 thumbnails
  // const maxThumbnails = 20;
  // const gamesToProcess = gameThumbnails.slice(0, maxThumbnails);
  
  for (let i = 0; i < gameThumbnails.length; i++) {
    const gameThumbnail = gameThumbnails[i];
    const gameName = await gameThumbnail.locator('.title').textContent();
    const gameSrc = await gameThumbnail.locator('img').getAttribute('src');

    if (gameSrc) 
      {
      const startIndex = gameSrc.indexOf("game.") + "game.".length;
      const endIndex = gameSrc.indexOf(".", startIndex);
      gameId = gameSrc.slice(startIndex, endIndex);
    } 
    else 
    {
      console.log(`No src attribute found for game thumbnail ${i + 1}`);
      continue;
    }
    try 
    {
    // Access shadow root of the 'gaming-game_thumbnail' element
    const shadowRootHandle = await gameThumbnail.locator('gaming-game_thumbnail').evaluateHandle(node => node.shadowRoot);
    if (!shadowRootHandle) {
      console.log(`Shadow root not found for game ${i + 1}`);
      continue;
    }

    // Wait for the jackpot element to appear inside the shadow root
    const jackpotElement = await shadowRootHandle.$('.jackpot');
    if (!jackpotElement) {
      console.log(`No jackpot ticker found for game ${i + 1}: ${gameName}`);
      continue; // Skip if jackpot element is missing
    }

    // Extract jackpot amount text content
    const jpValueonUI = await jackpotElement.evaluate(el => el.textContent.trim());
    console.log(`Jackpot Ticker displayed on game ${i + 1}: ${gameName} : ${jpValueonUI}`);
    
    // Only map the games that have a jackpot value
    if (jpValueonUI) {
      gameIdMap.set(gameId, jpValueonUI);
    }

  }
  
  catch (error) 
  {
    console.error(`Error accessing jackpot element for game ${i + 1}:`, error);
    continue; 
  }
}

 const showMoreButton = page.locator('button:has-text("Show More Games")');
 const isShowMoreButtonVisible = await showMoreButton.isVisible();
 const isShowMoreButtonEnabled = await showMoreButton.isEnabled();
 
 if (isShowMoreButtonVisible && isShowMoreButtonEnabled) 
  {
   console.log('Clicked "Show More Games" button...');
   await showMoreButton.scrollIntoViewIfNeeded();  // Scroll button into view if needed
   await showMoreButton.click();  // Click the "Show More" button to load more games
   await page.waitForSelector(gameThumbnailSelector, { timeout: 10000 }); // Wait for the new games to load
 } 
 else 
 {
   console.log('No more games to load or the button is not clickable.');
   showMoreButtonVisible = false;  // Exit the loop if the button is not visible or clickable
 }
}
console.log("Jackpot value mapped with game ID", gameIdMap);
}


//Function to compare API jackpot data with UI jackpot data
async function compareApiAndUIData(gameIdMap, apiJackpotMap)
{

  const TOLERANCE = 0.1;
console.log('Size of gameIdMap:', gameIdMap.size);

// Loop through the UI game data map
  gameIdMap.forEach((jpValueonUI, gameId) => {
  const apiJackpotValue = apiJackpotMap.get(gameId);

  console.log("Inside compare function ---------");
  console.log(apiJackpotValue);

  if (apiJackpotValue) {
    console.log(`Comparing Jackpot for game ID: ${gameId}`);
    console.log(`UI Jackpot Value: ${jpValueonUI}, API Jackpot Value: ${apiJackpotValue}`)


const roundedUIValue = parseFloat(jpValueonUI.replace(/[^\d.-]/g, ''));

// Normalize API jackpot value (just in case it's a string)
const roundedAPIValue = parseFloat(apiJackpotValue.toString());

// Compare the values with a small tolerance
const difference = Math.abs(roundedUIValue - roundedAPIValue);

if (difference <= TOLERANCE) {
  console.log(`Jackpot values match within tolerance: UI: ${roundedUIValue}, API: ${roundedAPIValue}`);
} else {
  console.log(`Jackpot mismatch (outside tolerance): UI: ${roundedUIValue}, API: ${roundedAPIValue}`);
}
}
});

// Optional: Return the final maps or use them as needed
return { uiMap: gameIdMap, apiMap: apiJackpotMap };
  }

//Main function calls 

await login(page);
await navigateToAllGames(page);
await fetchApiJackpotData(page);
await fetchUIJackpotData(page);
await compareApiAndUIData(gameIdMap, apiJackpotMap);
});
