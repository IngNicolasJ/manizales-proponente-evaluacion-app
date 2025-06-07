
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ProcessData, Proponent } from '@/types';

interface AppStore extends AppState {
  setProcessData: (data: ProcessData) => void;
  addProponent: (proponent: Proponent) => void;
  updateProponent: (id: string, updates: Partial<Proponent>) => void;
  deleteProponent: (id: string) => void;
  setCurrentStep: (step: number) => void;
  resetProcess: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      processData: null,
      proponents: [],
      currentStep: 1,
      
      setProcessData: (data) => set({ processData: data }),
      
      addProponent: (proponent) => 
        set((state) => ({ 
          proponents: [...state.proponents, proponent]
        })),
      
      updateProponent: (id, updates) =>
        set((state) => ({
          proponents: state.proponents.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),
      
      deleteProponent: (id) =>
        set((state) => ({
          proponents: state.proponents.filter((p) => p.id !== id)
        })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      resetProcess: () => set({
        processData: null,
        proponents: [],
        currentStep: 1
      })
    }),
    {
      name: 'alcaldia-evaluation-storage'
    }
  )
);
