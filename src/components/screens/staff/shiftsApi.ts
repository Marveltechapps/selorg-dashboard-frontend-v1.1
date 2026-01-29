export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'absent' | 'late';

export interface Shift {
  id: string;
  riderId: string;
  riderName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ShiftStatus;
  checkInTime?: string;
  checkOutTime?: string;
  hub: string;
  isPeakHour: boolean;
  overtimeMinutes?: number;
}

export interface ShiftSummary {
  date: string;
  checkedInCount: number;
  scheduledTodayCount: number;
  absentOrLateCount: number;
}

export interface AvailableRider {
  id: string;
  name: string;
  hub: string;
  existingHours: number;
}

// Mock Data
const MOCK_RIDERS: AvailableRider[] = [
  { id: 'r1', name: 'John Doe', hub: 'Downtown Hub', existingHours: 0 },
  { id: 'r2', name: 'Sarah Smith', hub: 'North Hub', existingHours: 4 },
  { id: 'r3', name: 'Mike Ross', hub: 'West Hub', existingHours: 0 },
  { id: 'r4', name: 'Emily Chen', hub: 'Downtown Hub', existingHours: 8 },
  { id: 'r5', name: 'David Wilson', hub: 'East Hub', existingHours: 0 },
  { id: 'r6', name: 'Lisa Taylor', hub: 'North Hub', existingHours: 0 },
  { id: 'r7', name: 'James Bond', hub: 'Downtown Hub', existingHours: 0 },
  { id: 'r8', name: 'Bruce Wayne', hub: 'Gotham Hub', existingHours: 0 },
  { id: 'r9', name: 'Clark Kent', hub: 'Metropolis Hub', existingHours: 0 },
  { id: 'r10', name: 'Diana Prince', hub: 'Themyscira Hub', existingHours: 0 },
];

// In-memory store
let shifts: Shift[] = [
  {
    id: 's1',
    riderId: 'r1',
    riderName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    status: 'active',
    checkInTime: '07:55',
    hub: 'Downtown Hub',
    isPeakHour: true,
  },
  {
    id: 's2',
    riderId: 'r1',
    riderName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '16:00',
    status: 'scheduled',
    hub: 'Downtown Hub',
    isPeakHour: false,
  },
  {
    id: 's3',
    riderId: 'r2',
    riderName: 'Sarah Smith',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '16:00',
    status: 'scheduled',
    hub: 'North Hub',
    isPeakHour: false,
  },
  {
    id: 's4',
    riderId: 'r2',
    riderName: 'Sarah Smith',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '20:00',
    status: 'scheduled',
    hub: 'North Hub',
    isPeakHour: true,
  },
  {
    id: 's5',
    riderId: 'r3',
    riderName: 'Mike Ross',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    status: 'absent',
    hub: 'West Hub',
    isPeakHour: true,
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchShiftSummary = async (date: string): Promise<ShiftSummary> => {
  await delay(500);
  const todaysShifts = shifts.filter(s => s.date === date);
  return {
    date,
    checkedInCount: todaysShifts.filter(s => s.status === 'active' || s.status === 'completed').length,
    scheduledTodayCount: todaysShifts.length,
    absentOrLateCount: todaysShifts.filter(s => s.status === 'absent' || s.status === 'late').length,
  };
};

export const fetchShifts = async (date: string): Promise<Shift[]> => {
  await delay(600);
  return shifts.filter(s => s.date === date);
};

export const fetchAvailableRiders = async (): Promise<AvailableRider[]> => {
  await delay(400);
  return MOCK_RIDERS;
};

export const createShift = async (newShift: Omit<Shift, 'id' | 'riderName'>) => {
  await delay(500);
  const rider = MOCK_RIDERS.find(r => r.id === newShift.riderId);
  const shift: Shift = {
    ...newShift,
    id: Math.random().toString(36).substr(2, 9),
    riderName: rider ? rider.name : 'Unknown Rider',
  };
  shifts.push(shift);
  return shift;
};

export const updateShiftStatus = async (id: string, updates: Partial<Shift>) => {
  await delay(300);
  const index = shifts.findIndex(s => s.id === id);
  if (index !== -1) {
    shifts[index] = { ...shifts[index], ...updates };
    return shifts[index];
  }
  throw new Error('Shift not found');
};
