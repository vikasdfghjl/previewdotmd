import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface BracketPosition {
  line: number;
  column: number;
}

interface BracketMatch {
  open: BracketPosition;
  close: BracketPosition;
  type: 'round' | 'square' | 'curly';
}

export type { BracketPosition, BracketMatch };

const BRACKET_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
};

const CLOSE_BRACKETS = new Set([')', ']', '}']);

export function useBracketMatching(content: string) {
  const [activeMatch, setActiveMatch] = useState<BracketMatch | null>(null);
  const [cursorInBracket, setCursorInBracket] = useState(false);
  const contentRef = useRef(content);

  // Update ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Find all bracket matches in the content
  const findAllMatches = useCallback((text: string): BracketMatch[] => {
    const lines = text.split('\n');
    const foundMatches: BracketMatch[] = [];
    const stack: Array<{ char: string; line: number; column: number; type: 'round' | 'square' | 'curly' }> = [];

    lines.forEach((line, lineIndex) => {
      for (let col = 0; col < line.length; col++) {
        const char = line[col];

        if (char in BRACKET_PAIRS) {
          const type = char === '(' ? 'round' : char === '[' ? 'square' : 'curly';
          stack.push({ char, line: lineIndex, column: col, type });
        } else if (CLOSE_BRACKETS.has(char)) {
          const expectedOpen = char === ')' ? '(' : char === ']' ? '[' : '{';
          const type = char === ')' ? 'round' : char === ']' ? 'square' : 'curly';

          // Find matching opening bracket
          const matchingIndex = stack.findIndex(item => item.char === expectedOpen);
          if (matchingIndex !== -1) {
            // Remove all brackets after the matching one (they're unmatched)
            const openBracket = stack[matchingIndex];
            foundMatches.push({
              open: { line: openBracket.line, column: openBracket.column },
              close: { line: lineIndex, column: col },
              type,
            });
            stack.splice(matchingIndex, 1);
          }
        }
      }
    });

    return foundMatches;
  }, []);

  const matches = useMemo(() => findAllMatches(content), [content, findAllMatches]);

  // Handle cursor position change — checks both the character at the cursor
  // and the character just before, for both open and close brackets.
  const handleCursorChange = useCallback((cursorLine: number, cursorColumn: number) => {
    const currentLine = contentRef.current.split('\n')[cursorLine] || '';
    const charAtCursor = currentLine[cursorColumn];
    const charBeforeCursor = cursorColumn > 0 ? currentLine[cursorColumn - 1] : null;

    let foundMatch: BracketMatch | null = null;

    // Try each position/offset — short-circuit on first match
    for (const offset of [0, -1]) {
      const char = offset === 0 ? charAtCursor : charBeforeCursor;
      if (!char) continue;

      // Check as opening bracket
      if (char in BRACKET_PAIRS) {
        foundMatch = matches.find(m =>
          m.open.line === cursorLine && m.open.column === cursorColumn + offset
        ) ?? null;
        if (foundMatch) break;
      }

      // Check as closing bracket
      if (CLOSE_BRACKETS.has(char)) {
        foundMatch = matches.find(m =>
          m.close.line === cursorLine && m.close.column === cursorColumn + offset
        ) ?? null;
        if (foundMatch) break;
      }
    }

    setActiveMatch(foundMatch);
    setCursorInBracket(foundMatch !== null);
  }, [matches]);

  return {
    matches,
    activeMatch,
    cursorInBracket,
    handleCursorChange,
  };
}
