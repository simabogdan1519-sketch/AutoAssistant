import { differenceInDays, format, addMonths } from 'date-fns';
import { ro } from 'date-fns/locale';

export const formatDate = (timestamp: number, fmt = 'dd MMM yyyy') => {
  return format(new Date(timestamp), fmt, { locale: ro });
};

export const formatShortDate = (timestamp: number) => {
  return format(new Date(timestamp), 'dd.MM.yyyy', { locale: ro });
};

export const daysUntil = (timestamp: number) => {
  return differenceInDays(new Date(timestamp), new Date());
};

export const getExpiryStatus = (
  timestamp: number | undefined
): 'ok' | 'warn' | 'bad' | 'expired' => {
  if (!timestamp) return 'ok';
  const days = daysUntil(timestamp);
  if (days < 0) return 'expired';
  if (days <= 15) return 'bad';
  if (days <= 45) return 'warn';
  return 'ok';
};

export const formatCurrency = (amount: number, currency = 'LEI') => {
  return `${amount.toLocaleString('ro-RO', { maximumFractionDigits: 2 })} ${currency}`;
};

export const formatMileage = (km: number) => {
  return km.toLocaleString('ro-RO');
};

export const formatDaysLeft = (days: number) => {
  if (days < 0) return `EXP · ${Math.abs(days)} Z`;
  if (days === 0) return 'AZI';
  if (days < 30) return `${days} Z`;
  if (days < 365) return `${Math.floor(days / 30)} L`;
  return `${Math.floor(days / 365)} A`;
};

// Penalty points - contor reset la 6 luni de la ultima contravenție
export const calcActivePoints = (
  fines: { date: number; points: number }[]
): { total: number; resetDate: number | null } => {
  if (fines.length === 0) return { total: 0, resetDate: null };

  const sorted = [...fines].sort((a, b) => b.date - a.date);
  const lastFine = sorted[0];
  const resetDate = addMonths(new Date(lastFine.date), 6).getTime();

  // If reset date passed, no active points
  if (resetDate < Date.now()) {
    return { total: 0, resetDate: null };
  }

  // Sum points from last 6 months
  const sixMonthsAgo = addMonths(new Date(), -6).getTime();
  const total = fines
    .filter((f) => f.date >= sixMonthsAgo)
    .reduce((sum, f) => sum + f.points, 0);

  return { total, resetDate };
};
