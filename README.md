# מערכת ניהול קורסים

אפליקציית Next.js 14 לייצור — TypeScript, Tailwind CSS, App Router, עברית מלאה ו-RTL.

## דרישות

- Node.js 18.18+ (מומלץ 20.9+)

## התקנה והרצה

```bash
npm install
cp .env.example .env.local
npm run dev
```

פתחו [http://localhost:3000](http://localhost:3000).

## סקריפטים

| פקודה | תיאור |
|--------|--------|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לייצור |
| `npm run start` | הרצת בנייה |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | בדיקת TypeScript |

## מבנה תיקיות

```
src/
├── app/              # App Router (דפים ו-layout)
├── components/
│   ├── layout/       # מעטפת, כותרת, תחתית
│   └── ui/           # רכיבי ממשק משותפים
├── config/           # הגדרות אתר ושפה
├── lib/              # כלי עזר (cn וכו')
└── types/            # טיפוסי TypeScript
```

## RTL ועברית

- `lang="he"` ו-`dir="rtl"` ב-`layout.tsx`
- גופן Heebo (תמיכה בעברית)
- בעיצוב: השתמשו במאפיינים לוגיים — `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`

## Mobile First

Tailwind מוגדר Mobile First: סגנונות בסיס לנייד, `sm:` ומעלה למסכים גדולים יותר.
