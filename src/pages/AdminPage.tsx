// src/pages/AdminPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  School, 
  Users, 
  BookOpen, 
  UserCheck, 
  GraduationCap, 
  FileText, 
  Plus, 
  X,
  Hash,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import dbService from '../services/dbService';
import type { 
  Escola, 
  Serie, 
  Turma, 
  Professor, 
  Aluno, 
  Provao, 
  Questao, 
  Disciplina, 
  Alternativa 
} from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

interface AdminPageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert') => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  // States
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);

  // Form states
  const [newEscola, setNewEscola] = useState('');
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState('');
  const [newAlunoMatricula, setNewAlunoMatricula] = useState('');
  const [newProvaoName, setNewProvaoName] = useState('');

  // Selection states
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');

  // Derived data states
  const [seriesOfSelectedEscola, setSeriesOfSelectedEscola] = useState<Serie[]>([]);
  const [turmasOfSelectedSerie, setTurmasOfSelectedSerie] = useState<Turma[]>([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [professoresNaTurma, setProfessoresNaTurma] = useState<Professor[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);

  // Association states
  const [alunoParaMatricular, setAlunoParaMatricular] = useState('');
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');

  // Question form states
  const [newQuestaoHab, setNewQuestaoHab] = useState('');
  const [newQuestaoDisciplina, setNewQuestaoDisciplina] = useState<Disciplina>('Português');
  const [gabaritos, setGabaritos] = useState<Map<string, Alternativa>>(new Map());

  // Escola states
  const [newCodigoInep, setNewCodigoInep] = useState('');
  const [newLocalizacao, setNewLocalizacao] = useState('');

  // Notification state
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'error' 
  } | null>(null);

  // Helper functions
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadEscolas = useCallback(async () => {
    try {
      setEscolas(await dbService.getEscolas());
    } catch (error) {
      showNotification('Erro ao carregar escolas.', 'error');
    }
  }, [showNotification]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setEscolas(await dbService.getEscolas());
        setProfessores(await dbService.getProfessores());
        setAlunos(await dbService.getAlunos());
      } catch (error) {
        showNotification('Erro ao carregar dados iniciais.', 'error');
      }
    };
    loadInitialData();
  }, [showNotification]);

  // Load series when school changes
  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedEscola) {
        try {
          setSeriesOfSelectedEscola(await dbService.getSeriesByEscola(selectedEscola));
        } catch (error) {
          showNotification('Erro ao carregar Séries.', 'error');
        }
      } else {
        setSeriesOfSelectedEscola([]);
      }
    };
    fetchSeries();
    setSelectedSerie('');
    setSelectedTurma('');
    setSelectedProvao('');
  }, [selectedEscola, showNotification]);

  // Load turmas when serie changes
  useEffect(() => {
    const fetchTurmas = async () => {
      if (selectedSerie) {
        try {
          setTurmasOfSelectedSerie(await dbService.getTurmasBySerie(selectedSerie));
        } catch (error) {
          showNotification('Erro ao carregar turmas.', 'error');
        }
      } else {
        setTurmasOfSelectedSerie([]);
      }
    };
    fetchTurmas();
    setSelectedTurma('');
    setSelectedProvao('');
  }, [selectedSerie, showNotification]);

  // Load turma details when turma changes
  useEffect(() => {
    const fetchTurmaDetails = async () => {
      if (selectedTurma) {
        try {
          setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
          setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
          setProvoes(await dbService.getProvoesByTurma(selectedTurma));
        } catch (error) {
          showNotification('Erro ao carregar detalhes da turma.', 'error');
        }
      } else {
        setAlunosNaTurma([]);
        setProfessoresNaTurma([]);
        setProvoes([]);
      }
    };
    fetchTurmaDetails();
  }, [selectedTurma, showNotification]);

  // Load questoes when provao changes
  useEffect(() => {
    const fetchQuestoes = async () => {
      if (selectedProvao) {
        try {
          const questoesDoProvao = await dbService.getQuestoesByProvao(selectedProvao);
          setQuestoes(questoesDoProvao);
          const loadedGabaritos = new Map<string, Alternativa>();
          for (const q of questoesDoProvao) {
            const gabarito = await dbService.getGabaritoByQuestao(q.id);
            if (gabarito) {
              loadedGabaritos.set(q.id, gabarito.resposta_correta);
            }
          }
          setGabaritos(loadedGabaritos);
        } catch (error) {
          showNotification('Erro ao carregar questões.', 'error');
        }
      } else {
        setQuestoes([]);
        setGabaritos(new Map());
      }
    };
    fetchQuestoes();
  }, [selectedProvao, showNotification]);

  // Available options
  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return alunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunos, alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return professores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professores, professoresNaTurma]);

  // Event Handlers
  const handleAddEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEscola.trim() || !newCodigoInep.trim() || !newLocalizacao) {
      showNotification('Preencha todos os campos da escola.', 'error');
      return;
    }

    try {
      await dbService.createEscola({
        nome: newEscola.trim(),
        codigo_inep: newCodigoInep.trim(),
        localizacao: newLocalizacao as 'Urbano' | 'Rural'
      });
      setNewEscola('');
      setNewCodigoInep('');
      setNewLocalizacao('');
      loadEscolas();
      showNotification('Escola adicionada com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao adicionar escola.', 'error');
    }
  };

  const handleAddSerie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSerie.trim() && selectedEscola) {
      try {
        await dbService.createSerie({ nome: newSerie.trim(), escolaId: selectedEscola });
        setNewSerie('');
        setSeriesOfSelectedEscola(await dbService.getSeriesByEscola(selectedEscola));
        showNotification('Série adicionada com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar série.', 'error');
      }
    }
  };

  const handleAddTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTurma.trim() && selectedSerie) {
      try {
        await dbService.addTurma({ 
          nome: newTurma.trim(), 
          serieId: selectedSerie, 
          professorIds: [] 
        });
        setNewTurma('');
        setTurmasOfSelectedSerie(await dbService.getTurmasBySerie(selectedSerie));
        showNotification('Turma adicionada com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar turma.', 'error');
      }
    }
  };

  const handleAddProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessor.trim()) {
      try {
        await dbService.addProfessor({ nome: newProfessor.trim() });
        setNewProfessor('');
        setProfessores(await dbService.getProfessores());
        showNotification('Professor adicionado com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar professor.', 'error');
      }
    }
  };

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAluno.trim() && newAlunoMatricula.trim()) {
      try {
        await dbService.addAluno({ 
          nome: newAluno.trim(), 
          matricula: newAlunoMatricula.trim() 
        });
        setNewAluno('');
        setNewAlunoMatricula('');
        setAlunos(await dbService.getAlunos());
        showNotification('Aluno adicionado com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar aluno.', 'error');
      }
    }
  };

  const handleMatricularAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoParaMatricular && selectedTurma) {
      try {
        await dbService.addMatricula({ 
          alunoId: alunoParaMatricular, 
          turmaId: selectedTurma 
        });
        setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
        setAlunoParaMatricular('');
        showNotification('Aluno matriculado com sucesso!');
      } catch (error) {
        showNotification('Erro ao matricular aluno.', 'error');
      }
    }
  };

  const handleDesmatricularAluno = async (alunoId: string) => {
    if (selectedTurma) {
      try {
        await dbService.removeMatricula({ alunoId, turmaId: selectedTurma });
        setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
        showNotification('Aluno desmatriculado com sucesso!');
      } catch (error) {
        showNotification('Erro ao desmatricular aluno.', 'error');
      }
    }
  };

  const handleAssociarProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professorParaAssociar && selectedTurma) {
      try {
        await dbService.associateProfessorToTurma({ 
          professorId: professorParaAssociar, 
          turmaId: selectedTurma 
        });
        setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
        setProfessorParaAssociar('');
        showNotification('Professor associado com sucesso!');
      } catch (error) {
        showNotification('Erro ao associar professor.', 'error');
      }
    }
  };

  const handleDesassociarProfessor = async (professorId: string) => {
    if (selectedTurma) {
      try {
        await dbService.desassociateProfessorFromTurma({ professorId, turmaId: selectedTurma });
        setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
        showNotification('Professor desassociado com sucesso!');
      } catch (error) {
        showNotification('Erro ao desassociar professor.', 'error');
      }
    }
  };

  const handleAddProvao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvaoName.trim()) {
      showNotification('Por favor, insira um nome para o provão.', 'error');
      return;
    }
    if (!selectedTurma) {
      showNotification('Selecione uma turma para o provão.', 'error');
      return;
    }

    try {
      await dbService.addProvao({
        nome: newProvaoName.trim(),
        turmaId: selectedTurma,
      });

      setNewProvaoName('');
      setProvoes(await dbService.getProvoesByTurma(selectedTurma));
      showNotification('Provão criado com sucesso!');
    } catch (error) {
      showNotification('Erro ao criar provão.', 'error');
    }
  };

  const handleAddQuestao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestaoHab.trim() && selectedProvao) {
      try {
        await dbService.addQuestao({
          provaoId: selectedProvao,
          disciplina: newQuestaoDisciplina,
          habilidade_codigo: newQuestaoHab.trim(),
        });
        setNewQuestaoHab('');
        setQuestoes(await dbService.getQuestoesByProvao(selectedProvao));
        showNotification('Questão adicionada com sucesso!');
      } catch (error) {
        showNotification('Erro ao adicionar questão.', 'error');
      }
    }
  };

  const handleSetGabarito = async (questaoId: string, resposta: Alternativa) => {
    try {
      await dbService.addGabarito({ questaoId, respostaCorreta: resposta });
      const newGabaritos = new Map(gabaritos);
      newGabaritos.set(questaoId, resposta);
      setGabaritos(newGabaritos);
      showNotification('Gabarito salvo com sucesso!');
    } catch (error) {
      showNotification('Erro ao salvar gabarito.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            className="flex items-center gap-2 bg-white text-blue-600 hover:text-blue-800 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar para Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <GraduationCap size={40} className="text-white" />
              </div>
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">Gerencie escolas, professores, alunos e provões</p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Coluna de Gerenciamento de Estrutura */}
          <div className="space-y-6">
            {/* Gerenciar Escolas */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <School className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Escolas</h2>
              </div>
              
              <form onSubmit={handleAddEscola} className="space-y-4 mb-6">
                <Input
                  value={newEscola}
                  onChange={(e) => setNewEscola(e.target.value)}
                  placeholder="Nome da nova escola"
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={newCodigoInep}
                    onChange={(e) => setNewCodigoInep(e.target.value)}
                    placeholder="Código INEP"
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                  <Select
                    value={newLocalizacao}
                    onChange={(e) => setNewLocalizacao(e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  >
                    <option value="">Localização</option>
                    <option value="Urbano">🏙️ Urbano</option>
                    <option value="Rural">🌾 Rural</option>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-medium transition-all duration-200"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Escola
                </Button>
              </form>
              
              <Select
                value={selectedEscola}
                onChange={(e) => setSelectedEscola(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              >
                <option value="">Selecione uma escola</option>
                {escolas.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </Select>
            </Card>

            {/* Gerenciar Séries */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-xl">
                  <BookOpen className="text-green-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Séries/Anos</h2>
              </div>
              
              <form onSubmit={handleAddSerie} className="flex gap-3 mb-4">
                <Input
                  value={newSerie}
                  onChange={(e) => setNewSerie(e.target.value)}
                  placeholder="Nome da nova série"
                  disabled={!selectedEscola}
                  className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-xl disabled:bg-gray-100"
                />
                <Button 
                  type="submit" 
                  disabled={!selectedEscola}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 disabled:opacity-50"
                >
                  <Plus size={16} />
                </Button>
              </form>
              
              <Select
                value={selectedSerie}
                onChange={(e) => setSelectedSerie(e.target.value)}
                disabled={!selectedEscola}
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl disabled:bg-gray-100"
              >
                <option value="">Selecione uma série</option>
                {seriesOfSelectedEscola.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </Select>
            </Card>

            {/* Gerenciar Turmas */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Users className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Turmas</h2>
              </div>
              
              <form onSubmit={handleAddTurma} className="flex gap-3 mb-4">
                <Input
                  value={newTurma}
                  onChange={(e) => setNewTurma(e.target.value)}
                  placeholder="Nome da nova turma"
                  disabled={!selectedSerie}
                  className="flex-1 border-2 border-gray-200 focus:border-purple-500 rounded-xl disabled:bg-gray-100"
                />
                <Button 
                  type="submit" 
                  disabled={!selectedSerie}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-4 disabled:opacity-50"
                >
                  <Plus size={16} />
                </Button>
              </form>
              
              <Select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                disabled={!selectedSerie}
                className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl disabled:bg-gray-100"
              >
                <option value="">Selecione uma turma</option>
                {turmasOfSelectedSerie.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </Select>
            </Card>
          </div>

          {/* Coluna de Gerenciamento de Pessoas */}
          <div className="space-y-6">
            {/* Gerenciar Professores */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <UserCheck className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Professores</h2>
              </div>
              
              <form onSubmit={handleAddProfessor} className="flex gap-3 mb-4">
                <Input
                  value={newProfessor}
                  onChange={(e) => setNewProfessor(e.target.value)}
                  placeholder="Nome do novo professor"
                  className="flex-1 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl px-4"
                >
                  <Plus size={16} />
                </Button>
              </form>
              
              <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                {professores.length > 0 ? (
                  professores.map(p => (
                    <div key={p.id} className="py-2 text-sm border-b border-gray-200 last:border-0 flex items-center gap-2">
                      <UserCheck size={14} className="text-indigo-500" />
                      {p.nome}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum professor cadastrado
                  </p>
                )}
              </div>
            </Card>

            {/* Gerenciar Alunos */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-100 p-2 rounded-xl">
                  <Users className="text-teal-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Alunos</h2>
              </div>
              
              <form onSubmit={handleAddAluno} className="space-y-3 mb-4">
                <Input
                  value={newAluno}
                  onChange={(e) => setNewAluno(e.target.value)}
                  placeholder="Nome do novo aluno"
                  className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl"
                />
                <Input
                  value={newAlunoMatricula}
                  onChange={(e) => setNewAlunoMatricula(e.target.value)}
                  placeholder="Matrícula do aluno"
                  className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl py-3 font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Aluno
                </Button>
              </form>
              
              <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                {alunos.length > 0 ? (
                  alunos.map(a => (
                    <div key={a.id} className="py-2 text-sm border-b border-gray-200 last:border-0 flex items-center gap-2">
                      <Hash size={14} className="text-teal-500" />
                      {a.nome} ({a.matricula})
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum aluno cadastrado
                  </p>
                )}
              </div>
            </Card>

            {/* Gerenciar Turma Selecionada */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Users size={20} className="text-orange-600" />
                </div>
                Gerenciar Turma Selecionada
              </h2>
              
              {!selectedTurma ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Selecione uma turma para ver os detalhes.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Alunos na Turma */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                      <div className="bg-blue-100 p-1 rounded-lg">
                        <Users size={16} className="text-blue-600" />
                      </div>
                      Alunos na Turma 
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {alunosNaTurma.length}
                      </span>
                    </h3>
                    
                    <div className="max-h-24 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50 mb-3">
                      {alunosNaTurma.length > 0 ? (
                        alunosNaTurma.map(a => (
                          <div key={a.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-200 last:border-0">
                            <span className="flex items-center gap-2">
                              <Hash size={12} className="text-blue-500" />
                              {a.nome} ({a.matricula})
                            </span>
                            <button
                              onClick={() => handleDesmatricularAluno(a.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Desmatricular Aluno"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Nenhum aluno matriculado
                        </p>
                      )}
                    </div>
                    
                    <form onSubmit={handleMatricularAluno} className="flex gap-2">
                      <Select
                        value={alunoParaMatricular}
                        onChange={e => setAlunoParaMatricular(e.target.value)}
                        className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      >
                        <option value="">Matricular aluno...</option>
                        {alunosDisponiveis.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.nome} ({a.matricula})
                          </option>
                        ))}
                      </Select>
                      <Button 
                        type="submit" 
                        variant="success" 
                        disabled={!alunoParaMatricular}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 disabled:opacity-50"
                      >
                        Matricular
                      </Button>
                    </form>
                  </div>

                  {/* Professores na Turma */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                      <div className="bg-indigo-100 p-1 rounded-lg">
                        <UserCheck size={16} className="text-indigo-600" />
                      </div>
                      Professores na Turma 
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {professoresNaTurma.length}
                      </span>
                    </h3>
                    
                    <div className="max-h-24 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50 mb-3">
                      {professoresNaTurma.length > 0 ? (
                        professoresNaTurma.map(p => (
                          <div key={p.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-200 last:border-0">
                            <span className="flex items-center gap-2">
                              <UserCheck size={12} className="text-indigo-500" />
                              {p.nome}
                            </span>
                            <button
                              onClick={() => handleDesassociarProfessor(p.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Desassociar Professor"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Nenhum professor associado
                        </p>
                      )}
                    </div>
                    
                    <form onSubmit={handleAssociarProfessor} className="flex gap-2">
                      <Select
                        value={professorParaAssociar}
                        onChange={e => setProfessorParaAssociar(e.target.value)}
                        className="flex-1 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                      >
                        <option value="">Associar professor...</option>
                        {professoresDisponiveis.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </Select>
                      <Button 
                        type="submit" 
                        variant="success" 
                        disabled={!professorParaAssociar}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 disabled:opacity-50"
                      >
                        Associar
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Sessão do Provão */}
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl">
              <FileText className="text-white" size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Gerenciar Provão</h2>
              <p className="text-gray-600 mt-1">Crie e gerencie avaliações para suas turmas</p>
            </div>
          </div>

          {!selectedTurma ? (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-500 mb-2">Selecione uma turma acima</p>
              <p className="text-gray-400">para gerenciar os provões.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado esquerdo - Criação e seleção */}
              <div className="space-y-6">
                {/* Criar Novo Provão */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-lg">
                      <Plus size={16} className="text-green-600" />
                    </div>
                    Criar Novo Provão
                  </h3>
                  <form onSubmit={handleAddProvao} className="space-y-4">
                    <Input
                      value={newProvaoName}
                      onChange={e => setNewProvaoName(e.target.value)}
                      placeholder="Nome do novo provão"
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl"
                    />
                    <Button 
                      type="submit" 
                      variant="success" 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3 font-medium"
                    >
                      <Plus size={16} className="mr-2" />
                      Criar Provão
                    </Button>
                  </form>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                {/* Selecionar Provão */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded-lg">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    Editar Provão Existente
                  </h3>
                  <Select
                    value={selectedProvao}
                    onChange={e => setSelectedProvao(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  >
                    <option value="">Selecione um provão para editar</option>
                    {provoes.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </Select>
                </div>

                {/* Adicionar Questão */}
                {selectedProvao && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-purple-500">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="bg-purple-100 p-1 rounded-lg">
                        <Plus size={16} className="text-purple-600" />
                      </div>
                      Adicionar Questão
                    </h3>
                    <form onSubmit={handleAddQuestao} className="space-y-4">
                      <Input
                        value={newQuestaoHab}
                        onChange={e => setNewQuestaoHab(e.target.value)}
                        placeholder="Código da habilidade (ex: EF15LP03)"
                        className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                      />
                      <Select
                        value={newQuestaoDisciplina}
                        onChange={e => setNewQuestaoDisciplina(e.target.value as Disciplina)}
                        className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                      >
                        <option value="Português">📚 Português</option>
                        <option value="Matemática">🧮 Matemática</option>
                      </Select>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl py-3 font-medium"
                      >
                        <Plus size={16} className="mr-2" />
                        Adicionar Questão
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Lado direito - Questões e Gabarito */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="bg-orange-100 p-1 rounded-lg">
                      <FileText size={16} className="text-orange-600" />
                    </div>
                    Questões e Gabarito
                  </h3>
                  {questoes.length > 0 && (
                    <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium">
                      {questoes.length} questões
                    </span>
                  )}
                </div>
                
                <div className="max-h-[34rem] overflow-y-auto space-y-4 pr-2">
                  {questoes.length > 0 ? (
                    questoes.map((q, index) => (
                      <div key={q.id} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl shadow-sm border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                Questão {index + 1}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                q.disciplina === 'Português' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {q.disciplina === 'Português' ? '📚' : '🧮'} {q.disciplina}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Hash size={12} />
                              Habilidade: <span className="font-mono font-medium">{q.habilidade_codigo}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                            <Button
                              key={alt}
                              size="sm"
                              onClick={() => handleSetGabarito(q.id, alt)}
                              className={`flex items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
                                gabaritos.get(q.id) === alt 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                              }`}
                            >
                              <span className="font-bold">{alt}</span>
                              {gabaritos.get(q.id) === alt && (
                                <CheckCircle size={12} />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg mb-1">Nenhuma questão adicionada ainda</p>
                      <p className="text-sm text-gray-400">Selecione um provão e adicione questões.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;