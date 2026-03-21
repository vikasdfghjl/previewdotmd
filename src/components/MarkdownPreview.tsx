'use client';

import React, { useState, useCallback } from 'react';
import { useMarkdownState } from '@/hooks/useMarkdownState';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { DarkModeToggle } from './DarkModeToggle';
import { APP_CONFIG } from '@/constants/config';

const MarkdownPreview: React.FC = () => {
  const { markdown, handleChange, handleClear, handleReset } = useMarkdownState();
  const [editorVisible, setEditorVisible] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);

  const toggleEditor = useCallback(() => {
    setEditorVisible(prev => !prev);
  }, []);

  const togglePreview = useCallback(() => {
    setPreviewVisible(prev => !prev);
  }, []);

  // Calculate width classes based on visibility
  const getEditorWidthClass = () => {
    if (!previewVisible) return 'w-full';
    if (!editorVisible) return 'w-0';
    return 'w-1/2';
  };

  const getPreviewWidthClass = () => {
    if (!editorVisible) return 'w-full';
    if (!previewVisible) return 'w-0';
    return 'w-1/2';
  };

  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Top Header - Professional with branding */}
      <header className="panel-header flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Preview<span className="text-blue-500">.md</span>
            </h1>
          </div>
          
          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 bg-blue-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-secondary">
              Live editing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Panel status */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${editorVisible ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className="text-sm font-medium text-secondary">Editor</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${previewVisible ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className="text-sm font-medium text-secondary">Preview</span>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-secondary font-mono">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">B</kbd>
            <span className="ml-1">Toggle panels</span>
          </div>

          {/* GitHub repository link */}
          <a
            href={APP_CONFIG.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="View on GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          
          <DarkModeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${getEditorWidthClass()}`}>
          <EditorPanel
            markdown={markdown}
            onChange={handleChange}
            onClear={handleClear}
            onReset={handleReset}
            isVisible={editorVisible}
            onToggle={toggleEditor}
          />
        </div>

        {/* Preview Panel */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${getPreviewWidthClass()}`}>
          <PreviewPanel
            markdown={markdown}
            isVisible={previewVisible}
            onToggle={togglePreview}
          />
        </div>

        {/* Floating button to show editor when hidden */}
        {!editorVisible && (
          <button
            onClick={toggleEditor}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 btn p-2 rounded-r-lg shadow-lg z-10 hover:translate-x-1"
            title="Show editor (Ctrl+B)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Floating button to show preview when hidden */}
        {!previewVisible && (
          <button
            onClick={togglePreview}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 btn p-2 rounded-l-lg shadow-lg z-10 hover:-translate-x-1"
            title="Show preview (Ctrl+B)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default MarkdownPreview;