'use client';
import { useState, useEffect, useCallback } from 'react';

export interface CellarEntry {
  id: string;
  name: string;
  producer: string;
  region: string;
  country: string;
  grape: string;
  vintage: number | null;
  type: 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert' | 'orange';
  rating: number; // 1-5
  notes: string;
  imageBase64?: string;
  dateAdded: string;
}

const KEY = 'wine-cellar';

export function useCellar() {
  const [entries, setEntries] = useState<CellarEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const save = useCallback((updated: CellarEntry[]) => {
    localStorage.setItem(KEY, JSON.stringify(updated));
    setEntries(updated);
  }, []);

  const addEntry = useCallback(
    (entry: Omit<CellarEntry, 'id' | 'dateAdded'>) => {
      const newEntry: CellarEntry = {
        ...entry,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      };
      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
      });
      return newEntry;
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<CellarEntry>) => {
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { entries, loaded, addEntry, deleteEntry, updateEntry };
}
