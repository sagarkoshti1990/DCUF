import { District, Tehsil, Village } from '../types';

export const mockDistricts: District[] = [
  { id: 1, name: 'Mumbai City', state: 'Maharashtra' },
  { id: 2, name: 'Mumbai Suburban', state: 'Maharashtra' },
  { id: 3, name: 'Pune', state: 'Maharashtra' },
  { id: 4, name: 'Thane', state: 'Maharashtra' },
  { id: 5, name: 'Raigad', state: 'Maharashtra' },
  { id: 6, name: 'Nashik', state: 'Maharashtra' },
  { id: 7, name: 'Ahmednagar', state: 'Maharashtra' },
  { id: 8, name: 'Solapur', state: 'Maharashtra' },
];

export const mockTehsils: Tehsil[] = [
  // Mumbai City
  { id: 1, name: 'Fort', districtId: 1 },
  { id: 2, name: 'Colaba', districtId: 1 },
  { id: 3, name: 'Byculla', districtId: 1 },

  // Mumbai Suburban
  { id: 4, name: 'Andheri', districtId: 2 },
  { id: 5, name: 'Borivali', districtId: 2 },
  { id: 6, name: 'Kurla', districtId: 2 },

  // Pune
  { id: 7, name: 'Pune City', districtId: 3 },
  { id: 8, name: 'Haveli', districtId: 3 },
  { id: 9, name: 'Mulshi', districtId: 3 },

  // Thane
  { id: 10, name: 'Thane', districtId: 4 },
  { id: 11, name: 'Kalyan', districtId: 4 },
  { id: 12, name: 'Bhiwandi', districtId: 4 },

  // Raigad
  { id: 13, name: 'Alibag', districtId: 5 },
  { id: 14, name: 'Panvel', districtId: 5 },
  { id: 15, name: 'Karjat', districtId: 5 },
];

export const mockVillages: Village[] = [
  // Fort Tehsil
  { id: 1, name: 'Colaba', tehsilId: 1 },
  { id: 2, name: 'Fort', tehsilId: 1 },
  { id: 3, name: 'Ballard Estate', tehsilId: 1 },

  // Colaba Tehsil
  { id: 4, name: 'Cuffe Parade', tehsilId: 2 },
  { id: 5, name: 'Navy Nagar', tehsilId: 2 },

  // Andheri Tehsil
  { id: 6, name: 'Andheri East', tehsilId: 4 },
  { id: 7, name: 'Andheri West', tehsilId: 4 },
  { id: 8, name: 'Jogeshwari', tehsilId: 4 },
  { id: 9, name: 'Vile Parle', tehsilId: 4 },

  // Pune City Tehsil
  { id: 10, name: 'Shivajinagar', tehsilId: 7 },
  { id: 11, name: 'Kothrud', tehsilId: 7 },
  { id: 12, name: 'Deccan', tehsilId: 7 },
  { id: 13, name: 'Camp', tehsilId: 7 },

  // Karjat Tehsil
  { id: 14, name: 'Karjat', tehsilId: 15 },
  { id: 15, name: 'Kondivade', tehsilId: 15 },
  { id: 16, name: 'Palasdari', tehsilId: 15 },
];
