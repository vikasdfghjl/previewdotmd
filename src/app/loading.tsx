/**
 * Root loading state — shown during initial JavaScript bundle download
 * and hydration. Provides a branded loading screen instead of a blank page.
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-6">
        {/* Brand logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Spinner */}
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading Preview.md
        </p>
      </div>
    </div>
  );
}
