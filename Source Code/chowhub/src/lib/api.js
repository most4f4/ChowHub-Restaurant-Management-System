// src/lib/api.js

// Base URL for API requests, loaded from environment variable.
// NEXT_PUBLIC_API_URL should be defined in your .env.local file like:
// NEXT_PUBLIC_API_URL="http://localhost:8080/api/"
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

import { getDefaultStore } from 'jotai';
import { tokenAtom, userAtom } from '@/store/atoms';
import { toast } from 'react-toastify';

/**
 * A generic helper function for making API requests to the backend.
 *
 * @param {string} path - The API endpoint path (e.g., '/auth/register-manager').
 * @param {object} options - Fetch options (e.g., method, headers, body).
 * @returns {Promise<object>} - Returns the parsed JSON response if successful.
 * @throws {Error} - Throws an error if the response is not OK.
 */
export const apiFetch = async (path, options = {}) => {
  /* Inject JWT token if the user is logged in */
   const store = getDefaultStore();
  const token = store.get(tokenAtom);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers }); // Make the request to the backend

  let result; 
  try {
    result = await res.json();   // Parse the JSON response
  } catch {
    result = { error: 'Unexpected server error' };
  }                                      

 //  Avoid duplicate toast on 401
  if (res.status === 401) {
    toast.error('Session expired, please log in again.');
    store.set(tokenAtom, null);
    store.set(userAtom, null);
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    throw new Error(result.error || 'API Error');
  }

  // Return the parsed response if everything went fine
  return result;
};
