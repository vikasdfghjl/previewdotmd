import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
};

const SITE_URL =
  process.env.CF_PAGES_URL
    ? new URL(process.env.CF_PAGES_URL)
    : process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : new URL("https://previewdotmd.pages.dev");

export const metadata: Metadata = {
  metadataBase: SITE_URL,

  // Title: 58 chars — fits Google's ~60 char display limit with rich keyword coverage
  title: "Preview.md — Free Online Markdown Editor with Live Preview",

  // Description: 158 chars — near Google's ~160 char limit, keyword-rich
  description:
    "A free, offline-capable Markdown editor with live preview, syntax highlighting, dark mode, Mermaid diagrams, KaTeX math, and export to HTML/PDF. Install as a PWA.",

  keywords: [
    "markdown editor", "live preview", "markdown preview", "online markdown editor",
    "free markdown editor", "PWA markdown editor", "offline markdown editor",
    "markdown to HTML", "syntax highlighting", "dark mode markdown",
    "mermaid diagrams", "katex math", "GFM markdown",
  ],

  // Let search engines index and follow links
  robots: { index: true, follow: true },

  // Canonical URL
  alternates: {
    canonical: SITE_URL.origin,
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Preview.md",
  },

  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },

  openGraph: {
    title: "Preview.md — Free Online Markdown Editor with Live Preview",
    description:
      "Write markdown with live preview. Install as a PWA. Works offline. Syntax highlighting, Mermaid diagrams, KaTeX math, export to HTML, PDF, and plain text.",
    type: "website",
    siteName: "Preview.md",
    url: SITE_URL.origin,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Preview.md — Markdown Editor with Live Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Preview.md — Free Online Markdown Editor",
    description:
      "Write markdown with live preview. Install as a PWA. Works offline. Syntax highlighting, Mermaid diagrams, KaTeX math, export to HTML/PDF.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Preview.md" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Preview.md" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="canonical" href="https://previewdotmd.pages.dev/" />
        <link rel="alternate" hrefLang="en" href="https://previewdotmd.pages.dev/" />
        <link rel="alternate" hrefLang="x-default" href="https://previewdotmd.pages.dev/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Preview.md',
              url: 'https://previewdotmd.pages.dev',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Any',
              description:
                'A free, offline-capable Markdown editor with live preview, syntax highlighting for 100+ languages, Mermaid diagrams, KaTeX math rendering, dark mode, PWA install, and export to HTML/PDF/plain text.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Live preview with real-time rendering',
                'Syntax highlighting for 100+ languages',
                'Mermaid diagram support (flowcharts, sequence, Gantt)',
                'KaTeX math rendering (inline and block)',
                'Dark mode with system preference detection',
                'PWA install with offline support',
                'Export to HTML, PDF, and plain text',
                'Split, stacked, and tabbed layout modes',
                'Command palette (Ctrl+Shift+P)',
                'Find and replace with regex support',
                'Auto-save to browser localStorage',
                'GitHub Flavored Markdown (GFM)',
              ],
              browserRequirements: 'requires JavaScript',
              permissions: 'clipboardWrite',
              sameAs: ['https://github.com/vikasdfghjl/previewdotmd'],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ServiceWorkerRegistration />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
