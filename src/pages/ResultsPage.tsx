// src/pages/ResultsPage.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, Trophy, FileText, CheckCircle, XCircle } from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';

interface ResultsPageProps {
  onNavigate: (page: 'home' | 'admin' | 'insert' | 'results') => void;
}

interface AlunoResult {
  aluno: Aluno;
  totalQuestoes: number;
  acertos: number;
  erros: number;
  percentual: number;
  detalhes: {
    questao: Questao;
    respostaAluno: Alternativa | null;
    gabarito: Alternativa;
    acertou: boolean;
  }[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');

  // Data states
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [resultados, setResultados] = useState<AlunoResult[]>([]);

  // UI states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load escolas
  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const data = await dbService.getEscolas();
        setEscolas(data);
      } catch (err) {
        setError('Falha ao buscar escolas.');
      }
    };
    fetchEscolas();
  }, []);

  // Load series when escola changes
  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedEscola) {
        try {
          const data = await dbService.getSeriesByEscola(selectedEscola);
          setSeries(data);
        } catch (err) {
          setError('Falha ao buscar séries.');
        }
      } else {
        setSeries([]);
      }
    };
    fetchSeries();
    setSelectedSerie('');
    setSelectedTurma('');
    setSelectedProvao('');
  }, [selectedEscola]);

  // Load turmas when serie changes
  useEffect(() => {
    const fetchTurmas = async () => {
      if (selectedSerie) {
        try {
          const data = await dbService.getTurmasBySerie(selectedSerie);
          setTurmas(data);
        } catch (err) {
          setError('Falha ao buscar turmas.');
        }
      } else {
        setTurmas([]);
      }
    };
    fetchTurmas();
    setSelectedTurma('');
    setSelectedProvao('');
  }, [selectedSerie]);

  // Load provoes when turma changes
  useEffect(() => {
    const fetchProvoes = async () => {
      if (selectedTurma) {
        try {
          const data = await dbService.getProvoesByTurma(selectedTurma);
          setProvoes(data);
        } catch (err) {
          setError('Falha ao buscar provões.');
        }
      } else {
        setProvoes([]);
      }
    };
    fetchProvoes();
    setSelectedProvao('');
  }, [selectedTurma]);

  // Load and calculate results when provao changes
  useEffect(() => {
    const calculateResults = async () => {
      if (selectedProvao && selectedTurma) {
        setIsLoading(true);
        setError('');
        
        try {
          // Buscar dados necessários
          const [alunos, questoes] = await Promise.all([
            dbService.getAlunosByTurma(selectedTurma),
            dbService.getQuestoesByProvao(selectedProvao)
          ]);

          if (questoes.length === 0) {
            setError('Este provão não possui questões cadastradas.');
            setResultados([]);
            setIsLoading(false);
            return;
          }

          // Buscar gabaritos para todas as questões
          const gabaritos = new Map<string, Alternativa>();
          for (const questao of questoes) {
            try {
              const gabarito = await dbService.getGabaritoByQuestao(questao.id);
              if (gabarito) {
                gabaritos.set(questao.id, gabarito.resposta_correta);
              }
            } catch (err) {
              console.error(`Erro ao buscar gabarito para questão ${questao.id}:`, err);
            }
          }

          // Calcular resultados para cada aluno
          const resultadosCalculados: AlunoResult[] = [];
          
          for (const aluno of alunos) {
            let acertos = 0;
            let erros = 0;
            const detalhes: AlunoResult['detalhes'] = [];

            for (const questao of questoes) {
              const gabarito = gabaritos.get(questao.id);
              
              if (!gabarito) {
                // Se não há gabarito, pula esta questão
                continue;
              }

              let respostaAluno: Alternativa | null = null;
              
              try {
                const score = await dbService.getScoreByAlunoQuestao(aluno.id, questao.id);
                respostaAluno = score ? score.resposta : null;
              } catch (err) {
                // Aluno não respondeu esta questão
                respostaAluno = null;
              }

              const acertou = respostaAluno === gabarito;
              if (respostaAluno !== null) {
                if (acertou) {
                  acertos++;
                } else {
                  erros++;
                }
              }

              detalhes.push({
                questao,
                respostaAluno,
                gabarito,
                acertou
              });
            }

            const totalQuestoes = questoes.filter(q => gabaritos.has(q.id)).length;
            const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;

            resultadosCalculados.push({
              aluno,
              totalQuestoes,
              acertos,
              erros,
              percentual,
              detalhes
            });
          }

          // Ordenar por percentual (maior para menor)
          resultadosCalculados.sort((a, b) => b.percentual - a.percentual);
          setResultados(resultadosCalculados);

        } catch (err) {
          console.error('Erro ao calcular resultados:', err);
          setError('Erro ao calcular resultados.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setResultados([]);
      }
    };

    calculateResults();
  }, [selectedProvao, selectedTurma]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getPercentualColor = (percentual: number): string => {
    if (percentual >= 80) return 'text-green-600 bg-green-100';
    if (percentual >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getClassificacao = (index: number): { icon: React.ReactNode; color: string } => {
    if (index === 0) return { icon: <Trophy className="text-yellow-500" size={20} />, color: 'bg-yellow-50 border-yellow-200' };
    if (index === 1) return { icon: <Trophy className="text-gray-400" size={20} />, color: 'bg-gray-50 border-gray-200' };
    if (index === 2) return { icon: <Trophy className="text-orange-500" size={20} />, color: 'bg-orange-50 border-orange-200' };
    return { icon: null, color: 'bg-white border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate('home')} 
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Voltar para a Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 size={40} />
            Resultados do Provão
          </h1>
          <div></div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Selecionar Provão para Análise
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
              <Select value={selectedEscola} onChange={(e) => setSelectedEscola(e.target.value)}>
                <option value="">Selecione a Escola</option>
                {escolas.map(escola => (
                  <option key={escola.id} value={escola.id}>{escola.nome}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Série/Ano</label>
              <Select value={selectedSerie} onChange={(e) => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
                <option value="">Selecione a Série</option>
                {series.map(serie => (
                  <option key={serie.id} value={serie.id}>{serie.nome}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <Select value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
                <option value="">Selecione a Turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provão</label>
              <Select value={selectedProvao} onChange={(e) => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
                <option value="">Selecione o Provão</option>
                {provoes.map(provao => (
                  <option key={provao.id} value={provao.id}>{provao.nome}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Calculando resultados...</p>
          </div>
        )}

        {!isLoading && resultados.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Ranking dos Alunos */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="text-green-600" size={24} />
                Ranking dos Alunos ({resultados.length})
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {resultados.map((resultado, index) => {
                  const { icon, color } = getClassificacao(index);
                  return (
                    <div key={resultado.aluno.id} className={`p-4 rounded-lg border-2 ${color}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {icon}
                          <div>
                            <div className="font-medium text-gray-900">
                              {index + 1}º - {resultado.aluno.nome}
                            </div>
                            <div className="text-sm text-gray-600">
                              Matrícula: {resultado.aluno.matricula}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPercentualColor(resultado.percentual)}`}>
                            {resultado.percentual.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {resultado.acertos}/{resultado.totalQuestoes} acertos
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Detalhes por Questão */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-purple-600" size={24} />
                Detalhes por Questão
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {resultados.length > 0 && resultados[0].detalhes.map((detalhe, index) => {
                  const acertosNaQuestao = resultados.reduce((acc, resultado) => {
                    const detalheAluno = resultado.detalhes.find(d => d.questao.id === detalhe.questao.id);
                    return acc + (detalheAluno && detalheAluno.acertou ? 1 : 0);
                  }, 0);

                  const totalResponderam = resultados.reduce((acc, resultado) => {
                    const detalheAluno = resultado.detalhes.find(d => d.questao.id === detalhe.questao.id);
                    return acc + (detalheAluno && detalheAluno.respostaAluno !== null ? 1 : 0);
                  }, 0);

                  const percentualAcerto = totalResponderam > 0 ? (acertosNaQuestao / totalResponderam) * 100 : 0;

                  return (
                    <div key={detalhe.questao.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Questão {index + 1}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {detalhe.questao.disciplina}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Gabarito: {detalhe.gabarito}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        Habilidade: {detalhe.questao.habilidade_codigo}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {acertosNaQuestao}/{totalResponderam} alunos acertaram
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getPercentualColor(percentualAcerto)}`}>
                          {percentualAcerto.toFixed(1)}% de acerto
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {!isLoading && selectedProvao && resultados.length === 0 && !error && (
          <Card>
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Nenhum resultado encontrado para este provão.</p>
              <p className="text-sm text-gray-400">Verifique se há alunos que responderam as questões.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;