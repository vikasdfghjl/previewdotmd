import { useState, useCallback, useEffect, useRef } from 'react';

interface ColumnSelection {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

interface UseColumnSelectionReturn {
  isSelecting: boolean;
  isColumnMode: boolean;
  columnSelection: ColumnSelection | null;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  getSelectedText: () => string;
  insertColumnText: (text: string) => void;
}

/**
 * useColumnSelection - Hook for column/rectangular selection
 * Alt+Drag to select a rectangular region of text
 */
export function useColumnSelection(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  markdown: string
): UseColumnSelectionReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isColumnMode, setIsColumnMode] = useState(false);
  const [columnSelection, setColumnSelection] = useState<ColumnSelection | null>(null);
  const selectionStartRef = useRef<{ line: number; col: number } | null>(null);

  // Convert position to line and column
  const getLineCol = useCallback((position: number): { line: number; col: number } => {
    const lines = markdown.substring(0, position).split('\n');
    return {
      line: lines.length - 1,
      col: lines[lines.length - 1].length,
    };
  }, [markdown]);

  // Convert line and column to position
  const getPosition = useCallback((line: number, col: number): number => {
    const lines = markdown.split('\n');
    let pos = 0;
    for (let i = 0; i < line && i < lines.length; i++) {
      pos += lines[i].length + 1; // +1 for newline
    }
    return pos + Math.min(col, lines[line]?.length || 0);
  }, [markdown]);

  // Get position from mouse event
  const getPositionFromMouse = useCallback((e: React.MouseEvent): number => {
    const textarea = textareaRef.current;
    if (!textarea) return 0;

    // This is a simplified approximation
    // In a real implementation, you'd use document.caretPositionFromPoint or similar
    const rect = textarea.getBoundingClientRect();
    const charWidth = 8; // Approximate character width
    const lineHeight = 24; // Approximate line height
    
    const x = e.clientX - rect.left - textarea.scrollLeft;
    const y = e.clientY - rect.top - textarea.scrollTop;
    
    const col = Math.round(x / charWidth);
    const line = Math.floor(y / lineHeight);
    
    return getPosition(line, col);
  }, [getPosition, textareaRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!e.altKey) return;
    
    e.preventDefault();
    setIsColumnMode(true);
    setIsSelecting(true);
    
    const pos = getPositionFromMouse(e);
    const { line, col } = getLineCol(pos);
    
    selectionStartRef.current = { line, col };
    setColumnSelection({
      startLine: line,
      startCol: col,
      endLine: line,
      endCol: col,
    });
  }, [getLineCol, getPositionFromMouse]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStartRef.current) return;
    
    const pos = getPositionFromMouse(e);
    const { line, col } = getLineCol(pos);
    
    setColumnSelection({
      startLine: Math.min(selectionStartRef.current.line, line),
      startCol: Math.min(selectionStartRef.current.col, col),
      endLine: Math.max(selectionStartRef.current.line, line),
      endCol: Math.max(selectionStartRef.current.col, col),
    });
  }, [isSelecting, getLineCol, getPositionFromMouse]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    selectionStartRef.current = null;
  }, []);

  // Get the selected text as a rectangular region
  const getSelectedText = useCallback((): string => {
    if (!columnSelection) return '';
    
    const lines = markdown.split('\n');
    const selectedLines: string[] = [];
    
    for (let i = columnSelection.startLine; i <= columnSelection.endLine; i++) {
      if (i < lines.length) {
        const line = lines[i];
        const selectedPart = line.substring(columnSelection.startCol, columnSelection.endCol);
        selectedLines.push(selectedPart);
      }
    }
    
    return selectedLines.join('\n');
  }, [columnSelection, markdown]);

  // Insert text at column position across multiple lines
  const insertColumnText = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea || !columnSelection) return;

    const lines = markdown.split('\n');
    const newLines = [...lines];
    const textLines = text.split('\n');
    
    for (let i = columnSelection.startLine; i <= columnSelection.endLine; i++) {
      if (i < newLines.length) {
        const line = newLines[i];
        const textLineIndex = i - columnSelection.startLine;
        const textToInsert = textLines[textLineIndex] || textLines[textLines.length - 1] || '';
        
        // Pad line if necessary
        const paddedLine = line.padEnd(columnSelection.startCol, ' ');
        
        // Insert or replace text at column position
        newLines[i] = paddedLine.substring(0, columnSelection.startCol) + 
                      textToInsert + 
                      paddedLine.substring(columnSelection.endCol);
      }
    }
    
    const newValue = newLines.join('\n');
    textarea.value = newValue;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }, [columnSelection, markdown, textareaRef]);

  // Apply column selection to textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !columnSelection || !isColumnMode) return;

    // Create multiple selections using setRangeText
    // Note: Standard textarea doesn't support multiple selections,
    // so we just select the entire region
    const startPos = getPosition(columnSelection.startLine, columnSelection.startCol);
    const endPos = getPosition(columnSelection.endLine, columnSelection.endCol);
    
    textarea.setSelectionRange(startPos, endPos);
  }, [columnSelection, isColumnMode, getPosition, textareaRef]);

  return {
    isSelecting,
    isColumnMode,
    columnSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getSelectedText,
    insertColumnText,
  };
}

export default useColumnSelection;
