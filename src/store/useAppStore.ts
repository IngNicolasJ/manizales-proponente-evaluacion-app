
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
  getProponentsForCurrentProcess: () => Proponent[];
  setProponents: (proponents: Proponent[]) => void;
  clearProponents: () => void; // Nueva función para limpiar proponentes
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      processData: null,
      proponents: [],
      currentStep: 1,
      
      setProcessData: (data) => {
        console.log('🔄 Setting process data in store:', data);
        
        // CRÍTICO: Limpiar proponentes al cambiar de proceso
        const currentProcessId = localStorage.getItem('current_process_id');
        console.log('🔄 Process changed, clearing existing proponents. Current process ID:', currentProcessId);
        
        set({ 
          processData: data,
          proponents: [] // Limpiar proponentes cuando cambia el proceso
        });
      },
      
      addProponent: (proponent) => {
        console.log('➕ Adding proponent to store:', proponent.name);
        set((state) => ({ 
          proponents: [...state.proponents, proponent]
        }));
      },
      
      updateProponent: (id, updates) => {
        console.log('📝 Updating proponent in store:', id);
        set((state) => ({
          proponents: state.proponents.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },
      
      deleteProponent: (id) => {
        console.log('🗑️ Deleting proponent from store:', id);
        set((state) => ({
          proponents: state.proponents.filter((p) => p.id !== id)
        }));
      },
      
      setCurrentStep: (step) => {
        console.log('🔄 Setting current step:', step);
        set({ currentStep: step });
      },
      
      resetProcess: () => {
        console.log('🔄 Resetting process and clearing all data');
        localStorage.removeItem('current_process_id');
        set({
          processData: null,
          proponents: [],
          currentStep: 1
        });
      },

      getProponentsForCurrentProcess: () => {
        const { proponents } = get();
        console.log('📊 Getting proponents for current process:', proponents.length);
        return proponents;
      },

      setProponents: (proponents) => {
        console.log('🔄 Setting proponents in store:', proponents.length);
        set({ proponents });
      },

      clearProponents: () => {
        console.log('🧹 Clearing proponents from store');
        set({ proponents: [] });
      }
    }),
    {
      name: 'alcaldia-evaluation-storage'
    }
  )
);
