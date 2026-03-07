'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect, useState } from 'react'

export default function ExamReview() {
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    try {

      const { data: { session: authSession } } =
        await supabase.auth.getSession()

      if (!authSession?.user) {
        window.location.href = '/'
        return
      }

      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('sessionId')
console.log("SESSION DATA:", sess)
console.log("RAW ANSWERS:", sess.answers)
      if (!sessionId) {
        alert('Invalid review request')
        window.location.href = '/dashboard'
        return
      }

      // STEP 1 — Get student
      const { data: student, error: studentError } =
        await supabase
          .from('students')
          .select('id')
          .eq('email', authSession.user.email)
          .single()

      if (studentError || !student) {
        alert('Student record not found')
        window.location.href = '/dashboard'
        return
      }

      // STEP 2 — Get session
      const { data: sess, error: sessionError } =
        await supabase
          .from('exam_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('student_id', student.id)
          .single()

      if (sessionError || !sess) {
        alert('Session not found')
        window.location.href = '/dashboard'
        return
      }

      setSession(sess)

      // STEP 3 — Get exam
      if (sess.exam_id) {
        const { data: examData } =
          await supabase
            .from('exams')
            .select('*')
            .eq('id', sess.exam_id)
            .single()

        setExam(examData)
      }

      // STEP 4 — Load questions

      let answers = sess.answers || {}

      // Fix when answers stored as JSON string
      if (typeof answers === 'string') {
        try {
          answers = JSON.parse(answers)
        } 
          catch (e) {
    console.error("JSON parse failed:", e)
    //      answers = {}
        }
      }

console.log("PARSED ANSWERS:", answers)

const questionIds = Object.keys(answers).filter(k => k !== '__meta')

console.log("QUESTION IDS:", questionIds)

      if (questionIds.length > 0) {

        const { data: qs } =
          await supabase
            .from('question_bank')
            .select('*')
            .in('id', questionIds)
console.log("QUESTIONS FROM DB:", qs)
        const ordered =
          questionIds
            .map(id => qs?.find(q => q.id === id))
            .filter(Boolean)

        setQuestions(ordered)
      }

      setLoading(false)

    } catch (err) {
      console.error('Review Error:', err)
      alert('Something went wrong')
      window.location.href = '/dashboard'
    }
  }

  if (loading)
    return <p style={{ padding: 40 }}>Loading review…</p>

  const meta = session.answers?.__meta || {}
  const isPractice = meta.type === 'CUSTOM_TEST'

  return (
    <div style={styles.page}>
      <h1>📘 Exam Review</h1>

      {session?.proctor_status === 'REJECTED' && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #dc2626',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h3 style={{ color: '#991b1b', marginBottom: 8 }}>
            ⚠️ Attempt Cancelled by Admin
          </h3>

          <p style={{ color: '#7f1d1d' }}>
            Your score has been cancelled due to suspected malpractice during proctored examination. Please contact your incharge
          </p>

          {session.rejection_reason && (
            <p style={{ marginTop: 6, fontStyle: 'italic' }}>
              Reason: {session.rejection_reason}
            </p>
          )}
        </div>
      )}

      <div style={styles.metaBox}>
        {isPractice ? (
          <>
            <p><b>Subject:</b> {meta.subject}</p>
            <p><b>Chapters:</b> {meta.chapters?.join(', ')}</p>
            <p><b>Score:</b> {session.score} / {meta.total_questions}</p>
          </>
        ) : (
          <>
            <p><b>Exam:</b> {exam?.title}</p>
            <p><b>Category:</b> {exam?.exam_category}</p>
            <p><b>Score:</b> {session.score}</p>
          </>
        )}
      </div>

      {questions.map((q, index) => {

        const your = session.answers[q.id]
        const correct = q.correct_answer

        return (
          <div key={q.id} style={styles.card}>
            <p style={{ fontWeight: 600 }}>
              Q{index + 1}. {q.question}
            </p>

            {['A','B','C','D'].map(opt => {

              const text =
                q[`option_${opt.toLowerCase()}`]

              let bg = '#fff'
              let color = '#333'

              if (opt === correct) {
                bg = '#dcfce7'
                color = '#166534'
              }

              if (opt === your && your !== correct) {
                bg = '#fee2e2'
                color = '#991b1b'
              }

              return (
                <div
                  key={opt}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    marginTop: 6,
                    background: bg,
                    color
                  }}
                >
                  {opt}. {text}
                </div>
              )
            })}
          </div>
        )
      })}

      <button
        style={styles.backBtn}
        onClick={() =>
          window.location.href = '/dashboard'
        }
      >
        Back to Dashboard
      </button>
    </div>
  )
}

const styles = {
  page: {
    padding: 40,
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, sans-serif'
  },

  metaBox: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
  },

  card: {
    background: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
  },

  backBtn: {
    marginTop: 30,
    padding: '12px 20px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  }
}
