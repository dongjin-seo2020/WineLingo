'use client';
import { useState, useEffect, useCallback } from 'react';

export interface Progress {
  xp: number;
  streak: number;
  lastPlayedDate: string;
  completedLessons: string[];
  dailyCompletedDate: string;
  hearts: number;
}

const DEFAULT: Progress = {
  xp: 0,
  streak: 0,
  lastPlayedDate: '',
  completedLessons: [],
  dailyCompletedDate: '',
  hearts: 5,
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wine-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Progress;
        const today = todayStr();
        const yesterday = yesterdayStr();
        if (parsed.lastPlayedDate !== today && parsed.lastPlayedDate !== yesterday) {
          parsed.streak = 0;
        }
        setProgress(parsed);
      } catch {
        setProgress(DEFAULT);
      }
    }
    setLoaded(true);
  }, []);

  const save = useCallback((updated: Progress) => {
    localStorage.setItem('wine-progress', JSON.stringify(updated));
    setProgress(updated);
  }, []);

  const completeLesson = useCallback((lessonId: string, earnedXp: number) => {
    setProgress((prev) => {
      const today = todayStr();
      const yesterday = yesterdayStr();
      const isNewDay = prev.lastPlayedDate !== today;
      const newStreak = isNewDay
        ? prev.lastPlayedDate === yesterday ? prev.streak + 1 : 1
        : prev.streak;
      const updated: Progress = {
        ...prev,
        xp: prev.xp + earnedXp,
        streak: newStreak,
        lastPlayedDate: today,
        completedLessons: prev.completedLessons.includes(lessonId)
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
      };
      localStorage.setItem('wine-progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeDaily = useCallback((earnedXp: number) => {
    setProgress((prev) => {
      const today = todayStr();
      const yesterday = yesterdayStr();
      const isNewDay = prev.lastPlayedDate !== today;
      const newStreak = isNewDay
        ? prev.lastPlayedDate === yesterday ? prev.streak + 1 : 1
        : prev.streak;
      const updated: Progress = {
        ...prev,
        xp: prev.xp + earnedXp,
        streak: newStreak,
        lastPlayedDate: today,
        dailyCompletedDate: today,
      };
      localStorage.setItem('wine-progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loseHeart = useCallback(() => {
    setProgress((prev) => {
      const updated = { ...prev, hearts: Math.max(0, prev.hearts - 1) };
      localStorage.setItem('wine-progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isDailyCompleted = progress.dailyCompletedDate === todayStr();

  return { progress, loaded, completeLesson, completeDaily, loseHeart, isDailyCompleted };
}
