import { useEffect, useCallback } from 'react';
import { applyTextareaFormat, wrapAsBold, wrapAsItalic, wrapAsLink } from '@/lib/textareaFormat';

interface UseEditorShortcutOptions {
  markdown: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onOpenFindReplace: () => void;
}

// SRP: Editor keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+F)
export function useEditorShortcuts({
  markdown,
  onChange,
  textareaRef,
  onOpenFindReplace,
}: UseEditorShortcutOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    if ((e.ctrlKey || e.metaKey) && key === 'f') {
      e.preventDefault();
      onOpenFindReplace();
      return;
    }

    if (e.key === 'Escape') {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea || document.activeElement !== textarea) return;

    // Same actions the formatting toolbar buttons use, applied via native
    // setRangeText so Ctrl+Z undoes the shortcut the same way it undoes a
    // toolbar click (see src/lib/textareaFormat.ts).
    if ((e.ctrlKey || e.metaKey) && key === 'b') {
      e.preventDefault();
      applyTextareaFormat(textarea, markdown, onChange, wrapAsBold);
    } else if ((e.ctrlKey || e.metaKey) && key === 'i') {
      e.preventDefault();
      applyTextareaFormat(textarea, markdown, onChange, wrapAsItalic);
    } else if ((e.ctrlKey || e.metaKey) && key === 'k') {
      e.preventDefault();
      applyTextareaFormat(textarea, markdown, onChange, wrapAsLink);
    }
  }, [markdown, onChange, textareaRef, onOpenFindReplace]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
