// src/pages/InsertDataPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';

import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';

const InsertDataPage: React.FC = () => {
    const [selectedEscola, setSelectedEscola] = useState('');
    const [selectedSerie, setSelectedSerie] = useState('');
    const [selectedTurma, setSelectedTurma] = useState('');
    const [selectedAluno, setSelectedAluno] = useState('');
    const [selectedProvao, setSelectedProvao] = useState('');

    // Data states
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [provoes, setProvoes] = useState<Provao[]>([]);
    const [questoes, setQuestoes] = useState<Questao[]>([]);

    // Answer states
    const [respostas, setRespostas] = useState<{ [key: string]: Alternativa | null }>({});

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        setSelectedAluno('');
        setSelectedProvao('');
    }, [selectedEscola]);

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
        setSelectedAluno('');
        setSelectedProvao('');
    }, [selectedSerie]);

    useEffect(() => {
        const fetchTurmaData = async () => {
            if (selectedTurma) {
                try {
                    const [alunosData, provoesData] = await Promise.all([
                        dbService.getAlunosByTurma(selectedTurma),
                        dbService.getProvoesByTurma(selectedTurma)
                    ]);
                    setAlunos(alunosData);
                    setProvoes(provoesData);
                } catch (err) {
                    setError('Falha ao buscar dados da turma.');
                }
            } else {
                setAlunos([]);
                setProvoes([]);
            }
        };
        fetchTurmaData();
        setSelectedAluno('');
        setSelectedProvao('');
    }, [selectedTurma]);

    useEffect(() => {
        const fetchQuestoes = async () => {
            if (selectedProvao) {
                try {
                    const data = await dbService.getQuestoesByProvao(selectedProvao);
                    setQuestoes(data);
                    
                    if (selectedAluno && data.length > 0) {
                        const respostasExistentes: { [key: string]: Alternativa | null } = {};
                        for (const questao of data) {
                            try {
                                const score = await dbService.getScoreByAlunoQuestao(selectedAluno, questao.id);
                                if (score) {
                                    respostasExistentes[questao.id] = score.resposta;
                                }
                            } catch {
                                respostasExistentes[questao.id] = null;
                            }
                        }
                        setRespostas(respostasExistentes);
                    } else {
                        setRespostas({});
                    }
                } catch (err) {
                    setError('Falha ao buscar questões.');
                }
            } else {
                setQuestoes([]);
                setRespostas({});
            }
        };
        fetchQuestoes();
    }, [selectedProvao, selectedAluno]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleRespostaChange = useCallback(async (questaoId: string, valor: Alternativa) => {
        if (!selectedAluno) {
            setError('Selecione um aluno antes de responder as questões.');
            return;
        }

        const respostaAtual = respostas[questaoId];

        if (respostaAtual === valor) {
            try {
                await dbService.deleteScore(selectedAluno, questaoId);
                setRespostas((prev) => ({ ...prev, [questaoId]: null }));
                setSuccess('Resposta removida.');
            } catch (err) {
                setError('Erro ao remover resposta.');
            }
        } else {
            try {
                await dbService.addScore({
                    alunoId: selectedAluno,
                    questaoId: questaoId,
                    resposta: valor
                });
                setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
                setSuccess('Resposta salva com sucesso!');
            } catch (err) {
                setError('Erro ao salvar resposta.');
            }
        }
    }, [selectedAluno, respostas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('Todas as respostas foram salvas individualmente.');
    };

    const alternativas: Alternativa[] = ['A', 'B', 'C', 'D'];

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
                    Inserir Resultado das Questões
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="md:col-span-2">
                            <Select label="Aluno(a)" value={selectedAluno} onChange={(e) => setSelectedAluno(e.target.value)} disabled={!selectedTurma}>
                                <option value="">Selecione o Aluno</option>
                                {alunos.map(aluno => (
                                    <option key={aluno.id} value={aluno.id}>{aluno.nome} ({aluno.matricula})</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {selectedProvao && questoes.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <label className="block text-base font-semibold text-gray-800 mb-3">Questões</label>
                            <div className="space-y-3">
                                {questoes.map((q, index) => (
                                    <div key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-gray-50 border">
                                        <div className="mb-2 sm:mb-0">
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                Questão {index + 1} - {q.habilidade_codigo}
                                            </span>
                                            <div className="text-xs text-gray-600">{q.disciplina}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {alternativas.map(alt => (
                                                <button
                                                    key={alt}
                                                    type="button"
                                                    onClick={() => handleRespostaChange(q.id, alt)}
                                                    className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                                                        respostas[q.id] === alt
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    {alt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
                        <div className="text-sm text-gray-600">
                            <p>As respostas são salvas automaticamente.</p>
                        </div>
                        <Button type="submit" className="mt-4">
                            Confirmar Finalização
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default InsertDataPage;