import React, { useEffect } from 'react';

const colors = {
  success: 'bg-green-100 border-green-300 text-green-800',
  error: 'bg-red-100 border-red-300 text-red-800',
  warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  info: 'bg-blue-100 border-blue-300 text-blue-800',
};

const StatusToast = ({ status, onDismiss, duration = 4000 }) => {
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => onDismiss(), duration);
    return () => clearTimeout(timer);
  }, [status, duration, onDismiss]);

  if (!status) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 max-w-sm border rounded-lg px-4 py-3 shadow-lg transition-all ${colors[status.type || 'info']}`}>
      <p className="text-sm font-medium">{status.title}</p>
      {status.description && <p className="text-xs mt-1 opacity-80">{status.description}</p>}
      <button onClick={onDismiss} className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700">Fermer</button>
    </div>
  );
};

export default StatusToast;
