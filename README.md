# Attendy - Smart Attendance Management System 🎓

![Attendy Banner](https://via.placeholder.com/1200x400/0B1120/818CF8?text=Attendy+-+Attendance+Management+System)

**Attendy** is a modern, full-stack Attendance Management application designed specifically for Class Representatives (CRs) and educators. Built with React, Tailwind CSS, and Supabase, it streamlines the tedious process of taking attendance, managing student records, and generating professional reports.

## ✨ Features

- **Robust Authentication:** Secure login, signup, and password recovery powered by Supabase Auth.
- **Smart Data Extraction:** Easily import student lists via CSV or copy-pasted text. Features a custom Regex-based parsing engine that flawlessly extracts Roll Numbers and Names even from messy, unformatted text.
- **AI OCR Integration Support:** Copy an optimized AI prompt directly from the app to use with ChatGPT/Gemini to extract student lists from photos of handwritten attendance sheets.
- **Advanced Export System:** Generates pixel-perfect, A4-paginated reports. Export attendance summaries as **PDFs, PNG Images, CSVs, or WhatsApp-ready text** using off-screen DOM rendering (`html2canvas` & `jsPDF`).
- **Low Attendance Dashboard:** Automatically cross-references all subjects and calculates global attendance percentages to immediately flag students falling below the 75% threshold.
- **Full Data Portability:** Secure, client-side JSON Backup and Restore functionality to keep your data safe across semesters.
- **Design System & Dark Mode:** A sleek, unified custom design system utilizing semantic CSS variables, offering a flawless toggle between Light and Dark modes.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS + Custom CSS Design Tokens
- **State Management:** Zustand (Modular stores for Auth, Students, and Attendance)
- **Backend & Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **PDF & Image Generation:** html2canvas, jsPDF

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/attendy.git
   cd attendy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Note: `.env` is included in `.gitignore` and will never be pushed to your repository).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture & Best Practices

- **Separation of Concerns:** Business logic is decoupled from UI components using Zustand stores (`authStore.js`, `studentsStore.js`, `attendanceStore.js`).
- **Design System Implementation:** Avoids chaotic utility-class sprawl by using a central `tokens.css` file mapped directly to the `tailwind.config.cjs`.
- **Heuristic Parsing:** Replaced fragile split-by-comma CSV logic with a robust RegEx engine that detects alphanumeric Roll Number signatures, ensuring a crash-free user experience during bulk imports.
- **Stable DOM Rendering:** The PDF/Image export engine renders on an isolated, off-screen A4 CSS grid and waits for `document.fonts.ready` and `requestAnimationFrame()` to guarantee zero text-clipping.

---
*Developed by [Your Name] - [Portfolio/LinkedIn Link]*
