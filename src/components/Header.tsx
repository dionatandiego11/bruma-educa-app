// src/components/Header.tsx
import React from 'react';
import { Book, CheckSquare, BarChart, Settings } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: 'home' | 'insert' | 'results' | 'admin') => void;
  activePage: 'home' | 'insert' | 'results' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const navItems = [
    { page: 'home', icon: Book, label: 'Visão Geral' },
    { page: 'insert', icon: CheckSquare, label: 'Lançar Notas' },
    { page: 'results', icon: BarChart, label: 'Ver Resultados' },
    { page: 'admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">
            Sistema de Avaliação
          </div>
          <div className="flex space-x-4">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === item.page
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;