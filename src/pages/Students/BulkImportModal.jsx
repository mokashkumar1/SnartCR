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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-dark-60 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="w-full sm:max-w-[560px] bg-surface-card border border-border rounded-t-xl sm:rounded-xl shadow-modal max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-dark">Bulk Import</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-muted text-dark-60 hover:text-dark transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto no-scrollbar flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-dark-60">
              Paste CSV: <code className="text-primary bg-primary-light px-1 rounded">RollNo, Name</code> one per line.
            </p>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-light hover:bg-border px-2 py-1 rounded-md transition-fast shrink-0"
              title="Copy a prompt to use with ChatGPT/Gemini to extract from images/PDFs"
            >
              <Sparkles size={14} />
              Copy AI Prompt
            </button>
          </div>

          <details className="mb-3 group">
            <summary className="text-xs font-medium text-dark-60 cursor-pointer hover:text-primary flex items-center transition-colors">
              <span className="w-4 h-4 inline-flex items-center justify-center mr-1 transition-transform group-open:rotate-90">▶</span>
              Need to extract from an Image or PDF?
            </summary>
            <div className="pl-5 pt-1 pb-2 space-y-1 text-xs text-dark-60 bg-surface-muted rounded-md mt-1 border border-border p-2">
              <p>1. Click <strong className="text-primary">✨ Copy AI Prompt</strong> above.</p>
              <p>2. Open <strong>ChatGPT / Gemini</strong> and paste the prompt + your image.</p>
              <p>3. Reply if you want <strong>All, Even, or Odd</strong> rolls.</p>
              <p>4. Copy the generated list and paste it below!</p>
            </div>
          </details>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setPreview(null) }}
            placeholder={`24CS030, Moksh Kumar\n24CS031, Ali Khan\nBSCS-20-01, Sara Ahmed`}
            className="w-full h-40 p-3 bg-surface-card border border-border rounded-md text-md text-dark placeholder:text-dark-30 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] focus:outline-none transition-fast font-mono resize-none"
          />

          <Button variant="neutral" className="mt-3 w-full" onClick={handleParse}>
            <FileText size={16} className="mr-2" /> Preview
          </Button>

          {preview && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-dark-60 mb-2">
                Found {preview.students.length} students · Skipped {preview.skipped} duplicates
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                {preview.students.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm px-2 py-1 bg-surface-muted rounded-md border border-border">
                    <span className="text-dark font-mono font-medium">{s.roll_number}</span>
                    <span className="text-dark-60">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!preview || preview.students.length === 0 || loading}>
            {loading ? 'Importing...' : `Import ${preview?.students.length || 0} Students`}
          </Button>
        </div>

      </div>
    </div>
  )
}