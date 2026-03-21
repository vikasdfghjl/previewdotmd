'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}