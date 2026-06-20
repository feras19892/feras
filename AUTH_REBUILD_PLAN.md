# خطة إعادة بناء نظام المصادقة (Auth Rebuild Plan)

## المرحلة 0: تحليل الوضع الحالي (تم)

| الجانب | الوضع الحالي |
|--------|-------------|
| Backend | Hono + `Map` في الذاكرة + JWT وهمي + لا bcrypt |
| Frontend | Pinia + `localStorage` + لا Route Guards |
| Database | لا يوجد (البيانات تُفقد عند restart) |

---

## المرحلة 1: التأسيس — التبعيات والبنية

### 1.1 إضافة التبعيات

**`apps/api/package.json`** — إضافة:
```json
{
  "bcryptjs": "^2.4.3",
  "jose": "^5.6.3",
  "zod": "^3.23.8",
  "better-sqlite3": "^11.0.0"
}
```

**`apps/web/package.json`** — إضافة:
```json
{
  "zod": "^3.23.8"
}
```

**`packages/shared-types/package.json`** — تحديث types جديدة: `JWTPayload`, `AuthResponse`, `RefreshRequest`.

### 1.2 قاعدة البيانات — SQLite + Simple Migration Runner

**قرار:** لا نستخدم Prisma/Drizzle ORM (أدوات ثقيلة). نستخدم **Simple Migration Runner** — ملفات `.sql` خام يُقرأها `db/index.ts` عند الإقلاع.

**`apps/api/src/db/migrations/001_init.sql`:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','teacher','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_students (
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, student_id)
);
```

**`apps/api/src/db/index.ts`:**
```ts
import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const db = new Database(process.env.DB_PATH || './data/app.db');
db.pragma('journal_mode = WAL');

// Simple Migration Runner
function runMigrations() {
  db.exec(`CREATE TABLE IF NOT EXISTS __migrations (name TEXT PRIMARY KEY, run_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const exists = db.prepare('SELECT 1 FROM __migrations WHERE name = ?').get(file);
    if (!exists) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO __migrations (name) VALUES (?)').run(file);
      console.log(`Migration applied: ${file}`);
    }
  }
}

runMigrations();
export { db };
```

---

## المرحلة 2: Backend — إعادة بناء كاملة

### 2.1 DTOs / Types — `packages/shared-types`

| الملف | المحتوى |
|-------|---------|
| `packages/shared-types/src/auth.ts` | `User`, `UserRole`, `JWTPayload`, `LoginRequest`, `RegisterRequest`, `AuthResponse`, `RefreshRequest` |
| `packages/shared-types/src/class.ts` | `ClassInfo`, `ClassStudent`, `JoinClassRequest`, `CreateClassRequest` |

### 2.2 Validation Schemas — `apps/api/src/modules/auth/schemas.ts`

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(100),
  role: z.enum(['student', 'teacher']),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updatePasswordSchema = z.object({
  user_id: z.number().int(),
  new_password: z.string().min(6),
});
```

### 2.3 JWT Implementation — `apps/api/src/modules/auth/jwt.ts`

```ts
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@my-modern-app/shared-types';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production');

export async function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
  return payload as unknown as JWTPayload;
}
```

### 2.4 Auth Service — `apps/api/src/modules/auth/services.ts` (إعادة كتابة كاملة)

| الوظيفة | المنطق |
|---------|--------|
| `register(credentials)` | zod validate → bcrypt.hash(password, 12) → insert user → return user (بدون password) |
| `login(email, password)` | find user by email → bcrypt.compare(password, hash) → generate Access JWT + Refresh Token (random 64 bytes → SHA-256 hash) → store hash in DB → set cookie → return user |
| `refresh(refreshToken)` | verify SHA-256 hash exists in DB + not expired → generate new Access JWT → return |
| `logout(userId)` | delete all refresh_tokens for user_id |
| `getUserFromToken(jwt)` | verifyAccessToken → find user by id → return user |
| `updatePassword(userId, newPassword)` | bcrypt.hash(newPassword, 12) → update users.password_hash |

### 2.5 Cookies — `apps/api/src/modules/auth/cookies.ts` (جديد)

```ts
import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
import type { Context } from 'hono';

const COOKIE_OPTS = {
  path: '/auth',
  httpOnly: true,
  secure: true,           // يعمل مع Nginx Proxy (HTTPS terminate)
  sameSite: 'Strict' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 أيام
};

export function setRefreshCookie(c: Context, token: string) {
  setCookie(c, 'refresh_token', token, COOKIE_OPTS);
}

export function getRefreshCookie(c: Context): string | undefined {
  return getCookie(c, 'refresh_token');
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, 'refresh_token', { path: '/auth' });
}
```

> **ملاحظة فنية:** بما أن Frontend (Vite) و Backend (Hono) خلف **Nginx Proxy**، الـ Cookie `secure` يعمل بشكل صحيح حتى على localhost إذا كان Nginx يُنهي HTTPS. `path=/auth` يضمن ألا تُرسل الـ Cookie إلا لمسارات `/api/auth/*`.

### 2.6 Auth Middleware — `apps/api/src/shared/middleware/auth.ts` (إعادة كتابة)

```ts
import type { MiddlewareHandler } from 'hono';
import { verifyAccessToken } from '../../modules/auth/jwt.js';
import { db } from '../../db/index.js';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const payload = await verifyAccessToken(auth);
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(payload.sub);
    if (!user) return c.json({ error: 'User not found' }, 401);
    c.set('user', user);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};
```

### 2.7 Auth Handlers — `apps/api/src/modules/auth/handlers.ts` (إعادة كتابة)

| Route | Method | Middleware | الوصف |
|-------|--------|------------|-------|
| `/auth/register` | POST | — | zod validation + bcrypt + insert user |
| `/auth/login` | POST | — | bcrypt compare → issue Access JWT + Refresh Cookie |
| `/auth/refresh` | POST | — | read Cookie `refresh_token` → verify hash → issue new Access JWT |
| `/auth/logout` | POST | `authMiddleware` | delete all refresh tokens for user + clear Cookie |
| `/auth/me` | GET | `authMiddleware` | return `c.get('user')` |
| `/auth/password` | PATCH | `authMiddleware` | bcrypt hash new password + update |

### 2.8 Rate Limiting — `apps/api/src/shared/middleware/rate-limit.ts` (جديد)

```ts
import { rateLimiter } from 'hono-rate-limiter';

export const loginRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
});
```

> يُطبَّق على `/auth/login` و `/auth/register` فقط.

---

## المرحلة 3: Frontend — إعادة بناء كاملة

### 3.1 Auth Store — `apps/web/src/modules/auth/stores/auth.ts` (إعادة كتابة)

| الجزء | التغيير |
|-------|---------|
| Token Storage | **إزالة `localStorage` بالكامل للتوكن** — Access JWT يُخزَّن في `ref` فقط (memory) |
| Refresh Token | يُدار من `Cookie` (httpOnly) — لا نلمسه من JS |
| Guest Mode | يُحتفظ به — Guest يحصل على `guest-jwt` منفصل (scope محدود) |
| `login()` | POST /auth/login → يستلم `{ user }` + Access Token في response body → يخزن في ref |
| `refresh()` | POST /auth/refresh (Cookie تُرسل تلقائياً) → يستلم Access Token جديد |
| `fetchMe()` | GET /auth/me (مع Bearer header) |
| `logout()` | POST /auth/logout → يمسح memory + Cookie تُمسح من Backend |
| `isTokenExpired()` | **إزالة** — الـ expiry يُدار من `jose` verify على الخادم |

### 3.2 HTTP Service — `apps/web/src/services/http.ts` (تحديث)

```ts
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  let response = await fetch(apiUrl(path), { ...options, headers: mergedHeaders });

  if (response.status === 401 && accessToken) {
    // حاول refresh
    try {
      const refreshRes = await fetch(apiUrl('/auth/refresh'), { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        const { token } = await refreshRes.json();
        setAccessToken(token);
        // إعادة الطلب الأصلي
        mergedHeaders.Authorization = `Bearer ${token}`;
        response = await fetch(apiUrl(path), { ...options, headers: mergedHeaders });
      }
    } catch {
      setAccessToken(null);
    }
  }

  if (!response.ok) throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}
```

> **ملاحظة:** `credentials: 'include'` ضروري لإرسال `Cookie` مع الطلبات.

### 3.3 Route Guards — `apps/web/src/router.ts` (تحديث)

```ts
import { useAuthStore } from './modules/auth/stores/auth';

const routes = [
  {
    path: '/home',
    meta: { requiresAuth: true, roles: ['student', 'teacher', 'admin'] },
    component: () => import('./pages/dashboard.vue'),
  },
  {
    path: '/teacher/classes',
    meta: { requiresAuth: true, roles: ['teacher', 'admin'] },
  },
  {
    path: '/student/join',
    meta: { requiresAuth: true, roles: ['student'] },
  },
];

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/');
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return next('/unauthorized');
  }
  next();
});
```

### 3.4 Guest Mode — تحسين

```ts
// Guest يحصل على token منفصل (guest-jwt) محدود الصلاحيات
// لا يمكنه: إنشاء فصول، إرسال تقارير، الوصول للـ dashboard الكامل
// الـ Backend يُعيد 403 على routes المحمية
```

### 3.5 UI Components — تحديث

| الملف | التغيير |
|-------|---------|
| `pages/login.vue` | إضافة: "نسيت كلمة المرور" link، zod validation (frontend) |
| `pages/register.vue` | إضافة: password strength indicator (min 6 chars) |
| `modules/auth/components/LoginForm.vue` | **يُحذف** — يتكرر مع `LandingLoginForm.vue` و `pages/login.vue` |
| `components/layout/AppNavbar.vue` | إظهار/إخفاء items حسب `role` |

---

## المرحلة 4: الميزات المتقدمة

### 4.1 Email Verification
- حقل `email_verified_at` في `users`.
- عند التسجيل: `POST /auth/register` → إرسال رابط تأكيد (mock أو Resend API).
- `POST /auth/verify-email` مع token.

### 4.2 Password Reset
- `POST /auth/forgot-password` → إرسال رابط reset (token مؤقت في DB مع expiry 1h).
- `POST /auth/reset-password` → تأكيد.

### 4.3 Activity Logging
- جدول `user_activities`: `user_id`, `action`, `ip`, `user_agent`, `created_at`.
- تسجيل: تسجيل دخول، تسجيل خروج، تغيير كلمة مرور.

### 4.4 Session Management
- قائمة "الأجهزة النشطة" للمستخدم (من refresh_tokens).
- `POST /auth/logout-all` → حذف كل refresh_tokens للمستخدم.

---

## المرحلة 5: الاختبار

| نوع الاختبار | الملف |
|-------------|-------|
| Unit Tests (Backend) | `apps/api/src/modules/auth/services.test.ts` |
| Integration Tests (API) | `apps/api/src/modules/auth/handlers.test.ts` |
| E2E Tests (Frontend) | `apps/web/e2e/auth.spec.ts` (Playwright) |

---

## 📁 ملفات جديدة ستُنشأ

```
apps/api/src/
  ├── db/
  │   ├── index.ts              (SQLite + Simple Migration Runner)
  │   └── migrations/
  │       ├── 001_init.sql      (users, refresh_tokens, classes, class_students)
  │       └── 002_add_guest.sql (إذا لزم)
  ├── modules/auth/
  │   ├── jwt.ts                (jose: sign + verify)
  │   ├── cookies.ts            (set/get/clear refresh_token cookie)
  │   └── crypto.ts             (bcryptjs helpers)
  └── shared/middleware/
      └── rate-limit.ts         (hono-rate-limiter)

packages/shared-types/src/
  ├── auth.ts                   (JWT + Auth DTOs)
  └── class.ts                  (Class DTOs)

apps/web/src/
  ├── services/
  │   └── auth.interceptor.ts   (401 → refresh → retry)
  └── modules/auth/
      └── guards/
          └── role-guard.ts
```

## 📁 ملفات ستُعدَّل

```
apps/api/src/
  ├── modules/auth/
  │   ├── services.ts           (إعادة كتابة كاملة)
  │   ├── handlers.ts           (routes + validation + cookies)
  │   └── schemas.ts            (إضافة refreshSchema)
  ├── shared/middleware/auth.ts   (JWT verify فعلي)
  └── index.ts                (CORS: credentials + rate limiting)

apps/web/src/
  ├── modules/auth/stores/auth.ts   (إعادة كتابة — إزالة localStorage)
  ├── services/http.ts              (interceptor + credentials: include)
  ├── router.ts                     (guards)
  ├── pages/login.vue               (forgot password link)
  └── pages/register.vue            (password strength)
```

---

## 🗓️ خطة التنفيذ الزمنية

| المرحلة | المدة | الأولوية |
|---------|-------|----------|
| 0: التحليل | ✅ تم | — |
| 1: التبعيات + SQLite + Migration Runner | 1-2 ساعات | 🔴 حرجة |
| 2.1: Backend JWT + Cookies + bcrypt | 2-3 ساعات | 🔴 حرجة |
| 2.2: Backend Services + Handlers | 2-3 ساعات | 🔴 حرجة |
| 2.3: Backend Middleware (auth + rate-limit) | 1-2 ساعات | 🔴 حرجة |
| 3.1: Frontend Store (إعادة كتابة) | 2-3 ساعات | 🟡 عالية |
| 3.2: Frontend HTTP + Interceptor | 1-2 ساعات | 🟡 عالية |
| 3.3: Frontend Route Guards | 1 ساعة | 🟡 عالية |
| 3.4: Frontend UI تحديث | 1-2 ساعات | 🟢 متوسطة |
| 4: ميزات متقدمة (email, reset, activity) | 4-6 ساعات | 🔵 لاحقاً |
| 5: Tests | 2-3 ساعات | 🟡 عالية |

**المجموع التقريبي:** 17-27 ساعة.

---

## 🎯 نقاط ضمان الجودة (Quality Gates)

1. **لا يوجد `localStorage` لأي token** بعد الإنتهاء.
2. **كلمة المرور الثابتة `123456` تُحذف** بالكامل.
3. **JWT وهمي `fake-jwt-token` يُحذف** — يُستبدل بتوقيع `jose`.
4. **Middleware يتحقق فعلياً** من التوكن (لا يوجد `// TODO`).
5. **Cookie خصائصها:** `path=/auth; secure; httpOnly; sameSite=Strict`.
6. **Migrations يُشغَّل تلقائياً** عند إقلاع السيرفر (بدون أدوات ORM).
7. **Rate Limiting** يعمل على `/auth/login` و `/auth/register`.
8. **Route Guards** يحميان `/home` و `/dashboard` و routes الداخلية.

---

*تم تحديث هذه الخطة بتاريخ: 20 يونيو 2026*
