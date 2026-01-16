import { useState, useCallback, useEffect } from "react";
import { FilterState } from "@/Store/contexts/DashboardDataContext";

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  isDefault: boolean;
  createdAt: string;
}

const STORAGE_KEY = "dashboard_saved_filters";

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load saved filters:", error);
    }
  }, []);

  // Persist to localStorage whenever savedFilters changes
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      setSavedFilters(filters);
    } catch (error) {
      console.error("Failed to save filters:", error);
    }
  }, []);

  const saveCurrentFilters = useCallback(
    (name: string, filters: FilterState) => {
      const newFilter: SavedFilter = {
        id: `filter_${Date.now()}`,
        name,
        filters: { ...filters },
        isDefault: savedFilters.length === 0, // First one is default
        createdAt: new Date().toISOString(),
      };
      persistFilters([...savedFilters, newFilter]);
      return newFilter;
    },
    [savedFilters, persistFilters]
  );

  const deleteFilter = useCallback(
    (id: string) => {
      const updated = savedFilters.filter((f) => f.id !== id);
      // If we deleted the default, make the first one default
      if (updated.length > 0 && !updated.some((f) => f.isDefault)) {
        updated[0].isDefault = true;
      }
      persistFilters(updated);
    },
    [savedFilters, persistFilters]
  );

  const setAsDefault = useCallback(
    (id: string) => {
      const updated = savedFilters.map((f) => ({
        ...f,
        isDefault: f.id === id,
      }));
      persistFilters(updated);
    },
    [savedFilters, persistFilters]
  );

  const renameFilter = useCallback(
    (id: string, newName: string) => {
      const updated = savedFilters.map((f) =>
        f.id === id ? { ...f, name: newName } : f
      );
      persistFilters(updated);
    },
    [savedFilters, persistFilters]
  );

  const getDefaultFilter = useCallback(() => {
    return savedFilters.find((f) => f.isDefault);
  }, [savedFilters]);

  return {
    savedFilters,
    saveCurrentFilters,
    deleteFilter,
    setAsDefault,
    renameFilter,
    getDefaultFilter,
  };
};
