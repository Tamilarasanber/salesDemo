// Storage utility functions

const STORAGE_PREFIX = "newage_bi_";

/**
 * Get item from localStorage with prefix
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set item in localStorage with prefix
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
};

/**
 * Clear all prefixed items from localStorage
 */
export const clearStorage = (): void => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};

/**
 * Get item from sessionStorage
 */
export const getSessionItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set item in sessionStorage
 */
export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to sessionStorage:", error);
  }
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  THEME: "theme",
  AUTH_TOKEN: "auth_token",
  SAVED_FILTERS: "saved_filters",
  USER_PREFERENCES: "user_preferences",
  LAST_VIEWED_DASHBOARD: "last_viewed_dashboard",
} as const;
