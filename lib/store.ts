import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Car,
  CarDocument,
  FuelEntry,
  Expense,
  ServiceRecord,
  Fine,
  UserProfile,
} from '@/types';

type Store = {
  user: UserProfile;
  cars: Car[];
  documents: CarDocument[];
  fuelEntries: FuelEntry[];
  expenses: Expense[];
  serviceRecords: ServiceRecord[];
  fines: Fine[];
  activeCarId: string | null;

  // User actions
  updateUser: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;

  // Car actions
  addCar: (car: Omit<Car, 'id' | 'createdAt'>) => string;
  updateCar: (id: string, updates: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  setActiveCar: (id: string) => void;

  // Document actions
  addDocument: (doc: Omit<CarDocument, 'id' | 'createdAt'>) => void;
  updateDocument: (id: string, updates: Partial<CarDocument>) => void;
  deleteDocument: (id: string) => void;

  // Fuel actions
  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'consumption'>) => void;
  deleteFuelEntry: (id: string) => void;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Service actions
  addServiceRecord: (record: Omit<ServiceRecord, 'id'>) => void;
  deleteServiceRecord: (id: string) => void;

  // Fine actions
  addFine: (fine: Omit<Fine, 'id'>) => void;
  updateFine: (id: string, updates: Partial<Fine>) => void;
  deleteFine: (id: string) => void;
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: {
        name: '',
        avatar: undefined,
        createdAt: Date.now(),
        onboardingCompleted: false,
      },
      cars: [],
      documents: [],
      fuelEntries: [],
      expenses: [],
      serviceRecords: [],
      fines: [],
      activeCarId: null,

      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      completeOnboarding: () =>
        set((state) => ({
          user: { ...state.user, onboardingCompleted: true },
        })),

      addCar: (carData) => {
        const id = genId();
        const newCar: Car = {
          ...carData,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({
          cars: [...state.cars, newCar],
          activeCarId: state.activeCarId || id,
        }));
        return id;
      },

      updateCar: (id, updates) =>
        set((state) => ({
          cars: state.cars.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCar: (id) =>
        set((state) => ({
          cars: state.cars.filter((c) => c.id !== id),
          documents: state.documents.filter((d) => d.carId !== id),
          fuelEntries: state.fuelEntries.filter((f) => f.carId !== id),
          expenses: state.expenses.filter((e) => e.carId !== id),
          serviceRecords: state.serviceRecords.filter((s) => s.carId !== id),
          fines: state.fines.filter((f) => f.carId !== id),
          activeCarId:
            state.activeCarId === id
              ? state.cars.find((c) => c.id !== id)?.id || null
              : state.activeCarId,
        })),

      setActiveCar: (id) => set({ activeCarId: id }),

      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, id: genId(), createdAt: Date.now() },
          ],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      addFuelEntry: (entry) =>
        set((state) => {
          const carEntries = state.fuelEntries
            .filter((f) => f.carId === entry.carId)
            .sort((a, b) => b.date - a.date);

          const last = carEntries[0];
          let consumption: number | undefined;

          if (last && entry.full && last.full) {
            const kmDiff = entry.mileage - last.mileage;
            if (kmDiff > 0) {
              consumption = (entry.liters / kmDiff) * 100;
            }
          }

          return {
            fuelEntries: [
              ...state.fuelEntries,
              { ...entry, id: genId(), consumption },
            ],
          };
        }),

      deleteFuelEntry: (id) =>
        set((state) => ({
          fuelEntries: state.fuelEntries.filter((f) => f.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: genId() }],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addServiceRecord: (record) =>
        set((state) => ({
          serviceRecords: [...state.serviceRecords, { ...record, id: genId() }],
        })),

      deleteServiceRecord: (id) =>
        set((state) => ({
          serviceRecords: state.serviceRecords.filter((s) => s.id !== id),
        })),

      addFine: (fine) =>
        set((state) => ({
          fines: [...state.fines, { ...fine, id: genId() }],
        })),

      updateFine: (id, updates) =>
        set((state) => ({
          fines: state.fines.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),

      deleteFine: (id) =>
        set((state) => ({
          fines: state.fines.filter((f) => f.id !== id),
        })),
    }),
    {
      name: 'autoassistant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useActiveCar = () => {
  const activeCarId = useStore((s) => s.activeCarId);
  const cars = useStore((s) => s.cars);
  return cars.find((c) => c.id === activeCarId) || cars[0] || null;
};
