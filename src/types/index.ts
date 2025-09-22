// src/types/index.ts - Corrigido para compatibilidade

export type Disciplina = 'Português' | 'Matemática';
export type Alternativa = 'A' | 'B' | 'C' | 'D';

// Interface base com campos comuns
interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Entidades principais
export interface Escola extends BaseEntity {
  nome: string;
  codigo_id: string;
}

export interface Serie extends BaseEntity {
  nome: string;
  escola_id: string;
  escola: Escola; // Para quando incluir relação
}

export interface Turma extends BaseEntity {
  nome: string;
  serie_id: string;
  serie: Serie; // Para quando incluir relação
}

export interface Professor extends BaseEntity {
  nome: string;
}

export interface Aluno extends BaseEntity {
  nome: string;
  matricula: string;
}

export interface Provao extends BaseEntity {
  nome: string;
  turma_id: string;
  professor_id: string;
  turma: Turma; 
}

export interface Questao extends BaseEntity {
  provao_id: string;
  disciplina: Disciplina;
  habilidade_codigo: string;
  provao: Provao; // Para quando incluir relação
}

// Tabelas de relacionamento
export interface Gabarito extends BaseEntity {
  questao_id: string;
  resposta_correta: Alternativa;
  questao?: Questao; // Para quando incluir relação
}

export interface Matricula extends BaseEntity {
  aluno_id: string;
  turma_id: string;
  ativo?: boolean;
  aluno?: Aluno; // Para quando incluir relação
  turma?: Turma; // Para quando incluir relação
}

export interface TurmaProfessor extends BaseEntity {
  turma_id: string;
  turma?: Turma; // Para quando incluir relação
  professor?: Professor; // Para quando incluir relação
}

export interface Score extends BaseEntity {
  aluno_id: string;
  questao_id: string;
  resposta: Alternativa;=
  aluno?: Aluno; // Para quando incluir relação
  questao?: Questao; // Para quando incluir relação
}

// Tipos para formulários e DTOs - Corrigidos para compatibilidade
export interface CreateEscolaDTO {
  nome: string;
}

export interface CreateSerieDTO {
  nome: string;
  escolaId: string; // Corrigido para match com AdminPage
}

export interface CreateTurmaDTO {
  nome: string;
  serieId: string; // Corrigido para match com AdminPage
  professorIds?: string[]; 
}

export interface CreateProfessorDTO {
  nome: string;
}

export interface CreateAlunoDTO {
  nome: string;
  matricula: string;
}

export interface CreateProvaoDTO {
  nome: string;
  turmaId: string; // Corrigido para match com AdminPage
}

export interface CreateQuestaoDTO {
  provaoId: string; // Corrigido para match com AdminPage
  disciplina: Disciplina;
  descricao: string;
  habilidade_codigo: string;
  ordem?: string;
}

export interface CreateGabaritoDTO {
  questaoId: string; // Corrigido para match com AdminPage
  respostaCorreta: Alternativa; // Corrigido para match com AdminPage
}

export interface CreateMatriculaDTO {
  alunoId: string; // Corrigido para match com AdminPage
  turmaId: string; // Corrigido para match com AdminPage
  data_matricula?: string;
  ativo?: boolean;
}

export interface CreateScoreDTO {
  alunoId: string; // Corrigido para match com InsertDataPage
  questaoId: string; // Corrigido para match com InsertDataPage
  resposta: Alternativa;
  date?: string;
}

// Tipos para respostas com relacionamentos
export interface TurmaComDetalhes extends Turma {
  serie: Serie & { escola: Escola };
  matriculas: Array<{ aluno: Aluno }>;
  turmas_professores: Array<{ professor: Professor }>;
  provoes: Provao[];
}

export interface ProvaoComQuestoes extends Provao {
  questoes: Array<Questao & { gabarito?: Gabarito }>;
}

// Tipos para estatísticas e relatórios - Corrigidos
export interface EstatisticasAluno {
  aluno: Aluno;
  total_questoes: number;
  questoes_corretas: number;
  percentual_acerto: number;
  por_disciplina: {
    disciplina: Disciplina;
    total: number;
    corretas: number;
    percentual: number;
  }[];
}

// Corrigido para match com dbService
export interface EstatisticasTurma {
  turma: Turma;
  total_alunos: number;
  media_geral: number; 
  por_provao: {
    provao: Provao;
    media: number;
    participantes: number;
  }[];
}

// Enums para status e validações
export enum StatusMatricula {
  ATIVA = 'ativa',
  INATIVA = 'inativa',
  TRANSFERIDA = 'transferida'
}

export enum TipoUsuario {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  ALUNO = 'aluno'
}

// Tipos de erro customizados
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}