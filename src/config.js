// src/config.js
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

export const { GOOGLE_SHEET_ID } = process.env;