'use client';

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Daly City Mitsubishi
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {session ? (
              <>
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <button onClick={() => signOut()}>Sign out</button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={() => signIn()}>Sign in</button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
