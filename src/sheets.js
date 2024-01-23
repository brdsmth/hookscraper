import { google } from 'googleapis'
import credentials from '../credentials/hookscraper.json' assert { type: 'json' };

// Set up the JWT client
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const spreadsheetId = '1oufbJ_z-3eXgcZQ8ypmYuQfNmqlDcJQMjIVXhp8-ebw';

export async function writeRowToSheet(row) {
  console.log('---> Writing row data to google sheets')
  try {
    await client.authorize();
    const sheetsApi = google.sheets({ version: 'v4', auth: client });

    // Prepare the data for writing to the sheet
    const values = Object.values(row)

    // Specify the range where you want to insert the new row (e.g., 'Sheet1')
    const range = 'Sheet1';

    // Create the resource object with the data to be inserted
    const resource = {
      values: [values], // Wrap values in an array, as it represents a single row
    };

    // Insert the new row into the sheet
    await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS', // This option inserts a new row
      resource,
    });

    console.log('Data successfully inserted into Google Sheets.');
  } catch (error) {
    console.error('Error inserting data into Google Sheets:', error);
  }
}

export async function writeToSheet(data) {
  console.log('---> Writing data to google sheets')
  try {
    await client.authorize();
    const sheetsApi = google.sheets({ version: 'v4', auth: client });

    // Determine the last row with data in 'Sheet1'
    const getLastRowResponse = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:A', // Assuming column A always has data
    });

    const lastRow = getLastRowResponse.data.values ? getLastRowResponse.data.values.length + 1 : 1;
    const range = `Sheet1!A${lastRow}`;

    // Prepare the data for writing to the sheet
    const values = data.map((item) => Object.values(item));
    const resource = {
      values: [['searchUrl', 'storeUrl', 'extensionUrl', 'extensionRating', 'numRatings', 'numberOfUsers', 'error'], ...values],
    };

    // Write the data to the sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource,
    });

    console.log('Data successfully written to Google Sheets.');
  } catch (error) {
    console.error('Error writing data to Google Sheets:', error);
  }
}
