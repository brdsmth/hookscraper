// src/scraper.js
import puppeteer from 'puppeteer';
import { writeRowToSheet } from './sheets.js';

export async function scraper(url) {
  console.log("RUNNING SCRAPER...")
  console.log(`URL: ${url}`)

  // Launch the browser
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the elements to be loaded
  await page.waitForSelector('.UvhDdd');

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
      await page.waitForSelector('a.cJI8ee', { timeout: 2000 });
      const extensionUrlHref = await page.$eval('a.cJI8ee', el => el.href);


      await page.waitForSelector('span.Vq0ZA');
      const extensionRating = await page.$eval('span.Vq0ZA', el => el.textContent);

      await page.waitForSelector('p.xJEoWe');
      const numRatings = await page.$eval('p.xJEoWe', el => el.textContent);


      await page.waitForSelector('div.F9iKBc');
      const divContent = await page.$eval('div.F9iKBc', el => el.textContent);
    
      // Use a regular expression to extract the number of users
      let numberOfUsers = 0
      const usersMatch = divContent.match(/([\d,]+) users/);
      if (usersMatch && usersMatch.length > 1) {
          numberOfUsers = usersMatch[1];
      } else {
          console.log('Number of users not found');
      }
  

      await writeRowToSheet({
        searchUrl: url,
        storeUrl: el.href,
        extensionUrl: extensionUrlHref,
        extensionRating: extensionRating,
        numRatings: numRatings,
        numberOfUsers: numberOfUsers,
        error: ''
      })
    } catch (error) {
      console.error('Error loading extension URL:', error.message);
      await writeRowToSheet({
        searchUrl: url,
        storeUrl: el.href,
        extensionUrl: '',
        extensionRating: '',
        numRatings: '',
        numberOfUsers: '',
        error: error.message
      })
    }
  }

  // Close browser.
  await browser.close();
}