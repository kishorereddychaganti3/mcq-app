'use client'

import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentLogin() {

  const router = useRouter()

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    })
  }

  // ✅ NEW: Check user after login (when coming back from callback)
  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return

    const email = userData.user.email

    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    // 🚨 If new user OR no exam preference → go to signup
    if (!student || !student.exam_preference) {
      router.push('/signup')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Welcome 👋</h1>
        <p style={{ color: '#555', marginBottom: 30 }}>
          Sign in to continue to exams
        </p>

        <button onClick={loginWithGoogle} style={styles.googleBtn}>
          Continue with Google
        </button>

        <p style={styles.note}>
          Secure login using your Google account
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg,#f8fafc,#eef2ff)',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    width: 380,
    padding: 36,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  googleBtn: {
    width: '100%',
    padding: '14px 16px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#777'
  }
}
