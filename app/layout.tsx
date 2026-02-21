import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Gen2 - AI Chatbot by M Fariz Alfauzi',
  description: 'Gen2 is an advanced AI chatbot created by M Fariz Alfauzi, a 17-year-old student and CEO from SMK Nurul Islam Affandiyah in Cianjur, West Java. Born on August 8, 2008, Fariz developed Gen2 to showcase the potential of student innovation.',
  keywords: ['Gen2', 'AI Chatbot', 'M Fariz Alfauzi', 'SMK Nurul Islam Affandiyah', 'Cianjur', 'Student Developer', 'CEO', 'Artificial Intelligence', 'Deep Learning', 'Next.js'],
  authors: [{ name: 'M Fariz Alfauzi', url: 'https://gen-2-ten.vercel.app' }],
  creator: 'M Fariz Alfauzi',
  openGraph: {
    title: 'Gen2 - AI Chatbot by M Fariz Alfauzi',
    description: 'Developed by M Fariz Alfauzi (17), a student at SMK Nurul Islam Affandiyah, Cianjur. Gen2 brings intelligent AI conversations to life.',
    type: 'website',
    siteName: 'Gen2 AI',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gen2 - AI Chatbot by M Fariz Alfauzi',
    description: 'Developed by M Fariz Alfauzi (17), a student at SMK Nurul Islam Affandiyah, Cianjur.',
    creator: '@mfarizalfauzi',
  },
  verification: {
    google: 'phdHTCDOPrV7PlvVTQ6ak0zRnX9vbJZnq2sKNSOneGs',
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
