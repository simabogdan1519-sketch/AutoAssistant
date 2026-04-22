export type FuelType = 'Diesel' | 'Benzină' | 'GPL' | 'Hybrid' | 'Electric';

export type UserProfile = {
  name: string;
  avatar?: string;
  createdAt: number;
  onboardingCompleted: boolean;
};

export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  fuelType: FuelType;
  tankCapacity?: number;
  currentMileage: number;
  profileImage?: string;
  createdAt: number;
};

export type DocumentType =
  | 'rca'
  | 'casco'
  | 'rovinieta'
  | 'itp'
  | 'extinctor'
  | 'trusa'
  | 'civ'
  | 'service'
  | 'fiscal'
  | 'other';

export type CarDocument = {
  id: string;
  carId: string;
  type: DocumentType;
  name: string;
  issuer?: string;
  issueDate?: number;
  expiryDate?: number;
  amount?: number;
  fileUri?: string;
  notes?: string;
  createdAt: number;
};

export type FuelEntry = {
  id: string;
  carId: string;
  date: number;
  mileage: number;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  station?: string;
  full: boolean;
  consumption?: number;
};

export type Expense = {
  id: string;
  carId: string;
  category: 'fuel' | 'service' | 'insurance' | 'tax' | 'parking' | 'other';
  amount: number;
  date: number;
  description: string;
  vendor?: string;
  mileage?: number;
  receiptUri?: string;
};

export type ServiceRecord = {
  id: string;
  carId: string;
  date: number;
  mileage: number;
  type: string;
  description?: string;
  cost?: number;
  vendor?: string;
  nextServiceKm?: number;
};

export type Fine = {
  id: string;
  carId: string;
  date: number;
  article: string;
  offense: string;
  amount: number;
  points: number;
  location?: string;
  paid: boolean;
  paidAt?: number;
  paidHalf?: boolean;
};
