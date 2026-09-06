import 'dotenv/config'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import express, { type NextFunction, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { z } from 'zod'

const app = express()
const port = Number(process.env.API_PORT ?? 4000)
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production')
}

const tokenSecret = jwtSecret ?? 'development-only-secret'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

type Role = 'super_admin' | 'teacher' | 'student'
type AuthUser = { id: string; collegeId: string; role: Role; email: string }

type AuthRequest = Request & { user?: AuthUser }

app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

function signToken(user: AuthUser) {
  return jwt.sign(user, tokenSecret, { expiresIn: '15m' })
}

function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) return response.status(401).json({ error: 'Authentication required' })

  try {
    request.user = jwt.verify(token, tokenSecret) as AuthUser
    next()
  } catch {
    return response.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireRoles(...roles: Role[]) {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const marksSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  semesterId: z.string().uuid(),
  examType: z.enum(['internal1', 'internal2', 'midterm', 'final', 'assignment', 'practical']),
  marks: z.array(z.object({
    studentId: z.string().uuid(),
    marksObtained: z.number().min(0),
    maxMarks: z.number().positive(),
  })).min(1).max(500),
})

const profileUpdateSchema = z.object({
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  bio: z.string().max(1000).optional(),
})

app.get('/api/health', (_request, response) => {
  response.json({ service: 'student-profile-saas-api', status: 'ok' })
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body)
    const result = await pool.query<{ id: string; college_id: string; role: Role; email: string; password_hash: string; is_active: boolean }>(
      'SELECT id, college_id, role, email, password_hash, is_active FROM users WHERE email = $1 LIMIT 1',
      [input.email.toLowerCase()],
    )
    const user = result.rows[0]
    if (!user || !user.is_active || !(await bcrypt.compare(input.password, user.password_hash))) {
      return response.status(401).json({ error: 'Invalid email or password' })
    }

    const authUser: AuthUser = { id: user.id, collegeId: user.college_id, role: user.role, email: user.email }
    await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [user.id])
    return response.json({ accessToken: signToken(authUser), user: authUser })
  } catch (error) {
    next(error)
  }
})

app.get('/api/students/me', requireAuth, requireRoles('student'), async (request: AuthRequest, response, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, st.roll_number, st.linkedin_url, st.github_url,
              st.profile_photo_url, st.resume_url, st.bio, st.profile_strength,
              c.name AS class_name, d.name AS department_name
         FROM users u
         JOIN students st ON st.id = u.id AND st.college_id = u.college_id
         LEFT JOIN classes c ON c.id = st.class_id
         LEFT JOIN departments d ON d.id = st.department_id
        WHERE u.id = $1 AND u.college_id = $2`,
      [request.user!.id, request.user!.collegeId],
    )
    if (result.rowCount !== 1) return response.status(404).json({ error: 'Student profile not found' })
    return response.json({ profile: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

app.put('/api/students/me', requireAuth, requireRoles('student'), async (request: AuthRequest, response, next) => {
  try {
    const input = profileUpdateSchema.parse(request.body)
    const result = await pool.query(
      `UPDATE students
          SET linkedin_url = COALESCE($1, linkedin_url),
              github_url = COALESCE($2, github_url),
              bio = COALESCE($3, bio),
              profile_strength = LEAST(100,
                (CASE WHEN profile_photo_url IS NOT NULL THEN 20 ELSE 0 END) +
                (CASE WHEN resume_url IS NOT NULL THEN 25 ELSE 0 END) +
                (CASE WHEN COALESCE($1, linkedin_url) IS NOT NULL AND COALESCE($1, linkedin_url) <> '' THEN 15 ELSE 0 END) +
                (CASE WHEN COALESCE($2, github_url) IS NOT NULL AND COALESCE($2, github_url) <> '' THEN 15 ELSE 0 END) +
                (CASE WHEN COALESCE($3, bio) IS NOT NULL AND COALESCE($3, bio) <> '' THEN 10 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM marks WHERE student_id = students.id) THEN 15 ELSE 0 END))
        WHERE id = $4 AND college_id = $5
      RETURNING linkedin_url, github_url, bio, profile_strength`,
      [input.linkedinUrl, input.githubUrl, input.bio, request.user!.id, request.user!.collegeId],
    )
    if (result.rowCount !== 1) return response.status(404).json({ error: 'Student profile not found' })
    return response.json({ profile: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

app.get('/api/teacher/assignments', requireAuth, requireRoles('teacher'), async (request: AuthRequest, response, next) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.class_id, c.name AS class_name, a.subject_id, s.name AS subject_name,
              a.semester_id, sem.sem_number, a.status
         FROM teacher_class_assignments a
         JOIN classes c ON c.id = a.class_id
         JOIN subjects s ON s.id = a.subject_id
         JOIN semesters sem ON sem.id = a.semester_id
        WHERE a.teacher_id = $1 AND c.department_id IN (SELECT id FROM departments WHERE college_id = $2)
        ORDER BY a.status, sem.sem_number`,
      [request.user!.id, request.user!.collegeId],
    )
    return response.json({ assignments: result.rows })
  } catch (error) {
    next(error)
  }
})

app.get('/api/teacher/classes/:classId/students', requireAuth, requireRoles('teacher'), async (request: AuthRequest, response, next) => {
  try {
    const result = await pool.query(
      `SELECT st.id, u.full_name, st.roll_number, st.profile_strength
         FROM students st
         JOIN users u ON u.id = st.id AND u.college_id = $2
        WHERE st.class_id = $1
          AND EXISTS (
            SELECT 1 FROM teacher_class_assignments a
             WHERE a.teacher_id = $3 AND a.class_id = st.class_id
          )
        ORDER BY st.roll_number`,
      [request.params.classId, request.user!.collegeId, request.user!.id],
    )
    return response.json({ students: result.rows })
  } catch (error) {
    next(error)
  }
})

app.get('/api/teacher/analytics', requireAuth, requireRoles('teacher'), async (request: AuthRequest, response, next) => {
  try {
    const classId = z.string().uuid().parse(request.query.classId)
    const subjectId = z.string().uuid().parse(request.query.subjectId)
    const semesterId = z.string().uuid().parse(request.query.semesterId)
    const result = await pool.query(
      `SELECT AVG(m.marks_obtained / NULLIF(m.max_marks, 0) * 100)::numeric(5,2) AS average_percentage,
              COUNT(DISTINCT m.student_id)::int AS student_count,
              MAX(m.marks_obtained / NULLIF(m.max_marks, 0) * 100)::numeric(5,2) AS top_percentage
         FROM marks m
         JOIN students st ON st.id = m.student_id AND st.class_id = $1
        WHERE m.subject_id = $2 AND m.semester_id = $3
          AND EXISTS (
            SELECT 1 FROM teacher_class_assignments a
             WHERE a.teacher_id = $4 AND a.class_id = $1
               AND a.subject_id = m.subject_id AND a.semester_id = m.semester_id
          )`,
      [classId, subjectId, semesterId, request.user!.id],
    )
    return response.json({ analytics: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

app.post('/api/teacher/marks', requireAuth, requireRoles('teacher'), async (request: AuthRequest, response, next) => {
  const client = await pool.connect()
  try {
    const input = marksSchema.parse(request.body)
    await client.query('BEGIN')
    const assignment = await client.query(
      `SELECT 1 FROM teacher_class_assignments
        WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3 AND semester_id = $4`,
      [request.user!.id, input.classId, input.subjectId, input.semesterId],
    )
    if (assignment.rowCount !== 1) {
      await client.query('ROLLBACK')
      return response.status(403).json({ error: 'You are not assigned to this class, subject, or semester' })
    }

    for (const mark of input.marks) {
      if (mark.marksObtained > mark.maxMarks) {
        throw new Error(`Marks cannot exceed max marks for student ${mark.studentId}`)
      }
      await client.query(
        `INSERT INTO marks (student_id, subject_id, semester_id, teacher_id, exam_type, marks_obtained, max_marks, updated_at)
         SELECT $1, $2, $3, $4, $5, $6, $7, now()
          WHERE EXISTS (SELECT 1 FROM students WHERE id = $1 AND class_id = $8)
         ON CONFLICT (student_id, subject_id, semester_id, exam_type)
         DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, max_marks = EXCLUDED.max_marks,
                       teacher_id = EXCLUDED.teacher_id, updated_at = now()`,
        [mark.studentId, input.subjectId, input.semesterId, request.user!.id, input.examType, mark.marksObtained, mark.maxMarks, input.classId],
      )
    }
    await client.query('COMMIT')
    return response.status(201).json({ saved: input.marks.length })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid request', details: error.flatten() })
  console.error(error)
  return response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => console.log(`Student Profile SaaS API listening on http://localhost:${port}`))
