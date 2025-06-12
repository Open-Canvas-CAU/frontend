import React from 'react';

const colorMap = {
  red: 'bg-red hover:bg-red/80',
  red: 'bg-red hover:bg-red/80',
  white: 'bg-red hover:bg-base0',
};

const VoteButton = ({ children, onClick, disabled, color = 'red' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-white rounded disabled:opacity-50 ${colorMap[color]}`}
  >
    {children}
  </button>
);

export default VoteButton; 