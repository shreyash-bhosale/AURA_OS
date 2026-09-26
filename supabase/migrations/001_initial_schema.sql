-- =============================================================================
-- AURA OS — DATABASE SCHEMA & ROW LEVEL SECURITY
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USER PROFILES & SETTINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  roles TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  primary_priority TEXT,
  experience_levels JSONB DEFAULT '{}'::jsonb,
  organization_style TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  focus_duration INTEGER DEFAULT 25,
  working_time TEXT DEFAULT 'Flexible',
  personalization_enabled BOOLEAN DEFAULT true,
  ai_context_enabled BOOLEAN DEFAULT true,
  analytics_enabled BOOLEAN DEFAULT true,
  github_sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. LEARNING SYSTEM (CURRICULUM & PROGRESS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.learning_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_learning_subjects_updated_at
  BEFORE UPDATE ON public.learning_subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.learning_subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Foundations',
  difficulty TEXT DEFAULT 'Beginner',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_id, slug)
);

CREATE TRIGGER update_learning_topics_updated_at
  BEFORE UPDATE ON public.learning_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.learning_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  difficulty TEXT DEFAULT 'Beginner',
  options JSONB DEFAULT '[]'::jsonb,
  expected_answer TEXT NOT NULL,
  explanation TEXT,
  starter_code TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_learning_questions_updated_at
  BEFORE UPDATE ON public.learning_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TRIGGER update_user_topic_progress_updated_at
  BEFORE UPDATE ON public.user_topic_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.learning_questions(id) ON DELETE CASCADE,
  answer TEXT,
  correct BOOLEAN NOT NULL DEFAULT false,
  execution_result JSONB DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. PROJECTS & TASKS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('github', 'manual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium',
  deadline DATE,
  notes TEXT,
  github_repository_id TEXT,
  github_url TEXT,
  primary_language TEXT DEFAULT 'JavaScript',
  technologies TEXT[] DEFAULT '{}',
  progress NUMERIC DEFAULT 0,
  architecture JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ
);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'completed')),
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 4. GITHUB INTEGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_user_id TEXT,
  github_username TEXT NOT NULL,
  status TEXT DEFAULT 'connected',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_github_connections_updated_at
  BEFORE UPDATE ON public.github_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.github_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repository_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  primary_language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  private BOOLEAN DEFAULT false,
  last_updated_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, github_repository_id)
);

CREATE TRIGGER update_github_repositories_updated_at
  BEFORE UPDATE ON public.github_repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. CODING & SANDBOX SESSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.coding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'python',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. FOCUS SESSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  session_type TEXT DEFAULT 'focus',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 7. ANALYTICS (ACTIVITY EVENTS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 8. AI CONVERSATIONS & MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 9. PERFORMANCE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_learning_topics_subject_id ON public.learning_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_topic_id ON public.learning_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user ON public.user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic ON public.user_topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user ON public.question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question ON public.question_attempts(question_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_github_repo ON public.projects(github_repository_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user_id ON public.project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_user_id ON public.project_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON public.project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON public.project_activity(user_id);

CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON public.github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_user_id ON public.github_repositories(user_id);

CREATE INDEX IF NOT EXISTS idx_coding_sessions_user_id ON public.coding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON public.code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON public.activity_events(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Shared Curriculum: Public read-only for authenticated & anon
CREATE POLICY "Public read learning_subjects" ON public.learning_subjects FOR SELECT USING (true);
CREATE POLICY "Public read learning_topics" ON public.learning_topics FOR SELECT USING (true);
CREATE POLICY "Public read learning_questions" ON public.learning_questions FOR SELECT USING (true);

-- Private User-Owned: profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: user_topic_progress
CREATE POLICY "user_topic_progress_select_own" ON public.user_topic_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_topic_progress_insert_own" ON public.user_topic_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_topic_progress_update_own" ON public.user_topic_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_topic_progress_delete_own" ON public.user_topic_progress FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: question_attempts
CREATE POLICY "question_attempts_select_own" ON public.question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "question_attempts_insert_own" ON public.question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_attempts_update_own" ON public.question_attempts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_attempts_delete_own" ON public.question_attempts FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: projects
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: project_tasks
CREATE POLICY "project_tasks_select_own" ON public.project_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "project_tasks_insert_own" ON public.project_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_tasks_update_own" ON public.project_tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_tasks_delete_own" ON public.project_tasks FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: project_milestones
CREATE POLICY "project_milestones_select_own" ON public.project_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "project_milestones_insert_own" ON public.project_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_milestones_update_own" ON public.project_milestones FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_milestones_delete_own" ON public.project_milestones FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: project_activity
CREATE POLICY "project_activity_select_own" ON public.project_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "project_activity_insert_own" ON public.project_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_activity_update_own" ON public.project_activity FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_activity_delete_own" ON public.project_activity FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: github_connections
CREATE POLICY "github_connections_select_own" ON public.github_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "github_connections_insert_own" ON public.github_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "github_connections_update_own" ON public.github_connections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "github_connections_delete_own" ON public.github_connections FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: github_repositories
CREATE POLICY "github_repositories_select_own" ON public.github_repositories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "github_repositories_insert_own" ON public.github_repositories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "github_repositories_update_own" ON public.github_repositories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "github_repositories_delete_own" ON public.github_repositories FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: coding_sessions
CREATE POLICY "coding_sessions_select_own" ON public.coding_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coding_sessions_insert_own" ON public.coding_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coding_sessions_update_own" ON public.coding_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coding_sessions_delete_own" ON public.coding_sessions FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: code_snippets
CREATE POLICY "code_snippets_select_own" ON public.code_snippets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "code_snippets_insert_own" ON public.code_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "code_snippets_update_own" ON public.code_snippets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "code_snippets_delete_own" ON public.code_snippets FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: focus_sessions
CREATE POLICY "focus_sessions_select_own" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "focus_sessions_insert_own" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "focus_sessions_update_own" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "focus_sessions_delete_own" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: activity_events
CREATE POLICY "activity_events_select_own" ON public.activity_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_events_insert_own" ON public.activity_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_events_update_own" ON public.activity_events FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_events_delete_own" ON public.activity_events FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: conversations
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversations_update_own" ON public.conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversations_delete_own" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Private User-Owned: messages
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_delete_own" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 11. AUTOMATIC PROFILE & SETTINGS CREATION TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Record initial activity
  INSERT INTO public.activity_events (user_id, event_type, metadata)
  VALUES (NEW.id, 'ACCOUNT_CREATED', jsonb_build_object('email', NEW.email))
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
