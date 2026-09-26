/**
 * AURA Project Service
 * 
 * Manages user projects, tasks, milestones, and activity with Supabase DB.
 * Uses Row Level Security (RLS) so every user has complete isolation.
 * 
 * Brand new accounts start strictly with ZERO projects and ZERO tasks.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const FALLBACK_PROJECTS_KEY = 'aura_fallback_projects_v3_';

class ProjectService {
  getFallbackKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${FALLBACK_PROJECTS_KEY}${id}`;
  }

  getFallbackProjects(userId) {
    try {
      const raw = localStorage.getItem(this.getFallbackKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveFallbackProjects(userId, projects) {
    try {
      localStorage.setItem(this.getFallbackKey(userId), JSON.stringify(projects));
    } catch (e) {
      console.warn('Fallback save projects notice:', e);
    }
  }

  /**
   * Fetch all projects for a user.
   * New user starts with empty array [].
   */
  async getProjects(userId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: projs, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_tasks (*),
            project_milestones (*),
            project_activity (*)
          `)
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (!error && projs) {
          return projs.map(p => this.formatProjectFromDb(p));
        }
      } catch (err) {
        console.warn('ProjectService getProjects notice:', err.message);
      }
    }

    return this.getFallbackProjects(targetUserId);
  }

  formatProjectFromDb(p) {
    const tasks = (p.project_tasks || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority || 'medium',
      dueDate: t.due_date || null,
      completedAt: t.completed_at
    }));

    // Dynamic progress calculation from tasks if available
    let progress = Number(p.progress || 0);
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      progress = Math.round((completedTasks / tasks.length) * 100);
    }

    const milestones = (p.project_milestones || []).map(m => ({
      id: m.id,
      title: m.title,
      description: m.description || '',
      status: m.status || 'planned',
      targetDate: m.target_date || null,
      completedAt: m.completed_at
    }));

    const activity = (p.project_activity || []).map(a => ({
      id: a.id,
      text: a.metadata?.text || a.activity_type,
      timestamp: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recently'
    }));

    return {
      id: p.id,
      userId: p.user_id,
      name: p.name,
      description: p.description || '',
      source: p.source || 'manual',
      status: p.status, // 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
      priority: p.priority || 'medium',
      deadline: p.deadline || null,
      notes: p.notes || '',
      githubRepositoryId: p.github_repository_id || null,
      githubUrl: p.github_url || null,
      primaryLanguage: p.primary_language || 'JavaScript',
      technologies: p.technologies || ['JavaScript'],
      progress,
      architecture: p.architecture || {
        layers: ['Client', 'API', 'Data Store'],
        components: [
          { id: 'c1', name: 'Web Client', type: 'Frontend', layer: 'Client', technology: p.primary_language || 'JavaScript', description: 'User interface' },
          { id: 'c2', name: 'Core Engine', type: 'Backend', layer: 'API', technology: 'REST / Node.js', description: 'API services' }
        ],
        connections: [{ from: 'c1', to: 'c2', label: 'HTTP / JSON' }]
      },
      tasks,
      milestones,
      activity,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      lastSyncedAt: p.last_synced_at
    };
  }

  async getProjectById(userId, projectId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !projectId) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_tasks (*),
            project_milestones (*),
            project_activity (*)
          `)
          .eq('id', projectId)
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (!error && data) {
          return this.formatProjectFromDb(data);
        }
      } catch (err) {
        console.warn('ProjectService getProjectById notice:', err.message);
      }
    }

    const projects = this.getFallbackProjects(targetUserId);
    return projects.find(p => p.id === projectId) || null;
  }

  async createProject(userId, projectData) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const cleanStatus = (projectData.status || 'active').toLowerCase().replace(' ', '_');
    const allowedStatuses = ['planning', 'active', 'on_hold', 'completed', 'archived'];
    const validStatus = allowedStatuses.includes(cleanStatus) ? cleanStatus : 'active';

    const cleanSource = (projectData.source || 'manual').toLowerCase() === 'github' ? 'github' : 'manual';

    const dbPayload = {
      user_id: targetUserId,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      source: cleanSource,
      status: validStatus,
      priority: (projectData.priority || 'medium').toLowerCase(),
      deadline: projectData.deadline || null,
      notes: projectData.notes || '',
      github_repository_id: projectData.githubRepositoryId || null,
      github_url: projectData.githubUrl || null,
      primary_language: projectData.primaryLanguage || 'JavaScript',
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [projectData.primaryLanguage || 'JavaScript'],
      progress: projectData.progress ?? 0,
      architecture: projectData.architecture || {
        layers: ['Client', 'API', 'Data Store'],
        components: [
          { id: 'c1', name: 'Web Client', type: 'Frontend', layer: 'Client', technology: projectData.primaryLanguage || 'JavaScript', description: 'User interface' },
          { id: 'c2', name: 'Core Engine', type: 'Backend', layer: 'API', technology: 'REST / Node.js', description: 'API services' }
        ],
        connections: [{ from: 'c1', to: 'c2', label: 'HTTP / JSON' }]
      }
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: created, error } = await supabase
          .from('projects')
          .insert(dbPayload)
          .select()
          .single();

        if (error) throw error;

        // Log project created activity
        await supabase.from('project_activity').insert({
          project_id: created.id,
          user_id: targetUserId,
          activity_type: 'project_created',
          metadata: { text: `Project "${created.name}" created in AURA` }
        });

        // Also track telemetry
        analyticsService.track(targetUserId, 'PROJECT_CREATED', {
          projectId: created.id,
          name: created.name,
          source: cleanSource
        });

        return this.formatProjectFromDb(created);
      } catch (err) {
        console.warn('ProjectService DB create notice:', err.message);
      }
    }

    // Fallback store
    const fallbackProjects = this.getFallbackProjects(targetUserId);
    const newProj = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: targetUserId,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      source: cleanSource,
      status: validStatus,
      priority: projectData.priority || 'medium',
      deadline: projectData.deadline || null,
      notes: projectData.notes || '',
      githubRepositoryId: projectData.githubRepositoryId || null,
      githubUrl: projectData.githubUrl || null,
      primaryLanguage: projectData.primaryLanguage || 'JavaScript',
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [projectData.primaryLanguage || 'JavaScript'],
      progress: projectData.progress ?? 0,
      tasks: [],
      milestones: [],
      activity: [
        { id: `act_${Date.now()}`, text: `Project "${projectData.name}" created`, timestamp: 'Just now' }
      ],
      architecture: dbPayload.architecture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fallbackProjects.unshift(newProj);
    this.saveFallbackProjects(targetUserId, fallbackProjects);
    analyticsService.track(targetUserId, 'PROJECT_CREATED', { projectId: newProj.id, name: newProj.name });
    return newProj;
  }

  async updateProject(userId, projectId, updates) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !projectId) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.status !== undefined) payload.status = updates.status.toLowerCase().replace(' ', '_');
        if (updates.priority !== undefined) payload.priority = updates.priority.toLowerCase();
        if (updates.deadline !== undefined) payload.deadline = updates.deadline;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.progress !== undefined) payload.progress = updates.progress;
        if (updates.primaryLanguage !== undefined) payload.primary_language = updates.primaryLanguage;
        if (updates.technologies !== undefined) payload.technologies = updates.technologies;
        if (updates.architecture !== undefined) payload.architecture = updates.architecture;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', projectId)
          .eq('user_id', targetUserId)
          .select()
          .single();

        if (!error && data) {
          analyticsService.track(targetUserId, 'PROJECT_UPDATED', { projectId, updates: Object.keys(payload) });
          return this.formatProjectFromDb(data);
        }
      } catch (err) {
        console.warn('ProjectService DB update notice:', err.message);
      }
    }

    const projects = this.getFallbackProjects(targetUserId);
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveFallbackProjects(targetUserId, projects);
      return projects[idx];
    }
    return null;
  }

  async archiveProject(userId, projectId) {
    return this.updateProject(userId, projectId, { status: 'archived' });
  }

  async deleteProject(userId, projectId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !projectId) return false;

    // IMPORTANT: Deleting AURA project NEVER deletes the external GitHub repository.
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', targetUserId);

        if (!error) {
          analyticsService.track(targetUserId, 'PROJECT_DELETED', { projectId });
          return true;
        }
      } catch (err) {
        console.warn('ProjectService DB delete notice:', err.message);
      }
    }

    const projects = this.getFallbackProjects(targetUserId);
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveFallbackProjects(targetUserId, filtered);
    return true;
  }

  async addTask(userId, projectId, taskData) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !projectId) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: task, error } = await supabase
          .from('project_tasks')
          .insert({
            project_id: projectId,
            user_id: targetUserId,
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            due_date: taskData.dueDate || null
          })
          .select()
          .single();

        if (!error && task) {
          await supabase.from('project_activity').insert({
            project_id: projectId,
            user_id: targetUserId,
            activity_type: 'task_created',
            metadata: { text: `Task added: "${task.title}"` }
          });
          analyticsService.track(targetUserId, 'TASK_CREATED', { projectId, taskTitle: task.title });
          return task;
        }
      } catch (err) {
        console.warn('ProjectService DB addTask notice:', err.message);
      }
    }

    const projects = this.getFallbackProjects(targetUserId);
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.tasks) proj.tasks = [];
      const newTask = {
        id: `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null
      };
      proj.tasks.push(newTask);
      this.saveFallbackProjects(targetUserId, projects);
      return newTask;
    }
    return null;
  }

  async updateTaskStatus(userId, projectId, taskId, newStatus) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !taskId) return null;

    const isCompleted = newStatus === 'completed';

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .update({
            status: newStatus,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .eq('user_id', targetUserId)
          .select()
          .single();

        if (!error && data) {
          if (isCompleted) {
            analyticsService.track(targetUserId, 'TASK_COMPLETED', { projectId, taskId });
          }
          return data;
        }
      } catch (err) {
        console.warn('ProjectService DB updateTaskStatus notice:', err.message);
      }
    }

    const projects = this.getFallbackProjects(targetUserId);
    const proj = projects.find(p => p.id === projectId);
    if (proj && proj.tasks) {
      const task = proj.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        if (isCompleted) task.completedAt = new Date().toISOString();
        this.saveFallbackProjects(targetUserId, projects);
        return task;
      }
    }
    return null;
  }

  computeStats(projects = []) {
    const active = projects.filter(p => p.status === 'active' || p.status === 'Active').length;
    const completed = projects.filter(p => p.status === 'completed' || p.status === 'Completed').length;
    let totalTasks = 0;
    let completedTasks = 0;

    projects.forEach(p => {
      (p.tasks || []).forEach(t => {
        totalTasks++;
        if (t.status === 'completed') completedTasks++;
      });
    });

    const averageCompletion = projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / projects.length)
      : 0;

    return {
      active,
      completed,
      tasksTracked: totalTasks,
      completedTasks,
      averageCompletion
    };
  }
}

export const projectService = new ProjectService();
