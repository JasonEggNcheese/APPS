
import React from 'react';

interface HeaderProps {
    petName: string;
}

const Header: React.FC<HeaderProps> = ({ petName }) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pet Tracker</h1>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500">Tracking</div>
        <div className="font-bold text-lg text-blue-600">{petName}</div>
      </div>
    </header>
  );
};

export default Header;
