import React from 'react';

const colorMap = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
  gray: 'bg-gray-400 hover:bg-gray-500',
};

const VoteButton = ({ children, onClick, disabled, color = 'blue' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-white rounded disabled:opacity-50 ${colorMap[color]}`}
  >
    {children}
  </button>
);

export default VoteButton; 