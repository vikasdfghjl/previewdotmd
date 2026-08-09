/**
 * safeStorage — localStorage access that never throws and never blows up
 * during SSR (no `window`). Centralizes the try/catch-and-fall-back pattern
 * that was previously duplicated across LayoutContext, OnboardingHintContext,
 * ThemeContext, useMarkdownState, StorageNotice, and useInstallPrompt.
 */

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // Storage full or unavailable — caller decides whether to warn.
    return false;
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
