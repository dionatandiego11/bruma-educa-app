import React from 'react';
import { GraduationCap, School, ClipboardList, BarChart3 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomePageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert' | 'results') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
            <GraduationCap size={60} className="text-blue-600" />
            Sistema Educacional Brumadinho
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('results')}>
            <div className="text-center">
              <BarChart3 size={60} className="mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Resultados do Provão</h2>
              <p className="text-gray-600 mb-4">
                Visualize rankings, análises de desempenho e estatísticas dos provões aplicados.
              </p>
              <Button 
                onClick={() => onNavigate('results')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Ver Resultados
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Fluxo do Sistema</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-blue-700">
              <span className="flex items-center gap-1">
                <School size={16} />
                1. Configurar
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <ClipboardList size={16} />
                2. Aplicar
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                3. Analisar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;