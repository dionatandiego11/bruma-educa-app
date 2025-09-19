// src/services/dbService.ts
import { supabase } from './supabaseClient'
import type {
  Escola, Serie, Turma, Professor, Aluno, Matricula,
  Provao, Questao, Gabarito, Score, Disciplina, Alternativa
} from '../types'

const dbService = {
  // ------------------ ESCOLAS ------------------
  async getEscolas(): Promise<Escola[]> {
    const { data, error } = await supabase.from('escolas').select('*')
    if (error) throw error
    return data
  },

  async addEscola(data: { nome: string }): Promise<Escola> {
    const { data: inserted, error } = await supabase
      .from('escolas')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ SERIES ------------------
  async getSeriesByEscola(escolaId: string): Promise<Serie[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('escola_id', escolaId)
    if (error) throw error
    return data
  },

  async addSerie(data: { nome: string; escolaId: string }): Promise<Serie> {
    const { data: inserted, error } = await supabase
      .from('series')
      .insert({ nome: data.nome, escola_id: data.escolaId })
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ TURMAS ------------------
  async getTurmasBySerie(serieId: string): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('serie_id', serieId)
    if (error) throw error
    return data
  },

  async addTurma(data: { nome: string; serieId: string; professorIds: string[] }): Promise<Turma> {
    // 1. Cria turma
    const { data: turma, error } = await supabase
      .from('turmas')
      .insert({ nome: data.nome, serie_id: data.serieId })
      .select()
      .single()
    if (error) throw error

    // 2. Liga professores à turma
    if (data.professorIds?.length > 0) {
      const rows = data.professorIds.map(profId => ({
        turma_id: turma.id,
        professor_id: profId,
      }))
      const { error: linkError } = await supabase.from('turmas_professores').insert(rows)
      if (linkError) throw linkError
    }

    return turma
  },

  async updateTurma(turmaId: string, updates: Partial<Turma>): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .update(updates)
      .eq('id', turmaId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ------------------ PROFESSORES ------------------
  async getProfessores(): Promise<Professor[]> {
    const { data, error } = await supabase.from('professores').select('*')
    if (error) throw error
    return data
  },

  async addProfessor(data: { nome: string }): Promise<Professor> {
    const { data: inserted, error } = await supabase
      .from('professores')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  async getProfessoresByTurma(turmaId: string): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .select('professores(*)')
      .eq('turma_id', turmaId)
    if (error) throw error
    return data.map(r => r.professores)
  },

  // ------------------ ALUNOS ------------------
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase.from('alunos').select('*')
    if (error) throw error
    return data
  },

  async addAluno(data: { nome: string; matricula: string }): Promise<Aluno> {
    const { data: inserted, error } = await supabase
      .from('alunos')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  async getAlunosByTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('alunos(*)')
      .eq('turma_id', turmaId)
    if (error) throw error
    return data.map(r => r.alunos)
  },

  async addMatricula(data: { alunoId: string; turmaId: string }): Promise<Matricula> {
    const { data: inserted, error } = await supabase
      .from('matriculas')
      .insert({ aluno_id: data.alunoId, turma_id: data.turmaId })
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ PROVÕES ------------------
  async getProvoesByTurma(turmaId: string): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .eq('turma_id', turmaId)
    if (error) throw error
    return data
  },

  async addProvao(data: { nome: string; turmaId: string }): Promise<Provao> {
    const { data: inserted, error } = await supabase
      .from('provoes')
      .insert({ nome: data.nome, turma_id: data.turmaId })
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ QUESTÕES ------------------
  async getQuestoesByProvao(provaoId: string): Promise<Questao[]> {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('provao_id', provaoId)
    if (error) throw error
    return data
  },

  async addQuestao(data: { provaoId: string; disciplina: Disciplina; descricao: string; habilidade_codigo: string }): Promise<Questao> {
    const { data: inserted, error } = await supabase
      .from('questoes')
      .insert({
        provao_id: data.provaoId,
        disciplina: data.disciplina,
        descricao: data.descricao,
        habilidade_codigo: data.habilidade_codigo,
      })
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ GABARITOS ------------------
  async getGabaritoByQuestao(questaoId: string): Promise<Gabarito | null> {
    const { data, error } = await supabase
      .from('gabaritos')
      .select('*')
      .eq('questao_id', questaoId)
      .single()
    if (error && error.code !== 'PGRST116') throw error // "row not found" é normal
    return data ?? null
  },

  async addGabarito(data: { questaoId: string; respostaCorreta: Alternativa }): Promise<Gabarito> {
    const { data: inserted, error } = await supabase
      .from('gabaritos')
      .upsert({
        questao_id: data.questaoId,
        resposta_correta: data.respostaCorreta,
      })
      .select()
      .single()
    if (error) throw error
    return inserted
  },

  // ------------------ SCORES ------------------
  async getScores(): Promise<Score[]> {
    const { data, error } = await supabase.from('scores').select('*')
    if (error) throw error
    return data
  },

  async addScore(data: { alunoId: string; questaoId: string; resposta: Alternativa }): Promise<Score> {
    const { data: inserted, error } = await supabase
      .from('scores')
      .insert({
        aluno_id: data.alunoId,
        questao_id: data.questaoId,
        resposta: data.resposta,
      })
      .select()
      .single()
    if (error) throw error
    return inserted
  },
}

export default dbService
