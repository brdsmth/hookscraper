// src/index.js
import { google } from "googleapis"
import { scraper } from "./scraper.js"
import { checkSheetExists, client, createSheet } from "./sheets.js"
import { v4 as uuidv4 } from "uuid"

(async () => {
  const urls = [
    "https://chromewebstore.google.com/category/extensions/productivity/tools",
    "https://chromewebstore.google.com/category/extensions/productivity/education",
    "https://chromewebstore.google.com/category/extensions/productivity/developer", // might have more than 1500
    "https://chromewebstore.google.com/category/extensions/productivity/communication",
    "https://chromewebstore.google.com/category/extensions/productivity/workflow",
    "https://chromewebstore.google.com/category/extensions/lifestyle/art",
    "https://chromewebstore.google.com/category/extensions/lifestyle/entertainment",
    "https://chromewebstore.google.com/category/extensions/lifestyle/games",
    "https://chromewebstore.google.com/category/extensions/lifestyle/household",
    "https://chromewebstore.google.com/category/extensions/lifestyle/fun",
    "https://chromewebstore.google.com/category/extensions/lifestyle/news",
    "https://chromewebstore.google.com/category/extensions/lifestyle/shopping",
    "https://chromewebstore.google.com/category/extensions/lifestyle/social",
    "https://chromewebstore.google.com/category/extensions/lifestyle/travel",
    "https://chromewebstore.google.com/category/extensions/lifestyle/well_being",
    "https://chromewebstore.google.com/category/extensions/make_chrome_yours/accessibility",
    "https://chromewebstore.google.com/category/extensions/make_chrome_yours/functionality",
    "https://chromewebstore.google.com/category/extensions/make_chrome_yours/privacy",
  ]

  for (const url of urls) {
    console.log(`Running scraper for ${url}`)

    // Split the URL string by '/'
    const urlComponents = url.split("/")

    // Extract the last component (which is the last word in the URL)
    const topic = urlComponents[urlComponents.length - 1]

    const sheetsApi = google.sheets({ version: "v4", auth: client })

    // Generate a random ID for the new sheet
    const sheetId = uuidv4().slice(0, 6)
    const sheetName = `${topic}_${sheetId}`

    // Check if the sheet already exists
    const sheetExists = await checkSheetExists(sheetsApi, sheetName)

    // If the sheet doesn't exist, create it
    if (!sheetExists) {
      await createSheet(sheetsApi, sheetName)
    }

    await scraper(url, topic, sheetName)
  }
})()
