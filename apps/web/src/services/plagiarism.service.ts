import { fetchJson } from './http';

export interface PlagiarismFlag {
  id: number;
  class_id: string;
  experiment_name: string;
  report1_id: number;
  report2_id: number;
  student1_name: string;
  student2_name: string;
  similarity_score: number;
  matched_fields: string;
  status: string;
  created_at: string;
}

export interface PlagiarismResult {
  report1_id: number;
  report2_id: number;
  student1_name: string;
  student2_name: string;
  similarity_score: number;
  matched_fields: string[];
}

export async function detectPlagiarism(classId: string, experimentName: string) {
  return fetchJson<{ success: boolean; results: PlagiarismResult[] }>('/api/plagiarism/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId, experiment_name: experimentName }),
  });
}

export async function getPlagiarismFlags(classId?: string, status?: string) {
  const params = new URLSearchParams();
  if (classId) params.set('class_id', classId);
  if (status) params.set('status', status);
  const query = params.toString();
  return fetchJson<{ success: boolean; flags: PlagiarismFlag[] }>(`/api/plagiarism${query ? `?${query}` : ''}`);
}

export async function updatePlagiarismStatus(id: number, status: string) {
  return fetchJson<{ success: boolean }>(`/api/plagiarism/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
