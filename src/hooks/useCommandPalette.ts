import { useState, useCallback, useEffect, useMemo } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
  category?: string;
}

interface UseCommandPaletteProps {
  commands: Command[];
}

interface UseCommandPaletteReturn {
  isOpen: boolean;
  query: string;
  filteredCommands: Command[];
  selectedIndex: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  selectNext: () => void;
  selectPrev: () => void;
  executeSelected: () => void;
}

/**
 * useCommandPalette - Hook for managing command palette state
 * Provides fuzzy search and keyboard navigation
 */
export function useCommandPalette({ commands }: UseCommandPaletteProps): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter and sort commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const lowerQuery = query.toLowerCase();
    
    return commands
      .map(cmd => {
        const labelScore = cmd.label.toLowerCase().includes(lowerQuery) ? 2 : 0;
        const descScore = cmd.description?.toLowerCase().includes(lowerQuery) ? 1 : 0;
        const shortcutScore = cmd.shortcut?.toLowerCase().includes(lowerQuery) ? 1 : 0;
        const score = labelScore + descScore + shortcutScore;
        
        return { cmd, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ cmd }) => cmd);
  }, [commands, query]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const selectNext = useCallback(() => {
    setSelectedIndex(prev => 
      prev < filteredCommands.length - 1 ? prev + 1 : prev
    );
  }, [filteredCommands.length]);

  const selectPrev = useCallback(() => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
  }, []);

  const executeSelected = useCallback(() => {
    const command = filteredCommands[selectedIndex];
    if (command) {
      command.action();
      close();
    }
  }, [filteredCommands, selectedIndex, close]);

  // Global keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P or Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        toggle();
      }
      // Escape to close
      else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);

  return {
    isOpen,
    query,
    filteredCommands,
    selectedIndex,
    open,
    close,
    toggle,
    setQuery,
    selectNext,
    selectPrev,
    executeSelected,
  };
}

export default useCommandPalette;
