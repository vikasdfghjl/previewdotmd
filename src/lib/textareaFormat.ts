export interface FormatResult {
  replacement: string;
  newCursorStart?: number;
  newCursorEnd?: number;
}

export type FormatAction = (sel: { text: string; start: number; end: number }) => FormatResult;

/**
 * Applies a formatting action using native textarea mutations so the browser's
 * undo stack records the change (Ctrl+Z works correctly). Shared by the
 * formatting toolbar buttons and the Ctrl+B/I/K keyboard shortcuts so both
 * paths produce identical, undo-friendly edits instead of two divergent
 * implementations of "apply bold/italic/link".
 */
export function applyTextareaFormat(
  textarea: HTMLTextAreaElement,
  markdown: string,
  onChange: (value: string) => void,
  action: FormatAction,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = markdown.slice(start, end);

  const { replacement, newCursorStart, newCursorEnd } = action({
    text: selectedText,
    start,
    end,
  });

  // Use native setRangeText so the browser's undo history records the mutation.
  // Important: save the old value first so we can compute cursor position.
  const oldValue = textarea.value;

  textarea.focus();
  textarea.setRangeText(replacement, start, end, 'select');
  // Move cursor to the desired position
  const cursorStart = newCursorStart ?? start + replacement.length;
  const cursorEnd = newCursorEnd ?? start + replacement.length;
  textarea.setSelectionRange(cursorStart, cursorEnd);

  // If setRangeText actually changed the value, sync React state.
  // setRangeText dispatches a native 'input' event in most browsers,
  // but we also fire one explicitly for compatibility.
  if (textarea.value !== oldValue) {
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Shared action definitions — used by both FormattingToolbar's buttons and
// useEditorShortcuts' Ctrl+B/I/K so there's exactly one definition of what
// "bold/italic/link" means, and both paths go through applyTextareaFormat.
export const wrapAsBold: FormatAction = ({ text }) => ({ replacement: `**${text || 'bold text'}**` });
export const wrapAsItalic: FormatAction = ({ text }) => ({ replacement: `*${text || 'italic text'}*` });
export const wrapAsLink: FormatAction = ({ text }) => ({ replacement: `[${text || 'link text'}](url)` });
