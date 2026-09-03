import { test, expect, type Page } from '@playwright/test';

const USERS = {
  teacher: { email: 'school1_teacher1@test.com', password: 'Test1234!' },
  student: { email: 'school1_t1_student1@test.com', password: 'Test1234!' },
};

const CLASS_NAME = 'E2E-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
const REPORT_NAME = 'E2E-Report-' + Date.now();
const QUIZ_NAME = 'E2E-Quiz-' + Date.now();

async function login(page: Page, email: string, password: string, role: 'teacher' | 'student') {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`**/${role}`, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
}

async function closeAnyModal(page: Page) {
  const overlay = page.locator('.cookie-banner button, .cookie-accept, .modal-overlay, .confirm-overlay').first();
  for (let i = 0; i < 5; i++) {
    const visible = await overlay.isVisible().catch(() => false);
    if (!visible) break;
    await overlay.click({ force: true });
    await page.waitForTimeout(200);
  }
}

async function switchTab(page: Page, label: RegExp | string) {
  const pattern = typeof label === 'string' ? new RegExp(label) : label;
  await closeAnyModal(page);
  await page.getByRole('button', { name: pattern }).first().click();
  await page.waitForTimeout(300);
}

test.describe('Student-Teacher integration', () => {
  test.describe.configure({ mode: 'serial' });

  let teacherPage: Page;
  let studentPage: Page;

  function attachListeners(page: Page) {
    page.on('console', (msg) => {
      console.log(`[page console.${msg.type()}]`, msg.text());
    });
    page.on('pageerror', (err) => {
      console.log(`[page error]`, err);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.log(`[page response]`, res.url(), res.status(), res.request().method());
      }
    });
  }

  test.beforeAll(async ({ browser }) => {
    const teacherCtx = await browser.newContext();
    const studentCtx = await browser.newContext();
    teacherPage = await teacherCtx.newPage();
    studentPage = await studentCtx.newPage();
    attachListeners(teacherPage);
    attachListeners(studentPage);
    await login(teacherPage, USERS.teacher.email, USERS.teacher.password, 'teacher');
    await login(studentPage, USERS.student.email, USERS.student.password, 'student');
  });

  test('Quick actions navigate between tabs for both roles', async () => {
    await switchTab(teacherPage, 'فصولي');
    await expect(teacherPage.locator('h2').first()).toBeVisible();

    await switchTab(teacherPage, 'تقارير التجارب');
    await expect(teacherPage.locator('h2').first()).toContainText('تقارير');

    await switchTab(teacherPage, /الامتحان/);
    await expect(teacherPage.locator('h3').first()).toContainText('الامتحانات');

    await switchTab(teacherPage, 'إعدادات');
    await expect(teacherPage.locator('h2').first()).toContainText('إعدادات');

    await switchTab(studentPage, 'فصولي');
    await expect(studentPage.locator('.dash-page').first()).toBeVisible();

    await switchTab(studentPage, /الامتحان/);
    await expect(studentPage.locator('.quizzes-tab').first()).toBeVisible();

    await switchTab(studentPage, /دردش/);
    await expect(studentPage.locator('h2').first()).toContainText('الدردشة');

    await switchTab(studentPage, 'إعدادات');
    await expect(studentPage.locator('h2').first()).toContainText('إعدادات');
  });

  test('Teacher creates a class and student joins by code', async () => {
    await switchTab(teacherPage, 'فصولي');
    await teacherPage.getByRole('button', { name: /فصل جديد/ }).click();
    await teacherPage.locator('.modal-content input').fill(CLASS_NAME);
    await teacherPage.getByRole('button', { name: /^إنشاء$/ }).click();

    const row = teacherPage.locator('.compact-row').filter({ hasText: CLASS_NAME });
    await expect(row).toBeVisible({ timeout: 10000 });

    const codeCell = await row.locator('.code-with-copy').textContent() || '';
    const classCode = codeCell.replace(/[^A-Z0-9-]/g, '').trim();
    expect(classCode).toBeTruthy();

    await switchTab(studentPage, 'فصولي');
    await studentPage.getByRole('button', { name: /الانضمام لفصل/ }).click();
    await studentPage.locator('.modal-content input').fill(classCode);
    await studentPage.getByRole('button', { name: /^انضمام$/ }).click();

    await expect(studentPage.locator('.compact-row').filter({ hasText: CLASS_NAME }).first()).toBeVisible({ timeout: 10000 });

    await teacherPage.reload();
    await teacherPage.waitForLoadState('domcontentloaded');
    await switchTab(teacherPage, 'فصولي');
    const count = teacherPage.locator('.compact-row').filter({ hasText: CLASS_NAME }).getByText('الطلاب: 1');
    await expect(count).toBeVisible({ timeout: 10000 });
  });

  test('Student and Teacher chat inside the same class', async () => {
    const msg = 'Hello from E2E class';

    await switchTab(studentPage, /دردش/);
    await studentPage.locator('.class-circle').filter({ hasText: CLASS_NAME }).first().click();
    await studentPage.locator('.chat-input-bar input').fill(msg);
    const postPromise = studentPage.waitForResponse(response => response.url().includes('/api/chat/') && response.request().method() === 'POST');
    await studentPage.locator('.send-btn').click();
    const postRes = await postPromise;
    let postBody: any;
    try { postBody = await postRes.json(); } catch { postBody = await postRes.text(); }
    console.log('CHAT POST status', postRes.status(), 'body', JSON.stringify(postBody).slice(0, 200));
    const getPromise = studentPage.waitForResponse(response => response.url().includes('/api/chat/cls-') && response.request().method() === 'GET');
    const getRes = await getPromise;
    let getBody: any;
    try { getBody = await getRes.json(); } catch { getBody = await getRes.text(); }
    console.log('CHAT GET status', getRes.status(), 'messages count', getBody?.messages?.length ?? 'N/A');
    await studentPage.waitForFunction(text => document.body.innerText.includes(text), msg, { timeout: 10000 });
    await expect(studentPage.getByText(msg).first()).toBeVisible();

    await switchTab(teacherPage, /دردش/);
    await teacherPage.locator('.class-circle').filter({ hasText: CLASS_NAME }).first().click();
    await teacherPage.waitForFunction(text => document.body.innerText.includes(text), msg, { timeout: 15000 });
    await expect(teacherPage.getByText(msg).first()).toBeVisible();
  });

  test('Student creates a report and teacher grades it', async () => {
    const createBody = await studentPage.evaluate(async ({ className, reportName }: any) => {
      const token = localStorage.getItem('auth_access_token');
      const classesRes = await fetch('http://localhost:3000/api/classes', { headers: { Authorization: 'Bearer ' + token } });
      const { classes } = await classesRes.json();
      const classId = classes.find((c: any) => c.name === className)?.id;

      const createRes = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          experiment_type: 'physics',
          experiment_name: reportName,
          experiment_id: 'e2e',
          readings: JSON.stringify([{ value: 1, unit: 'm' }]),
          params: '{}',
          conclusion: 'E2E conclusion'
        })
      });
      return createRes.json();
    }, { className: CLASS_NAME, reportName: REPORT_NAME });

    console.log('REPORT CREATE', createBody);
    expect(createBody.success).toBe(true);
    expect(createBody.report?.experiment_name).toBe(REPORT_NAME);

    await studentPage.goto('/student');
    await studentPage.waitForLoadState('domcontentloaded');
    await switchTab(studentPage, /تقاريري/);

    await expect(studentPage.locator('text=' + REPORT_NAME).first()).toBeVisible({ timeout: 10000 });

    await switchTab(teacherPage, /تقارير/);
    const row = teacherPage.locator('.compact-row').filter({ hasText: REPORT_NAME });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.click();

    const inputs = teacherPage.locator('.detail-drawer input[type="number"], input[type="number"]');
    await inputs.nth(0).fill('20');
    await inputs.nth(1).fill('20');
    await inputs.nth(2).fill('20');
    await inputs.nth(3).fill('20');
    await teacherPage.locator('.detail-drawer textarea, textarea').first().fill('Good job');
    await teacherPage.getByRole('button', { name: /حفظ/ }).first().click();

    await expect(teacherPage.locator('.status-pill.graded').filter({ hasText: /مصحّح|graded/ }).first()).toBeVisible({ timeout: 10000 });

    await studentPage.goto('/student');
    await studentPage.waitForLoadState('domcontentloaded');
    await expect(studentPage.locator('text=' + REPORT_NAME).first()).toBeVisible();
    await expect(studentPage.locator('text=80/100').first()).toBeVisible();
  });

  test('Teacher publishes a quiz and student submits an answer', async () => {
    teacherPage.on('dialog', async (dialog) => await dialog.accept());

    await switchTab(teacherPage, /الامتحان/);
    await teacherPage.getByRole('button', { name: /امتحان جديد/ }).click();

    await teacherPage.locator('.qb-field input').nth(0).fill(QUIZ_NAME);
    await teacherPage.locator('.qb-field select').first().selectOption({ label: CLASS_NAME });

    await teacherPage.locator('.qb-new-q textarea').fill('E2E Question?');
    await teacherPage.locator('.qb-new-q input').nth(0).fill('Choice A');
    await teacherPage.locator('.qb-new-q input').nth(1).fill('Choice B');
    await teacherPage.locator('.qb-new-q select').selectOption({ value: 'a' });
    await teacherPage.getByRole('button', { name: /إضافة سؤال/ }).click();

    await expect(teacherPage.locator('.qb-saved-q')).toHaveCount(1);
    await teacherPage.getByRole('button', { name: /حفظ ونشر/ }).click();

    await switchTab(teacherPage, /الامتحان/);
    const card = teacherPage.locator('.qm-card').filter({ hasText: QUIZ_NAME });
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.locator('.qm-status-badge.published')).toContainText('منشور');

    await switchTab(studentPage, /الامتحان/);
    const quizCard = studentPage.locator('.quiz-card').filter({ hasText: QUIZ_NAME });
    await expect(quizCard).toBeVisible({ timeout: 10000 });
    await quizCard.locator('button:enabled').first().click();

    const answerInput = studentPage.locator('input[type="radio"][value="a"]').first();
    await answerInput.evaluate((el) => {
      (el as HTMLInputElement).checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await studentPage.getByRole('button', { name: /تأكيد الإرسال/ }).click();
    await studentPage.getByRole('button', { name: /تأكيد وإرسال/ }).click();
    await expect(studentPage.locator('.result-box').first()).toBeVisible({ timeout: 10000 });
  });

  test('Student leaves the class and teacher count drops', async () => {
    await switchTab(studentPage, 'فصولي');
    await studentPage.locator('.compact-row').filter({ hasText: CLASS_NAME }).click();
    await studentPage.locator('.class-toolbar .toolbar-danger').click();
    await studentPage.locator('.confirm-overlay button').filter({ hasText: 'مغادرة' }).click();
    await expect(studentPage.locator('.compact-row').filter({ hasText: CLASS_NAME }).first()).toBeHidden({ timeout: 10000 });

    await switchTab(teacherPage, 'فصولي');
    await teacherPage.reload();
    await teacherPage.waitForLoadState('domcontentloaded');
    const row = teacherPage.locator('.compact-row').filter({ hasText: CLASS_NAME });
    await expect(row).toBeVisible();
    await expect(row.locator('text=الطلاب: 0')).toBeVisible({ timeout: 10000 });
  });
});
