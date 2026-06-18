import type { HomeCard, SiteInfo } from '../types/physics';

const HOME_CARDS: HomeCard[] = [
  {
    id: 'physics',
    icon: '⚛️',
    title: 'الفيزياء',
    desc: 'تجارب الميكانيكا، الأمواج، الحرارة، الكهرباء والمغناطيسية',
    stats: '20+ تجربة',
    branchId: 'physics',
  },
  {
    id: 'chemistry',
    icon: '🧪',
    title: 'الكيمياء',
    desc: 'التفاعلات، التحليل الكيميائي، والخصائص الفيزيائية',
    stats: '15+ تجربة',
    branchId: 'chemistry',
  },
  {
    id: 'mathematics',
    icon: '📐',
    title: 'الرياضيات',
    desc: 'الدوال، الهندسة التفاضلية، والإحصاء',
    stats: '10+ تجربة',
    branchId: 'mathematics',
  },
  {
    id: 'general',
    icon: '📚',
    title: 'علوم عامة',
    desc: 'مواضيع علمية متنوعة وتطبيقات عملية',
    stats: '8+ تجارب',
    branchId: 'general',
  },
];

export async function fetchSite(): Promise<SiteInfo> {
  return {
    title: 'PhysLab',
    language: 'ar',
    description: 'مختبر العلوم التفاعلي',
  };
}

export async function fetchHomeCards(): Promise<HomeCard[]> {
  return HOME_CARDS;
}
