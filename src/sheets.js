// src/sheets.js
import { google } from "googleapis"

import credentials from "../credentials/hookscraper.json" assert { type: "json" }
import { GOOGLE_SHEET_ID } from "./config.js"

// Set up the JWT client
export const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"],
)

const spreadsheetId = GOOGLE_SHEET_ID

export async function writeRowToSheet(row, sheetName) {
  console.log("---> Writing row data to google sheets")
  try {
    await client.authorize()
    const sheetsApi = google.sheets({ version: "v4", auth: client })

    // Prepare the data for writing to the sheet
    const values = Object.values(row)

    // Specify the range where you want to insert the new row (e.g., 'Sheet1!A:A')
    const range = `${sheetName}!A:A`

    // Create the resource object with the data to be inserted
    const resource = {
      values: [values], // Wrap values in an array to represent single row
    }

    // Insert the new row into the sheet
    await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource,
    })

    console.log("Data successfully inserted into Google Sheets.")
  } catch (error) {
    console.error("Error inserting data into Google Sheets:", error)
  }
}

export async function checkSheetExists(sheetsApi, sheetName) {
  try {
    const response = await sheetsApi.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties(title))",
    })

    const sheets = response.data.sheets
    const existingSheet = sheets.find(
      (sheet) => sheet.properties.title === sheetName,
    )

    return existingSheet ? true : false
  } catch (error) {
    console.error("Error checking if sheet exists:", error)
    return false
  }
}

export async function createSheet(sheetsApi, sheetName) {
  try {
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    })
    console.log(`Sheet "${sheetName}" created successfully.`)
  } catch (error) {
    console.error("Error creating sheet:", error)
  }
}

export async function writeToSheet(data) {
  console.log("---> Writing data to google sheets")
  try {
    await client.authorize()
    const sheetsApi = google.sheets({ version: "v4", auth: client })

    // Determine the last row with data in sheet
    const getLastRowResponse = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:A",
    })

    const lastRow = getLastRowResponse.data.values
      ? getLastRowResponse.data.values.length + 1
      : 1
    const range = `Sheet1!A${lastRow}`

    // Prepare the data for writing to the sheet
    const values = data.map((item) => Object.values(item))
    const resource = {
      values: [
        [
          "searchUrl",
          "storeUrl",
          "extensionUrl",
          "extensionRating",
          "numRatings",
          "numberOfUsers",
          "error",
        ],
        ...values,
      ],
    }

    // Write the data to the sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource,
    })

    console.log("Data successfully written to Google Sheets.")
  } catch (error) {
    console.error("Error writing data to Google Sheets:", error)
  }
}
