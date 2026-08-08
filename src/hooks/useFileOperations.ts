import { useCallback, useRef, useEffect, useState } from 'react';
import { triggerDownload, EXPORT_CSS } from '@/lib/download';

interface UseFileOperationsProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

export function useFileOperations({ markdown, onMarkdownChange }: UseFileOperationsProps) {
  const markdownRef = useRef(markdown);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  const dismissUploadError = useCallback(() => setUploadError(null), []);

  const handleFileUpload = useCallback((file: File) => {
    const fileNameLower = file.name.toLowerCase();
    if (!fileNameLower.endsWith('.md') && !fileNameLower.endsWith('.markdown')) {
      setUploadError('Please upload a markdown file (.md or .markdown)');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onMarkdownChange(content);
    };
    reader.readAsText(file);
  }, [onMarkdownChange]);

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
    handleFileUpload,
    uploadError,
    dismissUploadError,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    exportAsPlainText,
  };
}
