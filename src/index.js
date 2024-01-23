// src/index.js

import { scraper } from "./scraper.js";


// https://chromewebstore.google.com/category/extensions/productivity/tools
// https://chromewebstore.google.com/category/extensions/productivity/education


const urls = [
  'https://chromewebstore.google.com/category/extensions/productivity/tools',
  'https://chromewebstore.google.com/category/extensions/productivity/education',
  'https://chromewebstore.google.com/category/extensions/productivity/developer',
  'https://chromewebstore.google.com/category/extensions/productivity/communication',
  'https://chromewebstore.google.com/category/extensions/productivity/workflow'
]

for (let i = 0; i < urls.length; i++) {
  console.log(`Running scraper for ${urls[i]}`)
  scraper(urls[i])
}