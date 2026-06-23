import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Resume AI',
  description: 'AI-powered job-tailored resume builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-8">
            <span className="font-semibold text-gray-900 text-sm tracking-tight">Resume AI</span>
            <nav className="flex items-center gap-6">
              <Link
                href="/resume"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Master Resume
              </Link>
              <Link
                href="/jobs"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Jobs
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
