import type { Branch } from './math-types';
export * from './math-types';

export const branches: Branch[] = [
  { id: 'algebra', name: 'الجبر', color: '#a78bfa' },
  { id: 'geometry', name: 'الهندسة', color: '#38bdf8' },
  { id: 'trigonometry', name: 'المثلثات', color: '#f472b6' },
  { id: 'calculus', name: 'التفاضل والتكامل', color: '#22c55e' },
  { id: 'statistics', name: 'الإحصاء', color: '#fbbf24' },
  { id: 'number-theory', name: 'نظرية الأعداد', color: '#ec4899' },
  { id: 'mechanics', name: 'ميكانيكا', color: '#06b6d4' },
  { id: 'waves-optics', name: 'موجات وبصريات', color: '#8b5cf6' },
  { id: 'electricity', name: 'كهرباء', color: '#f59e0b' },
  { id: 'electromagnetism', name: 'كهرومغناطيسية', color: '#22c55e' },
  { id: 'heat', name: 'حرارة', color: '#ef4444' },
];

export { equations } from './equations-data';
