import { useState } from 'react';

interface UserIdButtonProps {
  userId: string;
  onCopy: () => void;
}

export const UserIdButton = ({ userId, onCopy }: UserIdButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-4 left-4">
      <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <button
          className="bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-700 border border-gray-700"
          onClick={onCopy}
          aria-label="Copy User ID"
        >
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-sm py-2 px-4 rounded shadow-lg border border-gray-700">
            <p className="whitespace-nowrap">Your ID: {userId}</p>
            <p className="text-xs text-gray-400 mt-1">Click to copy ID</p>
          </div>
        )}
      </div>
    </div>
  );
};
