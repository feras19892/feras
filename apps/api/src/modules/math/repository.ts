import { db } from '../../db/index.js';

export interface BranchRow {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface EquationRow {
  id: string;
  branch_id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  latex: string;
  explanation: string | null;
  difficulty: string;
  operation: string;
  variable: string;
  input_template: string | null;
  sort_order: number;
}

export async function listBranches(): Promise<BranchRow[]> {
  return db.all<BranchRow[]>(
    'SELECT * FROM math_branches ORDER BY sort_order ASC, name_ar ASC'
  );
}

export async function getBranchBySlug(slug: string): Promise<BranchRow | undefined> {
  return db.get<BranchRow>(
    'SELECT * FROM math_branches WHERE slug = ?',
    slug
  );
}

export async function listEquationsByBranch(branchId: string): Promise<EquationRow[]> {
  return db.all<EquationRow[]>(
    'SELECT * FROM math_equations WHERE branch_id = ? ORDER BY sort_order ASC, title_ar ASC',
    branchId
  );
}

export async function getEquationById(id: string): Promise<EquationRow | undefined> {
  return db.get<EquationRow>(
    'SELECT * FROM math_equations WHERE id = ?',
    id
  );
}

export async function seedBranches(branches: BranchRow[]): Promise<void> {
  const stmt = await db.prepare(
    `INSERT OR IGNORE INTO math_branches (id, slug, name_ar, name_en, description, icon, color, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const b of branches) {
    await stmt.run(b.id, b.slug, b.name_ar, b.name_en, b.description, b.icon, b.color, b.sort_order);
  }
  await stmt.finalize();
}

export async function seedEquations(equations: EquationRow[]): Promise<void> {
  const stmt = await db.prepare(
    `INSERT OR IGNORE INTO math_equations (id, branch_id, slug, title_ar, title_en, latex, explanation, difficulty, operation, variable, input_template, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const e of equations) {
    await stmt.run(
      e.id,
      e.branch_id,
      e.slug,
      e.title_ar,
      e.title_en,
      e.latex,
      e.explanation,
      e.difficulty,
      e.operation,
      e.variable,
      e.input_template,
      e.sort_order,
    );
  }
  await stmt.finalize();
}
