import { listBranches, getBranchBySlug, listEquationsByBranch, getEquationById } from './repository.js';
function localizeName(row) {
    return process.env.DEFAULT_LOCALE === 'en' ? (row.name_en ?? '') : (row.name_ar ?? '');
}
function mapBranch(row) {
    return {
        id: row.id,
        slug: row.slug,
        name: localizeName(row),
        description: row.description ?? undefined,
        icon: row.icon ?? undefined,
        color: row.color ?? undefined,
    };
}
function mapEquation(row) {
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
export async function getBranches() {
    const rows = await listBranches();
    return rows.map(mapBranch);
}
export async function getBranch(slug) {
    const row = await getBranchBySlug(slug);
    return row ? mapBranch(row) : undefined;
}
export async function getEquationsByBranchSlug(branchSlug) {
    const branch = await getBranchBySlug(branchSlug);
    if (!branch)
        return [];
    const rows = await listEquationsByBranch(branch.id);
    return rows.map(mapEquation);
}
export async function getEquation(id) {
    const row = await getEquationById(id);
    return row ? mapEquation(row) : undefined;
}
