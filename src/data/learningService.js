/**
 * AURA Learning Service & Question Engine
 * 
 * Powered by Supabase database tables:
 * - learning_subjects (shared curriculum)
 * - learning_topics (shared curriculum)
 * - learning_questions (shared questions)
 * - user_topic_progress (user-isolated completion states)
 * - question_attempts (user-isolated attempt logs)
 * 
 * STRICT RULES:
 * 1. Brand new users strictly start at 0% with 0 completed topics.
 * 2. Checkboxes are non-clickable shortcuts — completion requires correct answer.
 * 3. Progress is dynamically calculated: (completed / total) * 100.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';
import { PYTHON_FALLBACK_CURRICULUM, SUBJECTS_FALLBACK } from './curriculumData.js';

const FALLBACK_PROGRESS_KEY = 'aura_fallback_topic_progress_v3_';
const FALLBACK_ATTEMPTS_KEY = 'aura_fallback_question_attempts_v3_';

class LearningService {
  /**
   * Fetch all learning subjects (Python, DSA, ML, DL, GenAI, etc.)
   */
  async getSubjects() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('learning_subjects')
          .select('*')
          .order('order_index', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('LearningService getSubjects notice:', err.message);
      }
    }
    return SUBJECTS_FALLBACK;
  }

  /**
   * Fetch curriculum topics with questions for a subject.
   */
  async getTopics(subjectSlug = 'python') {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: subData } = await supabase
          .from('learning_subjects')
          .select('id')
          .eq('slug', subjectSlug)
          .maybeSingle();

        if (subData) {
          const { data: topics, error } = await supabase
            .from('learning_topics')
            .select(`
              id,
              name,
              slug,
              description,
              category,
              difficulty,
              order_index,
              learning_questions (
                id,
                question,
                question_type,
                difficulty,
                options,
                expected_answer,
                explanation,
                starter_code,
                test_cases
              )
            `)
            .eq('subject_id', subData.id)
            .order('order_index', { ascending: true });

          if (!error && topics && topics.length > 0) {
            return topics.map(t => ({
              id: t.id,
              slug: t.slug,
              title: t.name,
              category: t.category,
              difficulty: t.difficulty,
              summary: t.description,
              lesson: t.description,
              question: t.learning_questions?.[0] ? {
                id: t.learning_questions[0].id,
                type: t.learning_questions[0].question_type,
                prompt: t.learning_questions[0].question,
                options: t.learning_questions[0].options || [],
                correctIndex: parseInt(t.learning_questions[0].expected_answer, 10),
                explanation: t.learning_questions[0].explanation
              } : null
            }));
          }
        }
      } catch (err) {
        console.warn('LearningService getTopics notice:', err.message);
      }
    }

    if (subjectSlug === 'python') {
      return PYTHON_FALLBACK_CURRICULUM;
    }
    return [];
  }

  /**
   * Retrieve dynamic subject progress for a user.
   * If user has 0 completed topics, percentage is strictly 0%.
   */
  async getSubjectProgress(userId, subjectSlug = 'python') {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    const topics = await this.getTopics(subjectSlug);
    const totalCount = topics.length;

    if (!targetUserId) {
      return {
        percentage: 0,
        completedCount: 0,
        totalCount,
        completedTopicIds: [],
        attempts: {}
      };
    }

    // 1. Supabase Database Source
    if (isSupabaseConfigured() && supabase) {
      try {
        const topicIds = topics.map(t => t.id);
        const { data: progressRows, error } = await supabase
          .from('user_topic_progress')
          .select('*')
          .eq('user_id', targetUserId)
          .in('topic_id', topicIds);

        if (!error && progressRows) {
          const completedRows = progressRows.filter(r => r.completed);
          const completedCount = completedRows.length;
          const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const completedTopicIds = completedRows.map(r => r.topic_id);
          const attemptsMap = {};
          progressRows.forEach(r => {
            attemptsMap[r.topic_id] = {
              attempts: r.attempts || 0,
              correctAttempts: r.correct_attempts || 0,
              passed: r.completed
            };
          });

          return {
            percentage,
            completedCount,
            totalCount,
            completedTopicIds,
            attempts: attemptsMap
          };
        }
      } catch (err) {
        console.warn('LearningService getSubjectProgress notice:', err.message);
      }
    }

    // 2. Fallback Mode (User-isolated in localStorage)
    try {
      const raw = localStorage.getItem(`${FALLBACK_PROGRESS_KEY}${targetUserId}`);
      const data = raw ? JSON.parse(raw) : { completedTopicIds: [], attempts: {} };
      const completed = (data.completedTopicIds || []).filter(id => topics.some(t => t.id === id || t.slug === id));
      const completedCount = completed.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        percentage,
        completedCount,
        totalCount,
        completedTopicIds: completed,
        attempts: data.attempts || {}
      };
    } catch {
      return {
        percentage: 0,
        completedCount: 0,
        totalCount,
        completedTopicIds: [],
        attempts: {}
      };
    }
  }

  /**
   * Submit an answer to a topic question.
   * Evaluates correctness, updates user_topic_progress, logs to question_attempts,
   * emits analytics events, and recalculates progress.
   */
  async submitAnswer(userId, topicIdentifier, selectedOptionIndex) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return { error: 'Please sign in to submit answers and record progress.' };
    }

    const topics = await this.getTopics('python');
    const topic = topics.find(t => t.id === topicIdentifier || t.slug === topicIdentifier);
    if (!topic || !topic.question) {
      return { error: 'Topic question not found.' };
    }

    const isCorrect = selectedOptionIndex === topic.question.correctIndex;
    let newlyCompleted = false;

    // 1. Supabase Database Save
    if (isSupabaseConfigured() && supabase) {
      try {
        // Record Question Attempt
        if (topic.question.id) {
          await supabase.from('question_attempts').insert({
            user_id: targetUserId,
            question_id: topic.question.id,
            answer: String(selectedOptionIndex),
            correct: isCorrect,
            attempted_at: new Date().toISOString()
          });
        }

        // Fetch current user_topic_progress
        const { data: existing } = await supabase
          .from('user_topic_progress')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('topic_id', topic.id)
          .maybeSingle();

        const wasCompleted = existing?.completed || false;
        const willBeCompleted = wasCompleted || isCorrect;
        newlyCompleted = !wasCompleted && isCorrect;

        await supabase.from('user_topic_progress').upsert({
          user_id: targetUserId,
          topic_id: topic.id,
          completed: willBeCompleted,
          attempts: (existing?.attempts || 0) + 1,
          correct_attempts: (existing?.correct_attempts || 0) + (isCorrect ? 1 : 0),
          last_attempt_at: new Date().toISOString(),
          completed_at: willBeCompleted && !wasCompleted ? new Date().toISOString() : existing?.completed_at,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,topic_id' });

      } catch (err) {
        console.warn('LearningService DB submit notice:', err.message);
      }
    }

    // 2. Sync Local Fallback Store
    try {
      const key = `${FALLBACK_PROGRESS_KEY}${targetUserId}`;
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : { completedTopicIds: [], attempts: {} };

      if (!data.attempts[topic.id]) {
        data.attempts[topic.id] = { attempts: 0, passed: false };
      }
      data.attempts[topic.id].attempts += 1;
      if (isCorrect) {
        data.attempts[topic.id].passed = true;
        if (!data.completedTopicIds.includes(topic.id)) {
          data.completedTopicIds.push(topic.id);
          newlyCompleted = true;
        }
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}

    // 3. Track Telemetry Event
    if (isCorrect) {
      analyticsService.track(targetUserId, 'QUESTION_SOLVED', { topicId: topic.id, title: topic.title });
      if (newlyCompleted) {
        analyticsService.track(targetUserId, 'LEARNING_TOPIC_COMPLETED', { topicId: topic.id, title: topic.title });
      }
    } else {
      analyticsService.track(targetUserId, 'QUESTION_ATTEMPTED', { topicId: topic.id, title: topic.title, isCorrect: false });
    }

    // Calculate fresh progress
    const progress = await this.getSubjectProgress(targetUserId, 'python');

    return {
      isCorrect,
      explanation: topic.question.explanation,
      correctIndex: topic.question.correctIndex,
      newlyCompleted,
      progress
    };
  }
}

export const learningService = new LearningService();
