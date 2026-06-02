export function parseStudentCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const students = []
  const seenRolls = new Set()
  let skipped = 0

  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length < 2) continue
    const [roll, name] = parts
    if (!roll || !name) continue
    const rollKey = roll.toLowerCase()
    if (seenRolls.has(rollKey)) {
      skipped++
      continue
    }
    seenRolls.add(rollKey)
    students.push({ roll_number: roll, name })
  }

  return { students, skipped }
}