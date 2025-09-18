// src/types/index.ts

export type Disciplina = 'Português' | 'Matemática';
export type Alternativa = 'A' | 'B' | 'C' | 'D';

export interface Escola {
  id: string;
  nome: string;
}

export interface Serie {
  id: string;
  nome: string;
  escolaId: string;
}

export interface Turma {
  id: string;
  nome: string;
  serieId: string;
  professorIds: string[];
}

export interface Professor {
  id: string;
  nome: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
}

export interface Provao {
  id: string;
  nome: string;
  turmaId: string;
  data: string;
}

export interface Questao {
  id: string;
  provaoId: string;
  disciplina: Disciplina;
  descricao: string;
  habilidade_codigo: string;
}

export interface Gabarito {
  id: string;
  questaoId: string;
  respostaCorreta: Alternativa;
}

export interface Matricula {
  id: string;
  alunoId: string;
  turmaId: string;
}

export interface Score {
  id: string;
  alunoId: string;
  questaoId: string;
  resposta: Alternativa;
  date: string;
}