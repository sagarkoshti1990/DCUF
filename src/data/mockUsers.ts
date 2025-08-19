import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    workerID: 'WKR001',
    name: 'Priya Sharma',
    assignedVillage: { id: 1, name: 'Colaba', tehsilId: 1 },
    role: 'data_collector',
  },
  {
    id: 2,
    workerID: 'WKR002',
    name: 'Ravi Patil',
    assignedVillage: { id: 2, name: 'Fort', tehsilId: 1 },
    role: 'data_collector',
  },
  {
    id: 3,
    workerID: 'WKR003',
    name: 'Sunita Jadhav',
    assignedVillage: { id: 15, name: 'Karjat', tehsilId: 5 },
    role: 'data_collector',
  },
  {
    id: 4,
    workerID: 'ADMIN',
    name: 'Admin User',
    assignedVillage: null,
    role: 'admin',
  },
];

// Mock credentials for testing
export const mockCredentials = [
  { workerID: 'WKR001', pin: '1234' },
  { workerID: 'WKR002', pin: '5678' },
  { workerID: 'WKR003', pin: '9012' },
  { workerID: 'ADMIN', pin: '0000' },
];
