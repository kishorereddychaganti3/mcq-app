'use client'

import { supabase } from '../../lib/supabase'
import { useEffect } from 'react'

export default function SelectCategory() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
    })
  }, [])

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

        <h1>Select Exam Category</h1>
        <p style={{ color: '#555', marginBottom: 30 }}>
          Choose the exam you want to attempt
        </p>

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

        <button
          style={{ ...styles.btn, background: '#16a34a' }}
          onClick={() => go('NEET')}
        >
          NEET UG
        </button>
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
