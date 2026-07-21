import { useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_MARKDOWN } from '@/constants/defaultMarkdown';

const STORAGE_KEY = 'previewdotmd-content';
const AUTOSAVE_DELAY_MS = 1000; // 1 second debounce
const PREVIEW_DEBOUNCE_DELAY_MS = 150; // ms - throttle preview re-renders

function loadFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveToStorage(content: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    localStorage.setItem(STORAGE_KEY, content);
    return true;
  } catch {
    // Storage full or unavailable — return false so the UI can warn the user
    return false;
  }
}

export function useMarkdownState(initialValue?: string) {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = loadFromStorage();
    return saved ?? initialValue ?? DEFAULT_MARKDOWN;
  });
  const [previewMarkdown, setPreviewMarkdown] = useState<string>(markdown);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  // Debounce preview rendering to reduce re-renders on fast typing
  useEffect(() => {
    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }
    previewDebounceRef.current = setTimeout(() => {
      setPreviewMarkdown(markdown);
    }, PREVIEW_DEBOUNCE_DELAY_MS);

    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
    };
  }, [markdown]);

  // Auto-save effect with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      const ok = saveToStorage(markdown);
      if (!ok) {
        setStorageWarning(true);
      } else {
        setStorageWarning(false);
      }
      setLastSaved(new Date());
      setIsDirty(false);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown]);

  const handleChange = useCallback((value: string) => {
    setMarkdown(value);
    setIsDirty(true);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown('');
    setIsDirty(true);
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown(DEFAULT_MARKDOWN);
    setIsDirty(true);
  }, []);

  return {
    markdown,
    previewMarkdown,
    handleChange,
    handleClear,
    handleReset,
    lastSaved,
    isDirty,
    storageWarning,
  };
}
