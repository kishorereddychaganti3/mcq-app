'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'

export default function AuthCallback() {

  useEffect(() => {
    handleAuth()
  }, [])

  async function handleAuth() {

    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      window.location.href = '/'
      return
    }

    // ✅ Get logged-in user
    const { data: userData } = await supabase.auth.getUser()

    const email = userData?.user?.email

    if (!email) {
      window.location.href = '/'
      return
    }

    // ✅ Check student record
    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    // 🚨 NEW USER or missing exam preference → signup
    if (!student || !student.exam_preference) {
      window.location.href = '/signup'
      return
    }

    // ✅ EXISTING USER → continue normal flow
    window.location.href = '/select-category'
  }

  return (
    <div style={{
      height:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:'system-ui'
    }}>
      Signing you in...
    </div>
  )
}
