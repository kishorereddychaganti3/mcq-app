'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect } from 'react'

export default function AuthCallback() {

  useEffect(() => {
    handleAuth()
  }, [])

  async function handleAuth() {

    // ✅ Wait until auth state is READY
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {

        const email = session.user.email

        // ✅ Check student
        const { data: student } = await supabase
          .from('students')
          .select('exam_preference')
          .eq('email', email)
          .single()

        if (!student || !student.exam_preference) {
          window.location.href = '/signup'
        } else {
          window.location.href = '/select-category'
        }

        // 🔥 Important: unsubscribe after use
        subscription.unsubscribe()
      }

    })

    // 🛑 fallback (in case event doesn't fire)
    setTimeout(async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {

        const email = userData.user.email

        const { data: student } = await supabase
          .from('students')
          .select('exam_preference')
          .eq('email', email)
          .single()

        if (!student || !student.exam_preference) {
          window.location.href = '/signup'
        } else {
          window.location.href = '/select-category'
        }

      }

    }, 1500)

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
