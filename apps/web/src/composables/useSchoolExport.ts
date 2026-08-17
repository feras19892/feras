import { getSchoolExport } from '../services/school.service';

export function useSchoolExport() {
  async function download(type: string) {
    const res = await getSchoolExport(type);
    if (!res) return;
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_${type}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return { download };
}
