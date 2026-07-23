import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SolveSchema, GraphDataSchema, PracticeSchema } from './schemas.js';
import * as svc from './services.js';
import { solveEquation, generateGraphData, generatePracticeProblem } from '@my-modern-app/math-engine';
const app = new Hono();
// GET /api/math/branches
app.get('/branches', async (c) => {
    const branches = await svc.getBranches();
    return c.json({ success: true, branches });
});
// GET /api/math/branches/:slug
app.get('/branches/:slug', async (c) => {
    const slug = c.req.param('slug');
    const branch = await svc.getBranch(slug);
    if (!branch)
        return c.json({ success: false, error: 'Branch not found' }, 404);
    return c.json({ success: true, branch });
});
// GET /api/math/branches/:slug/equations
app.get('/branches/:slug/equations', async (c) => {
    const slug = c.req.param('slug');
    const equations = await svc.getEquationsByBranchSlug(slug);
    return c.json({ success: true, equations });
});
// GET /api/math/equations/:id
app.get('/equations/:id', async (c) => {
    const id = c.req.param('id');
    const equation = await svc.getEquation(id);
    if (!equation)
        return c.json({ success: false, error: 'Equation not found' }, 404);
    return c.json({ success: true, equation });
});
// POST /api/math/solve
app.post('/solve', zValidator('json', SolveSchema), async (c) => {
    const body = c.req.valid('json');
    const result = solveEquation({
        expression: body.expression,
        variable: body.variable,
        operation: body.operation,
    });
    return c.json(result);
});
// POST /api/math/graph-data
app.post('/graph-data', zValidator('json', GraphDataSchema), async (c) => {
    const body = c.req.valid('json');
    const data = generateGraphData(body.expression, {
        xMin: body.xMin,
        xMax: body.xMax,
        step: body.step,
    });
    if (!data) {
        return c.json({ success: false, error: 'Unable to generate graph data' }, 400);
    }
    return c.json({ success: true, data });
});
// POST /api/math/practice
app.post('/practice', zValidator('json', PracticeSchema), async (c) => {
    const body = c.req.valid('json');
    const problem = generatePracticeProblem(body.branch ?? 'algebra', body.difficulty);
    if (!problem) {
        return c.json({ success: false, error: 'Unable to generate practice problem' }, 400);
    }
    return c.json({ success: true, problem });
});
export { app as mathRoutes };
