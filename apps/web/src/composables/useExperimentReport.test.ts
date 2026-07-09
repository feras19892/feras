import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useExperimentReport } from './useExperimentReport';

describe('useExperimentReport', () => {
  const STORAGE_KEY = 'test_student_info';

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initial canvasSnapshot is null', () => {
    const { canvasSnapshot } = useExperimentReport(STORAGE_KEY);
    expect(canvasSnapshot.value).toBeNull();
  });

  it('captureSnapshot stores dataUrl', () => {
    const { captureSnapshot, canvasSnapshot } = useExperimentReport(STORAGE_KEY);
    const mockRef = { captureSnapshot: () => 'data:image/png;base64,abc123' };
    captureSnapshot(mockRef);
    expect(canvasSnapshot.value).toBe('data:image/png;base64,abc123');
  });

  it('onSnapshot sets canvasSnapshot directly', () => {
    const { onSnapshot, canvasSnapshot } = useExperimentReport(STORAGE_KEY);
    onSnapshot('data:image/png;base64,xyz');
    expect(canvasSnapshot.value).toBe('data:image/png;base64,xyz');
  });

  it('buildStudentHtmlBlock returns null when no data', () => {
    const { buildStudentHtmlBlock } = useExperimentReport(STORAGE_KEY);
    expect(buildStudentHtmlBlock()).toBeNull();
  });

  it('buildStudentHtmlBlock reads student info from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Ali', email: 'ali@test.com' }));
    const { buildStudentHtmlBlock } = useExperimentReport(STORAGE_KEY);
    const block = buildStudentHtmlBlock();
    expect(block).not.toBeNull();
    expect(block!.title).toContain('📋');
    expect(block!.html).toContain('Ali');
    expect(block!.html).toContain('ali@test.com');
  });

  it('ignores malformed localStorage silently', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const { buildStudentHtmlBlock } = useExperimentReport(STORAGE_KEY);
    expect(buildStudentHtmlBlock()).toBeNull();
  });

  it('ignores missing fields in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Sara' }));
    const { buildStudentHtmlBlock } = useExperimentReport(STORAGE_KEY);
    const block = buildStudentHtmlBlock()!;
    expect(block.html).toContain('Sara');
    expect(block.html).not.toContain('undefined');
  });

  it('captureSnapshot handles null ref gracefully', () => {
    const { captureSnapshot, canvasSnapshot } = useExperimentReport(STORAGE_KEY);
    captureSnapshot(null);
    expect(canvasSnapshot.value).toBeNull();
  });

  it('captureSnapshot handles ref without captureSnapshot method', () => {
    const { captureSnapshot, canvasSnapshot } = useExperimentReport(STORAGE_KEY);
    captureSnapshot({} as Record<string, unknown>);
    expect(canvasSnapshot.value).toBeNull();
  });
});
