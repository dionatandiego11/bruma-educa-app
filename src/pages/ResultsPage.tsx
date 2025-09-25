// src/pages/ResultsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, Trophy, FileText, CheckCircle, XCircle } from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa, Disciplina } from '../types';
import Card from '../components/Card';
import Select from '../components/Select';

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

const ResultsPage: React.FC = () => {
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');
  const [expandedAluno, setExpandedAluno] = useState<string | null>(null);

  // Data states
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [resultados, setResultados] = useState<AlunoResult[]>([]);

  // UI states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina | 'Todas'>('Todas');
  
  // Progress states
  const [loadingProgress, setLoadingProgress] = useState({ step: '', progress: 0 });

  // Cache para dados estáticos
  const [cache, setCache] = useState<{
    escolas?: Escola[];
    series?: { [escolaId: string]: Serie[] };
    turmas?: { [serieId: string]: Turma[] };
  }>({});

  // Load escolas com cache
  useEffect(() => {
    const fetchEscolas = async () => {
      if (cache.escolas) {
        setEscolas(cache.escolas);
        return;
      }
      
      try {
        const data = await dbService.getEscolas();
        setEscolas(data);
        setCache(prev => ({ ...prev, escolas: data }));
      } catch (err) {
        setError('Falha ao buscar escolas.');
      }
    };
    fetchEscolas();
  }, [cache.escolas]);

  // Load series when escola changes
  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedEscola) {
        if (cache.series?.[selectedEscola]) {
          setSeries(cache.series[selectedEscola]);
          return;
        }
        
        try {
          const data = await dbService.getSeriesByEscola(selectedEscola);
          setSeries(data);
          setCache(prev => ({ 
            ...prev, 
            series: { ...prev.series, [selectedEscola]: data } 
          }));
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
  }, [selectedEscola, cache.series]);

  // Load turmas when serie changes
  useEffect(() => {
    const fetchTurmas = async () => {
      if (selectedSerie) {
        if (cache.turmas?.[selectedSerie]) {
          setTurmas(cache.turmas[selectedSerie]);
          return;
        }
        
        try {
          const data = await dbService.getTurmasBySerie(selectedSerie);
          setTurmas(data);
          setCache(prev => ({ 
            ...prev, 
            turmas: { ...prev.turmas, [selectedSerie]: data } 
          }));
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
  }, [selectedSerie, cache.turmas]);

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

  // Load and calculate results when provao changes (OTIMIZADO)
  useEffect(() => {
    const calculateResults = async () => {
      if (selectedProvao && selectedTurma) {
        setIsLoading(true);
        setError('');
        
        try {
          const alunos = await dbService.getAlunosByTurma(selectedTurma);
          const questoes = await dbService.getQuestoesByProvao(selectedProvao);
          const scores = await dbService.getScoresByTurmaAndProvao(selectedTurma, selectedProvao);
          const gabaritos = await dbService.getGabaritosByProvao(selectedProvao);

          if (questoes.length === 0) {
            setError('Este provão não possui questões cadastradas.');
            setResultados([]);
            return;
          }

          if (gabaritos.size === 0) {
            setError('Este provão não possui gabaritos definidos.');
            setResultados([]);
            return;
          }

          const scoresPorAluno = new Map<string, Map<string, Alternativa>>();
          scores.forEach((score: any) => {
            if (!scoresPorAluno.has(score.aluno_id)) {
              scoresPorAluno.set(score.aluno_id, new Map());
            }
            scoresPorAluno.get(score.aluno_id)!.set(score.questao_id, score.resposta);
          });

          const resultadosCalculados: AlunoResult[] = alunos.map(aluno => {
            const scoresAluno = scoresPorAluno.get(aluno.id) || new Map();
            let acertos = 0;
            const detalhes: AlunoResult['detalhes'] = [];

            questoes.forEach(questao => {
              const gabarito = gabaritos.get(questao.id);
              if (!gabarito) return;

              const respostaAluno = scoresAluno.get(questao.id) || null;
              const acertou = respostaAluno === gabarito;

              if (respostaAluno !== null && acertou) {
                acertos++;
              }

              detalhes.push({
                questao,
                respostaAluno,
                gabarito,
                acertou
              });
            });

            const totalQuestoesComGabarito = detalhes.length;
            const percentual = totalQuestoesComGabarito > 0 ? (acertos / totalQuestoesComGabarito) * 100 : 0;

            return {
              aluno,
              totalQuestoes: totalQuestoesComGabarito,
              acertos,
              erros: totalQuestoesComGabarito - acertos,
              percentual,
              detalhes
            };
          });

          resultadosCalculados.sort((a, b) => b.percentual - a.percentual);
          setResultados(resultadosCalculados);
          
        } catch (err) {
          setError('Erro ao calcular resultados: ' + (err as Error).message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResultados([]);
      }
    };

    const timeoutId = setTimeout(calculateResults, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedProvao, selectedTurma]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const filteredResultados = useMemo(() => {
    if (selectedDisciplina === 'Todas') {
      return resultados;
    }

    const newResultados = resultados.map(res => {
      const detalhesFiltrados = res.detalhes.filter(
        det => det.questao.disciplina === selectedDisciplina
      );

      const acertos = detalhesFiltrados.filter(det => det.acertou).length;
      const totalQuestoes = detalhesFiltrados.length;
      const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;

      return {
        ...res,
        acertos,
        erros: totalQuestoes - acertos,
        totalQuestoes,
        percentual,
        detalhes: detalhesFiltrados,
      };
    });

    return newResultados.sort((a, b) => b.percentual - a.percentual);
  }, [resultados, selectedDisciplina]);

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
    <>
      {isLoading && (
        <div className="fixed top-20 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50">
          <p>Carregando...</p>
        </div>
      )}

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
            <Select label="Escola" value={selectedEscola} onChange={(e) => setSelectedEscola(e.target.value)}>
                <option value="">Selecione a Escola</option>
                {escolas.map(escola => (
                  <option key={escola.id} value={escola.id}>{escola.nome}</option>
                ))}
            </Select>
            <Select label="Série/Ano" value={selectedSerie} onChange={(e) => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
                <option value="">Selecione a Série</option>
                {series.map(serie => (
                  <option key={serie.id} value={serie.id}>{serie.nome}</option>
                ))}
            </Select>
            <Select label="Turma" value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
                <option value="">Selecione a Turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
            </Select>
            <Select label="Provão" value={selectedProvao} onChange={(e) => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
                <option value="">Selecione o Provão</option>
                {provoes.map(provao => (
                  <option key={provao.id} value={provao.id}>{provao.nome}</option>
                ))}
            </Select>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-4">
          <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">Filtrar por Disciplina</h3>
          <div className="flex justify-center">
              <div className="flex rounded-lg shadow-sm">
                  <button
                      onClick={() => setSelectedDisciplina('Todas')}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors ${selectedDisciplina === 'Todas' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                      Todas
                  </button>
                  <button
                      onClick={() => setSelectedDisciplina('Português')}
                      className={`px-4 py-2 text-sm font-medium border-t border-b transition-colors ${selectedDisciplina === 'Português' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                      Português
                  </button>
                  <button
                      onClick={() => setSelectedDisciplina('Matemática')}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition-colors ${selectedDisciplina === 'Matemática' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                      Matemática
                  </button>
              </div>
          </div>
        </div>
      </Card>

      {!isLoading && filteredResultados.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={24} />
              Ranking dos Alunos ({filteredResultados.length})
            </h2>

            <div className="space-y-3 max-h-[40rem] overflow-y-auto pr-2">
              {filteredResultados.map((resultado, index) => {
                const { icon, color } = getClassificacao(index);
                const isExpanded = expandedAluno === resultado.aluno.id;

                return (
                  <div
                    key={resultado.aluno.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${isExpanded ? 'shadow-lg' : ''} ${color}`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedAluno(isExpanded ? null : resultado.aluno.id)}
                    >
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

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed">
                        <h4 className="font-semibold mb-2">Respostas Detalhadas:</h4>
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2">Questão</th>
                              <th className="p-2">Sua Resposta</th>
                              <th className="p-2">Gabarito</th>
                              <th className="p-2">Resultado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.detalhes.map((d, i) => (
                              <tr key={d.questao.id} className="border-b">
                                <td className="p-2 font-medium">{i + 1} ({d.questao.disciplina.substring(0, 3)})</td>
                                <td className="p-2 text-center">{d.respostaAluno || '-'}</td>
                                <td className="p-2 text-center">{d.gabarito}</td>
                                <td className="p-2 flex justify-center">
                                  {d.acertou ? (
                                    <CheckCircle className="text-green-500" />
                                  ) : (
                                    <XCircle className="text-red-500" />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-purple-600" size={24} />
              Desempenho por Questão
            </h2>

            <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
              {filteredResultados.length > 0 && filteredResultados[0].detalhes.map((detalhe, index) => {
                const acertosNaQuestao = filteredResultados.reduce((acc, resultado) => {
                  const detalheAluno = resultado.detalhes.find(d => d.questao.id === detalhe.questao.id);
                  return acc + (detalheAluno && detalheAluno.acertou ? 1 : 0);
                }, 0);

                const totalResponderam = filteredResultados.reduce((acc, resultado) => {
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

      {!isLoading && selectedProvao && filteredResultados.length === 0 && !error && (
        <Card>
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Nenhum resultado encontrado para este provão.</p>
            <p className="text-sm text-gray-400">
              Verifique se há alunos matriculados e questões com gabaritos definidos.
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

export default ResultsPage;