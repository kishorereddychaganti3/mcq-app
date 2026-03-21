'use client'

import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function SelectCategory() {

  const [examPref, setExamPref] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {

    // ✅ wait for session hydration (CRITICAL FIX)
    await new Promise(r => setTimeout(r, 500))

    const { data } = await supabase.auth.getUser()

    if (!data?.user) {
      window.location.href = '/'
      return
    }

    const email = data.user.email

    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    if (student?.exam_preference) {
      setExamPref(student.exam_preference)
    }

    setLoading(false)
  }

  function go(cat) {
    window.location.href = `/student-home?category=${cat}`
  }

  function goProfile() {
    window.location.href = '/student/profile'
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* TOP ACTIONS */}
        <div style={styles.topActions}>
          <button onClick={goProfile} style={styles.profileBtn}>
            👤 My Profile
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        <h1>Welcome to MCQ Platform 🚀</h1>

        <p style={{ color: '#555', marginBottom: 20 }}>
          Practice high-quality MCQs, track your performance, and improve your rank with real exam-level questions.
        </p>

        <p style={{ color: '#2563eb', fontWeight: 600, marginBottom: 30 }}>
          Showing exams for: {examPref === 'NEET' ? 'NEET UG' : 'JEE'}
        </p>

        {/* ✅ JEE */}
        {examPref === 'JEE' && (
          <>
            <button
              style={{ ...styles.btn, background: '#2563eb' }}
              onClick={() => go('JEE_MAINS')}
            >
              JEE Mains
            </button>

            <button
              style={{ ...styles.btn, background: '#7c3aed' }}
              onClick={() => go('JEE_ADVANCED')}
            >
              JEE Advanced
            </button>
          </>
        )}

        {/* ✅ NEET */}
        {examPref === 'NEET' && (
          <button
            style={{ ...styles.btn, background: '#16a34a' }}
            onClick={() => go('NEET')}
          >
            NEET UG
          </button>
        )}

      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    width: 420,
    padding: 36,
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
    textAlign: 'center',
    position: 'relative'
  },
  topActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    display: 'flex',
    gap: 8
  },
  profileBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: 'none',
    background: '#111827',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  logoutBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  btn: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 10,
    border: 'none',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 14
  }
}
