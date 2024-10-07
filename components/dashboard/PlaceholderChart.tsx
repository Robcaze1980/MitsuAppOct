import React from 'react';

export default function PlaceholderChart({ title }: { title: string }) {
  return (
    <div className="bg-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p>Chart placeholder</p>
    </div>
  )
}