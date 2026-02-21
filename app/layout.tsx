import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'DeepSeek Clone - AI Chatbot',
  description: 'A powerful, dark-themed AI chatbot interface inspired by DeepSeek. Experience intelligent conversations, coding assistance, and more.',
  openGraph: {
    title: 'DeepSeek Clone - AI Chatbot',
    description: 'Experience intelligent conversations with our DeepSeek-inspired AI chatbot.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
