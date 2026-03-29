/**
 * User DB Service
 * Syncs user data with DynamoDB backend.
 * localStorage is used as a fast local cache.
 */
import { API_BASE_URL } from '../config.js';

const BASE = `${API_BASE_URL}/api/users`;

/** Save/update user in DynamoDB (fire and forget — never blocks UI) */
export const syncUserToDb = async (user) => {
  if (!user?.email) return;
  try {
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (err) {
    console.warn('User sync to DB failed (non-fatal):', err.message);
  }
};

/** Fetch user from DynamoDB by email */
export const fetchUserFromDb = async (email) => {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
};

/** Update specific fields on a user in DynamoDB */
export const updateUserInDb = async (email, updates) => {
  if (!email) return;
  try {
    await fetch(`${BASE}/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn('User update to DB failed (non-fatal):', err.message);
  }
};

/** Delete user from DynamoDB */
export const deleteUserFromDb = async (email) => {
  try {
    await fetch(`${BASE}/${encodeURIComponent(email)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
};
