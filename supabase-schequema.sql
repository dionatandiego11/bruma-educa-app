-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- This schema was used to build the database in supabase.  

CREATE TABLE public.alunos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  matricula character varying NOT NULL UNIQUE,
  data_nascimento date,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT alunos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.escolas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT escolas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gabaritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  questao_id uuid NOT NULL UNIQUE,
  resposta_correta character NOT NULL CHECK (resposta_correta = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT gabaritos_pkey PRIMARY KEY (id),
  CONSTRAINT gabaritos_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id)
);
CREATE TABLE public.matriculas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  turma_id uuid NOT NULL,
  data_matricula timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT matriculas_pkey PRIMARY KEY (id),
  CONSTRAINT matriculas_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
  CONSTRAINT matriculas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
);
CREATE TABLE public.professores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  email character varying UNIQUE,
  telefone character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT professores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.provoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  data date DEFAULT CURRENT_DATE,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT provoes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.questoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provao_id uuid NOT NULL,
  disciplina character varying NOT NULL CHECK (disciplina::text = ANY (ARRAY['Português'::character varying, 'Matemática'::character varying]::text[])),
  descricao text NOT NULL,
  habilidade_codigo character varying NOT NULL,
  ordem integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT questoes_pkey PRIMARY KEY (id),
  CONSTRAINT questoes_provao_id_fkey FOREIGN KEY (provao_id) REFERENCES public.provoes(id)
);
CREATE TABLE public.scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  questao_id uuid NOT NULL,
  resposta character NOT NULL CHECK (resposta = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])),
  date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT scores_pkey PRIMARY KEY (id),
  CONSTRAINT scores_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
  CONSTRAINT scores_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id)
);
CREATE TABLE public.series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  escola_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT series_pkey PRIMARY KEY (id),
  CONSTRAINT series_escola_id_fkey FOREIGN KEY (escola_id) REFERENCES public.escolas(id)
);
CREATE TABLE public.turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  serie_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT turmas_pkey PRIMARY KEY (id),
  CONSTRAINT turmas_serie_id_fkey FOREIGN KEY (serie_id) REFERENCES public.series(id)
);
CREATE TABLE public.turmas_professores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL,
  professor_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT turmas_professores_pkey PRIMARY KEY (id),
  CONSTRAINT turmas_professores_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id),
  CONSTRAINT turmas_professores_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id)
);
CREATE TABLE public.provoes_turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provao_id uuid NOT NULL,
  turma_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT provoes_turmas_pkey PRIMARY KEY (id),
  CONSTRAINT provoes_turmas_provao_id_fkey FOREIGN KEY (provao_id) REFERENCES public.provoes(id),
  CONSTRAINT provoes_turmas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
);