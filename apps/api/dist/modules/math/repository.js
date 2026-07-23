import { db } from '../../db/index.js';
export async function listBranches() {
    return db.all('SELECT * FROM math_branches ORDER BY sort_order ASC, name_ar ASC');
}
export async function getBranchBySlug(slug) {
    return db.get('SELECT * FROM math_branches WHERE slug = ?', slug);
}
export async function listEquationsByBranch(branchId) {
    return db.all('SELECT * FROM math_equations WHERE branch_id = ? ORDER BY sort_order ASC, title_ar ASC', branchId);
}
export async function getEquationById(id) {
    return db.get('SELECT * FROM math_equations WHERE id = ?', id);
}
export async function seedBranches(branches) {
    const stmt = await db.prepare(`INSERT OR IGNORE INTO math_branches (id, slug, name_ar, name_en, description, icon, color, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const b of branches) {
        await stmt.run(b.id, b.slug, b.name_ar, b.name_en, b.description, b.icon, b.color, b.sort_order);
    }
    await stmt.finalize();
}
export async function seedEquations(equations) {
    const stmt = await db.prepare(`INSERT OR IGNORE INTO math_equations (id, branch_id, slug, title_ar, title_en, latex, explanation, difficulty, operation, variable, input_template, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const e of equations) {
        await stmt.run(e.id, e.branch_id, e.slug, e.title_ar, e.title_en, e.latex, e.explanation, e.difficulty, e.operation, e.variable, e.input_template, e.sort_order);
    }
    await stmt.finalize();
}
