import { useCallback } from 'react';

interface SmartTypingConfig {
  autoCloseBrackets: boolean;
  autoCloseQuotes: boolean;
  autoCloseMarkdown: boolean;
}

interface UseSmartTypingReturn {
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
}

// Pairs that should be auto-closed
const BRACKET_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
};

const QUOTE_PAIRS: Record<string, string> = {
  '"': '"',
  "'": "'",
  '`': '`',
};

const MARKDOWN_PAIRS: Record<string, string> = {
  '*': '*',
  '_': '_',
  '~': '~',
};

/**
 * useSmartTyping - Hook for smart typing features
 * Auto-closes brackets, quotes, and markdown pairs
 */
export function useSmartTyping(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  config: SmartTypingConfig = {
    autoCloseBrackets: true,
    autoCloseQuotes: true,
    autoCloseMarkdown: true,
  }
): UseSmartTypingReturn {
  const insertText = useCallback((text: string, startOffset: number = 0, endOffset: number = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Insert the text
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    // Update textarea value
    textarea.value = newValue;
    
    // Set cursor position
    const newCursorPos = start + text.length - startOffset - endOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger input event for React state update
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }, [textareaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return false;

    const key = e.key;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const hasSelection = start !== end;

    // Handle auto-closing brackets
    if (config.autoCloseBrackets && key in BRACKET_PAIRS) {
      e.preventDefault();
      const closeChar = BRACKET_PAIRS[key];
      
      if (hasSelection) {
        // Wrap selection with brackets
        const selectedText = value.substring(start, end);
        const newText = key + selectedText + closeChar;
        insertText(newText, 0, 0);
        // Select the text inside brackets
        textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
      } else {
        // Insert pair and place cursor in middle
        insertText(key + closeChar, 1, 0);
      }
      return true;
    }

    // Handle auto-closing quotes
    if (config.autoCloseQuotes && key in QUOTE_PAIRS) {
      e.preventDefault();
      const closeChar = QUOTE_PAIRS[key];
      
      if (hasSelection) {
        // Wrap selection with quotes
        const selectedText = value.substring(start, end);
        const newText = key + selectedText + closeChar;
        insertText(newText, 0, 0);
        textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
      } else {
        // Insert pair and place cursor in middle
        insertText(key + closeChar, 1, 0);
      }
      return true;
    }

    // Handle auto-closing markdown pairs
    if (config.autoCloseMarkdown && key in MARKDOWN_PAIRS) {
      e.preventDefault();
      const closeChar = MARKDOWN_PAIRS[key];
      
      if (hasSelection) {
        // Wrap selection with markdown chars
        const selectedText = value.substring(start, end);
        const newText = key + selectedText + closeChar;
        insertText(newText, 0, 0);
        textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
      } else {
        // Insert pair and place cursor in middle
        insertText(key + closeChar, 1, 0);
      }
      return true;
    }

    // Handle Tab key for indentation
    if (key === 'Tab') {
      e.preventDefault();
      
      if (hasSelection) {
        // Indent multiple lines
        const selectedText = value.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedLines = lines.map(line => '  ' + line);
        const newText = indentedLines.join('\n');
        insertText(newText, 0, 0);
        // Restore selection with indentation offset
        textarea.setSelectionRange(start, start + newText.length);
      } else {
        // Insert 2 spaces
        insertText('  ', 0, 0);
      }
      return true;
    }

    // Handle Enter key for auto-continuing lists
    if (key === 'Enter') {
      const currentLine = value.substring(0, start).split('\n').pop() || '';
      
      // Check for unordered list continuation
      const unorderedMatch = currentLine.match(/^(\s*)([-*+])\s+/);
      if (unorderedMatch) {
        const [, indent, marker] = unorderedMatch;
        const restOfLine = currentLine.slice(unorderedMatch[0].length);
        
        // If line is empty after marker, remove the marker
        if (restOfLine.trim() === '') {
          e.preventDefault();
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const newValue = value.substring(0, lineStart) + value.substring(end);
          textarea.value = newValue;
          textarea.setSelectionRange(lineStart, lineStart);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        
        // Continue the list
        e.preventDefault();
        insertText('\n' + indent + marker + ' ', 0, 0);
        return true;
      }
      
      // Check for ordered list continuation
      const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);
      if (orderedMatch) {
        const [, indent, num] = orderedMatch;
        const restOfLine = currentLine.slice(orderedMatch[0].length);
        
        // If line is empty after number, remove the number
        if (restOfLine.trim() === '') {
          e.preventDefault();
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const newValue = value.substring(0, lineStart) + value.substring(end);
          textarea.value = newValue;
          textarea.setSelectionRange(lineStart, lineStart);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        
        // Continue the list with incremented number
        e.preventDefault();
        const nextNum = parseInt(num, 10) + 1;
        insertText('\n' + indent + nextNum + '. ', 0, 0);
        return true;
      }
    }

    return false;
  }, [config, insertText, textareaRef]);

  return { handleKeyDown };
}

export default useSmartTyping;
