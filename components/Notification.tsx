
import React, { useEffect } from 'react';

interface NotificationProps {
  notification: {
    message: string;
    type: 'success' | 'warning';
  } | null;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) {
    return null;
  }

  const { message, type } = notification;

  const styles = {
    success: {
      bg: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      closeButton: 'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400 focus:ring-offset-green-100'
    },
    warning: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-500',
      text: 'text-yellow-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      closeButton: 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400 focus:ring-offset-yellow-100'
    }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed top-5 left-1/2 z-[100] w-full max-w-sm animate-slide-down">
        <div 
          className={`
            ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
            border-l-4 p-4 rounded-md shadow-lg flex items-start
          `}
          role="alert"
        >
            <div className="flex-shrink-0">{currentStyle.icon}</div>
            <div className="ml-3">
                <p className="font-bold">{message}</p>
            </div>
            <button 
                onClick={onClose} 
                className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-offset-2 inline-flex h-8 w-8 ${currentStyle.closeButton}`} 
                aria-label="Dismiss"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    </div>
  );
};

export default Notification;
