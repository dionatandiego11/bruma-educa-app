import React from 'react';
import { GraduationCap, School, ClipboardList } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomePageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
            <GraduationCap size={60} className="text-blue-600" />
            Sistema Educacional Brumadinho
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('admin')}>
            <div className="text-center">
              <School size={60} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Painel Administrativo</h2>
              <p className="text-gray-600 mb-4">
                Gerencie escolas, séries, turmas, professores, alunos e crie provões com questões.
              </p>
              <Button onClick={() => onNavigate('admin')} className="w-full">
                Acessar Administração
              </Button>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('insert')}>
            <div className="text-center">
              <ClipboardList size={60} className="mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Inserir Resultados</h2>
              <p className="text-gray-600 mb-4">
                Registre as respostas dos alunos nas avaliações e acompanhe o desempenho.
              </p>
              <Button variant="success" onClick={() => onNavigate('insert')} className="w-full">
                Inserir Dados
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;