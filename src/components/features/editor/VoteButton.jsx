import React from 'react';

const colorMap = {
  red: 'bg-solarized-red hover:bg-solarized-red/80',
  green: 'bg-solarized-green hover:bg-solarized-green/80',
  white: 'bg-red hover:bg-solarized-base0',
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