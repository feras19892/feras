import { db } from '../../db/index.js';
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
export async function createClass(teacherId, name) {
    const id = 'cls-' + Date.now();
    const code = generateCode();
    await db.run('INSERT INTO classes (id, name, code, teacher_id) VALUES (?, ?, ?, ?)', id, name, code, teacherId);
    return { id, name, code };
}
export async function getTeacherClasses(teacherId) {
    return db.all('SELECT id, name, code, is_active, created_at FROM classes WHERE teacher_id = ? ORDER BY created_at DESC', teacherId);
}
export async function getStudentClasses(studentId) {
    return db.all(`SELECT c.id, c.name, c.code, c.teacher_id, c.created_at
     FROM classes c
     JOIN class_students cs ON c.id = cs.class_id
     WHERE cs.student_id = ? AND c.is_active = 1
     ORDER BY cs.joined_at DESC`, studentId);
}
export async function getClassById(classId) {
    return db.get('SELECT * FROM classes WHERE id = ?', classId);
}
export async function getClassStudents(classId) {
    return db.all(`SELECT u.id, u.name, u.email, cs.joined_at
     FROM users u
     JOIN class_students cs ON u.id = cs.student_id
     WHERE cs.class_id = ?
     ORDER BY cs.joined_at`, classId);
}
export async function joinClassByCode(studentId, code) {
    const cls = await db.get('SELECT * FROM classes WHERE code = ? AND is_active = 1', code);
    if (!cls)
        return { success: false, message: 'الكود غير صحيح أو الفصل مغلق' };
    const existing = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', cls.id, studentId);
    if (existing)
        return { success: false, message: 'أنت مشترك في هذا الفصل مسبقاً' };
    await db.run('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', cls.id, studentId);
    return { success: true, class_id: cls.id, name: cls.name, code: cls.code };
}
export async function deleteClass(classId, teacherId) {
    const cls = await db.get('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!cls)
        return { success: false, message: 'الفصل غير موجود' };
    if (cls.teacher_id !== teacherId)
        return { success: false, message: 'غير مصرح' };
    await db.run('DELETE FROM classes WHERE id = ?', classId);
    return { success: true };
}
export async function getPendingReportsCount(teacherId) {
    return db.get(`SELECT COUNT(*) as count
     FROM experiment_reports r
     JOIN classes c ON r.class_id = c.id
     WHERE c.teacher_id = ? AND r.status = 'submitted'`, teacherId);
}
export async function updateClass(classId, teacherId, data) {
    const cls = await db.get('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!cls)
        return { success: false, message: 'الفصل غير موجود' };
    if (cls.teacher_id !== teacherId)
        return { success: false, message: 'غير مصرح' };
    const sets = [];
    const vals = [];
    if (data.name !== undefined) {
        sets.push('name = ?');
        vals.push(data.name);
    }
    if (data.is_active !== undefined) {
        sets.push('is_active = ?');
        vals.push(data.is_active ? 1 : 0);
    }
    if (sets.length === 0)
        return { success: true };
    vals.push(classId);
    await db.run(`UPDATE classes SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...vals);
    return { success: true };
}
export async function getClassStats(classId) {
    const studentCount = await db.get(`SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, classId);
    const reports = await db.all(`SELECT student_id, status, grade FROM experiment_reports WHERE class_id = ?`, classId);
    const totalReports = reports.length;
    const graded = reports.filter((r) => r.status === 'graded');
    const classAvg = graded.length > 0
        ? Math.round(graded.reduce((s, r) => s + (r.grade || 0), 0) / graded.length)
        : 0;
    // Top students by average grade
    const studentMap = {};
    for (const r of reports) {
        if (!studentMap[r.student_id])
            studentMap[r.student_id] = { grades: [], count: 0 };
        if (r.grade !== null && r.grade !== undefined)
            studentMap[r.student_id].grades.push(r.grade);
        studentMap[r.student_id].count++;
    }
    const topStudents = Object.entries(studentMap)
        .map(([id, data]) => ({
        student_id: Number(id),
        avg: data.grades.length > 0 ? Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length) : 0,
        report_count: data.count,
    }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);
    return {
        student_count: studentCount?.count || 0,
        total_reports: totalReports,
        graded_count: graded.length,
        pending_count: totalReports - graded.length,
        class_average: classAvg,
        top_students: topStudents,
    };
}
