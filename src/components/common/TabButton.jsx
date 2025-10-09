import React from 'react';

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default TabButton;
