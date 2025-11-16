# تعليمات Copilot – تطبيق Next.js للتجارة الإلكترونية

## نظرة عامة على البنية المعمارية

هذا تطبيق **منصة تجارة إلكترونية مبنية على Next.js 15** مع إدارة التصنيفات والوسوم والمصادقة وقوائم التحكم.

### البنية الأساسية
- **الإطار**: Next.js 15.5.5 (App Router) + React 19
- **قاعدة البيانات**: MongoDB (Mongoose 8.19.1) عبر `utils/dbConnect.js`
- **المصادقة**: NextAuth 4.24.11 مع جلسات JWT، موفران ثنائيان (Google OAuth + بيانات المستخدم)
- **واجهة المستخدم**: Bootstrap Material Design + React Hot Toast للتنبيهات
- **حالة التطبيق**: Context API (بدون Redux) — `context/category.js` و `context/Tag.js`

### المجلدات الرئيسية
- `app/` – موجهات Next.js: الصفحات ومسارات API والتخطيطات وتدفقات المصادقة
- `components/` – مكونات واجهة المستخدم منظمة حسب الميزة (التنقل، التصنيف، الوسم)
- `models/` – مخطط Mongoose (التصنيف، الوسم، المستخدم)
- `utils/` – الأدوات المشتركة: `dbConnect`، `authOptions`
- `context/` – موفرو السياق React للحالة العامة

---

## تدفقات البيانات الحرجة

### 1. تدفق المصادقة
**الملف**: `utils/authOptions.js`
- **استراتيجية JWT**: يتم تخزين الجلسات كرموز JWT (بدون جلسات الخادم)
- **الموفرون**: 
  - Google OAuth (ينشئ مستخدم جديد في قاعدة البيانات تلقائياً إذا كان جديداً)
  - بيانات المستخدم (البريد الإلكتروني والكلمة المرور، يقارن الكلمة المرورية المشفرة مع bcrypt)
- **الوصول المبني على الأدوار**: يتم التحقق من `req?.nextauth?.token?.user?.role` في الوسيط
- **حماية المسؤول**: يتم حماية المسارات `/dashboard/admin/*` و `/api/admin/*` عبر `middleware.js` — يعيد التوجيه غير المسؤولين إلى الصفحة الرئيسية

### 2. إدارة التصنيفات والوسوم (CRUD)
**العميل**: `context/category.js` (نمط مشابه لـ `context/Tag.js`)
- **الإنشاء**: POST إلى `/api/admin/category` → Mongoose ينشئ المستند + slug تلقائي عبر `slugify`
- **القراءة**: GET `/api/category` → يجلب الكل (يتم استدعاؤه عبر `useEffect` في المكونات)
- **التحديث**: PUT `/api/admin/category/{id}` → Mongoose يحدث + يرجع المستند المحدث
- **الحذف**: DELETE `/api/admin/category/{id}` → يحذف من قاعدة البيانات
- **ردود فعل الواجهة**: جميع التعديلات تطلق تنبيهات `react-hot-toast` بالنجاح أو الخطأ

### 3. نمط طلب API
جميع عمليات جلب العميل تستخدم `process.env.NEXT_PUBLIC_API_URL`:
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tag`, { method: 'POST', ... })
```
معالجة الأخطاء: تحقق من `response.ok`، حلل JSON، التقط الأخطاء، وأظهر إشعارات.

---

## Key Conventions & Patterns

### Model Definitions
- **Schemas**: stored in `models/` (e.g., `models/tag.js`, `models/category.js`)
- **Slug Fields**: auto-indexed, lowercase, unique constraint via `slugify(name)`
- **Mongoose Pattern**: `mongoose.models.Tag || mongoose.model('Tag', tagSchema)` — prevents double-compilation in Next.js hot reload
- **Timestamps**: all schemas include `{ timestamps: true }`

### Context Providers
- **Naming**: `use${Feature}` (e.g., `useCategory`, `useTag`) — destructure from context hook
- **State Reset**: after mutations (create/update/delete), clear input fields and reset `updatingX` to `null`
- **Optimistic Updates**: UI updates array immediately (e.g., `setCategories([newCat, ...categories])`) for responsiveness

### Client Components
- Mark with `"use client"` (e.g., `components/tag/TagCreate.js`, `app/layout.js`)
- Fetch data in `useEffect(() => { fetchX() }, [])` — empty deps = once on mount
- Always destructure context first, then use JSX

### API Routes
- **Location**: `app/api/` with dynamic `[id]` segments in subfolders
- **Pattern**: 
  ```javascript
  import dbConnect from '@/utils/dbConnect';
  await dbConnect(); // connect before queries
  const doc = await Model.create({ ... });
  return NextResponse.json(doc);
  ```
- **Error Handling**: wrap in try/catch, return `{ status: 500, message: 'Server error...' }`

---

## Middleware & Role-Based Protection

**File**: `middleware.js`
- Protects routes via `withAuth` wrapper from NextAuth
- Checks `userRole` from JWT token: `req?.nextauth?.token?.user?.role`
- **Admin-only check**: if URL includes `/admin` and role ≠ `'admin'`, redirect to `/`
- Routes requiring auth: `/dashboard/user/*`, `/dashboard/admin/*`, `/api/user/*`, `/api/admin/*`

---

## Development Workflow

### Setup & Run
```bash
npm install                    # install deps
# Set .env: DB_URI, NEXT_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_API_URL
npm run dev                    # starts at http://localhost:3000
npm run build && npm start     # production build & start
```

### Path Alias
- `jsconfig.json` defines `@/*` → root directory
- Always use `@/components/...`, `@/models/...`, `@/utils/...` for imports

### Common Issues
- **MongoDB connection warnings**: `useNewUrlParser` & `useUnifiedTopology` deprecated (safe to ignore in Node 4.0+)
- **NEXTAUTH_URL warning**: Set `NEXTAUTH_URL` in `.env` for production
- **Hot reload**: Mongoose model re-registration prevented by `mongoose.models.X ||` pattern

---

## When Adding Features

1. **New Admin Feature** (e.g., Product management):
   - Create model in `models/product.js` with slug + timestamps
   - Add API routes: `app/api/admin/product/route.js` (POST, GET) + `[id]/route.js` (PUT, DELETE)
   - Create context in `context/product.js` following `category.js` pattern
   - Build components in `components/product/` (ProductCreate, ProductList)
   - Add routes in dashboard: `app/dashboard/admin/product/page.js`
   - Protect routes in middleware if needed

2. **New API Endpoint**:
   - Always call `await dbConnect()` first
   - Use NextResponse for consistency
   - Handle errors with try/catch + meaningful messages

3. **New Context**:
   - Export custom hook (e.g., `useProduct`)
   - Wrap in Provider in `app/layout.js`
   - Use `react-hot-toast` for all user feedback

---

## References

- **Next.js App Router**: https://nextjs.org/docs/app
- **NextAuth Docs**: https://next-auth.js.org/
- **Mongoose**: https://mongoosejs.com/
- **API Routes**: `app/api/admin/category/` & `app/api/admin/tag/` (serve as templates)
