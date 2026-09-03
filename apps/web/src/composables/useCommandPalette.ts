import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth';
import { getReports } from '../services/report.service';
import type { Report } from '../services/report.service';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  path?: string;
  roles?: string[];
  action?: () => void;
}

const allCommands: CommandItem[] = [
  { id: 'home', label: 'الرئيسية', icon: '🏠', path: '/home', roles: ['student', 'teacher', 'admin', 'school'] },
  { id: 'student-dashboard', label: 'لوحة الطالب', icon: '🎓', path: '/student', roles: ['student'] },
  { id: 'teacher-dashboard', label: 'لوحة المدرس', icon: '📚', path: '/teacher', roles: ['teacher'] },
  { id: 'admin', label: 'لوحة الإدارة', icon: '⚙️', path: '/admin', roles: ['admin'] },
  { id: 'school', label: 'لوحة المدرسة', icon: '🏫', path: '/school', roles: ['school'] },
  { id: 'physics', label: 'الفيزياء', icon: '⚛️', path: '/physics' },
  { id: 'chemistry', label: 'الكيمياء', icon: '🧪', path: '/chemistry' },
  { id: 'biology', label: 'الأحياء', icon: '🧬', path: '/biology' },
  { id: 'math', label: 'الرياضيات', icon: '📐', path: '/math' },
  { id: 'approvals', label: 'الطلبات والموافقات', icon: '✅', path: '/approvals', roles: ['student', 'teacher', 'admin', 'school'] },
  { id: 'analysis', label: 'أداة التحليل', icon: '📊', path: '/analysis' },
  { id: 'register', label: 'تسجيل حساب', icon: '📝', path: '/register' },
  { id: 'language', label: 'تغيير اللغة', icon: '🌐', path: '/language' },
  { id: 'privacy', label: 'سياسة الخصوصية', icon: '🔒', path: '/privacy' },
  { id: 'terms', label: 'شروط الاستخدام', icon: '📄', path: '/terms' },
];

export function useCommandPalette() {
  const open = ref(false);
  const query = ref('');
  const selectedIndex = ref(0);
  const router = useRouter();
  const auth = useAuthStore();
  const reportResults = ref<Report[]>([]);
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const userRole = computed(() => auth.role);

  const staticCommands = computed(() => {
    let cmds = allCommands;
    if (userRole.value) {
      cmds = cmds.filter(c => !c.roles || c.roles.includes(userRole.value!));
    } else {
      cmds = cmds.filter(c => !c.roles);
    }
    return cmds;
  });

  const filteredCommands = computed(() => {
    const q = query.value.toLowerCase().trim();
    const cmds = staticCommands.value;

    if (!q) return cmds.map(c => ({ ...c, type: 'nav' as const }));
    const navMatches = cmds.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    ).map(c => ({ ...c, type: 'nav' as const }));

    const reportMatches = reportResults.value.map(r => ({
      id: `report-${r.id}`,
      label: `تقرير: ${r.experiment_name}`,
      description: r.student_name || `#${r.id}`,
      icon: '📄',
      path: `/report/${r.id}`,
      type: 'report' as const,
    }));

    return [...navMatches, ...reportMatches];
  });

  function toggle() {
    open.value = !open.value;
    if (open.value) {
      query.value = '';
      selectedIndex.value = 0;
      reportResults.value = [];
    }
  }

  function close() {
    open.value = false;
    query.value = '';
    reportResults.value = [];
  }

  async function searchReports(q: string) {
    if (!auth.isLoggedIn) { reportResults.value = []; return; }
    try {
      const res = await getReports({ search: q, limit: 5 });
      if (res.success) reportResults.value = res.reports;
    } catch { reportResults.value = []; }
  }

  watch(query, (q) => {
    selectedIndex.value = 0;
    if (searchTimer) clearTimeout(searchTimer);
    const trimmed = q.trim();
    if (trimmed.length >= 2) {
      searchTimer = setTimeout(() => searchReports(trimmed), 300);
    } else {
      reportResults.value = [];
    }
  });

  function execute(item: CommandItem) {
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
    close();
  }

  function moveUp() {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1);
  }

  function moveDown() {
    selectedIndex.value = Math.min(filteredCommands.value.length - 1, selectedIndex.value + 1);
  }

  function selectCurrent() {
    const item = filteredCommands.value[selectedIndex.value];
    if (item) execute(item);
  }

  return {
    open,
    query,
    selectedIndex,
    filteredCommands,
    toggle,
    close,
    execute,
    moveUp,
    moveDown,
    selectCurrent,
  };
}
