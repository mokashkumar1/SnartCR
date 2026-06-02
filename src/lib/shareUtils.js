import { format } from 'date-fns'

export function buildWhatsAppReport({ classInfo, subjectName, date, absentees, totalStudents, presentCount, crName }) {
  const absentCount = absentees.length
  const percentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0'
  const absentRolls = absentees.map((a) => a.roll_number).join(', ')

  let text = `📋 Attendance Report
`
  text += `Class: ${classInfo} | Subject: ${subjectName}
`
  text += `Date: ${format(new Date(date), 'EEEE, d MMMM yyyy')}

`

  if (absentCount > 0) {
    text += `❌ Absent (${absentCount} students):
${absentRolls}

`
  } else {
    text += `✅ All ${totalStudents} students present

`
  }

  text += `✅ Present: ${presentCount}/${totalStudents} students (${percentage}%)
`
  text += `— CR: ${crName}`

  return text
}

export async function shareReport(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Attendance Report', text })
      return { method: 'share', success: true }
    } catch (err) {
      if (err.name !== 'AbortError') {
        return copyToClipboard(text)
      }
      return { method: 'share', success: false, aborted: true }
    }
  } else {
    return copyToClipboard(text)
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return { method: 'clipboard', success: true }
  } catch {
    return { method: 'clipboard', success: false }
  }
}