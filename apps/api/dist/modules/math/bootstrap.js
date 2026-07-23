import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { seedBranches, seedEquations } from './repository.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
function loadJson(name) {
    const path = join(__dirname, 'seed', name);
    return JSON.parse(readFileSync(path, 'utf-8'));
}
export async function seedMathData() {
    const branches = loadJson('branches.json').map((b) => ({
        ...b,
        description: b.description ?? null,
        icon: b.icon ?? null,
        color: b.color ?? null,
    }));
    const equations = loadJson('equations.json').map((e) => ({
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
