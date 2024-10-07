import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-8">Daly City Mitsubishi Sales Commission Portal</h1>
      <div className="space-y-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center">
          Login
        </Link>
        <Link href="/signup" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block text-center">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
