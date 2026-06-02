# CR Attendance Manager

A polished, portfolio-grade attendance web app for Class Representatives at Pakistani universities.

| Stack | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Database / Auth | Supabase |
| State | Zustand |
| Icons | Lucide React |
| Dates | date-fns |
| Toasts | react-hot-toast |
| Deploy | Vercel |

## Setup

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase/schema.sql` in the SQL Editor
   - Copy your project URL and anon key

3. **Environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Features

- **Authentication** — Email + password via Supabase Auth
- **Profile Setup** — CR name, batch, dept code, section
- **Student Database** — Add individually or bulk CSV import
- **Take Attendance** — One-at-a-time with swipe gestures or Quick Mark mode
- **Attendance % Tracking** — Per-subject stats, red badge below 75%
- **History** — Sessions grouped by subject with detailed reports
- **Share Reports** — WhatsApp-ready text via Web Share API or clipboard
- **Settings** — Edit profile, export/import JSON backup, clear data

## Project Structure

```
src/
  components/
    layout/        BottomNav, PageHeader
    ui/            Button, Badge, EmptyState, ProgressBar
  pages/
    Auth/          LoginPage, SetupPage
    Attendance/    SubjectSelectPage, TakingPage, QuickMarkPage, SummaryPage
    Students/      StudentsPage, AddStudentModal, BulkImportModal
    History/       HistoryPage, SessionDetailPage, SubjectStatsPage
    Settings/      SettingsPage
  store/
    authStore.js, studentsStore.js, attendanceStore.js
  lib/
    supabase.js, calculations.js, shareUtils.js, csvParser.js
```

## License

MIT
