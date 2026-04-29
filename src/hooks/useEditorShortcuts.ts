import { useEffect, useCallback } from 'react';

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
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      onOpenFindReplace();
      return;
    }

    if (e.key === 'Escape') {
      return;
    }

    if (textareaRef.current && document.activeElement === textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = markdown.slice(start, end);

      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const wrapped = `**${selectedText}**`;
        onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        const wrapped = `*${selectedText}*`;
        onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
        setTimeout(() => {
          textarea.setSelectionRange(start + 1, end + 1);
        }, 0);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const wrapped = `[${selectedText}](url)`;
        onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
        setTimeout(() => {
          if (selectedText) {
            textarea.setSelectionRange(start + wrapped.length - 1, start + wrapped.length - 4);
          } else {
            textarea.setSelectionRange(start + 1, end + 1);
          }
        }, 0);
      }
    }
  }, [markdown, onChange, textareaRef, onOpenFindReplace]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
