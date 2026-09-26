/**
 * AURA Project Data Store & Adapter
 *
 * Persists projects per authenticated user ID backed by ProjectService (Supabase DB).
 * Brand new accounts start strictly with ZERO projects and ZERO tasks.
 * No hardcoded demo projects or fake project progress.
 */

import { getCurrentUser } from './authService.js';
import { projectService } from './projectService.js';

const STORAGE_PREFIX = 'aura_user_projects_cache_v3_';

class ProjectStore {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${STORAGE_PREFIX}${id}`;
  }

  getProjects(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      return [];
    } catch {
      return [];
    }
  }

  saveProjects(userId, projects) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(projects));
    } catch (e) {
      console.warn('ProjectStore cache save notice:', e);
    }
  }

  getProjectById(userId, projectId) {
    const projects = this.getProjects(userId);
    return projects.find(p => p.id === projectId) || null;
  }

  async fetchProjects(userId) {
    const projs = await projectService.getProjects(userId);
    this.saveProjects(userId, projs);
    return projs;
  }

  async fetchProjectById(userId, projectId) {
    const proj = await projectService.getProjectById(userId, projectId);
    if (proj) {
      const current = this.getProjects(userId);
      const idx = current.findIndex(p => p.id === projectId);
      if (idx !== -1) current[idx] = proj;
      else current.unshift(proj);
      this.saveProjects(userId, current);
    }
    return proj;
  }

  createProject(userId, projectData) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);

    const cleanStatus = (projectData.status || 'Active');
    const newProject = {
      id: projectData.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: uId,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      source: projectData.source || 'manual',
      githubRepositoryId: projectData.githubRepositoryId || null,
      githubUrl: projectData.githubUrl || null,
      primaryLanguage: projectData.primaryLanguage || 'JavaScript',
      technologies: projectData.technologies || ['JavaScript'],
      status: cleanStatus,
      progress: projectData.progress ?? 0,
      priority: projectData.priority || 'Medium',
      deadline: projectData.deadline || null,
      notes: projectData.notes || '',
      tasks: projectData.tasks || [],
      milestones: projectData.milestones || [],
      architecture: projectData.architecture || {
        layers: ['Client', 'API', 'Data Store'],
        components: [
          { id: 'c1', name: 'Web Client', type: 'Frontend', layer: 'Client', technology: projectData.primaryLanguage || 'JavaScript', description: 'User interface' },
          { id: 'c2', name: 'Core Engine', type: 'Backend', layer: 'API', technology: 'REST / Node.js', description: 'API services' }
        ],
        connections: [{ from: 'c1', to: 'c2', label: 'HTTP / JSON' }]
      },
      activity: [
        { id: `act_${Date.now()}`, text: `Project "${projectData.name}" created in AURA`, timestamp: 'Just now' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.unshift(newProject);
    this.saveProjects(uId, projects);

    // Async persist to Supabase
    projectService.createProject(uId, projectData).catch(err => {
      console.warn('Async project creation sync notice:', err);
    });

    return newProject;
  }

  updateProject(userId, projectId, updates) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveProjects(uId, projects);
    projectService.updateProject(uId, projectId, updates).catch(() => {});
    return projects[index];
  }

  updateProjectStatus(userId, projectId, newStatus) {
    return this.updateProject(userId, projectId, { status: newStatus });
  }

  archiveProject(userId, projectId) {
    return this.updateProjectStatus(userId, projectId, 'Archived');
  }

  deleteProject(userId, projectId) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjects(uId, filtered);
    projectService.deleteProject(uId, projectId).catch(() => {});
    return true;
  }

  addTask(userId, projectId, taskData) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    if (!project.tasks) project.tasks = [];

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString()
    };

    project.tasks.push(newTask);
    this.saveProjects(uId, projects);
    projectService.addTask(uId, projectId, taskData).catch(() => {});
    return newTask;
  }

  updateTaskStatus(userId, projectId, taskId, newStatus) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks) return null;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = newStatus;
    if (newStatus === 'completed') task.completedAt = new Date().toISOString();

    // Recalculate dynamic progress from tasks
    const completedCount = project.tasks.filter(t => t.status === 'completed').length;
    project.progress = Math.round((completedCount / project.tasks.length) * 100);

    this.saveProjects(uId, projects);
    projectService.updateTaskStatus(uId, projectId, taskId, newStatus).catch(() => {});
    return task;
  }

  addArchitectureComponent(userId, projectId, compData) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    if (!project.architecture) {
      project.architecture = { layers: ['Client', 'API', 'Data Store'], components: [], connections: [] };
    }

    const newComp = {
      id: `comp_${Date.now()}`,
      name: compData.name || 'Component',
      type: compData.type || 'Service',
      layer: compData.layer || 'API',
      technology: compData.technology || 'Node.js',
      description: compData.description || ''
    };

    project.architecture.components.push(newComp);
    this.saveProjects(uId, projects);
    projectService.updateProject(uId, projectId, { architecture: project.architecture }).catch(() => {});
    return newComp;
  }

  addMilestone(userId, projectId, milestoneData) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const projects = this.getProjects(uId);
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    if (!project.milestones) project.milestones = [];
    const newMilestone = {
      id: `ms_${Date.now()}`,
      title: milestoneData.title || 'New Milestone',
      description: milestoneData.description || '',
      status: milestoneData.status || 'planned',
      targetDate: milestoneData.targetDate || null
    };

    project.milestones.push(newMilestone);
    this.saveProjects(uId, projects);
    return newMilestone;
  }
}

export const projectStore = new ProjectStore();
