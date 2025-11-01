/**
 * This file handles the application's secrets.
 * For security reasons and best practices, the API Key is sourced
 * directly from the 'API_KEY' environment variable.
 *
 * In your deployment environment (e.g., Vercel), you must set this
 * environment variable with your actual key.
 *
 * Do not hardcode the key in this file.
 */

export const API_KEY = process.env.API_KEY;
