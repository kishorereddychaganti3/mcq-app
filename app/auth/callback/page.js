'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'

export default function AuthCallback() {

  useEffect(() => {
    handleAuth()
  }, [])

  async function handleAuth() {

    // ✅ WAIT for user (fix double login issue)
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      window.location.href = '/'
      return
    }

    const email = userData.user.email

    // ✅ Check student
    const { data: student } = await supabase
      .from('students')
      .select('exam_preference')
      .eq('email', email)
      .single()

    if (!student || !student.exam_preference) {
      window.location.href = '/signup'
      return
    }

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
