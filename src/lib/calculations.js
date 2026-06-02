export function getAttendanceStats(sessions, records, studentId, subjectId) {
  const subjectSessions = sessions.filter(
    (s) => s.subject_id === subjectId && s.completed
  )
  const totalSessions = subjectSessions.length
  const attended = records.filter((r) =>
    r.student_id === studentId &&
    r.status === 'present' &&
    subjectSessions.some((s) => s.id === r.session_id)
  ).length

  return {
    attended,
    total: totalSessions,
    percentage: totalSessions > 0 ? (attended / totalSessions) * 100 : null,
    isBelowThreshold: totalSessions > 0 && (attended / totalSessions) < 0.75,
  }
}

export function getSubjectStatsForAllStudents(students, sessions, records, subjectId) {
  return students.map((student) => {
    const stats = getAttendanceStats(sessions, records, student.id, subjectId)
    return {
      ...student,
      ...stats,
    }
  })
}

export function formatAttendancePercent(value) {
  if (value === null || value === undefined) return 'N/A'
  return `${Math.round(value)}%`
}