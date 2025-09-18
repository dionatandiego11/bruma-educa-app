// src/App.tsx

import React, { useState, useEffect } from 'react';
import dbService from './services/dbService';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import InsertDataPage from './pages/InsertDataPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'insert'>('home');

  useEffect(() => {
    dbService.initialize();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage onNavigate={setCurrentPage} />;
      case 'insert':
        return <InsertDataPage onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
};

export default App;