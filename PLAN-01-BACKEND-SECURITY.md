# خطة المحور الأول: تدقيق وتحسين أمان الخلفية
## Backend Security Audit & Hardening

**المدة المُقدرة:** 2-3 ساعات  
**التبعيات:** لا شيء  
**الأولوية:** حرج

---

## المرحلة 1.1: تحليل الوضع الراهن (15 دقيقة)

**الهدف:** فهم ما هو موجود وما ينقص قبل التعديل.

| الملف | ما يُفعل |
|-------|----------|
| `apps/api/src/index.ts` | تسجيل الـ middlewares الحالية وترتيبها |
| `apps/api/src/shared/middleware/` | قائمة الملفات الموجودة (logger.ts, rate-limit.ts) |
| `apps/api/package.json` | التحقق من توفر `hono/cors` |

**المخرج:** قائمة缺口 (gap analysis).

---

## المرحلة 1.2: إنشاء middleware ترويسات الأمان (30 دقيقة)

**الملف المُنشأ:** `apps/api/src/shared/middleware/security.ts`

**المهام:**
1. كتابة middleware يُضيف الترويسات التالية لكل response:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security: max-age=63072000` (في الإنتاج فقط)
2. قراءة `NODE_ENV` من متغيرات البيئة لتفعيل HSTS فقط في production.
3. تصدير الـ middleware باسم `securityHeaders`.

**الاختبار:** `curl -I http://localhost:3000/api/health` ← يجب رؤية الترويسات.

---

## المرحلة 1.3: إنشاء middleware CORS صارم (30 دقيقة)

**الملف المُنشأ:** `apps/api/src/shared/middleware/cors.ts`

**المهام:**
1. تعريف قائمة Allowed Origins من `CORS_ORIGIN` (env):
   - التطوير: `http://localhost:5173`
   - الإنتاج: قيمة من `.env`
2. رفض أي Origin غير موجود في القائمة بـ `403`.
3. السماح بالطرق: `GET, POST, PUT, DELETE, PATCH, OPTIONS`.
4. الترويسات المسموحة: `Content-Type, Authorization`.
5. السماح بـ `credentials: true` فقط مع Origins معروفة.

**الاختبار:**
- طلب من `localhost:5173` ← `200`
- طلب من `example.com` ← `403`

---

## المرحلة 1.4: دمج الـ Middlewares في index.ts (20 دقيقة)

**الملف المُعدّل:** `apps/api/src/index.ts`

**ترتيب الـ Middlewares المطلوب:**
```
1. CORS (أولاً — قبل أي منطق)
2. Security Headers
3. Rate Limit
4. Logger
5. Auth Middleware (للـ routes المحمية فقط)
6. Routes
```

**المهام:**
1. استيراد `securityHeaders` و `corsMiddleware`.
2. إعادة ترتيب الـ `app.use(...)` حسب الترتيب أعلاه.
3. التأكد من أن CORS تسبق كل شيء (حتى الـ logger).

---

## المرحلة 1.5: اختبار شامل (30 دقيقة)

**اختبارات يدوية:**
| الاختبار | الطريقة | النتيجة المتوقعة |
|----------|---------|-----------------|
| CORS صحيح | `curl -H "Origin: http://localhost:5173"` | `Access-Control-Allow-Origin` موجود |
| CORS خاطئ | `curl -H "Origin: https://evil.com"` | `403 Forbidden` |
| Headers أمان | `curl -I /api/health` | `X-Frame-Options: DENY` موجود |
| Embed في iframe | صفحة HTML خارجية تحاول iframe للـ API | مرفوض |
| API يعمل | تسجيل دخول عبر Web | يعمل طبيعياً |

**اختبار TypeScript:**
- `pnpm typecheck` ← ناجح

---

## المرحلة 1.6: تحديث Docker & Documentation (15 دقيقة)

**المهام:**
1. التأكد من أن `.env.example` يحتوي على `CORS_ORIGIN`.
2. إضافة `CORS_ORIGIN` في `docker-compose.yml` (للإنتاج).
3. كتابة 3 أسطر في README عن الـ security headers.

---

## ملخص المخرجات

- `apps/api/src/shared/middleware/security.ts` ← جديد
- `apps/api/src/shared/middleware/cors.ts` ← جديد
- `apps/api/src/index.ts` ← مُعدّل (ترتيب middlewares)
- `.env.example` ← مُحدّث
