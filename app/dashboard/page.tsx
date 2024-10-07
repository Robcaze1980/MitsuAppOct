import { getSession, getUserProfile } from '../../lib/auth';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getSession();
  const profile = await getUserProfile();

  if (!session) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {profile?.name || session.user.email}</p>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard/sales" className="text-blue-500 hover:underline">
              Manage Sales
            </Link>
          </li>
          <li>
            <Link href="/dashboard/customers" className="text-blue-500 hover:underline">
              Manage Customers
            </Link>
          </li>
          <li>
            <Link href="/dashboard/vehicles" className="text-blue-500 hover:underline">
              Manage Vehicles
            </Link>
          </li>
          <li>
            <Link href="/dashboard/reports" className="text-blue-500 hover:underline">
              View Reports
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
