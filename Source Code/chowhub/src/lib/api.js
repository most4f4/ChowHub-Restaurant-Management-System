// src/lib/api.js

// Base URL for API requests, loaded from environment variable.
// NEXT_PUBLIC_API_URL should be defined in your .env.local file like:
// NEXT_PUBLIC_API_URL="http://localhost:8080/api/"
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * A generic helper function for making API requests to the backend.
 *
 * @param {string} path - The API endpoint path (e.g., '/auth/register-manager').
 * @param {object} options - Fetch options (e.g., method, headers, body).
 * @returns {Promise<object>} - Returns the parsed JSON response if successful.
 * @throws {Error} - Throws an error if the response is not OK.
 */
export const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options); // Make the request to the backend
  const result = await res.json(); // Parse the JSON response

  // If the response status is not OK (e.g., 400 or 500), throw an error
  if (!res.ok) {
    throw new Error(result.error || "API Error");
  }

  // Return the parsed response if everything went fine
  return result;
};
