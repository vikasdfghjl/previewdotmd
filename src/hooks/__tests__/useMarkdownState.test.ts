import { describe, it, expect } from 'vitest';
import { DEFAULT_MARKDOWN } from '../../constants/defaultMarkdown';

describe('DEFAULT_MARKDOWN constant', () => {
  it('contains expected default document sections', () => {
    expect(DEFAULT_MARKDOWN).toContain('# Welcome to Preview.md');
    expect(DEFAULT_MARKDOWN).toContain('## 📐 Math Equations (KaTeX)');
    expect(DEFAULT_MARKDOWN).toContain('## 📈 Diagrams (Mermaid)');
  });
});
