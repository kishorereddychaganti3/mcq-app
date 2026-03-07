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

      console.log("===== REVIEW INIT =====")

      const { data: { session: authSession } } =
        await supabase.auth.getSession()

      console.log("AUTH SESSION:", authSession)

      if (!authSession?.user) {
        alert("Not logged in")
        return
      }

      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('sessionId')

      console.log("SESSION ID:", sessionId)

      if (!sessionId) {
        alert("Invalid review request")
        return
      }

      /* ================= STUDENT ================= */

      const { data: student } =
        await supabase
          .from('students')
          .select('id,email')
          .eq('email', authSession.user.email)
          .single()

      console.log("STUDENT:", student)

      /* ================= SESSION ================= */

      const { data: sess } =
        await supabase
          .from('exam_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

      console.log("SESSION DATA:", sess)

      if (!sess) {
        alert("Session not found")
        return
      }

      setSession(sess)

      /* ================= EXAM ================= */

      if (sess.exam_id) {

        const { data: examData } =
          await supabase
            .from('exams')
            .select('*')
            .eq('id', sess.exam_id)
            .single()

        console.log("EXAM DATA:", examData)

        setExam(examData)
      }

      /* ================= ANSWERS ================= */

      let answers = sess.answers || {}

      console.log("RAW ANSWERS:", answers)

      if (typeof answers === 'string') {
        try {
          answers = JSON.parse(answers)
        } catch (err) {
          console.error("JSON PARSE ERROR", err)
        }
      }

      const answerQuestionIds =
        Object.keys(answers).filter(k => k !== '__meta')

      console.log("ANSWER QUESTION IDS:", answerQuestionIds)

      /* ================= ADMIN EXAM ================= */

      if (sess.exam_id) {

        const { data: mappings } =
          await supabase
            .from('exam_questions')
            .select('question_id')
            .eq('exam_id', sess.exam_id)

        const ids = mappings?.map(m => m.question_id) || []

        console.log("MAPPED QUESTION IDS:", ids)

        if (ids.length > 0) {

          const { data: qs } =
            await supabase
              .from('question_bank')
              .select('*')
              .in('id', ids)

          console.log("QUESTIONS FROM DB:", qs)

          setQuestions(qs || [])
        }

      }

      /* ================= CUSTOM TEST ================= */

      else {

        console.log("CUSTOM TEST DETECTED")

        if (answerQuestionIds.length > 0) {

          const { data: qs } =
            await supabase
              .from('question_bank')
              .select('*')
              .in('id', answerQuestionIds)

          console.log("CUSTOM QUESTIONS:", qs)

          const ordered =
            answerQuestionIds
              .map(id => qs?.find(q => q.id === id))
              .filter(Boolean)

          setQuestions(ordered)
        }

      }

      setLoading(false)

    }
    catch (err) {

      console.error("REVIEW PAGE ERROR:", err)
      alert("Check console")

    }

  }

  if (loading)
    return <p style={{ padding: 40 }}>Loading review…</p>

  const meta = session.answers?.__meta || {}
  const isPractice = meta.type === 'CUSTOM_TEST'

  return (
    <div style={styles.page}>

      <h1>📘 Exam Review</h1>

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
        onClick={() => window.location.href = '/dashboard'}
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
