import { listBranches, getBranchBySlug, listEquationsByBranch, getEquationById } from './repository.js';

export interface BranchDto {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface EquationDto {
  id: string;
  branchId: string;
  slug: string;
  title: string;
  latex: string;
  explanation?: string;
  difficulty: string;
  operation: string;
  variable: string;
  inputTemplate?: string;
}

function localizeName(row: { name_ar?: string; name_en?: string }): string {
  return process.env.DEFAULT_LOCALE === 'en' ? (row.name_en ?? '') : (row.name_ar ?? '');
}

function mapBranch(row: import('./repository.js').BranchRow): BranchDto {
  return {
    id: row.id,
    slug: row.slug,
    name: localizeName(row),
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
  };
}

function mapEquation(row: import('./repository.js').EquationRow): EquationDto {
  return {
    id: row.id,
    branchId: row.branch_id,
    slug: row.slug,
    title: localizeName({ name_ar: row.title_ar, name_en: row.title_en }),
    latex: row.latex,
    explanation: row.explanation ?? undefined,
    difficulty: row.difficulty,
    operation: row.operation,
    variable: row.variable,
    inputTemplate: row.input_template ?? undefined,
  };
}

export async function getBranches(): Promise<BranchDto[]> {
  const rows = await listBranches();
  return rows.map(mapBranch);
}

export async function getBranch(slug: string): Promise<BranchDto | undefined> {
  const row = await getBranchBySlug(slug);
  return row ? mapBranch(row) : undefined;
}

export async function getEquationsByBranchSlug(branchSlug: string): Promise<EquationDto[]> {
  const branch = await getBranchBySlug(branchSlug);
  if (!branch) return [];
  const rows = await listEquationsByBranch(branch.id);
  return rows.map(mapEquation);
}

export async function getEquation(id: string): Promise<EquationDto | undefined> {
  const row = await getEquationById(id);
  return row ? mapEquation(row) : undefined;
}
