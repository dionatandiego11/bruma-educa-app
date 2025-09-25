// src/pages/HomePage.tsx
import React from 'react';
import { School, ClipboardList, BarChart3 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomePageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert' | 'results') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Sistema Educacional Brumadinho
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6" onClick={() => onNavigate('admin')}>
          <School size={48} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Painel Administrativo</h2>
          <p className="text-gray-600 mb-4">
            Gerencie escolas, séries, turmas, e crie provões.
          </p>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('admin'); }}>
            Acessar Painel
          </Button>
        </Card>

        <Card className="text-center p-6" onClick={() => onNavigate('insert')}>
          <ClipboardList size={48} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inserir Resultados</h2>
          <p className="text-gray-600 mb-4">
            Registre as respostas dos alunos nas avaliações.
          </p>
          <Button variant="success" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('insert'); }}>
            Inserir Dados
          </Button>
        </Card>

        <Card className="text-center p-6" onClick={() => onNavigate('results')}>
          <BarChart3 size={48} className="mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Resultados do Provão</h2>
          <p className="text-gray-600 mb-4">
            Visualize rankings e análises de desempenho.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate('results'); }}>
            Ver Resultados
          </Button>
        </Card>
      </div>
    </>
  );
};

export default HomePage;