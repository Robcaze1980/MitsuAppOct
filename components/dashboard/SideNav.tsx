import Link from 'next/link';

export default function SideNav() {
  return (
    <nav className="w-64 bg-white p-4 rounded-lg shadow-sm m-4">
      <ul>
        <li className="mb-4">
          <Link href="/dashboard/salesperson" className="text-gray-700 hover:text-red-600 font-semibold">
            Home
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/dashboard/salesperson" className="text-gray-700 hover:text-red-600 font-semibold">
            My work
          </Link>
        </li>
        <li className="mb-4">
          <details className="cursor-pointer">
            <summary className="text-gray-700 hover:text-red-600 font-semibold">Favorites</summary>
          </details>
        </li>
        <li className="mb-4">
          <details className="cursor-pointer" open>
            <summary className="text-gray-700 hover:text-red-600 font-semibold">Main workspace</summary>
            <ul className="ml-4 mt-2">
              <li className="mb-2">
                <Link href="/dashboard/salesperson" className="text-blue-600 hover:text-blue-800">
                  Commission tracking
                </Link>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </nav>
  );
}