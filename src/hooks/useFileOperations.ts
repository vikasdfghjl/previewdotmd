import { useCallback, useRef } from 'react';

interface UseFileOperationsProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

export function useFileOperations({ markdown, onMarkdownChange }: UseFileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
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
      file => file.name.endsWith('.md') || file.name.endsWith('.markdown')
    );

    if (mdFile) {
      handleFileUpload(mdFile);
    } else if (files.length > 0) {
      alert('Please drop a markdown file (.md or .markdown)');
    }
  }, [handleFileUpload]);

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const exportAsHtml = useCallback(() => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      background: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      text-align: left;
    }
    th {
      background: #f5f5f5;
    }
    img {
      max-width: 100%;
    }
  </style>
</head>
<body>
${markdown}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const exportAsPlainText = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const exportAsPdf = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Markdown Export - PDF</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            pre {
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              background: #f5f5f5;
              padding: 0.2rem 0.4rem;
              border-radius: 3px;
            }
            pre code {
              background: none;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #ddd;
              margin: 1rem 0;
              padding-left: 1rem;
              color: #666;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 0.5rem 1rem;
              text-align: left;
            }
            th {
              background: #f5f5f5;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${markdown}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, [markdown]);

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
