import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { seedBranches, seedEquations } from './repository.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SeedBranch {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
}

export interface SeedEquation {
  id: string;
  branch_id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  latex: string;
  explanation?: string;
  difficulty: string;
  operation?: string;
  variable?: string;
  input_template?: string;
  sort_order: number;
}

function loadJson<T>(name: string): T {
  const path = join(__dirname, 'seed', name);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

export async function seedMathData(): Promise<void> {
  const branches = loadJson<SeedBranch[]>('branches.json').map((b) => ({
    ...b,
    description: b.description ?? null,
    icon: b.icon ?? null,
    color: b.color ?? null,
  }));
  const equations = loadJson<SeedEquation[]>('equations.json').map((e) => ({
    ...e,
    explanation: e.explanation ?? null,
    operation: e.operation ?? 'solve',
    variable: e.variable ?? 'x',
    input_template: e.input_template ?? null,
  }));
  await seedBranches(branches);
  await seedEquations(equations);
  console.log('[math] seed data applied');
}
