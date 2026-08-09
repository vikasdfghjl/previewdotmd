'use client';

import React, { useState } from 'react';
import { LayoutControls } from './LayoutControls';
import { DarkModeToggle } from './DarkModeToggle';
import { ToolbarButton } from './ToolbarButton';
import { CommandPaletteHint } from './CommandPaletteHint';
import { SyncScrollHint } from './SyncScrollHint';
import { FaqPanel } from './FaqPanel';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Icons } from '@/constants/icons';

interface HeaderProps {
  githubUrl: string;
  /** Opens the command palette. Always shown — Ctrl+Shift+P has no other visible entry point once the demo content (which mentions it) is cleared. */
  onOpenCommandPalette?: () => void;
  /** Whether the palette has been opened at least once — dismisses the onboarding hint. */
  hasOpenedCommandPalette?: boolean;
  /** Whether sync scroll has been toggled at least once — dismisses its onboarding hint. */
  hasToggledSyncScroll?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  githubUrl,
  onOpenCommandPalette,
  hasOpenedCommandPalette = false,
  hasToggledSyncScroll = false,
}) => {
  const { showInstall, promptInstall } = useInstallPrompt();
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <header className="panel-header flex items-center justify-between px-5 py-3 border-b flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
            {Icons.logo}
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            Preview<span className="text-blue-500">.md</span>
            <span className="sr-only"> — Free online Markdown editor with live preview, syntax highlighting, Mermaid diagrams, and KaTeX math</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Inline controls need ~1050px of header; below lg they live in the
            docked bottom bar instead (see MarkdownPreview), so the header
            never overflows the viewport on tablets. */}
        <LayoutControls
          className="hidden lg:flex"
          syncScrollHint={<SyncScrollHint hasBeenToggled={hasToggledSyncScroll} />}
        />

        {onOpenCommandPalette && (
          <div className="relative">
            <ToolbarButton onClick={onOpenCommandPalette} title="Command palette (Ctrl+Shift+P)">
              {Icons.search}
            </ToolbarButton>
            <CommandPaletteHint hasBeenOpened={hasOpenedCommandPalette} />
          </div>
        )}

        <ToolbarButton onClick={() => setFaqOpen(true)} title="Frequently asked questions">
          {Icons.help}
        </ToolbarButton>

        <DarkModeToggle />

        {showInstall && (
          <button
            onClick={promptInstall}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
            title="Install Preview.md as an app"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {/* Visual separator between app controls and external links */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" aria-hidden="true" />

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="View on GitHub"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no Image loader configured */}
          <img src="/logo/GitHub_Invertocat_Black_Clearspace.png" alt="GitHub" className="w-5 h-5 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no Image loader configured */}
          <img src="/logo/GitHub_Invertocat_White_Clearspace.png" alt="GitHub" className="w-5 h-5 hidden dark:block" />
        </a>
      </div>

      <FaqPanel isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
    </header>
  );
};

