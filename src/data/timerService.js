/**
 * AURA Timer Service
 * Configurable focus timer supporting quick presets (15, 25, 30, 45, 60, 90, 120m),
 * custom hours/minutes, real-time adjustments (+5m/-5m), and persistence across navigation.
 */

import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const TIMER_STORAGE_KEY = 'aura_timer_state_v2';

export const TIMER_PRESETS = [15, 25, 30, 45, 60, 90, 120];

class TimerService {
  constructor() {
    this.listeners = new Set();
    this.intervalId = null;
    this.state = this.loadState();

    // Check if background timer was running
    if (this.state.isRunning && this.state.targetEndTime) {
      const now = Date.now();
      const remainingMs = this.state.targetEndTime - now;
      if (remainingMs > 0) {
        this.state.remainingSeconds = Math.round(remainingMs / 1000);
        this.startTick();
      } else {
        this.state.remainingSeconds = 0;
        this.state.isRunning = false;
        this.saveState();
      }
    }
  }

  loadState() {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      isRunning: false,
      targetEndTime: null,
      mode: 'preset' // 'preset' | 'custom'
    };
  }

  saveState() {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist timer state:', e);
    }
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const s = this.getState();
    this.listeners.forEach(fn => fn(s));
  }

  setPreset(minutes) {
    this.pause();
    this.state.durationMinutes = minutes;
    this.state.remainingSeconds = minutes * 60;
    this.state.mode = 'preset';
    this.state.targetEndTime = null;
    this.saveState();
  }

  setCustomTime(hours, minutes) {
    this.pause();
    const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
    const validMins = Math.max(1, totalMinutes);
    this.state.durationMinutes = validMins;
    this.state.remainingSeconds = validMins * 60;
    this.state.mode = 'custom';
    this.state.targetEndTime = null;
    this.saveState();
  }

  start() {
    if (this.state.remainingSeconds <= 0) {
      this.state.remainingSeconds = this.state.durationMinutes * 60;
    }
    this.state.isRunning = true;
    this.state.targetEndTime = Date.now() + this.state.remainingSeconds * 1000;
    this.saveState();
    this.startTick();
  }

  pause() {
    this.state.isRunning = false;
    this.state.targetEndTime = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.saveState();
  }

  reset() {
    this.pause();
    this.state.remainingSeconds = this.state.durationMinutes * 60;
    this.state.targetEndTime = null;
    this.saveState();
  }

  addMinutes(mins = 5) {
    const addSecs = mins * 60;
    this.state.remainingSeconds += addSecs;
    if (this.state.isRunning) {
      this.state.targetEndTime += addSecs * 1000;
    }
    this.saveState();
  }

  removeMinutes(mins = 5) {
    const subSecs = mins * 60;
    this.state.remainingSeconds = Math.max(10, this.state.remainingSeconds - subSecs);
    if (this.state.isRunning) {
      this.state.targetEndTime = Date.now() + this.state.remainingSeconds * 1000;
    }
    this.saveState();
  }

  startTick() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.state.remainingSeconds > 0) {
        this.state.remainingSeconds--;
        this.saveState();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  completeSession() {
    this.pause();
    this.state.remainingSeconds = 0;
    this.saveState();

    const user = getCurrentUser();
    const uId = user?.id || 'anonymous';
    analyticsService.track(uId, 'FOCUS_SESSION_COMPLETED', {
      durationMinutes: this.state.durationMinutes,
      mode: this.state.mode
    });
  }

  formatTime(seconds = this.state.remainingSeconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }
}

export const timerService = new TimerService();
