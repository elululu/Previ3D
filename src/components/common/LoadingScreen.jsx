import React from 'react';

const LoadingScreen = ({ message = 'Chargement des données...' }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default LoadingScreen;
