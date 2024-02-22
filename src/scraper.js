// src/scraper.js
import puppeteer from 'puppeteer';
import { writeRowToSheet } from './sheets.js';

async function cycleLoadMore(page) {
  let totalElements = 0;
  do {
      console.log('TOTAL ELEMENTS: ', totalElements)
      const loadMoreButton = await page.$('#yDmH0d > c-wiz > div > div > div > div > main > div > div.acFDHd > div > div.mMhoGc > div > button');
      if (loadMoreButton) {
          await loadMoreButton.click();
          await page.waitForTimeout(2000); // Adjust the delay as needed
          totalElements = await page.$$eval('.UvhDdd', elements => elements.length);
      } else {
          console.log("Load More button not found or already exhausted.");
          break;
      }
  } while (totalElements <= 1000);
  console.log("Total elements loaded:", totalElements);
}

async function cycleClickEmail(page) {
  // Find and click on the dropdown to reveal the email
  const dropdownButton = await page.$('#yDmH0d > c-wiz > div > div > main > div > section:nth-child(5) > div:nth-child(2) > div > ul > li.Qt4bne.Lj9Zzc > div:nth-child(2) > div > details > summary');
  if (dropdownButton) {
      await dropdownButton.click();
      // Wait for the email to appear after clicking the dropdown
      await page.waitForSelector('#yDmH0d > c-wiz > div > div > main > div > section:nth-child(5) > div:nth-child(2) > div > ul > li.Qt4bne.Lj9Zzc > div:nth-child(2) > div > details > div', { timeout: 1000 }); // Adjust timeout as needed
      // Extract the email text
      const emailElement = await page.$('#yDmH0d > c-wiz > div > div > main > div > section:nth-child(5) > div:nth-child(2) > div > ul > li.Qt4bne.Lj9Zzc > div:nth-child(2) > div > details > div');
      if (emailElement) {
          const email = await page.evaluate(element => element.textContent, emailElement);
          console.log('Email:', email);
          return email;
      } else {
          console.log('Email not found.');
          return null;
      }
  } else {
      console.log('Dropdown button not found.');
      return null;
  }
}


export async function scraper(url, topic, sheetName) {
  console.log("RUNNING SCRAPER...")
  console.log(`URL: ${url}`)

  // Launch the browser
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);


  // Turn on the clicking of the load more button (caps at 1000)
  await cycleLoadMore(page)

  // Wait for the elements to be loaded
  await page.waitForSelector('.UvhDdd', { timeout: 1000 });

  // Extract information from all elements with specified class
  const elementsData = await page.$$eval('.UvhDdd', elements => {
    return elements.map(element => {
        return {
            href: element.href
        };
    });
  });

  const totalElements = elementsData.length;

  for (let i = 0; i < totalElements; i++) {
    const el = elementsData[i];
    console.log(`---> Processing ${i + 1} of ${totalElements} elements`);
    try {

      await page.goto(el.href);

      // Wait for extension name
      const extensionName = await page.waitForSelector('h1.Pa2dE', { timeout: 1000 })
        .then(() => page.$eval('h1.Pa2dE', el => el.textContent))
        .catch(() => '');

      // Wait for extension URL
      const extensionUrlHref = await page.waitForSelector('a.cJI8ee', { timeout: 1000 })
        .then(() => page.$eval('a.cJI8ee', el => el.href))
        .catch(() => '');

      // Wait for extension rating
      const extensionRating = await page.waitForSelector('span.Vq0ZA', { timeout: 1000 })
        .then(() => page.$eval('span.Vq0ZA', el => el.textContent))
        .catch(() => '');

      // Wait for number of ratings
      const numRatings = await page.waitForSelector('p.xJEoWe', { timeout: 1000 })
        .then(() => page.$eval('p.xJEoWe', el => el.textContent))
        .catch(() => '');

      const lastUpdated = await page.waitForSelector('li.Qt4bne.kBFnc > div:nth-child(2)', { timeout: 1000 })
        .then(() => page.$eval('li.Qt4bne.kBFnc > div:nth-child(2)', el => el.textContent))
        .catch(() => '');
      
      // const offeredBy = await page.waitForSelector('li.Qt4bne.rlxkgb > div:nth-child(2)', { timeout: 1000 })
      //   .then(() => page.$eval('li.Qt4bne.rlxkgb > div:nth-child(2)', el => el.textContent))
      //   .catch(() => '');

      // const developerEmail = await page.waitForSelector('div.yDmH0d', { timeout: 1000 })
      //   .then(() => page.$eval('div.yDmH0d', el => el.textContent))
      //   .catch(() => '')

      const developerEmail = await cycleClickEmail(page)


      // Wait for div content
      const divContent = await page.waitForSelector('div.F9iKBc', { timeout: 1000 })
        .then(() => page.$eval('div.F9iKBc', el => el.textContent))
        .catch(() => '');

      // Use a regular expression to extract the number of users
      let numberOfUsers = 0
      const usersMatch = divContent.match(/([\d,]+) users/);
      if (usersMatch && usersMatch.length > 1) {
          numberOfUsers = usersMatch[1];
      } else {
          console.log('Number of users not found');
      }
  

      // const { extensionUrlHref, extensionRating, numRatings, numberOfUsers } = simulateBrowser({ page: page, element: el })
      await writeRowToSheet({
        topic: topic,
        searchUrl: url,
        storeUrl: el.href,
        extensionName: extensionName,
        extensionUrl: extensionUrlHref,
        extensionRating: extensionRating,
        numRatings: numRatings,
        numberOfUsers: numberOfUsers,
        developerEmail: developerEmail,
        lastUpdated: lastUpdated,
        error: ''
      }, sheetName)
    } catch (error) {
      console.error('Error loading extension URL:', error.message);
      await writeRowToSheet({
        topic: topic,
        searchUrl: url,
        extensionName: '',
        storeUrl: el.href,
        extensionUrl: '',
        extensionRating: '',
        numRatings: '',
        numberOfUsers: '',
        developerEmail: '',
        lastUpdated: '',
        error: error.message
      }, sheetName)
    }
  }

  // Close browser.
  await browser.close();
}