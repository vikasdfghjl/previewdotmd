/**
 * Markdown Plugins Configuration
 *
 * Centralized configuration for all markdown processing plugins.
 * Follows DRY principle by providing reusable plugin arrays and configuration options.
 */

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';

// Plugin Configuration Interfaces (Open/Closed Principle)
export interface MarkdownPluginConfig {
  gfm?: boolean;
  math?: boolean;
  emoji?: boolean;
  footnotes?: boolean;
  deflist?: boolean;
}

// Default configuration
export const defaultPluginConfig: MarkdownPluginConfig = {
  gfm: true,
  math: true,
  emoji: true,
  footnotes: false, // Disabled due to compatibility issues
  deflist: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
 type PluginLike = any;

/**
 * Builds remark plugins array based on configuration
 * Single Responsibility: Only handles remark plugins
 */
export function buildRemarkPlugins(config: MarkdownPluginConfig = defaultPluginConfig): PluginLike[] {
  const plugins: PluginLike[] = [];

  if (config.gfm) {
    plugins.push(remarkGfm);
  }

  if (config.math) {
    plugins.push(remarkMath);
  }

  if (config.emoji) {
    plugins.push(remarkEmoji);
  }

  // Footnotes disabled due to vfile version incompatibility
  // if (config.footnotes) {
  //   plugins.push([remarkFootnotes, { inlineNotes: true }]);
  // }

  if (config.deflist) {
    plugins.push(remarkDeflist);
  }

  return plugins;
}

/**
 * Builds rehype plugins array based on configuration
 * Single Responsibility: Only handles rehype plugins
 */
export function buildRehypePlugins(config: MarkdownPluginConfig = defaultPluginConfig): PluginLike[] {
  const plugins: PluginLike[] = [];

  if (config.math) {
    plugins.push(rehypeKatex);
  }

  return plugins;
}

/**
 * Pre-built plugin combinations for common use cases
 * Convenience exports following DRY principle
 */
export const remarkPlugins = buildRemarkPlugins();
export const rehypePlugins = buildRehypePlugins();

/**
 * Custom plugin configuration presets
 */
export const pluginPresets = {
  // Minimal: Only essential plugins
  minimal: buildRemarkPlugins({ gfm: true }),

  // Standard: Default configuration
  standard: remarkPlugins,

  // Full: All features enabled
  full: remarkPlugins,

  // No Math: For performance when math isn't needed
  noMath: buildRemarkPlugins({ gfm: true, emoji: true, footnotes: true, deflist: true, math: false }),
} as const;
