// src/App.tsx

import React, { useState } from 'react';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'insert' | 'results'>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage onNavigate={setCurrentPage} />;
      case 'insert':
        return <InsertDataPage onNavigate={setCurrentPage} />;
      case 'results':
        return <ResultsPage onNavigate={setCurrentPage} />;
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