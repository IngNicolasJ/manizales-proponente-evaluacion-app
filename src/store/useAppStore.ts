
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
  clearProponents: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      processData: null,
      proponents: [],
      currentStep: 1,
      
      setProcessData: (data) => {
        console.log('🔄 Setting process data in store:', data?.processNumber);
        
        // CRÍTICO: Limpiar proponentes al cambiar de proceso solo si es un proceso diferente
        const currentProcess = get().processData;
        const isNewProcess = !currentProcess || currentProcess.processNumber !== data.processNumber;
        
        if (isNewProcess) {
          const currentProcessId = localStorage.getItem('current_process_id');
          console.log('🔄 New process detected, clearing existing proponents. Current process ID:', currentProcessId);
          
          set({ 
            processData: data,
            proponents: [] // Solo limpiar proponentes si es un proceso completamente nuevo
          });
        } else {
          // Si es el mismo proceso, solo actualizar los datos sin limpiar proponentes
          console.log('🔄 Updating existing process data without clearing proponents');
          set({ processData: data });
        }
      },
      
      addProponent: (proponent) => {
        console.log('➕ Adding proponent to store:', proponent.name);
        set((state) => {
          // Verificar que no exista ya un proponente con el mismo ID
          const existingIndex = state.proponents.findIndex(p => p.id === proponent.id);
          if (existingIndex >= 0) {
            console.log('⚠️ Proponent already exists, updating instead of adding:', proponent.name);
            const updatedProponents = [...state.proponents];
            updatedProponents[existingIndex] = proponent;
            return { proponents: updatedProponents };
          } else {
            return { proponents: [...state.proponents, proponent] };
          }
        });
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
        console.log('🔄 Setting proponents in store:', proponents.length, 'proponents');
        if (proponents.length > 0) {
          console.log('📋 Proponents being set:', proponents.map(p => ({ id: p.id, name: p.name })));
        }
        set({ proponents });
      },

      clearProponents: () => {
        console.log('🧹 Clearing proponents from store');
        set({ proponents: [] });
      }
    }),
    {
      name: 'alcaldia-evaluation-storage',
      // Mejorar la configuración de persistencia
      partialize: (state) => ({
        currentStep: state.currentStep,
        // No persistir processData ni proponents para evitar estados inconsistentes
      }),
    }
  )
);
