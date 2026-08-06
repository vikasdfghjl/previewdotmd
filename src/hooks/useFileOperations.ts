import { useCallback, useRef, useEffect } from 'react';
import { triggerDownload, EXPORT_CSS } from '@/lib/download';

interface UseFileOperationsProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

export function useFileOperations({ markdown, onMarkdownChange }: UseFileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef(markdown);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  const handleFileUpload = useCallback((file: File) => {
    const fileNameLower = file.name.toLowerCase();
    if (!fileNameLower.endsWith('.md') && !fileNameLower.endsWith('.markdown')) {
      alert('Please upload a markdown file (.md or .markdown)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onMarkdownChange(content);
    };
    reader.readAsText(file);
  }, [onMarkdownChange]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const mdFile = files.find(
      file => {
        const nameLower = file.name.toLowerCase();
        return nameLower.endsWith('.md') || nameLower.endsWith('.markdown');
      }
    );

    if (mdFile) {
      handleFileUpload(mdFile);
    } else if (files.length > 0) {
      alert('Please drop a markdown file (.md or .markdown)');
    }
  }, [handleFileUpload]);

  const getRenderedHtml = useCallback((): string => {
    if (typeof window !== 'undefined') {
      const area = document.getElementById('preview-render-area');
      if (area && area.innerHTML.trim() !== '') {
        return area.innerHTML;
      }
    }
    return `<pre>${markdownRef.current.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
  }, []);

  const downloadMarkdown = useCallback(() => {
    triggerDownload(markdownRef.current, 'document.md', 'text/markdown');
  }, []);

  const exportAsHtml = useCallback(() => {
    const bodyContent = getRenderedHtml();
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>${EXPORT_CSS}</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
    triggerDownload(htmlContent, 'document.html', 'text/html');
  }, [getRenderedHtml]);

  const exportAsPlainText = useCallback(() => {
    triggerDownload(markdownRef.current, 'document.txt', 'text/plain');
  }, []);

  const exportAsPdf = useCallback(() => {
    const bodyContent = getRenderedHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Markdown Export - PDF</title>
  <style>${EXPORT_CSS}</style>
</head>
<body>
  ${bodyContent}
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`);
      printWindow.document.close();
    }
  }, [getRenderedHtml]);

  return {
    fileInputRef,
    triggerFileInput,
    handleFileUpload,
    handleDragOver,
    handleDrop,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    exportAsPlainText,
  };
}
