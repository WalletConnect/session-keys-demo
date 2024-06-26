import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { cookieToInitialState } from 'wagmi'
import { config } from '@/core/config'
import { headers } from 'next/headers'
import { ContextProvider } from '@/core/context'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'Session key demo',
  description: 'App build in order to demostrate session key UX'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased pt-12 pb-24 mt-12 overflow-y-auto',
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ContextProvider initialState={initialState}>
            <div className="flex items-center justify-center min-h-screen">{children}</div>
          </ContextProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
