// Single source of truth for FAQ content — rendered visibly in FaqPanel and
// mirrored into FAQPage JSON-LD (src/app/layout.tsx) so the structured data
// matches what's actually on the page, per Google's FAQ rich result policy.
export const FAQ_ITEMS = [
  {
    question: 'Is Preview.md free to use?',
    answer:
      'Yes. Preview.md is completely free, with no account, sign-up, or subscription required.',
  },
  {
    question: 'Does Preview.md work offline?',
    answer:
      "Yes. Preview.md installs as a Progressive Web App (PWA) and keeps working fully offline once it has loaded in your browser.",
  },
  {
    question: 'Is my markdown content uploaded to a server?',
    answer:
      "No. Everything you write is saved only to your browser's local storage — nothing is uploaded. Export to a file if you want a permanent copy.",
  },
  {
    question: 'What formats can I export my markdown to?',
    answer: 'You can export your document as HTML, PDF, or plain text directly from the editor.',
  },
  {
    question: 'Does Preview.md support Mermaid diagrams and math equations?',
    answer:
      'Yes. Preview.md renders Mermaid diagrams (flowcharts, sequence diagrams, Gantt charts) and KaTeX math equations, both inline and in blocks.',
  },
  {
    question: 'Is Preview.md open source?',
    answer: 'Yes — the source code is available on GitHub.',
  },
] as const;
