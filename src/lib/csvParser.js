export function parseStudentCSV(text) {
  // A roll number is defined as any word that contains at least one digit.
  // It may contain letters, dashes, and numbers (e.g., 24CS002, BSCS-20-01, 19SW123, 24MTE01)
  // By splitting the text using this capturing regex, the array alternates between text and roll numbers.
  const parts = text.split(/([\w-]*\d+[\w-]*)/);

  const students = [];
  const seenRolls = new Set();
  let skipped = 0;

  for (let i = 1; i < parts.length; i += 2) {
    const roll = parts[i].trim();
    // The next element is the text between this roll number and the next (which is the name)
    let name = (parts[i + 1] || '').trim();
    
    // Clean up the name (remove leading/trailing commas, dashes, or extra spaces)
    name = name.replace(/^[,-\s]+|[,-\s]+$/g, '').replace(/\s+/g, ' ');

    if (!roll) continue;
    if (!name) name = 'No Name';

    const rollKey = roll.toLowerCase();
    if (seenRolls.has(rollKey)) {
      skipped++;
      continue;
    }
    seenRolls.add(rollKey);
    students.push({ roll_number: roll, name });
  }

  return { students, skipped };
}