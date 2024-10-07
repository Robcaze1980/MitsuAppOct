import React from 'react';

type TopBarProps = {
  userName: string;
};

export default function TopBar({ userName }: TopBarProps) {
  const displayName = userName.split('@')[0];

  return (
    <header className="bg-black text-white p-4">
      <div className="flex justify-end items-center">
        <div>
          Welcome, {displayName}
        </div>
      </div>
    </header>
  );
}