import { useState, useCallback, useEffect, useRef } from 'react';
import { DEFAULT_MARKDOWN } from '@/constants/defaultMarkdown';
import { getStorageItem, setStorageItem } from '@/lib/safeStorage';

const STORAGE_KEY = 'previewdotmd-content';
const AUTOSAVE_DELAY_MS = 1000; // 1 second debounce
const PREVIEW_DEBOUNCE_DELAY_MS = 150; // ms - throttle preview re-renders

export function useMarkdownState(initialValue?: string) {
  // Initialize deterministically (same on server and first client render) —
  // reading localStorage here would make hydration diverge from the SSR
  // output. The saved value is applied after mount instead, see below.
  const [markdown, setMarkdown] = useState<string>(() => initialValue ?? DEFAULT_MARKDOWN);
  const [previewMarkdown, setPreviewMarkdown] = useState<string>(markdown);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  // Load any saved content once, after hydration completes.
  useEffect(() => {
    const saved = getStorageItem(STORAGE_KEY);
    if (saved !== null && saved !== markdown) {
      setMarkdown(saved);
      setPreviewMarkdown(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const ok = setStorageItem(STORAGE_KEY, markdown);
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
