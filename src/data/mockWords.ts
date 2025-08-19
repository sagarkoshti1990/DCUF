import { MasterWord } from '../types';

// This represents a subset of the 7,000 word database
export const mockWords: MasterWord[] = [
  // Basic Words
  {
    id: 1,
    english: 'water',
    marathi: 'पाणी',
    hindi: 'पानी',
    category: 'basic',
  },
  { id: 2, english: 'fire', marathi: 'आग', hindi: 'आग', category: 'basic' },
  {
    id: 3,
    english: 'earth',
    marathi: 'पृथ्वी',
    hindi: 'पृथ्वी',
    category: 'basic',
  },
  { id: 4, english: 'air', marathi: 'हवा', hindi: 'हवा', category: 'basic' },
  {
    id: 5,
    english: 'sun',
    marathi: 'सूर्य',
    hindi: 'सूर्य',
    category: 'nature',
  },
  {
    id: 6,
    english: 'moon',
    marathi: 'चंद्र',
    hindi: 'चाँद',
    category: 'nature',
  },
  { id: 7, english: 'tree', marathi: 'झाड', hindi: 'पेड़', category: 'nature' },
  {
    id: 8,
    english: 'mountain',
    marathi: 'पर्वत',
    hindi: 'पहाड़',
    category: 'nature',
  },

  // Family Relations
  { id: 9, english: 'mother', marathi: 'आई', hindi: 'माँ', category: 'family' },
  {
    id: 10,
    english: 'father',
    marathi: 'बाबा',
    hindi: 'पिता',
    category: 'family',
  },
  {
    id: 11,
    english: 'brother',
    marathi: 'भाऊ',
    hindi: 'भाई',
    category: 'family',
  },
  {
    id: 12,
    english: 'sister',
    marathi: 'बहीण',
    hindi: 'बहन',
    category: 'family',
  },
  {
    id: 13,
    english: 'grandmother',
    marathi: 'आजी',
    hindi: 'दादी',
    category: 'family',
  },
  {
    id: 14,
    english: 'grandfather',
    marathi: 'आजोबा',
    hindi: 'दादा',
    category: 'family',
  },

  // Body Parts
  { id: 15, english: 'head', marathi: 'डोके', hindi: 'सिर', category: 'body' },
  { id: 16, english: 'eye', marathi: 'डोळा', hindi: 'आँख', category: 'body' },
  { id: 17, english: 'nose', marathi: 'नाक', hindi: 'नाक', category: 'body' },
  {
    id: 18,
    english: 'mouth',
    marathi: 'तोंड',
    hindi: 'मुँह',
    category: 'body',
  },
  { id: 19, english: 'hand', marathi: 'हात', hindi: 'हाथ', category: 'body' },
  { id: 20, english: 'foot', marathi: 'पाय', hindi: 'पैर', category: 'body' },

  // Colors
  { id: 21, english: 'red', marathi: 'लाल', hindi: 'लाल', category: 'colors' },
  {
    id: 22,
    english: 'blue',
    marathi: 'निळा',
    hindi: 'नीला',
    category: 'colors',
  },
  {
    id: 23,
    english: 'green',
    marathi: 'हिरवा',
    hindi: 'हरा',
    category: 'colors',
  },
  {
    id: 24,
    english: 'yellow',
    marathi: 'पिवळा',
    hindi: 'पीला',
    category: 'colors',
  },
  {
    id: 25,
    english: 'white',
    marathi: 'पांढरा',
    hindi: 'सफ़ेद',
    category: 'colors',
  },
  {
    id: 26,
    english: 'black',
    marathi: 'काळा',
    hindi: 'काला',
    category: 'colors',
  },

  // Numbers
  { id: 27, english: 'one', marathi: 'एक', hindi: 'एक', category: 'numbers' },
  { id: 28, english: 'two', marathi: 'दोन', hindi: 'दो', category: 'numbers' },
  {
    id: 29,
    english: 'three',
    marathi: 'तीन',
    hindi: 'तीन',
    category: 'numbers',
  },
  {
    id: 30,
    english: 'four',
    marathi: 'चार',
    hindi: 'चार',
    category: 'numbers',
  },
  {
    id: 31,
    english: 'five',
    marathi: 'पाच',
    hindi: 'पाँच',
    category: 'numbers',
  },

  // Animals
  { id: 32, english: 'cow', marathi: 'गाय', hindi: 'गाय', category: 'animals' },
  {
    id: 33,
    english: 'buffalo',
    marathi: 'म्हैस',
    hindi: 'भैंस',
    category: 'animals',
  },
  {
    id: 34,
    english: 'goat',
    marathi: 'शेळी',
    hindi: 'बकरी',
    category: 'animals',
  },
  {
    id: 35,
    english: 'chicken',
    marathi: 'कोंबडी',
    hindi: 'मुर्गी',
    category: 'animals',
  },
  {
    id: 36,
    english: 'dog',
    marathi: 'कुत्रा',
    hindi: 'कुत्ता',
    category: 'animals',
  },
  {
    id: 37,
    english: 'cat',
    marathi: 'मांजर',
    hindi: 'बिल्ली',
    category: 'animals',
  },

  // Food Items
  { id: 38, english: 'rice', marathi: 'भात', hindi: 'चावल', category: 'food' },
  {
    id: 39,
    english: 'wheat',
    marathi: 'गहू',
    hindi: 'गेहूँ',
    category: 'food',
  },
  { id: 40, english: 'dal', marathi: 'डाळ', hindi: 'दाल', category: 'food' },
  {
    id: 41,
    english: 'vegetables',
    marathi: 'भाज्या',
    hindi: 'सब्जी',
    category: 'food',
  },
  { id: 42, english: 'milk', marathi: 'दूध', hindi: 'दूध', category: 'food' },

  // Actions/Verbs
  {
    id: 43,
    english: 'eat',
    marathi: 'खाणे',
    hindi: 'खाना',
    category: 'actions',
  },
  {
    id: 44,
    english: 'drink',
    marathi: 'पिणे',
    hindi: 'पीना',
    category: 'actions',
  },
  {
    id: 45,
    english: 'sleep',
    marathi: 'झोपणे',
    hindi: 'सोना',
    category: 'actions',
  },
  {
    id: 46,
    english: 'walk',
    marathi: 'चालणे',
    hindi: 'चलना',
    category: 'actions',
  },
  {
    id: 47,
    english: 'run',
    marathi: 'पळणे',
    hindi: 'दौड़ना',
    category: 'actions',
  },
  {
    id: 48,
    english: 'sit',
    marathi: 'बसणे',
    hindi: 'बैठना',
    category: 'actions',
  },
  {
    id: 49,
    english: 'stand',
    marathi: 'उभे राहणे',
    hindi: 'खड़ा होना',
    category: 'actions',
  },
  {
    id: 50,
    english: 'speak',
    marathi: 'बोलणे',
    hindi: 'बोलना',
    category: 'actions',
  },
];

// Categories for filtering
export const wordCategories = [
  'basic',
  'nature',
  'family',
  'body',
  'colors',
  'numbers',
  'animals',
  'food',
  'actions',
];

// Helper function to get words by category
export const getWordsByCategory = (category: string): MasterWord[] => {
  return mockWords.filter(word => word.category === category);
};

// Helper function to search words
export const searchWords = (query: string): MasterWord[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockWords.filter(
    word =>
      word.english.toLowerCase().includes(lowercaseQuery) ||
      word.marathi?.toLowerCase().includes(lowercaseQuery) ||
      word.hindi?.toLowerCase().includes(lowercaseQuery),
  );
};
