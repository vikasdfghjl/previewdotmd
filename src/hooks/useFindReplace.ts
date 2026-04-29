import { useState, useCallback, useRef } from 'react';

interface UseFindReplaceOptions {
  markdown: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useFindReplace({
  markdown,
  onChange,
  textareaRef,
}: UseFindReplaceOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const matchesRef = useRef<number[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleFind = useCallback((query: string) => {
    if (!query) {
      matchesRef.current = [];
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const foundMatches: number[] = [];
    let index = 0;
    const lowerMarkdown = markdown.toLowerCase();
    const lowerQuery = query.toLowerCase();

    while ((index = lowerMarkdown.indexOf(lowerQuery, index)) !== -1) {
      foundMatches.push(index);
      index += 1;
    }

    matchesRef.current = foundMatches;
    setMatchCount(foundMatches.length);
    setCurrentMatch(foundMatches.length > 0 ? 1 : 0);
  }, [markdown]);

  const handleReplace = useCallback((query: string, replacement: string, replaceAll: boolean) => {
    if (!query) return;

    if (replaceAll) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      onChange(markdown.replace(regex, replacement));
      matchesRef.current = [];
      setMatchCount(0);
      setCurrentMatch(0);
    } else if (matchesRef.current.length > 0 && currentMatch > 0) {
      const matchIndex = matchesRef.current[currentMatch - 1];
      const newContent = markdown.slice(0, matchIndex) + replacement + markdown.slice(matchIndex + query.length);
      onChange(newContent);
    }
  }, [markdown, onChange, currentMatch]);

  const goToNextMatch = useCallback(() => {
    const matches = matchesRef.current;
    if (matches.length === 0) return;
    const nextMatch = currentMatch >= matches.length ? 1 : currentMatch + 1;
    setCurrentMatch(nextMatch);
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(matches[nextMatch - 1], matches[nextMatch - 1] + 1);
      textareaRef.current.focus();
    }
  }, [currentMatch, textareaRef]);

  const goToPrevMatch = useCallback(() => {
    const matches = matchesRef.current;
    if (matches.length === 0) return;
    const prevMatch = currentMatch <= 1 ? matches.length : currentMatch - 1;
    setCurrentMatch(prevMatch);
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(matches[prevMatch - 1], matches[prevMatch - 1] + 1);
      textareaRef.current.focus();
    }
  }, [currentMatch, textareaRef]);

  return {
    isOpen,
    matchCount,
    currentMatch,
    open,
    close,
    toggle,
    handleFind,
    handleReplace,
    goToNextMatch,
    goToPrevMatch,
  };
}
