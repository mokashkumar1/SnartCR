import { useState } from 'react'
import { useStudentsStore } from '../../store/studentsStore'
import { parseStudentCSV } from '../../lib/csvParser'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { X, FileText, Copy, Sparkles } from 'lucide-react'

export default function BulkImportModal({ onClose, onImported }) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addStudentsBulk } = useStudentsStore()

  const handleCopyPrompt = () => {
    const prompt = `Please act as a data extractor. I have attached a document/image containing student roll numbers.

CRITICAL FIRST STEP:
Do NOT extract the data yet. First, ask me: "Do you want to extract ALL roll numbers, ONLY EVEN roll numbers, or ONLY ODD roll numbers?"
Wait for my answer.

SECOND STEP:
Once I answer, extract the data according to my choice.

RULES FOR EXTRACTION:
1. Output ONLY a clean list with format: RollNumber, Full Name
2. If a name is missing in the image, just output the RollNumber.
3. DO NOT include any markdown formatting, headers, bullet points, or extra text. Just the raw list.`
    
    navigator.clipboard.writeText(prompt)
    showToast('AI Prompt copied to clipboard!')
  }

  const handleParse = () => {
    if (!text.trim()) {
      setPreview(null)
      return
    }
    const result = parseStudentCSV(text)
    setPreview(result)
  }

  const handleImport = async () => {
    if (!preview || preview.students.length === 0) return
    setLoading(true)
    try {
      await addStudentsBulk(preview.students)
      showToast(`Imported ${preview.students.length} students${preview.skipped > 0 ? `, skipped ${preview.skipped} duplicates` : ''}`)
      onImported()
    } catch (err) {
      showToast(err.message || 'Import failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-slate-50 dark:bg-[#131B2F] border border-slate-200 dark:border-[#1E293B] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Bulk Import</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-navy-700 text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste CSV: <code className="text-blue-400">RollNo, Name</code> one per line.
          </p>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2 py-1 rounded-md transition-colors shrink-0"
            title="Copy a prompt to use with ChatGPT/Gemini to extract from images/PDFs"
          >
            <Sparkles size={14} />
            Copy AI Prompt
          </button>
        </div>

        <details className="mb-3 group">
          <summary className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center transition-colors">
            <span className="w-4 h-4 inline-flex items-center justify-center mr-1 transition-transform group-open:rotate-90">▶</span>
            Need to extract from an Image or PDF?
          </summary>
          <div className="pl-5 pt-1 pb-2 space-y-1 text-xs text-slate-500 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg mt-1 border border-slate-100 dark:border-slate-800/50 p-2">
            <p>1. Click <strong className="text-indigo-500">✨ Copy AI Prompt</strong> above.</p>
            <p>2. Open <strong>ChatGPT / Gemini</strong> and paste the prompt + your image.</p>
            <p>3. Reply if you want <strong>All, Even, or Odd</strong> rolls.</p>
            <p>4. Copy the generated list and paste it below!</p>
          </div>
        </details>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPreview(null) }}
          placeholder={`24CS030, Moksh Kumar\n24CS031, Ali Khan\nBSCS-20-01, Sara Ahmed`}
          className="w-full h-40 p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono resize-none"
        />

        <Button variant="outline" className="mt-3 w-full" onClick={handleParse}>
          <FileText size={16} className="mr-2" /> Preview
        </Button>

        {preview && (
          <div className="mt-3 flex-1 overflow-y-auto no-scrollbar">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Found {preview.students.length} students · Skipped {preview.skipped} duplicates
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
              {preview.students.map((s, i) => (
                <div key={i} className="flex justify-between text-sm px-2 py-1 bg-white dark:bg-[#0B1120] rounded-lg">
                  <span className="text-slate-900 dark:text-white font-mono">{s.roll_number}</span>
                  <span className="text-slate-500 dark:text-slate-400">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1E293B]">
          <Button size="lg" className="w-full" onClick={handleImport} disabled={!preview || preview.students.length === 0 || loading}>
            {loading ? 'Importing...' : `Import ${preview?.students.length || 0} Students`}
          </Button>
        </div>
      </div>
    </div>
  )
}