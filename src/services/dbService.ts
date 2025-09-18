// src/services/dbService.ts

import type {
  Escola, Serie, Turma, Professor, Aluno, Matricula,
  Provao, Questao, Gabarito, Score, Disciplina, Alternativa
} from '../types';

interface BrumaEducaDB {
  escolas: Escola[];
  series: Serie[];
  turmas: Turma[];
  professores: Professor[];
  alunos: Aluno[];
  matriculas: Matricula[];
  provoes: Provao[];
  questoes: Questao[];
  gabaritos: Gabarito[];
  scores: Score[];
}

const dbService = (() => {
  const DB_KEY = 'brumaEducaDB';

  const generateId = () => `_${Math.random().toString(36).substring(2, 9)}`;

  const getDB = (): BrumaEducaDB => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : {
        escolas: [], series: [], turmas: [], professores: [], alunos: [],
        matriculas: [], provoes: [], questoes: [], gabaritos: [], scores: [],
      };
    } catch (error) {
      console.error("Failed to retrieve DB", error);
      return {
        escolas: [], series: [], turmas: [], professores: [], alunos: [],
        matriculas: [], provoes: [], questoes: [], gabaritos: [], scores: [],
      };
    }
  };

  const saveDB = (db: BrumaEducaDB): void => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
      console.error("Failed to save DB", error);
    }
  };

  // ... (Cole todo o corpo do dbService original aqui, sem alterações)
  // Exemplo:
  return {
    initialize: () => {
      const db = getDB();
      // Initialize with sample data if empty
      if (db.escolas.length === 0) {
        // Sample school
        const escola: Escola = { id: generateId(), nome: 'ESCOLA MUNICIPAL "LUCAS MARCIANO DA SILVA"' };
        db.escolas.push(escola);

        // Sample professors
        const profDoriedson: Professor = { id: generateId(), nome: 'Doriedson' };
        const profAlessandra: Professor = { id: generateId(), nome: 'Alessandra' };
        db.professores.push(profDoriedson, profAlessandra);

        // Sample series
        const serie6ano: Serie = { id: generateId(), nome: '6º ano', escolaId: escola.id };
        db.series.push(serie6ano);

        // Sample turma
        const turma1: Turma = {
          id: generateId(),
          nome: '1',
          serieId: serie6ano.id,
          professorIds: [profDoriedson.id, profAlessandra.id]
        };
        db.turmas.push(turma1);

        // Sample students
        const studentsData = [
          { matricula: '1496', nome: 'Álvaro Eduardo Menezes Souza' },
          { matricula: '5476', nome: 'Aquiles Braga Oliveira' },
          { matricula: '4929', nome: 'Bruno Deivid De Jesus Ferreira Santos' }
        ];

        studentsData.forEach(data => {
          const aluno: Aluno = { id: generateId(), nome: data.nome, matricula: data.matricula };
          db.alunos.push(aluno);
          
          const matricula: Matricula = { id: generateId(), alunoId: aluno.id, turmaId: turma1.id };
          db.matriculas.push(matricula);
        });

        saveDB(db);
      }
    },

    getEscolas: (): Escola[] => getDB().escolas,
    addEscola: (data: { nome: string }) => {
      const db = getDB();
      const newEscola: Escola = { id: generateId(), ...data };
      db.escolas.push(newEscola);
      saveDB(db);
      return newEscola;
    },

    getSeriesByEscola: (escolaId: string): Serie[] => {
      const db = getDB();
      return db.series.filter(s => s.escolaId === escolaId);
    },
    addSerie: (data: { nome: string; escolaId: string }) => {
      const db = getDB();
      const newSerie: Serie = { id: generateId(), ...data };
      db.series.push(newSerie);
      saveDB(db);
      return newSerie;
    },

    getTurmasBySerie: (serieId: string): Turma[] => {
      const db = getDB();
      return db.turmas.filter(t => t.serieId === serieId);
    },
    addTurma: (data: { nome: string; serieId: string; professorIds: string[] }) => {
      const db = getDB();
      const newTurma: Turma = { id: generateId(), ...data };
      db.turmas.push(newTurma);
      saveDB(db);
      return newTurma;
    },
    updateTurma: (turmaId: string, updates: Partial<Turma>) => {
      const db = getDB();
      const index = db.turmas.findIndex(t => t.id === turmaId);
      if (index > -1) {
        db.turmas[index] = { ...db.turmas[index], ...updates };
        saveDB(db);
        return db.turmas[index];
      }
      return undefined;
    },

    getProfessores: (): Professor[] => getDB().professores,
    addProfessor: (data: { nome: string }) => {
      const db = getDB();
      const newProfessor: Professor = { id: generateId(), ...data };
      db.professores.push(newProfessor);
      saveDB(db);
      return newProfessor;
    },
    getProfessoresByTurma: (turmaId: string): Professor[] => {
      const db = getDB();
      const turma = db.turmas.find(t => t.id === turmaId);
      if (!turma) return [];
      return db.professores.filter(p => turma.professorIds.includes(p.id));
    },

    getAlunos: (): Aluno[] => getDB().alunos,
    addAluno: (data: { nome: string; matricula: string }) => {
      const db = getDB();
      const newAluno: Aluno = { id: generateId(), ...data };
      db.alunos.push(newAluno);
      saveDB(db);
      return newAluno;
    },
    getAlunosByTurma: (turmaId: string): Aluno[] => {
      const db = getDB();
      const matriculas = db.matriculas.filter(m => m.turmaId === turmaId);
      const alunoIds = matriculas.map(m => m.alunoId);
      return db.alunos.filter(a => alunoIds.includes(a.id));
    },

    addMatricula: (data: { alunoId: string; turmaId: string }) => {
      const db = getDB();
      const matricula: Matricula = { id: generateId(), ...data };
      db.matriculas.push(matricula);
      saveDB(db);
      return matricula;
    },

    getProvoesByTurma: (turmaId: string): Provao[] => {
      const db = getDB();
      return db.provoes.filter(p => p.turmaId === turmaId);
    },
    addProvao: (data: { nome: string; turmaId: string }) => {
      const db = getDB();
      const newProvao: Provao = { 
        id: generateId(), 
        ...data,
        data: new Date().toISOString()
      };
      db.provoes.push(newProvao);
      saveDB(db);
      return newProvao;
    },

    getQuestoesByProvao: (provaoId: string): Questao[] => {
      const db = getDB();
      return db.questoes.filter(q => q.provaoId === provaoId);
    },
    addQuestao: (data: { provaoId: string; disciplina: Disciplina; descricao: string; habilidade_codigo: string }) => {
      const db = getDB();
      const newQuestao: Questao = { id: generateId(), ...data };
      db.questoes.push(newQuestao);
      saveDB(db);
      return newQuestao;
    },

    getGabaritoByQuestao: (questaoId: string): Gabarito | undefined => {
      const db = getDB();
      return db.gabaritos.find(g => g.questaoId === questaoId);
    },
    addGabarito: (data: { questaoId: string; respostaCorreta: Alternativa }) => {
      const db = getDB();
      let gabaritos = db.gabaritos;
      const existing = gabaritos.find(g => g.questaoId === data.questaoId);
      if (existing) {
        gabaritos = gabaritos.map(g => 
          g.questaoId === data.questaoId 
            ? { ...g, respostaCorreta: data.respostaCorreta } 
            : g
        );
      } else {
        const newGabarito: Gabarito = { id: generateId(), ...data };
        gabaritos.push(newGabarito);
      }
      db.gabaritos = gabaritos;
      saveDB(db);
    },

    // Scores for compatibility
    getScores: (): Score[] => getDB().scores,
    addScore: (data: { alunoId: string; questaoId: string; resposta: Alternativa }) => {
      const db = getDB();
      const newScore: Score = { 
        id: generateId(), 
        ...data, 
        date: new Date().toISOString() 
      };
      db.scores.push(newScore);
      saveDB(db);
      return newScore;
    }
  };
})();

export default dbService;