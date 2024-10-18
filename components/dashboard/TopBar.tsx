import React from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TopBarProps {
  userName: string;
}

const TopBar: React.FC<TopBarProps> = ({ userName }) => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin'); // Adjust this path to your sign-in page
  };

  return (
    <div className="bg-red-600 text-white p-4 flex justify-between items-center">
      <span className="font-bold">{userName}</span>
      <div>
        <span className="mr-4">Welcome, {userName}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar;
