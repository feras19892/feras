import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

// Jaccard similarity on token sets
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  // Normalize: lowercase, remove punctuation, split on whitespace
  const normalized = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, ' ').trim();
  const tokens = normalized.split(/\s+/).filter(t => t.length > 2); // ignore very short tokens
  return new Set(tokens);
}

function parseReadings(readings: string): { values: number[]; raw: string } {
  try {
    const parsed = JSON.parse(readings);
    if (Array.isArray(parsed)) {
      // Extract numeric values from readings
      const values: number[] = [];
      for (const r of parsed) {
        if (typeof r === 'number') values.push(r);
        else if (typeof r === 'object') {
          for (const v of Object.values(r)) {
            if (typeof v === 'number') values.push(v);
          }
        }
      }
      return { values, raw: readings };
    }
  } catch {
    // not JSON
  }
  return { values: [], raw: readings };
}

function compareReadings(r1: string, r2: string): number {
  const p1 = parseReadings(r1);
  const p2 = parseReadings(r2);
  if (p1.values.length === 0 || p2.values.length === 0) return 0;

  // Compare sorted numeric arrays
  const sorted1 = [...p1.values].sort((a, b) => a - b);
  const sorted2 = [...p2.values].sort((a, b) => a - b);

  if (sorted1.length !== sorted2.length) {
    // Different number of readings — compare overlapping portion
    const minLen = Math.min(sorted1.length, sorted2.length);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (Math.abs(sorted1[i] - sorted2[i]) < 0.01) matches++;
    }
    return Math.round((matches / minLen) * 100);
  }

  let matches = 0;
  for (let i = 0; i < sorted1.length; i++) {
    if (Math.abs(sorted1[i] - sorted2[i]) < 0.01) matches++;
  }
  return Math.round((matches / sorted1.length) * 100);
}

export interface PlagiarismResult {
  report1_id: number;
  report2_id: number;
  student1_name: string;
  student2_name: string;
  similarity_score: number;
  matched_fields: string[];
}

export async function detectPlagiarism(
  classId: string,
  experimentName: string,
  detectorId: number,
): Promise<PlagiarismResult[]> {
  // Get all submitted reports for this class+experiment
  const reports = await db.all<{
    id: number; student_id: number; student_name: string;
    readings: string; conclusion: string; equations: string;
  }[]>(
    `SELECT r.id, r.student_id, u.name as student_name, r.readings, r.conclusion, r.equations
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     WHERE r.class_id = ? AND r.experiment_name = ? AND r.status IN ('submitted','graded','resubmitted')
     ORDER BY r.submitted_at ASC`,
    classId, experimentName,
  );

  if (reports.length < 2) return [];

  const results: PlagiarismResult[] = [];

  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const r1 = reports[i];
      const r2 = reports[j];

      const matchedFields: string[] = [];
      let totalScore = 0;
      let fieldCount = 0;

      // Compare readings
      const readingsScore = compareReadings(r1.readings, r2.readings);
      if (readingsScore >= 80) {
        matchedFields.push(`readings (${readingsScore}%)`);
        totalScore += readingsScore;
        fieldCount++;
      }

      // Compare conclusions (text similarity)
      const conclusionScore = jaccardSimilarity(
        tokenize(r1.conclusion || ''),
        tokenize(r2.conclusion || ''),
      );
      if (conclusionScore >= 60) {
        matchedFields.push(`conclusion (${conclusionScore}%)`);
        totalScore += conclusionScore;
        fieldCount++;
      }

      // Compare equations
      const equationsScore = jaccardSimilarity(
        tokenize(r1.equations || ''),
        tokenize(r2.equations || ''),
      );
      if (equationsScore >= 70) {
        matchedFields.push(`equations (${equationsScore}%)`);
        totalScore += equationsScore;
        fieldCount++;
      }

      if (fieldCount > 0) {
        const avgScore = Math.round(totalScore / fieldCount);
        if (avgScore >= 60) {
          results.push({
            report1_id: r1.id,
            report2_id: r2.id,
            student1_name: r1.student_name,
            student2_name: r2.student_name,
            similarity_score: avgScore,
            matched_fields: matchedFields,
          });

          // Store in database
          await db.run(
            `INSERT INTO plagiarism_flags (class_id, experiment_name, report1_id, report2_id, student1_name, student2_name, similarity_score, matched_fields, detected_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            classId, experimentName, r1.id, r2.id,
            r1.student_name, r2.student_name,
            avgScore, matchedFields.join('; '), detectorId,
          );
        }
      }
    }
  }

  // Notify teacher if any plagiarism detected
  if (results.length > 0) {
    const cls = await db.get<{ teacher_id: number }>(`SELECT teacher_id FROM classes WHERE id = ?`, classId);
    if (cls) {
      await createNotification({
        user_id: cls.teacher_id,
        type: 'plagiarism_detected',
        title: `⚠️ تشابه مشبوه في التجربة: ${experimentName}`,
        message: `تم رصد ${results.length} حالة تشابه بين تقارير الطلاب في هذه التجربة`,
        class_id: classId,
      });
    }
  }

  return results;
}

export async function getPlagiarismFlags(
  classId?: string,
  status?: string,
  limit = 100,
  schoolId?: number,
): Promise<any[]> {
  if (schoolId) {
    let sql = `SELECT pf.* FROM plagiarism_flags pf
      JOIN classes c ON pf.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE u.school_id = ?`;
    const params: (string | number)[] = [schoolId];
    if (classId) { sql += ' AND pf.class_id = ?'; params.push(classId); }
    if (status) { sql += ' AND pf.status = ?'; params.push(status); }
    sql += ' ORDER BY pf.created_at DESC LIMIT ?';
    params.push(limit);
    return db.all(sql, ...params);
  }
  if (classId) {
    return db.all(
      `SELECT * FROM plagiarism_flags WHERE class_id = ? ${status ? 'AND status = ?' : ''} ORDER BY created_at DESC LIMIT ?`,
      ...(status ? [classId, status, limit] : [classId, limit]),
    );
  }
  return db.all(
    `SELECT * FROM plagiarism_flags ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC LIMIT ?`,
    ...(status ? [status, limit] : [limit]),
  );
}

export async function updatePlagiarismStatus(
  id: number,
  status: string,
  // eslint-disable-next-line no-unused-vars
  _reviewerId: number,
  note?: string,
): Promise<{ success: boolean; message?: string }> {
  const valid = ['pending', 'reviewed', 'confirmed', 'dismissed'];
  if (!valid.includes(status)) return { success: false, message: 'حالة غير صالحة' };

  await db.run(`UPDATE plagiarism_flags SET status = ?, note = ? WHERE id = ?`, status, note ?? null, id);

  // If confirmed, notify both students' teachers
  if (status === 'confirmed') {
    const flag = await db.get<any>(`SELECT * FROM plagiarism_flags WHERE id = ?`, id);
    if (flag) {
      const cls = await db.get<{ teacher_id: number }>(`SELECT teacher_id FROM classes WHERE id = ?`, flag.class_id);
      if (cls) {
        await createNotification({
          user_id: cls.teacher_id,
          type: 'plagiarism_confirmed',
          title: `تأكيد احتيال: ${flag.student1_name} و ${flag.student2_name}`,
          message: `تم تأكيد حالة تشابه (${flag.similarity_score}%) في تجربة "${flag.experiment_name}"`,
          class_id: flag.class_id,
        });
      }
    }
  }

  return { success: true };
}
