import { useState, useCallback, useEffect, useRef } from 'react';

interface Suggestion {
  label: string;
  insertText: string;
  description?: string;
}

// Markdown syntax suggestions
const MARKDOWN_SUGGESTIONS: Suggestion[] = [
  { label: 'Heading 1', insertText: '# ', description: 'Large heading' },
  { label: 'Heading 2', insertText: '## ', description: 'Medium heading' },
  { label: 'Heading 3', insertText: '### ', description: 'Small heading' },
  { label: 'Bold', insertText: '**text**', description: 'Bold text' },
  { label: 'Italic', insertText: '*text*', description: 'Italic text' },
  { label: 'Bold Italic', insertText: '***text***', description: 'Bold and italic' },
  { label: 'Strikethrough', insertText: '~~text~~', description: 'Strikethrough text' },
  { label: 'Inline Code', insertText: '`code`', description: 'Inline code' },
  { label: 'Code Block', insertText: '```\n\n```', description: 'Code block' },
  { label: 'Link', insertText: '[text](url)', description: 'Hyperlink' },
  { label: 'Image', insertText: '![alt](url)', description: 'Image' },
  { label: 'Quote', insertText: '> ', description: 'Blockquote' },
  { label: 'Unordered List', insertText: '- ', description: 'Bullet list' },
  { label: 'Ordered List', insertText: '1. ', description: 'Numbered list' },
  { label: 'Task List', insertText: '- [ ] ', description: 'Checkbox item' },
  { label: 'Horizontal Rule', insertText: '---\n', description: 'Divider line' },
  { label: 'Table', insertText: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |', description: 'Markdown table' },
];

/**
 * useAutoComplete - Hook for markdown syntax auto-completion
 * Shows suggestions based on typed characters
 */
export function useAutoComplete(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  markdown: string
) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [triggerPos, setTriggerPos] = useState(0);
  const lastInputRef = useRef('');

  const getCurrentWord = useCallback((): { word: string; start: number } => {
    const textarea = textareaRef.current;
    if (!textarea) return { word: '', start: 0 };

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = markdown.substring(0, cursorPos);
    
    // Find the start of the current word
    const match = textBeforeCursor.match(/([\w\-\[\*\`\!\>\|]*)$/);
    const word = match ? match[1] : '';
    const start = cursorPos - word.length;
    
    return { word, start };
  }, [markdown, textareaRef]);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { word } = getCurrentWord();
    
    // Check for trigger characters or words
    if (word.length >= 1) {
      const filtered = MARKDOWN_SUGGESTIONS.filter(s => 
        s.label.toLowerCase().includes(word.toLowerCase()) ||
        s.insertText.toLowerCase().startsWith(word.toLowerCase())
      );
      
      if (filtered.length > 0 && word !== lastInputRef.current) {
        setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
        setIsVisible(true);
        setSelectedIndex(0);
        setTriggerPos(textarea.selectionStart - word.length);
      } else if (filtered.length === 0) {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
    
    lastInputRef.current = word;
  }, [getCurrentWord, textareaRef]);

  const insertSuggestion = useCallback((suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { word, start } = getCurrentWord();
    const end = textarea.selectionStart;
    
    // Replace the current word with the suggestion
    const before = markdown.substring(0, start);
    const after = markdown.substring(end);
    
    // Handle cursor placement in insertText (| represents cursor position)
    let insertText = suggestion.insertText;
    let cursorOffset = insertText.length;
    
    // If insertText contains 'text' or 'code', place cursor there
    const textMatch = insertText.match(/(text|code|url|alt|Header|Cell)/);
    if (textMatch) {
      cursorOffset = textMatch.index || insertText.length;
      insertText = insertText.replace(/text|code|url|alt|Header|Cell/g, (match) => {
        if (match === 'Header' || match === 'Cell') return match.toLowerCase();
        return '';
      });
    }
    
    const newValue = before + insertText + after;
    textarea.value = newValue;
    
    // Set cursor position
    const newCursorPos = start + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger input event
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    setIsVisible(false);
  }, [getCurrentWord, markdown, textareaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!isVisible) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return true;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return true;
        
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertSuggestion(suggestions[selectedIndex]);
        }
        return true;
        
      case 'Escape':
        e.preventDefault();
        setIsVisible(false);
        return true;
        
      default:
        return false;
    }
  }, [isVisible, suggestions, selectedIndex, insertSuggestion]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsVisible(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return {
    suggestions,
    selectedIndex,
    isVisible,
    handleInput,
    handleKeyDown,
    insertSuggestion,
  };
}

