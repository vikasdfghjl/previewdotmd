/**
 * triggerDownload — shared utility for triggering file downloads in the browser.
 * Creates a Blob, generates an object URL, and programmatically clicks a link to download.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Shared minimal CSS for HTML and PDF exports — avoids duplicating styles across export functions. */
export const EXPORT_CSS = `
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
  .anchor-heading-icon {
    display: none;
  }
  .code-copy-button {
    display: none;
  }

  /* Print / PDF: fit A4 and never rely on scrolling to reveal clipped content */
  @media print {
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }
    pre, table, .mermaid-diagram-container {
      page-break-inside: avoid;
    }
    pre, code {
      white-space: pre-wrap;
      overflow-wrap: break-word;
      overflow-x: visible;
    }
    table {
      font-size: 0.85em;
    }
    td, th {
      overflow-wrap: break-word;
    }
    img, svg {
      max-width: 100% !important;
      height: auto !important;
    }
    /* Diagrams are given natural (unconstrained) width for horizontal scrolling
       in the live preview and standalone HTML export — but print can't scroll,
       so shrink wide diagrams to fit the page instead of clipping them. */
    .mermaid-diagram-container {
      overflow: visible !important;
    }
    .mermaid-diagram-container svg {
      width: auto !important;
      max-width: 100% !important;
      height: auto !important;
    }
  }
`;
