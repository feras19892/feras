import type { HomeCard, SiteInfo } from '../types/physics';

const HOME_CARDS: HomeCard[] = [
  {
    id: 'physics',
    icon: '⚛️',
    title: 'Physics',
    desc: 'Mechanics, waves, heat, electricity and magnetism experiments',
    stats: '20+ experiments',
    branchId: 'physics',
  },
  {
    id: 'chemistry',
    icon: '🧪',
    title: 'Chemistry',
    desc: 'pH, titration, electrolysis, and chromatography experiments',
    stats: '5+ experiments',
    branchId: 'chemistry',
  },
  {
    id: 'math',
    icon: '📐',
    title: 'Mathematics',
    desc: 'Functions, differential geometry, and statistics',
    stats: '10+ experiments',
    branchId: 'mathematics',
  },
  {
    id: 'general',
    icon: '🧬',
    title: 'Biology',
    desc: 'Biology experiments: cells, reproduction, ecosystems, and life systems',
    stats: '8+ experiments',
    branchId: 'general',
  },
];

export async function fetchSite(): Promise<SiteInfo> {
  return {
    title: 'PhysLab',
    language: 'ar',
    description: 'Interactive Science Lab',
  };
}

export async function fetchHomeCards(): Promise<HomeCard[]> {
  return HOME_CARDS;
}
