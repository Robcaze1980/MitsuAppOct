import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daly City Mitsubishi Sales Commission Portal',
  description: 'Manage sales and commissions for Daly City Mitsubishi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
