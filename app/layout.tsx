import './globals.css'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import ClientWrapper from '../components/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
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
      <body className={inter.className}>
        <ClientWrapper>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ClientWrapper>
      </body>
    </html>
  )
}
