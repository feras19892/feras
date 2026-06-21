import { getAdminExport } from '../../services/admin.service';

export function useAdminExport() {
  async function download(type: string) {
    const res = await getAdminExport(type);
    if (!res) return;
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return { download };
}
