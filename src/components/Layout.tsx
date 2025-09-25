// src/components/Layout.tsx
import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'home' | 'insert' | 'results' | 'admin';
  onNavigate: (page: 'home' | 'insert' | 'results' | 'admin') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} activePage={activePage} />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;