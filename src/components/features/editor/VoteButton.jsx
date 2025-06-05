import React from 'react';

const colorMap = {
  blue: 'bg-solarized-blue hover:bg-solarized-blue/80',
  green: 'bg-solarized-green hover:bg-solarized-green/80',
  gray: 'bg-solarized-base1 hover:bg-solarized-base0',
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